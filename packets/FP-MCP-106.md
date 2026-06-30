# FP-MCP-106 — Disabled Start Capability Metadata Implementation

## Task

Implement disabled start capability metadata in the remote runner capabilities response.

## Goal

Make the runner capability response explicitly describe the future guarded start capability while preserving non-execution behavior.

This packet answers one question:

Can the runner advertise disabled start capability metadata without making start callable or enabling execution?

## Background

FP-MCP-103 observed that the remote runner currently advertises only validation-safe operations:

- capabilities
- validate-request

FP-MCP-104 defined the full runner start capability contract.

FP-MCP-105 defined the advertisement-only start capability packet.

FP-MCP-105 request validation passed locally and through the authenticated remote runner validate-request endpoint.

The next smallest implementation step is to add metadata only.

This packet must not implement start execution.

## Scope

Allowed:

- Modify the remote runner capabilities response.
- Add disabled start capability metadata fields.
- Preserve supported operations as validation-safe unless explicitly justified.
- Add tests or verification for the new metadata fields.
- Update documentation if required.
- Record evidence under `runs/FP-MCP-106/`.

Forbidden:

- Do not implement a start endpoint.
- Do not make start callable.
- Do not enable execution.
- Do not relax the global disable switch.
- Do not create approval evidence.
- Do not consume approval.
- Do not contact the runner start endpoint.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create a runner run id.
- Do not mutate request artifacts.
- Do not change production execution behavior.
- Do not implement approval consumption behavior.
- Do not implement targetExecutionCommit/evidenceLedgerCommit execution behavior.

## Required Metadata Fields

The runner capabilities response must include disabled start metadata.

Required fields:

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

## Required Values

For this implementation, expected values are:

- `startCapabilityAdvertised: true`
- `startCapabilityCallable: false`
- `startCapabilityVersion: guarded-start-capability-v0`
- `startOperationName: null`
- `startRequiresApprovalEvidence: true`
- `startRequiresPreflight: true`
- `startRequiresDisableSwitchClear: true`
- `startRequiresRequestArtifactHash: true`
- `startRequiresTargetExecutionCommit: true`
- `startRequiresEvidenceLedgerValidation: true`
- `startRecordsPreStartState: true`
- `startRecordsPostStartState: true`
- `startReturnsRunnerRunId: false`
- `startDisabledReason: START_CAPABILITY_ADVERTISEMENT_ONLY`
- `startBlockingReasons` includes:
  - `START_NOT_CALLABLE`
  - `RUNNER_EXECUTION_DISABLED`
  - `OPENCODE_EXECUTION_DISABLED`

## Supported Operations Rule

Preferred behavior:

- `supportedOperations` remains:
  - `capabilities`
  - `validate-request`

Start capability metadata must be exposed separately.

Start must not be included in `supportedOperations` until a later packet implements a callable but still guarded start endpoint.

## Required Safety Behavior

After implementation:

- capabilities must not start execution
- validate-request must not start execution
- start must not be callable
- executionEnabled must remain false
- runnerExecutionEnabled must remain false
- opencodeExecutionEnabled must remain false
- executionStarted must remain false
- startEndpointContacted must remain false
- opencodeStarted must remain false
- runnerRunId must remain null or absent
- no approval evidence is created
- no approval is consumed

## Required Verification

Verification must show:

- runner capabilities can be read
- new metadata fields are present
- required values match this packet
- supportedOperations remain validation-safe
- startCapabilityCallable is false
- executionEnabled remains false
- OpenCode execution remains disabled
- no start endpoint was contacted
- OpenCode was not started
- no runner run id was created
- tests or type checks pass if applicable

## Evidence

Record:

- `runs/FP-MCP-106/executor-result.md`
- `runs/FP-MCP-106/verification.txt`
- capability observation output or summary
- test/typecheck output if applicable

## Success Criteria

This packet is successful if:

1. Disabled start capability metadata is present in runner capabilities.
2. Required metadata fields are populated.
3. `startCapabilityCallable` is false.
4. `supportedOperations` remain validation-safe.
5. `executionEnabled` remains false.
6. No start endpoint is implemented or contacted.
7. OpenCode is not started.
8. No runner run id is created.
9. Verification passes.

## Non-goals

This packet does not implement a start endpoint.

This packet does not make start callable.

This packet does not authorize execution.

This packet does not create approval evidence.

This packet does not consume approval.

This packet does not relax the disable switch.

This packet does not enable runner execution.

This packet does not enable OpenCode execution.

This packet does not perform a remote runner start.

This packet does not implement the full FP-MCP-104 start contract.
