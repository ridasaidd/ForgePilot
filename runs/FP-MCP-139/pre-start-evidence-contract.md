# FP-MCP-139 — Pre-Start Evidence Contract

## Observation

FP-MCP-139 created fresh non-executing pre-start evidence for the target-bound FP-MCP-134 request.

## Request

```text
packetId: FP-MCP-134
requestId: REQ-20260630T202005438Z-86d20df4
modelId: deepseek-v4-pro-high
runMode: DESIGN_ONLY
targetExecutionCommit: bbf930a
approvedTargetExecutionCommit: bbf930a
```

## Approval

```text
approvalId: APPROVAL-20260630T202924964Z-65d76e90
approvalPath: runs/FP-MCP-135/approvals/APPROVAL-20260630T202924964Z-65d76e90.json
approvalSha256: cb98c076bd0bffbc2b0c6164bf305426b9bb2740e5951904634341ce0785845d
approvalTargetExecutionCommit: bbf930a
approvalRepoCommit: bbf930a
```

## Pre-Start Evidence

```text
path: runs/FP-MCP-134/pre-start-evidence/REQ-20260630T202005438Z-86d20df4.json
sha256: e937542a7c96ab0958eee9ba0f02edc3dfc48cee6c5287021b41ca02bb37c69f
schemaVersion: FP-MCP-050
artifactType: pre-start-evidence
approvalAccepted: true
requestArtifactSha256: 29ab31f1e7db899539bafb8775b5e08ffdd58d6884afe7d001b24ed210283dcb
```

## Safety Boundary

```text
executionPermitted: false
executionStarted: false
opencodeStarted: false
startEndpointContacted: false
runnerStartEndpointContacted: false
runnerRunId: null
approvalConsumed: false
requestArtifactMutated: false
approvalArtifactMutated: false
postStartStateRecorded: false
```

## Binding Rule

The pre-start evidence preserves the target execution commit as the binding value.

```text
request.targetExecutionCommit == bbf930a
request.approvedTargetExecutionCommit == bbf930a
approval.scope.approvedTargetExecutionCommit == bbf930a
approval.scope.repoCommit == bbf930a
```

Current repository HEAD is recorded as observation only and does not replace the target execution commit.
