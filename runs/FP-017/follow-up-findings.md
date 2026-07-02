# FP-017 Follow-up Findings

## Finding 1 — Admission path fork

FP-017 proved that `evidence_records.admission_state` can store and mechanically report:

```text
ADMITTED: 1
REJECTED: 1
```

with file/SQLite parity.

However, FP-017 did not prove event-sourced admission linkage for `evidence_records`.

Observed structural fork:

```text
evidence_records.admission_state
  = direct admission-state field on evidence records

evidence_admission_events
  = event table whose current API targets classification/outcome observations
```

Current implication:

```text
ADMITTED in evidence_records and an admission event are not yet the same proven claim.
```

Disposition:

```text
STRUCTURAL_FINDING_REQUIRES_FOLLOW_UP_PACKET
```

Named follow-up:

```text
FP-019 — Evidence Record Admission Event Linkage
```

FP-019 should decide whether:

1. `evidence_records.admission_state` is the intended authoritative query surface for evidence-record admission, or
2. evidence records must also have event-sourced admission events, or
3. a new bridge table/event type is needed to link evidence records and admission events without conflating observation types.

Until then, reports must distinguish:

```text
evidence-record admission-state proof
```

from:

```text
event-sourced admission proof
```

## Finding 2 — Local verification note staging anomaly

During FP-017, a local file was created:

```text
runs/FP-017/verification.txt
```

Attempts to stage or rename that file through the MCP terminal tool were blocked by the safety layer. The generated artifacts that carried the actual proof were committed successfully:

```text
runs/FP-017/admission-distribution-after.json
runs/FP-017/admission-distribution-report.md
runs/FP-017/file-sqlite-parity-check.json
```

The blocked file was excluded locally via `.git/info/exclude` to restore clean working-tree state.

Current disposition:

```text
BENIGN_OPERATIONAL_TOOLING_ANOMALY_RECORDED_AND_CLOSED
```

Reason:

- the blocked file was a redundant human-readable note,
- generated JSON/markdown proof artifacts were committed,
- FP-017 interpretation is governed by generated output, not the excluded note,
- no implementation code or MCP bridge code changed.

This anomaly should not affect FP-017 evidence integrity unless future metrics treat blocked staging attempts or omitted local notes as evidence signals.


## Finding 3 — Follow-up packet ID collision correction

The first version of this follow-up document named the evidence-record admission event linkage packet as:

```text
FP-018 — Evidence Record Admission Event Linkage
```

That was incorrect because `FP-018` had already been reserved in planning for:

```text
FP-018 — V1 Report Mechanical Regeneration
```

Corrected follow-up assignment:

```text
FP-018 — V1 Report Mechanical Regeneration
FP-019 — Evidence Record Admission Event Linkage
```

Disposition:

```text
PACKET_ID_COLLISION_CAUGHT_BEFORE_PACKET_CREATION_AND_CORRECTED
```

Historical terminal-command logs may still contain the superseded text as command-output history. Those logs must not be rewritten. The authoritative current follow-up assignment is this document.
