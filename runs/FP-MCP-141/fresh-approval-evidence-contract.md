# FP-MCP-141 — Fresh Target-Bound Approval Evidence Contract

## Observation

FP-MCP-141 created fresh human approval evidence for the existing target-bound FP-MCP-134 request.

## Request

```text
packetId: FP-MCP-134
requestId: REQ-20260630T202005438Z-86d20df4
modelId: deepseek-v4-pro-high
runMode: DESIGN_ONLY
targetExecutionCommit: bbf930a
approvedTargetExecutionCommit: bbf930a
requestArtifactPath: runs/FP-MCP-134/opencode-requests/REQ-20260630T202005438Z-86d20df4.json
requestArtifactSha256: 29ab31f1e7db899539bafb8775b5e08ffdd58d6884afe7d001b24ed210283dcb
```

## Expired Prior Approval

```text
approvalId: APPROVAL-20260630T202924964Z-65d76e90
path: runs/FP-MCP-135/approvals/APPROVAL-20260630T202924964Z-65d76e90.json
sha256Before: cb98c076bd0bffbc2b0c6164bf305426b9bb2740e5951904634341ce0785845d
sha256After: cb98c076bd0bffbc2b0c6164bf305426b9bb2740e5951904634341ce0785845d
mutated: false
observedReason: HUMAN_APPROVAL_EVIDENCE_EXPIRED
```

## Fresh Approval

```text
approvalId: APPROVAL-20260701T091652051Z-620f9f99
path: runs/FP-MCP-141/approvals/APPROVAL-20260701T091652051Z-620f9f99.json
sha256: 2c1ecba0003786e517e2b40d3c687a8d4e676e4fdb8fcbd7a213d564c0329102
schemaVersion: FP-MCP-125
artifactType: human-approval-evidence
approvalState: VALID
approvalUsableForExecution: true
humanApprovalRecorded: true
approvalConsumed: false
consumedAt: null
expiresAt: 2026-07-01T10:01:52Z
```

## Scope Binding

```text
scope.packetId: FP-MCP-134
scope.requestId: REQ-20260630T202005438Z-86d20df4
scope.modelId: deepseek-v4-pro-high
scope.runMode: DESIGN_ONLY
scope.branch: main
scope.repoCommit: bbf930a
scope.approvedTargetExecutionCommit: bbf930a
```

## Prerequisite Evidence

```text
preStartEvidencePath: runs/FP-MCP-134/pre-start-evidence/REQ-20260630T202005438Z-86d20df4.json
preStartEvidenceSha256: e937542a7c96ab0958eee9ba0f02edc3dfc48cee6c5287021b41ca02bb37c69f
preStartStateSnapshotPath: runs/FP-MCP-134/start-state-snapshots/REQ-20260630T202005438Z-86d20df4/ATTEMPT-FP-MCP-140-NONEXECUTING/pre-start-state.json
preStartStateSnapshotSha256: 427452ce13ad612a295e77e6a1f1b0cda35f24107d432ea7c14af3ec6f870b60
postStartStateSnapshotPath: runs/FP-MCP-134/start-state-snapshots/REQ-20260630T202005438Z-86d20df4/ATTEMPT-FP-MCP-140-NONEXECUTING/post-start-state.json
postStartStateSnapshotSha256: f8ab5953eee9b14f42376350252a757c4eae86ec6640a7def322402088709491
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
preStartEvidenceMutated: false
stateSnapshotEvidenceMutated: false
```

## Binding Rule

The fresh approval evidence preserves the target execution commit as the binding value.

```text
request.targetExecutionCommit == bbf930a
request.approvedTargetExecutionCommit == bbf930a
freshApproval.scope.approvedTargetExecutionCommit == bbf930a
freshApproval.scope.repoCommit == bbf930a
```

Current repository HEAD is recorded as observation only and does not replace the target execution commit.
