# FP-MCP-090 — Human Approval Evidence Gate Observation

## Task

Observe the human approval evidence gate using non-authorizing approval evidence tooling.

## Goal

Determine whether ForgePilot MCP can record and validate approval-shaped evidence without authorizing execution, consuming approval, enabling execution, or starting OpenCode.

This packet answers one question:

Can the human approval evidence path be observed safely before any real execution authority is introduced?

## Background

FP-MCP-089 re-observed guarded execution preflight after runner capability and validate-request paths were authenticated.

Previously failing gates that now pass:

- runnerIdentity
- runnerCapability
- networkExposure

Remaining blockers:

- disableSwitch: BLOCKED
- executionEnablement: FAILED
- humanApprovalEvidence: BLOCKED
- artifactRecording: NOT_EVALUATED

Observed approval state:

- approvalId: null
- approvalPacketId: null
- approvalPath: null
- humanApprovalEvidenceEvaluated: true
- humanApprovalEvidenceGatePassed: false
- humanApprovalEvidenceValid: false
- humanApprovalEvidenceUsableForExecution: false
- approvalValidationEvaluated: false
- approvalEvidenceValid: false
- approvalValid: false
- approvalUsableForExecution: false
- approvalConsumed: false
- humanApprovalRecorded: false

The next smallest evidence gate is human approval evidence observation.

This packet must not create real execution authority.

## Scope

Allowed:

- Use existing non-authorizing approval evidence dry-run fixture tooling.
- Record a dry-run approval-shaped fixture if the tool is explicitly non-authorizing.
- Validate the dry-run approval fixture if validation is explicitly non-starting.
- Re-run guarded execution preflight with or without the dry-run fixture as observational input if the tool remains non-starting.
- Record approval evidence gate observations under `runs/FP-MCP-090/`.

Forbidden:

- Do not create real approval evidence.
- Do not consume approval.
- Do not mutate real approval evidence.
- Do not enable execution.
- Do not relax the global disable switch.
- Do not contact the runner start endpoint.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create a runner run id.
- Do not mutate request artifacts.
- Do not change production MCP behavior.

## Suggested Existing Request

Use the existing committed request artifact:

- packetId: FP-MCP-084
- requestId: REQ-20260630T094727908Z-630a4f0d
- modelId: deepseek-v4-pro-high
- runMode: DESIGN_ONLY

## Required Observation

Record:

- whether non-authorizing approval evidence fixture recording is available
- whether a dry-run approval fixture can be recorded
- dry-run approval fixture id and path, if created
- whether the dry-run fixture validates structurally
- whether it is explicitly unusable for execution
- whether approvalCreated remains false for real approval
- whether approvalConsumed remains false
- whether execution remains disallowed
- whether preflight still blocks execution

## Required Safety Results

Verification must show:

- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false
- executionAllowedNow: false
- approvalConsumed: false
- real approval evidence not created
- global disable switch remains active
- no runner run id created

## Evidence

Record:

- `runs/FP-MCP-090/approval-gate-observation.md`
- `runs/FP-MCP-090/verification.txt`

## Success Criteria

This packet is successful if:

1. The approval evidence gate is observed using only non-authorizing tooling.
2. Any created fixture is clearly marked as dry-run / non-authorizing.
3. The fixture is not usable for execution.
4. No real approval is created.
5. No approval is consumed.
6. No execution is started.
7. The next smallest missing gate is identified.

## Non-goals

This packet does not authorize execution.

This packet does not create real approval evidence.

This packet does not consume approval.

This packet does not relax the disable switch.

This packet does not start OpenCode.

This packet does not admit model output.
