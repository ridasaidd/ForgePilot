# FP-MCP-131 Contract Evidence

Result: PASSED

Defined human approval evidence commit binding semantics.

## Packet

- FP-MCP-131 — Human Approval Evidence Commit Binding Semantics Contract

## Packet Commit

- `57869bd Add FP-MCP-131 approval commit binding contract packet`

## Decision

Selected:

```text
Option D — approved target execution commit
```

Human approval evidence binds to the commit explicitly approved as the target state for one guarded execution attempt.

It does not bind to whichever commit happens to be current when preflight evaluation runs.

## Rejected Alternatives

### Option A — Current Evaluation Commit

Rejected.

Reason:

```text
Current evaluation commit is transient. Evidence recording advances HEAD and must not retroactively invalidate approval for a previously approved target state.
```

### Option B — Approval Artifact Creation Commit

Rejected as the binding target.

Reason:

```text
Approval artifact creation commit is provenance for when the approval was recorded. It is not necessarily the execution target being approved.
```

### Option C — Request Artifact Commit

Rejected as the universal binding target.

Reason:

```text
Request artifact commit may be the creation/storage commit of a request. It is only the target commit if the request explicitly declares it as such or if legacy fallback applies.
```

## Accepted Semantics

Approval evidence must bind to:

```text
approvedTargetExecutionCommit
```

The preflight evaluator must compare:

```text
approval approved target execution commit
```

against:

```text
request intended target execution commit
```

It must not compare approval commit binding against current repository HEAD unless the request explicitly says current HEAD is the approved target execution commit.

## Provenance Versus Target

The contract distinguishes:

```text
request artifact commit
approval artifact creation commit
current evaluation commit
approved target execution commit
```

Only the approved target execution commit is the approval binding target.

The other commits are provenance unless explicitly declared as the target.

## Legacy Compatibility

For FP-MCP-126-style artifacts that contain only:

```json
{
  "scope": {
    "repoCommit": "<commit sha>"
  }
}
```

the local evaluator should interpret `scope.repoCommit` as:

```text
approvedTargetExecutionCommit
```

not as current evaluation commit.

## Target Commit Source Priority

The request artifact target commit should be resolved in this order:

```text
targetExecutionCommit
approvedTargetExecutionCommit
executionCommit
artifactCommit
baseCommit
creationCommit
```

If `baseCommit` is used, the evaluator must record it as a legacy fallback:

```text
targetCommitSource: REQUEST_BASE_COMMIT_LEGACY_FALLBACK
```

## Expiration Independence

Expiration remains independent from commit binding.

An approval may still fail if:

```text
expiresAt <= evaluation time
```

even if target commit binding passes.

## Required Future Reason Codes

The ambiguous reason:

```text
HUMAN_APPROVAL_EVIDENCE_COMMIT_MISMATCH
```

should be replaced or narrowed.

Future evaluator behavior should distinguish:

```text
HUMAN_APPROVAL_EVIDENCE_TARGET_COMMIT_MISMATCH
HUMAN_APPROVAL_EVIDENCE_CURRENT_EVALUATION_COMMIT_DIFFERENT
```

The first is a failure.

The second is an observation only.

## FP-MCP-130 Interpretation

FP-MCP-130 observed:

```text
HUMAN_APPROVAL_EVIDENCE_EXPIRED
HUMAN_APPROVAL_EVIDENCE_COMMIT_MISMATCH
```

Under FP-MCP-131 semantics:

- expiration remains a valid failure
- commit mismatch must be reinterpreted
- current HEAD being later than the approved target commit is not automatically a failure
- only mismatch between approval target commit and request target commit should fail

## Non-Execution Boundary

This packet was contract-only.

It did not:

```text
enable execution
make start callable
add start to supportedOperations
contact the runner start endpoint
start OpenCode
create runner run id
consume approval
create approval consumption evidence
mutate approval artifacts
mutate request artifacts
mutate pre-start evidence
mutate state snapshot evidence
implement PRESENT_GUARDED
implement CALLABLE_GUARDED
perform remote runner start
```

## Conclusion

FP-MCP-131 successfully defines Option D as the approval commit binding rule:

```text
approval evidence binds to approved target execution commit
```
