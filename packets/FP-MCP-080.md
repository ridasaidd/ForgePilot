# FP-MCP-080 — Execution Recovery and Quarantine Contract

## Status

DRAFT

## Type

Contract packet

## Depends On

- FP-MCP-076 — Post-Consumption Blocked Attempt Classification
- FP-MCP-077 — Successful Start Consumption Handoff Contract
- FP-MCP-078 — Execution Enablement Readiness Review
- FP-MCP-079 — Ambiguous Start State Classification Contract

## Task

Define the recovery and quarantine contract for ambiguous, unsafe, or execution-adjacent start states.

FP-MCP-080 defines how ForgePilot must preserve evidence, prevent automatic retries, and require manual review when execution state cannot be safely classified.

FP-MCP-080 must not implement runtime behavior.

FP-MCP-080 must not create recovery artifacts.

FP-MCP-080 must not quarantine any existing artifact.

FP-MCP-080 must not mutate existing evidence.

FP-MCP-080 must not enable execution.

FP-MCP-080 must not contact the runner start endpoint.

FP-MCP-080 must not start OpenCode.

---

## Goal

FP-MCP-080 answers one question:

> What must ForgePilot do after an ambiguous or unsafe execution-adjacent state is observed?

The expected result is:

```text
executionRecoveryAndQuarantineContractDefined: true
quarantineContractDefined: true
manualReviewContractDefined: true
automaticRetryAllowed: false
evidenceMutationAllowed: false
executionEnablementAuthorized: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerRunIdCreated: false
```

This is a successful result.

---

## Core Rule

Recovery must be evidence-preserving.

Quarantine must be append-only.

Manual review must be explicit.

Automatic retry must be forbidden unless a future packet defines a safe retry path.

No recovery path may erase, overwrite, reinterpret, or silently repair execution-adjacent evidence.

---

## Quarantine Triggers

Future implementations must quarantine or require quarantine review for at least:

```text
AMBIGUOUS_START_STATE
CONSUMPTION_WRITE_STATUS_UNKNOWN
CONSUMPTION_VERIFICATION_STATUS_UNKNOWN
CONSUMPTION_CREATED_START_CONTACT_UNKNOWN
START_ENDPOINT_CONTACT_STATUS_UNKNOWN
RUNNER_RESPONSE_STATUS_UNKNOWN
RUNNER_RUN_ID_STATUS_UNKNOWN
OPENCODE_START_STATUS_UNKNOWN
ARTIFACT_WRITE_STATUS_UNKNOWN
POST_START_STATE_STATUS_UNKNOWN
DUPLICATE_CONSUMPTION_EVIDENCE
SCOPE_MISMATCHED_CONSUMPTION_EVIDENCE
MALFORMED_CONSUMPTION_EVIDENCE
START_CONTACT_WITHOUT_VALID_CONSUMPTION
RUNNER_RUN_ID_WITHOUT_VALID_START_EVIDENCE
OPENCODE_START_WITHOUT_VALID_RUNNER_EVIDENCE
```

The presence of a quarantine trigger does not prove execution occurred.

It proves that evidence is unsafe to admit automatically.

---

## Required Quarantine Artifact Contract

A future quarantine recorder must create append-only JSON evidence.

It must not mutate the artifact being quarantined.

Suggested path:

```text
runs/<packetId>/quarantine/<quarantineId>.json
```

Suggested id format:

```text
QUARANTINE-<UTC timestamp>-<opaque suffix>
```

Required fields:

```text
schemaVersion
artifactType
quarantineId
quarantineState
quarantineReason
quarantineReasons
sourceArtifactPaths
sourceArtifactIds
affectedApprovalId
affectedRequestId
affectedConsumptionId
affectedAttemptId
knownFacts
unknownFacts
manualReviewRequired
automaticRetryAllowed
evidenceMutationAllowed
quarantinedAt
quarantinedByTool
boundaryVersion
executionAllowedNow
executionStarted
startEndpointContacted
opencodeStarted
runnerRunId
```

Required values:

```text
artifactType: execution-quarantine-record
quarantineState: QUARANTINED
manualReviewRequired: true
automaticRetryAllowed: false
evidenceMutationAllowed: false
executionAllowedNow: false
```

---

## Manual Review Contract

Manual review must be a separate observed event.

Manual review must not mutate quarantine records.

Manual review must not mutate source artifacts.

A future manual review artifact must answer:

```text
What evidence was reviewed?
What was known?
What was unknown?
What classification was assigned?
Was the approval consumed?
Is the approval reusable?
Was runner contact confirmed?
Was runnerRunId creation confirmed?
Was OpenCode start confirmed?
What state transition is recommended?
```

Allowed manual review outcomes should include:

```text
CONFIRM_BLOCKED_BEFORE_CONSUMPTION
CONFIRM_BLOCKED_AFTER_CONSUMPTION
CONFIRM_CONSUMED_AND_STARTED
CONFIRM_NO_START_ATTEMPT
CONFIRM_EVIDENCE_INVALID
KEEP_QUARANTINED
DEFER_PENDING_MORE_EVIDENCE
```

Manual review must not directly enable execution.

---

## Recovery State Transitions

Future recovery logic must be explicit and append-only.

Allowed conceptual transitions:

```text
AMBIGUOUS_START_STATE -> QUARANTINED
QUARANTINED -> KEEP_QUARANTINED
QUARANTINED -> CONFIRMED_BLOCKED_BEFORE_CONSUMPTION
QUARANTINED -> CONFIRMED_BLOCKED_AFTER_CONSUMPTION
QUARANTINED -> CONFIRMED_CONSUMED_AND_STARTED
QUARANTINED -> CONFIRMED_NO_START_ATTEMPT
QUARANTINED -> EVIDENCE_INVALID
QUARANTINED -> DEFERRED_PENDING_MORE_EVIDENCE
```

Disallowed transitions:

```text
QUARANTINED -> EXECUTION_ALLOWED
QUARANTINED -> APPROVAL_REUSABLE
AMBIGUOUS_START_STATE -> APPROVAL_REUSABLE
AMBIGUOUS_START_STATE -> EXECUTION_SUCCESS
```

unless a future packet defines and verifies those transitions explicitly.

---

## Approval Reuse Rule

If ambiguity exists at or after the consumption boundary, approval must not be reused automatically.

Required safe state:

```text
approvalUsableForExecution: false
automaticRetryAllowed: false
manualReviewRequired: true
```

A manual review may classify the approval state, but it must not silently make the approval reusable.

A future packet must define any exceptional approval reuse policy.

---

## Evidence Admission Rule

Quarantined evidence must not influence observatory outputs as admitted execution evidence.

Quarantined evidence may influence safety dashboards or anomaly inventories.

Quarantined evidence must not influence model ranking, routing, or success metrics unless a future admission packet defines the exact treatment.

Required state:

```text
admissionState: QUARANTINED
admittedAsExecutionEvidence: false
```

---

## Required Checkpoint Claims

FP-MCP-080 must explicitly claim:

```text
executionRecoveryAndQuarantineContractDefined: true
quarantineContractDefined: true
manualReviewContractDefined: true
automaticRetryAllowed: false
evidenceMutationAllowed: false
approvalReuseAutomaticallyAllowed: false
quarantinedEvidenceAdmittedAsExecutionEvidence: false
newRecoveryArtifactCreated: false
newQuarantineArtifactCreated: false
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
6. Confirmation that FP-MCP-080 is contract-only.
7. Confirmation that no recovery artifact was created.
8. Confirmation that no quarantine artifact was created.
9. Confirmation that no approval evidence was created.
10. Confirmation that no consumption evidence was created.
11. Confirmation that existing evidence was not mutated.
12. Confirmation that execution remains disabled.
13. Confirmation that the runner start endpoint was not contacted.
14. Confirmation that OpenCode was not started.
15. Confirmation that no runnerRunId was created.

Expected verification result:

```text
executionRecoveryAndQuarantineContractDefined: true
quarantineContractDefined: true
manualReviewContractDefined: true
automaticRetryAllowed: false
evidenceMutationAllowed: false
executionEnablementAuthorized: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerRunIdCreated: false
```

---

## Expected Artifacts

FP-MCP-080 should record:

```text
docs/execution-recovery-and-quarantine-contract.md
runs/FP-MCP-080/contract-result.json
runs/FP-MCP-080/executor-result.md
runs/FP-MCP-080/verification.txt
```

---

## Non-Goals

FP-MCP-080 must not:

```text
enable execution
relax the global disable switch
create recovery artifacts
create quarantine artifacts
quarantine existing artifacts
create approval evidence
create consumption evidence
consume an approval
mutate evidence
contact the runner start endpoint
start OpenCode
create a runnerRunId
call model providers
implement recovery
implement manual review workflow
implement admission policy
```

---

## Non-Authorization Statement

FP-MCP-080 does not authorize execution.

FP-MCP-080 does not relax the disable switch.

FP-MCP-080 does not recover any artifact.

FP-MCP-080 does not quarantine any artifact.

FP-MCP-080 only defines the execution recovery and quarantine contract.

