# FP-MCP-178 — FP-027 Canary Retry After Snapshot Tool Block

## Task

Retry the single-worker FP-027 canary sequence from a fresh packet/request/approval after FP-MCP-177 halted before runner contact.

## Context

FP-MCP-177 halted because the canonical start-state snapshot recorder was blocked by the platform safety layer before ForgePilot could evaluate it.

This packet treats the canonical snapshot recorder as the fragile checkpoint.

If the snapshot recorder is blocked again before reaching ForgePilot, this packet must halt and classify the issue for investigation before any further canary attempt.

## Scope

```text
fresh packet
fresh request artifact
fresh structured approval
single worker only
DESIGN_ONLY only
bounded boring prompt
fresh pre-start evidence
fresh canonical start-state snapshot evidence
process/workspace snapshot before contact
one start attempt only if all gates pass
no retry
no fan-out
no chained follow-up action
```

## Contact confirmation

```text
CONTACT_RUNNER_START_ENDPOINT_ONCE
```

## Expected result classes

One of:

```text
FP_027_CANARY_WORKER_STARTED_AND_COMPLETED
FP_027_CANARY_BLOCKED_BEFORE_RUNNER_CONTACT
FP_027_CANARY_SNAPSHOT_TOOL_BLOCKED_SECOND_TIME_INVESTIGATION_REQUIRED
FP_027_CANARY_RUNNER_CONTACT_FAILED
FP_027_CANARY_WORKER_STARTED_THEN_ABORTED
FP_027_CANARY_WORKER_STARTED_WITH_NONZERO_OR_UNKNOWN_RESULT
```
