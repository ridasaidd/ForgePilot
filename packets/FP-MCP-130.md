# FP-MCP-130 — Local Guarded Preflight Real Approval Evaluation

## Task

Run the local guarded preflight report skeleton against the real-shaped FP-MCP-126 approval evidence artifact.

## Goal

Evaluate whether the local guarded preflight path can classify the FP-MCP-126 approval evidence artifact and preserve all non-execution boundaries.

This packet answers one question:

What does the local guarded preflight path observe when evaluating the real-shaped human approval evidence artifact?

## Background

FP-MCP-126 recorded one real-shaped, scoped, non-consumed human approval evidence artifact.

FP-MCP-127 attempted to run the guarded preflight report through ChatGPT Actions, but the platform blocked the read-only tool call before it reached MCP.

FP-MCP-128 defined a local guarded preflight invocation path contract.

FP-MCP-129 implemented the local guarded preflight report skeleton.

FP-MCP-130 runs that local skeleton and records the report.

## Target Input

Run:

```text
node scripts/guarded-preflight-report.mjs \
  --packet-id FP-MCP-117 \
  --request-id REQ-20260630T160920008Z-195b9969 \
  --approval-id APPROVAL-20260630T175528922Z-806b81c3
```

The script lives in:

```text
~/forgepilot-chatgpt-mcp/scripts/guarded-preflight-report.mjs
```

The ForgePilot repo is:

```text
~/forgepilot
```

## Approval Evidence Under Test

```text
approvalId: APPROVAL-20260630T175528922Z-806b81c3
path: runs/FP-MCP-126/approvals/APPROVAL-20260630T175528922Z-806b81c3.json
sha256: 482e7c13c3fda729bab0eada110b41199dc576be8a7b4112324f1ae4220a1fdb
createdByPacket: FP-MCP-126
```

## Scope

Allowed:

- Run the local read-only guarded preflight script.
- Capture the raw JSON report.
- Parse the key gate results.
- Record whether `humanApprovalEvidence` passed or failed.
- Record whether any failure was caused by commit mismatch or expiration.
- Record all top-level non-execution safety fields.
- Record evidence under `runs/FP-MCP-130/`.

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

## Expected Result

The local report must produce JSON.

Preferred approval evidence result:

```text
humanApprovalEvidence.state: PASSED
humanApprovalEvidence.passed: true
humanApprovalEvidence.reasons: []
```

Acceptable observed result:

```text
humanApprovalEvidence.state: FAILED
humanApprovalEvidence.reasons includes HUMAN_APPROVAL_EVIDENCE_COMMIT_MISMATCH
```

or:

```text
humanApprovalEvidence.state: FAILED
humanApprovalEvidence.reasons includes HUMAN_APPROVAL_EVIDENCE_EXPIRED
```

If either occurs, record it honestly.

## Required Safety Fields

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
approvalArtifactMutated: false
```

## Required Remaining Blockers

The local report must continue to show guarded start is not allowed while these gates fail:

```text
disableSwitch
runnerCapabilityState
opencodeReadiness
```

## Evidence

Record:

- `runs/FP-MCP-130/local-preflight-report.json`
- `runs/FP-MCP-130/local-preflight-report.md`
- `runs/FP-MCP-130/verification.txt`

## Success Criteria

This packet is successful if:

1. The local preflight script runs.
2. A JSON report is captured.
3. `humanApprovalEvidence` is evaluated.
4. The approval artifact path and sha256 are reported if classified.
5. The result is recorded honestly.
6. Safety fields remain non-executing.
7. The runner start endpoint is not contacted.
8. OpenCode is not started.
9. Approval is not consumed.
10. Approval artifacts are not mutated.
11. Request artifacts are not mutated.
12. Verification passes.

## Non-goals

This packet does not consume approval.

This packet does not implement approval consumption.

This packet does not enable execution.

This packet does not make start callable.

This packet does not add start to supported operations.

This packet does not implement `PRESENT_GUARDED`.

This packet does not implement `CALLABLE_GUARDED`.

This packet does not perform a remote runner start.
