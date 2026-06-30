# FP-MCP-137 Local Preflight Report

Result: PASSED

Ran local guarded preflight after deriving expected human approval packet scope from the request artifact.

## Implementation

```text
bridgeRepo: forgepilot-chatgpt-mcp
bridgeCommit: e555807
script: scripts/guarded-preflight-report.mjs
```

## Verification Pair

```text
requestPacketId: FP-MCP-134
requestId: REQ-20260630T202005438Z-86d20df4
approvalId: APPROVAL-20260630T202924964Z-65d76e90
targetExecutionCommit: bbf930a
approvedTargetExecutionCommit: bbf930a
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
packetScopeMismatchPresent: False
```

## Target Commit Binding

```text
approvalTargetExecutionCommit: bbf930a
approvalTargetCommitSource: APPROVAL_SCOPE_APPROVED_TARGET_EXECUTION_COMMIT
requestTargetExecutionCommit: bbf930a
requestTargetCommitSource: REQUEST_TARGET_EXECUTION_COMMIT
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

The local preflight no longer treats the approval packet scope as a historical fixed packet id.

Expected packet scope is derived from the request artifact being evaluated.

Target commit binding remains explicit and matched.

## Safety Conclusion

The local preflight did not enable execution, did not contact the runner start endpoint, did not start OpenCode, did not create a runner run id, did not consume approval, and did not mutate request or approval artifacts.
