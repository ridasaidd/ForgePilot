# FP-MCP-125 — Real Human Approval Evidence Preflight Fixture Contract

## Task

Define the contract for creating a real-shaped, non-consumed human approval evidence artifact for guarded start preflight testing.

## Goal

Specify how ForgePilot may create a real-shaped human approval evidence artifact that can be evaluated by `humanApprovalEvidence` without consuming approval or starting execution.

This packet answers one question:

How can we test a passing human approval evidence gate without authorizing or performing a runner start?

## Background

FP-MCP-123 defined the human approval evidence preflight evaluation contract.

FP-MCP-124 implemented a read-only approval evidence classifier and correctly classified the FP-MCP-118 dry-run fixture as:

```text
humanApprovalEvidence:
  evaluated: true
  passed: false
  state: FAILED
  reasons:
    - HUMAN_APPROVAL_EVIDENCE_COMMIT_MISMATCH
    - HUMAN_APPROVAL_EVIDENCE_FIXTURE_NOT_AUTHORIZING
    - HUMAN_APPROVAL_EVIDENCE_NOT_USABLE_FOR_EXECUTION
```

That result is correct.

The next test requires a different artifact type:

```text
real-shaped human approval evidence
```

This artifact may satisfy approval evidence preflight if it is scoped, committed, unexpired, canonical, and non-consumed.

It must not itself authorize execution.

It must not consume approval.

It must not contact the runner start endpoint.

It must not start OpenCode.

## Current Request Chain Under Test

Request artifact:

- packetId: `FP-MCP-117`
- requestId: `REQ-20260630T160920008Z-195b9969`
- modelId: `deepseek-v4-pro-high`
- runMode: `DESIGN_ONLY`
- request artifact path: `runs/FP-MCP-117/opencode-requests/REQ-20260630T160920008Z-195b9969.json`
- request artifact sha256: `512a8c2c48e69b22d0e48206c9e9af65aff26d44eefded9b8ca9e6b0b064a454`

Current repository state at packet creation:

- branch: `main`
- current commit before FP-MCP-125 packet: `b69f819`

## Scope

Allowed:

- Define a real-shaped human approval evidence artifact contract.
- Define required fields.
- Define exact scope binding.
- Define canonical approval text.
- Define expiration behavior.
- Define non-secret operator identity.
- Define create-only behavior.
- Define non-consumption behavior.
- Define how a future preflight report may evaluate it.
- Define evidence recording requirements.
- Record contract evidence under `runs/FP-MCP-125/`.

Forbidden:

- Do not implement code.
- Do not modify the MCP bridge.
- Do not modify the runner.
- Do not modify OpenCode configuration.
- Do not create a real approval artifact in this packet.
- Do not consume approval.
- Do not create approval consumption evidence.
- Do not enable execution.
- Do not make start callable.
- Do not add start to `supportedOperations`.
- Do not contact the runner start endpoint.
- Do not call `/runner/start-run`.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create runner run id.
- Do not mutate request artifacts.
- Do not mutate existing approval artifacts.
- Do not implement `PRESENT_GUARDED`.
- Do not implement `CALLABLE_GUARDED`.

## Contract

### Definition

A real-shaped human approval evidence artifact is an append-only observation that says:

```text
A human operator approved this specific ForgePilot guarded start request scope.
```

It is not the same as approval consumption.

It is not the same as execution authorization.

It is only evidence that the approval evidence gate may evaluate.

### Required Non-Execution Boundary

Creating real-shaped approval evidence must preserve all of these fields:

```text
executionAllowedNow: false
executionStarted: false
opencodeStarted: false
startEndpointContacted: false
runnerStartEndpointContacted: false
runnerRunId: null
approvalConsumed: false
approvalConsumptionCreated: false
requestArtifactMutated: false
```

The artifact must not itself flip any execution state.

### Required Artifact Path

A real-shaped approval evidence artifact must be written under an allowed evidence path.

Recommended path shape:

```text
runs/<RECORDER_PACKET_ID>/approvals/<APPROVAL_ID>.json
```

Example future recorder packet:

```text
runs/FP-MCP-126/approvals/APPROVAL-<timestamp>-<suffix>.json
```

The approval artifact path must be explicit in the preflight report when evaluated.

### Required Artifact Fields

A real-shaped approval evidence artifact must contain at least:

```json
{
  "schemaVersion": "FP-MCP-125",
  "artifactType": "human-approval-evidence",
  "artifactVersion": "human-approval-evidence-v1",
  "approvalId": "APPROVAL-...",
  "approvalState": "VALID",
  "approvalKind": "GUARDED_START_PREFLIGHT_APPROVAL",
  "approvalText": "I approve this ForgePilot guarded start request.",
  "canonicalApprovalText": "I approve this ForgePilot guarded start request.",
  "approvedAction": "ALLOW_ONE_GUARDED_REMOTE_RUNNER_EXECUTION_ATTEMPT",
  "scope": {
    "packetId": "FP-MCP-117",
    "requestId": "REQ-20260630T160920008Z-195b9969",
    "modelId": "deepseek-v4-pro-high",
    "runMode": "DESIGN_ONLY",
    "branch": "main",
    "repoCommit": "<current-request-bound-commit>"
  },
  "operator": {
    "operatorId": "<non-secret-id>",
    "operatorHandle": "<optional-non-secret-handle>",
    "operatorEmailHash": "<optional-non-reversible-hash>"
  },
  "createdAt": "<ISO-8601 UTC>",
  "expiresAt": "<ISO-8601 UTC>",
  "singleUse": true,
  "consumedAt": null,
  "revokedAt": null,
  "quarantinedAt": null,
  "approvalUsableForExecution": true,
  "humanApprovalRecorded": true,
  "executionAllowedNow": false,
  "executionStarted": false,
  "opencodeStarted": false,
  "startEndpointContacted": false,
  "runnerStartEndpointContacted": false,
  "runnerRunId": null,
  "approvalConsumed": false,
  "approvalConsumptionCreated": false,
  "requestArtifactMutated": false,
  "reasons": []
}
```

### Scope Binding

The approval scope must match the request being evaluated exactly.

Required scope fields:

- packet id
- request id
- model id
- run mode
- branch
- repository commit

The artifact must not be reusable across:

- requests
- models
- run modes
- branches
- commits

A scope mismatch must make `humanApprovalEvidence` fail.

### Repository Commit Binding

The approval artifact must bind to the repository commit being used by the request preflight.

For the current request chain, this may be the current repository commit at the time the real-shaped approval evidence is created.

If the repository advances after approval creation, a future preflight implementation must define whether the approval remains valid.

For now, strict commit matching is preferred.

### Canonical Approval Text

The artifact must contain the exact canonical text:

```text
I approve this ForgePilot guarded start request.
```

The evaluator must not accept informal equivalents.

Invalid examples:

- `approved`
- `ok`
- `ship it`
- `run it`
- `looks good`
- any paraphrase

### Expiration

The artifact must include an expiration timestamp:

```text
expiresAt
```

Requirements:

- ISO-8601 UTC
- parseable
- later than `createdAt`
- later than evaluation time
- short enough to avoid stale approvals

Recommended test window:

```text
15 minutes
```

Expired approval evidence must fail.

### Operator Identity

The artifact must include non-secret operator identity.

Allowed:

- `operatorId`
- `operatorHandle`
- `operatorEmailHash`

Forbidden:

- raw email
- password
- API key
- OAuth token
- session token
- private key
- secret-bearing note

### Single-Use Semantics

The artifact may be marked:

```text
singleUse: true
```

This means it may be consumed at most once by a future separate approval consumption step.

However, this packet does not consume it.

A preflight evaluation may observe `singleUse: true`.

A preflight evaluation must not mark it consumed.

### Validity Fields

A real-shaped approval evidence artifact intended to pass the approval evidence gate must use:

```text
approvalState: VALID
approvalUsableForExecution: true
humanApprovalRecorded: true
```

It must not include fixture markers such as:

```text
fixture: true
dryRun: true
artifactType: human-approval-evidence-dry-run-fixture
approvalState: INVALID
approvalUsableForExecution: false
humanApprovalRecorded: false
```

### Create-Only Semantics

Creating real-shaped approval evidence is a create-only operation.

It may:

- write one new artifact
- calculate artifact sha256
- report artifact path
- report non-execution safety fields

It must not:

- modify existing approval artifacts
- modify request artifacts
- modify pre-start evidence
- modify state snapshot evidence
- consume approval
- create approval consumption evidence
- enable execution
- start runner
- start OpenCode

### Preflight Evaluation Semantics

If a future implementation evaluates a valid real-shaped approval artifact, the `humanApprovalEvidence` gate may become:

```text
evaluated: true
passed: true
state: PASSED
reasons: []
evidencePath: <approval artifact path>
evidenceSha256: <approval artifact sha256>
```

This means only:

```text
A valid human approval evidence artifact exists for this preflight request.
```

It does not mean:

```text
Approval has been consumed.
```

It does not mean:

```text
Execution may start.
```

### Expected Overall Preflight State

Even if `humanApprovalEvidence` passes in a future packet, the guarded preflight report must still refuse eligibility while these remain blocked:

```text
disableSwitch: FAILED
runnerCapabilityState: FAILED
opencodeReadiness: FAILED
```

Expected safety state:

```text
eligibleForFutureGuardedStart: false
executionPermitted: false
executionStarted: false
opencodeStarted: false
runnerStartEndpointContacted: false
startEndpointContacted: false
runnerRunId: null
approvalConsumed: false
requestArtifactMutated: false
```

## Future Packet Sequence

Recommended next packets:

1. FP-MCP-126 — Record Real-Shaped Human Approval Evidence Fixture
2. FP-MCP-127 — Human Approval Evidence Passing Preflight Test
3. FP-MCP-128 — Approval Consumption Contract
4. FP-MCP-129 — Approval Consumption Dry-Run / Append-Only Evidence

No packet in this sequence should enable execution until the guarded start state transition has explicitly moved beyond `PRESENT_DISABLED`.

## Verification

Verification must show:

- packet committed
- contract evidence recorded under `runs/FP-MCP-125/`
- no implementation changes
- no bridge changes
- no runner changes
- no real approval artifact created
- no approval consumed
- no approval artifact mutated
- no request artifact mutated
- no execution enabled
- no runner start endpoint contact
- no OpenCode start

## Evidence

Record:

- `runs/FP-MCP-125/contract-evidence.md`
- `runs/FP-MCP-125/verification.txt`

## Success Criteria

This packet is successful if:

1. The real-shaped approval evidence artifact contract is explicit.
2. Required fields are defined.
3. Scope binding is defined.
4. Canonical approval text is defined.
5. Expiration behavior is defined.
6. Operator identity safety is defined.
7. Create-only semantics are defined.
8. Approval evidence remains separate from approval consumption.
9. Passing `humanApprovalEvidence` is explicitly non-authorizing by itself.
10. No code is changed.
11. No approval is created.
12. Verification passes.

## Non-goals

This packet does not create a real-shaped approval evidence artifact.

This packet does not implement approval evidence creation.

This packet does not implement approval evidence preflight changes.

This packet does not implement approval consumption.

This packet does not enable execution.

This packet does not make start callable.

This packet does not add start to supported operations.

This packet does not implement `PRESENT_GUARDED`.

This packet does not implement `CALLABLE_GUARDED`.

This packet does not perform a remote runner start.
