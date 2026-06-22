# FP-MCP-065 — Human Approval Evidence Readiness Checkpoint

## Status

DRAFT

## Type

Checkpoint / boundary review packet

## Task

Record the human approval evidence readiness boundary after FP-MCP-059 through FP-MCP-064.

This packet consolidates what has been proven, what remains blocked, and what must be true before ForgePilot can introduce real human approval evidence.

FP-MCP-065 must not add runtime behavior.

FP-MCP-065 must not create real approval evidence.

FP-MCP-065 must not enable execution.

---

## Goal

Create a checkpoint that answers one question:

**Is ForgePilot ready to move from fixture-only human approval evidence toward a real, scoped, single-use human approval evidence path?**

The expected answer is:

```text
approvalEvidenceReadinessCheckpointRecorded: true
approvalEvidenceContractDefined: true
approvalEvidenceValidatorAligned: true
approvalEvidenceValidatorHardened: true
negativeApprovalEvidenceRejected: true
approvalEvidenceDryRunFixtureRecorderDefined: true
startRequestApprovalEvidenceGateEnforced: true
realHumanApprovalEvidenceRecorderDefined: false
realHumanApprovalEvidenceRecorded: false
humanApprovalRecorded: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

This is a successful result.

---

## Background

FP-MCP-058 recorded the execution safety boundary after the first guarded start-path sequence.

That checkpoint identified human approval evidence as unresolved.

FP-MCP-059 through FP-MCP-064 then built the approval-evidence layer:

```text
FP-MCP-059 — Human Approval Evidence Contract
FP-MCP-060 — Human Approval Evidence Validation Alignment
FP-MCP-061 — Human Approval Evidence Validator Hardening
FP-MCP-062 — Human Approval Evidence Negative Fixture Revalidation
FP-MCP-063 — Human Approval Evidence Dry-Run Fixture Recorder
FP-MCP-064 — Start Request Human Approval Evidence Gate Enforcement
```

FP-MCP-065 is the checkpoint after that sequence.

It does not advance to real approval creation.

It decides whether the fixture-only approval-evidence runway is complete enough to justify planning the real approval phase.

---

## Governing Principles

FP-MCP-065 is constrained by:

```text
P01 — ForgePilot records observations, not narratives.
P02 — Trust cannot be retroactively created.
P03 — ForgePilot does not optimize for favorable outcomes.
P04 — Only admitted evidence may influence observatory outputs.
P06 — Classification follows observation.
```

A checkpoint must not create trust.

A checkpoint must not reinterpret fixture evidence as real approval evidence.

A checkpoint must not treat a blocked start path as execution readiness.

---

## Scope Boundary

FP-MCP-065 may:

* add a checkpoint document under `docs/`
* record a readiness checkpoint under `runs/FP-MCP-065/`
* summarize FP-MCP-059 through FP-MCP-064
* identify completed approval-evidence gates
* identify remaining blockers
* identify next packets for real approval evidence
* verify current repository status
* verify OpenCode remains disabled
* verify runner execution remains disabled
* verify the start path still blocks without valid approval evidence
* record verification artifacts

FP-MCP-065 must not:

* create real human approval evidence
* create a real approval recorder
* mark human approval as recorded
* mark approval evidence as usable for execution
* satisfy the human approval gate
* consume approval evidence
* revoke approval evidence
* enable runner execution
* set `FORGEPILOT_RUNNER_EXECUTION_ENABLED=true`
* enable OpenCode execution
* change runner execution config
* call `/runner/start-run`
* invoke OpenCode CLI
* invoke OpenCode API
* call model providers
* execute shell commands through the runner
* create a real `runnerRunId`
* create real execution artifacts
* mutate request artifacts
* mutate existing approval artifacts
* commit secrets
* expose the private runner publicly
* weaken the disable switch
* weaken pre-start evidence or state snapshot gates

---

## Required Checkpoint Claims

The checkpoint must explicitly state whether the following claims are true:

1. The human approval evidence contract exists.
2. The approval validator reports the FP-MCP-059 contract lineage.
3. The approval validator reports the FP-MCP-061 boundary version.
4. Missing approval evidence fails closed.
5. Invalid approval evidence fails closed.
6. Negative approval evidence fixtures are rejected.
7. Approval-shaped dry-run fixtures can be recorded.
8. Approval-shaped dry-run fixtures remain non-authorizing.
9. Committed approval-shaped fixtures remain rejected by the validator.
10. The guarded start path requires human approval evidence.
11. The guarded start path blocks when approval evidence is missing.
12. The guarded start path blocks when approval evidence is invalid or not usable.
13. The guarded start path preserves valid request artifact evidence.
14. The guarded start path preserves valid pre-start evidence.
15. The guarded start path preserves valid state snapshot evidence.
16. The guarded start path still does not contact the runner start endpoint.
17. OpenCode remains unstarted.
18. Runner execution remains disabled.
19. OpenCode execution remains disabled.
20. The global disable switch remains active.

---

## Completed Approval-Evidence Sequence

The checkpoint must summarize:

### FP-MCP-059

Defined the human approval evidence contract.

Required outcome:

```text
approvalEvidenceContractDefined: true
realHumanApprovalEvidenceCreated: false
executionAllowedNow: false
```

### FP-MCP-060

Aligned the existing approval validator lineage with the newer approval-evidence model.

Required outcome:

```text
approvalValidationEvaluated: true
approvalUsableForExecution: false
approvalCreated: false
approvalMutated: false
humanApprovalRecorded: false
```

### FP-MCP-061

Hardened the validator so it reports:

```text
schemaVersion: FP-MCP-061
validatorBoundaryVersion: FP-MCP-061
approvalEvidenceContractVersion: FP-MCP-059
legacyApprovalRecordBoundaryRecognized: FP-MCP-041
```

### FP-MCP-062

Revalidated negative approval-evidence fixtures.

Required outcome:

```text
allNegativeApprovalEvidenceFixturesRejected: true
approvalEvidenceValid: false
approvalUsableForExecution: false
humanApprovalRecorded: false
```

### FP-MCP-063

Added a dry-run fixture recorder.

Required outcome:

```text
dryRunFixtureRecorded: true
dryRunFixtureValidated: true
approvalEvidenceValid: false
approvalUsableForExecution: false
humanApprovalRecorded: false
```

### FP-MCP-064

Enforced human approval evidence as a guarded start-path gate.

Required outcome:

```text
humanApprovalEvidenceEvaluated: true
humanApprovalEvidenceGatePassed: false
START_REQUEST_HUMAN_APPROVAL_EVIDENCE_GATE_BLOCKED
startEndpointContacted: false
executionStarted: false
opencodeStarted: false
```

---

## Current Known Remaining Blockers

The checkpoint must preserve these blockers:

```text
realHumanApprovalEvidenceContractFinalized: false
realHumanApprovalEvidenceRecorderDefined: false
singleUseApprovalConsumptionDefined: false
approvalRevocationPathDefined: false
approvalExpirationPolicyFullyEnforcedForRealApprovals: false
approvalAuditAdmissionPathDefinedForRealApprovals: false
runnerExecutionCapabilityPresent: false
opencodeBoundarySatisfied: false
secretBoundarySatisfied: false
networkBoundarySatisfied: false
globalDisableSwitchActive: true
executionAllowedNow: false
```

These blockers are not failures.

They define the remaining runway before any controlled execution attempt can be considered.

---

## Required Verification Probes

Verification should include:

1. Repository status.
2. OpenCode status.
3. Disable-switch status.
4. Start request probe with no approval id.
5. Start request probe with invalid or missing approval evidence.
6. Optional validator probe against the committed FP-MCP-063 dry-run fixture.

The start request probes must show:

```text
humanApprovalEvidenceEvaluated: true
humanApprovalEvidenceGatePassed: false
started: false
accepted: false
runnerContacted: false
startEndpointContacted: false
executionStarted: false
opencodeStarted: false
```

The validator probe must show:

```text
approvalValidationEvaluated: true
approvalEvidenceValid: false
approvalUsableForExecution: false
humanApprovalRecorded: false
```

---

## Expected Artifacts

FP-MCP-065 should record:

```text
docs/human-approval-evidence-readiness-checkpoint.md
runs/FP-MCP-065/executor-result.md
runs/FP-MCP-065/verification.txt
runs/FP-MCP-065/readiness-checkpoint-result.json
```

---

## Non-Authorization Statement

FP-MCP-065 does not authorize execution.

FP-MCP-065 does not create real approval evidence.

FP-MCP-065 does not create a real approval recorder.

FP-MCP-065 does not satisfy the human approval gate.

FP-MCP-065 does not consume or mutate approval evidence.

FP-MCP-065 only records the readiness boundary after the fixture-only human approval evidence sequence.

---

## Recommended Next Packets

If FP-MCP-065 passes, the next phase should be explicit and narrower than the previous fixture phase:

```text
FP-MCP-066 — Real Human Approval Evidence Contract
FP-MCP-067 — Real Human Approval Evidence Recorder
FP-MCP-068 — Single-Use Approval Consumption Gate
FP-MCP-069 — Human Approval Revocation and Expiration Enforcement
FP-MCP-070 — Human Approval Evidence Readiness Recheck
```

The next phase must not skip directly to execution.

Real approval evidence is still only one required gate.

---

## Success Criteria

FP-MCP-065 succeeds only if it records the checkpoint and preserves:

```text
approvalEvidenceReadinessCheckpointRecorded: true
realHumanApprovalEvidenceRecorded: false
humanApprovalRecorded: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
workingTreeCleanAfterArtifacts: true
```

Any result that creates real approval evidence fails this packet.

Any result that enables execution fails this packet.

Any result that contacts the runner start endpoint fails this packet.

Any result that starts OpenCode fails this packet.
