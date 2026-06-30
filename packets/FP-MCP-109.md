# FP-MCP-109 — Guarded Start Endpoint Non-Callable Stub Contract

## Task

Define the contract for a future guarded start endpoint stub that exists only as a fail-closed, non-executing boundary.

## Goal

Specify how a start endpoint may be introduced as an observable, non-callable or hard-disabled stub without enabling execution, starting OpenCode, consuming approval, or creating runner run ids.

This packet answers one question:

What must be true before ForgePilot may introduce a start-shaped endpoint while preserving fail-closed execution safety?

## Background

FP-MCP-103 observed that the runner only advertised validation-safe operations:

- capabilities
- validate-request

FP-MCP-104 defined the full runner start capability contract.

FP-MCP-105 defined advertisement-only start capability behavior.

FP-MCP-106 implemented disabled start capability metadata in the runner capabilities response.

FP-MCP-107 manually implemented and verified the runner metadata.

FP-MCP-108 exposed that metadata through the MCP bridge status tool.

Current observed state:

- `startCapabilityAdvertised: true`
- `startCapabilityCallable: false`
- `startOperationName: null`
- `startReturnsRunnerRunId: false`
- `startDisabledReason: START_CAPABILITY_ADVERTISEMENT_ONLY`
- `supportedOperations` remains:
  - `capabilities`
  - `validate-request`
- `executionEnabled: false`

The next conceptual step is not execution.

The next conceptual step is a contract for how a start-shaped endpoint could be introduced while still failing closed.

## Scope

Allowed:

- Define a contract for a future non-callable or hard-disabled start endpoint stub.
- Define required request shape.
- Define required response shape.
- Define mandatory failure behavior.
- Define required evidence fields.
- Define capability metadata changes that would be required in a later implementation.
- Define verification requirements.
- Record packet and evidence under `runs/FP-MCP-109/`.

Forbidden:

- Do not implement a start endpoint.
- Do not make start callable.
- Do not add start to `supportedOperations`.
- Do not enable execution.
- Do not relax the global disable switch.
- Do not create approval evidence.
- Do not consume approval.
- Do not contact a runner start endpoint.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create a runner run id.
- Do not mutate request artifacts.
- Do not alter approval policy.
- Do not alter preflight policy.
- Do not alter targetExecutionCommit or evidenceLedgerCommit behavior.
- Do not implement the full FP-MCP-104 guarded start contract.

## Contract Model

A future start-shaped endpoint may exist only if it has one of these states:

1. `NOT_PRESENT`
2. `PRESENT_DISABLED`
3. `PRESENT_GUARDED`
4. `CALLABLE_GUARDED`

FP-MCP-109 defines only the contract for `PRESENT_DISABLED`.

It does not authorize `PRESENT_GUARDED` or `CALLABLE_GUARDED`.

## PRESENT_DISABLED Definition

A `PRESENT_DISABLED` start endpoint is an endpoint whose only permitted behavior is to reject every request before any side effect.

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

It may only:

- authenticate request if required
- parse request shape if safe
- return a structured fail-closed response
- record no durable execution artifact unless explicitly authorized by a later evidence-recording packet

## Required Capability Metadata For PRESENT_DISABLED

If a disabled stub is implemented later, capabilities must change from advertisement-only to disabled-stub metadata.

Required values:

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

## Supported Operations Rule

For `PRESENT_DISABLED`:

- `supportedOperations` must remain:
  - `capabilities`
  - `validate-request`

Start must not be listed in `supportedOperations` while `startCapabilityCallable` is false.

If a later packet lists start in `supportedOperations`, that later packet must separately define and verify callable guarded behavior.

## Required Request Shape

A future disabled start stub may accept a request shaped like:

- `packetId`
- `requestId`
- `approvalId`
- `requestArtifactSha256`
- `modelId`
- `runMode`
- `targetExecutionCommit`
- `evidenceLedgerCommit`
- `approval`

But in `PRESENT_DISABLED`, these fields must not authorize execution.

The canonical approval phrase must still not be enough to start.

## Required Fail-Closed Response Shape

A disabled start stub must return a structured response with at least:

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

Required reasons include:

- `START_ENDPOINT_DISABLED`
- `START_NOT_CALLABLE`
- `EXECUTION_NOT_ALLOWED`

If execution is disabled globally, reasons must also include:

- `RUNNER_EXECUTION_DISABLED`
- `OPENCODE_EXECUTION_DISABLED`

## Mandatory Side-Effect Rules

A disabled start stub must not:

- start OpenCode
- create a child process
- create a runner run id
- create execution artifacts
- consume approval
- mutate approval artifacts
- mutate request artifacts
- change repository state
- enqueue background work
- contact model providers
- change runner capabilities dynamically
- change execution flags

## Auth Boundary

A disabled start stub should still require runner authentication if exposed over the same private runner interface.

Unauthenticated calls must fail before request processing.

Authenticated calls must fail closed with structured disabled-start response.

## Evidence Boundary

A disabled start stub implementation must record evidence only if a later packet explicitly authorizes recording that evidence.

Evidence must distinguish:

- endpoint contacted
- endpoint rejected
- no execution started
- no approval consumed
- no runner run id created

## Required Verification For Future Implementation

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

## Success Criteria

This packet is successful if:

1. The disabled start stub state is defined.
2. Required capability metadata is defined.
3. Required request and response shapes are defined.
4. Side-effect prohibitions are explicit.
5. Verification requirements are explicit.
6. Execution remains disabled.
7. No start endpoint is implemented.
8. OpenCode is not started.
9. No runner run id is created.

## Non-goals

This packet does not implement a start endpoint.

This packet does not make start callable.

This packet does not add start to supported operations.

This packet does not authorize execution.

This packet does not create approval evidence.

This packet does not consume approval.

This packet does not relax the disable switch.

This packet does not enable runner execution.

This packet does not enable OpenCode execution.

This packet does not perform a remote runner start.

This packet does not implement the full FP-MCP-104 guarded start contract.

## Next Packet Candidate

A future packet may implement the `PRESENT_DISABLED` endpoint stub.

Suggested next packet:

- FP-MCP-110 — Guarded Start Endpoint Disabled Stub Implementation
