# Execution Recovery and Quarantine Contract

## Packet

FP-MCP-080 — Execution Recovery and Quarantine Contract

## Result

PASS

## Contract Defined

FP-MCP-080 defines the recovery and quarantine contract for ambiguous, unsafe, or execution-adjacent start states.

```text
executionRecoveryAndQuarantineContractDefined: true
quarantineContractDefined: true
manualReviewContractDefined: true
automaticRetryAllowed: false
evidenceMutationAllowed: false
```

## Core Rule

Recovery must be evidence-preserving.

Quarantine must be append-only.

Manual review must be explicit.

Automatic retry is forbidden unless a future packet defines a safe retry path.

No recovery path may erase, overwrite, reinterpret, or silently repair execution-adjacent evidence.

## Quarantine Triggers

Future implementations must quarantine or require quarantine review for:

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

## Required Quarantine Record

A future quarantine recorder must create append-only JSON evidence.

It must not mutate the artifact being quarantined.

Required values:

```text
artifactType: execution-quarantine-record
quarantineState: QUARANTINED
manualReviewRequired: true
automaticRetryAllowed: false
evidenceMutationAllowed: false
executionAllowedNow: false
```

## Manual Review Contract

Manual review must be a separate observed event.

Manual review must not mutate quarantine records.

Manual review must not mutate source artifacts.

Allowed manual review outcomes include:

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

## Recovery State Transitions

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

## Current Safety State

```text
repoCommit: c3196ee
workingTreeCleanBeforeArtifacts: true
opencodeExecutionEnabled: false
runnerExecutionEnabled: false
globalDisableActive: true
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerRunIdCreated: false
```

The runner was reachable only through the capabilities endpoint:

```text
runnerReachable: true
executionEnabled: false
supportedOperations:
- capabilities
- validate-request
```

## Execution Enablement Blockers

```text
RUNNER_EXECUTION_CAPABILITY_NOT_PRESENT
OPENCODE_BOUNDARY_UNSATISFIED
SECRET_BOUNDARY_UNSATISFIED
NETWORK_BOUNDARY_UNSATISFIED
HUMAN_APPROVAL_NOT_RECORDED
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
```

## Safety Confirmations

```text
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

## Conclusion

FP-MCP-080 passes.

The recovery and quarantine contract is defined, and the system remains fail-closed with execution disabled.

