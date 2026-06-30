# FP-MCP-095 Post-Consumption Preflight Re-Observation

Result: PASSED AS OBSERVATION

Re-observed guarded execution preflight after append-only approval consumption evidence had been recorded.

The consumed approval did not permit execution.

However, preflight did not reach a clean "valid approval but consumed" state. It rejected the approval earlier because the approval evidence was no longer valid for the current preflight context.

## Tool

- forgepilot_validate_execution_preflight

## Input

- packetId: FP-MCP-084
- requestId: REQ-20260630T094727908Z-630a4f0d
- approvalId: APPROVAL-20260630T112307543Z-5f55a9ce

## Preflight result

Observed:

- schemaVersion: FP-MCP-034
- preflightEligible: false
- executionPermitted: false
- executionStarted: false
- runnerContacted: true
- opencodeContacted: false
- startEndpointContacted: false
- opencodeStarted: false
- executionAllowedNow: false
- boundaryVersion: FP-MCP-073
- statusSource: ForgePilot guarded execution preflight validation with disable-switch and consumed approval enforcement

## Gate states

Observed:

- requestArtifact: PASSED
- lifecycle: PASSED
- packet: PASSED
- model: PASSED
- runMode: PASSED
- runnerIdentity: PASSED
- runnerCapability: PASSED
- disableSwitch: BLOCKED
- executionEnablement: FAILED
- humanApprovalEvidence: BLOCKED
- opencodeBoundary: PASSED
- artifactRecording: NOT_EVALUATED
- secretsBoundary: PASSED
- networkExposure: PASSED

## Reasons

Observed:

- EXECUTION_DISABLED_GLOBAL
- EXECUTION_DISABLED
- EXECUTION_PREFLIGHT_HUMAN_APPROVAL_EVIDENCE_GATE_BLOCKED
- HUMAN_APPROVAL_EVIDENCE_NOT_USABLE_FOR_EXECUTION
- HUMAN_APPROVAL_EVIDENCE_INVALID
- APPROVAL_SCOPE_MISMATCH
- APPROVAL_BASE_COMMIT_BINDING_INVALID
- APPROVAL_COMMIT_BINDING_INVALID
- APPROVAL_REQUEST_BINDING_INVALID
- APPROVAL_TEXT_INVALID
- APPROVAL_EXPIRED
- RUNNER_EXECUTION_DISABLED
- OPENCODE_EXECUTION_DISABLED
- DISABLE_SWITCH_ACTIVE
- EXECUTION_NOT_ALLOWED

## Approval evidence state

Observed:

- approvalId: APPROVAL-20260630T112307543Z-5f55a9ce
- approvalPacketId: FP-MCP-092
- approvalPath: runs/FP-MCP-092/approvals/APPROVAL-20260630T112307543Z-5f55a9ce.json
- humanApprovalEvidenceEvaluated: true
- humanApprovalEvidenceGatePassed: false
- humanApprovalEvidenceId: APPROVAL-20260630T112307543Z-5f55a9ce
- humanApprovalEvidencePath: runs/FP-MCP-092/approvals/APPROVAL-20260630T112307543Z-5f55a9ce.json
- humanApprovalEvidenceValid: false
- humanApprovalEvidenceUsableForExecution: false
- approvalValidationEvaluated: true
- approvalEvidenceValid: false
- approvalValid: false
- approvalUsableForExecution: false
- approvalCreated: false
- approvalMutated: false
- humanApprovalRecorded: true

Human approval evidence reasons:

- APPROVAL_SCOPE_MISMATCH
- APPROVAL_BASE_COMMIT_BINDING_INVALID
- APPROVAL_COMMIT_BINDING_INVALID
- APPROVAL_REQUEST_BINDING_INVALID
- APPROVAL_TEXT_INVALID
- APPROVAL_EXPIRED

## Consumption evidence state

Observed:

- consumptionEvidenceEvaluated: true
- consumptionEvidencePresent: true
- consumptionEvidenceValid: false
- consumptionEvidenceId: CONSUMPTION-20260630T112907770Z-c3970483
- consumptionEvidencePath: runs/FP-MCP-094/approval-consumptions/CONSUMPTION-20260630T112907770Z-c3970483.json
- approvalConsumed: false

Interpretation:

Preflight discovered consumption evidence, but did not accept the approval as consumed in this evaluation because the approval evidence itself was invalid for the current preflight context.

## Request and commit state

Observed:

- requestArtifactPath: runs/FP-MCP-084/opencode-requests/REQ-20260630T094727908Z-630a4f0d.json
- requestArtifactSha256: 4653fc81090fe11c9332bbad1e6e062c9d6f928643122a95f5beebae7e239f17
- baseCommit: 0060150
- currentCommit: 0060150
- creationCommit: a413b33
- artifactCommit: f9b5e3d
- modelId: deepseek-v4-pro-high
- runMode: DESIGN_ONLY

The approval under test was originally bound to repoCommit dbeded5 and expired at 2026-06-30T11:30:00.000Z.

Preflight was checked at 2026-06-30T11:30:30.623Z.

This explains the observed commit-binding and expiration blockers.

## Runner state

Observed:

- runnerProtocolVersion: forgepilot-runner-v1
- runnerVersion: 0.1.0-fp-mcp-024
- runnerSupportedOperations:
  - capabilities
  - validate-request
- runnerSupportedRunModes:
  - DESIGN_ONLY
- runnerAllowedModels:
  - deepseek-v4-pro-high
  - qwen-3.7-max
- runnerExecutionEnabled: false
- opencodeExecutionEnabled: false

## Disable switch state

Observed:

- disableSwitchStatusEvaluated: true
- disableSwitchActive: true
- effectiveDisableReason: EXECUTION_DISABLED_GLOBAL
- effectiveDisableScope: GLOBAL

## Safety result

Observed:

- executionPermitted: false
- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false
- executionAllowedNow: false
- runnerExecutionEnabled: false
- opencodeExecutionEnabled: false
- no runner run id created
- no approval mutation observed

## Interpretation

The consumed approval did not authorize execution.

The intended "valid approval but consumed" preflight state was not reached because the approval had already become invalid for the current preflight context.

This is still useful evidence:

- preflight enforces expiration
- preflight enforces commit binding
- preflight enforces scope binding
- preflight does not treat merely-present consumption evidence as valid unless the approval context validates

The next smallest gate is to create a fresh short-lived real approval bound to the current preflight commit, commit it, consume it promptly, and immediately re-observe preflight before expiration.
