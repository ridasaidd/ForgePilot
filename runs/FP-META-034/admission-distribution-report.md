# FP-META-034 — V1 Admission Distribution Report

## Boundary

This report is a current-state admission distribution report.

It does not admit evidence, mutate evidence, change admission logic, implement reporting code, or count model-trust labels as admission evidence.

## Evidence Root

Current evidence root:

```text
/home/ridasaidd/forgepilot
```

Current SQLite store queried:

```text
data/forgepilot.db
```

## Method

The distribution was produced by a readonly `better-sqlite3` query against the current SQLite store.

Machine-readable query artifact:

```text
runs/FP-META-034/admission-distribution-query.json
```

Source/search evidence:

```text
runs/FP-META-034/admission-source-search.txt
```

## Query Status

```text
OK
```

## Table Presence

| Table | Status |
|---|---|
| `evidence_records` | `PRESENT` |
| `evidence_admission_events` | `PRESENT` |
| `admission_invalidation_events` | `PRESENT` |
| `model_comparison_events` | `ABSENT` |

## SQLite-Derived Distribution

### evidence_records

| Admission state | Count |
|---|---:|
| `ADMITTED` | 0 |
| `PENDING` | 0 |
| `REJECTED` | 0 |
| `QUARANTINED` | 0 |
| `NOT_EVALUATED` | 0 |
| Total rows | 0 |

### evidence_admission_events

| Admission decision | Count |
|---|---:|
| `ADMITTED` | 0 |
| `PENDING` | 0 |
| `REJECTED` | 0 |
| Total rows | 0 |

### admission_invalidation_events

| Invalidation decision | Count |
|---|---:|
| `INVALIDATED` | 0 |
| `QUARANTINED` | 0 |
| `NO_ACTION` | 0 |
| `DEFERRED` | 0 |
| Total rows | 0 |

## Interpretation

The current SQLite store has admission-related tables, but no rows in the queried admission/evidence tables.

Therefore the current SQLite-derived V1 admission distribution is:

```text
ADMITTED: 0
PENDING: 0
REJECTED: 0
QUARANTINED: 0
NOT_EVALUATED: 0
TOTAL_SQLITE_EVIDENCE_RECORDS: 0
```

This does not mean ForgePilot has no historical evidence artifacts.

It means the current SQLite evidence/admission store does not contain populated evidence/admission records for those artifacts.

## Relationship to V1 Completion

The V1 capability completion report showed V1 reconstruction/reporting capability completion.

That is a different claim from admission distribution.

This report confirms the distinction:

```text
V1 capability completion exists as file/report evidence.
Current SQLite admission distribution contains zero admitted evidence records.
```

## Model Trust Boundary

Model trust labels are not counted here.

FP-META-032 recorded:

```text
ADMISSION_REPORTING_MODEL_TRUST_DECOUPLED_BY_STATIC_SOURCE_INSPECTION
```

Therefore labels such as `OBSERVED_AUDIT_USEFUL` or `OBSERVED_SAFE_SMALL_CHANGE` do not affect this admission distribution.

## Invalidation Boundary

The current SQLite store also reports:

```text
admission_invalidation_events_total: 0
```

So there are no current SQLite invalidation events that affect this distribution.

Per FP-META-031, absence of downstream propagation markers must not be interpreted as `NOT_AFFECTED`. However, since there are zero invalidation events in the queried table, there is no known invalidation blast radius to mark for this report.

## Evidence Quality

Trust classification:

```text
TIER_1_SQLITE_READONLY_QUERY
```

Rationale:

- stronger than narrative self-report,
- based on readonly query against current SQLite store,
- weaker than full file-to-SQLite parity proof,
- does not prove historical file artifacts are indexed into SQLite.

## Limitation

This report does not reconcile file artifacts under `runs/` with SQLite rows.

Because SQLite evidence/admission rows are currently zero, a future packet should decide whether to:

- backfill historical file evidence into SQLite,
- keep file evidence as primary and SQLite as partial index,
- or explicitly report file/SQLite divergence.

## Result

```text
V1_ADMISSION_DISTRIBUTION_REPORTED_SQLITE_EMPTY
```

This weakens any broad claim that V1 has admitted evidence in SQLite.

It does not invalidate V1 as a reconstruction discipline milestone.

It does show that V1 admission distribution is currently not populated in the SQLite evidence/admission store.
