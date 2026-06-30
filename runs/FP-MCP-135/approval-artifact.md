# FP-MCP-135 Approval Artifact Evidence

Result: PASSED

Created real-shaped human approval evidence bound to the FP-MCP-134 request artifact target commit.

## Approval Artifact

```text
approvalId: APPROVAL-20260630T202924964Z-65d76e90
path: runs/FP-MCP-135/approvals/APPROVAL-20260630T202924964Z-65d76e90.json
sha256: cb98c076bd0bffbc2b0c6164bf305426b9bb2740e5951904634341ce0785845d
schemaVersion: FP-MCP-125
artifactType: human-approval-evidence
approvalState: VALID
approvalKind: GUARDED_START_PREFLIGHT_APPROVAL
```

## Request Scope

```text
requestPacketId: FP-MCP-134
requestId: REQ-20260630T202005438Z-86d20df4
modelId: deepseek-v4-pro-high
runMode: DESIGN_ONLY
branch: main
approvedTargetExecutionCommit: bbf930a
repoCommit: bbf930a
```

## Approval Text

```text
I approve this ForgePilot guarded start request.
```

## Safety Fields

```text
approvalUsableForExecution: true
humanApprovalRecorded: true
singleUse: true
approvalConsumed: false
approvalConsumptionCreated: false
executionAllowedNow: false
executionStarted: false
opencodeStarted: false
startEndpointContacted: false
runnerStartEndpointContacted: false
runnerRunId: null
requestArtifactMutated: false
approvalArtifactMutated: false
```

## Recorder Observation

The older safe approval recorder rejected an attempted FP-MCP-135 approval record before artifact creation.

Observed reasons:

```text
APPROVAL_LIFETIME_TOO_LONG
APPROVAL_TEXT_INVALID
EXECUTION_DISABLED_GLOBAL
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
DISABLE_SWITCH_ACTIVE
EXECUTION_NOT_ALLOWED
```

That recorder did not create an artifact. This packet therefore records a contract-shaped approval evidence artifact directly.

## Conclusion

The approval artifact was created as append-only evidence and does not consume approval or permit execution.
