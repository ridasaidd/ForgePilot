# Human Approval Record Contract

## Status

This document defines the human approval record contract only.

It does not record approval.

It does not authorize execution.

It does not enable execution.

It does not permit OpenCode invocation.

It does not permit runner shell execution.

Current required state remains:

```text
humanApprovalRecordContractDefined: true
humanApprovalRecorded: false
executionAllowedNow: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
executionStarted: false
```

## Purpose

ForgePilot execution enablement requires explicit scoped human approval.

This document defines what a future approval artifact must contain before it can satisfy the human-approval gate.

The contract is intentionally narrow.

A valid approval must approve exactly one guarded remote runner execution attempt for one specific packet, request, model, run mode, branch, and commit.

## Non-Approval Rule

This document is not approval.

The existence of this document is not approval.

A committed packet is not approval.

A clean repository is not approval.

A successful preflight is not approval.

A successful dry-run is not approval.

A successful dry-run verification is not approval.

A successful execution enablement status check is not approval.

Only a valid committed approval artifact may satisfy the human-approval gate, and only if all other enablement gates also pass.

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

Uncommitted approval records must not satisfy execution enablement.

## Approval ID Format

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

## Required Schema

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

## Approval States

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

Only `RECORDED` may satisfy the human-approval gate.

Even `RECORDED` is not sufficient by itself.

All other execution enablement gates must still pass.

## Approval Kind

Allowed approval kind for future execution enablement:

```text
EXECUTION_ENABLEMENT
```

Unknown approval kinds must not satisfy execution approval.

## Approved Action

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
scoped to named branch
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

## Required Scope

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

Approval text must not be inferred from prior chat context.

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

## Expiration Rule

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

## Single-Use Rule

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

Approval consumption must be auditable.

## Revocation Rule

Approvals may be revoked before use.

A revoked approval must have:

```text
approvalState: REVOKED
revokedAt: <timestamp>
```

A revoked approval must never satisfy execution enablement.

## Commit Binding

Approval must bind to a specific repository commit.

Required field:

```text
scope.repoCommit
```

Execution must not proceed if the current commit differs from the approved commit.

If new commits occur after approval, a new approval is required.

## Request Binding

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

## Model and Run Mode Binding

Approval must bind to:

```text
scope.modelId
scope.runMode
```

If either differs from the attempted execution, approval is invalid.

Approval for one model must not authorize another model.

Approval for one run mode must not authorize another run mode.

## Audit Requirements

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

## Secret Boundary

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

Approval must not be used as a place to transport credentials.

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

## Approval Validation Requirements

A future approval validation tool must verify:

```text
path safety
approval ID format
schema version
artifact type
approval state
approval kind
approved action
required scope fields
approval text
preconditions
expiration
single-use status
revocation status
commit binding
request binding
model binding
run-mode binding
secret boundary
artifact committed status
```

Validation must fail closed.

Unknown fields may be allowed only if they are non-secret observations and do not broaden scope.

## Invalid Approval Conditions

An approval must be invalid if:

```text
approval artifact is uncommitted
approval path is outside runs/<packetId>/approvals/
approvalState is not RECORDED
approvalKind is unknown
approvedAction is unknown
approval text is missing
scope is missing
scope is broader than attempted execution
request id does not match
packet id does not match
model id does not match
run mode does not match
commit does not match
branch does not match
expiresAt is missing
approval is expired
approval is revoked
approval is consumed
singleUse is false
secrets are present
```

## Current Required Classification

After this contract exists, current system remains:

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

## Summary

This document defines the future approval record contract.

It does not record approval.

It does not authorize execution.

It does not enable execution.

It does not permit OpenCode invocation.

Current correct state remains:

```text
humanApprovalRecorded: false
executionAllowedNow: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
executionStarted: false
```
