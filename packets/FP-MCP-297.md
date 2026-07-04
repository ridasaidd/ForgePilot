# FP-MCP-297 — Pre-Start Evidence Sequencing Hold

## Checkpoint Type

```text
FAIL_CLOSED_HOLD
```

## Summary

After FP-MCP-296 approval validation, the next intended phase was approved pre-start evidence followed by state snapshot evidence. Instead, the state-snapshot dry-run tool was invoked before approved pre-start evidence existed. Each attempt failed closed with PRE_START_EVIDENCE_INVALID, PRE_START_EVIDENCE_INCOMPLETE, ARTIFACT_HASH_MISSING, STATE_SNAPSHOT_NOT_RECORDED, and execution-disabled reasons. The failures were non-executing: startEndpointContacted false, opencodeStarted false, runnerContactedForStart false, preStartSnapshotRecorded false, postStartSnapshotRecorded false. Because the approval was short-lived and the sequence had already deviated, the correct action is to hold, allow the approval to expire if necessary, and resume later with a fresh approval and the correct order: record approved pre-start evidence first, validate it, then record/validate state snapshots immediately before any future start-boundary work.

## Claim

```text
FP-MCP-297 records that the FP-MCP-295 minimal canary did not advance past approval into pre-start evidence or state snapshots: repeated non-executing state-snapshot dry-run attempts failed closed because approved pre-start evidence was missing, so the operator stopped rather than rushing toward the approval expiration window; no runner start endpoint was contacted, no OpenCode worker/session was started, no approval was consumed, no disable switch was cleared, no snapshots were recorded, and FP-027 did not run.
```

## Caveats

- The sequencing deviation was operator-side: state snapshot dry-run was attempted before the approved pre-start evidence artifact existed.
- No state snapshot artifacts were recorded by the failed attempts.
- The existing approval expires at 2026-07-04T14:40:00.000Z and should be treated as expired if continuation occurs after that time.
- Do not rush remaining gates to beat expiration; fresh approval is acceptable and preferred if timing is no longer clean.
- The next session should not infer that pre-start evidence exists.

## Boundaries

- hold checkpoint only
- no approved pre-start evidence recorded
- no state snapshots recorded
- no approval consumed
- no clearance created
- no disable switch cleared
- no runner start endpoint contact
- no OpenCode session or worker started
- no prompt submitted
- no FP-027 canary run
- no source edits
- no MCP bridge source inspection or refactor

## Non-Execution Boundary

```text
execution authorized: false
approval consumed: false
disable switch cleared: false
runner start endpoint contacted: false
OpenCode started: false
FP-027 canary run: false
```

## Expected Result

```text
FP-MCP-297 records that the FP-MCP-295 minimal canary did not advance past approval into pre-start evidence or state snapshots: repeated non-executing state-snapshot dry-run attempts failed closed because approved pre-start evidence was missing, so the operator stopped rather than rushing toward the approval expiration window; no runner start endpoint was contacted, no OpenCode worker/session was started, no approval was consumed, no disable switch was cleared, no snapshots were recorded, and FP-027 did not run.
```
