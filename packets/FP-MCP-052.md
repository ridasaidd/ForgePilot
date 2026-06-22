# FP-MCP-052 — Pre-Start Evidence Dry-Run Recorder

## Status

DRAFT

## Type

MCP bridge safety / evidence artifact recording

## Summary

Add a non-executing MCP tool that records a pre-start evidence artifact in dry-run form for an existing ForgePilot request artifact.

The tool must not enable execution, start OpenCode, contact the runner start endpoint, create real approval, mutate request artifacts, or claim that execution is permitted.

This packet follows FP-MCP-050 and FP-MCP-051.

FP-MCP-050 defined the pre-start evidence contract.
FP-MCP-051 added a read-only validator that reports missing pre-start evidence.
FP-MCP-052 creates the first durable pre-start evidence artifact, explicitly marked as dry-run and non-executing.

## Goal

Provide an observable artifact showing what ForgePilot would require immediately before a future start request, while preserving the current execution-disabled boundary.

The artifact should make the following explicit:

```text
preStartEvidenceRecorded: true
dryRun: true
executionPermitted: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerContactedForStart: false
disableSwitchActive: true
```

## Non-Goals

This packet must not:

* enable runner execution
* enable OpenCode execution
* contact the runner start endpoint
* start OpenCode
* execute a model
* create a real human approval record
* mark approval as sufficient for execution
* mark pre-start evidence as final execution evidence
* admit evidence into observatory outputs
* mutate existing request artifacts
* weaken the disable-switch precedence
* bypass FP-MCP-047, FP-MCP-048, FP-MCP-049, or FP-MCP-051

## Required MCP Tool

Add one MCP tool:

```text
forgepilot_record_pre_start_evidence_dry_run
```

### Inputs

```json
{
  "packetId": "FP-MCP-036",
  "requestId": "REQ-20260622T144553300Z-fbbe8d82"
}
```

### Behavior

The tool must:

1. Validate the request artifact using existing local validation.
2. Evaluate guarded execution preflight.
3. Evaluate disable-switch status.
4. Record a dry-run pre-start evidence artifact under:

   ```text
   runs/<packetId>/pre-start-evidence/<requestId>.json
   ```

5. Use create-only behavior for the evidence artifact.
6. Refuse to overwrite an existing pre-start evidence artifact.
7. Return a structured result describing whether the dry-run evidence artifact was recorded.
8. Preserve non-execution fields as false.

## Required Output Fields

The tool output must include at least:

```text
schemaVersion
packetId
requestId
preStartEvidenceDryRunRecorded
preStartEvidencePath
preStartEvidenceArtifactCreated
preStartEvidenceArtifactAlreadyExists
executionPermitted
executionStarted
startEndpointContacted
opencodeStarted
runnerContactedForStart
requestArtifactValid
preflightEvaluated
disableSwitchEvaluated
disableSwitchActive
effectiveDisableReason
effectiveDisableScope
approvalObserved
approvalAccepted
artifactHashesPresent
artifactHashesConsistent
requestArtifactPath
requestArtifactSha256
modelId
runMode
baseCommit
currentCommit
boundaryVersion
statusSource
checkedAt
reasons
```

## Required Artifact Fields

The written JSON artifact must include at least:

```text
schemaVersion
artifactType
packetId
requestId
dryRun
recordedAt
executionPermitted
executionStarted
startEndpointContacted
opencodeStarted
runnerContactedForStart
requestArtifactPath
requestArtifactSha256
modelId
runMode
baseCommit
currentCommit
preflightSummary
disableSwitchSummary
approvalObservation
requiredEvidence
missingEvidence
reasons
boundaryVersion
```

## Required Artifact Semantics

The artifact must be explicitly non-executing:

```text
dryRun: true
executionPermitted: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerContactedForStart: false
```

The artifact must not claim approval exists unless it was explicitly observed.

In the current system state, the expected approval fields are:

```text
approvalObserved: false
approvalAccepted: false
```

## Expected Current Result

Using the existing FP-MCP-036 request artifact:

```text
packetId: FP-MCP-036
requestId: REQ-20260622T144553300Z-fbbe8d82
```

Expected result:

```text
preStartEvidenceDryRunRecorded: true
preStartEvidenceArtifactCreated: true
executionPermitted: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerContactedForStart: false
requestArtifactValid: true
disableSwitchActive: true
approvalObserved: false
approvalAccepted: false
```

The dry-run artifact may still report incomplete evidence because real human approval has not been recorded and execution remains disabled.

That is expected.

## Existing Artifact Behavior

If the artifact already exists, the tool must not overwrite it.

Expected second-call result:

```text
preStartEvidenceDryRunRecorded: false
preStartEvidenceArtifactCreated: false
preStartEvidenceArtifactAlreadyExists: true
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

The result must include a reason such as:

```text
PRE_START_EVIDENCE_ALREADY_EXISTS
```

## Safety Requirements

The tool must preserve all of these invariants:

```text
executionPermitted: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerContactedForStart: false
```

It must not call:

```text
/runner/start
```

It must not start OpenCode.

It must not create real approval.

It must not change runner execution enablement.

It must not change OpenCode execution enablement.

## Verification Requirements

Verification must show:

1. TypeScript build passes.
2. MCP service restarts successfully.
3. Tool is exposed as:

   ```text
   forgepilot_record_pre_start_evidence_dry_run
   ```

4. First call records a dry-run artifact.
5. Second call refuses to overwrite the artifact.
6. The written artifact exists at the expected path.
7. The written artifact is valid JSON.
8. The written artifact contains dry-run and non-execution fields.
9. No runner start endpoint was contacted.
10. OpenCode was not started.
11. Execution remains disabled.

## Evidence Artifacts

Expected run artifacts:

```text
runs/FP-MCP-052/executor-result.md
runs/FP-MCP-052/verification.txt
```

Additional evidence may include:

```text
runs/FP-MCP-036/pre-start-evidence/REQ-20260622T144553300Z-fbbe8d82.json
runs/FP-MCP-052/pre-start-evidence-dry-run-result.json
runs/FP-MCP-052/pre-start-evidence-dry-run-repeat-result.json
```

## Acceptance Criteria

FP-MCP-052 is accepted only if:

* the packet is committed
* the MCP bridge implementation is committed
* the tool records a dry-run pre-start evidence artifact
* the artifact is create-only
* a repeat call does not overwrite the artifact
* execution remains disabled
* `startEndpointContacted` remains false
* `opencodeStarted` remains false
* `executionStarted` remains false
* verification artifacts are committed

