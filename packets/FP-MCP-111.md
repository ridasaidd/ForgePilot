# FP-MCP-111 — Bridge Start Endpoint State Passthrough

## Task

Expose `startEndpointPresent` and `startEndpointState` through the MCP bridge remote runner status tool.

## Goal

Make the MCP bridge status response fully reflect the disabled start endpoint state already present on the authenticated raw runner capabilities endpoint.

This packet answers one question:

Can the bridge pass through start endpoint state fields without changing runner behavior or enabling execution?

## Background

FP-MCP-110 implemented a guarded start endpoint disabled stub.

The raw authenticated runner capabilities endpoint now exposes:

- `startEndpointPresent: true`
- `startEndpointState: PRESENT_DISABLED`

The MCP bridge status tool already exposes most disabled start metadata from FP-MCP-108, including:

- `startCapabilityAdvertised`
- `startCapabilityCallable`
- `startCapabilityVersion`
- `startOperationName`
- `startRequiresApprovalEvidence`
- `startRequiresPreflight`
- `startRequiresDisableSwitchClear`
- `startRequiresRequestArtifactHash`
- `startRequiresTargetExecutionCommit`
- `startRequiresEvidenceLedgerValidation`
- `startRecordsPreStartState`
- `startRecordsPostStartState`
- `startReturnsRunnerRunId`
- `startDisabledReason`
- `startBlockingReasons`

However, the MCP bridge status tool does not yet pass through:

- `startEndpointPresent`
- `startEndpointState`

## Scope

Allowed:

- Update the MCP bridge remote runner status schema.
- Copy `startEndpointPresent` from the runner capabilities response.
- Copy `startEndpointState` from the runner capabilities response.
- Run build/test checks if available.
- Restart the MCP bridge service if needed to observe the new fields.
- Record evidence under `runs/FP-MCP-111/`.

Forbidden:

- Do not modify runner behavior.
- Do not modify the runner start endpoint.
- Do not make start callable.
- Do not add start to `supportedOperations`.
- Do not enable execution.
- Do not relax the global disable switch.
- Do not create approval evidence.
- Do not consume approval.
- Do not contact a runner start endpoint for execution.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create a runner run id.
- Do not mutate request artifacts.
- Do not alter approval policy.
- Do not alter preflight policy.
- Do not implement `PRESENT_GUARDED`.
- Do not implement `CALLABLE_GUARDED`.

## Required Bridge Passthrough Fields

The MCP bridge remote runner status response must expose:

- `startEndpointPresent`
- `startEndpointState`

Expected values after implementation:

- `startEndpointPresent: true`
- `startEndpointState: PRESENT_DISABLED`

## Required Safety State

After implementation:

- `executionEnabled` remains false
- `startCapabilityCallable` remains false
- `startReturnsRunnerRunId` remains false
- `supportedOperations` remains:
  - `capabilities`
  - `validate-request`
- no runner start endpoint is contacted for execution
- OpenCode is not started
- no approval is created
- no approval is consumed
- no runner run id is created

## Verification

Verification must show:

- raw runner endpoint exposes `startEndpointPresent`
- raw runner endpoint exposes `startEndpointState`
- MCP bridge status tool exposes both fields
- values match the runner capabilities response
- supported operations remain validation-safe
- execution remains disabled
- start remains not callable
- OpenCode remains not started
- no runner run id is created
- tests or build checks pass if applicable

## Evidence

Record:

- `runs/FP-MCP-111/executor-result.md`
- `runs/FP-MCP-111/verification.txt`
- bridge status observation after implementation
- build/test output if applicable

## Success Criteria

This packet is successful if:

1. MCP bridge status exposes `startEndpointPresent`.
2. MCP bridge status exposes `startEndpointState`.
3. Values match raw runner capabilities.
4. Execution remains disabled.
5. Start remains not callable.
6. Supported operations remain validation-safe.
7. OpenCode is not started.
8. No runner run id is created.
9. Verification passes.

## Non-goals

This packet does not modify runner behavior.

This packet does not modify the start endpoint.

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
