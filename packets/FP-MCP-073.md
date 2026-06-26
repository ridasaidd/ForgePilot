# FP-MCP-073 — Execution Preflight Consumed Approval Gate Enforcement

## Status

DRAFT

## Type

MCP bridge safety / guarded execution preflight gate enforcement

## Depends On

- FP-MCP-064 — Start Request Human Approval Evidence Gate Enforcement
- FP-MCP-066 — Real Human Approval Evidence Contract
- FP-MCP-067 — Real Human Approval Evidence Recorder
- FP-MCP-068 — Real Human Approval Evidence Validator Alignment
- FP-MCP-069 — Human Approval Expiration and Fresh Approval Revalidation
- FP-MCP-070 — Single-Use Approval Consumption Contract
- FP-MCP-071 — Single-Use Approval Consumption Recorder
- FP-MCP-072 — Consumed Approval Validator Enforcement

## Task

Update guarded execution preflight validation so a consumed human approval is rejected as an explicit independent preflight blocker.

FP-MCP-073 must enforce consumed-approval rejection through the execution preflight boundary.

FP-MCP-073 must not create approval evidence.

FP-MCP-073 must not create consumption evidence.

FP-MCP-073 must not mutate approval artifacts.

FP-MCP-073 must not mutate consumption artifacts.

FP-MCP-073 must not enable execution.

FP-MCP-073 must not contact the runner start endpoint.

FP-MCP-073 must not start OpenCode.

---

## Goal

FP-MCP-073 answers one question:

> Does ForgePilot execution preflight explicitly reject a request when the supplied approval has already been consumed?

The expected result for the consumed approval from FP-MCP-071 is:

```text
preflightEligible: false
executionPermitted: false
humanApprovalEvidenceEvaluated: true
humanApprovalEvidenceGatePassed: false
humanApprovalEvidenceValid: false
humanApprovalEvidenceUsableForExecution: false
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

Because the reference approval is also expired at the time of FP-MCP-073, the response may additionally include:

```text
APPROVAL_EXPIRED
```

That is acceptable only if `APPROVAL_CONSUMED` is also present and the consumption evidence fields are evaluated and valid.

---

## Governing Principles

FP-MCP-073 is constrained by:

```text
P01 — ForgePilot records observations, not narratives.
P02 — Trust cannot be retroactively created.
P03 — ForgePilot does not optimize for favorable outcomes.
P04 — Only admitted evidence may influence observatory outputs.
P06 — Classification follows observation.
```

Execution preflight must not infer approval usability.

Execution preflight must not infer approval consumption from the approval artifact itself.

Execution preflight must observe valid append-only consumption evidence.

Approval artifacts remain immutable.

Consumption evidence remains append-only.

Classification must follow observed consumption evidence.

---

## Reference Request, Approval, and Consumption Evidence

Use the existing request artifact:

```text
packetId: FP-MCP-036
requestId: REQ-20260622T144553300Z-fbbe8d82
requestPath: runs/FP-MCP-036/opencode-requests/REQ-20260622T144553300Z-fbbe8d82.json
modelId: qwen-3.7-max
runMode: DESIGN_ONLY
repoCommit: 40b53dc
branch: main
```

Use the FP-MCP-071 consumed approval:

```text
approvalPacketId: FP-MCP-069
approvalId: APPROVAL-20260623T111242963Z-78f7e740
approvalPath: runs/FP-MCP-069/approvals/APPROVAL-20260623T111242963Z-78f7e740.json
consumptionId: CONSUMPTION-20260623T111327467Z-0cfc7dee
consumptionPath: runs/FP-MCP-071/approval-consumptions/CONSUMPTION-20260623T111327467Z-0cfc7dee.json
```

Expected approval scope:

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

---

## Current Baseline Observation

Before FP-MCP-073, guarded execution preflight already blocks execution because the global disable switch is active.

Current baseline behavior is insufficient for FP-MCP-073 because it does not prove consumed-approval enforcement unless approval validation and consumption evidence are evaluated and reported by the preflight result.

The disable switch may remain active.

The approval may remain expired.

Those blockers must not prevent preflight from also observing and reporting consumed-approval rejection.

---

## Required Tool Boundary Change

`forgepilot_validate_execution_preflight` should support validating the supplied approval evidence used by a guarded execution attempt.

Recommended backward-compatible input extension:

```json
{
  "packetId": "FP-MCP-036",
  "requestId": "REQ-20260622T144553300Z-fbbe8d82",
  "approvalId": "APPROVAL-20260623T111242963Z-78f7e740"
}
```

The existing `packetId` and `requestId` fields must remain supported.

The new `approvalId` field should be optional only for backward compatibility.

If `approvalId` is omitted, preflight must keep failing closed and must report that human approval evidence was not supplied or not evaluated as usable.

---

## Required Expected Approval Scope Derivation

Execution preflight must derive the expected approval scope from validated request and repository observations.

Expected scope must include:

```text
packetId
requestId
modelId
runMode
repoCommit
branch
```

For the canonical request used by FP-MCP-073, expected scope must be:

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

If the current repository branch differs from the approved scope, approval evidence validation must fail.

If the request-bound commit differs from the approved scope, approval evidence validation must fail.

---

## Required Preflight Behavior

Execution preflight must:

1. Validate the request artifact using existing preflight semantics.
2. Derive the expected approval scope from the request artifact.
3. Validate the supplied approval evidence with FP-MCP-072 consumed-approval semantics.
4. Search committed append-only approval consumption evidence.
5. Treat valid matching consumption evidence as authoritative spent-approval evidence.
6. Mark the human approval evidence gate as blocked when the approval is consumed.
7. Return `preflightEligible: false`.
8. Return `executionPermitted: false`.
9. Return `humanApprovalEvidenceEvaluated: true`.
10. Return `humanApprovalEvidenceGatePassed: false`.
11. Return `humanApprovalEvidenceValid: false`.
12. Return `humanApprovalEvidenceUsableForExecution: false`.
13. Return `approvalConsumed: true`.
14. Return `consumptionEvidenceEvaluated: true`.
15. Return `consumptionEvidencePresent: true`.
16. Return `consumptionEvidenceValid: true`.
17. Include `APPROVAL_CONSUMED` in `reasons`.
18. Preserve `approvalMutated: false`.
19. Preserve `executionAllowedNow: false`.
20. Preserve `executionStarted: false`.
21. Preserve `startEndpointContacted: false`.
22. Preserve `opencodeStarted: false`.

---

## Required Non-Short-Circuit Behavior

FP-MCP-073 must prove that consumed-approval rejection is independently observable.

Execution preflight must not stop reporting after the first blocker.

Even when these blockers exist:

```text
EXECUTION_DISABLED_GLOBAL
DISABLE_SWITCH_ACTIVE
APPROVAL_EXPIRED
```

the result must still evaluate and report:

```text
approvalConsumed: true
consumptionEvidenceEvaluated: true
consumptionEvidencePresent: true
consumptionEvidenceValid: true
APPROVAL_CONSUMED
```

Absence of execution is not enough.

Consumed-approval enforcement must be directly observable.

---

## Required Response Fields

The execution preflight response should include or preserve equivalent fields for:

```text
schemaVersion
boundaryVersion
packetId
requestId
approvalId
approvalPath
preflightEligible
executionPermitted
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
approvalConsumed
consumptionEvidenceEvaluated
consumptionEvidencePresent
consumptionEvidenceValid
consumptionEvidenceId
consumptionEvidencePath
approvalMutated
disableSwitchStatusEvaluated
disableSwitchActive
executionAllowedNow
executionStarted
startEndpointContacted
opencodeStarted
gates
reasons
```

The result may retain `runnerContacted` if that field means only existing read-only capability or validation endpoint contact.

The result must not use `runnerContacted: true` as a substitute for start endpoint contact.

A precise start-safety field should remain present or be added:

```text
startEndpointContacted: false
```

---

## Required Gate Representation

The `gates` object should include a directly observable approval evidence gate.

Recommended gate names:

```text
humanApprovalEvidence: BLOCKED
```

or:

```text
approvalEvidence: BLOCKED
```

or:

```text
consumedApproval: BLOCKED
```

At least one explicit approval-related gate must be present and blocked.

The consumed approval must not be collapsed into a generic `executionEnablement: FAILED` result only.

---

## Required Blocking Reasons

Required reason family:

```text
EXECUTION_PREFLIGHT_HUMAN_APPROVAL_EVIDENCE_GATE_BLOCKED
HUMAN_APPROVAL_EVIDENCE_NOT_USABLE_FOR_EXECUTION
APPROVAL_CONSUMED
```

Acceptable additional reasons include:

```text
APPROVAL_EXPIRED
EXECUTION_DISABLED_GLOBAL
EXECUTION_DISABLED
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
DISABLE_SWITCH_ACTIVE
EXECUTION_NOT_ALLOWED
```

`APPROVAL_EXPIRED` alone is not sufficient.

`EXECUTION_DISABLED_GLOBAL` alone is not sufficient.

`EXECUTION_NOT_ALLOWED` alone is not sufficient.

---

## Required Test Case

### Case 1 — Consumed approval supplied to execution preflight

Input:

```json
{
  "packetId": "FP-MCP-036",
  "requestId": "REQ-20260622T144553300Z-fbbe8d82",
  "approvalId": "APPROVAL-20260623T111242963Z-78f7e740"
}
```

Expected result:

```text
preflightEligible: false
executionPermitted: false
humanApprovalEvidenceEvaluated: true
humanApprovalEvidenceGatePassed: false
humanApprovalEvidenceValid: false
humanApprovalEvidenceUsableForExecution: false
approvalValidationEvaluated: true
approvalEvidenceValid: false
approvalValid: false
approvalUsableForExecution: false
approvalConsumed: true
consumptionEvidenceEvaluated: true
consumptionEvidencePresent: true
consumptionEvidenceValid: true
consumptionEvidenceId: CONSUMPTION-20260623T111327467Z-0cfc7dee
consumptionEvidencePath: runs/FP-MCP-071/approval-consumptions/CONSUMPTION-20260623T111327467Z-0cfc7dee.json
APPROVAL_CONSUMED appears in reasons
approvalMutated: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

This is a successful rejection.

---

## Required Safety Result

For FP-MCP-073 verification, preserve:

```text
New approval evidence created: NO
New consumption evidence created: NO
Approval artifact mutated: NO
Consumption artifact mutated: NO
Human approval recorded: NO
Approval consumed by FP-MCP-073: NO
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

1. Confirmation that the FP-MCP-073 packet is committed.
2. Confirmation that the MCP bridge implementation is committed.
3. Confirmation that the ForgePilot MCP service is active after restart.
4. Bridge build success with `pnpm run build`.
5. Tool discovery showing `forgepilot_validate_execution_preflight`.
6. Confirmation that `forgepilot_validate_execution_preflight` accepts or evaluates `approvalId`.
7. A preflight probe against the FP-MCP-071 consumed approval.
8. Result showing:
   - `preflightEligible: false`
   - `executionPermitted: false`
   - `humanApprovalEvidenceEvaluated: true`
   - `humanApprovalEvidenceGatePassed: false`
   - `humanApprovalEvidenceValid: false`
   - `humanApprovalEvidenceUsableForExecution: false`
   - `approvalValidationEvaluated: true`
   - `approvalEvidenceValid: false`
   - `approvalValid: false`
   - `approvalUsableForExecution: false`
   - `approvalConsumed: true`
   - `consumptionEvidencePresent: true`
   - `consumptionEvidenceValid: true`
   - `APPROVAL_CONSUMED`
9. Confirmation that approval-expiration rejection, if present, does not mask consumed-approval rejection.
10. Confirmation that no new approval evidence was created.
11. Confirmation that no new consumption evidence was created.
12. Confirmation that the original approval artifact was not mutated.
13. Confirmation that execution remains disabled.
14. Confirmation that the runner start endpoint was not contacted.
15. Confirmation that OpenCode was not started.
16. Repository status before final artifact commit.

---

## Expected Artifacts

FP-MCP-073 should record:

```text
runs/FP-MCP-073/executor-result.md
runs/FP-MCP-073/verification.txt
runs/FP-MCP-073/execution-preflight-consumed-approval-result.json
```

Optional baseline artifact:

```text
runs/FP-MCP-073/execution-preflight-baseline-before-patch.json
```

---

## Non-Goals

FP-MCP-073 must not:

```text
create new approval evidence
create new consumption evidence
consume approval evidence
mutate the original approval artifact
mutate any consumption artifact
update consumed fields inside the approval artifact
enable execution
contact the runner start endpoint
start OpenCode
create a real runnerRunId
create real execution artifacts
change model routing
change model selection
call model providers
weaken the disable switch
weaken approval validation
weaken start-request approval enforcement
```

---

## Non-Authorization Statement

FP-MCP-073 does not authorize execution.

FP-MCP-073 does not satisfy final execution readiness.

FP-MCP-073 does not consume approval evidence.

FP-MCP-073 only enforces consumed-approval rejection during guarded execution preflight.
