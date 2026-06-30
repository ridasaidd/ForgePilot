# FP-MCP-094 Approval Consumption Evidence Observation

Result: PASSED

Recorded append-only human approval consumption evidence for the committed FP-MCP-092 approval artifact.

The original approval artifact was not mutated.

Execution was not enabled.

The global disable switch was not relaxed.

The runner start endpoint was not contacted.

OpenCode was not started.

## Consumed approval evidence

- approvalPacketId: FP-MCP-092
- approvalId: APPROVAL-20260630T112307543Z-5f55a9ce
- requestId: REQ-20260630T094727908Z-630a4f0d
- modelId: deepseek-v4-pro-high
- runMode: DESIGN_ONLY
- repoCommit: dbeded5
- branch: main

## Consumption recorder result

Tool:

- forgepilot_record_human_approval_consumption

Observed:

- schemaVersion: FP-MCP-071
- boundaryVersion: FP-MCP-071
- approvalConsumptionRecorderEvaluated: true
- approvalConsumptionRecorderDefined: true
- approvalConsumptionRecorded: true
- consumptionArtifactPath: runs/FP-MCP-094/approval-consumptions/CONSUMPTION-20260630T112907770Z-c3970483.json
- consumptionId: CONSUMPTION-20260630T112907770Z-c3970483
- consumptionArtifactSha256: e8d248ac28ddee88db0ac691d238f5d08acf93cbf96622d44c08a8bc54c657fc
- consumptionArtifactAlreadyExists: false

## Approval validation before consumption

Observed:

- approvalValidationEvaluated: true
- approvalEvidenceValid: true
- approvalValid: true
- approvalUsableForExecution: true
- humanApprovalRecorded: true
- approvalValidationReasons: []

## Consumption state

Observed:

- approvalConsumed: true
- approvalMutated: false
- approvalRevoked: false
- approvalQuarantined: false

## Execution safety state

Observed:

- executionAllowedNow: false
- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false
- disableSwitchStatusEvaluated: true
- disableSwitchActive: true
- runnerExecutionEnabled: false
- opencodeExecutionEnabled: false
- effectiveDisableReason: EXECUTION_DISABLED_GLOBAL
- effectiveDisableScope: GLOBAL

Reasons:

- EXECUTION_DISABLED_GLOBAL
- RUNNER_EXECUTION_DISABLED
- OPENCODE_EXECUTION_DISABLED
- DISABLE_SWITCH_ACTIVE
- EXECUTION_NOT_ALLOWED

## Interpretation

The approval consumption path records consumption as append-only evidence.

The original approval artifact remains immutable.

The approval is now consumed by derived evidence.

Consumption evidence alone does not authorize execution.

Execution remains independently blocked by:

- global disable switch
- runner execution disabled
- OpenCode execution disabled
