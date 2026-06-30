# FP-MCP-117 — Guarded Preflight Report With Real Request Artifact

## Task

Validate the guarded start preflight report skeleton against a real non-executing OpenCode request artifact.

## Goal

Run `forgepilot_get_guarded_start_preflight_report` with a real `REQ-...` request artifact instead of a synthetic `REGRESSION-CHECK` id.

This packet answers one question:

Does the guarded start preflight report correctly evaluate a real request artifact while still refusing eligibility because the runner remains `PRESENT_DISABLED`?

## Background

FP-MCP-115 defined the guarded start preflight report contract.

FP-MCP-116 implemented a read-only MCP guarded start preflight report skeleton.

The first FP-MCP-116 tool test used:

```text
requestId: REGRESSION-CHECK
```

That correctly proved safety behavior, but intentionally triggered request-artifact failures.

FP-MCP-117 validates the report against a real request artifact so the request artifact, model, and run mode gates can be observed with valid input.

## Current Expected Runner State

The runner should remain:

- `startEndpointState: PRESENT_DISABLED`
- `startCapabilityCallable: false`
- `executionEnabled: false`
- `supportedOperations`:
  - `capabilities`
  - `validate-request`

Therefore the report must still return:

```text
eligibleForFutureGuardedStart: false
```

even when the request artifact is valid.

## Scope

Allowed:

- Create a durable non-executing OpenCode request artifact for FP-MCP-117.
- Use model id `deepseek-v4-pro-high`.
- Use run mode `DESIGN_ONLY`.
- Validate the created request artifact.
- Run `forgepilot_get_guarded_start_preflight_report` against the real request artifact.
- Record evidence under `runs/FP-MCP-117/`.

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
- Do not create approval evidence unless explicitly scoped in a later packet.
- Do not mutate approval artifacts.
- Do not mutate request artifacts after creation.
- Do not implement `PRESENT_GUARDED`.
- Do not implement `CALLABLE_GUARDED`.
- Do not implement real guarded start.
- Do not relax the disable switch.

## Required Steps

### Step 1 — Create Request Artifact

Use the existing non-executing request artifact tool:

```text
forgepilot_create_opencode_run_request
```

Required input:

```json
{
  "packetId": "FP-MCP-117",
  "modelId": "deepseek-v4-pro-high",
  "runMode": "DESIGN_ONLY",
  "approval": "CREATE_REQUEST_ARTIFACT"
}
```

Required result:

- request artifact created
- OpenCode not started
- execution not started
- runner start endpoint not contacted

### Step 2 — Validate Request Artifact

Use existing read-only validation:

```text
forgepilot_validate_remote_runner_request
```

Required result should show:

- `eligible: true`
- `requestExists: true`
- `requestArtifactValid: true`
- `modelAllowed: true`
- `runModeAllowed: true`
- `workingTreeClean: true`
- `safeArtifactDir: true`
- `executionStarted: false`
- `runnerContacted: false`

### Step 3 — Run Guarded Start Preflight Report

Use:

```text
forgepilot_get_guarded_start_preflight_report
```

with:

- `packetId: FP-MCP-117`
- `requestId: <created request id>`

Expected result:

- `guardedStartPreflightEvaluated: true`
- `eligibleForFutureGuardedStart: false`
- `executionPermitted: false`
- `executionStarted: false`
- `opencodeStarted: false`
- `runnerStartEndpointContacted: false`
- `startEndpointContacted: false`
- `runnerRunId: null`
- `approvalConsumed: false`
- `requestArtifactMutated: false`
- `requestArtifact.requestExists: true`
- `requestArtifact.requestArtifactValid: true`
- `modelAndRunMode.modelAllowed: true`
- `modelAndRunMode.runModeAllowed: true`
- `startEndpointState: PRESENT_DISABLED`
- `startCapabilityCallable: false`

Expected reasons include:

- `START_ENDPOINT_DISABLED`
- `START_NOT_CALLABLE`
- `RUNNER_EXECUTION_DISABLED`
- `OPENCODE_EXECUTION_DISABLED`
- `DISABLE_SWITCH_ACTIVE`
- `EXECUTION_NOT_ALLOWED`
- `HUMAN_APPROVAL_EVIDENCE_MISSING`
- `EVIDENCE_LEDGER_NOT_READY`

## Verification

Verification must show:

- packet committed
- request artifact created
- request artifact id recorded
- request artifact validation passed
- guarded start preflight report evaluated
- report used real `REQ-...` id
- report preserved non-execution safety fields
- report rejected eligibility because runner remains `PRESENT_DISABLED`
- no runner start endpoint contact occurred
- no OpenCode process was started
- no runner run id was created
- no approval was consumed
- no request artifact was mutated after creation

## Evidence

Record:

- `runs/FP-MCP-117/request-artifact.md`
- `runs/FP-MCP-117/preflight-report.md`
- `runs/FP-MCP-117/verification.txt`

## Success Criteria

This packet is successful if:

1. A real request artifact is created for FP-MCP-117.
2. The request artifact validates successfully.
3. The guarded start preflight report runs against the real request id.
4. The report improves request/model/run-mode observations compared with `REGRESSION-CHECK`.
5. The report remains not eligible because the runner is `PRESENT_DISABLED`.
6. The report does not contact the runner start endpoint.
7. The report does not start OpenCode.
8. The report does not create runner run id.
9. The report does not consume approval.
10. The report does not mutate request artifacts after creation.
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
