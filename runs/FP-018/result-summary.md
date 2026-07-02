# FP-018 Result Summary

## Result

```text
V1_REPORT_MECHANICALLY_REGENERATED_CURRENT_STATE
```

## Current generated checklist counts

```text
COMPLETE: 38
DEFERRED: 4
TOTAL_CAPABILITY_ROWS: 42
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
