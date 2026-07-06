#!/usr/bin/env python3
from pathlib import Path
import sqlite3
import json
import re
import sys

root = Path(".").resolve()
outdir = root / "runs" / "FP-MCP-369A"
outdir.mkdir(parents=True, exist_ok=True)

candidate_paths = []
for pattern in ["*.db", "*.sqlite", "*.sqlite3"]:
    candidate_paths.extend(root.rglob(pattern))

# Exclude obvious node/cache/vendor paths.
candidate_paths = [
    p for p in sorted(set(candidate_paths))
    if "node_modules" not in p.parts
    and ".git" not in p.parts
    and "dist" not in p.parts
]

summary = {
    "repo": str(root),
    "candidateDatabaseFiles": [str(p.relative_to(root)) for p in candidate_paths],
    "openedDatabases": [],
    "evidenceCandidates": [],
    "range175ToCurrent": None,
    "classification": None,
    "notes": [],
}

def table_cols(conn, table):
    return [r[1] for r in conn.execute(f"PRAGMA table_info({table})").fetchall()]

def safe_ident(name):
    return '"' + name.replace('"', '""') + '"'

def table_count(conn, table):
    try:
        return conn.execute(f"SELECT COUNT(*) FROM {safe_ident(table)}").fetchone()[0]
    except Exception:
        return None

def detect_evidence_tables(conn):
    tables = [r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").fetchall()]
    candidates = []
    for t in tables:
        cols = table_cols(conn, t)
        lower_cols = [c.lower() for c in cols]
        name_lower = t.lower()
        score = 0
        if "evidence" in name_lower:
            score += 3
        if "admission" in name_lower:
            score += 2
        if any(c in lower_cols for c in ["id", "evidence_id", "evidenceid"]):
            score += 1
        if any("packet" in c for c in lower_cols):
            score += 1
        if any("claim" in c for c in lower_cols):
            score += 1
        if score >= 2:
            candidates.append({
                "table": t,
                "columns": cols,
                "count": table_count(conn, t),
                "score": score,
            })
    return candidates

def fetch_rows(conn, table, cols):
    lower = {c.lower(): c for c in cols}

    id_col = None
    for key in ["evidence_id", "evidenceid", "id"]:
        if key in lower:
            id_col = lower[key]
            break

    packet_col = None
    for c in cols:
        if "packet" in c.lower():
            packet_col = c
            break

    claim_col = None
    for c in cols:
        if "claim" in c.lower() or "summary" in c.lower() or "description" in c.lower():
            claim_col = c
            break

    state_col = None
    for c in cols:
        if "admission" in c.lower() or "state" in c.lower() or "status" in c.lower():
            state_col = c
            break

    if not id_col:
        return []

    select_cols = [id_col]
    for c in [packet_col, state_col, claim_col]:
        if c and c not in select_cols:
            select_cols.append(c)

    query = f"SELECT {', '.join(safe_ident(c) for c in select_cols)} FROM {safe_ident(table)}"
    try:
        rows = conn.execute(query).fetchall()
    except Exception:
        return []

    out = []
    for r in rows:
        row = dict(zip(select_cols, r))
        raw_id = row.get(id_col)
        numeric_id = None
        if isinstance(raw_id, int):
            numeric_id = raw_id
        elif isinstance(raw_id, str):
            m = re.search(r"\d+", raw_id)
            if m:
                numeric_id = int(m.group(0))
        out.append({
            "table": table,
            "idColumn": id_col,
            "rawId": raw_id,
            "numericId": numeric_id,
            "packet": row.get(packet_col) if packet_col else None,
            "state": row.get(state_col) if state_col else None,
            "claim": (str(row.get(claim_col))[:220].replace("\n", " ") if claim_col and row.get(claim_col) is not None else None),
        })
    return out

all_rows = []

for db in candidate_paths:
    db_record = {"path": str(db.relative_to(root)), "opened": False, "tables": [], "error": None}
    try:
        conn = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
        conn.execute("PRAGMA query_only = ON")
        tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").fetchall()
        db_record["opened"] = True
        db_record["tables"] = [t[0] for t in tables]
        candidates = detect_evidence_tables(conn)
        db_record["evidenceLikeTables"] = candidates
        for c in candidates:
            rows = fetch_rows(conn, c["table"], c["columns"])
            all_rows.extend({
                **row,
                "database": str(db.relative_to(root)),
            } for row in rows)
        conn.close()
    except Exception as e:
        db_record["error"] = repr(e)
    summary["openedDatabases"].append(db_record)

# Also parse V1O result JSON as fallback repository ledger extraction.
v1o_rows = []
for p in sorted((root / "runs").rglob("v1o-evidence-recording-result.json")):
    try:
        data = json.loads(p.read_text(errors="replace"))
    except Exception:
        continue
    raw_id = data.get("evidence_id") or data.get("evidenceId") or data.get("id")
    numeric_id = None
    if isinstance(raw_id, int):
        numeric_id = raw_id
    elif isinstance(raw_id, str):
        m = re.search(r"\d+", raw_id)
        if m:
            numeric_id = int(m.group(0))
    v1o_rows.append({
        "database": "repository-json",
        "table": "v1o-evidence-recording-result.json",
        "idColumn": "evidence_id/id",
        "rawId": raw_id,
        "numericId": numeric_id,
        "packet": p.parts[-2] if len(p.parts) >= 2 else None,
        "state": data.get("admission_state") or data.get("admissionState") or data.get("admitted"),
        "claim": (data.get("admitted_claim") or data.get("claim") or "")[:220].replace("\n", " "),
        "path": str(p.relative_to(root)),
    })

summary["evidenceCandidates"] = all_rows
summary["repositoryJsonEvidenceRows"] = v1o_rows

# Prefer live DB rows if they contain numeric ids around/after 175; otherwise fall back to JSON rows.
numeric_rows = [r for r in all_rows if isinstance(r.get("numericId"), int)]
db_rows_175 = [r for r in numeric_rows if r["numericId"] >= 175]
json_numeric_rows = [r for r in v1o_rows if isinstance(r.get("numericId"), int)]
json_rows_175 = [r for r in json_numeric_rows if r["numericId"] >= 175]

source = "sqlite"
rows_for_range = db_rows_175
if not rows_for_range:
    source = "repository-json"
    rows_for_range = json_rows_175

if rows_for_range:
    ids = sorted(set(r["numericId"] for r in rows_for_range))
    min_id = min(ids)
    max_id = max(ids)
    start = 175 if min_id <= 175 <= max_id else min_id
    expected = set(range(start, max_id + 1))
    missing = sorted(expected - set(ids))
    summary["range175ToCurrent"] = {
        "source": source,
        "start": start,
        "max": max_id,
        "observedCount": len(ids),
        "missingIds": missing,
        "continuous": len(missing) == 0,
    }
    if start <= 175 and not missing:
        summary["classification"] = "DIRECT_OR_EXTRACTED_EVIDENCE_ID_SEQUENCE_CONTINUOUS_FROM_175_TO_CURRENT"
    elif missing:
        summary["classification"] = "EVIDENCE_ID_SEQUENCE_HAS_GAPS"
    else:
        summary["classification"] = "EVIDENCE_ID_SEQUENCE_DOES_NOT_COVER_175"
else:
    summary["classification"] = "NO_NUMERIC_EVIDENCE_IDS_FOUND"

# Write full JSON
(outdir / "evidence-ledger-direct-query-result.json").write_text(
    json.dumps(summary, indent=2, sort_keys=True) + "\n"
)

# Write table
rows_table = rows_for_range if rows_for_range else (numeric_rows or json_numeric_rows)
with (outdir / "evidence-ledger-direct-query.tsv").open("w") as w:
    cols = ["source","database","table","rawId","numericId","packet","state","claim"]
    w.write("\t".join(cols) + "\n")
    for r in sorted(rows_table, key=lambda x: (x.get("numericId") is None, x.get("numericId") or -1, str(x.get("packet")))):
        w.write("\t".join(str({
            "source": source if r in rows_for_range else r.get("database"),
            "database": r.get("database"),
            "table": r.get("table"),
            "rawId": r.get("rawId"),
            "numericId": r.get("numericId"),
            "packet": r.get("packet"),
            "state": r.get("state"),
            "claim": r.get("claim"),
        }[c]).replace("\n", " ") for c in cols) + "\n")

# Human summary
rq = summary["range175ToCurrent"]
with (outdir / "evidence-ledger-direct-query-summary.md").open("w") as w:
    w.write("# Evidence Ledger Direct Query Summary\n\n")
    w.write("## Database Discovery\n\n")
    w.write(f"- Candidate database files: {len(candidate_paths)}\n")
    for p in candidate_paths:
        w.write(f"  - {p.relative_to(root)}\n")
    w.write("\n")
    w.write("## Opened Databases\n\n")
    for db in summary["openedDatabases"]:
        w.write(f"- {db['path']}: opened={db['opened']}")
        if db.get("error"):
            w.write(f", error={db['error']}")
        w.write("\n")
        if db.get("evidenceLikeTables"):
            for t in db["evidenceLikeTables"]:
                w.write(f"  - evidence-like table: {t['table']} count={t['count']} cols={', '.join(t['columns'])}\n")
    w.write("\n")
    w.write("## Range 175 To Current\n\n")
    if rq:
        w.write(f"- Source used: {rq['source']}\n")
        w.write(f"- Start: {rq['start']}\n")
        w.write(f"- Current max evidence id: {rq['max']}\n")
        w.write(f"- Observed count: {rq['observedCount']}\n")
        w.write(f"- Continuous: {rq['continuous']}\n")
        w.write(f"- Missing ids: {rq['missingIds'] if rq['missingIds'] else 'none'}\n")
    else:
        w.write("- No numeric evidence-id range could be computed.\n")
    w.write("\n")
    w.write("## Classification\n\n")
    w.write(f"{summary['classification']}\n")

print("WROTE")
print(outdir / "evidence-ledger-direct-query-result.json")
print(outdir / "evidence-ledger-direct-query.tsv")
print(outdir / "evidence-ledger-direct-query-summary.md")
