# FP-MCP-062 — Human Approval Evidence Negative Fixture Revalidation

## Status

DRAFT

## Type

MCP bridge safety / human approval evidence validation

## Task

Revalidate negative human approval evidence fixtures against the hardened FP-MCP-061 approval validator and the FP-MCP-059 human approval evidence contract.

This packet must not create usable approval evidence.

This packet must not add a human approval recorder.

This packet must not satisfy the human approval gate.

---

## Goal

Prove that the FP-MCP-061 validator still fails closed when presented with invalid, stale, broad, mismatched, revoked, consumed, malformed, or secret-bearing human approval evidence.

FP-MCP-062 answers one question:

**Does the hardened FP-MCP-061 approval evidence validator reject representative invalid human approval evidence under the FP-MCP-059 contract without creating approval, enabling execution, contacting the runner start endpoint, or starting OpenCode?**

The expected result is:

```text
negativeApprovalEvidenceFixturesCreated: true
negativeApprovalEvidenceFixturesValidated: true
allNegativeApprovalEvidenceFixturesRejected: true
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

FP-MCP-040 defined the older human approval record contract.

FP-MCP-041 implemented the older human approval record validator.

FP-MCP-042 tested negative approval-record fixtures against the older validator.

FP-MCP-059 defined the newer human approval evidence contract.

FP-MCP-060 aligned the older validator lineage with the newer approval-evidence model.

FP-MCP-061 hardened the validator so the live tool now reports:

```text
schemaVersion: FP-MCP-061
validatorBoundaryVersion: FP-MCP-061
approvalEvidenceContractVersion: FP-MCP-059
legacyApprovalRecordBoundaryRecognized: FP-MCP-041
```

FP-MCP-062 does not introduce a recorder.

FP-MCP-062 revalidates negative evidence behavior before any approval-evidence writer exists.

---

## Governing Principles

FP-MCP-062 is constrained by:

```text
P01 — ForgePilot records observations, not narratives.
P02 — Trust cannot be retroactively created.
P03 — ForgePilot does not optimize for favorable outcomes.
P04 — Only admitted evidence may influence observatory outputs.
P06 — Classification follows observation.
```

Human approval evidence is a high-trust boundary.

The first post-hardening proof must be rejection proof, not creation proof.

---

## Scope Boundary

FP-MCP-062 may:

* create intentionally invalid human approval evidence fixtures
* place fixtures in an isolated FP-MCP-062 namespace
* validate fixtures with the existing `forgepilot_validate_human_approval_record` tool
* record individual validation results
* record an aggregate negative-fixture validation result
* record verification artifacts
* add helper scripts or documentation if needed
* preserve compatibility with FP-MCP-041 reason codes where appropriate
* require FP-MCP-061 output fields where available

FP-MCP-062 must not:

* create valid human approval evidence
* create a real approval artifact
* create a human approval evidence recorder
* mark human approval as recorded
* mark approval evidence as usable for execution
* satisfy the human approval gate
* enable runner execution
* set `FORGEPILOT_RUNNER_EXECUTION_ENABLED=true`
* enable OpenCode execution
* change runner execution config
* call `/runner/start-run`
* call the guarded start MCP tool
* invoke OpenCode CLI
* invoke OpenCode API
* call model providers
* execute shell commands through the runner
* create a real `runnerRunId`
* create real execution artifacts
* mutate request artifacts
* mutate existing approval artifacts
* commit real secrets
* expose the private runner publicly
* weaken the disable switch
* weaken pre-start evidence or state snapshot gates

---

## Required Existing Tool

Use the existing validator:

```text
forgepilot_validate_human_approval_record
```

The tool must remain validation-only.

It must not create or mutate approval evidence.

It must not mark human approval as recorded.

It must not authorize execution.

---

## Fixture Location

Because the current validator resolves approval artifacts through:

```text
runs/<packetId>/approvals/<approvalId>.json
```

FP-MCP-062 may use the packet-local approval namespace:

```text
runs/FP-MCP-062/approvals/
```

Every artifact in that directory must be intentionally invalid.

No fixture may be valid or usable for execution.

No fixture may be named or documented as a real approval.

Each fixture must include explicit fixture metadata.

---

## Required Fixture Metadata

Each fixture must include non-authorizing metadata:

```json
{
  "fixture": true,
  "fixturePacketId": "FP-MCP-062",
  "fixturePurpose": "negative-human-approval-evidence-revalidation",
  "expectedValid": false,
  "expectedUsableForExecution": false,
  "expectedReasons": []
}
```

The validator may ignore fixture metadata.

Fixture metadata must not make the artifact valid.

---

## Required Expected Scope

Use a single expected scope for all fixture probes:

```json
{
  "packetId": "FP-MCP-036",
  "requestId": "REQ-20260622T144553300Z-fbbe8d82",
  "modelId": "qwen-3.7-max",
  "runMode": "DESIGN_ONLY",
  "repoCommit": "40b53dc",
  "branch": "main"
}
```

This scope is intentionally the same known request scope used in prior validation probes.

The fixture packet id remains `FP-MCP-062` because the fixtures live under:

```text
runs/FP-MCP-062/approvals/
```

The expected approval evidence scope may point at the existing request being tested.

No new execution request is required for FP-MCP-062.

---

## Required Negative Fixtures

Create at least these intentionally invalid fixtures:

```text
APPROVAL-20260622T230000000Z-00000001.json  missing required fields
APPROVAL-20260622T230000000Z-00000002.json  invalid approval state
APPROVAL-20260622T230000000Z-00000003.json  expired approval
APPROVAL-20260622T230000000Z-00000004.json  revoked approval
APPROVAL-20260622T230000000Z-00000005.json  consumed approval
APPROVAL-20260622T230000000Z-00000006.json  wrong request scope
APPROVAL-20260622T230000000Z-00000007.json  scope too broad
APPROVAL-20260622T230000000Z-00000008.json  wrong model
APPROVAL-20260622T230000000Z-00000009.json  wrong run mode
APPROVAL-20260622T230000000Z-0000000a.json  wrong commit
APPROVAL-20260622T230000000Z-0000000b.json  secret-boundary violation with fake test marker only
APPROVAL-20260622T230000000Z-0000000c.json  lifetime exceeds FP-MCP-059 limit
APPROVAL-20260622T230000000Z-0000000d.json  missing canonical approval text
APPROVAL-20260622T230000000Z-0000000e.json  quarantined approval evidence
```

The suffixes are valid lowercase hexadecimal strings.

The timestamps are fixed fixture identifiers, not claims about current approval time.

---

## Required Rejection Expectations

Every fixture must return:

```text
approvalValidationEvaluated: true
approvalEvidenceValid: false
approvalValid: false
approvalUsableForExecution: false
approvalCreated: false
approvalMutated: false
humanApprovalRecorded: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

Every fixture must include at least one rejection reason.

At least one fixture must exercise each of these reason families if supported by the current validator:

```text
APPROVAL_EVIDENCE_SCHEMA_INVALID
APPROVAL_STATE_INVALID
APPROVAL_EXPIRED
APPROVAL_REVOKED
APPROVAL_CONSUMED
APPROVAL_SCOPE_MISMATCH
APPROVAL_SCOPE_TOO_BROAD
APPROVAL_REQUEST_BINDING_INVALID
APPROVAL_MODEL_BINDING_INVALID
APPROVAL_RUN_MODE_BINDING_INVALID
APPROVAL_COMMIT_BINDING_INVALID
APPROVAL_SECRET_BOUNDARY_VIOLATION
APPROVAL_LIFETIME_INVALID
APPROVAL_TEXT_MISSING
APPROVAL_QUARANTINED
```

If a validator uses older FP-MCP-041 reason names, the result may include legacy aliases, but the aggregate must record this explicitly.

---

## Required Aggregate Result

Record an aggregate result under:

```text
runs/FP-MCP-062/negative-fixture-revalidation-result.json
```

The aggregate result must include:

```json
{
  "schemaVersion": "FP-MCP-062",
  "approvalEvidenceContractVersion": "FP-MCP-059",
  "validatorBoundaryVersion": "FP-MCP-061",
  "negativeApprovalEvidenceFixturesCreated": true,
  "negativeApprovalEvidenceFixturesValidated": true,
  "fixtureCount": 14,
  "allNegativeApprovalEvidenceFixturesRejected": true,
  "approvalEvidenceValid": false,
  "approvalUsableForExecution": false,
  "approvalCreated": false,
  "approvalMutated": false,
  "humanApprovalRecorded": false,
  "executionAllowedNow": false,
  "executionStarted": false,
  "startEndpointContacted": false,
  "opencodeStarted": false,
  "results": []
}
```

---

## Required Safety Checks

Verification must confirm:

```text
Approval evidence created: ONLY intentionally invalid fixtures
Valid approval evidence created: NO
Human approval recorded: NO
Approval usable for execution: NO
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

1. Confirmation that `packets/FP-MCP-062.md` is committed.
2. Confirmation that fixture artifacts are committed.
3. Confirmation that the validator reports `schemaVersion: FP-MCP-061`.
4. Confirmation that the validator reports `approvalEvidenceContractVersion: FP-MCP-059`.
5. Confirmation that every fixture returns `approvalEvidenceValid: false`.
6. Confirmation that every fixture returns `approvalUsableForExecution: false`.
7. Confirmation that every fixture returns `approvalCreated: false`.
8. Confirmation that every fixture returns `approvalMutated: false`.
9. Confirmation that every fixture returns `humanApprovalRecorded: false`.
10. Confirmation that every fixture returns `executionAllowedNow: false`.
11. Confirmation that no fixture contacts the start endpoint.
12. Confirmation that no fixture starts OpenCode.
13. Confirmation that at least one rejection reason is present per fixture.
14. Confirmation that the aggregate result is committed.
15. Confirmation that runner execution remains disabled.
16. Confirmation that OpenCode execution remains disabled.
17. Confirmation that ForgePilot repo is clean after artifact commits.

---

## Expected Files

Expected ForgePilot files:

```text
packets/FP-MCP-062.md
runs/FP-MCP-062/approvals/APPROVAL-20260622T230000000Z-00000001.json
runs/FP-MCP-062/approvals/APPROVAL-20260622T230000000Z-00000002.json
runs/FP-MCP-062/approvals/APPROVAL-20260622T230000000Z-00000003.json
runs/FP-MCP-062/approvals/APPROVAL-20260622T230000000Z-00000004.json
runs/FP-MCP-062/approvals/APPROVAL-20260622T230000000Z-00000005.json
runs/FP-MCP-062/approvals/APPROVAL-20260622T230000000Z-00000006.json
runs/FP-MCP-062/approvals/APPROVAL-20260622T230000000Z-00000007.json
runs/FP-MCP-062/approvals/APPROVAL-20260622T230000000Z-00000008.json
runs/FP-MCP-062/approvals/APPROVAL-20260622T230000000Z-00000009.json
runs/FP-MCP-062/approvals/APPROVAL-20260622T230000000Z-0000000a.json
runs/FP-MCP-062/approvals/APPROVAL-20260622T230000000Z-0000000b.json
runs/FP-MCP-062/approvals/APPROVAL-20260622T230000000Z-0000000c.json
runs/FP-MCP-062/approvals/APPROVAL-20260622T230000000Z-0000000d.json
runs/FP-MCP-062/approvals/APPROVAL-20260622T230000000Z-0000000e.json
runs/FP-MCP-062/negative-fixture-revalidation-result.json
runs/FP-MCP-062/executor-result.md
runs/FP-MCP-062/verification.txt
```

No valid approval evidence file is expected.

No MCP bridge patch is required unless the current validator cannot validate committed negative fixtures with sufficient structured output.

---

## Acceptance Criteria

FP-MCP-062 is accepted if:

```text
packet committed
negative approval evidence fixtures committed
validator reports FP-MCP-061 boundary
validator reports FP-MCP-059 approval evidence contract
all negative fixtures rejected
no fixture is usable for execution
no approval is recorded
no approval is mutated
execution remains disallowed
runner execution remains disabled
OpenCode execution remains disabled
start endpoint is not contacted
OpenCode is not started
aggregate result committed
verification artifacts committed
repo is clean
```

---

## Failure Conditions

FP-MCP-062 fails if:

```text
any fixture becomes approvalEvidenceValid: true
any fixture becomes approvalUsableForExecution: true
humanApprovalRecorded becomes true
executionAllowedNow becomes true
executionStarted becomes true
startEndpointContacted becomes true
opencodeStarted becomes true
runner execution becomes enabled
OpenCode execution becomes enabled
real secrets are committed
start-run endpoint is contacted
OpenCode CLI or API is invoked
fixture artifacts are mistaken for real approval
aggregate result claims success despite failed rejection checks
```

---

## Expected Result

Current expected result:

```text
PASS
```

with all negative approval evidence fixtures rejected and execution remaining disabled.

---

## Follow-Up

If FP-MCP-062 passes, the next packet should still avoid creating real approval evidence.

Recommended next packet:

```text
FP-MCP-063 — Human Approval Evidence Dry-Run Fixture Recorder
```

The word `fixture` is required.

It must remain dry-run/test-only and must not create real approval evidence.

Only after fixture recording is proven safe should ForgePilot consider:

```text
FP-MCP-064 — Start Request Human Approval Evidence Gate Enforcement
```
