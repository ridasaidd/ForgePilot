# Successful Start Consumption Handoff Contract

## Packet

FP-MCP-077 — Successful Start Consumption Handoff Contract

## Result

PASS

## Contract Defined

FP-MCP-077 defines the future successful-start handoff order:

```text
fresh approval validated
approval consumption evidence created
consumption evidence verified
runner start endpoint may be contacted only after consumption
```

This contract does not enable execution.

This contract does not consume an approval.

This contract does not contact the runner start endpoint.

## Required Future Handoff Order

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

## Non-Bypass Rule

A future start path must not contact the runner start endpoint unless it can show:

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

If consumption creation or verification fails, the start path must fail closed before runner start contact.

## Required Future Successful Handoff Fields

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

## Failure Distinctions

Future implementation must distinguish:

```text
blockedBeforeConsumption
blockedAfterConsumption
consumptionNotAttempted
consumptionAttempted
consumptionEvidenceCreated
consumptionEvidenceValid
startEndpointContacted
runnerRunId
```

Blocked-after-consumption cases must use the FP-MCP-076 classification boundary.

## Current Evidence Boundary

The existing FP-MCP-071 consumption artifact remains:

```text
artifactType: human-approval-consumption
classification: NON_EXECUTING_CONSUMPTION_RECORDER_EVIDENCE
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

FP-MCP-077 does not reclassify it as a successful start handoff.

## Safety Boundary

```text
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

## Current Runtime Safety State

```text
OpenCode execution enabled: false
runner execution enabled: false
global disable switch active: true
executionAllowedNow: false
```

## Conclusion

FP-MCP-077 passes.

The successful-start consumption handoff contract is defined without enabling execution, creating new consumption evidence, mutating existing evidence, contacting the runner start endpoint, or starting OpenCode.

