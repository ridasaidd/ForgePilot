# FP-MCP-054 — Start Request Pre/Post State Snapshot Contract

## Status

DRAFT

## Type

Contract / evidence standard

## Summary

Define the required state snapshots that must exist immediately before and immediately after any future runner start attempt.

This packet does **not** enable execution.

This packet does **not** contact the runner start endpoint.

This packet does **not** start OpenCode.

This packet does **not** create pre-start or post-start snapshot artifacts.

This packet defines the pre/post state snapshot contract only.

## Motivation

ForgePilot now has a guarded start path with explicit evidence gates:

- FP-MCP-047 blocks start requests while the global execution disable switch is active.
- FP-MCP-048 preserves rejected approval observations.
- FP-MCP-049 preserves invalid or missing request-artifact observations.
- FP-MCP-050 defines required pre-start evidence.
- FP-MCP-051 validates pre-start evidence.
- FP-MCP-052 records non-executing pre-start evidence in dry-run form.
- FP-MCP-053 requires valid pre-start evidence before a start request can approach a future start boundary.

The next missing contract is state transition evidence.

A future start attempt must not be judged only by the final result. ForgePilot must be able to prove what state existed immediately before the start boundary and what state existed immediately after the start boundary.

Without pre/post snapshots, later evidence could become ambiguous:

- whether execution was disabled before contact,
- whether the start endpoint was contacted,
- whether OpenCode started,
- whether a runner run id was returned,
- whether the repository changed during the attempt,
- whether post-start state was created before or after the observed boundary,
- whether a failure happened before start contact or after start contact.

This packet makes that boundary explicit.

## Governing Principles

This packet is constrained by:

- P01 — ForgePilot records observations, not narratives.
- P02 — Trust cannot be retroactively created.
- P03 — ForgePilot does not optimize for favorable outcomes.
- P04 — Only admitted evidence may influence observatory outputs.
- P06 — Classification follows observation.

## Goal

Define a durable pre/post state snapshot contract for future start attempts.

The contract must make these facts observable:

```text
preStartStateRecorded: true|false
postStartStateRecorded: true|false
startEndpointContacted: true|false
executionStarted: true|false
opencodeStarted: true|false
runnerRunId: string|null
```

During the current disabled phase, every verification must still report:

```text
executionPermitted: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerContactedForStart: false
disableSwitchActive: true
```

## Non-Goals

This packet must not:

- enable runner execution
- enable OpenCode execution
- contact the runner start endpoint
- start OpenCode
- execute a model
- create pre-start snapshot artifacts
- create post-start snapshot artifacts
- create approval records
- mutate request artifacts
- mutate pre-start evidence artifacts
- implement start execution
- admit evidence into observatory outputs
- rank models
- change routing policy

## Definitions

### Pre-start state snapshot

A durable JSON artifact recorded immediately before a future runner start boundary is approached.

It records the observed state before any possible start endpoint contact.

### Post-start state snapshot

A durable JSON artifact recorded immediately after a future runner start attempt has either been blocked, rejected, failed, or completed at the handoff boundary.

It records the observed state after the start decision path returns.

### Start boundary

The point at which the bridge would contact a runner start endpoint in a future execution-enabled system.

For the current system, the boundary must not be crossed.

### Boundary pair

The paired pre-start and post-start snapshots for one start request attempt.

The pair must share the same packet id, request id, attempt id, request artifact digest, and bridge boundary version.

## Required Contract Document

This packet should add a contract document:

```text
docs/start-request-state-snapshot-contract.md
```

The document must define:

1. pre-start snapshot shape,
2. post-start snapshot shape,
3. ordering requirements,
4. field requirements,
5. invalid snapshot conditions,
6. disabled-phase invariants,
7. validation rules,
8. closure criteria.

## Required Artifact Locations

A future implementation should write snapshots under a packet-scoped path:

```text
runs/<packetId>/start-state-snapshots/<requestId>/<attemptId>/pre-start-state.json
runs/<packetId>/start-state-snapshots/<requestId>/<attemptId>/post-start-state.json
```

The path must be repository-relative, normalized, and confined under the matching packet run directory.

The attempt id must be deterministic or durably recorded. It must prevent one start attempt from overwriting another.

## Required Pre-Start Snapshot Fields

A pre-start snapshot must include at least:

```json
{
  "schemaVersion": "FP-MCP-054",
  "artifactType": "start-pre-state-snapshot",
  "packetId": "FP-MCP-036",
  "requestId": "REQ-...",
  "attemptId": "ATT-...",
  "requestArtifactPath": "runs/.../opencode-requests/REQ-....json",
  "requestArtifactSha256": "sha256 or null",
  "preStartEvidencePath": "runs/.../pre-start-evidence/REQ-....json",
  "preStartEvidenceSha256": "sha256 or null",
  "repoCommit": "short commit",
  "workingTreeClean": true,
  "approvalAccepted": true,
  "requestArtifactValid": true,
  "preStartEvidenceValid": true,
  "disableSwitchStatusEvaluated": true,
  "disableSwitchActive": true,
  "effectiveDisableReason": "EXECUTION_DISABLED_GLOBAL",
  "effectiveDisableScope": "GLOBAL",
  "executionPermitted": false,
  "startEndpointContacted": false,
  "runnerContactedForStart": false,
  "executionStarted": false,
  "opencodeStarted": false,
  "runnerRunId": null,
  "snapshotRecordedAt": "ISO-8601 timestamp",
  "boundaryVersion": "FP-MCP-054",
  "statusSource": "ForgePilot start request pre/post state snapshot contract",
  "reasons": []
}
```

## Required Post-Start Snapshot Fields

A post-start snapshot must include at least:

```json
{
  "schemaVersion": "FP-MCP-054",
  "artifactType": "start-post-state-snapshot",
  "packetId": "FP-MCP-036",
  "requestId": "REQ-...",
  "attemptId": "ATT-...",
  "requestArtifactPath": "runs/.../opencode-requests/REQ-....json",
  "requestArtifactSha256": "sha256 or null",
  "preStartEvidencePath": "runs/.../pre-start-evidence/REQ-....json",
  "preStartEvidenceSha256": "sha256 or null",
  "preStateSnapshotPath": "runs/.../pre-start-state.json",
  "preStateSnapshotSha256": "sha256 or null",
  "repoCommitBefore": "short commit or null",
  "repoCommitAfter": "short commit or null",
  "workingTreeCleanBefore": true,
  "workingTreeCleanAfter": true,
  "approvalAccepted": true,
  "requestArtifactValid": true,
  "preStartEvidenceValid": true,
  "disableSwitchStatusEvaluated": true,
  "disableSwitchActive": true,
  "effectiveDisableReason": "EXECUTION_DISABLED_GLOBAL",
  "effectiveDisableScope": "GLOBAL",
  "executionPermitted": false,
  "startEndpointContacted": false,
  "runnerContactedForStart": false,
  "executionStarted": false,
  "opencodeStarted": false,
  "runnerRunId": null,
  "preStartStateRecorded": true,
  "postStartStateRecorded": true,
  "snapshotRecordedAt": "ISO-8601 timestamp",
  "boundaryVersion": "FP-MCP-054",
  "statusSource": "ForgePilot start request pre/post state snapshot contract",
  "reasons": []
}
```

## Required Ordering

A future start path must observe this ordering:

1. validate request artifact,
2. validate approval input,
3. validate pre-start evidence,
4. evaluate disable switch,
5. evaluate execution permission,
6. record pre-start state snapshot,
7. approach or refuse the start boundary,
8. record post-start state snapshot,
9. return structured result.

In the current disabled phase, step 7 must always refuse the start boundary.

The current system must not contact the runner start endpoint.

## Disabled-Phase Invariants

While the global execution disable switch is active, both pre and post snapshots must record:

```text
executionPermitted: false
startEndpointContacted: false
runnerContactedForStart: false
executionStarted: false
opencodeStarted: false
runnerRunId: null
disableSwitchActive: true
```

The result must preserve disable-switch reasons:

```text
START_REQUEST_BLOCKED_BY_DISABLE_SWITCH
EXECUTION_DISABLED_GLOBAL
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
DISABLE_SWITCH_ACTIVE
EXECUTION_NOT_ALLOWED
```

## Invalid Snapshot Conditions

A snapshot pair is invalid if any of the following occur during the current disabled phase:

```text
startEndpointContacted: true
runnerContactedForStart: true
executionStarted: true
opencodeStarted: true
runnerRunId != null
preStartStateRecorded: false
postStartStateRecorded: false
```

A snapshot pair is also invalid if:

- the packet id does not match,
- the request id does not match,
- the attempt id does not match,
- the request artifact hash changes without being recorded,
- the pre-start evidence hash changes without being recorded,
- the post snapshot claims a pre snapshot that cannot be found,
- the post snapshot predates the pre snapshot,
- either snapshot is written outside the packet-scoped run directory.

## Validation Requirements

A future validator must check:

1. snapshot paths are safe and packet scoped,
2. JSON artifacts are parseable,
3. schema versions match the contract,
4. artifact types are correct,
5. packet id, request id, and attempt id match,
6. required hashes are present where source artifacts exist,
7. pre-start evidence was valid before the snapshot pair was recorded,
8. disabled-phase invariants remain false,
9. post snapshot references the pre snapshot,
10. reason codes are preserved,
11. no start endpoint contact occurred in the current phase,
12. OpenCode did not start.

## Required Current Verification

For this contract-only packet, verification must show:

```text
executionPermitted: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerContactedForStart: false
disableSwitchActive: true
```

Verification must also show that the contract exists and that the repository is clean after commit.

## Expected Evidence Artifacts

Expected run artifacts:

```text
runs/FP-MCP-054/executor-result.md
runs/FP-MCP-054/verification.txt
```

The contract document should be committed at:

```text
docs/start-request-state-snapshot-contract.md
```

## Acceptance Criteria

FP-MCP-054 is accepted only if:

- the packet is committed,
- the state snapshot contract document is committed,
- the contract defines pre-start snapshot fields,
- the contract defines post-start snapshot fields,
- ordering requirements are explicit,
- disabled-phase invariants are explicit,
- invalid snapshot conditions are explicit,
- validation requirements are explicit,
- execution remains disabled,
- `startEndpointContacted` remains false,
- `opencodeStarted` remains false,
- `executionStarted` remains false,
- verification artifacts are committed.
