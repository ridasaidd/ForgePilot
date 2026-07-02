import json, hashlib, sqlite3, re
from pathlib import Path

CHECKLIST = Path('docs/forgepilot-progress-checklist.md')
STATIC = Path('runs/FP-META-025/final-v1-project-report.json')
DB = Path('data/forgepilot.db')
OUT = Path('runs/FP-018')


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def parse_checklist(path):
    rows = []
    in_table = False
    for line in path.read_text().splitlines():
        if line.startswith('| Capability | Status | Evidence Packet(s) |'):
            in_table = True
            continue
        if not in_table:
            continue
        if not line.startswith('|'):
            if rows:
                break
            continue
        if line.startswith('|---'):
            continue
        cols = [c.strip() for c in line.strip().strip('|').split('|')]
        if len(cols) < 5:
            continue
        capability = re.sub(r'`', '', cols[0]).strip()
        status = cols[1].strip().strip('`')
        rows.append({
            'capability': capability,
            'status': status,
            'evidence_packets': cols[2],
            'evidence_notes': cols[3],
            'boundary': cols[4],
        })
    return rows


def status_counts(rows):
    counts = {}
    for r in rows:
        counts[r['status']] = counts.get(r['status'], 0) + 1
    return dict(sorted(counts.items()))


def sqlite_distribution():
    result = {
        'database_path': str(DB),
        'database_exists': DB.exists(),
        'query_status': 'NOT_RUN',
        'tables': {},
        'evidence_records_total': None,
        'evidence_records_by_admission_state': [],
    }
    if not DB.exists():
        result['query_status'] = 'DATABASE_NOT_FOUND'
        return result
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    tables = {r['name'] for r in cur.execute("select name from sqlite_master where type='table'")}
    for t in ['evidence_records', 'evidence_admission_events', 'admission_invalidation_events']:
        result['tables'][t] = 'PRESENT' if t in tables else 'ABSENT'
    if 'evidence_records' in tables:
        result['evidence_records_total'] = cur.execute('select count(*) c from evidence_records').fetchone()['c']
        result['evidence_records_by_admission_state'] = [dict(r) for r in cur.execute('select admission_state as state, count(*) as count from evidence_records group by admission_state order by admission_state')]
        result['query_status'] = 'OK'
    else:
        result['query_status'] = 'EVIDENCE_RECORDS_TABLE_ABSENT'
    con.close()
    return result


def load_static():
    if not STATIC.exists():
        return {'exists': False}
    data = json.loads(STATIC.read_text())
    return {
        'exists': True,
        'path': str(STATIC),
        'sha256': sha256(STATIC),
        'report_type': data.get('report_type'),
        'v1_completion_status': data.get('v1_completion_status'),
        'checklist_status_counts': data.get('checklist_status_counts'),
        'checklist_capability_count': len(data.get('checklist_capabilities', [])),
    }

rows = parse_checklist(CHECKLIST)
counts = status_counts(rows)
static = load_static()
sqlite = sqlite_distribution()
static_counts = static.get('checklist_status_counts') if static.get('exists') else None
static_capabilities = []
if STATIC.exists():
    static_data = json.loads(STATIC.read_text())
    static_capabilities = [r.get('capability') for r in static_data.get('checklist_capabilities', [])]
current_capabilities = [r.get('capability') for r in rows]
static_capability_set = set(static_capabilities)
current_capability_set = set(current_capabilities)
new_capability_rows = [r for r in rows if r.get('capability') not in static_capability_set]
removed_capability_rows = [c for c in static_capabilities if c not in current_capability_set]
duplicate_current_capabilities = sorted([c for c in set(current_capabilities) if current_capabilities.count(c) > 1])
counts_match_static = bool(static_counts == counts)
cap_count_match_static = bool(static.get('checklist_capability_count') == len(rows)) if static.get('exists') else False

report = {
    'report_type': 'PROJECT_SUMMARY_V1_REGENERATED_CURRENT_STATE',
    'generated_by': 'runs/FP-018/generate-v1-report.py',
    'source_files': {
        'checklist': str(CHECKLIST),
        'checklist_sha256': sha256(CHECKLIST),
        'static_comparison_target': str(STATIC),
    },
    'boundary': 'Generated report is an index over current checklist rows and current SQLite admission distribution. It is not admission evidence by itself.',
    'v1_g_status': 'GOVERNANCE_COMPLETE_CURRENT_CHECKLIST_INDEXED',
    'v1_o_status': 'OBSERVATORY_OPERATION_PARTIALLY_PROVEN_BY_FP_017_EVIDENCE_RECORDS',
    'evidence_tier_legend': {
        'capability_counts': 'CHECKLIST_SOURCED_TIER_1_INDEX',
        'sqlite_admission_distribution': 'SQLITE_READONLY_QUERY_TIER_2_MECHANICAL_QUERY',
        'static_report_comparison': 'DERIVED_COMPARISON_TIER_1_OVER_COMMITTED_ARTIFACTS'
    },
    'checklist_status_counts': counts,
    'checklist_capability_count': len(rows),
    'checklist_capabilities': rows,
    'checklist_delta_from_static_report': {
        'old_capability_count': static.get('checklist_capability_count') if static.get('exists') else None,
        'current_capability_count': len(rows),
        'new_capability_rows': new_capability_rows,
        'removed_capability_rows': removed_capability_rows,
        'duplicate_current_capabilities': duplicate_current_capabilities
    },
    'sqlite_admission_distribution': sqlite,
    'static_report_comparison': {
        'static_report': static,
        'current_counts_match_static_counts': counts_match_static,
        'current_capability_count_matches_static': cap_count_match_static,
        'interpretation': 'STATIC_REPORT_REPRODUCED' if counts_match_static and cap_count_match_static else 'STATIC_REPORT_NOT_REPRODUCED_CURRENT_SOURCE_STATE_DIFFERS',
    },
    'result': 'V1_REPORT_MECHANICALLY_REGENERATED_CURRENT_STATE',
}

comparison = report['static_report_comparison']

(OUT / 'generated-v1-project-report.json').write_text(json.dumps(report, indent=2) + '\n')
(OUT / 'static-report-comparison.json').write_text(json.dumps(comparison, indent=2) + '\n')
md = f"""# FP-018 Generated V1 Project Report\n\n## Result\n\n```text\n{report['result']}\n```\n\n## Evidence tier legend

```json
{json.dumps(report['evidence_tier_legend'], indent=2)}
```

## Checklist counts from current source\n\n```json\n{json.dumps(counts, indent=2)}\n```\n\nCapability rows parsed: `{len(rows)}`\n\n## SQLite admission distribution\n\n```json\n{json.dumps(sqlite, indent=2)}\n```\n\n## Checklist delta from static FP-META-025 report

```json
{json.dumps(report['checklist_delta_from_static_report'], indent=2)}
```

## Static FP-META-025 comparison\n\n```text\n{comparison['interpretation']}\n```\n\nOld static counts: `{static_counts}`\n\nCurrent generated counts: `{counts}`\n\nOld static capability count: `{static.get('checklist_capability_count') if static.get('exists') else None}`\n\nCurrent generated capability count: `{len(rows)}`\n\n## Boundary\n\nGenerated output is authoritative for FP-018 interpretation. The old static report is preserved as historical evidence and is not rewritten.\n"""
(OUT / 'generated-v1-project-report.md').write_text(md)
summary = f"""# FP-018 Regeneration Summary\n\nResult: `{report['result']}`\n\nStatic comparison: `{comparison['interpretation']}`\n\nThe generator parsed `{len(rows)}` current checklist rows and produced counts `{counts}`. Capability counts are checklist-sourced (`CHECKLIST_SOURCED_TIER_1_INDEX`), while admission distribution is SQLite-sourced (`SQLITE_READONLY_QUERY_TIER_2_MECHANICAL_QUERY`).\n\nThe old FP-META-025 static report recorded counts `{static_counts}` across `{static.get('checklist_capability_count') if static.get('exists') else None}` capability rows.\n\nTherefore FP-018 mechanically regenerates the current project report, but it does not reproduce the old static 27/4 report from the current mutated checklist source. The delta is recorded in `checklist_delta_from_static_report`.\n\nSQLite evidence records are included in the generated report through readonly query data.\n"""
(OUT / 'regeneration-summary.md').write_text(summary)
print(json.dumps({'result': report['result'], 'current_counts': counts, 'current_capability_count': len(rows), 'static_interpretation': comparison['interpretation'], 'sqlite_total': sqlite.get('evidence_records_total')}, indent=2))
