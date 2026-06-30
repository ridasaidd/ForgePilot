# FP-MCP-135 Local Preflight Report

Result: PASSED

Ran local guarded preflight against the FP-MCP-134 targeted request and FP-MCP-135 matching approval evidence.

## Request

```text
packetId: FP-MCP-134
requestId: REQ-20260630T202005438Z-86d20df4
targetExecutionCommit: bbf930a
```

## Approval

```text
approvalId: APPROVAL-20260630T202924964Z-65d76e90
approvalPath: runs/FP-MCP-135/approvals/APPROVAL-20260630T202924964Z-65d76e90.json
approvalSha256: cb98c076bd0bffbc2b0c6164bf305426b9bb2740e5951904634341ce0785845d
approvedTargetExecutionCommit: bbf930a
```

## Raw Report

```text
path: runs/FP-MCP-135/local-preflight-report.json
gatesShape: list
```

## Human Approval Evidence Gate

```text
evaluated: True
passed: False
state: FAILED
reasons: ['HUMAN_APPROVAL_EVIDENCE_PACKET_SCOPE_MISMATCH']
observations: ['HUMAN_APPROVAL_EVIDENCE_CURRENT_EVALUATION_COMMIT_DIFFERENT']
evidencePath: runs/FP-MCP-135/approvals/APPROVAL-20260630T202924964Z-65d76e90.json
evidenceSha256: cb98c076bd0bffbc2b0c6164bf305426b9bb2740e5951904634341ce0785845d
```

## Target Commit Binding

```text
approvalTargetExecutionCommit: bbf930a
approvalTargetCommitSource: APPROVAL_SCOPE_APPROVED_TARGET_EXECUTION_COMMIT
requestTargetExecutionCommit: bbf930a
requestTargetCommitSource: REQUEST_TARGET_EXECUTION_COMMIT
currentEvaluationCommit: fc8d97c
currentEvaluationCommitDifferentFromApprovalTarget: True
```

## Evidence Ledger Readiness

```text
evaluated: True
passed: False
state: DEFERRED
reasons: ['PRESTARTEVIDENCE_NOT_READY', 'STATESNAPSHOTEVIDENCE_NOT_READY', 'HUMANAPPROVALEVIDENCE_NOT_READY']
```

## Remaining Blocking Gates

```text
disableSwitch: FAILED
runnerCapabilityState: FAILED
opencodeReadiness: FAILED
```

## Top-Level Safety Fields

```text
eligibleForFutureGuardedStart: False
executionPermitted: False
executionStarted: False
opencodeStarted: False
runnerStartEndpointContacted: False
startEndpointContacted: False
runnerRunId: None
approvalConsumed: False
requestArtifactMutated: False
approvalArtifactMutated: False
```

## Interpretation

The primary FP-MCP-135 result is the target commit binding check:

```text
approvalTargetExecutionCommit == requestTargetExecutionCommit == bbf930a
```

That means the explicit request target commit from FP-MCP-134 and the matching approval target commit from FP-MCP-135 were aligned.

The report may still remain globally ineligible for guarded start because execution gates remain disabled.

## Safety Conclusion

The local preflight did not enable execution, did not contact the runner start endpoint, did not start OpenCode, did not create a runner run id, did not consume approval, and did not mutate the approval or request artifacts.
