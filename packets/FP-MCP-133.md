# FP-MCP-133 — Request Target Execution Commit Contract

## Task

Define explicit target execution commit semantics for ForgePilot request artifacts.

## Goal

Remove ambiguity from guarded preflight commit binding by requiring request artifacts to declare the commit intended for execution.

This packet answers one question:

How should a request artifact declare the target commit that approval evidence must bind to?

## Background

FP-MCP-131 selected Option D:

```text
human approval evidence binds to approvedTargetExecutionCommit
```

FP-MCP-132 implemented that rule in the local guarded preflight skeleton.

The FP-MCP-132 report showed:

```text
approvalTargetExecutionCommit: d8684b1
approvalTargetCommitSource: APPROVAL_SCOPE_REPO_COMMIT_LEGACY

requestTargetExecutionCommit: 034cfdb
requestTargetCommitSource: REQUEST_BASE_COMMIT_LEGACY_FALLBACK

currentEvaluationCommit: 0612f3a
currentEvaluationCommitDifferentFromApprovalTarget: true
```

This proved the new semantics work:

- current evaluation commit drift is observation-only
- ambiguous `HUMAN_APPROVAL_EVIDENCE_COMMIT_MISMATCH` was removed
- target mismatch is now correctly reported as `HUMAN_APPROVAL_EVIDENCE_TARGET_COMMIT_MISMATCH`

But the request target was resolved through legacy fallback:

```text
request.baseCommit
```

That is too ambiguous for guarded execution.

## Decision

Future ForgePilot request artifacts must explicitly declare:

```text
targetExecutionCommit
```

This field identifies the exact repository commit that the guarded runner would execute if all future gates passed.

## Contract

### Required Field

A guarded-start-capable request artifact must contain:

```json
{
  "targetExecutionCommit": "<commit sha>"
}
```

The value must be a concrete git commit id.

It may be short or full SHA during early MCP development, but future hardened contracts should prefer full SHA.

### Meaning

`targetExecutionCommit` means:

```text
the exact repository commit intended to be executed by the runner
```

It is not:

```text
the request artifact creation commit
the approval artifact creation commit
the current evaluation commit
the latest HEAD
the commit that recorded preflight evidence
```

### Approval Binding Rule

Human approval evidence must bind to the same target:

```text
approval.approvedTargetExecutionCommit == request.targetExecutionCommit
```

For legacy approval artifacts:

```text
approval.scope.repoCommit == request.targetExecutionCommit
```

### Request Artifact Provenance Fields

Request artifacts may also contain provenance fields such as:

```text
baseCommit
creationCommit
artifactCommit
requestArtifactCommit
recordedAtCommit
```

These fields are provenance only unless explicitly named as target fields.

### Target Field Priority

For transitional compatibility, evaluators may resolve request target commit in priority order:

```text
targetExecutionCommit
approvedTargetExecutionCommit
executionCommit
artifactCommit
baseCommit
creationCommit
```

But only `targetExecutionCommit` is the preferred V1 field.

If fallback is used, the report must record the fallback source.

Example:

```text
requestTargetCommitSource: REQUEST_BASE_COMMIT_LEGACY_FALLBACK
```

### Guarded Start Eligibility

A request artifact must not be considered guarded-start-ready unless:

```text
targetExecutionCommit exists
```

and:

```text
targetExecutionCommit is reachable from the current repository
```

and:

```text
human approval evidence binds to targetExecutionCommit
```

For early local preflight skeletons, missing `targetExecutionCommit` may be `DEFERRED` or legacy-compatible, but a future guarded callable start must require it.

### Mutability

`targetExecutionCommit` is immutable once the request artifact is committed.

Changing target execution commit requires a new request artifact.

Approval evidence for one target commit must not be reused for a different target commit.

### Target Commit Versus Current HEAD

Current HEAD may advance after the request artifact is recorded.

That must not automatically invalidate the request or approval.

Preflight may record:

```text
currentEvaluationCommit
currentEvaluationCommitDifferentFromTarget
```

as observation-only unless policy explicitly requires evaluation from the target commit.

### Evaluation From Target Commit

A future hardened guarded start may require the runner to checkout or verify:

```text
targetExecutionCommit
```

before execution.

This packet does not implement checkout behavior.

It only defines request artifact target commit semantics.

## Current FP-MCP-117 Interpretation

The current FP-MCP-117 request artifact does not explicitly declare:

```text
targetExecutionCommit
```

The local evaluator therefore used:

```text
baseCommit: 034cfdb
```

as legacy fallback.

That means FP-MCP-126 approval, scoped to:

```text
d8684b1
```

does not bind to the FP-MCP-117 request target as currently interpreted.

This is a valid observation, not an implementation bug.

## Future Repair Path

To test a passing approval target binding, ForgePilot should create a new request artifact that explicitly declares:

```text
targetExecutionCommit: <approved target commit>
```

Then create or record approval evidence bound to the same target.

This should be a new packet sequence, not a mutation of existing artifacts.

## Required Future Reason Codes

If request target is missing:

```text
REQUEST_TARGET_EXECUTION_COMMIT_MISSING
```

If legacy fallback is used:

```text
REQUEST_TARGET_COMMIT_LEGACY_FALLBACK_USED
```

If approval target differs from request target:

```text
HUMAN_APPROVAL_EVIDENCE_TARGET_COMMIT_MISMATCH
```

If current HEAD differs from request target:

```text
CURRENT_EVALUATION_COMMIT_DIFFERENT_FROM_REQUEST_TARGET
```

The current HEAD difference is observation-only unless a specific policy says otherwise.

## Non-Execution Boundary

This packet is contract-only.

It must not:

- enable execution
- make start callable
- add start to `supportedOperations`
- contact the runner start endpoint
- call `/runner/start-run`
- call `forgepilot_start_remote_runner_request`
- start OpenCode
- create runner run id
- consume approval
- create approval consumption evidence
- mutate approval artifacts
- mutate request artifacts
- mutate pre-start evidence
- mutate state snapshot evidence
- implement `PRESENT_GUARDED`
- implement `CALLABLE_GUARDED`
- implement real guarded start

## Verification

Verification must show:

- packet committed
- contract evidence recorded
- `targetExecutionCommit` defined
- provenance commit fields separated from target commit
- approval binding rule defined
- legacy fallback behavior defined
- guarded-start eligibility requirement defined
- existing FP-MCP-117 fallback interpretation recorded
- no implementation changes
- no execution enabled
- no runner start endpoint contacted
- no OpenCode start
- no approval consumed
- no artifacts mutated

## Evidence

Record:

- `runs/FP-MCP-133/contract-evidence.md`
- `runs/FP-MCP-133/verification.txt`

## Success Criteria

This packet is successful if:

1. `targetExecutionCommit` is defined as the request target field.
2. Its meaning is distinct from provenance commits.
3. Approval binding to request target is defined.
4. Legacy fallback semantics are defined.
5. Guarded-start eligibility requirements are defined.
6. Current HEAD drift remains observation-only.
7. Existing FP-MCP-117 behavior is explained.
8. No implementation changes are made.
9. Verification passes.

## Non-goals

This packet does not modify existing request artifacts.

This packet does not create a new request artifact.

This packet does not implement request artifact schema migration.

This packet does not implement runner checkout behavior.

This packet does not consume approval.

This packet does not implement approval consumption.

This packet does not enable execution.

This packet does not make start callable.

This packet does not add start to supported operations.

This packet does not implement `PRESENT_GUARDED`.

This packet does not implement `CALLABLE_GUARDED`.

This packet does not perform a remote runner start.
