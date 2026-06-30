# FP-MCP-105 — Runner Start Capability Advertisement Only

## Task

Define and implement a safe advertisement-only remote runner start capability surface.

## Goal

Make the runner capability model explicit about future guarded start support while preserving non-execution behavior.

This packet answers one question:

Can ForgePilot advertise the shape and disabled status of a future start capability without making execution callable?

## Background

FP-MCP-103 observed that the remote runner currently advertises only:

- capabilities
- validate-request

It does not advertise a start operation.

FP-MCP-104 defined the contract that must exist before a runner start capability may be implemented, advertised, enabled, or called.

The next smallest implementation step is not start execution.

The next smallest implementation step is capability advertisement only:

- expose explicit start capability metadata
- keep executionEnabled false
- keep runner execution disabled
- keep OpenCode execution disabled
- do not expose a callable start endpoint
- do not start OpenCode
- do not create runnerRunId

## Scope

Allowed:

- Add capability metadata describing the future guarded start capability.
- Add disabled start capability fields to the runner capabilities response.
- Add explicit fields indicating start is not callable.
- Add explicit reasons explaining why start is disabled.
- Add tests or verification for capability output.
- Update documentation if needed.
- Record evidence under `runs/FP-MCP-105/`.

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

## Required Capability Fields

The runner capabilities response should expose explicit disabled start capability metadata.

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

## Required Field Values

For this packet, expected values are:

- `startCapabilityAdvertised: true`
- `startCapabilityCallable: false`
- `startCapabilityVersion: guarded-start-capability-v0`
- `startOperationName: null` or a disabled placeholder
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

This packet may choose one of two safe advertisement models.

### Model A — Metadata only

`supportedOperations` remains:

- capabilities
- validate-request

Start metadata is exposed separately, but start is not listed as supported.

### Model B — Disabled operation metadata

`supportedOperations` may include a disabled operation label only if the response clearly states it is not callable.

If Model B is used, the operation must be visibly disabled and must not correspond to a callable endpoint.

Preferred model:

- Model A

Reason:

Validation-only supported operations remain unambiguous.

## Required Safety Invariants

After this packet:

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
- global disable switch must remain active unless changed by another explicit packet

## Required Verification

Verification must show:

- runner capabilities can be read
- capability metadata is present
- start capability is advertised as disabled metadata only
- start is not callable
- supported operations remain validation-safe
- executionEnabled remains false
- OpenCode execution remains disabled
- no start endpoint was contacted
- OpenCode was not started
- no runner run id was created

## Evidence

Record:

- `runs/FP-MCP-105/executor-result.md`
- `runs/FP-MCP-105/verification.txt`
- capability observation output or summary

## Success Criteria

This packet is successful if:

1. Runner capabilities expose explicit disabled start capability metadata.
2. Start remains not callable.
3. Supported operations remain validation-safe.
4. Execution remains disabled.
5. No runner start endpoint is contacted.
6. OpenCode is not started.
7. No runner run id is created.
8. Tests or verification pass.

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

This packet does not implement FP-MCP-102.
