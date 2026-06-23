# FP-MCP-069 — Human Approval Expiration and Fresh Approval Revalidation

## Status

DRAFT

## Type

Validation / evidence packet

## Depends On

- FP-MCP-066 — Real Human Approval Evidence Contract
- FP-MCP-067 — Real Human Approval Evidence Recorder
- FP-MCP-068 — Real Human Approval Evidence Validator Alignment

## Task

Prove that the aligned human approval validator distinguishes expired real approval evidence from fresh real approval evidence.

This packet must use real approval evidence artifacts recorded through the FP-MCP-067 recorder and validated through the FP-MCP-068 validator boundary.

FP-MCP-069 must not consume approval evidence.

FP-MCP-069 must not enable execution.

FP-MCP-069 must not contact the runner start endpoint.

FP-MCP-069 must not start OpenCode.

---

## Goal

Create a narrow expiration/revalidation proof for real human approval evidence.

FP-MCP-069 answers one question:

> Can ForgePilot reject expired real approval evidence and accept fresh real approval evidence as approval evidence, while still keeping execution disabled and approval unconsumed?

The expected result is:

```text
expiredApprovalRejected: true
freshApprovalEvidenceValid: true
freshApprovalUsabilityDerivedByValidator: true
freshApprovalConsumed: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

This is a successful result.

---

## Governing Principles

FP-MCP-069 is constrained by:

```text
P01 — ForgePilot records observations, not narratives.
P02 — Trust cannot be retroactively created.
P03 — ForgePilot does not optimize for favorable outcomes.
P04 — Only admitted evidence may influence observatory outputs.
P06 — Classification follows observation.
```

A fresh approval is not execution readiness.

A valid approval is not consumed merely because it validates.

Validation must not mutate approval evidence.

Expiration must fail closed.

---

## Background

FP-MCP-067 recorded the first real human approval evidence artifact.

FP-MCP-068 aligned the validator with the FP-MCP-067 real approval artifact shape and removed the prior false negatives:

```text
APPROVAL_TEXT_INVALID
APPROVAL_PRECONDITIONS_MISSING
```

The previously recorded approval later failed closed only because it expired:

```text
APPROVAL_EXPIRED
```

FP-MCP-069 records that expired approval as the negative case and creates a fresh approval as the positive validation case.

---

## Scope Boundary

FP-MCP-069 may:

* record one fresh real approval evidence artifact using the FP-MCP-067 recorder
* validate the existing expired real approval evidence artifact
* validate the new fresh real approval evidence artifact
* record validator outputs under `runs/FP-MCP-069/`
* record an expiration/revalidation result artifact
* record executor and verification artifacts

FP-MCP-069 must not:

* create a new recorder tool
* change validator semantics beyond using the already aligned FP-MCP-068 validator
* consume approval evidence
* define approval consumption events
* mark approval as consumed
* mutate approval artifacts
* revoke approval evidence
* quarantine approval evidence
* enable runner execution
* enable OpenCode execution
* call `/runner/start-run`
* contact the runner start endpoint
* start OpenCode
* create a real `runnerRunId`
* weaken the global disable switch
* weaken request validation
* weaken pre-start evidence validation
* weaken state snapshot validation
* weaken the human approval evidence gate

---

## Test Subjects

### Expired Approval Case

The expired approval case should use the existing FP-MCP-067 real approval artifact:

```text
approvalId: APPROVAL-20260623T092925828Z-8dcf0b9d
path: runs/FP-MCP-067/approvals/APPROVAL-20260623T092925828Z-8dcf0b9d.json
```

Expected expired validation result:

```text
approvalValidationEvaluated: true
approvalEvidenceValid: false
approvalUsableForExecution: false
humanApprovalRecorded: true
artifactCommitted: true
scopeMatchesExpected: true
canonicalApprovalTextValid: true
preconditionsValid: true
APPROVAL_EXPIRED
```

### Fresh Approval Case

The fresh approval case must record a new real human approval evidence artifact using the FP-MCP-067 recorder.

The fresh approval must bind to the same canonical request scope unless intentionally changed by a later packet:

```text
packetId: FP-MCP-036
requestId: REQ-20260622T144553300Z-fbbe8d82
modelId: qwen-3.7-max
runMode: DESIGN_ONLY
repoCommit: 40b53dc
branch: main
```

The fresh approval text must be explicit, canonical, single-use, time-limited, and must state that it does not override the global disable switch or other safety gates.

Expected fresh validation result:

```text
approvalValidationEvaluated: true
approvalEvidenceValid: true
approvalUsableForExecution: true
humanApprovalRecorded: true
artifactCommitted: true
scopeMatchesExpected: true
canonicalApprovalTextValid: true
preconditionsValid: true
expirationValid: true
notConsumed: true
notRevoked: true
notQuarantined: true
```

`approvalUsableForExecution: true` in this packet means only:

```text
The approval evidence gate can be satisfied by validator-derived approval evidence.
```

It does not mean execution is allowed.

---

## Required Recorder Behavior

When recording the fresh approval, the recorder must continue to report:

```text
realHumanApprovalEvidenceRecorded: true
humanApprovalRecorded: true
approvalCreated: true
approvalMutated: false
approvalUsableForExecution: false
approvalUsabilityDerivedByRecorder: false
approvalUsabilityRequiresValidation: true
approvalConsumed: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

This preserves the distinction between observation and validation.

---

## Required Validator Behavior

The FP-MCP-068 validator must derive fresh approval usability from the artifact and surrounding checks.

It must not accept expired approval evidence.

It must not accept consumed approval evidence.

It must not accept revoked approval evidence.

It must not accept quarantined approval evidence.

It must not accept scope-mismatched approval evidence.

For fresh approval evidence, validator-derived usability may be true only if all of the following are true:

```text
artifactExists
jsonValid
approvalEvidenceSchemaValid
approvalEvidenceTypeValid
artifactTypeValid
approvalStateValid
approvalKindValid
approvedActionValid
scopeExact
scopeMatchesExpected
canonicalApprovalTextValid
preconditionsValid
createdAtValid
expiresAtValid
approvalLifetimeValid
expirationValid
singleUseValid
notRevoked
notConsumed
notQuarantined
commitBindingValid
secretBoundaryValid
artifactCommitted
```

---

## Start Path Non-Goal

FP-MCP-069 does not need to prove the start path accepts the fresh approval.

That belongs to a later packet after approval validation behavior is stable.

However, if a start-path probe is run, it must still show:

```text
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

---

## Required Artifacts

FP-MCP-069 should record:

```text
runs/FP-MCP-069/executor-result.md
runs/FP-MCP-069/verification.txt
runs/FP-MCP-069/expiration-revalidation-result.json
```

It may also record copied or summarized validator outputs if useful:

```text
runs/FP-MCP-069/expired-approval-validation-result.json
runs/FP-MCP-069/fresh-approval-validation-result.json
runs/FP-MCP-069/fresh-approval-recorder-result.json
```

The fresh real approval evidence artifact itself may be recorded under:

```text
runs/FP-MCP-069/approvals/<approvalId>.json
```

or under the recorder packet path if the recorder intentionally stores all real approval evidence under `runs/FP-MCP-067/approvals/`.

The chosen path must be reported explicitly.

---

## Verification

Verification must include:

1. Repository status before final artifact commit.
2. OpenCode status.
3. Disable-switch status.
4. Expired approval validation result.
5. Fresh approval recorder result.
6. Fresh approval validation result.
7. Confirmation that fresh validation did not consume approval evidence.
8. Confirmation that execution remains disabled.
9. Confirmation that the runner start endpoint was not contacted.
10. Confirmation that OpenCode was not started.

---

## Acceptance Criteria

FP-MCP-069 is accepted only if:

1. Existing expired approval evidence is rejected with `APPROVAL_EXPIRED` or equivalent explicit expiration reason.
2. Existing expired approval evidence is not rejected for canonical text or precondition-shape reasons.
3. A fresh real approval evidence artifact is recorded through the real approval recorder.
4. The fresh recorder result reports `approvalUsableForExecution: false` and `approvalUsabilityRequiresValidation: true`.
5. The fresh approval validates under the FP-MCP-068 validator semantics.
6. The fresh validator result derives approval usability rather than trusting recorder usability.
7. The fresh approval remains unconsumed.
8. Execution remains disabled.
9. The runner start endpoint is not contacted.
10. OpenCode is not started.
11. The repository is clean after artifacts are committed.

---

## Non-Authorization Statement

FP-MCP-069 does not authorize execution.

FP-MCP-069 does not consume approval evidence.

FP-MCP-069 does not define the approval consumption boundary.

FP-MCP-069 does not enable runner execution.

FP-MCP-069 does not enable OpenCode execution.

FP-MCP-069 only proves expiration rejection and fresh approval validation behavior.

---

## Recommended Next Packet

If FP-MCP-069 succeeds, the next packet should be:

```text
FP-MCP-070 — Single-Use Approval Consumption Boundary Contract
```

That packet should define when a valid approval becomes consumed and how consumption is recorded before any start-path use of a fresh approval can become meaningful.
