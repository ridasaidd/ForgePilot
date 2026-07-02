# FP-017 Admission Distribution Report

## Result

```text
FIRST_ADMITTED_AND_REJECTED_CONTROL_PROVEN
```

## Counts

```text
ADMITTED: 1
REJECTED: 1
```

## Distribution

```json
[
  {
    "state": "ADMITTED",
    "count": 1
  },
  {
    "state": "REJECTED",
    "count": 1
  }
]
```

## Negative Control

Rejected rows are non-admitted and excluded from admitted count.

```json
[
  {
    "evidence_id": 2,
    "run_id": "FP-017-NEGATIVE-REJECTED",
    "admission_state": "REJECTED"
  }
]
```

## Parity

```text
PARITY_PASS: True
```

Generated output is authoritative for FP-017 interpretation.
