# FP-MCP-108 — Bridge Runner Capability Metadata Passthrough

## Task

Expose disabled runner start capability metadata through the MCP bridge remote runner status tool.

## Goal

Make the MCP bridge status response report the disabled start capability metadata already present on the authenticated raw runner capabilities endpoint.

This packet answers one question:

Can the bridge pass through the runner's disabled start metadata without enabling execution or changing runner behavior?

## Background

FP-MCP-106 defined disabled start capability metadata for the runner capabilities response.

FP-MCP-107 implemented the metadata manually and verified that the authenticated raw runner endpoint exposes the required fields.

Observed raw runner endpoint fields include:

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
- `startBlockingReasons` containing:
  - `START_NOT_CALLABLE`
  - `RUNNER_EXECUTION_DISABLED`
  - `OPENCODE_EXECUTION_DISABLED`

However, the MCP `forgepilot_get_remote_runner_status` tool currently exposes a normalized subset and does not pass through these metadata fields.

## Scope

Allowed:

- Inspect bridge code that calls the runner capabilities endpoint.
- Update bridge remote runner status normalization to include disabled start metadata fields.
- Preserve existing runner behavior.
- Preserve existing supported operations behavior.
- Add tests or verification if available.
- Record evidence under `runs/FP-MCP-108/`.

Forbidden:

- Do not modify the runner start behavior.
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
- Do not alter approval policy.
- Do not alter preflight policy.
- Do not alter targetExecutionCommit or evidenceLedgerCommit behavior.

## Required Bridge Passthrough Fields

The MCP bridge remote runner status response should expose these fields when present in the runner capabilities response:

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

## Expected Values

After implementation, `forgepilot_get_remote_runner_status` should expose:

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

## Required Safety State

After implementation:

- `executionEnabled` remains false
- `supportedOperations` remains:
  - `capabilities`
  - `validate-request`
- `startCapabilityCallable` remains false
- `startOperationName` remains null
- `startReturnsRunnerRunId` remains false
- no runner start endpoint is contacted
- OpenCode is not started
- no approval evidence is created
- no approval is consumed
- no runner run id is created

## Verification

Verification must show:

- raw runner endpoint still exposes the metadata
- MCP bridge status tool exposes the same metadata
- supported operations remain validation-safe
- execution remains disabled
- start remains not callable
- OpenCode remains not started
- no runner run id is created
- tests or syntax checks pass if available

## Evidence

Record:

- `runs/FP-MCP-108/executor-result.md`
- `runs/FP-MCP-108/verification.txt`
- bridge status observation after implementation
- test or syntax output if applicable

## Success Criteria

This packet is successful if:

1. The MCP bridge status response exposes disabled start metadata fields.
2. Values match the raw runner capabilities response.
3. Start remains not callable.
4. Execution remains disabled.
5. Supported operations remain validation-safe.
6. No start endpoint is contacted.
7. OpenCode is not started.
8. No runner run id is created.
9. Verification passes.

## Non-goals

This packet does not modify runner start behavior.

This packet does not implement a start endpoint.

This packet does not make start callable.

This packet does not authorize execution.

This packet does not create approval evidence.

This packet does not consume approval.

This packet does not relax the disable switch.

This packet does not enable runner execution.

This packet does not enable OpenCode execution.

This packet does not perform a remote runner start.

This packet does not implement the full FP-MCP-104 guarded start contract.
