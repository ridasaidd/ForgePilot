# FP-MCP-042 — Human Approval Negative Fixture Tests

## Task

Create committed negative approval fixtures and verify that the FP-MCP-041 human approval validator rejects each fixture without creating a usable approval, satisfying the human approval gate, enabling execution, starting OpenCode, or contacting the runner start endpoint.

## Goal

Prove that ForgePilot rejects malformed, unsafe, stale, revoked, consumed, broad, mismatched, and secret-bearing approval records.

FP-MCP-042 answers one question:

**Can ForgePilot prove that invalid approval records fail closed across representative negative cases?**

The expected current result is:

```text
negativeApprovalFixturesCreated: true
negativeApprovalFixturesValidated: true
allNegativeFixturesRejected: true
usableApprovalCreated: false
humanApprovalRecorded: false
executionAllowedNow: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
executionStarted: false
```

This is a successful result.

---

## Background

FP-MCP-040 defined the human approval record contract.

FP-MCP-041 implemented a read-only approval validator.

The validator has already proven that a missing approval artifact returns:

```text
approvalValid: false
approvalUsableForExecution: false
approvalCreated: false
approvalMutated: false
humanApprovalRecorded: false
executionAllowedNow: false
reason:
- APPROVAL_ARTIFACT_MISSING
```

FP-MCP-042 extends the proof by adding negative fixtures.

These fixtures must be intentionally invalid.

They must never be usable for execution.

---

## Scope Boundary

FP-MCP-042 may:

* create committed negative approval fixture artifacts
* store fixtures under a clearly non-usable fixture directory
* invoke the FP-MCP-041 approval validator against each fixture if supported
* record validator outputs
* record expected rejection reasons
* record verification artifacts
* add helper documentation if needed

FP-MCP-042 must not:

* create a valid approval artifact
* create any usable approval
* mark human approval as recorded
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
* commit real secrets

---

## Fixture Location

Negative fixtures must be stored under:

```text
runs/FP-MCP-042/approval-negative-fixtures/
```

They must not be stored under:

```text
runs/<packetId>/approvals/
```

unless the fixture name and expected invalid result are unambiguous and the artifact is never intended as usable approval.

Recommended safer location:

```text
runs/FP-MCP-042/approval-negative-fixtures/<fixture-id>.json
```

The validator may need an optional `approvalPath` or fixture mode in a future packet to validate arbitrary fixture locations.

If the current FP-MCP-041 validator only supports `runs/<packetId>/approvals/<approvalId>.json`, FP-MCP-042 may either:

1. implement a safe fixture validation mode, or
2. copy fixtures into a clearly isolated FP-MCP-042 approval namespace while ensuring every fixture is invalid and not usable.

No valid approval may be created.

---

## Required Negative Fixtures

At minimum, create these fixtures:

```text
missing-required-fields.json
invalid-approval-state.json
expired-approval.json
revoked-approval.json
consumed-approval.json
scope-mismatch-request.json
scope-too-broad.json
wrong-model.json
wrong-run-mode.json
wrong-commit.json
secret-bearing-approval.json
```

Each fixture must be invalid.

Each fixture must include metadata identifying the expected failure reason.

No fixture may be valid for execution.

---

## Fixture 1 — Missing Required Fields

File:

```text
missing-required-fields.json
```

Expected rejection reason:

```text
APPROVAL_SCOPE_MISSING
```

Additional likely reasons:

```text
APPROVAL_TEXT_MISSING
APPROVAL_PRECONDITIONS_MISSING
APPROVAL_EXPIRATION_INVALID
```

---

## Fixture 2 — Invalid Approval State

File:

```text
invalid-approval-state.json
```

Use an unknown state:

```text
APPROVED
```

Expected rejection reason:

```text
APPROVAL_STATE_INVALID
```

Rationale:

```text
APPROVED is intentionally not an allowed state.
Only RECORDED may be potentially usable.
```

---

## Fixture 3 — Expired Approval

File:

```text
expired-approval.json
```

Use a past `expiresAt`.

Expected rejection reason:

```text
APPROVAL_EXPIRED
```

---

## Fixture 4 — Revoked Approval

File:

```text
revoked-approval.json
```

Use:

```text
approvalState: REVOKED
revokedAt: <timestamp>
```

Expected rejection reason:

```text
APPROVAL_REVOKED
```

---

## Fixture 5 — Consumed Approval

File:

```text
consumed-approval.json
```

Use:

```text
approvalState: CONSUMED
consumedAt: <timestamp>
```

Expected rejection reason:

```text
APPROVAL_CONSUMED
```

---

## Fixture 6 — Scope Mismatch: Request

File:

```text
scope-mismatch-request.json
```

Use a request id different from expected scope.

Expected rejection reason:

```text
APPROVAL_REQUEST_BINDING_INVALID
```

or:

```text
APPROVAL_SCOPE_MISMATCH
```

---

## Fixture 7 — Scope Too Broad

File:

```text
scope-too-broad.json
```

Use broad scope values such as:

```text
requestId: "*"
repoCommit: "HEAD"
```

Expected rejection reason:

```text
APPROVAL_SCOPE_TOO_BROAD
```

or:

```text
APPROVAL_COMMIT_BINDING_INVALID
```

---

## Fixture 8 — Wrong Model

File:

```text
wrong-model.json
```

Use a model id different from expected scope.

Expected rejection reason:

```text
APPROVAL_MODEL_BINDING_INVALID
```

---

## Fixture 9 — Wrong Run Mode

File:

```text
wrong-run-mode.json
```

Use a run mode different from expected scope.

Expected rejection reason:

```text
APPROVAL_RUN_MODE_BINDING_INVALID
```

---

## Fixture 10 — Wrong Commit

File:

```text
wrong-commit.json
```

Use a concrete commit different from expected scope.

Expected rejection reason:

```text
APPROVAL_COMMIT_BINDING_INVALID
```

---

## Fixture 11 — Secret-Bearing Approval

File:

```text
secret-bearing-approval.json
```

Use a fake obvious secret marker only.

Do not commit real secrets.

Example fake marker:

```text
OPENAI_API_KEY=fake-test-secret-not-real
```

Expected rejection reason:

```text
APPROVAL_SECRET_BOUNDARY_VIOLATION
```

The fixture must clearly state the secret is fake test content.

---

## Required Fixture Metadata

Each fixture must include:

```json
{
  "fixture": true,
  "fixturePacketId": "FP-MCP-042",
  "expectedValid": false,
  "expectedUsableForExecution": false,
  "expectedReasons": []
}
```

This metadata must not make the fixture valid.

The validator may ignore fixture metadata.

Verification artifacts must record the expected result.

---

## Expected Scope For Validation

Use one expected scope consistently:

```json
{
  "packetId": "FP-MCP-042",
  "requestId": "REQ-FP-MCP-042-NEGATIVE-FIXTURE",
  "modelId": "qwen-3.7-max",
  "runMode": "DESIGN_ONLY",
  "repoCommit": "<FP-MCP-042 fixture commit>",
  "branch": "main"
}
```

If the validator requires concrete request IDs matching the standard request format, use a valid-looking committed request artifact or a fixture-specific request id defined in the packet.

No real execution request should be created unless necessary for validator scope matching, and if created it must remain non-executing.

---

## Required Validation Result

For each fixture, validation must return:

```text
approvalValidationEvaluated: true
approvalValid: false
approvalUsableForExecution: false
approvalCreated: false
approvalMutated: false
humanApprovalRecorded: false
executionAllowedNow: false
executionStarted: false
```

At least one expected rejection reason must be present.

---

## Required Aggregate Result

Record an aggregate result:

```json
{
  "schemaVersion": "FP-MCP-042",
  "negativeApprovalFixturesCreated": true,
  "negativeApprovalFixturesValidated": true,
  "fixtureCount": 11,
  "allNegativeFixturesRejected": true,
  "usableApprovalCreated": false,
  "humanApprovalRecorded": false,
  "executionAllowedNow": false,
  "executionStarted": false,
  "startEndpointContacted": false,
  "opencodeStarted": false,
  "results": []
}
```

The aggregate result may be stored in:

```text
runs/FP-MCP-042/negative-fixture-validation-result.json
```

---

## Required Safety Result

The validation process must preserve:

```text
Approval artifact created: NO usable approval
Approval artifact mutated: NO
Human approval recorded: NO
OpenCode started: NO
OpenCode CLI invoked: NO
OpenCode API invoked: NO
Runner execution enabled: NO
Runner start endpoint contacted: NO
Shell executed through runner: NO
Real secrets committed: NO
Runner publicly exposed: NO
Execution artifacts created: NO
```

---

## Verification Requirements

Verification must include:

1. Confirmation that the packet is committed.
2. Confirmation that negative fixtures are committed.
3. Confirmation that no valid approval artifact was created.
4. Confirmation that every fixture returns `approvalValid: false`.
5. Confirmation that every fixture returns `approvalUsableForExecution: false`.
6. Confirmation that every fixture returns `approvalCreated: false`.
7. Confirmation that every fixture returns `approvalMutated: false`.
8. Confirmation that every fixture returns `humanApprovalRecorded: false`.
9. Confirmation that every fixture returns `executionAllowedNow: false`.
10. Confirmation that at least one expected reason is present per fixture.
11. Confirmation that runner execution remains disabled.
12. Confirmation that OpenCode execution remains disabled.
13. Confirmation that no start endpoint was contacted.
14. Confirmation that OpenCode was not started.
15. Confirmation that no real secrets were committed.
16. Verification artifacts committed.
17. Repository clean.

---

## Expected Files

Expected ForgePilot files:

```text
packets/FP-MCP-042.md
runs/FP-MCP-042/approval-negative-fixtures/missing-required-fields.json
runs/FP-MCP-042/approval-negative-fixtures/invalid-approval-state.json
runs/FP-MCP-042/approval-negative-fixtures/expired-approval.json
runs/FP-MCP-042/approval-negative-fixtures/revoked-approval.json
runs/FP-MCP-042/approval-negative-fixtures/consumed-approval.json
runs/FP-MCP-042/approval-negative-fixtures/scope-mismatch-request.json
runs/FP-MCP-042/approval-negative-fixtures/scope-too-broad.json
runs/FP-MCP-042/approval-negative-fixtures/wrong-model.json
runs/FP-MCP-042/approval-negative-fixtures/wrong-run-mode.json
runs/FP-MCP-042/approval-negative-fixtures/wrong-commit.json
runs/FP-MCP-042/approval-negative-fixtures/secret-bearing-approval.json
runs/FP-MCP-042/negative-fixture-validation-result.json
runs/FP-MCP-042/executor-result.md
runs/FP-MCP-042/verification.txt
```

MCP bridge changes may be required if the validator needs fixture-location support:

```text
src/server.ts
```

If no bridge changes are required, record that explicitly.

---

## Acceptance Criteria

FP-MCP-042 is accepted if:

```text
packet is committed
negative approval fixtures are committed
all fixtures are intentionally invalid
no fixture is usable for execution
validator rejects every fixture
aggregate validation result is committed
usableApprovalCreated remains false
humanApprovalRecorded remains false
executionAllowedNow remains false
runner execution remains disabled
OpenCode execution remains disabled
no execution attempted
no real secrets are committed
verification artifacts are committed
repo is clean
```

---

## Failure Conditions

FP-MCP-042 fails if:

```text
any fixture validates as approvalValid true
any fixture validates as approvalUsableForExecution true
any usable approval is created
humanApprovalRecorded becomes true
executionAllowedNow becomes true
executionStarted becomes true
OpenCode starts
OpenCode CLI is invoked
OpenCode API is invoked
runner execution is enabled
start-run endpoint is contacted
shell executes through runner
artifacts are mutated unexpectedly by validator
real secrets are committed
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
negativeApprovalFixturesCreated: true
negativeApprovalFixturesValidated: true
allNegativeFixturesRejected: true
usableApprovalCreated: false
humanApprovalRecorded: false
executionAllowedNow: false
executionStarted: false
```

---

## Follow-Up

After FP-MCP-042, ForgePilot can proceed to one of:

```text
FP-MCP-043 — Secret Boundary Verification Contract
FP-MCP-043 — Execution Disable Switch Contract
FP-MCP-043 — Approval Fixture Validator Path Support
```

The safest next step depends on whether FP-MCP-042 requires a validator fixture-path extension.
