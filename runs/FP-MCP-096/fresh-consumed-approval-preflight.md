# FP-MCP-096 Fresh Consumed Approval Preflight Isolation

Result: PASSED AS OBSERVATION

Created a fresh approval, committed it, validated it, consumed it, committed consumption evidence, and re-observed preflight before expiration.

The consumed approval did not permit execution.

However, this packet still did not isolate the consumed-approval gate because committing approval and consumption evidence advanced repository HEAD. Preflight then evaluated against a different current commit than the approval was bound to.

## Fresh approval creation

Created approval:

- approvalPacketId: FP-MCP-096
- approvalId: APPROVAL-20260630T113219604Z-caa515d9
- approvalPath: runs/FP-MCP-096/approvals/APPROVAL-20260630T113219604Z-caa515d9.json
- approvalArtifactSha256: aba4288259c5b54247234051b1773931a84cd10bf300350e388e4b4ab6dae02a
- repoCommit: 27c8a34
- branch: main
- expiresAt: 2026-06-30T11:40:00.000Z

Creation safety:

- approvalCreated: true
- approvalMutated: false
- approvalConsumed: false
- executionAllowedNow: false
- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false
- disableSwitchActive: true
- runnerExecutionEnabled: false
- opencodeExecutionEnabled: false

## Fresh approval validation before consumption

The committed fresh approval validated before consumption.

Observed:

- approvalEvidenceValid: true
- approvalValid: true
- approvalUsableForExecution: true
- approvalConsumed: false
- artifactCommitted: true
- reasons: []

## Append-only consumption evidence

Recorded consumption evidence:

- consumptionId: CONSUMPTION-20260630T113305630Z-b6992ea2
- consumptionArtifactPath: runs/FP-MCP-096/approval-consumptions/CONSUMPTION-20260630T113305630Z-b6992ea2.json
- consumptionArtifactSha256: ecf7f6e64b6597647279fb3b007e90638934e86c670e439cc02e869170a67d8c

Consumption recorder observed:

- approvalConsumptionRecorded: true
- approvalEvidenceValid: true
- approvalValid: true
- approvalUsableForExecution: true
- humanApprovalRecorded: true
- approvalConsumed: true
- approvalMutated: false
- approvalRevoked: false
- approvalQuarantined: false
- executionAllowedNow: false
- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false

## Post-consumption preflight

Tool:

- forgepilot_validate_execution_preflight

Input:

- packetId: FP-MCP-084
- requestId: REQ-20260630T094727908Z-630a4f0d
- approvalId: APPROVAL-20260630T113219604Z-caa515d9

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
- checkedAt: 2026-06-30T11:33:57.752Z

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

## Preflight reasons

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
- RUNNER_EXECUTION_DISABLED
- OPENCODE_EXECUTION_DISABLED
- DISABLE_SWITCH_ACTIVE
- EXECUTION_NOT_ALLOWED

Notably absent:

- APPROVAL_EXPIRED

## Approval evidence state inside preflight

Observed:

- approvalId: APPROVAL-20260630T113219604Z-caa515d9
- approvalPacketId: FP-MCP-096
- approvalPath: runs/FP-MCP-096/approvals/APPROVAL-20260630T113219604Z-caa515d9.json
- humanApprovalEvidenceEvaluated: true
- humanApprovalEvidenceGatePassed: false
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

## Consumption evidence state inside preflight

Observed:

- consumptionEvidenceEvaluated: true
- consumptionEvidencePresent: true
- consumptionEvidenceValid: false
- consumptionEvidenceId: CONSUMPTION-20260630T113305630Z-b6992ea2
- consumptionEvidencePath: runs/FP-MCP-096/approval-consumptions/CONSUMPTION-20260630T113305630Z-b6992ea2.json
- approvalConsumed: false

Interpretation:

Preflight discovered the consumption evidence but did not accept it as valid consumption evidence because the approval was invalid in the preflight context.

## Request and commit state

Observed:

- requestArtifactPath: runs/FP-MCP-084/opencode-requests/REQ-20260630T094727908Z-630a4f0d.json
- requestArtifactSha256: 4653fc81090fe11c9332bbad1e6e062c9d6f928643122a95f5beebae7e239f17
- baseCommit: 6a77424
- currentCommit: 6a77424
- creationCommit: a413b33
- artifactCommit: f9b5e3d
- modelId: deepseek-v4-pro-high
- runMode: DESIGN_ONLY

The fresh approval was bound to repoCommit 27c8a34.

The post-consumption preflight evaluated current commit 6a77424.

This explains the commit-binding and scope blockers.

## Safety result

Observed:

- executionPermitted: false
- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false
- executionAllowedNow: false
- disableSwitchActive: true
- runnerExecutionEnabled: false
- opencodeExecutionEnabled: false
- no runner run id created
- no approval artifact mutation observed

## Interpretation

FP-MCP-096 successfully removed the expiration problem from FP-MCP-095.

It did not isolate the consumed-approval gate because evidence recording commits advance HEAD, and preflight currently binds approval validity to the current repository commit.

This reveals an important design issue:

A commit-bound approval becomes invalid if the act of committing approval/consumption evidence changes the same repository HEAD used by preflight.

The next smallest gate is not another fresh approval attempt. The next smallest gate is to define the commit-binding model for approval evidence versus evidence-recording commits.
