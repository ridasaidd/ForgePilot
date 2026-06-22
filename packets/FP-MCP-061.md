# FP-MCP-061 — Human Approval Evidence Validator Hardening

## Task

Harden the existing ForgePilot MCP human approval validator so that it aligns with the FP-MCP-059 human approval evidence contract while preserving the current fail-closed execution boundary.

## Goal

Prove that the already-existing human approval validation path can be brought forward from the older FP-MCP-040/FP-MCP-041 approval-record model to the newer FP-MCP-059 approval-evidence model without enabling execution, creating approvals, mutating approvals, contacting the runner start endpoint, or starting OpenCode.

FP-MCP-061 answers one question:

**Can the existing approval validator be made contract-aligned with FP-MCP-059 while still failing closed in the absence of committed human approval evidence?**

The expected current result after implementation is:

```text
approvalValidatorExists: true
validatorBoundaryVersion: FP-MCP-061
approvalEvidenceContractVersion: FP-MCP-059
legacyApprovalRecordBoundaryRecognized: FP-MCP-041
approvalValidationEvaluated: true
approvalEvidenceValid: false
approvalUsableForExecution: false
approvalCreated: false
approvalMutated: false
humanApprovalRecorded: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

This is a successful result.

---

## Background

FP-MCP-059 defined the human approval evidence contract for future guarded execution attempts.

FP-MCP-060 then observed that ForgePilot already exposes an MCP tool:

```text
forgepilot_validate_human_approval_record
```

That tool was introduced earlier by FP-MCP-041 against the FP-MCP-040 human approval record contract.

The observed FP-MCP-060 result was safe but only partially aligned:

```text
schemaVersion: FP-MCP-041
boundaryVersion: FP-MCP-041
approvalValidationEvaluated: true
approvalValid: false
approvalUsableForExecution: false
approvalCreated: false
approvalMutated: false
humanApprovalRecorded: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
reason: APPROVAL_ARTIFACT_MISSING
```

That result proved the validator fails closed.

It did not prove full alignment with FP-MCP-059.

FP-MCP-061 performs the controlled hardening step.

---

## Governing Principles

FP-MCP-061 is constrained by:

```text
P01 — ForgePilot records observations, not narratives.
P02 — Trust cannot be retroactively created.
P03 — ForgePilot does not optimize for favorable outcomes.
P04 — Only admitted evidence may influence observatory outputs.
P06 — Classification follows observation.
```

Human approval evidence is not trust by assertion.

Human approval evidence is a scoped, committed, single-use, time-limited artifact that may be validated.

Validation does not equal execution permission.

---

## Scope Boundary

FP-MCP-061 may:

* update the existing approval validation MCP tool
* keep the existing tool name if this avoids unnecessary API churn
* add output fields that explicitly reference FP-MCP-059
* distinguish validator boundary version from approval evidence contract version
* validate FP-MCP-059 approval evidence field names
* retain compatibility with the existing FP-MCP-041 output shape where useful
* validate path safety before artifact access
* validate approval id format independently of artifact existence
* validate missing approval evidence as a structured invalid result
* validate canonical approval text requirements
* validate approval scope exactness
* validate packet id binding
* validate request id binding
* validate model id binding
* validate run mode binding
* validate base commit binding
* validate branch binding if present
* validate single-use behavior
* validate expiration behavior
* enforce FP-MCP-059 approval lifetime limits
* validate revocation/quarantine fields
* validate secret-boundary backstops
* validate committed-artifact state if feasible
* return structured failure reason codes
* add TypeScript helpers if needed
* update output schemas if needed
* update bridge tests if they exist
* record verification artifacts

FP-MCP-061 must not:

* create a human approval artifact
* create a placeholder approval artifact
* mutate a human approval artifact
* mark human approval as recorded
* mark human approval as consumed
* mark human approval as revoked
* mark human approval as quarantined
* satisfy the start-path human approval gate
* enable runner execution
* set `FORGEPILOT_RUNNER_EXECUTION_ENABLED=true`
* set OpenCode execution enabled
* change runner execution config
* contact `/runner/start-run`
* call the guarded start MCP tool
* call a dry-run approval recorder
* call a dry-run execution writer
* start OpenCode
* invoke the OpenCode CLI
* invoke the OpenCode API
* call model providers
* execute shell commands through the runner
* create execution artifacts
* create a real `runnerRunId`
* add a real execution harness
* add worker processes
* add queues
* add scheduling
* mutate SQLite
* change routing logic
* expose the private runner publicly
* commit tokens or secrets

---

## Existing Tool

The existing tool is:

```text
forgepilot_validate_human_approval_record
```

FP-MCP-061 may keep this name.

A future packet may rename or alias it to:

```text
forgepilot_validate_human_approval_evidence
```

FP-MCP-061 does not require renaming.

Avoiding rename churn is acceptable if the output clearly identifies the FP-MCP-059 evidence contract.

---

## Required Version Semantics

The validator output must distinguish these concepts:

```text
validatorBoundaryVersion: FP-MCP-061
approvalEvidenceContractVersion: FP-MCP-059
legacyApprovalRecordBoundary: FP-MCP-041
```

`schemaVersion` may be updated to `FP-MCP-061` or preserved for compatibility if a separate `validatorBoundaryVersion` field is added.

However, the output must make it unambiguous that FP-MCP-061 validation is being performed against FP-MCP-059 evidence requirements.

---

## Required Input

Recommended input remains compatible with FP-MCP-041:

```json
{
  "packetId": "FP-MCP-061",
  "approvalId": "APPROVAL-20260622T000000000Z-abcdef12",
  "expectedScope": {
    "packetId": "FP-MCP-036",
    "requestId": "REQ-20260622T144553300Z-fbbe8d82",
    "modelId": "qwen-3.7-max",
    "runMode": "DESIGN_ONLY",
    "repoCommit": "40b53dc",
    "branch": "main"
  }
}
```

`repoCommit` is the FP-MCP-041 field name.

FP-MCP-059 names the same binding concept as base commit evidence.

The validator may accept `repoCommit` for compatibility, but the output must classify it as the FP-MCP-059 base commit binding.

---

## Required Approval Evidence Path

The validator must look for approval evidence under:

```text
runs/<packetId>/approvals/<approvalId>.json
```

The path must be:

```text
repository-relative
normalized
under runs/<packetId>/approvals/
free of path traversal
free of absolute paths
```

If the path is unsafe, validation must fail before reading.

---

## Required Missing Evidence Behavior

If the approval evidence artifact does not exist, the tool must return a structured invalid result.

Expected missing-artifact result:

```json
{
  "validatorBoundaryVersion": "FP-MCP-061",
  "approvalEvidenceContractVersion": "FP-MCP-059",
  "approvalValidationEvaluated": true,
  "approvalEvidenceValid": false,
  "approvalValid": false,
  "approvalUsableForExecution": false,
  "approvalCreated": false,
  "approvalMutated": false,
  "humanApprovalRecorded": false,
  "executionAllowedNow": false,
  "executionStarted": false,
  "startEndpointContacted": false,
  "opencodeStarted": false,
  "reasons": [
    "APPROVAL_EVIDENCE_ARTIFACT_MISSING"
  ]
}
```

This is an expected safe result.

The validator must not create a placeholder artifact to make validation easier.

---

## Required Validation Categories

The validator must return booleans for the following categories:

```text
pathSafe
approvalIdFormatValid
artifactExists
jsonValid
approvalEvidenceSchemaValid
approvalEvidenceTypeValid
approvalStateValid
approvalKindValid
approvedActionValid
scopePresent
scopeExact
packetBindingValid
requestBindingValid
modelBindingValid
runModeBindingValid
baseCommitBindingValid
branchBindingValid
canonicalApprovalTextPresent
canonicalApprovalTextValid
preconditionsPresent
preconditionsValid
createdAtValid
expiresAtValid
approvalLifetimeValid
singleUseValid
notRevoked
notConsumed
notQuarantined
secretBoundaryValid
artifactCommitted
```

The validator may also keep older FP-MCP-041 names for backward compatibility:

```text
schemaVersionValid
artifactTypeValid
approvalIdValid
scopeMatchesExpected
approvalTextPresent
expirationValid
commitBindingValid
```

However, FP-MCP-059-aligned names must be present or clearly derivable in the output.

---

## Required Approval Evidence Type

A valid FP-MCP-059 approval artifact must identify itself as human approval evidence.

Recommended accepted values:

```text
artifactType: HUMAN_APPROVAL_EVIDENCE
approvalKind: EXECUTION_ENABLEMENT
approvedAction: ALLOW_ONE_GUARDED_REMOTE_RUNNER_EXECUTION_ATTEMPT
```

Broad approvals must remain invalid.

Forbidden broad actions include:

```text
ALLOW_ALL_EXECUTION
ALLOW_ANY_COMMAND
ALLOW_UNSCOPED_RUNNER_EXECUTION
ALLOW_REPEATED_EXECUTION
ALLOW_AUTONOMOUS_EXECUTION
ALLOW_EVIDENCE_ADMISSION
```

---

## Required Approval Scope

A valid approval evidence artifact must be scoped exactly to:

```text
packetId
requestId
modelId
runMode
baseCommitSha or repoCommit
```

Branch may also be required if the existing validator already requires it.

The validator must fail if any scope value is:

```text
missing
empty
different from expected
broader than expected
wildcarded
symbolic
```

Forbidden symbolic values include:

```text
*
ANY
ALL
latest
current
HEAD
main
origin/main
```

`main` may be valid only as the explicit branch field.

It must not be valid as a commit binding.

---

## Required Approval Text Alignment

FP-MCP-059 requires explicit human approval evidence.

The validator must require a canonical approval statement or a strict equivalent.

Canonical approval meaning:

```text
I approve one guarded ForgePilot remote runner execution attempt for the scoped packet, request, model, run mode, commit, and branch named in this approval evidence record.
```

The validator does not need semantic AI interpretation.

It may require exact text or required key phrases.

Missing, vague, broad, or implied approval text must fail validation.

---

## Required Expiration Alignment

FP-MCP-041 allowed a maximum approval lifetime of 1 hour.

FP-MCP-059 narrows this to a shorter execution-safety window.

FP-MCP-061 must align with FP-MCP-059 by enforcing:

```text
createdAt present and parseable
expiresAt present and parseable
expiresAt after createdAt
expiresAt not in the past
approval lifetime no longer than 30 minutes
```

A future packet may make this even shorter.

---

## Required Single-Use / Revocation / Quarantine Alignment

A usable approval evidence artifact must satisfy:

```text
singleUse: true
consumedAt: null
revokedAt: null
quarantinedAt: null if field exists
approvalState: RECORDED
```

Any consumed, revoked, expired, invalid, draft, or quarantined approval must be invalid or unusable.

Allowed states:

```text
DRAFT
RECORDED
REVOKED
EXPIRED
CONSUMED
QUARANTINED
INVALID
```

Only `RECORDED` may be usable for execution.

---

## Required Secret Boundary

The validator must reject approval evidence artifacts containing obvious secret material.

Required backstop patterns include:

```text
OPENAI_API_KEY
ANTHROPIC_API_KEY
GITHUB_TOKEN
AUTH0_CLIENT_SECRET
BEGIN PRIVATE KEY
password=
api_key=
access_token
refresh_token
```

This check is not a complete secret scanner.

It is a required safety backstop.

---

## Required Committed Artifact Rule

Human approval evidence must be committed before it can ever be usable.

If committed-state verification is not feasible, the validator must fail closed:

```text
artifactCommitted: false
approvalUsableForExecution: false
reason: APPROVAL_EVIDENCE_COMMITTED_STATE_NOT_VERIFIED
```

An uncommitted approval evidence artifact must never be usable for execution.

---

## Required Failure Reason Codes

FP-MCP-061 should support FP-MCP-059-aligned reason codes:

```text
APPROVAL_EVIDENCE_ARTIFACT_MISSING
APPROVAL_EVIDENCE_PATH_UNSAFE
APPROVAL_EVIDENCE_JSON_INVALID
APPROVAL_EVIDENCE_SCHEMA_INVALID
APPROVAL_EVIDENCE_TYPE_INVALID
APPROVAL_ID_INVALID
APPROVAL_STATE_INVALID
APPROVAL_STATE_NOT_RECORDED
APPROVAL_KIND_INVALID
APPROVED_ACTION_INVALID
APPROVAL_SCOPE_MISSING
APPROVAL_SCOPE_MISMATCH
APPROVAL_SCOPE_TOO_BROAD
APPROVAL_TEXT_MISSING
APPROVAL_TEXT_INVALID
APPROVAL_PRECONDITIONS_MISSING
APPROVAL_PRECONDITIONS_INVALID
APPROVAL_CREATED_AT_INVALID
APPROVAL_EXPIRES_AT_INVALID
APPROVAL_EXPIRED
APPROVAL_LIFETIME_TOO_LONG
APPROVAL_SINGLE_USE_INVALID
APPROVAL_REVOKED
APPROVAL_CONSUMED
APPROVAL_QUARANTINED
APPROVAL_BASE_COMMIT_BINDING_INVALID
APPROVAL_REQUEST_BINDING_INVALID
APPROVAL_MODEL_BINDING_INVALID
APPROVAL_RUN_MODE_BINDING_INVALID
APPROVAL_BRANCH_BINDING_INVALID
APPROVAL_SECRET_BOUNDARY_VIOLATION
APPROVAL_EVIDENCE_COMMITTED_STATE_NOT_VERIFIED
APPROVAL_EVIDENCE_ARTIFACT_UNCOMMITTED
```

Backward-compatible FP-MCP-041 reason codes may remain, but the FP-MCP-059-aligned reason must be present when applicable.

---

## Required Safety Output

Every validator result must include safety flags:

```text
approvalCreated: false
approvalMutated: false
humanApprovalRecorded: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

These are not optional.

A validation tool must never imply that validation created approval evidence.

---

## Verification Requirements

Verification must include:

1. Confirm ForgePilot repo is clean before packet execution.
2. Confirm FP-MCP-061 packet exists.
3. Apply bridge patch if implementation is required.
4. Run MCP bridge build with `pnpm run build`.
5. Restart the MCP bridge service if bridge code changed.
6. Refresh actions if needed.
7. Invoke `forgepilot_validate_human_approval_record` against a missing approval evidence artifact.
8. Confirm the validator reports FP-MCP-061 hardening or FP-MCP-059 contract alignment.
9. Confirm missing approval evidence returns structured invalid result.
10. Confirm `approvalCreated: false`.
11. Confirm `approvalMutated: false`.
12. Confirm `humanApprovalRecorded: false`.
13. Confirm `approvalUsableForExecution: false`.
14. Confirm `executionAllowedNow: false`.
15. Confirm runner execution remains disabled.
16. Confirm OpenCode execution remains disabled.
17. Confirm no start endpoint was contacted.
18. Confirm OpenCode was not started.
19. Confirm no approval evidence artifact was created as a side effect.
20. Record verification artifacts.

---

## Expected Files

Likely MCP bridge changes:

```text
src/server.ts
```

Expected ForgePilot artifacts:

```text
packets/FP-MCP-061.md
runs/FP-MCP-061/executor-result.md
runs/FP-MCP-061/verification.txt
```

No approval evidence artifact should be created.

---

## Acceptance Criteria

FP-MCP-061 is accepted if:

```text
existing approval validator remains read-only
validator output references FP-MCP-059 approval evidence contract
validator boundary/hardening version is clear
missing approval evidence fails closed
approval evidence is not created
approval evidence is not mutated
humanApprovalRecorded remains false
approvalUsableForExecution remains false for missing evidence
executionAllowedNow remains false
runner execution remains disabled
OpenCode execution remains disabled
startEndpointContacted remains false
opencodeStarted remains false
contract mismatch from FP-MCP-060 is reduced or explicitly classified
verification artifacts are committed
repo is clean
```

---

## Failure Conditions

FP-MCP-061 fails if:

```text
approval evidence is created by validator
approval evidence is mutated by validator
humanApprovalRecorded becomes true
approvalUsableForExecution becomes true for missing evidence
executionAllowedNow becomes true
executionStarted becomes true
startEndpointContacted becomes true
OpenCode starts
OpenCode CLI is invoked
OpenCode API is invoked
runner execution is enabled
shell executes through runner
approval evidence is treated as valid without committed artifact evidence
broad approval scope is accepted
symbolic commit binding is accepted
approval lifetime longer than FP-MCP-059 limit is accepted
secrets are written to artifacts
runner is publicly exposed
```

---

## Expected Result

Current expected successful result after hardening:

```text
PASS_WITH_NO_EXECUTION
```

with missing approval evidence returning:

```text
approvalValidationEvaluated: true
approvalEvidenceValid: false
approvalUsableForExecution: false
approvalCreated: false
approvalMutated: false
humanApprovalRecorded: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
reasons:
- APPROVAL_EVIDENCE_ARTIFACT_MISSING
```

---

## Follow-Up

After FP-MCP-061, the safest next packet is:

```text
FP-MCP-062 — Human Approval Evidence Dry-Run Recorder
```

That packet should create non-executing, contract-shaped approval evidence dry-run artifacts without enabling execution or contacting the runner start endpoint.
