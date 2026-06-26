# FP-MCP-072 — Consumed Approval Validator Enforcement

## Status

DRAFT

## Type

Implementation packet

## Depends On

- FP-MCP-066 — Real Human Approval Evidence Contract
- FP-MCP-067 — Real Human Approval Evidence Recorder
- FP-MCP-068 — Real Human Approval Evidence Validator Alignment
- FP-MCP-069 — Human Approval Expiration and Fresh Approval Revalidation
- FP-MCP-070 — Single-Use Approval Consumption Contract
- FP-MCP-071 — Single-Use Approval Consumption Recorder

## Task

Update the human approval evidence validator so a valid append-only approval consumption artifact makes the corresponding approval unusable for future execution.

FP-MCP-072 must not create consumption evidence.

FP-MCP-072 must not mutate approval artifacts.

FP-MCP-072 must not enable execution.

FP-MCP-072 must not contact the runner start endpoint.

FP-MCP-072 must not start OpenCode.

---

## Goal

FP-MCP-072 answers one question:

> Does ForgePilot reject a previously consumed approval during approval validation by observing valid append-only consumption evidence?

The expected result for the consumed approval from FP-MCP-071 is:

```text
approvalValidationEvaluated: true
approvalEvidenceValid: false
approvalValid: false
approvalUsableForExecution: false
approvalConsumed: true
consumptionEvidenceEvaluated: true
consumptionEvidencePresent: true
consumptionEvidenceValid: true
approvalMutated: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
reasons:
- APPROVAL_CONSUMED
```

This is a successful result.

---

## Governing Principles

FP-MCP-072 is constrained by:

```text
P01 — ForgePilot records observations, not narratives.
P02 — Trust cannot be retroactively created.
P03 — ForgePilot does not optimize for favorable outcomes.
P04 — Only admitted evidence may influence observatory outputs.
P06 — Classification follows observation.
```

Consumption must be detected from committed append-only evidence.

The original approval artifact must remain immutable.

A consumed approval must fail future usability validation.

Classification must follow observed consumption evidence.

---

## Reference Approval and Consumption Evidence

Use the FP-MCP-071 consumption evidence:

```text
approvalPacketId: FP-MCP-069
approvalId: APPROVAL-20260623T111242963Z-78f7e740
approvalPath: runs/FP-MCP-069/approvals/APPROVAL-20260623T111242963Z-78f7e740.json
consumptionId: CONSUMPTION-20260623T111327467Z-0cfc7dee
consumptionPath: runs/FP-MCP-071/approval-consumptions/CONSUMPTION-20260623T111327467Z-0cfc7dee.json
```

Expected scope:

```text
packetId: FP-MCP-036
requestId: REQ-20260622T144553300Z-fbbe8d82
modelId: qwen-3.7-max
runMode: DESIGN_ONLY
repoCommit: 40b53dc
branch: main
```

---

## Required Behavior

The approval validator must:

1. Validate the approval artifact using existing human approval evidence validation semantics.
2. Search committed append-only approval consumption evidence.
3. Treat a matching valid consumption artifact as authoritative spent-approval evidence.
4. Require consumption evidence to match:
   - `approvalPacketId`
   - `approvalId`
   - `approvalPath`
   - exact approval scope
   - required consumption artifact fields
   - required safety fields
   - committed artifact state
5. Mark the approval as consumed when valid matching consumption evidence exists.
6. Return `approvalEvidenceValid: false`.
7. Return `approvalValid: false`.
8. Return `approvalUsableForExecution: false`.
9. Return `approvalConsumed: true`.
10. Include `APPROVAL_CONSUMED` in `reasons`.
11. Preserve `approvalMutated: false`.
12. Preserve `executionAllowedNow: false`.
13. Preserve `executionStarted: false`.
14. Preserve `startEndpointContacted: false`.
15. Preserve `opencodeStarted: false`.

---

## Valid Consumption Evidence Requirements

A matching consumption artifact is valid only if it is committed, safe to read, JSON-valid, and includes:

```text
schemaVersion: FP-MCP-071
boundaryVersion: FP-MCP-071
artifactType: human-approval-consumption
consumptionState: RECORDED
consumptionKind: EXECUTION_ENABLEMENT_SINGLE_USE
consumedAction: ALLOW_ONE_GUARDED_REMOTE_RUNNER_EXECUTION_ATTEMPT
consumedByTool: forgepilot_record_human_approval_consumption
consumedByBoundaryVersion: FP-MCP-071
singleUse: true
approvalConsumed: true
approvalMutated: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

The embedded `approvalValidation` must show the approval was valid and usable at the time of consumption:

```text
approvalEvidenceValid: true
approvalValid: true
approvalUsableForExecution: true
humanApprovalRecorded: true
artifactCommitted: true
expirationValid: true
notRevoked: true
notConsumed: true
notQuarantined: true
```

---

## Required Output Additions

The validator response should include:

```text
approvalConsumed
consumptionEvidenceEvaluated
consumptionEvidencePresent
consumptionEvidenceValid
consumptionEvidenceId
consumptionEvidencePath
```

---

## Required Failure Behavior

The validator must fail closed for consumed approvals.

If valid matching consumption evidence exists, the validator must not return a usable approval even if the original approval artifact still says it is unconsumed.

Invalid or unsafe consumption evidence must not mutate approval artifacts and must not enable execution.

---

## Verification Requirements

Verification must include:

1. Repository status before patch.
2. Confirmation FP-MCP-071 artifacts exist.
3. Bridge build success with `pnpm run build`.
4. Tool discovery showing `forgepilot_validate_human_approval_record`.
5. Validator probe against the FP-MCP-071 consumed approval.
6. Result showing:
   - `approvalEvidenceValid: false`
   - `approvalValid: false`
   - `approvalUsableForExecution: false`
   - `approvalConsumed: true`
   - `consumptionEvidencePresent: true`
   - `consumptionEvidenceValid: true`
   - `APPROVAL_CONSUMED`
7. Confirmation that no new consumption evidence was created.
8. Confirmation that the original approval artifact was not mutated.
9. Confirmation that execution remains disabled.
10. Confirmation that the runner start endpoint was not contacted.
11. Confirmation that OpenCode was not started.

---

## Expected Artifacts

FP-MCP-072 should record:

```text
runs/FP-MCP-072/executor-result.md
runs/FP-MCP-072/verification.txt
runs/FP-MCP-072/consumed-approval-validation-result.json
```

---

## Non-Goals

FP-MCP-072 must not:

```text
create new approval evidence
create new consumption evidence
mutate the original approval artifact
update consumed fields inside the approval artifact
modify the start request path
enable execution
contact the runner start endpoint
start OpenCode
create a real runnerRunId
create real execution artifacts
```

---

## Non-Authorization Statement

FP-MCP-072 does not authorize execution.

FP-MCP-072 does not satisfy final execution readiness.

FP-MCP-072 only enforces consumed-approval rejection during approval validation.

A later packet must enforce approval consumption in the start-request path.
