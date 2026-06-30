# FP-MCP-133 Contract Evidence

Result: PASSED

Defined explicit request target execution commit semantics.

## Packet

- FP-MCP-133 — Request Target Execution Commit Contract

## Packet Commit

- `868e8a8 Add FP-MCP-133 request target commit contract packet`

## Decision

Future guarded-start-capable request artifacts must explicitly declare:

```text
targetExecutionCommit
```

This field identifies the exact repository commit intended to be executed by the runner if all future guarded-start gates pass.

## Meaning

`targetExecutionCommit` means:

```text
the exact repository commit intended to be executed by the runner
```

It is not:

```text
request artifact creation commit
approval artifact creation commit
current evaluation commit
latest HEAD
preflight evidence commit
```

## Approval Binding Rule

Human approval evidence must bind to the same target:

```text
approval.approvedTargetExecutionCommit == request.targetExecutionCommit
```

For legacy approval artifacts:

```text
approval.scope.repoCommit == request.targetExecutionCommit
```

## Provenance Fields

Request artifacts may contain provenance fields such as:

```text
baseCommit
creationCommit
artifactCommit
requestArtifactCommit
recordedAtCommit
```

These fields are provenance unless explicitly used as target fields.

## Target Field Priority

During transition, request target commit may be resolved in priority order:

```text
targetExecutionCommit
approvedTargetExecutionCommit
executionCommit
artifactCommit
baseCommit
creationCommit
```

Only `targetExecutionCommit` is the preferred V1 field.

If fallback is used, the evaluator must record the fallback source.

Example:

```text
requestTargetCommitSource: REQUEST_BASE_COMMIT_LEGACY_FALLBACK
```

## Guarded Start Eligibility

A request artifact must not be considered guarded-start-ready unless:

```text
targetExecutionCommit exists
targetExecutionCommit is reachable from the current repository
human approval evidence binds to targetExecutionCommit
```

Early local skeletons may support fallback, but future callable guarded start must require explicit `targetExecutionCommit`.

## Current FP-MCP-117 Interpretation

FP-MCP-132 observed:

```text
requestTargetExecutionCommit: 034cfdb
requestTargetCommitSource: REQUEST_BASE_COMMIT_LEGACY_FALLBACK
```

because the FP-MCP-117 request artifact does not explicitly declare:

```text
targetExecutionCommit
```

The FP-MCP-126 approval artifact resolved to:

```text
approvalTargetExecutionCommit: d8684b1
approvalTargetCommitSource: APPROVAL_SCOPE_REPO_COMMIT_LEGACY
```

Therefore the target mismatch observed in FP-MCP-132 is valid:

```text
HUMAN_APPROVAL_EVIDENCE_TARGET_COMMIT_MISMATCH
```

This is not an implementation bug.

It is evidence that future request artifacts need explicit target binding.

## Future Repair Path

To produce a passing target binding test:

1. Create a new request artifact that explicitly declares `targetExecutionCommit`.
2. Create approval evidence bound to the same `targetExecutionCommit`.
3. Run local guarded preflight.
4. Verify target binding passes while execution remains blocked.

Existing request and approval artifacts must not be mutated retroactively.

## Required Reason Codes

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

Current HEAD difference is observation-only unless a future policy explicitly requires evaluation from target commit.

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

FP-MCP-133 successfully defines `targetExecutionCommit` as the explicit request artifact field required for future guarded-start target binding.
