# FP-MCP-028 Executor Result

## Packet

FP-MCP-028 — Request Artifact Commit Lifecycle Fix

## Result

PASS

## Summary

FP-MCP-028 fixed request artifact lifecycle validation across both the MCP bridge and private dev runner.

FP-MCP-027 exposed that a request artifact created at commit A and committed at commit B could not later pass validation if validation required:

request.baseCommit == current HEAD

FP-MCP-028 corrected this by separating:

- creationCommit
- artifactCommit
- currentCommit

## Implementation Commits

Main ForgePilot runner commit:

6171dc9 Fix runner request artifact lifecycle validation

MCP bridge commit:

f8e4146 Fix request artifact lifecycle validation

## Validation Artifact Used

Packet:

FP-MCP-027

Request artifact:

runs/FP-MCP-027/opencode-requests/REQ-20260619T212214986Z-a283929e.json

Request id:

REQ-20260619T212214986Z-a283929e

## Lifecycle Evidence

creationCommit:

10b92ae

artifactCommit:

2ae7666

currentCommit:

6171dc9

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

workingTreeClean:

true

baseCommitMatches:

true

runnerContacted:

false

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

## Safety Confirmation

OpenCode was not started.

OpenCode CLI was not invoked.

OpenCode API was not invoked.

Runner execution was not enabled.

The guarded start tool was not called.

No shell execution through the runner occurred.

No secrets were committed.

## Final Status

PASS
