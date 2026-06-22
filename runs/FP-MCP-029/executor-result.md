# FP-MCP-029 Executor Result

## Packet

FP-MCP-029 — Guarded Start Non-Execution Verification

## Result

PASS_WITH_OBSERVABILITY_FOLLOWUP

## Summary

FP-MCP-029 verified the guarded remote runner start path after FP-MCP-028 fixed request artifact lifecycle validation.

A fresh FP-MCP-029 request artifact was created, committed, validated locally, validated through the private runner endpoint, and then submitted once through the guarded start tool.

The guarded start path preserved the safety boundary.

Execution did not start.

OpenCode did not start.

Runner execution remained disabled.

The packet also exposed an observability follow-up: the guarded start rejection was recorded as a generic protocol/rejection pair rather than preserving the runner's more specific non-execution reason.

## Packet Commit

16cf814 Add FP-MCP-029 guarded start verification

## Request Artifact Commit

82ec7ce Record FP-MCP-029 request artifact

## Request Artifact

Request id:

REQ-20260622T112059183Z-2023d0c0

Request artifact path:

runs/FP-MCP-029/opencode-requests/REQ-20260622T112059183Z-2023d0c0.json

Request artifact SHA-256:

19628e2d742a9cd5d5735ae2468485bb21c4d26eb560fc98334a9a6738f9a944

Model:

qwen-3.7-max

Run mode:

DESIGN_ONLY

## Lifecycle Evidence

creationCommit:

16cf814

artifactCommit:

82ec7ce

currentCommit:

82ec7ce

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

null

reasons:

- RUNNER_PROTOCOL_ERROR
- RUNNER_REJECTED_REQUEST

## Start State Artifact

Path:

runs/FP-MCP-029/qwen-3.7-max-DESIGN_ONLY/remote-runner-start-state.json

Observed content summary:

- schemaVersion: FP-MCP-022
- packetId: FP-MCP-029
- requestId: REQ-20260622T112059183Z-2023d0c0
- runnerRunId: null
- runnerContacted: true
- executionStarted: false
- status: RUNNER_REJECTED
- reasons:
  - RUNNER_PROTOCOL_ERROR
  - RUNNER_REJECTED_REQUEST

## Interpretation

FP-MCP-029 passed the primary safety objective.

The guarded start path can be reached after validation passes, and it preserves non-execution.

The runner start endpoint was contacted, but execution did not begin.

The bridge recorded both pre-start and post-start state.

The returned rejection reason is less precise than ideal. The runner-side non-execution boundary is preserved, but the bridge-level guarded start result collapses the rejection into protocol/rejection reasons.

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

PASS_WITH_OBSERVABILITY_FOLLOWUP

## Recommended Follow-Up

Create a follow-up packet to improve guarded start rejection classification so the bridge preserves specific runner non-execution reasons instead of collapsing them into generic protocol/rejection reasons.

Possible follow-up:

FP-MCP-030 — Guarded Start Rejection Classification
