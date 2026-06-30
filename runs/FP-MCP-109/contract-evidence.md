# FP-MCP-109 Contract Evidence

Result: PASSED

Recorded the contract for a future guarded start endpoint disabled stub.

No implementation was performed.

No execution behavior changed.

No start endpoint was implemented.

No start operation was made callable.

OpenCode was not started.

No approval evidence was created.

No approval was consumed.

No runner run id was created.

## Packet

- FP-MCP-109 — Guarded Start Endpoint Non-Callable Stub Contract

## Purpose

FP-MCP-109 defines how ForgePilot may later introduce a start-shaped endpoint while keeping it fail-closed and non-executing.

The packet defines the `PRESENT_DISABLED` start endpoint state.

It does not authorize `PRESENT_GUARDED`.

It does not authorize `CALLABLE_GUARDED`.

## Current prior state

Before FP-MCP-109, the observed runner/bridge state was:

- disabled start capability metadata live on the runner
- disabled start capability metadata passed through the MCP bridge
- `startCapabilityAdvertised: true`
- `startCapabilityCallable: false`
- `startOperationName: null`
- `startReturnsRunnerRunId: false`
- `executionEnabled: false`
- `supportedOperations`:
  - `capabilities`
  - `validate-request`

## Contract states defined

FP-MCP-109 defines the start capability state model:

1. `NOT_PRESENT`
2. `PRESENT_DISABLED`
3. `PRESENT_GUARDED`
4. `CALLABLE_GUARDED`

Only `PRESENT_DISABLED` is defined for the next implementation step.

## PRESENT_DISABLED Definition

A `PRESENT_DISABLED` start endpoint may exist only as a hard-disabled, fail-closed stub.

It may:

- authenticate request if required
- parse request shape if safe
- return a structured fail-closed response

It must not:

- validate approval as sufficient to start
- consume approval
- perform pre-start state mutation
- create runner run ids
- spawn OpenCode
- enqueue execution
- write success artifacts
- mutate request artifacts
- change execution flags
- contact external model providers

## Required future capability metadata

A future disabled-stub implementation must expose:

- startCapabilityAdvertised: true
- startCapabilityCallable: false
- startCapabilityVersion: guarded-start-capability-v0
- startOperationName: null or start-disabled-stub
- startEndpointPresent: true
- startEndpointState: PRESENT_DISABLED
- startRequiresApprovalEvidence: true
- startRequiresPreflight: true
- startRequiresDisableSwitchClear: true
- startRequiresRequestArtifactHash: true
- startRequiresTargetExecutionCommit: true
- startRequiresEvidenceLedgerValidation: true
- startRecordsPreStartState: false
- startRecordsPostStartState: false
- startReturnsRunnerRunId: false
- startDisabledReason: START_ENDPOINT_PRESENT_DISABLED
- startBlockingReasons:
  - START_ENDPOINT_DISABLED
  - START_NOT_CALLABLE
  - RUNNER_EXECUTION_DISABLED
  - OPENCODE_EXECUTION_DISABLED

## Supported operations rule

For `PRESENT_DISABLED`, `supportedOperations` must remain:

- capabilities
- validate-request

Start must not be listed in `supportedOperations` while `startCapabilityCallable` is false.

## Required fail-closed response shape

A future disabled start stub must return at least:

- valid: false
- accepted: false
- executionEnabled: false
- executionStarted: false
- opencodeStarted: false
- runnerRunId: null
- startEndpointContacted: true
- startEndpointState: PRESENT_DISABLED
- startCapabilityCallable: false
- executionAllowedNow: false
- approvalConsumed: false
- approvalConsumptionPath: null
- preStartEvidenceCreated: false
- postStartEvidenceCreated: false
- requestArtifactMutated: false
- reasons

Required reasons include:

- START_ENDPOINT_DISABLED
- START_NOT_CALLABLE
- EXECUTION_NOT_ALLOWED

If execution is disabled globally, reasons must also include:

- RUNNER_EXECUTION_DISABLED
- OPENCODE_EXECUTION_DISABLED

## Verification requirements for future implementation

A future implementation packet must verify:

- capabilities report `startEndpointState: PRESENT_DISABLED`
- `startCapabilityCallable: false`
- `supportedOperations` remains validation-safe
- unauthenticated start request fails
- authenticated start request fails closed
- response includes required fail-closed fields
- `executionStarted: false`
- `opencodeStarted: false`
- `runnerRunId: null`
- `approvalConsumed: false`
- no approval artifact mutated
- no request artifact mutated
- no execution artifacts created
- OpenCode process count unchanged
- tests or syntax checks pass

## Safety result

Observed for this contract evidence:

- no start endpoint implemented
- no start operation made callable
- no start operation added to supportedOperations
- no execution enabled
- no global disable switch relaxed
- no approval evidence created
- no approval consumed
- no request artifact mutated
- no runner start endpoint contacted
- no OpenCode process started
- no runner run id created
- no model provider contacted

## Conclusion

FP-MCP-109 successfully defines the disabled start endpoint stub contract without changing execution behavior.
