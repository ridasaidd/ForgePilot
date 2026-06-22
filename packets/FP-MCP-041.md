# FP-MCP-041 — Human Approval Record Validation Tool

## Task

Implement a read-only ForgePilot MCP tool that validates human approval record artifacts against the FP-MCP-040 contract.

## Goal

Prove that ForgePilot can classify future human approval records as valid or invalid without creating approvals, satisfying the approval gate, enabling execution, starting OpenCode, or contacting the runner start endpoint.

FP-MCP-041 answers one question:

**Can ForgePilot validate a human approval record artifact safely and fail closed when approval is missing, malformed, uncommitted, expired, revoked, consumed, unscoped, mismatched, or secret-bearing?**

The expected current result is:

```text
approvalValidationToolDefined: true
approvalCreated: false
humanApprovalRecorded: false
approvalValidForExecution: false
executionAllowedNow: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
executionStarted: false
```

This is a successful result.

---

## Background

FP-MCP-040 defined the human approval record contract.

The contract states that future approval records must be:

```text
scoped
committed
single-use
non-expired
non-revoked
non-consumed
secret-free
bound to packet id
bound to request id
bound to model id
bound to run mode
bound to repository commit
bound to branch
explicitly human-readable
```

FP-MCP-041 adds a validator.

The validator must not create approvals.

The validator must not mark approval as recorded.

The validator must not satisfy the execution enablement gate.

The validator only classifies an approval artifact.

---

## Scope Boundary

FP-MCP-041 may:

* add a read-only MCP validation tool
* read approval artifacts under `runs/<packetId>/approvals/`
* validate approval path safety
* validate approval JSON schema
* validate approval id format
* validate approval state
* validate approval kind
* validate approved action
* validate required scope fields
* validate approval text
* validate preconditions
* validate expiration
* validate single-use status
* validate revocation status
* validate consumed status
* validate commit binding
* validate request binding
* validate model binding
* validate run-mode binding
* validate branch binding
* validate secret boundary
* validate committed artifact state if possible
* return structured validation output
* add TypeScript helpers if needed
* add output schemas if needed
* record verification artifacts

FP-MCP-041 must not:

* create a real approval artifact
* mutate an approval artifact
* mark any approval as recorded
* mark any approval as consumed
* mark any approval as revoked
* satisfy the FP-MCP-039 human approval gate
* enable runner execution
* set `FORGEPILOT_RUNNER_EXECUTION_ENABLED=true`
* change runner execution config
* call `/runner/start-run`
* call the guarded start MCP tool
* call the dry-run writer tool
* call an execution enablement tool as an authorization path
* start OpenCode
* invoke OpenCode CLI
* invoke OpenCode API
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

## Required Tool

Add a new MCP tool:

```text
forgepilot_validate_human_approval_record
```

Recommended input:

```json
{
  "packetId": "FP-MCP-041",
  "approvalId": "APPROVAL-20260622T000000000Z-abcdef12",
  "expectedScope": {
    "packetId": "FP-MCP-041",
    "requestId": "REQ-...",
    "modelId": "qwen-3.7-max",
    "runMode": "DESIGN_ONLY",
    "repoCommit": "...",
    "branch": "main"
  }
}
```

The tool must be read-only.

It must not write files.

It must not create a placeholder approval if one is missing.

Missing approval must return a structured invalid result.

---

## Tool Annotations

Recommended annotations:

```text
readOnlyHint: true
destructiveHint: false
idempotentHint: true
openWorldHint: false
```

The validator should not need network access.

It should verify repository-local artifacts only.

---

## Required Approval Artifact Path

The validator must look for approval artifacts under:

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

If the path is unsafe, validation must fail.

---

## Missing Approval Behavior

If the approval artifact does not exist, the tool must return:

```json
{
  "schemaVersion": "FP-MCP-041",
  "approvalValidationEvaluated": true,
  "approvalValid": false,
  "approvalUsableForExecution": false,
  "approvalCreated": false,
  "approvalMutated": false,
  "humanApprovalRecorded": false,
  "executionAllowedNow": false,
  "executionStarted": false,
  "reason": "APPROVAL_ARTIFACT_MISSING"
}
```

This is an expected safe validation result for current state.

---

## Required Validation Categories

The tool must return booleans for these categories:

```text
pathSafe
artifactExists
jsonValid
schemaVersionValid
artifactTypeValid
approvalIdValid
approvalStateValid
approvalKindValid
approvedActionValid
scopePresent
scopeMatchesExpected
approvalTextPresent
preconditionsPresent
expirationValid
singleUseValid
notRevoked
notConsumed
commitBindingValid
requestBindingValid
modelBindingValid
runModeBindingValid
branchBindingValid
secretBoundaryValid
artifactCommitted
```

Top-level `approvalValid` may only be true if all required categories pass.

Top-level `approvalUsableForExecution` may only be true if:

```text
approvalValid: true
approvalState: RECORDED
singleUse: true
revokedAt: null
consumedAt: null
current time before expiresAt
scope matches expected
artifact committed
secretBoundaryValid: true
```

For FP-MCP-041 current-state verification, `approvalUsableForExecution` should remain false.

---

## Required Approval State Rules

Allowed states:

```text
DRAFT
RECORDED
REVOKED
EXPIRED
CONSUMED
INVALID
```

Only `RECORDED` can be usable for execution.

The validator must classify:

```text
DRAFT     -> not usable
RECORDED  -> potentially usable if all other checks pass
REVOKED   -> not usable
EXPIRED   -> not usable
CONSUMED  -> not usable
INVALID   -> not usable
```

Unknown states must be invalid.

---

## Required Approval Kind Rule

Valid execution approval kind:

```text
EXECUTION_ENABLEMENT
```

Unknown approval kinds must be invalid.

---

## Required Approved Action Rule

Initially valid approved action:

```text
ALLOW_ONE_GUARDED_REMOTE_RUNNER_EXECUTION_ATTEMPT
```

Any broader action must be invalid.

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

## Required Scope Matching

The validator must compare artifact scope against expected scope.

Required fields:

```text
packetId
requestId
modelId
runMode
repoCommit
branch
```

Validation must fail if any field is:

```text
missing
empty
different from expected
broader than expected
wildcarded
```

Forbidden scope values include:

```text
*
ANY
ALL
latest
current
HEAD
```

`HEAD` is not allowed as an approval commit binding. The commit must be a concrete hash.

---

## Required Approval Text Rule

Approval text must be present and explicit.

Required semantic meaning:

```text
I approve one guarded ForgePilot remote runner execution attempt for the scoped packet, request, model, run mode, commit, and branch named in this record.
```

Validator does not need semantic AI interpretation.

It may require presence of key phrases such as:

```text
one guarded ForgePilot remote runner execution attempt
scoped packet
request
model
run mode
commit
branch
```

If approval text is empty or missing, validation fails.

---

## Required Preconditions Rule

A valid approval must include preconditions:

```text
executionEnablementStatusEvaluated
executionAllowedNowBeforeApproval
contractComplete
dryRunEvidencePresent
dryRunVerified
repoClean
runnerExecutionCapabilityPresent
opencodeBoundarySatisfied
secretBoundarySatisfied
networkBoundarySatisfied
disablePathDefined
auditAdmissionPathDefined
```

The validator must fail if preconditions are missing.

The validator must not convert failed preconditions into passed preconditions.

---

## Required Expiration Rule

Approval must have `expiresAt`.

Approval is invalid if:

```text
expiresAt is missing
expiresAt cannot be parsed
expiresAt is in the past
expiresAt is too far in the future
```

Default maximum future validity:

```text
1 hour after createdAt
```

A future packet may define a shorter limit.

---

## Required Single-Use Rule

A valid approval must have:

```text
singleUse: true
consumedAt: null
```

If `singleUse` is false, validation fails.

If `consumedAt` is not null, approval is not usable.

---

## Required Revocation Rule

A valid usable approval must have:

```text
revokedAt: null
```

If `revokedAt` is not null, approval is not usable.

If `approvalState` is `REVOKED`, approval is not usable.

---

## Required Commit Binding Rule

The approval scope must include:

```text
repoCommit
```

It must match expected scope.

It must be a concrete commit reference.

It must not be:

```text
HEAD
main
origin/main
latest
current
*
ANY
ALL
```

A later implementation may require full 40-character SHA, but FP-MCP-041 may accept short hashes if they match expected input exactly.

---

## Required Request Binding Rule

The approval scope must include:

```text
packetId
requestId
```

Both must match expected scope exactly.

The approval must not authorize a different request.

---

## Required Model and Run Mode Binding Rule

The approval scope must include:

```text
modelId
runMode
```

Both must match expected scope exactly.

Approval for one model must not authorize another model.

Approval for one run mode must not authorize another run mode.

---

## Required Secret Boundary Rule

The approval artifact must not contain obvious secret material.

The validator must reject approval artifacts containing patterns such as:

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

If feasible, the validator must verify the approval artifact is committed.

An uncommitted approval artifact must not be usable.

If committed-state verification is not feasible in the first implementation, the tool must return:

```text
artifactCommitted: false
approvalUsableForExecution: false
```

and include reason:

```text
APPROVAL_COMMITTED_STATE_NOT_VERIFIED
```

Fail closed.

---

## Required Tool Output

For a valid-looking but missing current approval, expected output is:

```json
{
  "schemaVersion": "FP-MCP-041",
  "approvalValidationEvaluated": true,
  "approvalValid": false,
  "approvalUsableForExecution": false,
  "approvalCreated": false,
  "approvalMutated": false,
  "humanApprovalRecorded": false,
  "executionAllowedNow": false,
  "executionStarted": false,
  "startEndpointContacted": false,
  "opencodeStarted": false,
  "packetId": "FP-MCP-041",
  "approvalId": "APPROVAL-...",
  "approvalPath": "runs/FP-MCP-041/approvals/APPROVAL-....json",
  "checks": {
    "pathSafe": true,
    "artifactExists": false,
    "jsonValid": false,
    "schemaVersionValid": false,
    "artifactTypeValid": false,
    "approvalIdValid": true,
    "approvalStateValid": false,
    "approvalKindValid": false,
    "approvedActionValid": false,
    "scopePresent": false,
    "scopeMatchesExpected": false,
    "approvalTextPresent": false,
    "preconditionsPresent": false,
    "expirationValid": false,
    "singleUseValid": false,
    "notRevoked": false,
    "notConsumed": false,
    "commitBindingValid": false,
    "requestBindingValid": false,
    "modelBindingValid": false,
    "runModeBindingValid": false,
    "branchBindingValid": false,
    "secretBoundaryValid": true,
    "artifactCommitted": false
  },
  "reasons": [
    "APPROVAL_ARTIFACT_MISSING"
  ]
}
```

---

## Required Failure Reason Codes

Required reason codes include:

```text
APPROVAL_ARTIFACT_MISSING
APPROVAL_PATH_UNSAFE
APPROVAL_JSON_INVALID
APPROVAL_SCHEMA_VERSION_INVALID
APPROVAL_ARTIFACT_TYPE_INVALID
APPROVAL_ID_INVALID
APPROVAL_STATE_INVALID
APPROVAL_STATE_NOT_RECORDED
APPROVAL_KIND_INVALID
APPROVED_ACTION_INVALID
APPROVAL_SCOPE_MISSING
APPROVAL_SCOPE_MISMATCH
APPROVAL_SCOPE_TOO_BROAD
APPROVAL_TEXT_MISSING
APPROVAL_PRECONDITIONS_MISSING
APPROVAL_EXPIRED
APPROVAL_EXPIRATION_INVALID
APPROVAL_SINGLE_USE_INVALID
APPROVAL_REVOKED
APPROVAL_CONSUMED
APPROVAL_COMMIT_BINDING_INVALID
APPROVAL_REQUEST_BINDING_INVALID
APPROVAL_MODEL_BINDING_INVALID
APPROVAL_RUN_MODE_BINDING_INVALID
APPROVAL_BRANCH_BINDING_INVALID
APPROVAL_SECRET_BOUNDARY_VIOLATION
APPROVAL_COMMITTED_STATE_NOT_VERIFIED
APPROVAL_ARTIFACT_UNCOMMITTED
```

---

## Safety Requirements

The implementation must preserve:

```text
Approval artifact created: NO
Approval artifact mutated: NO
Human approval recorded: NO
OpenCode started: NO
OpenCode CLI invoked: NO
OpenCode API invoked: NO
Runner execution enabled: NO
Runner start endpoint contacted: NO
Shell executed through runner: NO
Secrets committed: NO
Runner publicly exposed: NO
Execution artifacts created: NO
```

---

## Verification Requirements

Verification must include:

1. Build/typecheck of the MCP bridge.
2. Service restart.
3. Action refresh if needed.
4. Invocation of the validator against a missing approval artifact.
5. Confirmation that missing approval returns structured invalid result.
6. Confirmation that `approvalCreated: false`.
7. Confirmation that `approvalMutated: false`.
8. Confirmation that `humanApprovalRecorded: false`.
9. Confirmation that `approvalUsableForExecution: false`.
10. Confirmation that `executionAllowedNow: false`.
11. Confirmation that runner execution remains disabled.
12. Confirmation that OpenCode execution remains disabled.
13. Confirmation that no start endpoint was contacted.
14. Confirmation that OpenCode was not started.
15. Confirmation that no approval artifact was created as a side effect.
16. Verification artifacts committed.

---

## Expected Files

Likely MCP bridge changes:

```text
src/server.ts
```

Expected ForgePilot verification artifacts:

```text
packets/FP-MCP-041.md
runs/FP-MCP-041/executor-result.md
runs/FP-MCP-041/verification.txt
```

No approval artifact should be created.

---

## Acceptance Criteria

FP-MCP-041 is accepted if:

```text
new approval validation MCP tool exists
tool is read-only
tool does not create approval artifacts
tool does not mutate approval artifacts
tool validates path safety
tool validates missing artifact as invalid
tool returns approvalCreated false
tool returns approvalMutated false
tool returns humanApprovalRecorded false
tool returns approvalUsableForExecution false for missing approval
tool returns executionAllowedNow false
tool does not call start-run
tool does not call dry-run writer
tool does not start OpenCode
runner execution remains disabled
OpenCode execution remains disabled
verification artifacts are committed
repo is clean
```

---

## Failure Conditions

FP-MCP-041 fails if:

```text
approval artifact is created
approval artifact is mutated
humanApprovalRecorded becomes true
approvalUsableForExecution becomes true for missing approval
executionAllowedNow becomes true
executionStarted becomes true
OpenCode starts
OpenCode CLI is invoked
OpenCode API is invoked
runner execution is enabled
start-run endpoint is contacted
dry-run writer tool is invoked
shell executes through runner
artifacts are mutated by validator
secrets are written to artifacts
runner is publicly exposed
```

---

## Expected Result

Current expected successful result:

```text
PASS
```

with a missing approval probe returning:

```text
approvalValidationEvaluated: true
approvalValid: false
approvalUsableForExecution: false
approvalCreated: false
approvalMutated: false
humanApprovalRecorded: false
executionAllowedNow: false
executionStarted: false
reasons:
- APPROVAL_ARTIFACT_MISSING
```

---

## Follow-Up

After FP-MCP-041, ForgePilot can proceed to one of:

```text
FP-MCP-042 — Human Approval Negative Fixture Tests
FP-MCP-042 — Secret Boundary Verification Contract
FP-MCP-042 — Execution Disable Switch Contract
```

The safest next step is likely negative fixture tests for invalid approval records.
