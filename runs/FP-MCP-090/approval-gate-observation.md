# FP-MCP-090 Approval Evidence Gate Observation

Result: PASSED

Observed the human approval evidence gate using non-authorizing dry-run approval fixture tooling.

No real approval evidence was created.

No approval was consumed.

No execution was authorized or started.

## Dry-run fixture recording

Tool:

- forgepilot_record_human_approval_evidence_dry_run_fixture

Input:

- packetId: FP-MCP-090
- requestId: REQ-20260630T094727908Z-630a4f0d
- modelId: deepseek-v4-pro-high
- runMode: DESIGN_ONLY
- repoCommit: acda56d
- branch: main

Observed:

- schemaVersion: FP-MCP-063
- fixtureRecorderEvaluated: true
- dryRunFixtureRecorded: true
- dryRunFixturePath: runs/FP-MCP-090/approvals/APPROVAL-20260630T111656360Z-1eafb0e9.json
- dryRunFixtureApprovalId: APPROVAL-20260630T111656360Z-1eafb0e9
- dryRunFixtureSha256: 882b433ed29f90d76d4440f89ecf78cb6eae9554789bc83bdfcdecc5cea41561
- dryRunFixtureAlreadyExists: false
- dryRunFixtureValidated: true

## Dry-run fixture execution safety

Observed:

- approvalEvidenceValid: false
- approvalValid: false
- approvalUsableForExecution: false
- approvalCreated: false
- approvalMutated: false
- humanApprovalRecorded: false
- executionAllowedNow: false
- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false
- disableSwitchActive: true
- runnerExecutionEnabled: false
- opencodeExecutionEnabled: false
- effectiveDisableReason: EXECUTION_DISABLED_GLOBAL
- effectiveDisableScope: GLOBAL

## Dry-run fixture recording reasons

Observed:

- EXECUTION_DISABLED_GLOBAL
- RUNNER_EXECUTION_DISABLED
- OPENCODE_EXECUTION_DISABLED
- DISABLE_SWITCH_ACTIVE
- EXECUTION_NOT_ALLOWED
- APPROVAL_EVIDENCE_TYPE_INVALID
- APPROVAL_ARTIFACT_TYPE_INVALID
- APPROVAL_STATE_NOT_RECORDED
- APPROVAL_QUARANTINED
- APPROVAL_EVIDENCE_ARTIFACT_UNCOMMITTED
- APPROVAL_ARTIFACT_UNCOMMITTED

## Human approval validation

Tool:

- forgepilot_validate_human_approval_record

Input:

- packetId: FP-MCP-090
- approvalId: APPROVAL-20260630T111656360Z-1eafb0e9
- expected requestId: REQ-20260630T094727908Z-630a4f0d
- expected modelId: deepseek-v4-pro-high
- expected runMode: DESIGN_ONLY
- expected repoCommit: acda56d
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
- humanApprovalRecorded: false
- approvalConsumed: false
- consumptionEvidenceEvaluated: true
- consumptionEvidencePresent: false
- consumptionEvidenceValid: false
- executionAllowedNow: false
- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false
- approvalPath: runs/FP-MCP-090/approvals/APPROVAL-20260630T111656360Z-1eafb0e9.json

## Validation checks

Observed:

- pathSafe: true
- approvalIdFormatValid: true
- artifactExists: true
- jsonValid: true
- approvalEvidenceSchemaValid: true
- approvalEvidenceTypeValid: false
- schemaVersionValid: true
- artifactTypeValid: false
- approvalIdValid: true
- approvalStateValid: true
- approvalKindValid: true
- approvedActionValid: true
- scopePresent: true
- scopeExact: false
- scopeMatchesExpected: false
- packetBindingValid: false
- requestBindingValid: false
- modelBindingValid: true
- runModeBindingValid: true
- baseCommitBindingValid: true
- branchBindingValid: true
- canonicalApprovalTextPresent: true
- canonicalApprovalTextValid: false
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
- notQuarantined: false
- commitBindingValid: true
- secretBoundaryValid: true
- artifactCommitted: false

## Validation reasons

Observed:

- APPROVAL_EVIDENCE_TYPE_INVALID
- APPROVAL_ARTIFACT_TYPE_INVALID
- APPROVAL_STATE_NOT_RECORDED
- APPROVAL_SCOPE_MISMATCH
- APPROVAL_REQUEST_BINDING_INVALID
- APPROVAL_TEXT_INVALID
- APPROVAL_QUARANTINED
- APPROVAL_EVIDENCE_ARTIFACT_UNCOMMITTED
- APPROVAL_ARTIFACT_UNCOMMITTED

## Interpretation

The non-authorizing approval fixture path works as a safe observation mechanism.

The fixture is intentionally not usable for execution.

The validator correctly distinguishes approval-shaped dry-run evidence from real execution approval.

The next smallest gate is to define or observe real approval evidence requirements without consuming approval or relaxing the disable switch.
