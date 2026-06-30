# FP-MCP-131 — Human Approval Evidence Commit Binding Semantics Contract

## Task

Define the commit binding semantics for real-shaped human approval evidence.

## Decision

ForgePilot human approval evidence must bind to:

```text
approved target execution commit
```

This is Option D.

## Goal

Clarify that approval evidence authorizes one specific target execution state, not whichever commit happens to be current when preflight evaluation runs.

This packet answers one question:

What commit does human approval evidence bind to?

## Background

FP-MCP-126 recorded one real-shaped, scoped, non-consumed human approval evidence artifact.

FP-MCP-130 evaluated that artifact through the local guarded preflight path.

The approval artifact was found and structurally classified, but `humanApprovalEvidence` failed with:

```text
HUMAN_APPROVAL_EVIDENCE_EXPIRED
HUMAN_APPROVAL_EVIDENCE_COMMIT_MISMATCH
```

The expiration failure is expected because the approval fixture used a short-lived time window.

The commit mismatch revealed a policy ambiguity:

Should approval evidence bind to:

```text
A. current evaluation commit
B. approval artifact creation commit
C. request artifact commit
D. approved target execution commit
```

This packet selects Option D.

## Rationale

Approval is not an evaluation-time property.

Approval is not permission for whatever `HEAD` happens to be when a preflight report is run.

Approval is a human authorization observation for a specific bounded target state.

Therefore, approval must bind to the target execution commit that the human reviewed and approved.

This preserves ForgePilot principles:

- P01 — ForgePilot records observations, not narratives.
- P02 — Trust cannot be retroactively created.
- P03 — ForgePilot does not optimize for favorable outcomes.
- P04 — Only admitted evidence may influence observatory outputs.
- P06 — Classification follows observation.

## Terminology

### Request Artifact Commit

The commit associated with creation or storage of the request artifact.

This may be the base commit from which a non-executing run request was created.

### Approval Artifact Creation Commit

The repository commit at which the approval evidence artifact itself was written and committed.

This is provenance for the approval artifact.

It is not necessarily the approved target execution state.

### Current Evaluation Commit

The repository commit at which a preflight report is evaluated.

This may advance as evidence is recorded.

This must not invalidate approval by itself.

### Approved Target Execution Commit

The commit explicitly approved by the human operator as the target state for one guarded execution attempt.

This is the commit that the runner would be allowed to execute if all future guarded-start gates passed.

## Contract Decision

Human approval evidence must include or derive:

```text
approvedTargetExecutionCommit
```

The approval evidence gate must validate that the approval's target commit equals the request's intended target execution commit.

The approval evidence gate must not require that:

```text
approval.scope.repoCommit == current evaluation commit
```

unless the current evaluation commit is also the approved target execution commit.

## Required Approval Artifact Fields

Future real approval evidence artifacts SHOULD include:

```json
{
  "scope": {
    "packetId": "<packet id>",
    "requestId": "<request id>",
    "modelId": "<model id>",
    "runMode": "<run mode>",
    "branch": "<branch>",
    "approvedTargetExecutionCommit": "<commit sha>"
  },
  "provenance": {
    "approvalArtifactCreationCommit": "<commit sha>",
    "recordedAtCommit": "<commit sha>"
  }
}
```

For backward compatibility with FP-MCP-126, if an artifact only contains:

```json
{
  "scope": {
    "repoCommit": "<commit sha>"
  }
}
```

then `scope.repoCommit` must be interpreted as:

```text
approvedTargetExecutionCommit
```

not as current evaluation commit.

## Preflight Evaluation Rule

Given:

```text
approval.scope.approvedTargetExecutionCommit
```

or legacy:

```text
approval.scope.repoCommit
```

the preflight evaluator must compare it against the request artifact's target execution commit.

It must not compare it against the current repository `HEAD` unless the request artifact explicitly declares current `HEAD` as the target execution commit.

## Request Artifact Compatibility Rule

If the request artifact contains an explicit target commit field, use it.

Allowed field names, in priority order:

```text
targetExecutionCommit
approvedTargetExecutionCommit
executionCommit
artifactCommit
baseCommit
creationCommit
```

If no explicit target commit exists, the preflight evaluator may fall back to the request artifact's `baseCommit` only as a legacy compatibility rule.

The fallback must be recorded as an observation.

Suggested reason or metadata:

```text
targetCommitSource: REQUEST_BASE_COMMIT_LEGACY_FALLBACK
```

## Current Evaluation Commit Rule

Current evaluation commit may be recorded as provenance:

```text
currentEvaluationCommit
```

But current evaluation commit must not be used to invalidate approval evidence unless the approval explicitly says:

```text
approvalTargetMode: CURRENT_EVALUATION_COMMIT
```

That mode is not allowed for guarded execution approval in ForgePilot V1.

## Multi-Commit Evidence Flow

Evidence may be recorded across multiple commits:

```text
request artifact commit
approval artifact commit
pre-start evidence commit
state snapshot evidence commit
preflight report commit
```

This is expected.

These commits are provenance commits.

They are not automatically target execution commits.

A later evidence commit must not retroactively invalidate approval for an earlier approved target execution commit.

## Expiration Semantics

Expiration is independent from commit binding.

Approval evidence may still fail if:

```text
expiresAt <= evaluation time
```

Even if commit binding passes.

This packet does not change expiration behavior.

## Required Gate Behavior

The `humanApprovalEvidence` gate must distinguish:

```text
HUMAN_APPROVAL_EVIDENCE_TARGET_COMMIT_MISMATCH
```

from:

```text
HUMAN_APPROVAL_EVIDENCE_CURRENT_EVALUATION_COMMIT_DIFFERENT
```

The first is a failure.

The second is an observation only.

Existing reason:

```text
HUMAN_APPROVAL_EVIDENCE_COMMIT_MISMATCH
```

is ambiguous and should be replaced or narrowed in future implementations.

## Expected Future FP-MCP-126 Re-evaluation

For the FP-MCP-126 approval artifact:

```text
scope.repoCommit: 097ae35
```

The local evaluator should interpret this legacy value as:

```text
approvedTargetExecutionCommit: 097ae35
```

It should then compare it against the request artifact's target execution commit.

If the request artifact target is not `097ae35`, the gate may fail with:

```text
HUMAN_APPROVAL_EVIDENCE_TARGET_COMMIT_MISMATCH
```

If the only mismatch is that current HEAD is later than `097ae35`, that must not fail approval evidence.

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
- Option D selected
- current evaluation commit rejected as approval binding target
- approved target execution commit defined
- legacy `scope.repoCommit` compatibility defined
- target commit comparison rule defined
- expiration remains independent
- no implementation changes
- no execution enabled
- no runner start endpoint contacted
- no OpenCode start
- no approval consumed

## Evidence

Record:

- `runs/FP-MCP-131/contract-evidence.md`
- `runs/FP-MCP-131/verification.txt`

## Success Criteria

This packet is successful if:

1. Option D is selected explicitly.
2. `approvedTargetExecutionCommit` is defined.
3. Current evaluation commit is rejected as the approval binding target.
4. Approval artifact creation commit is classified as provenance only.
5. Request artifact commit is classified as candidate target only if explicitly used as target.
6. Legacy `scope.repoCommit` compatibility is defined.
7. Preflight comparison rule is defined.
8. Expiration semantics remain independent.
9. No code is changed.
10. Verification passes.

## Non-goals

This packet does not implement the new evaluator semantics.

This packet does not refresh or recreate approval evidence.

This packet does not consume approval.

This packet does not implement approval consumption.

This packet does not enable execution.

This packet does not make start callable.

This packet does not add start to supported operations.

This packet does not implement `PRESENT_GUARDED`.

This packet does not implement `CALLABLE_GUARDED`.

This packet does not perform a remote runner start.
