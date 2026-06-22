# FP-MCP-064 — Start Request Human Approval Evidence Gate Enforcement

## Status

DRAFT

## Type

MCP bridge safety / guarded start-path gate enforcement

## Task

Enforce human approval evidence validation in the guarded remote runner start request path.

The start request path must refuse to approach the runner start endpoint unless valid, committed, scoped, non-expired, non-consumed, non-revoked, non-quarantined human approval evidence exists for the exact packet, request, model, run mode, commit, and branch being started.

This packet must not create real approval evidence.

This packet must not enable execution.

This packet must not contact the runner start endpoint.

---

## Goal

Make human approval evidence an explicit required gate in the guarded start path.

FP-MCP-064 answers one question:

**Does the guarded start request path fail closed when human approval evidence is missing, fixture-only, invalid, uncommitted, mismatched, expired, revoked, consumed, quarantined, or otherwise not usable for execution?**

The expected current result is:

```text
humanApprovalEvidenceGateEnforced: true
humanApprovalEvidenceEvaluated: true
humanApprovalEvidenceValid: false
humanApprovalEvidenceUsableForExecution: false
humanApprovalRecorded: false
approvalCreated: false
approvalMutated: false
startAccepted: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

This is a successful result.

---

## Background

FP-MCP-040 defined the older human approval record contract.

FP-MCP-041 implemented the older human approval validator.

FP-MCP-042 tested older negative approval-record fixtures.

FP-MCP-059 defined the newer human approval evidence contract.

FP-MCP-060 aligned legacy approval validation with the newer approval-evidence model.

FP-MCP-061 hardened the live validator so it reports:

```text
schemaVersion: FP-MCP-061
validatorBoundaryVersion: FP-MCP-061
approvalEvidenceContractVersion: FP-MCP-059
legacyApprovalRecordBoundaryRecognized: FP-MCP-041
```

FP-MCP-062 revalidated negative approval-evidence fixtures against the hardened validator.

FP-MCP-063 added a dry-run fixture recorder that can write approval-shaped fixture artifacts while keeping them rejected and non-authorizing.

FP-MCP-064 wires the hardened approval-evidence validator into the guarded start request path.

This packet does not create real approval evidence.

This packet does not make execution ready.

It only proves that the start path now refuses to proceed unless approval evidence is valid and usable.

---

## Governing Principles

FP-MCP-064 is constrained by:

```text
P01 — ForgePilot records observations, not narratives.
P02 — Trust cannot be retroactively created.
P03 — ForgePilot does not optimize for favorable outcomes.
P04 — Only admitted evidence may influence observatory outputs.
P06 — Classification follows observation.
```

Human approval is not inferred from conversation state.

Human approval is not inferred from packet existence.

Human approval is not inferred from fixture existence.

Human approval is not inferred from commit messages.

Only validator-confirmed, scoped, committed, usable approval evidence may satisfy this gate.

---

## Scope Boundary

FP-MCP-064 may:

* update the guarded start request MCP tool input schema
* add a required approval-evidence identifier input to the guarded start request path
* call the existing `forgepilot_validate_human_approval_record` validator from the start path
* derive expected approval scope from the request artifact and repository state
* require approval evidence to be valid and usable before any future start boundary is approached
* return structured human approval evidence gate fields
* return structured validation reasons
* reject missing approval evidence
* reject FP-MCP-063 dry-run fixture approval evidence
* reject invalid or mismatched approval evidence
* preserve all previous gates from FP-MCP-047, FP-MCP-053, and FP-MCP-057
* record verification artifacts

FP-MCP-064 must not:

* create real human approval evidence
* create approval evidence fixtures
* mutate approval evidence
* mark approval evidence consumed
* mark human approval as recorded
* satisfy the human approval gate through fixtures
* enable runner execution
* set `FORGEPILOT_RUNNER_EXECUTION_ENABLED=true`
* enable OpenCode execution
* change runner execution config
* call `/runner/start-run`
* invoke OpenCode CLI
* invoke OpenCode API
* call model providers
* execute shell commands through the runner
* create a real `runnerRunId`
* create real execution artifacts
* mutate request artifacts
* mutate pre-start evidence artifacts
* mutate state snapshot artifacts
* commit real secrets
* expose the private runner publicly
* weaken the disable switch
* weaken pre-start evidence or state snapshot gates

---

## Required Start Tool Input Change

The guarded start tool currently requires:

```json
{
  "packetId": "FP-MCP-036",
  "requestId": "REQ-20260622T144553300Z-fbbe8d82",
  "approval": "START_REMOTE_RUNNER_REQUEST"
}
```

FP-MCP-064 must require a human approval evidence id as an additional input.

Recommended input:

```json
{
  "packetId": "FP-MCP-036",
  "requestId": "REQ-20260622T144553300Z-fbbe8d82",
  "approvalId": "APPROVAL-20260622T225539362Z-cb42d99f",
  "approval": "START_REMOTE_RUNNER_REQUEST"
}
```

The field name should be:

```text
approvalId
```

Rationale:

The existing validator already uses `approvalId`.

The `approval` string remains the explicit operator command string for attempting the guarded start path.

The `approvalId` points to committed human approval evidence that must be validated independently.

---

## Required Expected Approval Scope

The start path must derive expected approval scope from validated request and repository observations.

Expected scope must include:

```text
packetId
requestId
modelId
runMode
repoCommit
branch
```

For the canonical dry-run request used in current verification, the expected scope is:

```json
{
  "packetId": "FP-MCP-036",
  "requestId": "REQ-20260622T144553300Z-fbbe8d82",
  "modelId": "qwen-3.7-max",
  "runMode": "DESIGN_ONLY",
  "repoCommit": "40b53dc",
  "branch": "main"
}
```

If the request artifact provides a concrete base commit, that commit must be used for approval scope comparison.

If the current repository branch differs from approved scope, the approval evidence gate must fail.

If the current repository commit differs from the scoped execution commit expected by the start path, the approval evidence gate must fail or remain blocked.

---

## Required Approval Evidence Gate Behavior

The start path must call the hardened validator before any future runner start boundary can be approached.

The gate passes only when the validator returns all of:

```text
approvalValidationEvaluated: true
approvalEvidenceValid: true
approvalValid: true
approvalUsableForExecution: true
humanApprovalRecorded: true
approvalCreated: false
approvalMutated: false
executionAllowedNow: false or governed by separate enablement policy
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
artifactCommitted: true
```

For FP-MCP-064 current-state verification, this gate must fail because no real usable approval evidence exists.

Fixture approval evidence must fail even when committed.

Missing approval evidence must fail.

Invalid approval evidence must fail.

---

## Required Start Path Blocking Reasons

When approval evidence is missing, invalid, fixture-only, uncommitted, mismatched, expired, revoked, consumed, quarantined, or not usable, the start path must include observable blocking reasons.

Required reason family:

```text
START_REQUEST_HUMAN_APPROVAL_EVIDENCE_GATE_BLOCKED
HUMAN_APPROVAL_EVIDENCE_INVALID
HUMAN_APPROVAL_EVIDENCE_NOT_USABLE_FOR_EXECUTION
```

Additional propagated validator reasons are expected and acceptable, for example:

```text
APPROVAL_EVIDENCE_ARTIFACT_MISSING
APPROVAL_EVIDENCE_TYPE_INVALID
APPROVAL_ARTIFACT_TYPE_INVALID
APPROVAL_STATE_NOT_RECORDED
APPROVAL_SCOPE_MISMATCH
APPROVAL_REQUEST_BINDING_INVALID
APPROVAL_QUARANTINED
```

The start path must not collapse approval evidence failure into a generic approval failure only.

Approval evidence gate failure must be directly observable.

---

## Required Response Fields

The guarded start request response must include, or preserve equivalent existing fields for:

```text
boundaryVersion
packetId
requestId
started
accepted
approvalAccepted
localValidationPassed
remoteValidationPassed
disableSwitchStatusEvaluated
disableSwitchActive
preStartEvidenceEvaluated
preStartEvidenceComplete
preStartEvidenceValid
stateSnapshotEvaluated
stateSnapshotComplete
stateSnapshotValid
humanApprovalEvidenceEvaluated
humanApprovalEvidenceGatePassed
humanApprovalEvidenceId
humanApprovalEvidencePath
humanApprovalEvidenceValid
humanApprovalEvidenceUsableForExecution
humanApprovalEvidenceReasons
approvalValidationEvaluated
approvalEvidenceValid
approvalValid
approvalUsableForExecution
approvalCreated
approvalMutated
humanApprovalRecorded
startEndpointContacted
executionStarted
opencodeStarted
runnerContacted
reasons
```

The response may include additional validator details if useful.

---

## Required Test Cases

### Case 1 — Missing approval evidence id

When `approvalId` is missing or empty:

```text
humanApprovalEvidenceEvaluated: true
humanApprovalEvidenceGatePassed: false
humanApprovalEvidenceValid: false
humanApprovalEvidenceUsableForExecution: false
START_REQUEST_HUMAN_APPROVAL_EVIDENCE_GATE_BLOCKED appears in reasons
HUMAN_APPROVAL_EVIDENCE_MISSING appears in reasons
startEndpointContacted: false
executionStarted: false
opencodeStarted: false
```

### Case 2 — Missing approval evidence artifact

When `approvalId` has a valid format but no artifact exists:

```text
approvalValidationEvaluated: true
approvalEvidenceValid: false
approvalUsableForExecution: false
START_REQUEST_HUMAN_APPROVAL_EVIDENCE_GATE_BLOCKED appears in reasons
APPROVAL_EVIDENCE_ARTIFACT_MISSING or APPROVAL_ARTIFACT_MISSING appears in reasons
startEndpointContacted: false
executionStarted: false
opencodeStarted: false
```

### Case 3 — FP-MCP-063 committed fixture approval evidence

When `approvalId` points to the committed FP-MCP-063 dry-run fixture:

```text
approvalValidationEvaluated: true
approvalEvidenceValid: false
approvalUsableForExecution: false
humanApprovalRecorded: false
START_REQUEST_HUMAN_APPROVAL_EVIDENCE_GATE_BLOCKED appears in reasons
APPROVAL_EVIDENCE_TYPE_INVALID or APPROVAL_ARTIFACT_TYPE_INVALID appears in reasons
APPROVAL_STATE_NOT_RECORDED or APPROVAL_QUARANTINED appears in reasons
startEndpointContacted: false
executionStarted: false
opencodeStarted: false
```

### Case 4 — Boundary preservation with all prior dry-run gates present

Given a request with valid request artifact, valid pre-start evidence, and valid state snapshot evidence:

```text
preStartEvidenceValid: true
stateSnapshotValid: true
humanApprovalEvidenceGatePassed: false
accepted: false
started: false
startEndpointContacted: false
executionStarted: false
opencodeStarted: false
```

This proves human approval evidence is now an independent blocker after previous evidence gates.

---

## Required Safety Result

For all tested cases, preserve:

```text
Real approval evidence created: NO
Approval evidence fixture created by start path: NO
Approval evidence mutated: NO
Human approval recorded: NO
Runner execution enabled: NO
OpenCode execution enabled: NO
Runner start endpoint contacted: NO
OpenCode started: NO
Shell executed through runner: NO
Model provider contacted: NO
Real runnerRunId created: NO
Existing evidence artifacts overwritten: NO
Real secrets committed: NO
```

---

## Verification Requirements

Verification must include:

1. Confirmation that the FP-MCP-064 packet is committed.
2. Confirmation that the MCP bridge implementation is committed.
3. Confirmation that the guarded start tool requires or evaluates `approvalId`.
4. A guarded start probe with a missing approval evidence id if tool schema allows it, or a malformed/missing-equivalent case if schema rejects missing input before handler execution.
5. A guarded start probe with a valid-looking missing approval id.
6. A guarded start probe with the committed FP-MCP-063 dry-run fixture approval id.
7. Confirmation that approval evidence gate fields are present.
8. Confirmation that approval evidence gate failure is directly observable.
9. Confirmation that prior pre-start evidence and state snapshot gates remain intact.
10. Confirmation that the runner start endpoint was not contacted.
11. Confirmation that OpenCode was not started.
12. Confirmation that no execution was started.
13. Confirmation that no approval evidence was created or mutated by the start path.
14. Repository status before final artifact commit.

---

## Expected Artifacts

The run should record:

```text
runs/FP-MCP-064/executor-result.md
runs/FP-MCP-064/verification.txt
runs/FP-MCP-064/start-human-approval-gate-result.json
```

---

## Explicit Non-Authorization Statement

FP-MCP-064 does not authorize execution.

FP-MCP-064 does not create real human approval evidence.

FP-MCP-064 does not consume approval evidence.

FP-MCP-064 does not satisfy the human approval gate.

FP-MCP-064 only proves that the guarded start path now refuses to proceed without valid usable human approval evidence.

---

## Success Criteria

FP-MCP-064 succeeds only if:

```text
humanApprovalEvidenceGateEnforced: true
humanApprovalEvidenceEvaluated: true
humanApprovalEvidenceGatePassed: false
humanApprovalEvidenceValid: false
humanApprovalEvidenceUsableForExecution: false
approvalEvidenceValid: false
approvalUsableForExecution: false
approvalCreated: false
approvalMutated: false
humanApprovalRecorded: false
accepted: false
started: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

Any result that treats fixture approval evidence as real approval fails this packet.

Any result that starts execution fails this packet.

Any result that contacts the runner start endpoint before the approval evidence gate passes fails this packet.
