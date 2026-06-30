# FP-MCP-116 — Guarded Start Preflight Report Tool Skeleton

## Task

Implement a read-only MCP guarded start preflight report tool skeleton.

## Goal

Add a non-executing MCP tool that returns the FP-MCP-115 guarded start preflight report shape with conservative gate results.

The tool must answer:

```text
Would this request be eligible for guarded start if start were callable?
```

Current expected answer while the runner remains `PRESENT_DISABLED`:

```text
eligibleForFutureGuardedStart: false
```

## Background

FP-MCP-114 defined the start capability transition contract.

FP-MCP-115 defined the guarded start preflight report contract.

The current live runner state is expected to remain:

- `startEndpointState: PRESENT_DISABLED`
- `startCapabilityCallable: false`
- `executionEnabled: false`
- `supportedOperations`:
  - `capabilities`
  - `validate-request`

FP-MCP-116 implements the first read-only report skeleton.

This packet does not implement `PRESENT_GUARDED`.

This packet does not make start callable.

This packet does not contact the runner start endpoint.

## Scope

Allowed:

- Modify the MCP bridge repository.
- Add a read-only MCP tool named `forgepilot_get_guarded_start_preflight_report`.
- Add output schema for the report.
- Reuse existing read-only local validation functions.
- Reuse existing read-only runner capabilities/status observation.
- Reuse existing read-only OpenCode status observation.
- Reuse existing read-only disable-switch status observation.
- Reuse existing read-only pre-start evidence validation if safe.
- Reuse existing read-only state snapshot validation if safe.
- Return conservative `DEFERRED` or `NOT_EVALUATED` for gates not implemented yet.
- Build the MCP bridge.
- Restart MCP bridge only after successful build.
- Record evidence under `runs/FP-MCP-116/`.

Forbidden:

- Do not enable execution.
- Do not make start callable.
- Do not add start to `supportedOperations`.
- Do not contact the runner start endpoint.
- Do not call `/runner/start-run`.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create runner run id.
- Do not consume approval.
- Do not create approval evidence.
- Do not mutate approval artifacts.
- Do not mutate request artifacts.
- Do not implement `PRESENT_GUARDED`.
- Do not implement `CALLABLE_GUARDED`.
- Do not implement real guarded start.
- Do not relax the disable switch.

## Required Tool

Tool name:

```text
forgepilot_get_guarded_start_preflight_report
```

Tool annotations must indicate read-only behavior:

- `readOnlyHint: true`
- `destructiveHint: false`
- `idempotentHint: true`

## Required Inputs

- `packetId`
- `requestId`

Optional:

- `approvalId`

## Required Safety Fields

The tool must always return:

```text
executionPermitted: false
executionStarted: false
opencodeStarted: false
runnerStartEndpointContacted: false
startEndpointContacted: false
runnerRunId: null
approvalConsumed: false
requestArtifactMutated: false
```

## Required Current-State Behavior

While runner state is `PRESENT_DISABLED`, the tool must return:

```text
guardedStartPreflightEvaluated: true
eligibleForFutureGuardedStart: false
startEndpointState: PRESENT_DISABLED
startCapabilityCallable: false
```

Required reasons:

```text
START_ENDPOINT_DISABLED
START_NOT_CALLABLE
```

If execution is disabled, include:

```text
RUNNER_EXECUTION_DISABLED
```

If OpenCode execution is disabled, include:

```text
OPENCODE_EXECUTION_DISABLED
```

If the request id is invalid or missing, include the relevant local validation reason.

## Required Gate Skeleton

The tool must include a `gates` object with at least these keys:

- `repository`
- `requestArtifact`
- `commitBinding`
- `modelAndRunMode`
- `disableSwitch`
- `runnerCapabilityState`
- `opencodeReadiness`
- `preStartEvidence`
- `stateSnapshotEvidence`
- `humanApprovalEvidence`
- `evidenceLedgerReadiness`

Each gate must use the FP-MCP-115 gate result model:

- `evaluated`
- `passed`
- `state`
- `reasons`
- optional `evidencePath`
- optional `evidenceSha256`

Allowed states:

- `PASSED`
- `FAILED`
- `INCOMPLETE`
- `DEFERRED`
- `NOT_EVALUATED`

## Gate Implementation Requirements For Skeleton

### Repository

Must be evaluated.

### Request Artifact

Must use existing read-only request validation.

### Commit Binding

Must use existing read-only request validation fields.

### Model And Run Mode

Must use existing read-only request validation fields.

### Disable Switch

Must use existing read-only disable-switch status.

### Runner Capability State

Must use existing read-only remote runner status.

### OpenCode Readiness

Must use existing read-only OpenCode status.

### Pre-Start Evidence

May use existing read-only validator.

If not safely reusable, return `DEFERRED`.

### State Snapshot Evidence

May use existing read-only validator.

If not safely reusable, return `DEFERRED`.

### Human Approval Evidence

If no `approvalId` is supplied, return `INCOMPLETE` or `NOT_EVALUATED` with:

```text
HUMAN_APPROVAL_EVIDENCE_MISSING
```

The tool must not create or consume approval.

### Evidence Ledger Readiness

May return `DEFERRED` with:

```text
EVIDENCE_LEDGER_NOT_READY
```

until ledger readiness is implemented.

## Eligibility Rule

`eligibleForFutureGuardedStart` must be false unless all of the following are true:

- runner state is `PRESENT_GUARDED`
- `startCapabilityCallable` is false
- `start-run` is not in `supportedOperations`
- request artifact gate passed
- commit binding gate passed
- model and run mode gate passed
- disable switch is clear
- no side effects occurred

Since the current runner state is `PRESENT_DISABLED`, FP-MCP-116 should report false.

## Verification

Verification must show:

- MCP bridge builds successfully.
- Tool appears after bridge restart/action refresh.
- Tool returns `guardedStartPreflightEvaluated: true`.
- Tool returns `eligibleForFutureGuardedStart: false`.
- Tool returns `startEndpointState: PRESENT_DISABLED`.
- Tool returns `startCapabilityCallable: false`.
- Tool returns `runnerStartEndpointContacted: false`.
- Tool returns `startEndpointContacted: false`.
- Tool returns `executionPermitted: false`.
- Tool returns `executionStarted: false`.
- Tool returns `opencodeStarted: false`.
- Tool returns `runnerRunId: null`.
- Tool returns `approvalConsumed: false`.
- Tool returns `requestArtifactMutated: false`.
- Tool reasons include disabled-start reasons.
- No OpenCode process is started.
- No runner run id is created.
- No approval is consumed.
- No request artifact is mutated.

## Evidence

Record:

- `runs/FP-MCP-116/executor-result.md`
- `runs/FP-MCP-116/verification.txt`

If implementation is performed in the bridge repo, record:

- implementation commit
- files changed
- build output
- tool observation after restart
- safety result

## Success Criteria

This packet is successful if:

1. The read-only guarded start preflight report tool skeleton is implemented.
2. The MCP bridge builds.
3. The tool returns the FP-MCP-115 safety fields.
4. The tool reports the current disabled runner state.
5. The tool reports not eligible while runner is `PRESENT_DISABLED`.
6. The tool does not contact the runner start endpoint.
7. The tool does not start OpenCode.
8. The tool does not create runner run id.
9. The tool does not consume approval.
10. The tool does not mutate request artifacts.
11. Verification passes.

## Non-goals

This packet does not implement `PRESENT_GUARDED`.

This packet does not implement `CALLABLE_GUARDED`.

This packet does not enable execution.

This packet does not make start callable.

This packet does not add start to supported operations.

This packet does not create approval evidence.

This packet does not consume approval.

This packet does not relax the disable switch.

This packet does not enable runner execution.

This packet does not enable OpenCode execution.

This packet does not contact the runner start endpoint.

This packet does not perform a remote runner start.
