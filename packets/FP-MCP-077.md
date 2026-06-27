# FP-MCP-077 — Successful Start Consumption Handoff Contract

## Status

DRAFT

## Type

Contract packet

## Depends On

- FP-MCP-070 — Single-Use Approval Consumption Contract
- FP-MCP-071 — Single-Use Approval Consumption Recorder
- FP-MCP-072 — Consumed Approval Validator Enforcement
- FP-MCP-073 — Execution Preflight Consumed Approval Gate Enforcement
- FP-MCP-074 — Start Path Consumed Approval Gate Enforcement
- FP-MCP-075 — Human Approval Consumption Readiness Checkpoint
- FP-MCP-076 — Post-Consumption Blocked Attempt Classification

## Task

Define the future successful-start consumption handoff contract.

This packet specifies the exact ordering and evidence requirements for a future guarded start path where a fresh, usable human approval is consumed before the runner start endpoint can be contacted.

FP-MCP-077 must not implement runtime behavior.

FP-MCP-077 must not create approval evidence.

FP-MCP-077 must not create consumption evidence.

FP-MCP-077 must not mutate approval artifacts.

FP-MCP-077 must not mutate consumption artifacts.

FP-MCP-077 must not enable execution.

FP-MCP-077 must not contact the runner start endpoint.

FP-MCP-077 must not start OpenCode.

---

## Goal

FP-MCP-077 answers one question:

> When ForgePilot eventually permits a guarded start attempt, where exactly must approval consumption occur relative to runner start contact?

The expected contract result is:

```text
successfulStartConsumptionHandoffContractDefined: true
freshApprovalConsumptionBoundaryDefined: true
approvalConsumedNow: false
newApprovalEvidenceCreated: false
newConsumptionEvidenceCreated: false
approvalMutated: false
consumptionArtifactMutated: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

This is a successful result.

---

## Core Handoff Rule

For a future successful guarded start attempt, the handoff order must be:

```text
1. Validate request artifact.
2. Validate packet, model, run mode, and lifecycle.
3. Validate pre-start evidence.
4. Validate start state snapshot evidence.
5. Validate fresh human approval evidence.
6. Confirm approval is not expired.
7. Confirm approval is committed.
8. Confirm approval is not revoked.
9. Confirm approval is not quarantined.
10. Confirm approval is not already consumed.
11. Confirm execution enablement gates permit a start attempt.
12. Create append-only approval consumption evidence.
13. Re-read or verify the consumption artifact exists and is valid.
14. Only then contact the runner start endpoint.
15. Only then allow OpenCode start through the runner boundary.
```

The approval consumption boundary is before runner start endpoint contact.

The consumption artifact is the durable proof that the fresh approval crossed the final authorization handoff.

---

## Non-Bypass Rule

The future start path must not contact the runner start endpoint unless it can show:

```text
approvalValidationEvaluated: true
approvalEvidenceValid: true
approvalValid: true
approvalUsableForExecution: true
approvalConsumedBeforeStartContact: true
consumptionEvidenceCreated: true
consumptionEvidencePresent: true
consumptionEvidenceValid: true
approvalMutated: false
startEndpointContactedAfterConsumption: true
```

If consumption artifact creation fails, the start path must fail closed before runner start contact.

If consumption validation fails after creation, the start path must fail closed before runner start contact.

If the approval becomes consumed by another event between validation and consumption, the start path must fail closed before runner start contact.

---

## Required Future Successful Handoff Fields

A future successful handoff result must include:

```text
successfulStartConsumptionHandoffEvaluated
successfulStartConsumptionHandoffPassed
freshApprovalValidated
approvalConsumedBeforeStartContact
consumptionEvidenceCreated
consumptionEvidenceId
consumptionEvidencePath
consumptionEvidenceValid
approvalMutated
startEndpointContactedAfterConsumption
startEndpointContacted
runnerRunId
executionStarted
opencodeStarted
```

Required values for a future successful handoff:

```text
successfulStartConsumptionHandoffEvaluated: true
successfulStartConsumptionHandoffPassed: true
freshApprovalValidated: true
approvalConsumedBeforeStartContact: true
consumptionEvidenceCreated: true
consumptionEvidenceValid: true
approvalMutated: false
startEndpointContactedAfterConsumption: true
startEndpointContacted: true
runnerRunId: <non-null runner id>
```

The exact meaning of `executionStarted` and `opencodeStarted` must be defined by the future execution packet.

FP-MCP-077 does not define successful execution semantics.

It only defines the consumption-to-start handoff order.

---

## Required Future Failure Fields

If a future start attempt reaches the handoff boundary but cannot safely proceed, the result must distinguish:

```text
consumptionNotAttempted
consumptionAttempted
consumptionEvidenceCreated
consumptionEvidenceValid
blockedBeforeConsumption
blockedAfterConsumption
blockedAfterConsumptionReason
startEndpointContacted
runnerRunId
```

Examples:

### Blocked before consumption

```text
blockedBeforeConsumption: true
consumptionEvidenceCreated: false
approvalConsumedBeforeStartContact: false
startEndpointContacted: false
```

### Blocked after consumption

```text
blockedAfterConsumption: true
consumptionEvidenceCreated: true
approvalConsumedBeforeStartContact: true
startEndpointContacted: false
runnerRunId: null
```

The second case must use FP-MCP-076 classification.

---

## Required Atomicity Model

The future implementation must treat validation and consumption as separate observations.

Validation does not spend approval.

Consumption spends approval.

Runner start contact must not occur before consumption evidence is created and validated.

The implementation must fail closed if it cannot determine whether consumption happened.

A future packet must define how to classify ambiguous states such as:

```text
consumption artifact write succeeded but response failed
consumption artifact created but verification read failed
consumption created and runner contact attempted but runner response lost
runner start endpoint contacted but runnerRunId unknown
```

FP-MCP-077 does not implement those ambiguous-state classifications.

It requires that they be handled before execution enablement is considered complete.

---

## Required Audit Boundary

Future successful handoff evidence must allow an auditor to answer:

```text
Which approval was validated?
Which request was approved?
Which exact commit and branch were approved?
Was the approval fresh at consumption time?
Was the approval unconsumed before this attempt?
Where is the consumption artifact?
Was the approval artifact mutated?
Was the runner start endpoint contacted before or after consumption?
Was a runnerRunId created?
Was OpenCode started?
```

If these questions cannot be answered from evidence, the handoff must not be admitted.

---

## Interaction With Existing Packets

FP-MCP-077 does not replace FP-MCP-070.

FP-MCP-070 defines the general single-use consumption contract.

FP-MCP-077 defines the future successful-start handoff ordering.

FP-MCP-077 does not replace FP-MCP-076.

FP-MCP-076 defines blocked-after-consumption classification.

FP-MCP-077 defines how a future successful handoff must occur without skipping consumption.

---

## Current Evidence Boundary

The existing FP-MCP-071 consumption artifact is not a successful-start handoff.

Reason:

```text
FP-MCP-071 was a non-executing consumption recorder probe.
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

FP-MCP-077 must not reclassify FP-MCP-071 as a successful start handoff.

Existing evidence remains:

```text
NON_EXECUTING_CONSUMPTION_RECORDER_EVIDENCE
```

---

## Required Checkpoint Claims

FP-MCP-077 must explicitly claim:

```text
successfulStartConsumptionHandoffContractDefined: true
freshApprovalConsumptionBoundaryDefined: true
runnerStartContactMustFollowConsumption: true
currentConsumedFixtureReclassified: false
newApprovalEvidenceCreated: false
newConsumptionEvidenceCreated: false
approvalArtifactMutated: false
consumptionArtifactMutated: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerRunIdCreated: false
```

---

## Verification Requirements

Verification must include:

1. Repository status.
2. OpenCode status.
3. Disable-switch status.
4. Confirmation that FP-MCP-077 is contract-only.
5. Confirmation that no new approval evidence was created.
6. Confirmation that no new consumption evidence was created.
7. Confirmation that the FP-MCP-071 consumption artifact was not reclassified.
8. Confirmation that the original approval artifact was not mutated.
9. Confirmation that execution remains disabled.
10. Confirmation that the runner start endpoint was not contacted.
11. Confirmation that OpenCode was not started.
12. Confirmation that no runnerRunId was created.

Expected verification result:

```text
successfulStartConsumptionHandoffContractDefined: true
freshApprovalConsumptionBoundaryDefined: true
runnerStartContactMustFollowConsumption: true
currentConsumedFixtureReclassified: false
newApprovalEvidenceCreated: false
newConsumptionEvidenceCreated: false
approvalArtifactMutated: false
consumptionArtifactMutated: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerRunIdCreated: false
```

---

## Expected Artifacts

FP-MCP-077 should record:

```text
docs/successful-start-consumption-handoff-contract.md
runs/FP-MCP-077/handoff-contract-result.json
runs/FP-MCP-077/executor-result.md
runs/FP-MCP-077/verification.txt
```

---

## Non-Goals

FP-MCP-077 must not:

```text
create approval evidence
create consumption evidence
consume an approval
mutate approval artifacts
mutate consumption artifacts
reclassify FP-MCP-071 consumption evidence as a successful start handoff
implement the future start-path consumption handoff
enable runner execution
enable OpenCode execution
contact the runner start endpoint
start OpenCode
create a real runnerRunId
create real execution artifacts
change model routing
change model selection
call model providers
```

---

## Non-Authorization Statement

FP-MCP-077 does not authorize execution.

FP-MCP-077 does not enable execution.

FP-MCP-077 does not consume approval evidence.

FP-MCP-077 does not satisfy final execution readiness.

FP-MCP-077 only defines the future successful-start consumption handoff contract.

