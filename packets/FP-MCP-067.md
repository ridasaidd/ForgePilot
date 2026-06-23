# FP-MCP-067 — Real Human Approval Evidence Recorder

## Status

DRAFT

## Type

Implementation packet

## Depends On

- FP-MCP-059 — Human Approval Evidence Contract
- FP-MCP-061 — Human Approval Evidence Validator Hardening
- FP-MCP-064 — Start Request Human Approval Evidence Gate Enforcement
- FP-MCP-065 — Human Approval Evidence Readiness Checkpoint
- FP-MCP-066 — Real Human Approval Evidence Contract

## Task

Implement a real human approval evidence recorder.

The recorder must create a scoped, create-only human approval evidence artifact that records an explicit human approval observation.

The recorder must not mark the approval as consumed.

The recorder must not enable execution.

The recorder must not contact the runner start endpoint.

The recorder must not start OpenCode.

The recorder must not self-authorize execution by setting approval usability as a final fact.

---

## Design Decision

FP-MCP-067 follows the conservative path:

```text
The recorder records the human approval observation.
The validator derives whether the approval is usable for execution.
The start gate consumes validator output, not recorder optimism.
```

Therefore, the recorder must write:

```text
humanApprovalRecorded: true
approvalUsableForExecution: false
approvalUsabilityDerivedByRecorder: false
approvalUsabilityRequiresValidation: true
```

A future validator update may derive an output such as:

```text
approvalUsableForExecution: true
```

but the artifact itself must not claim final execution usability.

This preserves the distinction:

```text
recorded approval != validated approval != consumed approval != execution readiness
```

---

## Goal

Create the first real human approval evidence recorder while preserving all execution-safety boundaries.

FP-MCP-067 answers one question:

> Can ForgePilot record a real, explicit, scoped, single-use human approval observation without enabling execution or satisfying the start gate by itself?

The expected result is:

```text
realHumanApprovalEvidenceRecorderDefined: true
realHumanApprovalEvidenceRecorded: true
humanApprovalRecorded: true
approvalUsableForExecution: false
approvalUsabilityRequiresValidation: true
approvalConsumed: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

This is a successful result.

---

## Governing Principles

FP-MCP-067 is constrained by:

```text
P01 — ForgePilot records observations, not narratives.
P02 — Trust cannot be retroactively created.
P03 — ForgePilot does not optimize for favorable outcomes.
P04 — Only admitted evidence may influence observatory outputs.
P06 — Classification follows observation.
```

The recorder records an observation.

It must not silently classify that observation as sufficient for execution.

It must not convert conversational consent into execution authority unless the approval text is explicit, scoped, and recorded under the real approval contract.

---

## Scope Boundary

FP-MCP-067 may:

* add a new MCP tool for recording real human approval evidence
* write one real approval evidence artifact under `runs/<packetId>/approvals/`
* require exact approval text
* require exact scope binding
* require expiration
* require single-use fields
* require non-secret operator identity fields
* enforce create-only writes
* return structured recorder output
* report that execution remains disabled
* report that the runner start endpoint was not contacted
* report that OpenCode was not started
* record run artifacts under `runs/FP-MCP-067/`

FP-MCP-067 must not:

* enable runner execution
* enable OpenCode execution
* call the runner start endpoint
* start OpenCode
* call model providers
* execute shell commands through the runner
* consume approval evidence
* mutate existing approval evidence
* overwrite approval evidence
* create broad approvals
* create recurring approvals
* create approvals for latest/main without concrete commit binding
* mark approval evidence as finally usable for execution
* bypass the validator
* bypass the FP-MCP-064 start request approval gate
* weaken request validation
* weaken pre-start evidence validation
* weaken state snapshot validation
* weaken the global disable switch

---

## Required Tool

Add a new MCP tool:

```text
forgepilot_record_real_human_approval_evidence
```

The tool must be separate from the FP-MCP-063 fixture recorder.

It must not reuse the fixture recorder name.

It must not write fixture artifacts.

It must not accept `dryRun: true`.

It must not accept `fixture: true`.

---

## Tool Inputs

The tool must require:

```json
{
  "packetId": "FP-MCP-067",
  "requestId": "REQ-20260622T144553300Z-fbbe8d82",
  "modelId": "qwen-3.7-max",
  "runMode": "DESIGN_ONLY",
  "repoCommit": "40b53dc",
  "branch": "main",
  "approvalText": "<exact explicit human approval text>",
  "operatorId": "<non-secret operator identifier>",
  "expiresAt": "<ISO-8601 UTC timestamp>",
  "approval": "RECORD_REAL_HUMAN_APPROVAL_EVIDENCE"
}
```

Optional fields may include:

```json
{
  "operatorHandle": "<non-secret handle>",
  "operatorEmailHash": "<non-reversible hash>",
  "notes": []
}
```

The tool must reject calls when the `approval` field does not exactly equal:

```text
RECORD_REAL_HUMAN_APPROVAL_EVIDENCE
```

---

## Required Canonical Approval Text

The recorder must require approval text that is explicit enough to bind the approval to one scoped request.

For the canonical request currently used in the non-executing runway, the approval text should be equivalent to:

```text
I approve one guarded ForgePilot remote-runner start attempt for packet FP-MCP-036, request REQ-20260622T144553300Z-fbbe8d82, model qwen-3.7-max, run mode DESIGN_ONLY, repository commit 40b53dc, branch main. This approval is single-use, expires at <expiresAt>, and does not override the global disable switch or any other ForgePilot safety gate.
```

The recorder may require exact match or canonical normalized match.

The recorder must reject ambiguous approval text, including:

```text
yes
approved
go ahead
run it
looks good
same as before
approved for main
approved for this packet
```

---

## Artifact Path

The recorder must write the artifact under:

```text
runs/<packetId>/approvals/<approvalId>.json
```

For FP-MCP-067 verification, this means:

```text
runs/FP-MCP-067/approvals/<approvalId>.json
```

The write must be create-only.

If the target file exists, the tool must fail closed.

---

## Approval ID Format

The recorder must generate an id using:

```text
APPROVAL-<UTC timestamp>-<opaque suffix>
```

Example:

```text
APPROVAL-20260623T090000000Z-abcdef12
```

The suffix must not contain secrets.

---

## Real Approval Artifact Shape

The recorder must write a JSON artifact shaped like:

```json
{
  "schemaVersion": "FP-MCP-067",
  "artifactType": "human-approval-evidence",
  "approvalId": "APPROVAL-20260623T090000000Z-abcdef12",
  "approvalKind": "EXECUTION_ENABLEMENT",
  "approvedAction": "ALLOW_ONE_GUARDED_REMOTE_RUNNER_EXECUTION_ATTEMPT",
  "approvalState": "RECORDED",
  "fixture": false,
  "dryRun": false,
  "humanApprovalRecorded": true,
  "approvalUsableForExecution": false,
  "approvalUsabilityDerivedByRecorder": false,
  "approvalUsabilityRequiresValidation": true,
  "scope": {
    "packetId": "FP-MCP-036",
    "requestId": "REQ-20260622T144553300Z-fbbe8d82",
    "modelId": "qwen-3.7-max",
    "runMode": "DESIGN_ONLY",
    "repoCommit": "40b53dc",
    "branch": "main"
  },
  "canonicalApprovalText": "I approve one guarded ForgePilot remote-runner start attempt for packet FP-MCP-036, request REQ-20260622T144553300Z-fbbe8d82, model qwen-3.7-max, run mode DESIGN_ONLY, repository commit 40b53dc, branch main. This approval is single-use, expires at <expiresAt>, and does not override the global disable switch or any other ForgePilot safety gate.",
  "approvalText": "<exact explicit human approval text>",
  "approvedBy": {
    "operatorId": "<non-secret operator identifier>",
    "operatorHandle": "<non-secret operator handle if intentionally recorded>",
    "operatorEmailHash": "<optional non-reversible hash, not raw email>"
  },
  "createdAt": "2026-06-23T09:00:00.000Z",
  "expiresAt": "2026-06-23T09:15:00.000Z",
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
  "createdByTool": "forgepilot_record_real_human_approval_evidence",
  "createdByBoundaryVersion": "FP-MCP-067",
  "notes": []
}
```

The exact `createdAt`, `expiresAt`, and `approvalId` are generated or supplied at runtime.

---

## Required Recorder Output

The tool must return structured output containing:

```text
schemaVersion: FP-MCP-067
boundaryVersion: FP-MCP-067
packetId
requestId
modelId
runMode
repoCommit
branch
approvalRecorderEvaluated: true
realHumanApprovalEvidenceRecorded: true
humanApprovalRecorded: true
approvalArtifactPath
approvalId
approvalArtifactSha256
approvalUsableForExecution: false
approvalUsabilityDerivedByRecorder: false
approvalUsabilityRequiresValidation: true
approvalConsumed: false
approvalCreated: true
approvalMutated: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
```

The recorder output must not include secrets.

---

## Required Rejection Behavior

The recorder must fail closed when:

```text
approval token is wrong
approval text is missing
approval text is ambiguous
requestId is missing
modelId is invalid
runMode is invalid
repoCommit is missing
branch is missing
expiresAt is missing
expiresAt is invalid
expiresAt is in the past
expiration lifetime exceeds maximum if configured
operatorId is missing
operator identity contains secret-like material
target path is unsafe
target artifact already exists
secret material is detected in approvalText or notes
```

Failure responses must include:

```text
realHumanApprovalEvidenceRecorded: false
humanApprovalRecorded: false
approvalCreated: false
approvalMutated: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

---

## Validation Interaction

FP-MCP-067 does not need to make the existing validator accept the artifact as usable for execution.

It is acceptable and expected for the existing FP-MCP-061 validator to reject or not fully recognize the new artifact until a future validator update.

However, FP-MCP-067 must ensure the artifact is structurally ready for a future validator to derive usability.

A future packet should update the validator to recognize FP-MCP-066/FP-MCP-067 real approval evidence semantics.

---

## Start Gate Interaction

After FP-MCP-067, the FP-MCP-064 start gate may still block when given the new approval id.

That is acceptable.

FP-MCP-067 records real approval evidence but does not guarantee:

```text
humanApprovalEvidenceGatePassed: true
```

A future validator/start-gate update must explicitly prove when real approval evidence can satisfy the human approval evidence gate.

---

## Required Verification

Verification must include:

1. Repository status before implementation.
2. Tool surface check showing the new recorder exists after bridge implementation.
3. A recorder call that creates one real approval evidence artifact.
4. Confirmation that the artifact is under `runs/FP-MCP-067/approvals/`.
5. Confirmation that the artifact has:
   - `artifactType: human-approval-evidence`
   - `fixture: false`
   - `dryRun: false`
   - `approvalState: RECORDED`
   - `humanApprovalRecorded: true`
   - `approvalUsableForExecution: false`
   - `approvalUsabilityRequiresValidation: true`
   - `singleUse: true`
   - `consumed: false`
   - `revoked: false`
   - `quarantined: false`
6. Confirmation that no execution was enabled.
7. Confirmation that the runner start endpoint was not contacted.
8. Confirmation that OpenCode was not started.
9. Repository status after artifact recording.

---

## Expected Artifacts

FP-MCP-067 should record:

```text
runs/FP-MCP-067/approvals/<approvalId>.json
runs/FP-MCP-067/executor-result.md
runs/FP-MCP-067/verification.txt
runs/FP-MCP-067/real-approval-recorder-result.json
```

---

## Non-Authorization Statement

FP-MCP-067 does not authorize execution.

FP-MCP-067 does not satisfy the human approval evidence gate by itself.

FP-MCP-067 does not consume approval evidence.

FP-MCP-067 does not override the global disable switch.

FP-MCP-067 does not override request artifact validation.

FP-MCP-067 does not override pre-start evidence validation.

FP-MCP-067 does not override state snapshot validation.

FP-MCP-067 only records a real human approval observation in a create-only artifact.

---

## Success Criteria

FP-MCP-067 succeeds only if:

```text
realHumanApprovalEvidenceRecorderDefined: true
realHumanApprovalEvidenceRecorded: true
humanApprovalRecorded: true
approvalUsableForExecution: false
approvalUsabilityRequiresValidation: true
approvalConsumed: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
workingTreeCleanAfterArtifacts: true
```

Any result that enables execution fails this packet.

Any result that contacts the runner start endpoint fails this packet.

Any result that starts OpenCode fails this packet.

Any result that records a broad, unscoped, reusable, expired, secret-bearing, or overwrite-based approval fails this packet.

---

## Recommended Next Packets

After FP-MCP-067, the next packets should remain narrow:

```text
FP-MCP-068 — Real Approval Evidence Validator Recognition
FP-MCP-069 — Single-Use Approval Consumption Gate
FP-MCP-070 — Human Approval Revocation and Expiration Enforcement
FP-MCP-071 — Real Approval Evidence Negative Fixture Revalidation
FP-MCP-072 — Human Approval Evidence Readiness Recheck
```

The next phase must not skip directly to execution.
