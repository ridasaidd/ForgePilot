# FP-MCP-068 — Real Human Approval Evidence Validator Alignment

## Status

DRAFT

## Type

Implementation packet

## Depends On

- FP-MCP-059 — Human Approval Evidence Contract
- FP-MCP-061 — Human Approval Evidence Validator Hardening
- FP-MCP-064 — Start Request Human Approval Evidence Gate Enforcement
- FP-MCP-066 — Real Human Approval Evidence Contract
- FP-MCP-067 — Real Human Approval Evidence Recorder

## Task

Align the human approval evidence validator with the real approval evidence artifact shape introduced by FP-MCP-066 and recorded by FP-MCP-067.

The validator must distinguish fixture approval evidence from real recorded human approval evidence.

The validator must derive approval usability from observed artifact fields and surrounding evidence.

The recorder must not self-authorize approval usability.

FP-MCP-068 must not consume approval evidence.

FP-MCP-068 must not enable execution.

---

## Goal

Update validation semantics so a committed, scoped, real human approval evidence artifact can be evaluated correctly without confusing it with fixture evidence or with execution readiness.

FP-MCP-068 answers one question:

> Can the validator recognize a real human approval evidence artifact and derive whether it is usable for the human approval gate, without starting execution or consuming the approval?

The expected answer after implementation is:

```text
validatorBoundaryVersion: FP-MCP-068
approvalEvidenceContractVersion: FP-MCP-066
realApprovalEvidenceRecognized: true
fixtureApprovalEvidenceRecognized: true
approvalValidationEvaluated: true
approvalEvidenceValid: true for a valid committed real approval artifact
approvalUsableForExecution: true only as validator-derived output
approvalUsabilityDerivedByValidator: true
approvalUsabilityDerivedByRecorder: false
humanApprovalRecorded: true
approvalConsumed: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

This is a successful result only if execution remains blocked by independent gates.

---

## Background

FP-MCP-067 successfully recorded a real human approval evidence artifact:

```text
runs/FP-MCP-067/approvals/APPROVAL-20260623T092925828Z-8dcf0b9d.json
```

That artifact is intentionally conservative:

```text
humanApprovalRecorded: true
approvalUsableForExecution: false
approvalUsabilityDerivedByRecorder: false
approvalUsabilityRequiresValidation: true
approvalConsumed: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

The existing FP-MCP-061 validator recognizes many structural properties of the artifact, but still rejects it because the validator has not yet been aligned with the FP-MCP-066 / FP-MCP-067 real approval shape.

Observed validator reasons before FP-MCP-068:

```text
APPROVAL_TEXT_INVALID
APPROVAL_PRECONDITIONS_MISSING
```

FP-MCP-068 updates validation semantics.

It does not update the recorder.

It does not update the start gate except where the start gate already consumes validator output.

---

## Governing Principles

FP-MCP-068 is constrained by:

```text
P01 — ForgePilot records observations, not narratives.
P02 — Trust cannot be retroactively created.
P03 — ForgePilot does not optimize for favorable outcomes.
P04 — Only admitted evidence may influence observatory outputs.
P06 — Classification follows observation.
```

A recorder may record human approval.

A validator may derive usability.

A start gate may consume validator output.

Those roles must not collapse into one step.

---

## Scope Boundary

FP-MCP-068 may:

* update the existing human approval evidence validator
* update validator response schema version and boundary version
* recognize FP-MCP-067 real approval artifacts
* preserve recognition of FP-MCP-063 dry-run fixture artifacts
* derive `approvalUsableForExecution` from validation checks
* add explicit output fields for validator-derived usability
* add explicit output fields for recorder-derived usability remaining false
* update start-path behavior only if it already depends on validator output and needs the new validator fields
* add or update bridge tests/manual verification probes
* record run artifacts under `runs/FP-MCP-068/`

FP-MCP-068 must not:

* create real approval evidence
* mutate existing approval evidence
* consume approval evidence
* revoke approval evidence
* quarantine approval evidence
* overwrite approval artifacts
* mark recorder-derived usability true
* enable runner execution
* enable OpenCode execution
* call the runner start endpoint
* start OpenCode
* execute a model
* create a real `runnerRunId`
* create execution artifacts
* weaken the global disable switch
* weaken request validation
* weaken pre-start evidence validation
* weaken state snapshot validation
* weaken approval scope binding
* accept fixture evidence as usable for execution
* accept expired, consumed, revoked, quarantined, uncommitted, overbroad, malformed, or scope-mismatched approval evidence

---

## Required Validator Semantics

The validator must evaluate approval evidence by artifact class.

### Fixture Evidence

Fixture evidence remains non-authorizing.

A dry-run fixture artifact must continue to return:

```text
fixtureApprovalEvidenceRecognized: true
realApprovalEvidenceRecognized: false
approvalEvidenceValid: false
approvalUsableForExecution: false
humanApprovalRecorded: false
```

Expected rejection reasons may include:

```text
APPROVAL_EVIDENCE_TYPE_INVALID
APPROVAL_ARTIFACT_TYPE_INVALID
APPROVAL_STATE_NOT_RECORDED
APPROVAL_QUARANTINED
```

### Real Recorded Evidence

A real approval artifact may be considered valid only if it satisfies all required checks:

```text
artifact exists
artifact path is safe
artifact id format is valid
artifact JSON is valid
artifact is committed
artifactType == human-approval-evidence
fixture == false
dryRun == false
approvalState == RECORDED
approvalKind == EXECUTION_ENABLEMENT
approvedAction == ALLOW_ONE_GUARDED_REMOTE_RUNNER_EXECUTION_ATTEMPT
humanApprovalRecorded == true
approvalUsabilityDerivedByRecorder == false
approvalUsabilityRequiresValidation == true
scope is exact
scope matches expected packet id
scope matches expected request id
scope matches expected model id
scope matches expected run mode
scope matches expected repo commit
scope matches expected branch
canonical approval text is present
canonical approval text matches the expected canonical text for the scope and expiration
approval text is present
approval text matches canonical approval text or satisfies the canonical text rule
createdAt is valid
expiresAt is valid
expiresAt is in the future
approval lifetime is within allowed maximum
singleUse == true
consumed == false
revoked == false
quarantined == false
secret boundary is valid
preconditions object is present
preconditions required values are true
```

If all checks pass, the validator may derive:

```text
approvalEvidenceValid: true
approvalValid: true
approvalUsableForExecution: true
approvalUsabilityDerivedByValidator: true
humanApprovalRecorded: true
```

The validator must also preserve:

```text
approvalCreated: false
approvalMutated: false
approvalConsumed: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

Validator usability means only that the approval evidence gate can pass.

It does not mean execution is allowed.

---

## Required Response Fields

The validator response must include or preserve equivalent fields for:

```text
schemaVersion
validatorBoundaryVersion
approvalEvidenceContractVersion
realApprovalEvidenceRecognized
fixtureApprovalEvidenceRecognized
approvalValidationEvaluated
approvalEvidenceValid
approvalValid
approvalUsableForExecution
approvalUsabilityDerivedByValidator
approvalUsabilityDerivedByRecorder
approvalUsabilityRequiresValidation
humanApprovalRecorded
approvalCreated
approvalMutated
approvalConsumed
approvalRevoked
approvalQuarantined
executionAllowedNow
executionStarted
startEndpointContacted
opencodeStarted
packetId
approvalId
approvalPath
expectedScope
checks
reasons
```

---

## Required Rejection Reasons

The validator must continue to fail closed with explicit reasons.

Required or acceptable reasons include:

```text
APPROVAL_EVIDENCE_ARTIFACT_MISSING
APPROVAL_ARTIFACT_MISSING
APPROVAL_EVIDENCE_TYPE_INVALID
APPROVAL_ARTIFACT_TYPE_INVALID
APPROVAL_STATE_NOT_RECORDED
APPROVAL_SCOPE_TOO_BROAD
APPROVAL_SCOPE_MISMATCH
APPROVAL_PACKET_BINDING_INVALID
APPROVAL_REQUEST_BINDING_INVALID
APPROVAL_MODEL_BINDING_INVALID
APPROVAL_RUN_MODE_BINDING_INVALID
APPROVAL_BASE_COMMIT_BINDING_INVALID
APPROVAL_COMMIT_BINDING_INVALID
APPROVAL_TEXT_MISSING
APPROVAL_TEXT_INVALID
APPROVAL_PRECONDITIONS_MISSING
APPROVAL_PRECONDITIONS_INVALID
APPROVAL_EXPIRED
APPROVAL_LIFETIME_TOO_LONG
APPROVAL_CONSUMED
APPROVAL_REVOKED
APPROVAL_QUARANTINED
APPROVAL_SECRET_BOUNDARY_VIOLATION
APPROVAL_ARTIFACT_UNCOMMITTED
```

FP-MCP-068 may remove `APPROVAL_TEXT_INVALID` and `APPROVAL_PRECONDITIONS_MISSING` for the valid FP-MCP-067 artifact only if those checks are actually satisfied under the new real approval contract semantics.

---

## Required Verification Probes

Verification must include:

### Probe 1 — Existing real approval artifact

Validate:

```text
packetId: FP-MCP-067
approvalId: APPROVAL-20260623T092925828Z-8dcf0b9d
expectedScope.packetId: FP-MCP-036
expectedScope.requestId: REQ-20260622T144553300Z-fbbe8d82
expectedScope.modelId: qwen-3.7-max
expectedScope.runMode: DESIGN_ONLY
expectedScope.repoCommit: 40b53dc
expectedScope.branch: main
```

Expected result:

```text
realApprovalEvidenceRecognized: true
fixtureApprovalEvidenceRecognized: false
approvalValidationEvaluated: true
approvalEvidenceValid: true
approvalValid: true
approvalUsableForExecution: true
approvalUsabilityDerivedByValidator: true
approvalUsabilityDerivedByRecorder: false
humanApprovalRecorded: true
approvalConsumed: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

If the artifact has expired by verification time, the packet must record that outcome honestly and either:

1. treat expiration rejection as correct behavior, then record a new real approval through FP-MCP-067-compatible tooling under a separate explicit step, or
2. defer usability-positive validation to a later fresh-approval packet.

It must not change the expiration rule to pass stale evidence.

### Probe 2 — Existing fixture approval artifact

Validate:

```text
packetId: FP-MCP-063
approvalId: APPROVAL-20260622T225539362Z-cb42d99f
```

Expected result:

```text
fixtureApprovalEvidenceRecognized: true
approvalEvidenceValid: false
approvalUsableForExecution: false
humanApprovalRecorded: false
```

### Probe 3 — Start request with approval id

Call the guarded start request path with the real approval id.

Expected result if the real approval is still unexpired:

```text
humanApprovalEvidenceEvaluated: true
humanApprovalEvidenceGatePassed: true
approvalValidationEvaluated: true
approvalEvidenceValid: true
approvalUsableForExecution: true
started: false
accepted: false
runnerContacted: false
startEndpointContacted: false
executionStarted: false
opencodeStarted: false
```

The start request must remain blocked by independent gates, including the global disable switch.

Expected result if the approval has expired:

```text
humanApprovalEvidenceEvaluated: true
humanApprovalEvidenceGatePassed: false
approvalValidationEvaluated: true
approvalEvidenceValid: false
approvalUsableForExecution: false
APPROVAL_EXPIRED
started: false
startEndpointContacted: false
executionStarted: false
opencodeStarted: false
```

---

## Acceptance Criteria

FP-MCP-068 is accepted only if:

1. The validator reports FP-MCP-068 boundary/version semantics.
2. Fixture evidence remains rejected.
3. Real approval evidence is recognized as a distinct artifact class.
4. Usability is derived by the validator, not the recorder.
5. The recorder-created artifact is not mutated.
6. No approval is consumed.
7. The start path does not contact the runner start endpoint.
8. OpenCode is not started.
9. Execution remains disabled.
10. The repository is clean after artifacts are recorded.

---

## Free Model Execution Note

A future execution packet may test with a no-cost or local model to avoid paid token usage.

That decision is out of scope for FP-MCP-068.

Before any such model can be used, ForgePilot must add a separate model allowlist and capability packet that records:

```text
model id
provider
whether the model is local, free-tier, or paid
whether credentials are required
whether network access is required
quality expectations
risk class
allowed run modes
executor compatibility
observability requirements
```

The current execution boundary must not silently expand the model allowlist.

---

## Expected Artifacts

FP-MCP-068 should record:

```text
runs/FP-MCP-068/executor-result.md
runs/FP-MCP-068/verification.txt
runs/FP-MCP-068/validator-alignment-result.json
```

---

## Non-Authorization Statement

FP-MCP-068 does not authorize execution.

FP-MCP-068 does not consume approval evidence.

FP-MCP-068 does not create approval evidence.

FP-MCP-068 does not enable runner execution.

FP-MCP-068 does not enable OpenCode execution.

FP-MCP-068 only aligns validator semantics with the already-recorded real approval evidence artifact class.
