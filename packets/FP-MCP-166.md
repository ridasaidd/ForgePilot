# FP-MCP-166 — Scoped Clearance Bootstrap Implementation

## Task

Implement the first scoped execution clearance primitive under the FP-MCP-165 one-time bootstrap exception.

This packet is a direct-source bootstrap implementation packet.

## Bootstrap Authority

FP-MCP-166 is authorized by:

```text
FP-MCP-165 — Scoped Execution Bootstrap Exception and Retry Friction Decision
```

This is a named departure from the normal executor-driven implementation rule because executor access remains gated behind the scoped clearance primitive being implemented.

## Goal

Add source support for a scoped clearance/check path that can prove whether one exact request/approval/attempt tuple is eligible for future runner start contact, while keeping execution disabled and without contacting the runner start endpoint.

Expected result:

```text
SCOPED_CLEARANCE_IMPLEMENTATION_SOURCE_VERIFIED_EXECUTION_STILL_DISABLED
```

## Required behavior

The implementation must add or update source behavior so that a scoped clearance evaluation:

1. Validates request artifact.
2. Validates structured approval at clearance time, including expiry.
3. Validates pre-start evidence.
4. Validates state snapshots.
5. Verifies no prior valid consumption exists for the same approval/request tuple.
6. Requires a concrete attempt id.
7. Reports whether consumption would be allowed.
8. Does not consume approval.
9. Does not contact runner start endpoint.
10. Does not start OpenCode.
11. Does not mutate request or approval artifacts.

## Required tests or verification

The implementation must demonstrate:

```text
expired approvals cannot clear
consumed approvals cannot clear again
clearance does not contact runner start endpoint
clearance does not start OpenCode
clearance does not mutate request artifacts
execution remains disabled after implementation
```

## Non-goals

FP-MCP-166 must not:

- perform the first real execution attempt
- consume approval for a live request
- contact runner start endpoint
- start OpenCode
- enable global execution
- implement retries
- implement model routing
- implement fan-out

## Acceptance Criteria

FP-MCP-166 is accepted if:

1. Source changes are committed in the MCP bridge.
2. Build/tests pass.
3. Source verification shows execution remains disabled.
4. ForgePilot records implementation artifacts.
5. The result is recorded through V1-O if admitted.

## Safety Boundary

Throughout FP-MCP-166:

```text
execution_enabled: false
approval_consumed: false
runner_start_endpoint_contacted: false
opencode_started: false
request_artifact_mutated: false
runner_run_id_created: false
```
