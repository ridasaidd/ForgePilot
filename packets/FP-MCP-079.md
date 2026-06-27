# FP-MCP-079 — Ambiguous Start State Classification Contract

## Status

DRAFT

## Type

Contract / classification packet

## Depends On

- FP-MCP-070 — Single-Use Approval Consumption Contract
- FP-MCP-076 — Post-Consumption Blocked Attempt Classification
- FP-MCP-077 — Successful Start Consumption Handoff Contract
- FP-MCP-078 — Execution Enablement Readiness Review

## Task

Define the classification contract for ambiguous or unknown guarded start states.

FP-MCP-079 addresses cases where the system cannot confidently determine whether consumption, runner contact, runner start, OpenCode start, or runnerRunId creation occurred.

FP-MCP-079 must not implement runtime behavior.

FP-MCP-079 must not create approval evidence.

FP-MCP-079 must not create consumption evidence.

FP-MCP-079 must not mutate existing evidence.

FP-MCP-079 must not enable execution.

FP-MCP-079 must not contact the runner start endpoint.

FP-MCP-079 must not start OpenCode.

---

## Goal

FP-MCP-079 answers one question:

> How should ForgePilot classify a guarded start attempt when the start state is uncertain?

The expected result is:

```text
ambiguousStartStateClassificationDefined: true
unknownStateFailsClosed: true
executionEnablementAuthorized: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerRunIdCreated: false
```

This is a successful result.

---

## Why This Packet Exists

FP-MCP-077 identified unresolved ambiguous states, including:

```text
consumption artifact write succeeded but response failed
consumption artifact created but verification read failed
consumption created and runner contact attempted but runner response lost
runner start endpoint contacted but runnerRunId unknown
```

These states must not be left to ad hoc interpretation.

Unknown execution state must be observable, explicit, and fail closed.

---

## Core Rule

ForgePilot must distinguish:

```text
NO_START_ATTEMPT
BLOCKED_BEFORE_CONSUMPTION
BLOCKED_AFTER_CONSUMPTION
CONSUMED_AND_STARTED
AMBIGUOUS_START_STATE
```

FP-MCP-079 defines only:

```text
AMBIGUOUS_START_STATE
```

An ambiguous start state is not success.

An ambiguous start state is not safe to retry automatically.

An ambiguous start state does not make approval reusable.

An ambiguous start state must preserve all evidence exactly as observed.

---

## Ambiguous State Classes

Future implementations must distinguish at least:

```text
CONSUMPTION_WRITE_STATUS_UNKNOWN
CONSUMPTION_VERIFICATION_STATUS_UNKNOWN
CONSUMPTION_CREATED_START_CONTACT_UNKNOWN
START_ENDPOINT_CONTACT_STATUS_UNKNOWN
RUNNER_RESPONSE_STATUS_UNKNOWN
RUNNER_RUN_ID_STATUS_UNKNOWN
OPENCODE_START_STATUS_UNKNOWN
ARTIFACT_WRITE_STATUS_UNKNOWN
POST_START_STATE_STATUS_UNKNOWN
```

These classes may be refined later, but the distinctions must remain observable.

---

## Required Ambiguous-State Fields

Future ambiguous-state evidence must include:

```text
ambiguousStartStateClassified
ambiguousStartState
ambiguousStartStateClass
ambiguousStartStateReason
knownFacts
unknownFacts
approvalId
requestId
consumptionEvidenceCreated
consumptionEvidenceId
consumptionEvidencePath
consumptionEvidenceValid
approvalConsumed
approvalUsableForExecution
startEndpointContacted
startEndpointContactStatusKnown
runnerRunId
runnerRunIdStatusKnown
opencodeStarted
opencodeStartStatusKnown
executionStarted
executionStartStatusKnown
retryAutomaticallyAllowed
manualReviewRequired
quarantineRequired
```

Required values for ambiguous states:

```text
ambiguousStartStateClassified: true
ambiguousStartState: true
approvalUsableForExecution: false
retryAutomaticallyAllowed: false
manualReviewRequired: true
```

If a valid consumption artifact may have been created, then:

```text
approvalConsumed: true
approvalUsableForExecution: false
```

must be the safe default until manual review resolves otherwise.

---

## Fail-Closed Semantics

If the system cannot determine whether a start boundary was crossed, it must fail closed.

Fail closed means:

```text
executionAllowedNow: false
approvalUsableForExecution: false
retryAutomaticallyAllowed: false
manualReviewRequired: true
```

If runner contact status is unknown, the system must not claim:

```text
startEndpointContacted: false
```

It must instead report:

```text
startEndpointContactStatusKnown: false
startEndpointContacted: null
```

If runnerRunId status is unknown, the system must not claim:

```text
runnerRunId: null
```

It must instead report:

```text
runnerRunIdStatusKnown: false
runnerRunId: null
```

where null means unknown, not absent, unless explicitly qualified.

---

## Required Known / Unknown Fact Separation

Ambiguous-state evidence must separate known facts from unknown facts.

Example:

```json
{
  "knownFacts": {
    "requestArtifactValidated": true,
    "approvalValidationPassed": true,
    "consumptionWriteAttempted": true
  },
  "unknownFacts": {
    "consumptionWriteSucceeded": true,
    "startEndpointContacted": true,
    "runnerRunIdCreated": true,
    "opencodeStarted": true
  }
}
```

The example means the fact is unknown, not true.

Field names inside `unknownFacts` identify what is unknown.

They must not be interpreted as affirmative claims.

---

## Non-Reuse Rule

If ambiguity exists at or after the consumption boundary, the approval must not be reused automatically.

A future validator must treat the approval as unusable until a manual review or future recovery packet explicitly resolves the ambiguity.

Required safe state:

```text
approvalUsableForExecution: false
APPROVAL_STATUS_AMBIGUOUS
MANUAL_REVIEW_REQUIRED
```

If valid consumption evidence is present, the approval remains consumed.

If consumption evidence status is unknown, the approval remains non-reusable until resolved.

---

## Relationship To Quarantine

Ambiguous start-state evidence should be eligible for quarantine.

Quarantine does not mean the system knows execution started.

Quarantine means the system lacks enough evidence to safely classify the start attempt as blocked, started, or absent.

A future admission policy must decide whether ambiguous-state evidence is:

```text
QUARANTINED
REJECTED
DEFERRED
```

FP-MCP-079 does not implement admission.

---

## Required Future Evidence Shape

A future ambiguous-start-state artifact should be JSON and should include:

```json
{
  "schemaVersion": "FP-MCP-079",
  "artifactType": "ambiguous-start-state",
  "attemptId": "ATTEMPT-<UTC timestamp>-<opaque suffix>",
  "requestId": "<request id>",
  "approvalId": "<approval id>",
  "consumptionId": "<consumption id or null>",
  "ambiguousStartStateClassified": true,
  "ambiguousStartState": true,
  "ambiguousStartStateClass": "<class>",
  "ambiguousStartStateReason": "<reason>",
  "knownFacts": {},
  "unknownFacts": {},
  "approvalUsableForExecution": false,
  "retryAutomaticallyAllowed": false,
  "manualReviewRequired": true,
  "quarantineRequired": true
}
```

This is illustrative only.

FP-MCP-079 must not create this artifact.

---

## Required Checkpoint Claims

FP-MCP-079 must explicitly claim:

```text
ambiguousStartStateClassificationDefined: true
unknownStateFailsClosed: true
manualReviewRequiredForAmbiguousStartState: true
automaticRetryAllowedForAmbiguousStartState: false
newApprovalEvidenceCreated: false
newConsumptionEvidenceCreated: false
approvalArtifactMutated: false
consumptionArtifactMutated: false
executionEnablementAuthorized: false
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
3. Remote runner capability status.
4. Execution disable switch status.
5. Execution enablement status.
6. Confirmation that FP-MCP-079 is contract/classification-only.
7. Confirmation that no approval evidence was created.
8. Confirmation that no consumption evidence was created.
9. Confirmation that execution remains disabled.
10. Confirmation that the runner start endpoint was not contacted.
11. Confirmation that OpenCode was not started.
12. Confirmation that no runnerRunId was created.

Expected verification result:

```text
ambiguousStartStateClassificationDefined: true
unknownStateFailsClosed: true
executionEnablementAuthorized: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerRunIdCreated: false
```

---

## Expected Artifacts

FP-MCP-079 should record:

```text
docs/ambiguous-start-state-classification-contract.md
runs/FP-MCP-079/classification-contract-result.json
runs/FP-MCP-079/executor-result.md
runs/FP-MCP-079/verification.txt
```

---

## Non-Goals

FP-MCP-079 must not:

```text
enable execution
relax the global disable switch
create approval evidence
create consumption evidence
consume an approval
mutate evidence
contact the runner start endpoint
start OpenCode
create a runnerRunId
call model providers
implement successful-start handoff
implement recovery from ambiguous state
implement manual review workflow
implement quarantine/admission
```

---

## Non-Authorization Statement

FP-MCP-079 does not authorize execution.

FP-MCP-079 does not relax the disable switch.

FP-MCP-079 does not satisfy final execution readiness.

FP-MCP-079 only defines how ambiguous start states must be classified and fail closed.

