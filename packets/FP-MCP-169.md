# FP-MCP-169 — Pre-Contact Evidence Ledger Review

## Task

Review the admitted evidence ledger before implementing the first real consuming action that could eventually contact the runner.

This packet is a review packet only.

It must not edit bridge source, consume approval, contact the runner start endpoint, start OpenCode, or mutate request artifacts.

## Goal

Certify whether the ledger is internally consistent enough to proceed to the no-contact consuming-action implementation packet.

FP-MCP-169 answers:

```text
Is the evidence ledger coherent, directly queryable, and free of unresolved ambiguous states before the last non-contact implementation step?
```

## Required Checks

The review must directly query SQLite and not rely on narrated counts.

It must check:

1. Actual `evidence_records` count.
2. Actual generic `evidence_admission_events` count where `target_observation_type = 'evidence_record'`.
3. Whether narrated count `35` matches DB state.
4. Any evidence record not `ADMITTED`.
5. Any evidence record not `VALID`.
6. Any generic admission event not `ADMITTED`.
7. Any real consumed or pending runner-contact state that was not intended.
8. Whether FP-MCP-168 dry-run stale evidence is distinguishable as rehearsal/non-authorizing.
9. Whether every cited commit hash in admitted evidence is reachable in the appropriate git repository.
10. Whether ForgePilot and the MCP bridge working trees are clean.
11. Whether source/live claims remain split into distinct evidence records.
12. Whether all live claims are V1-O recorded.
13. Whether any evidence claim is only narrative and not artifact-backed.

## Acceptance Criteria

FP-MCP-169 is accepted if it produces a durable review artifact that:

1. Reports SQLite counts from direct DB query.
2. Reports count match or drift against narrated `35`.
3. Reports ambiguous/intermediate states, if any.
4. Distinguishes dry-run stale-state rehearsal from real stale runtime evidence.
5. Reports git reachability for cited evidence commits.
6. Reports clean repo state for ForgePilot and bridge.
7. States whether FP-MCP-170 may proceed.
8. Records the result through V1-O if admitted.

## Expected Result

```text
PRE_CONTACT_LEDGER_REVIEW_PASSED_READY_FOR_NO_CONTACT_CONSUMING_ACTION_IMPLEMENTATION
```
