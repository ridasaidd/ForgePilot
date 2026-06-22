# FP-MCP-040 — Human Approval Record Contract

## Task

Define the contract for future scoped human approval records required before ForgePilot execution may ever be enabled.

## Goal

Create a non-executing, documentation-only contract for recording human approval.

FP-MCP-040 answers one question:

**What must a human approval record contain before it can satisfy the human-approval gate in the execution enablement policy?**

This packet must not create a real approval.

This packet must not enable execution.

The expected current result is:

```text
humanApprovalRecordContractDefined: true
humanApprovalRecorded: false
executionAllowedNow: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
executionStarted: false
```

This is a successful result.

---

## Background

FP-MCP-038 defined the execution enablement policy contract.

FP-MCP-039 implemented a read-only execution enablement status tool.

Current status correctly reports:

```text
executionAllowedNow: false
humanApprovalRecorded: false
runnerExecutionCapabilityPresent: false
opencodeBoundarySatisfied: false
secretBoundarySatisfied: false
networkBoundarySatisfied: false
```

FP-MCP-040 defines the future approval record contract.

It does not record approval.

It does not satisfy the approval gate.

It defines what would be required for a future approval artifact to be considered valid.

---

## Scope Boundary

FP-MCP-040 may:

* define the human approval record schema
* define approval artifact path rules
* define required approval fields
* define approval scope
* define approval lifecycle
* define approval invalidation conditions
* define approval non-reuse rules
* define approval audit requirements
* define approval safety language
* define allowed and forbidden approval states
* add documentation under `docs/`
* record verification artifacts

FP-MCP-040 must not:

* create a real approval artifact
* mark any approval as recorded
* satisfy the FP-MCP-039 human approval gate
* enable runner execution
* set `FORGEPILOT_RUNNER_EXECUTION_ENABLED=true`
* change runner execution config
* call `/runner/start-run`
* call the guarded start MCP tool
* call the dry-run writer tool
* call an execution enablement tool
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

## Required Documentation

Add a document:

```text
docs/human-approval-record-contract.md
```

The document must clearly state:

```text
This document defines the approval record contract only.
It does not record approval.
It does not authorize execution.
It does not enable execution.
```

---

## Required Approval Artifact Path

Future approval records must be stored under:

```text
runs/<packetId>/approvals/<approvalId>.json
```

Example:

```text
runs/FP-MCP-041/approvals/APPROVAL-20260622T000000000Z-abcdef12.json
```

The path must be:

```text
repository-relative
normalized
under runs/<packetId>/approvals/
free of path traversal
free of absolute paths
committed before use
```

Approval artifacts must not be stored in:

```text
packets/
docs/
metrics/
repository root
temporary directories
untracked files
```

---

## Required Approval ID Format

Approval IDs must be stable and unique.

Required format:

```text
APPROVAL-<UTC timestamp>-<short random suffix>
```

Example:

```text
APPROVAL-20260622T000000000Z-abcdef12
```

The timestamp must be UTC.

The suffix must prevent accidental collision.

---

## Required Approval Schema

A future approval record must include:

```json
{
  "schemaVersion": "FP-MCP-040",
  "artifactType": "human-approval-record",
  "approvalId": "APPROVAL-20260622T000000000Z-abcdef12",
  "approvalState": "RECORDED",
  "approvalKind": "EXECUTION_ENABLEMENT",
  "createdAt": "2026-06-22T00:00:00.000Z",
  "createdBy": {
    "humanName": "rida said",
    "humanHandle": "@rida538"
  },
  "scope": {
    "packetId": "FP-MCP-041",
    "requestId": "REQ-...",
    "modelId": "qwen-3.7-max",
    "runMode": "DESIGN_ONLY",
    "repoCommit": "...",
    "branch": "main"
  },
  "approvedAction": "ALLOW_ONE_GUARDED_REMOTE_RUNNER_EXECUTION_ATTEMPT",
  "approvalText": "I approve one guarded ForgePilot remote runner execution attempt for the scoped packet, request, model, run mode, commit, and branch named in this record.",
  "preconditions": {
    "executionEnablementStatusEvaluated": true,
    "executionAllowedNowBeforeApproval": false,
    "contractComplete": true,
    "dryRunEvidencePresent": true,
    "dryRunVerified": true,
    "repoClean": true,
    "runnerExecutionCapabilityPresent": true,
    "opencodeBoundarySatisfied": true,
    "secretBoundarySatisfied": true,
    "networkBoundarySatisfied": true,
    "disablePathDefined": true,
    "auditAdmissionPathDefined": true
  },
  "singleUse": true,
  "expiresAt": "2026-06-22T01:00:00.000Z",
  "revokedAt": null,
  "consumedAt": null,
  "reasons": []
}
```

Additional non-secret observations may be included.

---

## Required Approval States

Allowed approval states:

```text
DRAFT
RECORDED
REVOKED
EXPIRED
CONSUMED
INVALID
```

State meanings:

```text
DRAFT     — approval text or scope is being prepared; not usable
RECORDED  — approval is recorded but not yet consumed
REVOKED   — approval was explicitly revoked before use
EXPIRED   — approval passed its expiration time
CONSUMED  — approval was used for exactly one scoped attempt
INVALID   — approval failed schema, scope, provenance, or safety checks
```

Only `RECORDED` may satisfy the approval gate.

Even `RECORDED` is not sufficient by itself.

All other execution enablement gates must still pass.

---

## Required Approval Kind

Allowed approval kind for future execution enablement:

```text
EXECUTION_ENABLEMENT
```

Future approval kinds may be defined in later packets, but unknown kinds must not satisfy execution approval.

---

## Required Approved Action

The only initially allowed approved action is:

```text
ALLOW_ONE_GUARDED_REMOTE_RUNNER_EXECUTION_ATTEMPT
```

This means:

```text
one attempt
guarded
remote runner
scoped to named packet
scoped to named request
scoped to named model
scoped to named run mode
scoped to named commit
```

It does not approve:

```text
unbounded execution
repeated execution
arbitrary shell access
model-provider access outside the scoped request
execution from a different commit
execution from a dirty working tree
execution for a different packet
execution for a different request
execution for a different model
execution for a different run mode
automatic evidence admission
```

---

## Required Scope Fields

A valid approval must name all scope fields:

```text
packetId
requestId
modelId
runMode
repoCommit
branch
```

Approval is invalid if any scope field is missing.

Approval is invalid if any scope field does not match the execution attempt.

Approval must be narrower than or equal to the execution attempt.

Approval must never be broader than the execution attempt.

---

## Required Approval Text

A valid approval must contain explicit human-readable approval text.

Required meaning:

```text
I approve one guarded ForgePilot remote runner execution attempt for the scoped packet, request, model, run mode, commit, and branch named in this record.
```

The exact wording may vary only if the meaning remains unambiguous.

Approval text must not be empty.

Approval text must not be inferred from file existence.

Approval text must not be inferred from a commit message.

---

## Required Preconditions

A valid approval record must include observed preconditions.

At minimum:

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

The approval record must not pretend failed gates passed.

If a prerequisite gate is false, approval may be recorded as intent but must not satisfy execution enablement.

---

## Required Expiration

Approvals must expire.

Default maximum validity window:

```text
1 hour
```

A later packet may define a shorter window.

Approval is invalid if:

```text
expiresAt is missing
expiresAt is in the past
expiresAt is too far in the future
current time is after expiresAt
```

---

## Required Single-Use Rule

Approvals must be single-use.

A valid approval starts with:

```text
singleUse: true
consumedAt: null
```

After use, it must become:

```text
approvalState: CONSUMED
consumedAt: <timestamp>
```

A consumed approval must not authorize another attempt.

---

## Required Revocation Rule

Approvals may be revoked before use.

A revoked approval must have:

```text
approvalState: REVOKED
revokedAt: <timestamp>
```

A revoked approval must never satisfy execution enablement.

---

## Required Commit Binding

Approval must bind to a specific repository commit.

Required field:

```text
scope.repoCommit
```

Execution must not proceed if current commit differs from approved commit.

If new commits occur after approval, a new approval is required.

---

## Required Request Binding

Approval must bind to a specific request artifact.

Required fields:

```text
scope.packetId
scope.requestId
```

The request artifact must be:

```text
present
valid
committed
hashable
consistent with approval scope
```

Approval must not be reusable across request IDs.

---

## Required Model and Run Mode Binding

Approval must bind to:

```text
scope.modelId
scope.runMode
```

If either differs from the attempted execution, approval is invalid.

Approval for one model must not authorize another model.

Approval for one run mode must not authorize another run mode.

---

## Required Audit Requirements

Every approval record must be auditable.

Required audit properties:

```text
stable approvalId
createdAt
createdBy
scope
approvedAction
approvalText
preconditions
singleUse
expiration
state
commit binding
request binding
model binding
run-mode binding
```

The approval artifact must be committed before use.

Uncommitted approval records must not satisfy execution enablement.

---

## Required Secret Boundary

Approval records must not contain secrets.

Forbidden content:

```text
API keys
OAuth tokens
provider tokens
session tokens
private keys
passwords
.env content
raw environment dumps
```

If a secret is detected, approval must be invalid.

---

## Approval Is Not Execution

Recording approval must not itself:

```text
enable execution
start OpenCode
call /runner/start-run
call model providers
execute shell commands
create execution artifacts
admit evidence
```

Approval is one required gate.

It is not the whole enablement decision.

---

## Current Required Classification

After FP-MCP-040, current system must remain:

```text
humanApprovalRecordContractDefined: true
humanApprovalRecorded: false
executionAllowedNow: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
executionStarted: false
```

Required reasons:

```text
APPROVAL_CONTRACT_DEFINED_ONLY
HUMAN_APPROVAL_NOT_RECORDED
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
```

---

## Verification Requirements

Verification must include:

1. Confirmation that the packet is committed.
2. Confirmation that `docs/human-approval-record-contract.md` is committed.
3. Confirmation that no approval artifact was created.
4. Confirmation that human approval remains not recorded.
5. Confirmation that runner execution remains disabled.
6. Confirmation that OpenCode execution remains disabled.
7. Confirmation that execution enablement status still reports `executionAllowedNow: false`.
8. Confirmation that no start endpoint was contacted.
9. Confirmation that OpenCode was not started.
10. Confirmation that no execution artifacts were created.
11. Confirmation that no secrets were committed.
12. Verification artifacts committed.
13. Repository clean.

---

## Expected Files

Expected ForgePilot files:

```text
packets/FP-MCP-040.md
docs/human-approval-record-contract.md
runs/FP-MCP-040/executor-result.md
runs/FP-MCP-040/verification.txt
```

No MCP bridge changes are required for FP-MCP-040.

No runner changes are required for FP-MCP-040.

No approval artifact should be created.

---

## Acceptance Criteria

FP-MCP-040 is accepted if:

```text
packet is committed
human approval record contract document is committed
approval schema is defined
approval path rules are defined
approval states are defined
approval scope fields are defined
approval text requirements are defined
approval expiration rule is defined
approval single-use rule is defined
approval revocation rule is defined
approval commit binding is defined
approval request binding is defined
approval model/run-mode binding is defined
approval audit requirements are defined
approval secret boundary is defined
document states approval is not execution
no real approval artifact is created
humanApprovalRecorded remains false
executionAllowedNow remains false
runner execution remains disabled
OpenCode execution remains disabled
no execution attempted
verification artifacts are committed
repo is clean
```

---

## Failure Conditions

FP-MCP-040 fails if:

```text
a real approval artifact is created
humanApprovalRecorded becomes true
executionAllowedNow becomes true
runner execution is enabled
OpenCode execution is enabled
start-run endpoint is contacted
OpenCode starts
OpenCode CLI is invoked
OpenCode API is invoked
model providers are contacted
shell executes through runner
real execution artifacts are created
approval document implies approval equals execution
approval document allows unscoped approvals
approval document allows reusable approvals
approval document allows non-expiring approvals
approval document permits secrets in approval records
secrets are committed
runner is publicly exposed
```

---

## Expected Result

Current expected successful result:

```text
PASS
```

with:

```text
humanApprovalRecordContractDefined: true
humanApprovalRecorded: false
executionAllowedNow: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
executionStarted: false
reasons:
- APPROVAL_CONTRACT_DEFINED_ONLY
- HUMAN_APPROVAL_NOT_RECORDED
- RUNNER_EXECUTION_DISABLED
- OPENCODE_EXECUTION_DISABLED
```

---

## Follow-Up

After FP-MCP-040, ForgePilot can proceed to one of:

```text
FP-MCP-041 — Human Approval Record Validation Tool
FP-MCP-041 — Secret Boundary Verification Contract
FP-MCP-041 — Execution Disable Switch Contract
```

The safest next step is likely a validation tool for approval records that still does not create approvals or enable execution.
