# FP-MCP-027 Executor Result

## Packet

FP-MCP-027 — Fresh Request Remote Validation

## Result

```text
BLOCKED_BY_LIFECYCLE_CONTRADICTION
```

## Summary

FP-MCP-027 successfully exposed the first real request-artifact lifecycle contradiction.

A fresh request artifact can be created at a clean commit, but committing that artifact necessarily advances `HEAD`.

The current validator requires:

```text
workingTreeClean: true
baseCommitMatches: true
```

For a newly committed request artifact, these two requirements cannot both be satisfied under the current schema.

## Observed Sequence

A fresh request artifact was created correctly.

The request artifact was then committed correctly.

After commit, validation failed because the request artifact's recorded base commit referred to the commit at which it was created, while current `HEAD` had advanced to the artifact-admission commit.

## Observed Local Validation Result

```text
eligible: false
workingTreeClean: true
requestArtifactValid: true
modelAllowed: true
runModeAllowed: true
safeArtifactDir: true
baseCommitMatches: false
currentCommit: 2ae7666
requestBaseCommit: 10b92ae
reasons: ["BASE_COMMIT_MISMATCH"]
```

## Observed Remote Runner Endpoint Validation Result

```text
valid: false
runnerConfigured: true
runnerContacted: false
runnerAccepted: false
executionEnabled: false
executionStarted: false
baseCommitMatches: false
reasons: ["BASE_COMMIT_MISMATCH"]
```

The remote runner was not contacted because local pre-validation failed first.

## Lifecycle Contradiction

The current request lifecycle requires a request artifact to be:

1. created from a clean repository commit
2. committed into the repository
3. later validated against current `HEAD`

But committing the request artifact changes `HEAD`.

Therefore a request artifact created at commit `A` and admitted at commit `B` will naturally contain:

```text
requestBaseCommit: A
currentCommit: B
```

Under strict equality:

```text
requestBaseCommit == currentCommit
```

the request can never pass validation after being committed.

## Important Conclusion

FP-MCP-027 did not fail because of bad runner wiring.

FP-MCP-027 did not fail because of dirty working tree.

FP-MCP-027 did not fail because of bad model or run mode.

FP-MCP-027 did not fail because of unsafe artifact paths.

FP-MCP-027 failed because the current validation lifecycle collapses two different commits into one field:

```text
creation commit
artifact admission commit
```

## Guarded Start Tool

The guarded start tool was intentionally not tested as an execution-boundary success case.

Reason:

```text
local pre-validation failed
```

Testing start after known failed validation would add no useful evidence and could confuse the lifecycle finding.

## Candidate Fixes

### Option A

Allow committed request artifacts when `requestBaseCommit` is an ancestor or parent of current `HEAD`.

### Option B

Add separate lifecycle fields:

```text
creationCommit
artifactCommit
```

Then validation can separately check:

```text
request created from clean commit: true
artifact admitted in current history: true
artifact immutable since creation: true
working tree clean: true
```

### Option C

Allow validation to ignore the request artifact's own uncommitted presence when checking working tree cleanliness.

## Recommendation

Option B is the cleanest ForgePilot evidence model.

It separates:

```text
creationCommit
artifactCommit
```

This avoids retroactively changing trust and preserves an explicit observation chain.

## Scope Confirmation

FP-MCP-027 did not:

* start OpenCode
* invoke OpenCode CLI
* invoke OpenCode API
* execute shell through the runner
* expose the runner publicly
* enable runner execution
* produce a successful start
* treat runner reachability as execution authority

## Final Status

```text
BLOCKED
```

Reason:

```text
REQUEST_ARTIFACT_COMMIT_LIFECYCLE_CONTRADICTION
```

Follow-up required:

```text
FP-MCP-028 — Request Artifact Commit Lifecycle Fix
```

