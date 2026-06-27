# Ambiguous Start State Classification Contract

## Packet

FP-MCP-079 — Ambiguous Start State Classification Contract

## Result

PASS

## Classification Defined

FP-MCP-079 defines:

```text
AMBIGUOUS_START_STATE
```

This classification applies when ForgePilot cannot confidently determine whether a guarded start boundary was crossed.

## Core Rule

Unknown must not be silently treated as false.

If the system cannot prove that runner contact, runnerRunId creation, OpenCode start, artifact write, or consumption status did not happen, it must represent that fact as unknown and fail closed.

## Defined State Families

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

## Ambiguous State Classes

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

## Required Fail-Closed Semantics

```text
unknownStateFailsClosed: true
approvalUsableForExecution: false
retryAutomaticallyAllowed: false
manualReviewRequired: true
executionAllowedNow: false
```

If ambiguity exists at or after the consumption boundary, approval must not be reused automatically.

## Required Known / Unknown Separation

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

Fields inside `unknownFacts` identify what is unknown. They must not be interpreted as affirmative claims.

## Current Safety State

```text
repoCommit: 5c02122
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

FP-MCP-079 passes.

The ambiguous start-state classification contract is defined, and the system remains fail-closed with execution disabled.

