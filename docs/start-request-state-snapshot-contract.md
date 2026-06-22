# Start Request Pre/Post State Snapshot Contract

## Purpose

This document defines the ForgePilot contract for durable pre-start and post-start state snapshots around any future runner start attempt.

The contract exists to make the start boundary observable. A start result must not stand alone; ForgePilot must be able to prove what state existed immediately before the boundary and what state existed immediately after the boundary decision returned.

This contract does not enable execution, does not contact the runner start endpoint, and does not start OpenCode.

## Governing Principles

This contract is constrained by:

- P01 — ForgePilot records observations, not narratives.
- P02 — Trust cannot be retroactively created.
- P03 — ForgePilot does not optimize for favorable outcomes.
- P04 — Only admitted evidence may influence observatory outputs.
- P06 — Classification follows observation.

## Scope

This contract defines:

1. pre-start snapshot shape,
2. post-start snapshot shape,
3. snapshot artifact locations,
4. ordering requirements,
5. disabled-phase invariants,
6. invalid snapshot conditions,
7. validation requirements,
8. closure criteria.

This contract does not define execution enablement, runner start semantics, OpenCode invocation, model execution, routing, evidence admission, or observatory outputs.

## Definitions

### Pre-start state snapshot

A durable JSON artifact recorded immediately before a future runner start boundary is approached. It records the observed state before any possible start endpoint contact.

### Post-start state snapshot

A durable JSON artifact recorded immediately after a future runner start attempt has been blocked, rejected, failed, or completed at the handoff boundary. It records the observed state after the start decision path returns.

### Start boundary

The point at which the bridge would contact a runner start endpoint in a future execution-enabled system. In the current disabled phase, this boundary must not be crossed.

### Boundary pair

The paired pre-start and post-start snapshots for one start request attempt. The pair must share the same packet id, request id, attempt id, request artifact digest, and bridge boundary version.

## Required Artifact Locations

A future implementation must write snapshots under a packet-scoped path:

```text
runs/<packetId>/start-state-snapshots/<requestId>/<attemptId>/pre-start-state.json
runs/<packetId>/start-state-snapshots/<requestId>/<attemptId>/post-start-state.json
```

Paths must be repository-relative, normalized, and confined under the matching packet run directory.

The attempt id must prevent one start attempt from overwriting another. It must be deterministic or durably recorded in the snapshot pair.

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

In the current disabled phase, step 7 must always refuse the start boundary. The current system must not contact the runner start endpoint.

## Disabled-Phase Invariants

While the global execution disable switch is active, both pre-start and post-start snapshots must record:

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

## Current Disabled-Phase Closure Criteria

For FP-MCP-054, closure requires evidence that:

```text
executionPermitted: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerContactedForStart: false
disableSwitchActive: true
```

The contract document must be committed at:

```text
docs/start-request-state-snapshot-contract.md
```

Verification artifacts must be committed at:

```text
runs/FP-MCP-054/executor-result.md
runs/FP-MCP-054/verification.txt
```

## Non-Execution Statement

This contract is a boundary definition only. It does not create snapshots, approve execution, contact the runner start endpoint, invoke OpenCode, or admit any evidence into observatory outputs.
