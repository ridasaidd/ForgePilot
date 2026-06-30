# FP-MCP-127 — Human Approval Evidence Passing Preflight Test

## Task

Run the guarded start preflight report using the FP-MCP-126 real-shaped human approval evidence artifact.

## Goal

Verify whether `humanApprovalEvidence` can pass with real-shaped, scoped, non-consumed approval evidence while execution remains blocked.

This packet answers one question:

Can ForgePilot recognize valid human approval evidence without consuming approval or starting execution?

## Background

FP-MCP-123 defined the human approval evidence preflight evaluation contract.

FP-MCP-124 implemented a read-only approval evidence classifier.

FP-MCP-125 defined the real-shaped approval evidence artifact contract.

FP-MCP-126 recorded one real-shaped, scoped, non-consumed approval evidence artifact.

FP-MCP-127 uses that artifact in the guarded start preflight report.

## Current Request Chain Under Test

Request artifact:

- packetId: `FP-MCP-117`
- requestId: `REQ-20260630T160920008Z-195b9969`
- modelId: `deepseek-v4-pro-high`
- runMode: `DESIGN_ONLY`
- request artifact path: `runs/FP-MCP-117/opencode-requests/REQ-20260630T160920008Z-195b9969.json`
- request artifact sha256: `512a8c2c48e69b22d0e48206c9e9af65aff26d44eefded9b8ca9e6b0b064a454`

Real-shaped approval evidence artifact:

- packetId: `FP-MCP-126`
- approvalId: `APPROVAL-20260630T175528922Z-806b81c3`
- approval path: `runs/FP-MCP-126/approvals/APPROVAL-20260630T175528922Z-806b81c3.json`
- approval sha256: `482e7c13c3fda729bab0eada110b41199dc576be8a7b4112324f1ae4220a1fdb`
- scoped repo commit: `097ae35`
- approval consumed: `false`

## Scope

Allowed:

- Run `forgepilot_get_guarded_start_preflight_report`.
- Use the FP-MCP-126 approval id.
- Observe whether `humanApprovalEvidence` passes.
- Observe whether execution remains blocked.
- Record preflight evidence under `runs/FP-MCP-127/`.

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
- Do not create approval consumption evidence.
- Do not mutate approval artifacts.
- Do not mutate request artifacts.
- Do not mutate pre-start evidence.
- Do not mutate state snapshot evidence.
- Do not implement `PRESENT_GUARDED`.
- Do not implement `CALLABLE_GUARDED`.
- Do not implement real guarded start.
- Do not relax the disable switch.

## Expected Preflight Input

```json
{
  "packetId": "FP-MCP-117",
  "requestId": "REQ-20260630T160920008Z-195b9969",
  "approvalId": "APPROVAL-20260630T175528922Z-806b81c3"
}
```

## Expected Approval Evidence Behavior

Preferred result:

```text
humanApprovalEvidence:
  evaluated: true
  passed: true
  state: PASSED
  reasons: []
  evidencePath: runs/FP-MCP-126/approvals/APPROVAL-20260630T175528922Z-806b81c3.json
  evidenceSha256: 482e7c13c3fda729bab0eada110b41199dc576be8a7b4112324f1ae4220a1fdb
```

Acceptable result if repository commit has advanced and strict current-commit matching is enforced:

```text
humanApprovalEvidence:
  evaluated: true
  passed: false
  state: FAILED
  reasons:
    - HUMAN_APPROVAL_EVIDENCE_COMMIT_MISMATCH
```

If this occurs, the result is useful evidence for whether approval should bind to the request artifact commit or current evaluation commit.

## Expected Non-Execution Safety

Regardless of approval evidence result, the report must preserve:

```text
eligibleForFutureGuardedStart: false
executionPermitted: false
executionStarted: false
opencodeStarted: false
runnerStartEndpointContacted: false
startEndpointContacted: false
runnerRunId: null
approvalConsumed: false
requestArtifactMutated: false
```

## Expected Remaining Blockers

Even if `humanApprovalEvidence` passes, the report must still be blocked by:

```text
disableSwitch: FAILED
runnerCapabilityState: FAILED
opencodeReadiness: FAILED
```

## Evidence

Record:

- `runs/FP-MCP-127/preflight-report.md`
- `runs/FP-MCP-127/verification.txt`

## Success Criteria

This packet is successful if:

1. The preflight report is run with the FP-MCP-126 approval id.
2. `humanApprovalEvidence` is evaluated.
3. The approval artifact path and sha256 are reported if classified.
4. The result is recorded.
5. Execution remains disabled.
6. Runner start endpoint is not contacted.
7. OpenCode is not started.
8. No runner run id is created.
9. Approval is not consumed.
10. Approval consumption evidence is not created.
11. Approval artifact is not mutated.
12. Request artifact is not mutated.
13. Verification passes.

## Non-goals

This packet does not consume approval.

This packet does not implement approval consumption.

This packet does not enable execution.

This packet does not make start callable.

This packet does not add start to supported operations.

This packet does not implement `PRESENT_GUARDED`.

This packet does not implement `CALLABLE_GUARDED`.

This packet does not perform a remote runner start.
