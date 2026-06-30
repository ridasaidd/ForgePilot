# FP-MCP-120 — Guarded Preflight Report With State Snapshot Fixture

## Task

Validate the guarded start preflight report after recording non-executing start state snapshot dry-run artifacts.

## Goal

Run `forgepilot_get_guarded_start_preflight_report` after recording pre/post start state snapshot evidence for the FP-MCP-117 request artifact.

This packet answers one question:

Does the guarded start preflight report improve the `stateSnapshotEvidence` observation when state snapshot evidence exists, while still refusing eligibility because the runner remains `PRESENT_DISABLED`?

## Background

FP-MCP-117 proved the guarded preflight report works against a real request artifact.

FP-MCP-118 proved the report distinguishes missing approval from supplied non-authorizing approval fixture evidence.

FP-MCP-119 proved the report observes committed pre-start evidence and upgrades `preStartEvidence` to `PASSED`.

The next missing report layer is state snapshot evidence.

Existing state snapshot tooling can record non-executing pre/post start state snapshot dry-run artifacts without:

- enabling execution
- contacting the runner start endpoint
- starting OpenCode
- creating a runner run id
- consuming approval

FP-MCP-120 records that fixture and verifies the guarded preflight report observes it.

## Existing Request Under Test

Use the FP-MCP-117 request artifact:

- packetId: `FP-MCP-117`
- requestId: `REQ-20260630T160920008Z-195b9969`
- modelId: `deepseek-v4-pro-high`
- runMode: `DESIGN_ONLY`
- request artifact path: `runs/FP-MCP-117/opencode-requests/REQ-20260630T160920008Z-195b9969.json`

Use the FP-MCP-118 approval fixture id:

- approvalId: `APPROVAL-20260630T162204620Z-f3b278ed`

Use the FP-MCP-119 pre-start evidence artifact:

- path: `runs/FP-MCP-117/pre-start-evidence/REQ-20260630T160920008Z-195b9969.json`

## Scope

Allowed:

- Record non-executing start state snapshot dry-run artifacts for the existing FP-MCP-117 request.
- Run the guarded start preflight report against the request with the approval fixture id.
- Record evidence under `runs/FP-MCP-120/`.

Forbidden:

- Do not create real approval evidence.
- Do not consume approval.
- Do not enable execution.
- Do not make start callable.
- Do not add start to `supportedOperations`.
- Do not contact the runner start endpoint.
- Do not call `/runner/start-run`.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create runner run id.
- Do not mutate request artifacts.
- Do not mutate approval artifacts.
- Do not implement `PRESENT_GUARDED`.
- Do not implement `CALLABLE_GUARDED`.
- Do not implement real guarded start.
- Do not relax the disable switch.

## Required Steps

### Step 1 — Record State Snapshot Fixture

Use:

```text
forgepilot_record_start_state_snapshot_dry_run
```

Required input:

```json
{
  "packetId": "FP-MCP-117",
  "requestId": "REQ-20260630T160920008Z-195b9969",
  "approval": "START_REMOTE_RUNNER_REQUEST"
}
```

Required result:

- pre-start snapshot dry-run artifact recorded
- post-start snapshot dry-run artifact recorded
- execution not enabled
- OpenCode not started
- runner start endpoint not contacted
- approval not consumed
- runner run id not created

### Step 2 — Commit State Snapshot Fixture

Commit the created state snapshot artifacts.

The artifacts must be committed before final validation so the report can observe committed evidence.

### Step 3 — Run Guarded Start Preflight Report

Use:

```text
forgepilot_get_guarded_start_preflight_report
```

with:

```json
{
  "packetId": "FP-MCP-117",
  "requestId": "REQ-20260630T160920008Z-195b9969",
  "approvalId": "APPROVAL-20260630T162204620Z-f3b278ed"
}
```

Expected good gates:

- `repository: PASSED`
- `requestArtifact: PASSED`
- `commitBinding: PASSED`
- `modelAndRunMode: PASSED`
- `preStartEvidence: PASSED`

Expected state snapshot behavior:

- state snapshot evidence should be observed more specifically than the previous missing/incomplete artifact case
- ideally `stateSnapshotEvidence: PASSED`
- any remaining state snapshot blocker must remain non-authorizing
- report must still be ineligible

Expected overall result:

- `eligibleForFutureGuardedStart: false`

Expected reason blockers still include:

- `EXECUTION_DISABLED_GLOBAL`
- `RUNNER_EXECUTION_DISABLED`
- `OPENCODE_EXECUTION_DISABLED`
- `DISABLE_SWITCH_ACTIVE`
- `EXECUTION_NOT_ALLOWED`
- `START_ENDPOINT_DISABLED`
- `START_NOT_CALLABLE`
- `EVIDENCE_LEDGER_NOT_READY`

Additional approval/state-snapshot reasons are acceptable if the fixture is correctly treated as non-authorizing.

## Required Safety Fields

The report must return:

- `executionPermitted: false`
- `executionStarted: false`
- `opencodeStarted: false`
- `runnerStartEndpointContacted: false`
- `startEndpointContacted: false`
- `runnerRunId: null`
- `approvalConsumed: false`
- `requestArtifactMutated: false`
- `startEndpointState: PRESENT_DISABLED`
- `startCapabilityCallable: false`
- `executionEnabled: false`

## Verification

Verification must show:

- packet committed
- state snapshot dry-run artifacts created
- state snapshot paths recorded
- state snapshot artifacts committed
- guarded preflight report evaluated after fixture commit
- request artifact remained valid
- model/run-mode remained valid
- pre-start evidence remained passed
- state snapshot observation improved
- report remained not eligible
- no runner start endpoint contact occurred
- no OpenCode process was started
- no runner run id was created
- no approval was consumed
- no request artifact was mutated

## Evidence

Record:

- `runs/FP-MCP-120/state-snapshot-evidence.md`
- `runs/FP-MCP-120/preflight-report.md`
- `runs/FP-MCP-120/verification.txt`

## Success Criteria

This packet is successful if:

1. Non-executing start state snapshot dry-run artifacts are created.
2. The state snapshot paths are recorded.
3. The state snapshot artifacts are committed.
4. The guarded preflight report observes the real request and supplied approval id.
5. The state snapshot evidence observation improves or becomes more specific compared with FP-MCP-119.
6. The report remains not eligible because execution and runner start remain disabled.
7. No approval is consumed.
8. No runner start endpoint is contacted.
9. No OpenCode process is started.
10. No runner run id is created.
11. No request artifact is mutated.
12. Verification passes.

## Non-goals

This packet does not create real approval evidence.

This packet does not consume approval.

This packet does not authorize execution.

This packet does not enable execution.

This packet does not make start callable.

This packet does not add start to supported operations.

This packet does not implement `PRESENT_GUARDED`.

This packet does not implement `CALLABLE_GUARDED`.

This packet does not perform a remote runner start.
