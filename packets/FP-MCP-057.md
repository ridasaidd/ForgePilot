# FP-MCP-057 — Start Request State Snapshot Gate Enforcement

## Status

DRAFT

## Type

Implementation packet

## Depends On

- FP-MCP-054 — Start Request Pre/Post State Snapshot Contract
- FP-MCP-055 — Start Request State Snapshot Validation Tool
- FP-MCP-056 — Start State Snapshot Dry-Run Recorder
- FP-MCP-053 — Start Request Evidence Gate Enforcement
- FP-MCP-047 — Start Request Disable Switch Enforcement

## Task

Enforce valid start request state snapshot evidence in the remote runner start request path.

The start request path must evaluate pre/post state snapshot evidence before any future runner start boundary can be approached.

If required state snapshot evidence is missing, incomplete, invalid, or internally inconsistent, the start request path must return a structured blocked response.

## Goal

Make pre/post state snapshot evidence a required gate for start request eligibility.

FP-MCP-057 answers one question:

> Does this start request have valid pre/post state snapshot evidence before it can approach a start boundary?

The expected answer during this packet remains:

> Execution is still not permitted, the global disable switch still blocks start, and the runner start endpoint is not contacted.

## Non-Goals

This packet must not:

- enable runner execution
- enable OpenCode execution
- contact the runner start endpoint
- start OpenCode
- execute a model
- create request artifacts
- create pre-start evidence artifacts
- create state snapshot artifacts
- mutate existing evidence artifacts
- weaken the global disable switch
- bypass approval validation
- bypass request artifact validation
- bypass pre-start evidence validation
- change the runner service
- change OpenCode configuration
- introduce autonomous execution

## Required Behavior

The start request path must:

1. Continue to validate explicit start approval.
2. Continue to validate the request artifact.
3. Continue to evaluate the global disable switch.
4. Continue to evaluate pre-start evidence.
5. Evaluate pre/post start state snapshot evidence using the FP-MCP-055 semantics.
6. Require state snapshot evidence to be complete and valid before a start request can be considered locally eligible.
7. Return structured fields describing snapshot gate status.
8. Preserve `startEndpointContacted: false` while execution remains disabled.
9. Preserve `executionStarted: false`.
10. Preserve `opencodeStarted: false`.
11. Preserve `runnerContacted: false` or equivalent start-contact false field when blocked before start.

## Required Response Fields

The start request response must include, or preserve equivalent existing fields for:

- `boundaryVersion`
- `packetId`
- `requestId`
- `started`
- `accepted`
- `approvalAccepted`
- `localValidationPassed`
- `disableSwitchStatusEvaluated`
- `disableSwitchActive`
- `preStartEvidenceEvaluated`
- `preStartEvidenceComplete`
- `preStartEvidenceValid`
- `stateSnapshotEvaluated`
- `stateSnapshotComplete`
- `stateSnapshotValid`
- `preStartSnapshotPresent`
- `postStartSnapshotPresent`
- `stateSnapshotMissingEvidence`
- `stateSnapshotInconsistentEvidence`
- `startEndpointContacted`
- `executionStarted`
- `opencodeStarted`
- `runnerContacted`
- `reasons`

## Required Blocking Reasons

When state snapshot evidence is missing, incomplete, invalid, or inconsistent, the start request path must include appropriate reasons such as:

- `START_REQUEST_STATE_SNAPSHOT_GATE_BLOCKED`
- `STATE_SNAPSHOT_INCOMPLETE`
- `STATE_SNAPSHOT_INVALID`
- `PRE_START_STATE_SNAPSHOT_MISSING`
- `POST_START_STATE_SNAPSHOT_MISSING`

The exact set may include additional already-existing reasons, but the snapshot gate block must be observable.

## Acceptance Criteria

### Valid snapshot evidence case

Given an existing request with valid request artifact, valid pre-start evidence, and valid pre/post snapshot evidence:

- `stateSnapshotEvaluated` is `true`
- `stateSnapshotComplete` is `true`
- `stateSnapshotValid` is `true`
- `stateSnapshotMissingEvidence` is empty
- `stateSnapshotInconsistentEvidence` is empty
- the start path remains blocked by the global disable switch
- `startEndpointContacted` is `false`
- `executionStarted` is `false`
- `opencodeStarted` is `false`

### Missing snapshot evidence case

Given a request with missing or invalid state snapshot evidence:

- `stateSnapshotEvaluated` is `true`
- `stateSnapshotComplete` is `false`
- `stateSnapshotValid` is `false`
- `START_REQUEST_STATE_SNAPSHOT_GATE_BLOCKED` appears in `reasons`
- `STATE_SNAPSHOT_INCOMPLETE` or `STATE_SNAPSHOT_INVALID` appears in `reasons`
- `startEndpointContacted` is `false`
- `executionStarted` is `false`
- `opencodeStarted` is `false`

### Boundary preservation

For all tested cases:

- no runner start endpoint is contacted
- no OpenCode process is started
- no execution is enabled
- no evidence artifact is created by the start path
- existing state snapshot artifacts are read-only inputs

## Verification

Verification must record:

1. A start request probe using a request with valid state snapshot evidence.
2. A start request probe using a request with missing or invalid state snapshot evidence.
3. Observed snapshot gate fields.
4. Observed blocking reasons.
5. Confirmation that `startEndpointContacted` remained `false`.
6. Confirmation that `executionStarted` remained `false`.
7. Confirmation that `opencodeStarted` remained `false`.
8. Repository status before final artifact commit.

## Safety Boundary

This packet is still part of the non-executing guarded execution runway.

Passing FP-MCP-057 does not authorize real execution.

Execution remains disabled unless a future packet explicitly defines and verifies all remaining execution enablement requirements.

## Expected Outcome

FP-MCP-057 is successful when the start request path requires valid state snapshot evidence before local start eligibility, while the global disable switch still prevents any actual runner start.
