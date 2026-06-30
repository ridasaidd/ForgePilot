# FP-MCP-132 Local Preflight Report

Result: PASSED

Ran the local guarded preflight report after implementing FP-MCP-131 target commit binding semantics.

## Packet

- FP-MCP-132 — Local Preflight Target Commit Binding Implementation

## Raw Report

- `runs/FP-MCP-132/local-preflight-report.json`

## Human Approval Evidence Gate

```text
evaluated: true
passed: false
state: FAILED
reasons: ['HUMAN_APPROVAL_EVIDENCE_EXPIRED', 'HUMAN_APPROVAL_EVIDENCE_TARGET_COMMIT_MISMATCH']
observations: ['HUMAN_APPROVAL_EVIDENCE_CURRENT_EVALUATION_COMMIT_DIFFERENT']
evidencePath: runs/FP-MCP-126/approvals/APPROVAL-20260630T175528922Z-806b81c3.json
evidenceSha256: 482e7c13c3fda729bab0eada110b41199dc576be8a7b4112324f1ae4220a1fdb
```

## Target Commit Binding

```text
approvalTargetExecutionCommit: d8684b1
approvalTargetCommitSource: APPROVAL_SCOPE_REPO_COMMIT_LEGACY
requestTargetExecutionCommit: 034cfdb
requestTargetCommitSource: REQUEST_BASE_COMMIT_LEGACY_FALLBACK
currentEvaluationCommit: 0612f3a
currentEvaluationCommitDifferentFromApprovalTarget: true
```

## Reason Code Check

```text
HUMAN_APPROVAL_EVIDENCE_COMMIT_MISMATCH present: False
HUMAN_APPROVAL_EVIDENCE_TARGET_COMMIT_MISMATCH present: True
HUMAN_APPROVAL_EVIDENCE_CURRENT_EVALUATION_COMMIT_DIFFERENT observation present: True
HUMAN_APPROVAL_EVIDENCE_EXPIRED present: True
```

## Evidence Ledger Readiness

```text
evaluated: true
passed: false
state: DEFERRED
reasons: ['HUMANAPPROVALEVIDENCE_NOT_READY']
```

## Remaining Blocking Gates

```text
disableSwitch: FAILED
runnerCapabilityState: FAILED
opencodeReadiness: FAILED
```

## Top-Level Safety Fields

```text
eligibleForFutureGuardedStart: false
executionPermitted: false
executionStarted: false
opencodeStarted: false
runnerStartEndpointContacted: false
startEndpointContacted: false
runnerRunId: null
approvalConsumed: false
requestArtifactMutated: false
approvalArtifactMutated: false
```

## Observation

Current evaluation commit drift is now recorded as an observation, not as the ambiguous failure reason `HUMAN_APPROVAL_EVIDENCE_COMMIT_MISMATCH`.

Expiration remains independently evaluated and may still fail the approval evidence gate.

## Safety Conclusion

The local preflight did not enable execution, did not contact the runner start endpoint, did not start OpenCode, did not create a runner run id, did not consume approval, and did not mutate the approval or request artifacts.
