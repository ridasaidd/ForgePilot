# FP-MCP-047 — Start Request Disable Switch Enforcement

## Status

DRAFT

## Type

MCP safety gate implementation packet

## Purpose

Ensure that the `forgepilot_start_remote_runner_request` path explicitly evaluates the execution disable switch and returns a structured blocked result before any runner start endpoint can be contacted.

This packet extends the disable-switch chain from policy and preflight into the final start-request entrypoint.

## Background

The previous packets established:

- FP-MCP-043 — execution disable switch contract
- FP-MCP-044 — read-only disable switch status tool
- FP-MCP-045 — negative scope and precedence observations
- FP-MCP-046 — disable switch enforcement in guarded execution preflight

FP-MCP-047 closes the next safety gap: even if a caller invokes the start-request tool directly, the tool must observe the disable switch first and halt locally.

## Governing Principles

This packet is constrained by:

- P01 — ForgePilot records observations, not narratives
- P02 — Trust cannot be retroactively created
- P03 — ForgePilot does not optimize for favorable outcomes
- P04 — Only admitted evidence may influence observatory outputs
- P06 — Classification follows observation

## Scope

FP-MCP-047 may modify the MCP bridge implementation so that `forgepilot_start_remote_runner_request`:

1. Evaluates the execution disable switch before any runner start contact.
2. Returns a structured blocked result when the disable switch is active.
3. Records explicit disable-switch fields in the start-request result.
4. Preserves all existing non-execution indicators.
5. Does not create an approval.
6. Does not mutate approval artifacts.
7. Does not call OpenCode.
8. Does not contact the runner start endpoint while the disable switch is active.

## Non-Scope

FP-MCP-047 must not:

- Enable runner execution.
- Enable OpenCode execution.
- Start OpenCode.
- Invoke any model provider.
- Contact the runner start endpoint when the disable switch is active.
- Create a real human approval artifact.
- Consume or mutate an approval artifact.
- Change allowed models.
- Add new run modes.
- Weaken existing validation gates.
- Convert disable switch observations into execution permission.

## Required Behavior

When `forgepilot_start_remote_runner_request` is invoked while the disable switch is active, the tool must return:

```json
{
  "started": false,
  "accepted": false,
  "approvalAccepted": false,
  "runnerConfigured": true,
  "runnerContacted": false,
  "startEndpointContacted": false,
  "executionStarted": false,
  "disableSwitchStatusEvaluated": true,
  "disableSwitchActive": true,
  "effectiveDisableReason": "EXECUTION_DISABLED_GLOBAL",
  "effectiveDisableScope": "GLOBAL"
}
```

The exact values of `runnerConfigured`, `requestArtifactPath`, `requestArtifactSha256`, `baseCommit`, and runner metadata may vary based on environment and request validity, but the disable-switch and non-execution fields must remain invariant.

## Required Reasons

The blocked result must include these reason codes when the global disable switch is active:

```text
EXECUTION_DISABLED_GLOBAL
DISABLE_SWITCH_ACTIVE
EXECUTION_NOT_ALLOWED
```

It may also include existing reason codes such as:

```text
EXECUTION_DISABLED
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
```

## Start Endpoint Boundary

The start endpoint must not be contacted when the disable switch is active.

The following fields must remain false:

```text
started
accepted
approvalAccepted
runnerContacted
startEndpointContacted
executionStarted
```

If the implementation currently uses `runnerContacted` ambiguously, FP-MCP-047 must preserve the invariant that no start endpoint contact occurred. Capability or validation endpoint contact may be recorded only by tools that already perform read-only validation, not by the start operation after the disable-switch block has been reached.

## Required Output Fields

The start-request result must include:

```text
disableSwitchStatusEvaluated
disableSwitchActive
effectiveDisableReason
effectiveDisableScope
```

These fields must be part of the structured tool output schema.

## Ordering Requirement

The disable switch must be evaluated before:

1. Human approval acceptance.
2. Remote runner start submission.
3. Any start endpoint network call.
4. Any execution artifact claiming execution started.

The disable switch may reuse local context and existing read-only status helpers, but must not rely on a successful preflight result before blocking.

## Verification Requirements

Verification must demonstrate:

1. `forgepilot_start_remote_runner_request` is callable.
2. A known request artifact can be supplied.
3. The result is blocked by the disable switch.
4. `disableSwitchStatusEvaluated` is `true`.
5. `disableSwitchActive` is `true`.
6. `effectiveDisableReason` is `EXECUTION_DISABLED_GLOBAL`.
7. `effectiveDisableScope` is `GLOBAL`.
8. `started` is `false`.
9. `accepted` is `false`.
10. `approvalAccepted` is `false`.
11. `startEndpointContacted` is `false`.
12. `executionStarted` is `false`.
13. `opencodeStarted` is absent or false if present.
14. Runner execution remains disabled.
15. OpenCode execution remains disabled.

## Expected Verification Probe

Use the existing FP-MCP-036 request artifact unless a newer safe request artifact is required:

```text
packetId: FP-MCP-036
requestId: REQ-20260622T144553300Z-fbbe8d82
approval: START_REMOTE_RUNNER_REQUEST
```

This request is already known to pass request-artifact validation, making it useful for proving that the disable switch blocks the start path independently of request validity.

## Expected Successful Outcome

FP-MCP-047 succeeds only if:

```text
startRequestDisableSwitchEnforced: true
disableSwitchStatusEvaluated: true
disableSwitchActive: true
executionAllowedNow: false
started: false
accepted: false
runnerContacted: false
startEndpointContacted: false
executionStarted: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
```

## Failure Conditions

FP-MCP-047 fails if:

- The start endpoint is contacted while the disable switch is active.
- `executionStarted` becomes true.
- `started` becomes true.
- `accepted` becomes true.
- Approval is accepted despite the disable switch.
- OpenCode is started.
- Runner execution becomes enabled.
- OpenCode execution becomes enabled.
- Disable-switch fields are missing from structured output.
- The result does not clearly identify the effective disable reason and scope.

## Evidence to Record

Record:

```text
runs/FP-MCP-047/executor-result.md
runs/FP-MCP-047/verification.txt
```

Optional structured evidence may also be recorded:

```text
runs/FP-MCP-047/start-disable-switch-result.json
```

## Completion Criteria

FP-MCP-047 is complete when:

1. The packet is committed.
2. The MCP bridge implementation is updated and committed.
3. The bridge builds successfully.
4. The MCP service restarts successfully.
5. The start-request tool returns a structured disable-switch block.
6. Verification artifacts are committed.
7. Final repository status is clean.

