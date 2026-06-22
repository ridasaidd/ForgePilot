# FP-MCP-056 — Start State Snapshot Dry-Run Recorder

## Status

Proposed

## Type

MCP bridge safety / dry-run evidence recording

## Parent context

This packet follows:

- FP-MCP-050 — Start Request Pre-Start Evidence Contract
- FP-MCP-051 — Pre-Start Evidence Validation Tool
- FP-MCP-052 — Pre-Start Evidence Dry-Run Recorder
- FP-MCP-053 — Start Request Evidence Gate Enforcement
- FP-MCP-054 — Start Request Pre/Post State Snapshot Contract
- FP-MCP-055 — Start Request State Snapshot Validation Tool

FP-MCP-054 defined the required pre-start and post-start state snapshot contract.

FP-MCP-055 added a read-only validator that reports snapshot evidence as incomplete when no pre/post state snapshots exist.

FP-MCP-056 adds a non-executing dry-run recorder that writes contract-shaped snapshot artifacts so the validator can observe complete snapshot evidence without starting OpenCode or contacting the runner start endpoint.

## Goal

Add an MCP tool that records start request state snapshot artifacts in dry-run form.

The tool must answer one question:

> Can ForgePilot record the required pre/post start state snapshot evidence without crossing the execution boundary?

## Required tool

Add a new MCP tool:

```text
forgepilot_record_start_state_snapshot_dry_run
```

## Tool input

```json
{
  "packetId": "FP-MCP-036",
  "requestId": "REQ-20260622T144553300Z-fbbe8d82",
  "approval": "START_REMOTE_RUNNER_REQUEST"
}
```

The approval value is observational only. It must not enable execution.

## Tool behavior

The tool may write files only under the state snapshot dry-run evidence path for the given packet and request.

It must:

1. Validate the request artifact identity.
2. Validate pre-start evidence state using the existing FP-MCP-051 validator or equivalent local logic.
3. Evaluate the disable switch state.
4. Observe approval acceptance or rejection.
5. Create a unique dry-run snapshot attempt id.
6. Write a pre-start state snapshot artifact.
7. Write a post-start state snapshot artifact.
8. Preserve execution boundary indicators as false in both snapshots.
9. Return hashes and paths for both artifacts.
10. Refuse to overwrite an existing snapshot attempt.

The tool must not contact the runner start endpoint.

The tool must not start OpenCode.

The tool must not enable runner execution.

The tool must not enable OpenCode execution.

## Snapshot artifact path

Use the contract path defined by `docs/start-request-state-snapshot-contract.md`.

If no stricter contract path is discovered, use:

```text
runs/<packetId>/start-state-snapshots/<requestId>/<attemptId>/pre-start.json
runs/<packetId>/start-state-snapshots/<requestId>/<attemptId>/post-start.json
```

The attempt id must be stable enough for later validation and unique enough to avoid overwriting previous dry-run attempts.

Recommended format:

```text
ATTEMPT-<UTC timestamp>-<short random suffix>
```

## Required pre-start snapshot fields

The pre-start snapshot must include at least:

```json
{
  "schemaVersion": "FP-MCP-056",
  "snapshotKind": "pre-start",
  "packetId": "FP-MCP-036",
  "requestId": "REQ-20260622T144553300Z-fbbe8d82",
  "attemptId": "ATTEMPT-...",
  "requestArtifactPath": "runs/FP-MCP-036/opencode-requests/REQ-...json",
  "requestArtifactSha256": "<sha256>",
  "preStartEvidencePath": "runs/FP-MCP-036/pre-start-evidence/REQ-...json",
  "preStartEvidenceSha256": "<sha256>",
  "preStartEvidenceValid": true,
  "disableSwitchActive": true,
  "approvalAccepted": true,
  "executionPermitted": false,
  "executionStarted": false,
  "startEndpointContacted": false,
  "opencodeStarted": false,
  "runnerContactedForStart": false,
  "recordedAt": "<ISO-8601 timestamp>",
  "statusSource": "ForgePilot non-executing start state snapshot dry-run recorder"
}
```

## Required post-start snapshot fields

The post-start snapshot must include at least:

```json
{
  "schemaVersion": "FP-MCP-056",
  "snapshotKind": "post-start",
  "packetId": "FP-MCP-036",
  "requestId": "REQ-20260622T144553300Z-fbbe8d82",
  "attemptId": "ATTEMPT-...",
  "requestArtifactPath": "runs/FP-MCP-036/opencode-requests/REQ-...json",
  "requestArtifactSha256": "<sha256>",
  "preStartEvidencePath": "runs/FP-MCP-036/pre-start-evidence/REQ-...json",
  "preStartEvidenceSha256": "<sha256>",
  "preStartSnapshotPath": "runs/.../pre-start.json",
  "preStartSnapshotSha256": "<sha256>",
  "disableSwitchActive": true,
  "approvalAccepted": true,
  "executionPermitted": false,
  "executionStarted": false,
  "startEndpointContacted": false,
  "opencodeStarted": false,
  "runnerContactedForStart": false,
  "recordedAt": "<ISO-8601 timestamp>",
  "statusSource": "ForgePilot non-executing start state snapshot dry-run recorder"
}
```

Because this packet is a dry-run recorder, the post-start snapshot is not evidence that a real start was attempted. It is evidence that ForgePilot can record the post-start state shape while preserving the non-execution boundary.

## Required output fields

The tool must return a structured observation object containing at least:

```json
{
  "schemaVersion": "FP-MCP-056",
  "packetId": "FP-MCP-036",
  "requestId": "REQ-20260622T144553300Z-fbbe8d82",
  "dryRunRecorded": true,
  "stateSnapshotAttemptId": "ATTEMPT-...",
  "preStartSnapshotRecorded": true,
  "postStartSnapshotRecorded": true,
  "preStartSnapshotPath": "runs/.../pre-start.json",
  "postStartSnapshotPath": "runs/.../post-start.json",
  "preStartSnapshotSha256": "<sha256>",
  "postStartSnapshotSha256": "<sha256>",
  "requestArtifactValid": true,
  "preStartEvidenceValid": true,
  "disableSwitchEvaluated": true,
  "disableSwitchActive": true,
  "approvalAccepted": true,
  "executionPermitted": false,
  "executionStarted": false,
  "startEndpointContacted": false,
  "opencodeStarted": false,
  "runnerContactedForStart": false,
  "boundaryVersion": "FP-MCP-056",
  "statusSource": "ForgePilot non-executing start state snapshot dry-run recorder",
  "checkedAt": "<ISO-8601 timestamp>",
  "reasons": []
}
```

## Required refusal behavior

The tool must not record snapshots when:

1. The request artifact is missing or invalid.
2. Pre-start evidence is missing or invalid.
3. Approval is not accepted.
4. The target attempt path already exists.
5. Required artifact hashes cannot be computed.

In refusal cases it must return:

```json
{
  "dryRunRecorded": false,
  "preStartSnapshotRecorded": false,
  "postStartSnapshotRecorded": false,
  "executionStarted": false,
  "startEndpointContacted": false,
  "opencodeStarted": false,
  "runnerContactedForStart": false,
  "reasons": [
    "STATE_SNAPSHOT_NOT_RECORDED"
  ]
}
```

With additional specific reasons such as:

```text
REQUEST_ARTIFACT_INVALID
PRE_START_EVIDENCE_INVALID
START_APPROVAL_REJECTED
APPROVAL_REQUIRED
STATE_SNAPSHOT_ATTEMPT_ALREADY_EXISTS
ARTIFACT_HASH_MISSING
```

## Execution boundary requirements

This packet must not:

- enable runner execution
- enable OpenCode execution
- contact the runner start endpoint
- start OpenCode
- create request artifacts
- create pre-start evidence artifacts
- mutate approvals
- admit evidence
- alter routing logic
- alter model selection logic
- call the runner start endpoint indirectly

This packet may write only dry-run state snapshot artifacts required by the contract.

## Validation interaction

After a successful dry-run recording, `forgepilot_validate_start_request_state_snapshot` must be able to observe complete snapshot evidence for the selected attempt.

Expected validator result after recording:

```json
{
  "stateSnapshotEvaluated": true,
  "stateSnapshotComplete": true,
  "stateSnapshotValid": true,
  "preStartSnapshotPresent": true,
  "postStartSnapshotPresent": true,
  "missingSnapshotEvidence": [],
  "inconsistentSnapshotEvidence": [],
  "startEndpointContacted": false,
  "executionStarted": false
}
```

## Negative test requirements

Verification must include at least:

1. Valid request with valid pre-start evidence and correct approval.
   - dry-run snapshots are recorded
   - both artifact hashes are returned
   - start endpoint is not contacted
   - OpenCode is not started

2. Wrong approval.
   - dry-run snapshots are not recorded
   - approval is rejected
   - start endpoint is not contacted
   - OpenCode is not started

3. Missing or invalid request artifact.
   - dry-run snapshots are not recorded
   - request artifact is rejected
   - start endpoint is not contacted
   - OpenCode is not started

4. Validator after successful recording.
   - state snapshot evidence becomes complete and valid
   - missing snapshot evidence is empty
   - no execution boundary is crossed

## Acceptance criteria

FP-MCP-056 is accepted only if:

- the new MCP tool is exposed
- the bridge builds successfully
- the tool records dry-run pre-start and post-start snapshots for a valid request
- the tool refuses invalid requests
- the tool refuses wrong approvals
- recorded snapshots preserve non-execution boundary indicators
- FP-MCP-055 validator observes complete snapshot evidence after recording
- no runner start endpoint is contacted
- OpenCode is not started
- execution remains disabled
- verification artifacts are recorded under `runs/FP-MCP-056/`

## Success state

At completion, ForgePilot can create contract-shaped start state snapshot evidence in dry-run form, and the existing snapshot validator can confirm that the recorded evidence is complete and internally consistent without any execution having occurred.
