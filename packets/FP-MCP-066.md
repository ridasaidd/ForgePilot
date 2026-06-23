# FP-MCP-066 — Real Human Approval Evidence Contract

## Status

DRAFT

## Type

Contract packet

## Depends On

- FP-MCP-059 — Human Approval Evidence Contract
- FP-MCP-061 — Human Approval Evidence Validator Hardening
- FP-MCP-063 — Human Approval Evidence Dry-Run Fixture Recorder
- FP-MCP-064 — Start Request Human Approval Evidence Gate Enforcement
- FP-MCP-065 — Human Approval Evidence Readiness Checkpoint

## Task

Define the contract for real human approval evidence.

This packet defines what a real, scoped, non-fixture, non-dry-run human approval evidence artifact must contain before any future recorder may create one.

FP-MCP-066 is contract-only.

It must not create real approval evidence.

It must not add a real approval recorder.

It must not consume approval evidence.

It must not enable execution.

---

## Goal

Create a precise contract that separates fixture approval evidence from real human approval evidence.

FP-MCP-066 answers one question:

> What must be true for a human approval evidence artifact to be considered real, scoped, single-use, auditable, and eligible to satisfy the human approval evidence gate?

The expected result is:

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

This is a successful result.

---

## Governing Principles

FP-MCP-066 is constrained by:

```text
P01 — ForgePilot records observations, not narratives.
P02 — Trust cannot be retroactively created.
P03 — ForgePilot does not optimize for favorable outcomes.
P04 — Only admitted evidence may influence observatory outputs.
P06 — Classification follows observation.
```

A real approval contract must not rely on implied consent.

A real approval contract must not rely on conversational context alone.

A real approval contract must not allow fixture evidence to become real evidence by reinterpretation.

A real approval contract must not treat approval as execution readiness.

---

## Scope Boundary

FP-MCP-066 may:

* define the real human approval evidence artifact shape
* define required fields
* define forbidden fields
* define exact scope binding rules
* define canonical approval text requirements
* define expiration requirements
* define single-use requirements
* define revocation and quarantine compatibility requirements
* define validator expectations for future packets
* define recorder requirements for future packets
* define run artifacts under `runs/FP-MCP-066/`
* define a contract document under `docs/`

FP-MCP-066 must not:

* create a real approval artifact
* add a real approval recorder tool
* mutate existing approval artifacts
* convert dry-run fixtures into real approvals
* mark `humanApprovalRecorded: true`
* mark `approvalUsableForExecution: true`
* consume approval evidence
* revoke approval evidence
* enable runner execution
* enable OpenCode execution
* call the runner start endpoint
* start OpenCode
* create a real `runnerRunId`
* create real execution artifacts
* weaken the global disable switch
* weaken request validation
* weaken pre-start evidence validation
* weaken state snapshot validation
* weaken the FP-MCP-064 start approval gate

---

## Core Distinction

ForgePilot now has approval-shaped fixture evidence.

FP-MCP-066 defines real approval evidence.

These must remain different classes of artifacts.

### Fixture Approval Evidence

Fixture approval evidence is intentionally non-authorizing.

It may be used to test validators and gates.

It must not satisfy the start request human approval evidence gate.

Fixture evidence may contain:

```text
fixture: true
dryRun: true
artifactType: human-approval-evidence-dry-run-fixture
approvalState: INVALID or QUARANTINED
humanApprovalRecorded: false
approvalUsableForExecution: false
```

### Real Human Approval Evidence

Real human approval evidence is a future explicit human authorization observation.

It may be eligible to satisfy the human approval evidence gate only if it satisfies this contract and all future recorder, validator, and consumption gates.

Real approval evidence must contain:

```text
fixture: false
dryRun: false
artifactType: human-approval-evidence
approvalState: RECORDED
humanApprovalRecorded: true
approvalUsableForExecution: true only after validator acceptance
```

A real approval artifact alone must still not authorize execution.

It only satisfies one required gate.

The global disable switch, request validation, pre-start evidence, state snapshot evidence, runner capability, OpenCode capability, secret boundary, and network boundary remain independent gates.

---

## Real Approval Evidence Artifact Contract

A real human approval evidence artifact must be JSON.

It must be create-only.

It must be immutable after creation.

It must live under an allowed ForgePilot evidence path:

```text
runs/<packetId>/approvals/<approvalId>.json
```

The approval id must be globally unique enough for the repository and must use the format:

```text
APPROVAL-<UTC timestamp>-<opaque suffix>
```

Example shape:

```json
{
  "schemaVersion": "FP-MCP-066",
  "artifactType": "human-approval-evidence",
  "approvalId": "APPROVAL-20260623T000000000Z-abcdef12",
  "approvalKind": "EXECUTION_ENABLEMENT",
  "approvedAction": "ALLOW_ONE_GUARDED_REMOTE_RUNNER_EXECUTION_ATTEMPT",
  "approvalState": "RECORDED",
  "fixture": false,
  "dryRun": false,
  "humanApprovalRecorded": true,
  "approvalUsableForExecution": false,
  "scope": {
    "packetId": "FP-MCP-036",
    "requestId": "REQ-20260622T144553300Z-fbbe8d82",
    "modelId": "qwen-3.7-max",
    "runMode": "DESIGN_ONLY",
    "repoCommit": "40b53dc",
    "branch": "main"
  },
  "canonicalApprovalText": "I approve one guarded ForgePilot remote-runner start attempt for packet FP-MCP-036, request REQ-20260622T144553300Z-fbbe8d82, model qwen-3.7-max, run mode DESIGN_ONLY, repository commit 40b53dc, branch main. This approval is single-use, expires at <expiresAt>, and does not override the global disable switch or any other ForgePilot safety gate.",
  "approvalText": "<exact human-provided approval text or recorded canonical equivalent>",
  "approvedBy": {
    "operatorId": "<non-secret operator identifier>",
    "operatorHandle": "<non-secret operator handle if intentionally recorded>",
    "operatorEmailHash": "<optional non-reversible hash, not raw email>"
  },
  "createdAt": "2026-06-23T00:00:00.000Z",
  "expiresAt": "2026-06-23T00:15:00.000Z",
  "singleUse": true,
  "consumed": false,
  "consumedAt": null,
  "revoked": false,
  "revokedAt": null,
  "quarantined": false,
  "quarantinedAt": null,
  "preconditions": {
    "requestArtifactValidated": true,
    "preStartEvidenceValidated": true,
    "stateSnapshotValidated": true,
    "humanApprovalGateRequired": true,
    "globalDisableSwitchNotOverridden": true
  },
  "secretBoundary": {
    "containsSecrets": false,
    "secretMaterialRedacted": true
  },
  "createdByTool": "<future recorder tool name>",
  "createdByBoundaryVersion": "<future recorder boundary version>",
  "notes": []
}
```

The example is illustrative.

FP-MCP-066 does not create this artifact.

---

## Required Fields

A real human approval evidence artifact must include:

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

---

## Required Values

For a real approval to be eligible for validation, these values must hold:

```text
artifactType == human-approval-evidence
fixture == false
dryRun == false
approvalState == RECORDED
approvalKind == EXECUTION_ENABLEMENT
approvedAction == ALLOW_ONE_GUARDED_REMOTE_RUNNER_EXECUTION_ATTEMPT
humanApprovalRecorded == true
singleUse == true
consumed == false
revoked == false
quarantined == false
secretBoundary.containsSecrets == false
```

`approvalUsableForExecution` is not self-authorizing.

A future validator may derive usability from the artifact and surrounding evidence.

A future recorder must not use `approvalUsableForExecution: true` as a shortcut around validation.

---

## Scope Binding Requirements

Approval scope must be exact.

A real approval must bind to exactly one:

```text
packetId
requestId
modelId
runMode
repoCommit
branch
```

A real approval must not bind to:

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

Any scope that is broader than one exact request must fail closed.

Any mismatch between the approval scope and the start request scope must fail closed.

---

## Canonical Approval Text Requirements

A real approval must include explicit approval text.

The approval text must include or be derived from a canonical text that identifies:

```text
packet id
request id
model id
run mode
repository commit
branch
single-use property
expiration time
non-override of global disable switch
non-override of other safety gates
```

The approval text must not be inferred from:

```text
a casual chat message
an ambiguous "yes"
an earlier unrelated approval
a previous packet approval
a commit message
absence of refusal
operator silence
fixture evidence
```

---

## Expiration Requirements

A real approval must expire.

Expiration must be explicit.

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

The maximum lifetime is not implemented by this packet.

A future packet must define the configured maximum lifetime.

Until that exists, no real approval recorder should be considered complete.

---

## Single-Use Requirements

A real approval must be single-use.

A real approval may authorize at most one guarded start attempt.

The approval must not be reusable after a start attempt reaches the approval consumption boundary, whether or not execution ultimately starts.

Single-use consumption is not implemented by this packet.

A future packet must define:

```text
approval consumption event shape
when consumption happens
how consumption is recorded
how validators reject consumed approvals
how failed or blocked attempts are classified
```

---

## Revocation and Quarantine Requirements

A real approval must be revocable before consumption.

A real approval must be quarantinable if later evidence shows that it was malformed, unsafe, ambiguous, overbroad, expired, duplicated, tampered with, or produced under invalid assumptions.

Revocation and quarantine are not implemented by this packet.

A future packet must define:

```text
revocation event shape
quarantine event shape
validator behavior for revoked approvals
validator behavior for quarantined approvals
audit behavior for disputed approvals
```

---

## Commit and Provenance Requirements

A real approval artifact must be committed before it can be considered by the guarded start path.

A real approval artifact must be rejected when:

```text
artifactCommitted == false
artifact path is unsafe
artifact id format is invalid
artifact JSON is invalid
artifact hash is unavailable when required
artifact provenance is incomplete
artifact claims to be created by an unknown boundary
```

A real approval must have clear provenance.

It must be possible to answer:

```text
who approved
what was approved
when it was approved
when it expires
which request it binds to
which commit it binds to
which tool recorded it
which validation boundary accepted or rejected it
whether it has been consumed, revoked, or quarantined
```

---

## Forbidden Content

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

---

## Validator Expectations For Future Packets

A future validator update must be able to distinguish:

```text
fixture evidence
real recorded evidence
revoked evidence
consumed evidence
expired evidence
quarantined evidence
malformed evidence
scope-mismatched evidence
uncommitted evidence
```

A future validator must reject fixture evidence for start authorization.

A future validator must reject real approval evidence unless every required field and binding rule passes.

A future validator must produce explicit reasons rather than relying on absence of success.

---

## Recorder Expectations For Future Packets

A future real approval recorder must:

```text
create approval artifacts only under allowed paths
use create-only writes
refuse overwrite
record exact scope
record canonical approval text
record expiration
record single-use state
record non-secret operator identity
record secret-boundary status
avoid enabling execution
avoid contacting the runner start endpoint
avoid starting OpenCode
return structured output
```

A future real approval recorder must not:

```text
consume approval
satisfy the start gate by itself
bypass validation
reuse dry-run fixture code without changing artifact class
write broad approvals
write unscoped approvals
write approvals for latest/main without concrete commit binding
```

---

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

FP-MCP-066 does not change those gates.

---

## Required Checkpoint Claims

After FP-MCP-066, the project should be able to state:

```text
realHumanApprovalEvidenceContractDefined: true
fixtureApprovalEvidenceStillNonAuthorizing: true
realHumanApprovalEvidenceRecorderDefined: false
realHumanApprovalEvidenceRecorded: false
approvalConsumptionDefined: false
approvalRevocationDefined: false
humanApprovalRecorded: false
approvalUsableForExecution: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

---

## Expected Artifacts

FP-MCP-066 should record:

```text
docs/real-human-approval-evidence-contract.md
runs/FP-MCP-066/executor-result.md
runs/FP-MCP-066/verification.txt
runs/FP-MCP-066/contract-result.json
```

---

## Verification

Verification should include:

1. Repository status.
2. OpenCode status.
3. Disable-switch status.
4. Confirmation that no real approval artifact was created.
5. Confirmation that no real approval recorder was added.
6. Confirmation that execution remains disabled.
7. Confirmation that the runner start endpoint was not contacted.
8. Confirmation that OpenCode was not started.

Expected verification result:

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

---

## Non-Authorization Statement

FP-MCP-066 does not authorize execution.

FP-MCP-066 does not create a real approval recorder.

FP-MCP-066 does not create real human approval evidence.

FP-MCP-066 does not consume approval evidence.

FP-MCP-066 does not satisfy the human approval evidence gate.

FP-MCP-066 only defines the contract that future real approval evidence must satisfy.

---

## Recommended Next Packets

After FP-MCP-066, the next packets should remain narrow:

```text
FP-MCP-067 — Real Human Approval Evidence Recorder
FP-MCP-068 — Single-Use Approval Consumption Gate
FP-MCP-069 — Human Approval Revocation and Expiration Enforcement
FP-MCP-070 — Real Approval Evidence Negative Fixture Revalidation
FP-MCP-071 — Human Approval Evidence Readiness Recheck
```

The next phase must not skip directly to execution.
