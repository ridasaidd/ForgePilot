# FP-MCP-031 Executor Result

## Packet

FP-MCP-031 — Runner Start Response Contract

## Result

PASS_WITH_IMPLEMENTATION_FOLLOWUP

## Summary

FP-MCP-031 added the runner `/runner/start-run` response contract and verified the current guarded start behavior against it.

The primary safety boundary was preserved.

The guarded start path did not start execution.

OpenCode did not start.

Runner execution remained disabled.

The MCP bridge preserved the structured non-execution reason:

```text
EXECUTION_NOT_IMPLEMENTED
```

and did not emit the generic FP-MCP-029-era reasons:

```text
RUNNER_PROTOCOL_ERROR
RUNNER_REJECTED_REQUEST
```

However, the generated state artifact still records:

```text
status: RUNNER_REJECTED
```

rather than the newly documented contract vocabulary:

```text
NOT_IMPLEMENTED
```

or:

```text
REJECTED
```

Therefore FP-MCP-031 is classified as `PASS_WITH_IMPLEMENTATION_FOLLOWUP`.

The contract is documented and the important reason-code behavior conforms, but the state artifact status vocabulary needs a follow-up implementation alignment.

## Packet Commit

d6c9d55 Add FP-MCP-031 runner start response contract

## Contract Documentation Commit

2331215 Document runner start response contract

## Request Artifact Commit

ba0133f Record FP-MCP-031 request artifact

## Request Artifact

Request id:

REQ-20260622T124849179Z-e46928b8

Request artifact path:

runs/FP-MCP-031/opencode-requests/REQ-20260622T124849179Z-e46928b8.json

Request artifact SHA-256:

b37b3be656353d60a193dbacf00d9edd6c82254858879ab53d500ff29a003678

Model:

qwen-3.7-max

Run mode:

DESIGN_ONLY

## Lifecycle Evidence

creationCommit:

2331215

artifactCommit:

ba0133f

currentCommit:

ba0133f

creationCommitExists:

true

artifactCommitExists:

true

creationCommitAncestorOfArtifactCommit:

true

artifactCommitReachableFromHead:

true

## Local Validation Result

eligible:

true

runnerContacted:

false

requestArtifactValid:

true

modelAllowed:

true

runModeAllowed:

true

workingTreeClean:

true

baseCommitMatches:

true

safeArtifactDir:

true

executionEnabled:

false

executionStarted:

false

reasons:

[]

## Remote Runner Endpoint Validation Result

valid:

true

runnerConfigured:

true

runnerContacted:

true

runnerAccepted:

true

executionEnabled:

false

executionStarted:

false

runnerProtocolVersion:

forgepilot-runner-v1

reasons:

[]

## Guarded Start Result

started:

false

accepted:

false

approvalAccepted:

true

runnerConfigured:

true

runnerContacted:

true

startEndpointContacted:

true

executionStarted:

false

localValidationPassed:

true

remoteValidationPassed:

true

preStartStateRecorded:

true

postStartStateRecorded:

true

runnerRunId:

null

runnerProtocolVersion:

forgepilot-runner-v1

reasons:

- EXECUTION_NOT_IMPLEMENTED

## State Artifact

Path:

runs/FP-MCP-031/qwen-3.7-max-DESIGN_ONLY/remote-runner-start-state.json

Observed content summary:

- schemaVersion: FP-MCP-022
- packetId: FP-MCP-031
- requestId: REQ-20260622T124849179Z-e46928b8
- runnerRunId: null
- runnerContacted: true
- executionStarted: false
- status: RUNNER_REJECTED
- reasons:
  - EXECUTION_NOT_IMPLEMENTED

## Contract Conformance Assessment

### Conforms

The current guarded start result conforms to the contract in these ways:

- `accepted: false`
- `executionStarted: false`
- `runnerRunId: null`
- `runnerProtocolVersion: forgepilot-runner-v1`
- `EXECUTION_NOT_IMPLEMENTED` is preserved
- `RUNNER_PROTOCOL_ERROR` is not emitted for a valid structured non-execution response
- `RUNNER_REJECTED_REQUEST` is not emitted for a valid structured non-execution response
- execution remains disabled
- OpenCode does not start

### Requires Follow-Up

The state artifact status vocabulary does not yet conform to the FP-MCP-031 contract.

Observed:

```text
RUNNER_REJECTED
```

Documented allowed status vocabulary:

```text
ACCEPTED
REJECTED
NOT_IMPLEMENTED
PROTOCOL_ERROR
TRANSPORT_FAILURE
```

Expected status for the current runner skeleton:

```text
NOT_IMPLEMENTED
```

This is an implementation alignment issue, not a safety failure.

## Safety Confirmation

OpenCode started:

NO

OpenCode CLI invoked:

NO

OpenCode API invoked:

NO

Runner execution enabled:

NO

Shell executed through runner:

NO

Secrets committed:

NO

Runner publicly exposed:

NO

Guarded start tool called:

YES, exactly once.

## Final Status

PASS_WITH_IMPLEMENTATION_FOLLOWUP

## Recommended Follow-Up

Create a follow-up packet to align the guarded start state artifact and bridge-exposed status vocabulary with the FP-MCP-031 response contract.

Recommended next packet:

FP-MCP-032 — Runner Start Status Vocabulary Alignment

The likely target is the MCP bridge state recording layer that currently writes:

```text
status: RUNNER_REJECTED
```

for an `EXECUTION_NOT_IMPLEMENTED` structured non-execution response.
