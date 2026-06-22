# FP-MCP-060 — Human Approval Evidence Validation Alignment

## Task

Align the existing ForgePilot human approval validation tool with the FP-MCP-059 human approval evidence contract without enabling execution, creating approval artifacts, mutating approval artifacts, contacting the runner start endpoint, or starting OpenCode.

## Goal

Prove that ForgePilot can continue to fail closed on human approval evidence while explicitly reconciling the older FP-MCP-040/FP-MCP-041 approval-record model with the newer FP-MCP-059 approval-evidence contract.

FP-MCP-060 answers one question:

**Does the existing human approval validator still preserve the execution safety boundary, and what contract differences must be resolved before human approval can become a start-path gate?**

The expected current result is:

```text
approvalValidatorExists: true
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
```

This is a successful result.

---

## Background

FP-MCP-059 defined the human approval evidence contract for future guarded execution attempts.

During preparation for FP-MCP-060, the MCP bridge was observed to already expose:

```text
forgepilot_validate_human_approval_record
```

That tool was introduced earlier by FP-MCP-041 against the FP-MCP-040 approval-record contract.

Therefore FP-MCP-060 must not pretend to introduce a brand-new validator.

FP-MCP-060 is an alignment packet.

It records the relationship between:

```text
FP-MCP-040 — Human Approval Record Contract
FP-MCP-041 — Human Approval Record Validation Tool
FP-MCP-059 — Human Approval Evidence Contract
```

and identifies what must be reconciled before the start path can require human approval evidence.

---

## Governing Principles

FP-MCP-060 is constrained by:

```text
P01 — ForgePilot records observations, not narratives.
P02 — Trust cannot be retroactively created.
P03 — ForgePilot does not optimize for favorable outcomes.
P04 — Only admitted evidence may influence observatory outputs.
P06 — Classification follows observation.
```

The validator may classify approval evidence.

The validator must not create approval evidence.

The validator must not turn missing approval into implicit approval.

The validator must not satisfy the execution gate by itself.

---

## Scope Boundary

FP-MCP-060 may:

* document the alignment between FP-MCP-041 and FP-MCP-059
* invoke the existing human approval validator against a missing approval artifact
* confirm missing approval fails closed
* confirm the validator is read-only
* confirm no approval artifact is created
* confirm no approval artifact is mutated
* confirm human approval is not recorded
* confirm approval is not usable for execution
* confirm execution remains disallowed
* confirm the runner start endpoint is not contacted
* confirm OpenCode is not started
* identify contract mismatches
* record verification artifacts

FP-MCP-060 must not:

* create a real approval artifact
* create a placeholder approval artifact
* mutate an approval artifact
* mark approval as recorded
* mark approval as consumed
* mark approval as revoked
* satisfy a human approval gate
* enable runner execution
* set `FORGEPILOT_RUNNER_EXECUTION_ENABLED=true`
* enable OpenCode execution
* call `/runner/start-run`
* call the guarded start MCP tool as an execution path
* call OpenCode CLI
* call OpenCode API
* call model providers
* execute shell commands through the runner
* create execution artifacts
* create a real `runnerRunId`
* add worker processes
* add queues
* add scheduling
* mutate SQLite
* change routing logic
* expose the private runner publicly
* commit tokens or secrets

---

## Existing Tool Under Review

The existing MCP tool is:

```text
forgepilot_validate_human_approval_record
```

Expected current boundary lineage:

```text
schemaVersion: FP-MCP-041
boundaryVersion: FP-MCP-041
```

This is acceptable for FP-MCP-060 only if the packet records it as an alignment observation.

FP-MCP-060 must not silently relabel FP-MCP-041 behavior as FP-MCP-060 behavior.

---

## Required Probe

Invoke the existing validator against a missing approval artifact scoped to a known safe request.

Known request context:

```text
scope.packetId: FP-MCP-036
scope.requestId: REQ-20260622T144553300Z-fbbe8d82
scope.modelId: qwen-3.7-max
scope.runMode: DESIGN_ONLY
scope.repoCommit: 40b53dc
scope.branch: main
```

Recommended validator input:

```json
{
  "packetId": "FP-MCP-060",
  "approvalId": "APPROVAL-20260622T000000000Z-00000000",
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

The approval artifact is expected to be absent.

Missing approval must be classified as invalid.

Missing approval must not create an artifact.

---

## Required Safe Missing-Approval Result

The validator must return, at minimum:

```text
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
reasons includes APPROVAL_ARTIFACT_MISSING
```

This is a pass condition for FP-MCP-060.

---

## Required Execution Boundary Checks

FP-MCP-060 verification must also confirm:

```text
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
disableSwitchActive: true
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

The global disable switch remains authoritative.

Human approval validation must not override the disable switch.

---

## Contract Alignment Map

FP-MCP-060 records the following mapping between FP-MCP-059 and the existing FP-MCP-041 validator terminology:

| FP-MCP-059 term | Existing FP-MCP-041 term | Alignment status |
| --- | --- | --- |
| human approval evidence | human approval record | compatible naming, needs canonical wording |
| approval evidence artifact | approval artifact | compatible |
| approvalId | approvalId | compatible |
| scoped packet id | expectedScope.packetId | compatible |
| scoped request id | expectedScope.requestId | compatible |
| scoped model id | expectedScope.modelId | compatible |
| scoped run mode | expectedScope.runMode | compatible |
| baseCommitSha | expectedScope.repoCommit | compatible but naming differs |
| branch | expectedScope.branch | FP-MCP-041 is stricter because branch is required |
| canonical approval string | approval text with required phrases | mismatch; needs future hardening |
| max approval lifetime 30 minutes | max approval lifetime 1 hour | mismatch; needs future hardening |
| single-use approval | singleUse true and consumedAt null | compatible |
| revocation | revokedAt / approvalState REVOKED | compatible |
| consumed approval | consumedAt / approvalState CONSUMED | compatible |
| secret-free artifact | secretBoundaryValid | compatible |
| committed approval evidence | artifactCommitted | compatible |
```

---

## Required Mismatch Findings

FP-MCP-060 must record these findings explicitly:

```text
1. The validator already exists and is lineage-bound to FP-MCP-041.
2. The current validator can fail closed on missing approval evidence.
3. The validator uses approval-record terminology, while FP-MCP-059 uses approval-evidence terminology.
4. FP-MCP-059 requires a canonical approval string; FP-MCP-041 permits key-phrase approval text.
5. FP-MCP-059 prefers a maximum approval lifetime of 30 minutes; FP-MCP-041 allows up to 1 hour.
6. FP-MCP-041 requires branch binding, which is stricter than FP-MCP-059 and may be retained.
7. Start-path enforcement must not rely on human approval until these differences are resolved or explicitly grandfathered.
```

---

## Required Classification

FP-MCP-060 classification:

```text
validatorSafety: PASS if missing approval fails closed
contractAlignment: PARTIAL
executionReadiness: BLOCKED
startPathHumanApprovalGateReady: false
```

`contractAlignment: PARTIAL` is expected.

`executionReadiness: BLOCKED` is expected.

`startPathHumanApprovalGateReady: false` is expected.

This packet is not supposed to make approval usable.

---

## Verification Requirements

Verification must include:

1. Confirm ForgePilot repository status is clean.
2. Confirm FP-MCP-060 packet exists after commit.
3. Confirm OpenCode execution remains disabled.
4. Confirm the execution disable switch remains active.
5. Invoke `forgepilot_validate_human_approval_record` against a missing approval artifact.
6. Confirm `approvalValidationEvaluated: true`.
7. Confirm `approvalValid: false`.
8. Confirm `approvalUsableForExecution: false`.
9. Confirm `approvalCreated: false`.
10. Confirm `approvalMutated: false`.
11. Confirm `humanApprovalRecorded: false`.
12. Confirm `executionAllowedNow: false`.
13. Confirm `executionStarted: false`.
14. Confirm `startEndpointContacted: false`.
15. Confirm `opencodeStarted: false`.
16. Confirm reason includes `APPROVAL_ARTIFACT_MISSING`.
17. Confirm no approval artifact was created under `runs/FP-MCP-060/approvals/`.
18. Record verification artifacts.

---

## Expected Files

Expected ForgePilot files:

```text
packets/FP-MCP-060.md
runs/FP-MCP-060/executor-result.md
runs/FP-MCP-060/verification.txt
```

No MCP bridge patch is required for FP-MCP-060 unless verification reveals unsafe behavior.

No approval artifact should be created.

---

## Acceptance Criteria

FP-MCP-060 is accepted if:

```text
FP-MCP-060 packet is committed
existing validator is acknowledged rather than duplicated
missing approval is classified invalid
approvalValid remains false
approvalUsableForExecution remains false
approvalCreated remains false
approvalMutated remains false
humanApprovalRecorded remains false
executionAllowedNow remains false
executionStarted remains false
startEndpointContacted remains false
opencodeStarted remains false
runner execution remains disabled
OpenCode execution remains disabled
contract mismatches are documented
verification artifacts are committed
repo is clean
```

---

## Failure Conditions

FP-MCP-060 fails if:

```text
approval artifact is created
approval artifact is mutated
missing approval is treated as valid
approvalUsableForExecution becomes true
humanApprovalRecorded becomes true
executionAllowedNow becomes true
executionStarted becomes true
startEndpointContacted becomes true
OpenCode starts
runner execution is enabled
OpenCode execution is enabled
contract mismatch is ignored
validator behavior is silently relabeled from FP-MCP-041 to FP-MCP-060
secrets are written to artifacts
runner is publicly exposed
```

---

## Expected Result

Current expected successful result:

```text
PASS_WITH_ALIGNMENT_FINDINGS
```

Required final state:

```text
validatorSafety: PASS
contractAlignment: PARTIAL
executionReadiness: BLOCKED
startPathHumanApprovalGateReady: false
```

---

## Follow-Up

After FP-MCP-060, ForgePilot should proceed to one of:

```text
FP-MCP-061 — Human Approval Evidence Dry-Run Recorder
FP-MCP-061 — Human Approval Evidence Contract Hardening Patch
FP-MCP-061 — Human Approval Evidence Negative Fixture Tests
```

Recommended next step:

```text
FP-MCP-061 — Human Approval Evidence Contract Hardening Patch
```

Purpose:

```text
Update the existing validator contract behavior to match FP-MCP-059 before recording or enforcing approval evidence.
```

This likely means hardening:

```text
canonical approval string
30-minute maximum lifetime
baseCommitSha/repoCommit naming compatibility
explicit FP-MCP-059 boundary reference
```

The hardening packet must still not enable execution.
