# FP-MCP-091 — Real Approval Evidence Contract Observation

## Task

Observe and define the real human approval evidence contract without creating real approval, consuming approval, enabling execution, or starting OpenCode.

## Goal

Determine what a real ForgePilot human approval evidence artifact must contain before it can become usable by guarded execution preflight.

This packet answers one question:

What exact evidence contract distinguishes real human approval from dry-run approval-shaped evidence?

## Background

FP-MCP-090 observed the human approval evidence gate using non-authorizing dry-run approval fixture tooling.

Observed dry-run fixture result:

- dryRunFixtureRecorded: true
- dryRunFixtureValidated: true
- approvalEvidenceValid: false
- approvalValid: false
- approvalUsableForExecution: false
- approvalCreated: false
- approvalMutated: false
- humanApprovalRecorded: false
- approvalConsumed: false
- executionAllowedNow: false
- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false

The validator correctly rejected the dry-run fixture as real approval evidence because it was approval-shaped but intentionally non-authorizing.

Observed validation rejection reasons included:

- APPROVAL_EVIDENCE_TYPE_INVALID
- APPROVAL_ARTIFACT_TYPE_INVALID
- APPROVAL_STATE_NOT_RECORDED
- APPROVAL_SCOPE_MISMATCH
- APPROVAL_REQUEST_BINDING_INVALID
- APPROVAL_TEXT_INVALID
- APPROVAL_QUARANTINED
- APPROVAL_EVIDENCE_ARTIFACT_UNCOMMITTED
- APPROVAL_ARTIFACT_UNCOMMITTED

The next smallest step is to document the real approval evidence contract before creating any real approval artifact.

## Scope

Allowed:

- Read existing approval validation behavior.
- Read existing approval dry-run fixture evidence.
- Observe validator contract fields.
- Define required real approval evidence fields.
- Define invalidating conditions.
- Define safety preconditions for future real approval creation.
- Record observations under `runs/FP-MCP-091/`.

Forbidden:

- Do not create real approval evidence.
- Do not consume approval.
- Do not mutate approval evidence.
- Do not enable execution.
- Do not relax the global disable switch.
- Do not contact the runner start endpoint.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create a runner run id.
- Do not mutate request artifacts.
- Do not change production MCP behavior.

## Suggested Reference Artifacts

Use the FP-MCP-090 dry-run approval observation as reference evidence:

- `runs/FP-MCP-090/approval-gate-observation.md`
- `runs/FP-MCP-090/verification.txt`
- `runs/FP-MCP-090/approvals/APPROVAL-20260630T111656360Z-1eafb0e9.json`

Use the existing request scope:

- request packetId: FP-MCP-084
- requestId: REQ-20260630T094727908Z-630a4f0d
- modelId: deepseek-v4-pro-high
- runMode: DESIGN_ONLY

## Required Observation

Record the real approval evidence contract, including:

- required schema version
- required artifact type
- required evidence type
- required approval state
- required approval kind
- required approved action
- required request scope binding
- required packet binding
- required model binding
- required run mode binding
- required commit binding
- required branch binding
- required canonical approval text
- required preconditions
- required expiration behavior
- required single-use behavior
- required revocation/quarantine behavior
- required committed-artifact behavior
- required consumption behavior before execution
- required safety fields

## Required Safety Results

Verification must show:

- no real approval evidence created
- approvalCreated: false
- approvalConsumed: false
- executionAllowedNow: false
- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false
- global disable switch remains active
- no runner run id created

## Evidence

Record:

- `runs/FP-MCP-091/real-approval-contract-observation.md`
- `runs/FP-MCP-091/verification.txt`

## Success Criteria

This packet is successful if:

1. The real approval evidence contract is documented.
2. The distinction between dry-run approval-shaped evidence and real approval evidence is explicit.
3. Future real approval creation preconditions are identified.
4. No real approval is created.
5. No approval is consumed.
6. No execution is started.
7. The next smallest gate is identified.

## Non-goals

This packet does not create real approval evidence.

This packet does not consume approval.

This packet does not relax the disable switch.

This packet does not start OpenCode.

This packet does not admit model output.

This packet does not implement new approval behavior.
