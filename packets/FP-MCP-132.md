# FP-MCP-132 — Local Preflight Target Commit Binding Implementation

## Task

Update the local guarded preflight skeleton to use approved target execution commit semantics for human approval evidence.

## Goal

Implement the FP-MCP-131 commit binding decision in the local preflight skeleton.

This packet answers one question:

Can the local guarded preflight evaluator stop treating current `HEAD` drift as approval failure and instead compare approval target commit against request target execution commit?

## Background

FP-MCP-130 ran the local guarded preflight skeleton and observed:

```text
humanApprovalEvidence:
  evaluated: true
  passed: false
  state: FAILED
  reasons:
    - HUMAN_APPROVAL_EVIDENCE_EXPIRED
    - HUMAN_APPROVAL_EVIDENCE_COMMIT_MISMATCH
```

FP-MCP-131 selected Option D:

```text
human approval evidence binds to approvedTargetExecutionCommit
```

Current evaluation commit is provenance only and must not invalidate approval evidence by itself.

FP-MCP-132 implements that rule in the local skeleton.

## Scope

Allowed:

- Modify `~/forgepilot-chatgpt-mcp/scripts/guarded-preflight-report.mjs`.
- Resolve approval target commit from:
  - `approval.scope.approvedTargetExecutionCommit`
  - legacy `approval.scope.repoCommit`
- Resolve request target execution commit from request artifact fields in priority order:
  - `targetExecutionCommit`
  - `approvedTargetExecutionCommit`
  - `executionCommit`
  - `artifactCommit`
  - `baseCommit`
  - `creationCommit`
- Compare approval target commit against request target execution commit.
- Replace ambiguous `HUMAN_APPROVAL_EVIDENCE_COMMIT_MISMATCH`.
- Add target commit metadata to the local report.
- Record current evaluation commit difference as observation only.
- Preserve expiration behavior.
- Run the local preflight again.
- Record evidence under `runs/FP-MCP-132/`.

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

## Required Semantics

### Approval Target Commit Resolution

Resolve approval target commit in priority order:

```text
approval.scope.approvedTargetExecutionCommit
approval.scope.repoCommit
```

If `scope.repoCommit` is used, record:

```text
approvalTargetCommitSource: APPROVAL_SCOPE_REPO_COMMIT_LEGACY
```

### Request Target Commit Resolution

Resolve request target execution commit in priority order:

```text
request.targetExecutionCommit
request.approvedTargetExecutionCommit
request.executionCommit
request.artifactCommit
request.baseCommit
request.creationCommit
```

If `baseCommit` is used, record:

```text
requestTargetCommitSource: REQUEST_BASE_COMMIT_LEGACY_FALLBACK
```

### Comparison Rule

Human approval evidence fails commit binding only when:

```text
approvalTargetExecutionCommit != requestTargetExecutionCommit
```

Reason:

```text
HUMAN_APPROVAL_EVIDENCE_TARGET_COMMIT_MISMATCH
```

The evaluator must not fail only because:

```text
currentEvaluationCommit != approvalTargetExecutionCommit
```

Instead, record observation metadata:

```text
currentEvaluationCommitDifferentFromApprovalTarget: true
```

and optionally reason-style observation:

```text
HUMAN_APPROVAL_EVIDENCE_CURRENT_EVALUATION_COMMIT_DIFFERENT
```

This observation must not make `humanApprovalEvidence.passed` false.

### Expiration Rule

Expiration remains a failure.

If approval is expired, `humanApprovalEvidence` may still fail with:

```text
HUMAN_APPROVAL_EVIDENCE_EXPIRED
```

even if target commit binding passes.

## Expected FP-MCP-126 Re-Evaluation

For the FP-MCP-126 approval artifact:

```text
approval.scope.repoCommit: 097ae35
```

The local evaluator must interpret this as:

```text
approvedTargetExecutionCommit: 097ae35
approvalTargetCommitSource: APPROVAL_SCOPE_REPO_COMMIT_LEGACY
```

If request target commit resolves to a different value, the result must be:

```text
HUMAN_APPROVAL_EVIDENCE_TARGET_COMMIT_MISMATCH
```

If the only difference is current HEAD being later than `097ae35`, that difference must be observation-only.

The known expiration failure may remain:

```text
HUMAN_APPROVAL_EVIDENCE_EXPIRED
```

## Required Output Additions

The `humanApprovalEvidence` gate should include:

```text
approvalTargetExecutionCommit
approvalTargetCommitSource
requestTargetExecutionCommit
requestTargetCommitSource
currentEvaluationCommit
currentEvaluationCommitDifferentFromApprovalTarget
```

## Required Safety Values

The local preflight report must still preserve:

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

## Verification

Verification must show:

- local skeleton updated
- ambiguous current-HEAD commit mismatch removed
- target commit comparison implemented
- current evaluation commit drift recorded as observation only
- expiration still evaluated
- local preflight run captured
- JSON report recorded
- safety fields preserved
- no approval consumed
- no runner start endpoint contacted
- no OpenCode start
- no request or approval artifact mutation

## Evidence

Record:

- `runs/FP-MCP-132/implementation-evidence.md`
- `runs/FP-MCP-132/local-preflight-report.json`
- `runs/FP-MCP-132/local-preflight-report.md`
- `runs/FP-MCP-132/verification.txt`

## Success Criteria

This packet is successful if:

1. Target commit semantics are implemented locally.
2. Current HEAD drift no longer creates `HUMAN_APPROVAL_EVIDENCE_COMMIT_MISMATCH`.
3. Target commit mismatch, if present, uses `HUMAN_APPROVAL_EVIDENCE_TARGET_COMMIT_MISMATCH`.
4. Current evaluation commit difference is recorded as observation-only.
5. Expiration behavior remains independent.
6. Local preflight report is recorded.
7. Safety fields remain non-executing.
8. Verification passes.

## Non-goals

This packet does not refresh or recreate approval evidence.

This packet does not consume approval.

This packet does not implement approval consumption.

This packet does not enable execution.

This packet does not make start callable.

This packet does not add start to supported operations.

This packet does not implement `PRESENT_GUARDED`.

This packet does not implement `CALLABLE_GUARDED`.

This packet does not perform a remote runner start.
