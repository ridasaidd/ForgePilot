# FP-MCP-125 Contract Evidence

Result: PASSED

Defined the real-shaped, non-consumed human approval evidence artifact contract for guarded start preflight testing.

## Packet

- FP-MCP-125 — Real Human Approval Evidence Preflight Fixture Contract

## Packet Commit

- `b7a0622 Add FP-MCP-125 real approval evidence contract packet`

## Contract Status

This packet is contract-only.

No implementation was changed.

No MCP bridge code was changed.

No runner code was changed.

No OpenCode configuration was changed.

No approval artifact was created.

No approval was consumed.

## Contract Definition

A real-shaped human approval evidence artifact is an append-only observation that says:

```text
A human operator approved this specific ForgePilot guarded start request scope.
```

It is not approval consumption.

It is not execution authorization.

It is only evidence that the approval evidence gate may evaluate.

## Current Request Chain

Request artifact under test:

```text
packetId: FP-MCP-117
requestId: REQ-20260630T160920008Z-195b9969
modelId: deepseek-v4-pro-high
runMode: DESIGN_ONLY
requestArtifactPath: runs/FP-MCP-117/opencode-requests/REQ-20260630T160920008Z-195b9969.json
requestArtifactSha256: 512a8c2c48e69b22d0e48206c9e9af65aff26d44eefded9b8ca9e6b0b064a454
```

Current repository state at packet creation:

```text
branch: main
pre-packet commit: b69f819
packet commit: b7a0622
```

## Required Non-Execution Boundary

The contract requires approval evidence creation to preserve:

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

## Required Artifact Path

Recommended path shape:

```text
runs/<RECORDER_PACKET_ID>/approvals/<APPROVAL_ID>.json
```

Example future recorder path:

```text
runs/FP-MCP-126/approvals/APPROVAL-<timestamp>-<suffix>.json
```

## Required Artifact Fields

The contract defines required fields including:

- `schemaVersion`
- `artifactType`
- `artifactVersion`
- `approvalId`
- `approvalState`
- `approvalKind`
- `approvalText`
- `canonicalApprovalText`
- `approvedAction`
- `scope`
- `operator`
- `createdAt`
- `expiresAt`
- `singleUse`
- `consumedAt`
- `revokedAt`
- `quarantinedAt`
- `approvalUsableForExecution`
- `humanApprovalRecorded`
- non-execution safety fields
- `reasons`

## Required Scope Binding

The approval scope must match exactly:

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

## Canonical Approval Text

The contract requires exact canonical approval text:

```text
I approve this ForgePilot guarded start request.
```

Informal equivalents must not pass, including:

- `approved`
- `ok`
- `ship it`
- `run it`
- `looks good`
- paraphrases

## Expiration Behavior

The artifact must include:

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

## Operator Identity Safety

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

## Single-Use Semantics

The artifact may include:

```text
singleUse: true
```

This means it may be consumed at most once by a future separate approval consumption step.

This packet does not consume it.

A preflight evaluation may observe `singleUse: true`.

A preflight evaluation must not mark it consumed.

## Validity Fields

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

## Create-Only Semantics

Creating real-shaped approval evidence may:

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

## Preflight Evaluation Semantics

A future valid real-shaped approval artifact may make the gate:

```text
humanApprovalEvidence:
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

## Expected Overall Preflight State

Even if `humanApprovalEvidence` passes in a future packet, the guarded preflight report must still refuse eligibility while these remain blocked:

```text
disableSwitch: FAILED
runnerCapabilityState: FAILED
opencodeReadiness: FAILED
```

Expected safety state remains:

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

The contract recommends:

1. FP-MCP-126 — Record Real-Shaped Human Approval Evidence Fixture
2. FP-MCP-127 — Human Approval Evidence Passing Preflight Test
3. FP-MCP-128 — Approval Consumption Contract
4. FP-MCP-129 — Approval Consumption Dry-Run / Append-Only Evidence

No packet in this sequence should enable execution until the guarded start state transition explicitly moves beyond `PRESENT_DISABLED`.

## Conclusion

FP-MCP-125 successfully defines the real-shaped human approval evidence artifact contract while preserving strict separation between approval evidence, approval consumption, and execution authorization.
