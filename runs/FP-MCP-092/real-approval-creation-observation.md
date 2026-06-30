# FP-MCP-092 Real Approval Creation Observation

Result: PASSED

Created and validated one scoped real human approval evidence artifact without consuming approval, enabling execution, relaxing the disable switch, contacting the runner start endpoint, or starting OpenCode.

## Initial rejected creation attempt

The first creation attempt was rejected before creating approval evidence.

Observed:

- realHumanApprovalEvidenceRecorded: false
- humanApprovalRecorded: false
- approvalArtifactPath: null
- approvalId: null
- approvalCreated: false
- approvalMutated: false
- approvalConsumed: false
- executionAllowedNow: false
- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false

Rejected reasons:

- APPROVAL_LIFETIME_TOO_LONG
- APPROVAL_TEXT_INVALID
- EXECUTION_DISABLED_GLOBAL
- RUNNER_EXECUTION_DISABLED
- OPENCODE_EXECUTION_DISABLED
- DISABLE_SWITCH_ACTIVE
- EXECUTION_NOT_ALLOWED

Interpretation:

The recorder enforced canonical approval text and approval lifetime before creating any artifact.

## Corrected real approval creation

Tool:

- forgepilot_record_real_human_approval_evidence

Input:

- packetId: FP-MCP-092
- requestId: REQ-20260630T094727908Z-630a4f0d
- modelId: deepseek-v4-pro-high
- runMode: DESIGN_ONLY
- repoCommit: dbeded5
- branch: main
- operatorId: operator-local-rida
- operatorHandle: rida
- expiresAt: 2026-06-30T11:30:00.000Z
- approval: RECORD_REAL_HUMAN_APPROVAL_EVIDENCE

Canonical approval text:

`I approve one guarded ForgePilot remote-runner start attempt for packet FP-MCP-036, request REQ-20260630T094727908Z-630a4f0d, model deepseek-v4-pro-high, run mode DESIGN_ONLY, repository commit dbeded5, branch main. This approval is single-use, expires at 2026-06-30T11:30:00.000Z, and does not override the global disable switch or any other ForgePilot safety gate.`

Observed:

- schemaVersion: FP-MCP-067
- boundaryVersion: FP-MCP-067
- approvalRecorderEvaluated: true
- realHumanApprovalEvidenceRecorderDefined: true
- realHumanApprovalEvidenceRecorded: true
- humanApprovalRecorded: true
- approvalArtifactPath: runs/FP-MCP-092/approvals/APPROVAL-20260630T112307543Z-5f55a9ce.json
- approvalId: APPROVAL-20260630T112307543Z-5f55a9ce
- approvalArtifactSha256: d2a88ef7dafbcfed7dbbbd2322cb5e7002ad9dcec885bf10c868388192a4b8de
- approvalArtifactAlreadyExists: false
- approvalCreated: true
- approvalMutated: false
- approvalUsableForExecution: false
- approvalUsabilityDerivedByRecorder: false
- approvalUsabilityRequiresValidation: true
- approvalConsumed: false
- approvalRevoked: false
- approvalQuarantined: false

## Execution safety state after creation

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

## Real approval validation

Tool:

- forgepilot_validate_human_approval_record

Input:

- packetId: FP-MCP-092
- approvalId: APPROVAL-20260630T112307543Z-5f55a9ce
- expected packetId: FP-MCP-036
- expected requestId: REQ-20260630T094727908Z-630a4f0d
- expected modelId: deepseek-v4-pro-high
- expected runMode: DESIGN_ONLY
- expected repoCommit: dbeded5
- expected branch: main

Observed:

- schemaVersion: FP-MCP-072
- validatorBoundaryVersion: FP-MCP-072
- approvalEvidenceContractVersion: FP-MCP-066
- approvalValidationEvaluated: true
- approvalEvidenceValid: false
- approvalValid: false
- approvalUsableForExecution: false
- approvalCreated: false
- approvalMutated: false
- humanApprovalRecorded: true
- approvalConsumed: false
- consumptionEvidenceEvaluated: true
- consumptionEvidencePresent: false
- consumptionEvidenceValid: false
- executionAllowedNow: false
- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false
- approvalPath: runs/FP-MCP-092/approvals/APPROVAL-20260630T112307543Z-5f55a9ce.json

## Validation checks

Observed:

- pathSafe: true
- approvalIdFormatValid: true
- artifactExists: true
- jsonValid: true
- approvalEvidenceSchemaValid: true
- approvalEvidenceTypeValid: true
- schemaVersionValid: true
- artifactTypeValid: true
- approvalIdValid: true
- approvalStateValid: true
- approvalKindValid: true
- approvedActionValid: true
- scopePresent: true
- scopeExact: true
- scopeMatchesExpected: true
- packetBindingValid: true
- requestBindingValid: true
- modelBindingValid: true
- runModeBindingValid: true
- baseCommitBindingValid: true
- branchBindingValid: true
- canonicalApprovalTextPresent: true
- canonicalApprovalTextValid: true
- approvalTextPresent: true
- preconditionsPresent: true
- preconditionsValid: true
- createdAtValid: true
- expiresAtValid: true
- approvalLifetimeValid: true
- expirationValid: true
- singleUseValid: true
- notRevoked: true
- notConsumed: true
- notQuarantined: true
- commitBindingValid: true
- secretBoundaryValid: true
- artifactCommitted: false

Validation reasons:

- APPROVAL_EVIDENCE_ARTIFACT_UNCOMMITTED
- APPROVAL_ARTIFACT_UNCOMMITTED

## Interpretation

The real approval evidence creation path works.

The recorder enforces canonical text and bounded lifetime before creating evidence.

The validator confirms that the created artifact satisfies the real approval evidence contract except for committed-artifact status.

The approval remains unconsumed and not usable for execution until committed and revalidated.

Execution remains blocked by independent gates:

- global disable switch active
- runner execution disabled
- OpenCode execution disabled
