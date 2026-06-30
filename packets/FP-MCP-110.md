# FP-MCP-110 — Guarded Start Endpoint Disabled Stub Implementation

## Task

Implement a hard-disabled, fail-closed start endpoint stub for the private dev runner.

## Goal

Introduce a start-shaped endpoint that always rejects before side effects while preserving non-execution behavior.

This packet answers one question:

Can ForgePilot add an observable disabled start endpoint stub without making start callable or enabling execution?

## Background

FP-MCP-109 defined the contract for a `PRESENT_DISABLED` start endpoint state.

The `PRESENT_DISABLED` endpoint may exist only as a hard-disabled, fail-closed stub.

It must not:

- consume approval
- create runner run ids
- start OpenCode
- enqueue execution
- mutate request artifacts
- mutate approval artifacts
- create execution artifacts
- contact model providers

FP-MCP-110 is the narrow implementation packet for that contract.

## Scope

Allowed:

- Add a private runner start-shaped route or handler that always fails closed.
- Require runner authentication before returning the structured disabled response.
- Return the FP-MCP-109 fail-closed response shape.
- Update runner capabilities metadata to reflect `PRESENT_DISABLED`.
- Preserve validation-only `supportedOperations`.
- Add tests or syntax verification if available.
- Restart the runner service only if needed to observe the new disabled-stub behavior.
- Record evidence under `runs/FP-MCP-110/`.

Forbidden:

- Do not make start callable.
- Do not add start to `supportedOperations`.
- Do not enable execution.
- Do not relax the global disable switch.
- Do not create approval evidence.
- Do not consume approval.
- Do not mutate approval artifacts.
- Do not mutate request artifacts.
- Do not start OpenCode.
- Do not spawn child processes for execution.
- Do not create a runner run id.
- Do not enqueue execution.
- Do not create success execution artifacts.
- Do not contact model providers.
- Do not implement `PRESENT_GUARDED`.
- Do not implement `CALLABLE_GUARDED`.
- Do not implement the full FP-MCP-104 guarded start contract.

## Required Capability Metadata

After implementation, runner capabilities must expose:

- `startCapabilityAdvertised: true`
- `startCapabilityCallable: false`
- `startCapabilityVersion: guarded-start-capability-v0`
- `startOperationName: null` or `start-disabled-stub`
- `startEndpointPresent: true`
- `startEndpointState: PRESENT_DISABLED`
- `startRequiresApprovalEvidence: true`
- `startRequiresPreflight: true`
- `startRequiresDisableSwitchClear: true`
- `startRequiresRequestArtifactHash: true`
- `startRequiresTargetExecutionCommit: true`
- `startRequiresEvidenceLedgerValidation: true`
- `startRecordsPreStartState: false`
- `startRecordsPostStartState: false`
- `startReturnsRunnerRunId: false`
- `startDisabledReason: START_ENDPOINT_PRESENT_DISABLED`
- `startBlockingReasons` includes:
  - `START_ENDPOINT_DISABLED`
  - `START_NOT_CALLABLE`
  - `RUNNER_EXECUTION_DISABLED`
  - `OPENCODE_EXECUTION_DISABLED`

## Supported Operations Requirement

For this implementation:

- `supportedOperations` must remain:
  - `capabilities`
  - `validate-request`

Start must not be listed in `supportedOperations`.

## Endpoint Behavior

A future implementation may choose the exact path, but it should be explicit and private-runner scoped.

Preferred path:

- `/runner/start`

Allowed methods:

- `POST`

Required behavior:

- unauthenticated request fails with auth failure before disabled-start processing
- authenticated request returns structured fail-closed response
- no execution side effects occur

## Required Fail-Closed Response

Authenticated calls to the disabled start stub must return a structured response containing at least:

- `valid: false`
- `accepted: false`
- `executionEnabled: false`
- `executionStarted: false`
- `opencodeStarted: false`
- `runnerRunId: null`
- `startEndpointContacted: true`
- `startEndpointState: PRESENT_DISABLED`
- `startCapabilityCallable: false`
- `executionAllowedNow: false`
- `approvalConsumed: false`
- `approvalConsumptionPath: null`
- `preStartEvidenceCreated: false`
- `postStartEvidenceCreated: false`
- `requestArtifactMutated: false`
- `reasons`

Required reasons:

- `START_ENDPOINT_DISABLED`
- `START_NOT_CALLABLE`
- `EXECUTION_NOT_ALLOWED`
- `RUNNER_EXECUTION_DISABLED`
- `OPENCODE_EXECUTION_DISABLED`

## Side-Effect Prohibitions

The disabled start stub must not:

- start OpenCode
- spawn execution child processes
- create runner run ids
- create execution artifacts
- consume approval
- mutate approval artifacts
- mutate request artifacts
- change repository state
- enqueue background work
- contact model providers
- change runner capabilities dynamically
- change execution flags

## Required Verification

Verification must show:

- syntax/type checks pass if available
- runner service restarts successfully if restart is needed
- capabilities expose `startEndpointState: PRESENT_DISABLED`
- `startCapabilityCallable: false`
- `supportedOperations` remains validation-safe
- unauthenticated start request fails
- authenticated start request fails closed
- disabled response includes required fields
- `executionStarted: false`
- `opencodeStarted: false`
- `runnerRunId: null`
- `approvalConsumed: false`
- no approval artifact mutated
- no request artifact mutated
- no execution artifacts created
- OpenCode process count unchanged

## Evidence

Record:

- `runs/FP-MCP-110/executor-result.md`
- `runs/FP-MCP-110/verification.txt`
- capabilities observation
- unauthenticated start observation
- authenticated start observation
- process/safety observation if applicable

## Success Criteria

This packet is successful if:

1. A disabled start-shaped endpoint exists.
2. The endpoint fails closed for authenticated requests.
3. Unauthenticated requests fail before disabled-start processing.
4. Capabilities report `PRESENT_DISABLED`.
5. Start remains not callable.
6. Start is not added to `supportedOperations`.
7. Execution remains disabled.
8. OpenCode is not started.
9. No runner run id is created.
10. No approval is consumed.
11. No request artifact is mutated.
12. Verification passes.

## Non-goals

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

This packet does not implement the full FP-MCP-104 guarded start contract.
