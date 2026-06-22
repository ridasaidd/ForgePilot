# FP-MCP-055 — Start Request State Snapshot Validation Tool

## Status

Proposed

## Type

MCP bridge safety / evidence validation

## Parent context

This packet follows:

- FP-MCP-050 — Start Request Pre-Start Evidence Contract
- FP-MCP-051 — Pre-Start Evidence Validation Tool
- FP-MCP-052 — Pre-Start Evidence Dry-Run Recorder
- FP-MCP-053 — Start Request Evidence Gate Enforcement
- FP-MCP-054 — Start Request Pre/Post State Snapshot Contract

FP-MCP-054 defined the contract for pre-start and post-start state snapshots around any future runner start attempt.

FP-MCP-055 adds a read-only validator for that contract.

## Goal

Add an MCP tool that validates whether required start request state snapshot evidence exists and is internally consistent for a given request.

The tool must answer one question:

> Is the required pre/post start request state snapshot evidence present, valid, and safe to use as evidence?

## Required tool

Add a new MCP tool:

```text
forgepilot_validate_start_request_state_snapshot
```

## Tool input

```json
{
  "packetId": "FP-MCP-036",
  "requestId": "REQ-20260622T144553300Z-fbbe8d82"
}
```

## Tool behavior

The tool must be read-only.

It must:

1. Validate the request artifact identity.
2. Locate the expected state snapshot artifact location.
3. Check for pre-start snapshot presence.
4. Check for post-start snapshot presence.
5. Validate snapshot shape if either artifact exists.
6. Validate snapshot consistency if both artifacts exist.
7. Report missing evidence explicitly.
8. Report inconsistent evidence explicitly.
9. Preserve all execution boundary indicators as false.

## Expected snapshot location

Unless the contract already defines a stricter path, use:

```text
runs/<packetId>/start-state-snapshots/<requestId>/pre-start.json
runs/<packetId>/start-state-snapshots/<requestId>/post-start.json
```

If the implementation discovers a canonical path in `docs/start-request-state-snapshot-contract.md`, it must follow the contract path instead.

## Required output fields

The tool must return a structured observation object containing at least:

```json
{
  "schemaVersion": "FP-MCP-055",
  "packetId": "FP-MCP-036",
  "requestId": "REQ-20260622T144553300Z-fbbe8d82",
  "stateSnapshotEvaluated": true,
  "stateSnapshotComplete": false,
  "stateSnapshotValid": false,
  "preStartSnapshotPresent": false,
  "preStartSnapshotValid": false,
  "postStartSnapshotPresent": false,
  "postStartSnapshotValid": false,
  "requestArtifactValid": true,
  "preStartEvidenceEvaluated": true,
  "preStartEvidenceValid": true,
  "disableSwitchEvaluated": true,
  "disableSwitchActive": true,
  "executionPermitted": false,
  "executionStarted": false,
  "startEndpointContacted": false,
  "opencodeStarted": false,
  "runnerContactedForStart": false,
  "missingSnapshotEvidence": [],
  "inconsistentSnapshotEvidence": [],
  "boundaryVersion": "FP-MCP-055",
  "statusSource": "ForgePilot start request state snapshot validation policy",
  "checkedAt": "<ISO-8601 timestamp>",
  "reasons": []
}
```

## Required missing-evidence reasons

When snapshots are absent, the tool must report explicit reasons such as:

```text
PRE_START_STATE_SNAPSHOT_MISSING
POST_START_STATE_SNAPSHOT_MISSING
STATE_SNAPSHOT_INCOMPLETE
STATE_SNAPSHOT_INVALID
```

If the request artifact is missing or invalid, it must also report existing request-artifact reasons consistently with previous start-path validators.

## Required consistency checks

When snapshot artifacts exist, the validator must check at minimum:

1. Both snapshots refer to the same `packetId`.
2. Both snapshots refer to the same `requestId`.
3. Both snapshots refer to the same request artifact path.
4. Both snapshots refer to the same request artifact hash.
5. Both snapshots preserve execution boundary indicators.
6. The pre-start snapshot is identified as pre-start state.
7. The post-start snapshot is identified as post-start state.
8. The post-start snapshot does not erase or contradict the pre-start snapshot.

## Execution boundary requirements

This packet must not:

- enable runner execution
- enable OpenCode execution
- contact the runner start endpoint
- start OpenCode
- create request artifacts
- create pre-start evidence artifacts
- create state snapshot artifacts
- mutate approvals
- admit evidence
- alter routing logic
- alter model selection logic

The validator may read existing files only.

## Negative test requirements

Verification must include at least:

1. Existing valid request with missing snapshots.
   - `stateSnapshotEvaluated: true`
   - `stateSnapshotComplete: false`
   - `stateSnapshotValid: false`
   - missing evidence includes pre/post snapshot absence
   - `startEndpointContacted: false`
   - `executionStarted: false`

2. Missing or invalid request artifact.
   - `requestArtifactValid: false`
   - `stateSnapshotValid: false`
   - no start endpoint contact
   - no OpenCode start

3. Existing pre-start evidence remains recognized but does not substitute for state snapshots.
   - `preStartEvidenceValid: true` may be true
   - `stateSnapshotValid` must remain false until snapshot evidence exists

## Acceptance criteria

FP-MCP-055 is accepted only if:

- the new MCP tool is exposed
- the tool is read-only
- the bridge builds successfully
- valid request with missing snapshots is reported as incomplete
- invalid request remains rejected
- missing snapshot evidence is explicit
- pre-start evidence is not incorrectly treated as state snapshot evidence
- no runner start endpoint is contacted
- OpenCode is not started
- execution remains disabled
- verification artifacts are recorded under `runs/FP-MCP-055/`

## Success state

At completion, ForgePilot has a read-only validator that can observe whether state snapshot evidence exists and is valid before any future packet records such snapshots or enforces them on the start path.

