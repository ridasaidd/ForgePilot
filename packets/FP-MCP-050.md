# FP-MCP-050 — Start Request Pre-Start Evidence Contract

## Status

DRAFT

## Type

Contract / evidence standard

## Summary

Define the minimum evidence that must be recorded immediately before any future remote-runner start request may be considered eligible.

This packet does **not** enable execution.

This packet does **not** contact the runner start endpoint.

This packet does **not** start OpenCode.

This packet does **not** create approvals.

This packet defines the pre-start evidence contract only.

## Motivation

ForgePilot now has explicit blocking layers for guarded execution:

- execution enablement status
- human approval validation
- disable-switch status
- guarded execution preflight
- start-request disable-switch enforcement
- start-request approval rejection
- start-request artifact rejection

Before a future start request can ever be allowed, ForgePilot needs a durable pre-start evidence record that proves which gates were observed immediately before the attempted handoff.

A start decision must not depend on transient tool output, memory, chat context, or implied state.

The start path must have an auditable evidence object that says:

- what request was being considered
- which commit was current
- which artifact was validated
- which approval was evaluated
- which disable switch state applied
- which preflight gates were observed
- whether runner start contact was allowed
- whether runner start contact occurred

## Governing principles

This packet is constrained by:

- P01 — ForgePilot records observations, not narratives
- P02 — Trust cannot be retroactively created
- P03 — ForgePilot does not optimize for favorable outcomes
- P04 — Only admitted evidence may influence observatory outputs
- P06 — Classification follows observation

## Scope

### In scope

- Define the pre-start evidence record contract.
- Define required fields for a pre-start evidence artifact.
- Define required false-state fields while execution remains disabled.
- Define reason-code requirements.
- Define ordering requirements for evidence collection.
- Define safe output expectations for a future pre-start evidence recorder.

### Out of scope

- Enabling runner execution.
- Enabling OpenCode execution.
- Calling the runner start endpoint.
- Creating human approvals.
- Admitting evidence into an observatory database.
- Implementing policy changes that permit execution.
- Modifying runner capabilities.
- Adding model-provider calls.

## Definitions

### Pre-start evidence

A durable JSON artifact recorded before any future start endpoint contact is allowed.

It is an observation of gate state, not permission to execute.

### Start request

A request to invoke `forgepilot_start_remote_runner_request` for an existing OpenCode request artifact.

### Runner start endpoint

The endpoint that would cause the private runner to begin an execution.

For this packet, it must not be contacted.

### Start eligibility

A derived boolean that may only be true if all required pre-start evidence gates pass.

For this packet, start eligibility must remain false.

## Required pre-start evidence artifact

A future implementation must record a JSON artifact at a safe ForgePilot path before any future runner start contact can occur.

Recommended path shape:

```text
runs/<packetId>/pre-start-evidence/<requestId>.json
```

The artifact must contain at least:

```json
{
  "schemaVersion": "FP-MCP-050",
  "artifactType": "pre-start-evidence",
  "packetId": "FP-MCP-036",
  "requestId": "REQ-...",
  "requestArtifactPath": "runs/.../opencode-requests/REQ-....json",
  "requestArtifactSha256": "...",
  "repoCommit": "...",
  "workingTreeClean": true,
  "approvalEvaluated": true,
  "approvalAccepted": false,
  "approvalRejected": true,
  "disableSwitchStatusEvaluated": true,
  "disableSwitchActive": true,
  "effectiveDisableReason": "EXECUTION_DISABLED_GLOBAL",
  "effectiveDisableScope": "GLOBAL",
  "preflightEvaluated": true,
  "preflightEligible": false,
  "startEligible": false,
  "runnerConfigured": true,
  "runnerContactedForValidation": false,
  "startEndpointContacted": false,
  "executionStarted": false,
  "opencodeStarted": false,
  "checkedAt": "2026-06-22T00:00:00.000Z",
  "boundaryVersion": "FP-MCP-050",
  "statusSource": "ForgePilot pre-start evidence contract",
  "reasons": []
}
```

## Required fields

A pre-start evidence artifact must include the following field groups.

### Identity fields

- `schemaVersion`
- `artifactType`
- `packetId`
- `requestId`
- `requestArtifactPath`
- `requestArtifactSha256`
- `repoCommit`
- `workingTreeClean`
- `checkedAt`
- `boundaryVersion`
- `statusSource`

### Approval fields

- `approvalEvaluated`
- `approvalAccepted`
- `approvalRejected`

### Disable-switch fields

- `disableSwitchStatusEvaluated`
- `disableSwitchActive`
- `effectiveDisableReason`
- `effectiveDisableScope`

### Preflight fields

- `preflightEvaluated`
- `preflightEligible`

### Start-state fields

- `startEligible`
- `runnerConfigured`
- `runnerContactedForValidation`
- `startEndpointContacted`
- `executionStarted`
- `opencodeStarted`

### Reason fields

- `reasons`

## Required false-state invariants

While the global disable switch remains active, every pre-start evidence artifact must record:

```text
startEligible: false
startEndpointContacted: false
executionStarted: false
opencodeStarted: false
```

If the disable switch is active, the artifact must include:

```text
START_REQUEST_BLOCKED_BY_DISABLE_SWITCH
DISABLE_SWITCH_ACTIVE
EXECUTION_NOT_ALLOWED
```

If the request artifact is invalid or missing, the artifact must additionally include one or more of:

```text
START_REQUEST_ARTIFACT_REJECTED
START_REQUEST_ARTIFACT_MISSING
START_REQUEST_LIFECYCLE_INVALID
INVALID_REQUEST_ID
UNKNOWN_REQUEST
```

If the approval is invalid, the artifact must additionally include:

```text
START_APPROVAL_REJECTED
APPROVAL_REQUIRED
```

## Ordering requirements

The future recorder must evaluate and record observations in this order:

1. repository state
2. request artifact identity and digest
3. approval input state
4. disable-switch state
5. preflight state
6. derived start eligibility
7. explicit no-start state

The recorder must not contact the runner start endpoint before the artifact is recorded.

The recorder must not mutate an existing pre-start evidence artifact.

If an artifact already exists for the same packet/request attempt, the recorder must fail closed or create a distinct attempt-scoped artifact.

## Acceptance criteria

This packet is accepted if:

- A pre-start evidence contract is defined.
- The contract requires durable artifact output.
- The contract requires disable-switch observations.
- The contract requires approval observations.
- The contract requires request-artifact observations.
- The contract requires explicit false start-state fields.
- The contract preserves `startEndpointContacted: false`.
- The contract preserves `executionStarted: false`.
- The contract does not enable runner execution.
- The contract does not enable OpenCode execution.
- The contract does not create human approvals.

## Verification expectations

Verification must show:

```text
preStartEvidenceContractDefined: true
preStartEvidenceRecorded: false
startEligible: false
startEndpointContacted: false
executionStarted: false
opencodeStarted: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
```

## Non-goals

This packet must not be interpreted as permission to execute.

This packet must not be interpreted as approval to contact the runner start endpoint.

This packet must not be interpreted as an execution enablement milestone.

## Expected result

FP-MCP-050 should produce a contract-only evidence standard that prepares the start path for future durable pre-start evidence recording while preserving the current non-executing boundary.
