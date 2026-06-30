# FP-MCP-118 — Guarded Preflight Report With Approval Evidence Fixture

## Task

Validate the guarded start preflight report against a real request artifact plus a non-authorizing approval evidence fixture.

## Goal

Run `forgepilot_get_guarded_start_preflight_report` with:

- the real FP-MCP-117 request artifact
- a non-authorizing approval evidence fixture

This packet answers one question:

Does the guarded start preflight report improve the human-approval observation when approval-shaped evidence exists, while still refusing eligibility because the runner remains `PRESENT_DISABLED`?

## Background

FP-MCP-117 proved that the guarded preflight report works against a real request artifact.

The request, commit, model, and run-mode gates passed.

Remaining expected blockers included:

- disabled execution switch
- disabled runner start endpoint
- disabled OpenCode execution
- missing or unusable approval evidence
- incomplete pre-start evidence
- incomplete state snapshot evidence
- deferred evidence ledger readiness

FP-MCP-118 introduces approval-shaped fixture evidence to test the report’s approval observation path without creating real authorization.

## Scope

Allowed:

- Use existing FP-MCP-117 request artifact:
  - `REQ-20260630T160920008Z-195b9969`
- Use model id:
  - `deepseek-v4-pro-high`
- Use run mode:
  - `DESIGN_ONLY`
- Use request artifact commit:
  - `8d20e85`
- Use branch:
  - `main`
- Create a non-authorizing human approval evidence dry-run fixture.
- Run the guarded start preflight report with the fixture approval id.
- Record evidence under `runs/FP-MCP-118/`.

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
- Do not mutate approval artifacts after creation.
- Do not implement `PRESENT_GUARDED`.
- Do not implement `CALLABLE_GUARDED`.
- Do not implement real guarded start.
- Do not relax the disable switch.

## Required Steps

### Step 1 — Create Approval Fixture

Use:

```text
forgepilot_record_human_approval_evidence_dry_run_fixture
```

Required input:

```json
{
  "packetId": "FP-MCP-118",
  "requestId": "REQ-20260630T160920008Z-195b9969",
  "modelId": "deepseek-v4-pro-high",
  "runMode": "DESIGN_ONLY",
  "repoCommit": "8d20e85",
  "branch": "main",
  "approval": "RECORD_HUMAN_APPROVAL_EVIDENCE_DRY_RUN_FIXTURE"
}
```

Required result:

- fixture created
- fixture is non-authorizing
- execution not enabled
- OpenCode not started
- runner start endpoint not contacted
- approval not consumed

### Step 2 — Run Guarded Start Preflight Report

Use:

```text
forgepilot_get_guarded_start_preflight_report
```

with:

- `packetId: FP-MCP-117`
- `requestId: REQ-20260630T160920008Z-195b9969`
- `approvalId: <created fixture approval id>`

The report should evaluate the real request artifact from FP-MCP-117 and approval-shaped fixture evidence from FP-MCP-118.

Expected request/model gates:

- `repository: PASSED`
- `requestArtifact: PASSED`
- `commitBinding: PASSED`
- `modelAndRunMode: PASSED`

Expected approval behavior:

- approval evidence should be observed or evaluated more specifically than the FP-MCP-117 missing-approval case
- approval must not be consumed
- approval fixture must not authorize execution

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

Additional approval-specific reasons are acceptable if the fixture is correctly treated as non-authorizing.

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
- fixture approval evidence created
- fixture approval id recorded
- guarded preflight report evaluated with the approval id
- approval was not consumed
- fixture did not authorize execution
- report remained not eligible
- request artifact remained valid
- model/run-mode remained valid
- no runner start endpoint contact occurred
- no OpenCode process was started
- no runner run id was created
- no request artifact was mutated

## Evidence

Record:

- `runs/FP-MCP-118/approval-fixture.md`
- `runs/FP-MCP-118/preflight-report.md`
- `runs/FP-MCP-118/verification.txt`

## Success Criteria

This packet is successful if:

1. A non-authorizing approval evidence fixture is created.
2. The fixture approval id is recorded.
3. The guarded preflight report accepts the approval id as input.
4. The report improves or clarifies approval observation compared with the missing-approval case.
5. The report remains not eligible because execution and runner start remain disabled.
6. No approval is consumed.
7. No runner start endpoint is contacted.
8. No OpenCode process is started.
9. No runner run id is created.
10. No request artifact is mutated.
11. Verification passes.

## Non-goals

This packet does not create real approval evidence.

This packet does not consume approval.

This packet does not authorize execution.

This packet does not enable execution.

This packet does not make start callable.

This packet does not add start to supported operations.

This packet does not create pre-start evidence.

This packet does not create state snapshot evidence.

This packet does not implement `PRESENT_GUARDED`.

This packet does not implement `CALLABLE_GUARDED`.

This packet does not perform a remote runner start.
