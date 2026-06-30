# FP-MCP-138 Human Approval Gate Contract

Result: PASSED

## Decision

Human approval evidence must be bound to the request target execution commit.

It must not be invalidated merely because the repository HEAD has advanced after the request and approval artifacts were recorded.

## Required Binding

For targeted request artifacts:

```text
approval.scope.packetId == request.packetId
approval.scope.requestId == request.requestId
approval.scope.modelId == request.requestedModelId or request.modelId
approval.scope.runMode == request.requestedRunMode or request.runMode
approval.scope.approvedTargetExecutionCommit == request.targetExecutionCommit
approval.scope.repoCommit == request.targetExecutionCommit
request.approvedTargetExecutionCommit == request.targetExecutionCommit
```

## Current Commit Drift

Current repository commit drift is observation-only.

It must not produce:

```text
HUMAN_APPROVAL_EVIDENCE_COMMIT_MISMATCH
```

unless the approval target differs from the request target.

## Separate Contract Observation

A separate approval artifact validator may enforce newer approval evidence contract fields.

Those checks are distinct from target commit binding and must not be collapsed into current HEAD mismatch.

## Non-Execution Boundary

This packet did not enable execution, contact the runner start endpoint, start OpenCode, consume approval, or mutate request/approval artifacts.
