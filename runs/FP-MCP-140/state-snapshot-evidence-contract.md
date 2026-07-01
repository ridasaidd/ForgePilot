# FP-MCP-140 — State Snapshot Evidence Contract

## Observation

FP-MCP-140 created fresh non-executing start-state snapshot evidence for the target-bound FP-MCP-134 request.

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
```

## State Snapshot Evidence

```text
snapshotRoot: runs/FP-MCP-134/start-state-snapshots/REQ-20260630T202005438Z-86d20df4
attemptId: ATTEMPT-FP-MCP-140-NONEXECUTING
preStartStatePath: runs/FP-MCP-134/start-state-snapshots/REQ-20260630T202005438Z-86d20df4/ATTEMPT-FP-MCP-140-NONEXECUTING/pre-start-state.json
preStartStateSha256: 427452ce13ad612a295e77e6a1f1b0cda35f24107d432ea7c14af3ec6f870b60
postStartStatePath: runs/FP-MCP-134/start-state-snapshots/REQ-20260630T202005438Z-86d20df4/ATTEMPT-FP-MCP-140-NONEXECUTING/post-start-state.json
postStartStateSha256: f8ab5953eee9b14f42376350252a757c4eae86ec6640a7def322402088709491
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
```

## Binding Rule

The state snapshot evidence preserves the target execution commit as the binding value.

```text
request.targetExecutionCommit == bbf930a
request.approvedTargetExecutionCommit == bbf930a
approval.scope.approvedTargetExecutionCommit == bbf930a
approval.scope.repoCommit == bbf930a
preStartEvidence.targetExecutionCommit == bbf930a
```

Current repository HEAD is recorded as observation only and does not replace the target execution commit.

## FP-MCP-140 Observation Outcome

The state snapshot evidence was created and the `stateSnapshotEvidence` gate passed.

The full guarded preflight did not become eligible because the existing FP-MCP-135 approval expired before this observation.

```text
humanApprovalEvidenceState: FAILED
humanApprovalEvidencePassed: false
humanApprovalEvidenceReason: HUMAN_APPROVAL_EVIDENCE_EXPIRED
```

This is not a packet-scope regression.

This is not a target-commit regression.

The expired approval artifact must not be mutated. A future packet should create fresh target-bound approval evidence if the pipeline needs to continue past the human approval gate.
