# FP-MCP-136 Local Preflight Report

Result: PASSED

Ran local guarded preflight after normalizing gate shape.

## Implementation

```text
bridgeRepo: forgepilot-chatgpt-mcp
bridgeCommit: 8228eb9
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
gatesIsArray: False
gateKeys: ['commitBinding', 'disableSwitch', 'evidenceLedgerReadiness', 'humanApprovalEvidence', 'modelAndRunMode', 'opencodeReadiness', 'preStartEvidence', 'repository', 'requestArtifact', 'runnerCapabilityState', 'stateSnapshotEvidence']
rawGatesPresent: True
```

## Human Approval Evidence Gate

```text
evaluated: True
passed: False
state: FAILED
reasons: ['HUMAN_APPROVAL_EVIDENCE_PACKET_SCOPE_MISMATCH']
observations: ['HUMAN_APPROVAL_EVIDENCE_CURRENT_EVALUATION_COMMIT_DIFFERENT']
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

The local preflight report now exposes `gates` as an object rather than a list.

This stabilizes downstream evidence parsing while preserving raw gate evidence when applicable.

## Safety Conclusion

The local preflight did not enable execution, did not contact the runner start endpoint, did not start OpenCode, did not create a runner run id, did not consume approval, and did not mutate request or approval artifacts.
