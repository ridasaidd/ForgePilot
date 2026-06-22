# FP-MCP-063 — Human Approval Evidence Dry-Run Fixture Recorder

## Status

DRAFT

## Type

MCP bridge safety / human approval evidence fixture recording

## Task

Add a deliberately non-authorizing MCP tool that records human-approval-evidence-shaped dry-run fixture artifacts.

The tool must create **test-only fixtures**, not real approval evidence.

The tool must preserve the FP-MCP-059 human approval evidence contract, the FP-MCP-061 validator hardening, and the FP-MCP-062 negative fixture revalidation result.

---

## Goal

Prove that ForgePilot can record approval-shaped evidence fixtures without accidentally creating usable approval evidence, satisfying the human approval gate, enabling execution, contacting the runner start endpoint, or starting OpenCode.

FP-MCP-063 answers one question:

**Can ForgePilot create approval-shaped dry-run fixture artifacts while making them structurally observable, explicitly non-authorizing, and rejected by the hardened approval validator?**

The expected result is:

```text
humanApprovalEvidenceDryRunFixtureRecorderDefined: true
dryRunFixtureRecorded: true
dryRunFixtureValidated: true
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

FP-MCP-061 hardened the validator so the live approval validation tool reports:

```text
schemaVersion: FP-MCP-061
validatorBoundaryVersion: FP-MCP-061
approvalEvidenceContractVersion: FP-MCP-059
legacyApprovalRecordBoundaryRecognized: FP-MCP-041
```

FP-MCP-062 revalidated representative invalid approval evidence fixtures against the hardened validator.

FP-MCP-063 is the first recorder-like approval-evidence step after that rejection proof.

Because human approval is a high-trust boundary, this packet must record **fixtures only**.

It must not create real approval evidence.

---

## Governing Principles

FP-MCP-063 is constrained by:

```text
P01 — ForgePilot records observations, not narratives.
P02 — Trust cannot be retroactively created.
P03 — ForgePilot does not optimize for favorable outcomes.
P04 — Only admitted evidence may influence observatory outputs.
P06 — Classification follows observation.
```

A dry-run fixture may demonstrate shape.

A dry-run fixture must not create trust.

A dry-run fixture must not authorize execution.

---

## Scope Boundary

FP-MCP-063 may:

* add a new MCP tool that records dry-run human approval evidence fixtures
* write fixture artifacts under `runs/<packetId>/approvals/`
* use create-only artifact writes
* refuse to overwrite existing approval fixture artifacts
* include approval-shaped fields for validator testing
* mark every artifact as fixture-only and dry-run
* force every recorded fixture to be non-authorizing
* invoke the existing `forgepilot_validate_human_approval_record` validator after recording, if useful
* return structured recorder and validation output
* add output schemas and helper functions in the MCP bridge
* record verification artifacts

FP-MCP-063 must not:

* create real human approval evidence
* create any valid approval artifact
* create any artifact that is usable for execution
* create `approvalState: RECORDED`
* mark human approval as recorded
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
* overwrite existing approval fixture artifacts
* commit real secrets
* expose the private runner publicly
* weaken the disable switch
* weaken pre-start evidence or state snapshot gates

---

## Required Tool

Add a new MCP tool:

```text
forgepilot_record_human_approval_evidence_dry_run_fixture
```

The tool name must include:

```text
dry_run
fixture
```

This naming is intentional.

It prevents the tool from being mistaken for a real human approval recorder.

---

## Required Tool Inputs

Recommended input:

```json
{
  "packetId": "FP-MCP-063",
  "requestId": "REQ-20260622T144553300Z-fbbe8d82",
  "modelId": "qwen-3.7-max",
  "runMode": "DESIGN_ONLY",
  "repoCommit": "40b53dc",
  "branch": "main",
  "approval": "RECORD_HUMAN_APPROVAL_EVIDENCE_DRY_RUN_FIXTURE"
}
```

The approval string must match exactly:

```text
RECORD_HUMAN_APPROVAL_EVIDENCE_DRY_RUN_FIXTURE
```

This approval string authorizes only the creation of a fixture artifact.

It must not authorize execution.

It must not authorize real approval evidence.

---

## Required Tool Behavior

The tool must:

1. Validate the packet id.
2. Validate the request id format.
3. Validate the model id against the allowed model list.
4. Validate the run mode against the allowed run mode list.
5. Validate the exact fixture-recording approval string.
6. Read current repository commit and working tree state.
7. Evaluate execution disable-switch status.
8. Construct a unique fixture approval id.
9. Construct a safe repository-relative fixture path under:

   ```text
   runs/<packetId>/approvals/<approvalId>.json
   ```

10. Use create-only write behavior.
11. Refuse to overwrite an existing fixture.
12. Write an explicitly non-authorizing fixture artifact.
13. Validate the written artifact with `forgepilot_validate_human_approval_record`.
14. Return both recording and validation observations.
15. Preserve all non-execution booleans as false.

---

## Required Fixture Artifact Semantics

The written artifact must be approval-shaped but non-authorizing.

It must include:

```json
{
  "schemaVersion": "FP-MCP-063",
  "artifactType": "human-approval-evidence-dry-run-fixture",
  "fixture": true,
  "dryRun": true,
  "fixturePacketId": "FP-MCP-063",
  "fixturePurpose": "human-approval-evidence-recorder-safety-proof",
  "expectedValid": false,
  "expectedUsableForExecution": false,
  "approvalState": "INVALID",
  "approvalKind": "EXECUTION_ENABLEMENT",
  "approvedAction": "ALLOW_ONE_GUARDED_REMOTE_RUNNER_EXECUTION_ATTEMPT",
  "humanApprovalRecorded": false,
  "approvalUsableForExecution": false,
  "executionAllowedNow": false,
  "executionStarted": false,
  "startEndpointContacted": false,
  "opencodeStarted": false
}
```

The artifact may include an expected scope and canonical approval text for shape testing, but must remain invalid because it is a fixture.

The artifact must not use:

```text
approvalState: RECORDED
artifactType: human-approval-evidence
dryRun: false
fixture: false
```

---

## Required Fixture Path

The fixture path must be:

```text
runs/<packetId>/approvals/<approvalId>.json
```

For FP-MCP-063 verification, the expected prefix is:

```text
runs/FP-MCP-063/approvals/
```

Rationale:

The existing validator resolves approval artifacts from:

```text
runs/<packetId>/approvals/<approvalId>.json
```

Using the same namespace proves that approval-shaped artifacts in the approval namespace still fail closed when they are explicitly fixtures.

---

## Required Output Fields

The tool output must include at least:

```text
schemaVersion
packetId
requestId
modelId
runMode
repoCommit
branch
fixtureRecorderEvaluated
dryRunFixtureRecorded
dryRunFixturePath
dryRunFixtureApprovalId
dryRunFixtureSha256
dryRunFixtureAlreadyExists
dryRunFixtureValidated
approvalValidationEvaluated
approvalEvidenceValid
approvalValid
approvalUsableForExecution
approvalCreated
approvalMutated
humanApprovalRecorded
executionAllowedNow
executionStarted
startEndpointContacted
opencodeStarted
disableSwitchStatusEvaluated
disableSwitchActive
runnerExecutionEnabled
opencodeExecutionEnabled
effectiveDisableReason
effectiveDisableScope
boundaryVersion
statusSource
checkedAt
reasons
```

---

## Required Validation Result

After recording, validation must return:

```text
schemaVersion: FP-MCP-061
validatorBoundaryVersion: FP-MCP-061
approvalEvidenceContractVersion: FP-MCP-059
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

At least one rejection reason must be present.

Expected rejection reason family:

```text
APPROVAL_EVIDENCE_TYPE_INVALID
APPROVAL_ARTIFACT_TYPE_INVALID
APPROVAL_STATE_INVALID
APPROVAL_STATE_NOT_RECORDED
```

The exact reason set may include additional rejection reasons.

Additional rejection reasons are acceptable if the final classification remains fail-closed.

---

## Required Safety Result

The recorder must preserve:

```text
Real approval evidence created: NO
Approval evidence usable for execution: NO
Human approval recorded: NO
Runner execution enabled: NO
OpenCode execution enabled: NO
Runner start endpoint contacted: NO
OpenCode started: NO
Shell executed through runner: NO
Model provider contacted: NO
Real runnerRunId created: NO
Existing approval artifacts overwritten: NO
Real secrets committed: NO
```

---

## Required Implementation Notes

The implementation should be conservative.

Recommended implementation constraints:

```text
Use writeFile with create-only semantics.
Use safe repository-relative path normalization.
Require packet-local runs/<packetId>/approvals/ path.
Generate approval ids with the APPROVAL-<UTC timestamp>-<hex suffix> format.
Use the existing validator after writing.
Return validation output, not just writer output.
Never return approvalUsableForExecution: true.
Never return humanApprovalRecorded: true.
Never return executionAllowedNow: true.
```

---

## Verification Requirements

Verification must include:

1. Confirmation that the FP-MCP-063 packet is committed.
2. Confirmation that the MCP bridge implementation is committed.
3. Confirmation that the tool exists.
4. Confirmation that the tool requires the exact fixture-recording approval string.
5. Confirmation that the tool writes exactly one dry-run fixture artifact.
6. Confirmation that the artifact is committed before final verification, if artifact verification depends on committed state.
7. Confirmation that the validator evaluates the written fixture.
8. Confirmation that the validator returns `approvalEvidenceValid: false`.
9. Confirmation that the validator returns `approvalUsableForExecution: false`.
10. Confirmation that the validator returns `humanApprovalRecorded: false`.
11. Confirmation that the recorder returns `approvalCreated: false` for real approval.
12. Confirmation that the recorder returns `approvalMutated: false` for existing approval artifacts.
13. Confirmation that runner execution remains disabled.
14. Confirmation that OpenCode execution remains disabled.
15. Confirmation that the runner start endpoint was not contacted.
16. Confirmation that OpenCode was not started.
17. Confirmation that no real execution artifacts were created.
18. Confirmation that existing FP-MCP-062 negative fixture behavior remains valid.

---

## Expected Artifacts

The run should record:

```text
runs/FP-MCP-063/executor-result.md
runs/FP-MCP-063/verification.txt
runs/FP-MCP-063/dry-run-fixture-recorder-result.json
```

If a fixture artifact is recorded, it should live under:

```text
runs/FP-MCP-063/approvals/
```

The fixture artifact must be committed as test evidence only.

---

## Explicit Non-Authorization Statement

FP-MCP-063 does not authorize execution.

FP-MCP-063 does not create real human approval evidence.

FP-MCP-063 does not satisfy the human approval gate.

FP-MCP-063 only proves that approval-shaped fixture recording can happen without creating trust.

---

## Success Criteria

FP-MCP-063 succeeds only if:

```text
humanApprovalEvidenceDryRunFixtureRecorderDefined: true
dryRunFixtureRecorded: true
dryRunFixtureValidated: true
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

Any result that creates usable approval evidence fails this packet.

Any result that records real human approval fails this packet.

Any result that enables execution fails this packet.

Any result that starts OpenCode fails this packet.
