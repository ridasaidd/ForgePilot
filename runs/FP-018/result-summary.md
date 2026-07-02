# FP-018 Result Summary

## Result

```text
V1_REPORT_MECHANICALLY_REGENERATED_CURRENT_STATE
```

## Current generated checklist counts

```text
COMPLETE: 39
DEFERRED: 4
TOTAL_CAPABILITY_ROWS: 43
```

## Evidence tier legend

```text
capability_counts: CHECKLIST_SOURCED_TIER_1_INDEX
sqlite_admission_distribution: SQLITE_READONLY_QUERY_TIER_2_MECHANICAL_QUERY
static_report_comparison: DERIVED_COMPARISON_TIER_1_OVER_COMMITTED_ARTIFACTS
```

## Static FP-META-025 comparison

```text
STATIC_REPORT_NOT_REPRODUCED_CURRENT_SOURCE_STATE_DIFFERS
```

Old static report:

```text
COMPLETE: 27
DEFERRED: 4
TOTAL_CAPABILITY_ROWS: 31
```

Current delta from old static report:

```text
+12 current checklist rows
-0 removed rows
```

The delta is mechanically listed in `generated-v1-project-report.json` under `checklist_delta_from_static_report`.

## Regeneration stability

```text
STABLE_RERUN_CONFIRMED
```

The generator was rerun and output hashes were identical before and after rerun.

## SQLite admission distribution included

```text
evidence_records_total: 2
ADMITTED: 1
REJECTED: 1
```

## Boundary

FP-018 mechanically regenerates the current project report from the current checklist and current SQLite state.

It does not reproduce the old static 27/4 report because the checklist source has changed after FP-META-025.

Generated output is authoritative for FP-018 interpretation.
