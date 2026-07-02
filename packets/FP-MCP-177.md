# FP-MCP-177 — FP-027 Single-Worker Canary Attempt

## Task

Run the first scoped single-worker FP-027 canary attempt after all pre-contact evidence gates and liveness-only checks.

This packet is the canary attempt packet.

## Scope

```text
single worker only
DESIGN_ONLY only
bounded boring prompt
fresh request artifact
fresh structured approval
fresh pre-start evidence
fresh state snapshot
process-tree snapshot before contact
one start attempt only
no retry
no fan-out
no chained follow-up action
```

## Boring prompt objective

Ask the worker to perform a non-mutating repository orientation only:

```text
Read the repository at a high level and report: current branch, latest commit, working tree status, and whether package metadata exists. Do not modify files. Do not commit. Do not run package scripts. Do not contact external services.
```

## Explicit contact confirmation

The operator has cleared exactly one guarded runner contact for this packet:

```text
CONTACT_RUNNER_START_ENDPOINT_ONCE
```

The currently exposed real start tool accepts `approvalId` and `START_REMOTE_RUNNER_REQUEST`; it does not expose a separate `contactConfirmation` field. This packet records the contact confirmation as part of the canary evidence boundary before the start tool is invoked.

## Abort readiness

If a worker id is returned and the worker appears stuck, unsafe, or inconsistent with scope, use the existing abort primitive rather than waiting passively.

## Expected result classes

One of:

```text
FP_027_CANARY_WORKER_STARTED_AND_COMPLETED
FP_027_CANARY_BLOCKED_BEFORE_RUNNER_CONTACT
FP_027_CANARY_RUNNER_CONTACT_FAILED
FP_027_CANARY_WORKER_STARTED_THEN_ABORTED
FP_027_CANARY_WORKER_STARTED_WITH_NONZERO_OR_UNKNOWN_RESULT
```
