# FP-MCP-075 — Human Approval Consumption Readiness Checkpoint

## Status

DRAFT

## Type

Checkpoint / boundary review packet

## Depends On

- FP-MCP-070 — Single-Use Approval Consumption Contract
- FP-MCP-071 — Single-Use Approval Consumption Recorder
- FP-MCP-072 — Consumed Approval Validator Enforcement
- FP-MCP-073 — Execution Preflight Consumed Approval Gate Enforcement
- FP-MCP-074 — Start Path Consumed Approval Gate Enforcement

## Task

Record the human approval consumption readiness boundary after FP-MCP-070 through FP-MCP-074.

This packet consolidates what has been proven about single-use human approval consumption, replay protection, validator enforcement, preflight enforcement, and guarded start-path enforcement.

FP-MCP-075 must not add runtime behavior.

FP-MCP-075 must not create approval evidence.

FP-MCP-075 must not create consumption evidence.

FP-MCP-075 must not mutate approval artifacts.

FP-MCP-075 must not mutate consumption artifacts.

FP-MCP-075 must not enable execution.

FP-MCP-075 must not contact the runner start endpoint.

FP-MCP-075 must not start OpenCode.

---

## Goal

FP-MCP-075 answers one question:

> Is the human approval consumption and replay-protection boundary complete enough to checkpoint before any future execution-enablement work?

The expected answer is:

```text
approvalConsumptionReadinessCheckpointRecorded: true
approvalConsumptionContractDefined: true
approvalConsumptionRecorderDefined: true
approvalConsumptionRecordedAsAppendOnlyEvidence: true
approvalValidatorRejectsConsumedApproval: true
executionPreflightRejectsConsumedApproval: true
startPathRejectsConsumedApproval: true
approvalArtifactMutated: false
newApprovalEvidenceCreatedByCheckpoint: false
newConsumptionEvidenceCreatedByCheckpoint: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

This is a successful result.

---

## Duplicate Check

FP-MCP-075 is not a duplicate of FP-MCP-070 through FP-MCP-074.

The boundaries are distinct:

```text
FP-MCP-070 defines the single-use approval consumption contract.
FP-MCP-071 records append-only approval consumption evidence.
FP-MCP-072 makes the approval validator reject consumed approvals.
FP-MCP-073 makes execution preflight reject consumed approvals.
FP-MCP-074 makes the guarded start path reject consumed approvals.
FP-MCP-075 records the readiness checkpoint after those enforcement packets.
```

FP-MCP-075 must not re-implement the recorder, validator, preflight, or start-path enforcement.

It only records the boundary state.

---

## Governing Principles

FP-MCP-075 is constrained by:

```text
P01 — ForgePilot records observations, not narratives.
P02 — Trust cannot be retroactively created.
P03 — ForgePilot does not optimize for favorable outcomes.
P04 — Only admitted evidence may influence observatory outputs.
P06 — Classification follows observation.
```

A checkpoint must not create trust.

A checkpoint must not reinterpret evidence.

A checkpoint must not treat blocked execution as execution readiness.

A checkpoint must not treat consumed-approval rejection as authorization to execute.

---

## Background

FP-MCP-065 checkpointed the human approval evidence readiness boundary after FP-MCP-059 through FP-MCP-064.

FP-MCP-066 through FP-MCP-069 then introduced real human approval evidence, real approval recording, validator alignment, and expiration/fresh-approval revalidation.

FP-MCP-070 through FP-MCP-074 then built the single-use consumption and replay-protection layer.

FP-MCP-075 is the checkpoint after that sequence.

It does not advance to execution enablement.

It decides whether the approval-consumption runway is complete enough to justify planning the next safety layer.

---

## Completed Consumption Sequence

The checkpoint must summarize:

### FP-MCP-070 — Single-Use Approval Consumption Contract

Required outcome:

```text
approvalConsumptionContractDefined: true
approvalConsumptionRecorderDefined: false
approvalConsumptionValidatorDefined: false
approvalConsumed: false
approvalMutated: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

### FP-MCP-071 — Single-Use Approval Consumption Recorder

Required outcome:

```text
approvalConsumptionRecorderDefined: true
approvalConsumptionRecorded: true
approvalConsumed: true
approvalMutated: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

Reference consumption evidence:

```text
consumptionId: CONSUMPTION-20260623T111327467Z-0cfc7dee
consumptionPath: runs/FP-MCP-071/approval-consumptions/CONSUMPTION-20260623T111327467Z-0cfc7dee.json
```

### FP-MCP-072 — Consumed Approval Validator Enforcement

Required outcome:

```text
approvalValidationEvaluated: true
approvalEvidenceValid: false
approvalValid: false
approvalUsableForExecution: false
approvalConsumed: true
consumptionEvidenceEvaluated: true
consumptionEvidencePresent: true
consumptionEvidenceValid: true
APPROVAL_CONSUMED
approvalMutated: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

### FP-MCP-073 — Execution Preflight Consumed Approval Gate Enforcement

Required outcome:

```text
preflightEligible: false
executionPermitted: false
humanApprovalEvidenceEvaluated: true
humanApprovalEvidenceGatePassed: false
approvalConsumed: true
consumptionEvidencePresent: true
consumptionEvidenceValid: true
APPROVAL_CONSUMED
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

### FP-MCP-074 — Start Path Consumed Approval Gate Enforcement

Required outcome:

```text
started: false
accepted: false
approvalAccepted: true
humanApprovalEvidenceEvaluated: true
humanApprovalEvidenceGatePassed: false
approvalConsumed: true
consumptionEvidencePresent: true
consumptionEvidenceValid: true
APPROVAL_CONSUMED
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerRunId: null
```

---

## Required Checkpoint Claims

FP-MCP-075 must explicitly state whether the following claims are true:

1. The single-use approval consumption contract exists.
2. Consumption is modeled as append-only evidence.
3. Consumption does not mutate the original approval artifact.
4. The consumption recorder exists.
5. The consumption recorder can record valid consumption evidence.
6. Recorded consumption evidence is committed.
7. The approval validator detects valid consumption evidence.
8. The approval validator rejects consumed approvals.
9. Execution preflight evaluates human approval evidence.
10. Execution preflight detects consumed approvals.
11. Execution preflight rejects consumed approvals.
12. The guarded start path evaluates human approval evidence.
13. The guarded start path detects consumed approvals.
14. The guarded start path rejects consumed approvals.
15. Expiration does not mask consumed-approval rejection.
16. The original approval artifact remains immutable.
17. No new approval evidence is created by the checkpoint.
18. No new consumption evidence is created by the checkpoint.
19. The runner start endpoint remains uncontacted.
20. OpenCode remains unstarted.
21. Runner execution remains disabled.
22. OpenCode execution remains disabled.
23. The global disable switch remains active.
24. No real runnerRunId is created.

---

## Required Verification Inputs

Use the existing request, approval, and consumption evidence:

```text
packetId: FP-MCP-036
requestId: REQ-20260622T144553300Z-fbbe8d82
modelId: qwen-3.7-max
runMode: DESIGN_ONLY
repoCommit: 40b53dc
branch: main

approvalPacketId: FP-MCP-069
approvalId: APPROVAL-20260623T111242963Z-78f7e740
approvalPath: runs/FP-MCP-069/approvals/APPROVAL-20260623T111242963Z-78f7e740.json

consumptionId: CONSUMPTION-20260623T111327467Z-0cfc7dee
consumptionPath: runs/FP-MCP-071/approval-consumptions/CONSUMPTION-20260623T111327467Z-0cfc7dee.json
```

---

## Required Verification Probes

Verification should include:

1. Repository status.
2. OpenCode status.
3. Disable-switch status.
4. Validator probe against the consumed approval.
5. Execution preflight probe against the consumed approval.
6. Guarded start-path probe against the consumed approval.
7. Confirmation that the original approval artifact was not mutated.
8. Confirmation that no new consumption evidence was created by FP-MCP-075.
9. Confirmation that execution remains disabled.
10. Confirmation that the runner start endpoint was not contacted.
11. Confirmation that OpenCode was not started.
12. Confirmation that no real runnerRunId was created.

The validator probe must show:

```text
approvalConsumed: true
consumptionEvidencePresent: true
consumptionEvidenceValid: true
APPROVAL_CONSUMED
approvalUsableForExecution: false
```

The preflight probe must show:

```text
preflightEligible: false
humanApprovalEvidenceGatePassed: false
approvalConsumed: true
APPROVAL_CONSUMED
startEndpointContacted: false
opencodeStarted: false
```

The start-path probe must show:

```text
started: false
accepted: false
humanApprovalEvidenceGatePassed: false
approvalConsumed: true
APPROVAL_CONSUMED
startEndpointContacted: false
opencodeStarted: false
runnerRunId: null
```

---

## Current Known Remaining Blockers

The checkpoint must preserve these blockers:

```text
executionAllowedNow: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
globalDisableSwitchActive: true
runner start endpoint must remain gated
OpenCode must remain gated
audit admission for real execution remains undefined
post-consumption blocked-attempt classification remains not separately implemented
successful-start consumption handoff remains not implemented
execution enablement remains not authorized
```

These blockers are not failures.

They define the remaining runway before any controlled execution attempt can be considered.

---

## Explicit Non-Authorization Statement

FP-MCP-075 does not authorize execution.

FP-MCP-075 does not enable execution.

FP-MCP-075 does not create approval evidence.

FP-MCP-075 does not create consumption evidence.

FP-MCP-075 does not consume approval evidence.

FP-MCP-075 does not mutate approval evidence.

FP-MCP-075 does not satisfy final execution readiness.

FP-MCP-075 only records the readiness boundary after the approval-consumption and replay-protection sequence.

---

## Expected Artifacts

FP-MCP-075 should record:

```text
docs/human-approval-consumption-readiness-checkpoint.md
runs/FP-MCP-075/executor-result.md
runs/FP-MCP-075/verification.txt
runs/FP-MCP-075/readiness-checkpoint-result.json
```

Optional supporting artifacts may include:

```text
runs/FP-MCP-075/validator-consumed-approval-result.json
runs/FP-MCP-075/preflight-consumed-approval-result.json
runs/FP-MCP-075/start-consumed-approval-result.json
```

---

## Success Criteria

FP-MCP-075 succeeds only if it records the checkpoint and preserves:

```text
approvalConsumptionReadinessCheckpointRecorded: true
approvalConsumptionContractDefined: true
approvalConsumptionRecorderDefined: true
approvalValidatorRejectsConsumedApproval: true
executionPreflightRejectsConsumedApproval: true
startPathRejectsConsumedApproval: true
newApprovalEvidenceCreatedByCheckpoint: false
newConsumptionEvidenceCreatedByCheckpoint: false
approvalArtifactMutated: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerRunIdCreated: false
workingTreeCleanAfterArtifacts: true
```

Any result that creates new approval evidence fails this packet.

Any result that creates new consumption evidence fails this packet.

Any result that mutates approval artifacts fails this packet.

Any result that enables execution fails this packet.

Any result that contacts the runner start endpoint fails this packet.

Any result that starts OpenCode fails this packet.

