# FP-MCP-112 — Disabled Start Stub Safety Regression Check

## Task

Define and run a safety regression check for the disabled runner start stub.

## Goal

Verify that the disabled start stub introduced by FP-MCP-110 continues to fail closed across runner capabilities, MCP bridge status, unauthenticated start requests, and authenticated start requests.

This packet answers one question:

Does the current disabled start stub still preserve all non-execution safety invariants?

## Background

FP-MCP-109 defined the disabled start stub contract.

FP-MCP-110 implemented an authenticated, fail-closed disabled start stub.

FP-MCP-111 exposed start endpoint state through the MCP bridge status tool.

Current expected state:

- `startEndpointPresent: true`
- `startEndpointState: PRESENT_DISABLED`
- `startCapabilityCallable: false`
- `executionEnabled: false`
- `supportedOperations`:
  - `capabilities`
  - `validate-request`
- unauthenticated start requests fail with `RUNNER_AUTH_FAILED`
- authenticated start requests fail closed with `START_ENDPOINT_DISABLED`
- OpenCode is not started
- no runner run id is created
- approval is not consumed
- request artifacts are not mutated

FP-MCP-112 is a regression check only.

It must not enable or attempt execution.

## Scope

Allowed:

- Read ForgePilot repository status.
- Read MCP bridge remote runner status.
- Read raw authenticated runner capabilities.
- Send an unauthenticated request to the disabled start stub.
- Send an authenticated request to the disabled start stub using the local runner token.
- Check OpenCode process state if useful.
- Record evidence under `runs/FP-MCP-112/`.

Forbidden:

- Do not enable execution.
- Do not relax the global disable switch.
- Do not make start callable.
- Do not add start to `supportedOperations`.
- Do not create approval evidence.
- Do not consume approval.
- Do not mutate approval artifacts.
- Do not mutate request artifacts.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not perform a real remote runner start.
- Do not start OpenCode.
- Do not create a runner run id.
- Do not enqueue execution.
- Do not contact model providers.
- Do not implement `PRESENT_GUARDED`.
- Do not implement `CALLABLE_GUARDED`.

## Required Checks

### Check 1 — Repository State

Verify:

- working tree clean
- current commit recorded

### Check 2 — MCP Bridge Status

Use the MCP bridge status observation.

Expected:

- `runnerReachable: true`
- `executionEnabled: false`
- `supportedOperations`:
  - `capabilities`
  - `validate-request`
- `startEndpointPresent: true`
- `startEndpointState: PRESENT_DISABLED`
- `startCapabilityCallable: false`
- `startReturnsRunnerRunId: false`
- `startDisabledReason: START_ENDPOINT_PRESENT_DISABLED`
- `startBlockingReasons` includes:
  - `START_ENDPOINT_DISABLED`
  - `START_NOT_CALLABLE`
  - `RUNNER_EXECUTION_DISABLED`
  - `OPENCODE_EXECUTION_DISABLED`

### Check 3 — Raw Runner Capabilities

Use the authenticated local runner capabilities endpoint.

Expected:

- `startEndpointPresent: true`
- `startEndpointState: PRESENT_DISABLED`
- `startCapabilityCallable: false`
- `executionEnabled: false`
- `supportedOperations` remains validation-safe
- `reasons` includes `EXECUTION_DISABLED`

### Check 4 — Unauthenticated Start Request

Send:

- `POST /runner/start-run`
- no Authorization header

Expected:

- `valid: false`
- `accepted: false`
- `RUNNER_AUTH_FAILED`
- `executionStarted: false`
- `opencodeStarted: false`
- `runnerRunId: null`

### Check 5 — Authenticated Start Request

Send:

- `POST /runner/start-run`
- Authorization: local runner token
- body may include a packet id and canonical approval phrase

Expected:

- `valid: false`
- `accepted: false`
- `startEndpointState: PRESENT_DISABLED`
- `startCapabilityCallable: false`
- `executionAllowedNow: false`
- `approvalConsumed: false`
- `approvalConsumptionPath: null`
- `preStartEvidenceCreated: false`
- `postStartEvidenceCreated: false`
- `requestArtifactMutated: false`
- `executionStarted: false`
- `opencodeStarted: false`
- `runnerRunId: null`
- reasons includes:
  - `START_ENDPOINT_DISABLED`
  - `START_NOT_CALLABLE`
  - `EXECUTION_NOT_ALLOWED`
  - `RUNNER_EXECUTION_DISABLED`
  - `OPENCODE_EXECUTION_DISABLED`

### Check 6 — OpenCode Safety

Verify that no OpenCode process was started by the checks.

Acceptable evidence:

- process count unchanged before and after
- or observed response fields show `opencodeStarted: false`

## Evidence

Record:

- `runs/FP-MCP-112/regression-check.md`
- `runs/FP-MCP-112/verification.txt`

Optional additional artifacts:

- raw runner capabilities observation
- MCP bridge status observation
- unauthenticated start response
- authenticated start response
- process safety observation

## Success Criteria

This packet is successful if:

1. MCP bridge status reports disabled start endpoint state.
2. Raw runner capabilities report disabled start endpoint state.
3. Unauthenticated start request fails at auth boundary.
4. Authenticated start request fails closed.
5. `executionStarted` remains false.
6. `opencodeStarted` remains false.
7. `runnerRunId` remains null.
8. `approvalConsumed` remains false.
9. `requestArtifactMutated` remains false.
10. `supportedOperations` remains validation-safe.
11. Verification passes.

## Non-goals

This packet does not implement new functionality.

This packet does not modify runner behavior.

This packet does not modify bridge behavior.

This packet does not make start callable.

This packet does not add start to supported operations.

This packet does not authorize execution.

This packet does not create approval evidence.

This packet does not consume approval.

This packet does not relax the disable switch.

This packet does not enable runner execution.

This packet does not enable OpenCode execution.

This packet does not perform a remote runner start.

This packet does not implement `PRESENT_GUARDED`.

This packet does not implement `CALLABLE_GUARDED`.
