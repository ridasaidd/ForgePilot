# FP-018 Generated V1 Project Report

## Result

```text
V1_REPORT_MECHANICALLY_REGENERATED_CURRENT_STATE
```

## Checklist counts from current source

```json
{
  "COMPLETE": 38,
  "DEFERRED": 4
}
```

Capability rows parsed: `42`

## SQLite admission distribution

```json
{
  "database_path": "data/forgepilot.db",
  "database_exists": true,
  "query_status": "OK",
  "tables": {
    "evidence_records": "PRESENT",
    "evidence_admission_events": "PRESENT",
    "admission_invalidation_events": "PRESENT"
  },
  "evidence_records_total": 2,
  "evidence_records_by_admission_state": [
    {
      "state": "ADMITTED",
      "count": 1
    },
    {
      "state": "REJECTED",
      "count": 1
    }
  ]
}
```

## Static FP-META-025 comparison

```text
STATIC_REPORT_NOT_REPRODUCED_CURRENT_SOURCE_STATE_DIFFERS
```

Old static counts: `{'COMPLETE': 27, 'DEFERRED': 4}`

Current generated counts: `{'COMPLETE': 38, 'DEFERRED': 4}`

Old static capability count: `31`

Current generated capability count: `42`

## Boundary

Generated output is authoritative for FP-018 interpretation. The old static report is preserved as historical evidence and is not rewritten.
