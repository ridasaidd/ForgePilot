# Guarded Start Preflight Report Contract

## Purpose

This document defines the contract for a read-only guarded start preflight report.

The report answers one question:

```text
Would this request be eligible for guarded start if start were callable?
```

The report must not perform start behavior.

The report must not perform transition behavior.

The report must not consume approval.

The report must not mutate request artifacts.

The report must not contact the runner start endpoint.

The report must not start OpenCode.

The report must not create a runner run id.

## Context

FP-MCP-114 defined the start capability transition contract:

```text
NOT_PRESENT
→ PRESENT_DISABLED
→ PRESENT_GUARDED
→ CALLABLE_GUARDED
```

FP-MCP-114 established that:

- `PRESENT_DISABLED → CALLABLE_GUARDED` is invalid
- `PRESENT_GUARDED` must be reached before `CALLABLE_GUARDED`
- transition states are evidence-gated
- start endpoint presence is not execution authorization
- a transition approval is not a start approval
- a start approval is not a transition approval

This report is a readiness observation only.

It is not a start request.

It is not execution authorization.

It is not a transition decision.

## Future Tool Concept

A future MCP tool may implement this contract under a name such as:

```text
forgepilot_get_guarded_start_preflight_report
```

This document defines the contract only.

It does not require tool implementation.

## Required Inputs

The report requires:

- `packetId`
- `requestId`

The report may optionally accept:

- `approvalId`

The report must not infer approval identity from ambient state.

The report must not infer request identity from latest files.

The report must not select a request automatically.

## Required Safety Values

Every report must return these safety values:

```text
executionPermitted: false
executionStarted: false
opencodeStarted: false
runnerStartEndpointContacted: false
startEndpointContacted: false
runnerRunId: null
approvalConsumed: false
requestArtifactMutated: false
```

If any of these values are violated, the report must fail with:

```text
PREFLIGHT_SIDE_EFFECT_VIOLATION
```

## Required Output Summary Fields

The report must include:

- `guardedStartPreflightEvaluated`
- `eligibleForFutureGuardedStart`
- `executionPermitted`
- `executionStarted`
- `opencodeStarted`
- `runnerStartEndpointContacted`
- `startEndpointContacted`
- `runnerRunId`
- `approvalConsumed`
- `requestArtifactMutated`
- `packetId`
- `requestId`
- `approvalId`
- `runnerConfigured`
- `runnerReachable`
- `runnerStateObserved`
- `startEndpointPresent`
- `startEndpointState`
- `startCapabilityCallable`
- `executionEnabled`
- `supportedOperations`
- `checkedAt`
- `boundaryVersion`
- `statusSource`
- `reasons`

## Gate Result Model

Each gate must report:

- `evaluated`
- `passed`
- `state`
- `reasons`
- `evidencePath` where applicable
- `evidenceSha256` where applicable

Allowed gate states:

- `PASSED`
- `FAILED`
- `INCOMPLETE`
- `DEFERRED`
- `NOT_EVALUATED`

A report may be useful even when not eligible.

A failed or incomplete report must still be safe.

## Required Gates

### Gate 1 — Repository State

Must evaluate:

- working tree clean
- current commit
- current branch

Output fields:

- `repoClean`
- `currentCommit`
- `currentBranch`

Failure reasons:

- `REPO_DIRTY`
- `CURRENT_COMMIT_UNAVAILABLE`
- `CURRENT_BRANCH_UNAVAILABLE`

### Gate 2 — Request Artifact

Must evaluate:

- packet exists
- request artifact exists
- request artifact parses
- request artifact schema valid
- request artifact path safe
- request artifact hash computed

Output fields:

- `packetExists`
- `requestExists`
- `requestArtifactValid`
- `requestArtifactPath`
- `requestArtifactSha256`
- `safeArtifactDir`

Failure reasons:

- `PACKET_MISSING`
- `REQUEST_ARTIFACT_MISSING`
- `REQUEST_ARTIFACT_INVALID`
- `REQUEST_DIGEST_MISSING`
- `UNSAFE_ARTIFACT_DIR`

### Gate 3 — Commit Binding

Must evaluate:

- request base commit
- creation commit
- artifact commit
- artifact commit reachable from HEAD
- creation commit ancestor of artifact commit

Output fields:

- `requestBaseCommit`
- `creationCommit`
- `artifactCommit`
- `baseCommitMatches`
- `creationCommitExists`
- `artifactCommitExists`
- `creationCommitAncestorOfArtifactCommit`
- `artifactCommitReachableFromHead`

Failure reasons:

- `BASE_COMMIT_MISMATCH`
- `CREATION_COMMIT_MISSING`
- `ARTIFACT_COMMIT_MISSING`
- `CREATION_COMMIT_NOT_ANCESTOR`
- `ARTIFACT_COMMIT_NOT_REACHABLE`

### Gate 4 — Model And Run Mode

Must evaluate:

- model id is present
- model id is allowed
- run mode is present
- run mode is allowed

Output fields:

- `modelId`
- `modelAllowed`
- `runMode`
- `runModeAllowed`

Failure reasons:

- `MODEL_ID_MISSING`
- `MODEL_NOT_ALLOWED`
- `RUN_MODE_MISSING`
- `RUN_MODE_NOT_ALLOWED`

### Gate 5 — Disable Switch

Must evaluate:

- disable switch status
- effective disable reason
- effective disable scope

Output fields:

- `disableSwitchStatusEvaluated`
- `disableSwitchActive`
- `effectiveDisableReason`
- `effectiveDisableScope`
- `disableSwitchClear`

Failure reasons:

- `DISABLE_SWITCH_STATUS_UNAVAILABLE`
- `START_REQUEST_BLOCKED_BY_DISABLE_SWITCH`

### Gate 6 — Runner Capability State

Must evaluate:

- runner configured
- runner reachable
- start endpoint present
- start endpoint state
- start capability callable
- supported operations

Output fields:

- `runnerConfigured`
- `runnerReachable`
- `startEndpointPresent`
- `startEndpointState`
- `startCapabilityCallable`
- `supportedOperations`
- `runnerStateObserved`

Failure reasons:

- `RUNNER_UNCONFIGURED`
- `RUNNER_UNREACHABLE`
- `START_ENDPOINT_STATE_UNKNOWN`
- `START_ENDPOINT_DISABLED`
- `START_NOT_CALLABLE`
- `UNEXPECTED_SUPPORTED_OPERATION`

Required interpretation:

- `PRESENT_DISABLED` means not eligible for future guarded start.
- `PRESENT_GUARDED` may be eligible only if all other gates pass.
- `CALLABLE_GUARDED` must not be required for this report.
- unknown state fails closed.

### Gate 7 — OpenCode Readiness

Must evaluate:

- OpenCode configured
- OpenCode boundary known
- OpenCode execution status

Output fields:

- `opencodeStatusEvaluated`
- `opencodeConfigured`
- `opencodeExecutionEnabled`
- `opencodeReadyForFutureGuardedStart`

Failure reasons:

- `OPENCODE_STATUS_UNAVAILABLE`
- `OPENCODE_NOT_CONFIGURED`
- `OPENCODE_EXECUTION_DISABLED`

OpenCode readiness may be reported, but OpenCode must not be started.

### Gate 8 — Pre-Start Evidence

Must evaluate existing pre-start evidence, if present.

Output fields:

- `preStartEvidenceEvaluated`
- `preStartEvidenceComplete`
- `preStartEvidenceValid`
- `preStartEvidencePath`
- `preStartEvidenceMissingEvidence`
- `preStartEvidenceInconsistentEvidence`

Failure reasons:

- `PRE_START_EVIDENCE_NOT_EVALUATED`
- `PRE_START_EVIDENCE_INCOMPLETE`
- `PRE_START_EVIDENCE_INVALID`

### Gate 9 — State Snapshot Evidence

Must evaluate existing state snapshot evidence, if present.

Output fields:

- `stateSnapshotEvaluated`
- `stateSnapshotComplete`
- `stateSnapshotValid`
- `stateSnapshotPath`
- `stateSnapshotAttemptId`
- `stateSnapshotMissingEvidence`
- `stateSnapshotInconsistentEvidence`

Failure reasons:

- `STATE_SNAPSHOT_NOT_EVALUATED`
- `STATE_SNAPSHOT_INCOMPLETE`
- `STATE_SNAPSHOT_INVALID`

### Gate 10 — Human Approval Evidence

Must evaluate approval evidence only if `approvalId` is supplied.

The report must not create approval.

The report must not consume approval.

Output fields:

- `humanApprovalEvidenceEvaluated`
- `humanApprovalEvidenceGatePassed`
- `humanApprovalEvidenceId`
- `humanApprovalEvidencePath`
- `humanApprovalEvidenceValid`
- `humanApprovalEvidenceUsableForExecution`
- `approvalConsumed`

Failure reasons:

- `HUMAN_APPROVAL_EVIDENCE_MISSING`
- `APPROVAL_EVIDENCE_ARTIFACT_MISSING`
- `HUMAN_APPROVAL_EVIDENCE_SCOPE_UNAVAILABLE`
- `HUMAN_APPROVAL_EVIDENCE_INVALID`
- `APPROVAL_ALREADY_CONSUMED`

### Gate 11 — Evidence Ledger Readiness

Must evaluate whether evidence needed for guarded start is recorded and admissible.

Output fields:

- `evidenceLedgerEvaluated`
- `evidenceLedgerReady`
- `missingLedgerEvidence`
- `inadmissibleLedgerEvidence`

Failure reasons:

- `EVIDENCE_LEDGER_NOT_EVALUATED`
- `EVIDENCE_LEDGER_INCOMPLETE`
- `EVIDENCE_LEDGER_NOT_READY`

This gate may initially return `DEFERRED` until ledger-specific implementation exists.

## Eligibility Rule

`eligibleForFutureGuardedStart` may be true only when:

- report evaluated successfully
- request artifact gate passed
- commit binding gate passed
- model and run mode gate passed
- disable switch is clear
- runner state is `PRESENT_GUARDED`
- start capability is not callable
- `start-run` is not in `supportedOperations`
- required evidence gates passed or are explicitly allowed to be deferred by contract
- no execution side effects occurred

`eligibleForFutureGuardedStart` must be false when:

- runner state is `PRESENT_DISABLED`
- runner state is unknown
- start capability is callable before transition evidence
- `start-run` appears in `supportedOperations` before `CALLABLE_GUARDED`
- request artifact is invalid
- disable switch is active
- approval evidence is invalid
- evidence mutation is observed
- any execution side effect occurs

## Unknown State Rule

Unknown start endpoint states must fail closed.

Required reasons:

- `START_ENDPOINT_STATE_UNKNOWN`
- `START_NOT_CALLABLE`
- `EXECUTION_NOT_ALLOWED`

The report must not normalize unknown states into known states.

## Supported Operations Rule

While state is not `CALLABLE_GUARDED`, `supportedOperations` must not include:

- `start-run`
- `execute`
- `execution`

If any appear before `CALLABLE_GUARDED`, the report must fail with:

- `UNEXPECTED_SUPPORTED_OPERATION`

## Output Shape

The future report must follow this shape:

```json
{
  "guardedStartPreflightEvaluated": true,
  "eligibleForFutureGuardedStart": false,
  "executionPermitted": false,
  "executionStarted": false,
  "opencodeStarted": false,
  "runnerStartEndpointContacted": false,
  "startEndpointContacted": false,
  "runnerRunId": null,
  "approvalConsumed": false,
  "requestArtifactMutated": false,
  "packetId": "FP-MCP-000",
  "requestId": "REQ-...",
  "approvalId": null,
  "runnerConfigured": true,
  "runnerReachable": true,
  "runnerStateObserved": true,
  "startEndpointPresent": true,
  "startEndpointState": "PRESENT_DISABLED",
  "startCapabilityCallable": false,
  "executionEnabled": false,
  "supportedOperations": [
    "capabilities",
    "validate-request"
  ],
  "gates": {
    "repository": {
      "evaluated": true,
      "passed": true,
      "state": "PASSED",
      "reasons": []
    }
  },
  "boundaryVersion": "FP-MCP-115",
  "statusSource": "ForgePilot guarded start preflight report",
  "checkedAt": "ISO-8601",
  "reasons": []
}
```

## Verification Checklist

A valid implementation of this contract must confirm:

- report contract exists
- required input fields are defined
- required output fields are defined
- gate model is defined
- required gates are defined
- eligibility rule is defined
- side effect prohibition is defined
- unknown state rule is defined
- supported operations rule is defined
- no execution was enabled
- no start was made callable
- no runner start endpoint was contacted
- no OpenCode process was started
- no runner run id was created
- no approval was consumed
- no request artifact was mutated
