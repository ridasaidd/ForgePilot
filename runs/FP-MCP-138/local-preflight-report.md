# FP-MCP-138 Local Preflight Report

Result: PASSED

Ran local guarded preflight after changing server-side commit binding checks from current-commit comparison to target-commit comparison.

## Implementation

```text
bridgeRepo: forgepilot-chatgpt-mcp
bridgeCommit: 232ecc5
patchedFile: src/server.ts
patchedBehavior: approval commit checks bind to targetExecutionCommit / approvedTargetExecutionCommit
safetyGrepNote: existing forgepilot_start_remote_runner_request registration is not new execution behavior
```

## Verification Pair

```text
requestPacketId: FP-MCP-134
requestId: REQ-20260630T202005438Z-86d20df4
approvalId: APPROVAL-20260630T202924964Z-65d76e90
requestTargetExecutionCommit: bbf930a
approvalTargetExecutionCommit: bbf930a
currentRepositoryCommitAtPacketTime: 720e7c6
```

## Gate Shape

```text
gatesType: dict
gateKeys: ['commitBinding', 'disableSwitch', 'evidenceLedgerReadiness', 'humanApprovalEvidence', 'modelAndRunMode', 'opencodeReadiness', 'preStartEvidence', 'repository', 'requestArtifact', 'runnerCapabilityState', 'stateSnapshotEvidence']
rawGatesPresent: True
```

## Human Approval Evidence Gate

```text
evaluated: True
passed: True
state: PASSED
reasons: []
observations: ['HUMAN_APPROVAL_EVIDENCE_CURRENT_EVALUATION_COMMIT_DIFFERENT']
commitMismatchPresent: False
packetScopeMismatchPresent: False
```

## Target Commit Binding

```text
approvalTargetExecutionCommit: bbf930a
approvalTargetCommitSource: APPROVAL_SCOPE_APPROVED_TARGET_EXECUTION_COMMIT
requestTargetExecutionCommit: bbf930a
requestTargetCommitSource: REQUEST_TARGET_EXECUTION_COMMIT
currentEvaluationCommit: 720e7c6
currentEvaluationCommitDifferentFromApprovalTarget: True
```

## Evidence Ledger Readiness

```text
evaluated: True
passed: False
state: DEFERRED
reasons: ['PRESTARTEVIDENCE_NOT_READY', 'STATESNAPSHOTEVIDENCE_NOT_READY']
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

The server-side approval evaluator no longer treats current repository HEAD as the approval commit target.

For targeted execution requests, approval evidence is compared against:

```text
request.targetExecutionCommit
approval.scope.approvedTargetExecutionCommit
approval.scope.repoCommit compatibility field
```

If `humanApprovalEvidence` still fails, the remaining reasons are recorded above and should be handled separately without mutating existing evidence.

## Safety Conclusion

The local preflight did not enable execution, did not contact the runner start endpoint, did not start OpenCode, did not create a runner run id, did not consume approval, and did not mutate request or approval artifacts.
