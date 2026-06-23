# Real Human Approval Evidence Contract

## Packet

FP-MCP-066 — Real Human Approval Evidence Contract

## Status

Recorded contract document.

## Purpose

This document defines the boundary between approval-shaped test evidence and real human approval evidence.

The contract is intentionally non-executing. It does not create real approval evidence. It does not define a real approval recorder. It does not consume approval evidence. It does not satisfy the start request human approval evidence gate. It does not enable execution.

## Current Observed State

```text
realHumanApprovalEvidenceContractDefined: true
realHumanApprovalEvidenceRecorderDefined: false
realHumanApprovalEvidenceRecorded: false
humanApprovalRecorded: false
approvalConsumed: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

Repository observation:

```text
repo: ForgePilot
branch: main
commit: 6809736
workingTreeClean: true
```

OpenCode observation:

```text
opencodeExecutionEnabled: false
supportedRunModes:
  - DESIGN_ONLY
allowedModels:
  - deepseek-v4-pro-high
  - qwen-3.7-max
liveOpenCodeChecked: false
```

Disable-switch observation:

```text
disableSwitchActive: true
globalDisableActive: true
executionAllowedNow: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
effectiveDisableReason: EXECUTION_DISABLED_GLOBAL
effectiveDisableScope: GLOBAL
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

Observed human-approval tool surface:

```text
forgepilot_record_human_approval_evidence_dry_run_fixture
forgepilot_validate_human_approval_record
```

No real human approval evidence recorder was observed.

## Contract Boundary

ForgePilot now recognizes two distinct classes of approval-shaped artifacts.

### Fixture approval evidence

Fixture approval evidence is test evidence. It exists to exercise validators and gates.

It may be committed, hashed, inspected, rejected, and used as negative evidence. It must not satisfy the guarded start path.

Fixture approval evidence may contain:

```text
artifactType: human-approval-evidence-dry-run-fixture
fixture: true
dryRun: true
approvalState: INVALID or QUARANTINED
humanApprovalRecorded: false
approvalUsableForExecution: false
```

Fixture evidence must remain non-authorizing even when committed.

### Real human approval evidence

Real human approval evidence is a future explicit human authorization observation.

It may be eligible to satisfy the human approval evidence gate only if it satisfies this contract and all future recorder, validator, consumption, revocation, expiration, and safety gates.

A real approval artifact must contain:

```text
artifactType: human-approval-evidence
fixture: false
dryRun: false
approvalState: RECORDED
approvalKind: EXECUTION_ENABLEMENT
approvedAction: ALLOW_ONE_GUARDED_REMOTE_RUNNER_EXECUTION_ATTEMPT
humanApprovalRecorded: true
singleUse: true
consumed: false
revoked: false
quarantined: false
```

A real approval artifact alone still does not authorize execution. It only satisfies one gate.

## Required Artifact Shape

A real human approval evidence artifact must be JSON.

It must be create-only.

It must be immutable after creation.

It must live under:

```text
runs/<packetId>/approvals/<approvalId>.json
```

The approval id must use:

```text
APPROVAL-<UTC timestamp>-<opaque suffix>
```

A real approval artifact must include these required fields:

```text
schemaVersion
artifactType
approvalId
approvalKind
approvedAction
approvalState
fixture
dryRun
humanApprovalRecorded
approvalUsableForExecution
scope
canonicalApprovalText
approvalText
approvedBy
createdAt
expiresAt
singleUse
consumed
consumedAt
revoked
revokedAt
quarantined
quarantinedAt
preconditions
secretBoundary
createdByTool
createdByBoundaryVersion
```

## Exact Scope Binding

A real approval must bind to exactly one:

```text
packetId
requestId
modelId
runMode
repoCommit
branch
```

It must not bind to:

```text
all packets
all requests
all models
all run modes
latest commit
current branch without a concrete commit
future requests
background execution
recurring execution
multiple start attempts
```

Any broader scope must fail closed.

Any mismatch between approval scope and start request scope must fail closed.

## Canonical Approval Text

A real approval must include explicit approval text.

The approval text must identify:

```text
packet id
request id
model id
run mode
repository commit
branch
single-use property
expiration time
non-override of the global disable switch
non-override of all other ForgePilot safety gates
```

Approval must not be inferred from:

```text
a casual chat message
an ambiguous yes
an earlier unrelated approval
a previous packet approval
a commit message
absence of refusal
operator silence
fixture evidence
```

## Expiration

A real approval must expire.

A future recorder must reject approval lifetimes that exceed the configured maximum.

A future validator must fail closed when:

```text
expiresAt is missing
expiresAt is invalid
expiresAt is in the past
createdAt is missing
createdAt is invalid
expiresAt <= createdAt
approval lifetime exceeds maximum
```

The maximum approval lifetime is not implemented by FP-MCP-066.

## Single Use

A real approval must be single-use.

It may authorize at most one guarded start attempt.

Single-use consumption is not implemented by FP-MCP-066.

A future packet must define:

```text
approval consumption event shape
when consumption happens
how consumption is recorded
how validators reject consumed approvals
how failed or blocked attempts are classified
```

## Revocation and Quarantine

A real approval must be revocable before consumption.

A real approval must be quarantinable if later evidence shows it was malformed, unsafe, ambiguous, overbroad, expired, duplicated, tampered with, or produced under invalid assumptions.

Revocation and quarantine are not implemented by FP-MCP-066.

## Secret Boundary

A real approval artifact must not contain:

```text
API keys
runner secrets
OpenCode tokens
provider tokens
SSH private keys
bearer tokens
OAuth refresh tokens
raw cookies
private runner URLs if classified as secret
full sensitive environment dumps
unredacted personal data beyond explicitly allowed non-secret operator identifiers
```

If secret material is detected or suspected, the artifact must fail closed and should be quarantined by a future packet.

## Interaction With Existing Gates

Real approval evidence is only one gate.

Even if valid real approval evidence exists, the guarded start path must still require:

```text
valid request artifact
valid explicit start request approval token
valid pre-start evidence
valid pre/post state snapshot evidence
global disable switch not active
runner execution capability enabled
OpenCode execution boundary satisfied
secret boundary satisfied
network boundary satisfied
```

FP-MCP-066 changes none of those gates.

## Non-Authorization Statement

FP-MCP-066 does not authorize execution.

FP-MCP-066 does not create a real approval recorder.

FP-MCP-066 does not create real human approval evidence.

FP-MCP-066 does not consume approval evidence.

FP-MCP-066 does not satisfy the human approval evidence gate.

FP-MCP-066 only defines the contract that future real approval evidence must satisfy.

## Next Packets

The recommended next packets are:

```text
FP-MCP-067 — Real Human Approval Evidence Recorder
FP-MCP-068 — Single-Use Approval Consumption Gate
FP-MCP-069 — Human Approval Revocation and Expiration Enforcement
FP-MCP-070 — Real Approval Evidence Negative Fixture Revalidation
FP-MCP-071 — Human Approval Evidence Readiness Recheck
```
