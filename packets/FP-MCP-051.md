# FP-MCP-051 — Pre-Start Evidence Validation Tool

## Status

DRAFT

## Type

MCP bridge validation tool packet

## Summary

Add a read-only MCP tool that validates whether the pre-start evidence required by `docs/pre-start-evidence-contract.md` is present, internally consistent, and safe to use before a future start request can be considered.

This packet must not enable execution, create approval records, create pre-start evidence, contact the runner start endpoint, start OpenCode, or mutate existing evidence.

## Motivation

FP-MCP-050 defined the contract for evidence that must exist immediately before any future execution handoff. The next safe step is not to create that evidence automatically. The next safe step is to validate whether such evidence exists and whether it is internally consistent.

This preserves the ForgePilot rule that gates append observations and do not manufacture trust.

## Scope

Implement a read-only MCP tool:

```text
forgepilot_validate_pre_start_evidence
```

The tool accepts:

```text
packetId
requestId
```

The tool returns a structured validation result describing whether required pre-start evidence exists and is consistent.

## Required Behavior

The tool must:

1. Validate the request artifact exists and is locally valid.
2. Validate guarded execution preflight has been evaluated.
3. Validate disable-switch status has been evaluated.
4. Validate start approval state is represented as an observation, not assumed.
5. Validate artifact paths and hashes are present where required.
6. Validate runner start has not been contacted.
7. Validate OpenCode has not been started.
8. Return explicit missing or inconsistent evidence reasons.
9. Remain read-only.
10. Preserve execution-disabled semantics.

## Required Output Shape

The tool output must include at least:

```text
schemaVersion
packetId
requestId
preStartEvidenceEvaluated
preStartEvidenceComplete
preStartEvidenceValid
executionPermitted
executionStarted
startEndpointContacted
opencodeStarted
runnerContactedForStart
requestArtifactValid
preflightEvaluated
disableSwitchEvaluated
disableSwitchActive
approvalObserved
approvalAccepted
artifactHashesPresent
artifactHashesConsistent
requiredEvidence
missingEvidence
inconsistentEvidence
boundaryVersion
statusSource
checkedAt
reasons
```

## Required Safe Defaults

For the current system state, the expected safe result is:

```text
preStartEvidenceEvaluated: true
preStartEvidenceComplete: false
preStartEvidenceValid: false
executionPermitted: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerContactedForStart: false
disableSwitchActive: true
```

The current result should not become eligible merely because request artifacts, preflight data, or dry-run evidence exists. Human approval and future pre-start evidence must be explicit observations.

## Required Reason Codes

The implementation should use explicit reason codes where applicable:

```text
PRE_START_EVIDENCE_INCOMPLETE
PRE_START_EVIDENCE_INVALID
REQUEST_ARTIFACT_MISSING
REQUEST_ARTIFACT_INVALID
PREFLIGHT_EVIDENCE_MISSING
PREFLIGHT_EVIDENCE_INVALID
DISABLE_SWITCH_ACTIVE
DISABLE_SWITCH_EVIDENCE_MISSING
START_APPROVAL_NOT_OBSERVED
START_APPROVAL_REJECTED
START_ENDPOINT_NOT_CONTACTED
OPENCODE_NOT_STARTED
ARTIFACT_HASH_MISSING
ARTIFACT_HASH_MISMATCH
EXECUTION_DISABLED
```

Reason codes may be supplemented with existing reason codes from prior validators, but they must not be replaced by narrative-only explanations.

## Non-Goals

This packet must not:

* enable runner execution
* enable OpenCode execution
* contact the runner start endpoint
* start OpenCode
* create human approvals
* create pre-start evidence
* mutate request artifacts
* mutate dry-run artifacts
* mark evidence as admitted
* bypass the disable switch
* infer approval from absence of rejection
* infer trust from successful validation alone

## Acceptance Criteria

This packet is accepted only if:

1. `forgepilot_validate_pre_start_evidence` is exposed by the MCP bridge.
2. The tool is read-only.
3. The tool does not contact the runner start endpoint.
4. The tool does not start OpenCode.
5. The tool returns `executionPermitted: false`.
6. The tool returns `executionStarted: false`.
7. The tool returns `startEndpointContacted: false`.
8. The tool returns `opencodeStarted: false`.
9. The tool reports incomplete pre-start evidence for current valid request artifacts.
10. Missing or malformed request artifacts are rejected with explicit reason codes.
11. Disable-switch status is represented in the output.
12. The repository remains clean after verification artifacts are recorded.

## Verification Plan

After implementation, verify using an existing valid request artifact, preferably:

```text
packetId: FP-MCP-036
requestId: REQ-20260622T144553300Z-fbbe8d82
```

Expected result:

```text
preStartEvidenceEvaluated: true
preStartEvidenceComplete: false
preStartEvidenceValid: false
executionPermitted: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerContactedForStart: false
```

Also verify at least one missing request artifact and one malformed request id.

## Evidence Requirements

Record:

```text
runs/FP-MCP-051/executor-result.md
runs/FP-MCP-051/verification.txt
```

If fixture or aggregate JSON evidence is created, record it under:

```text
runs/FP-MCP-051/
```

## Boundary

This packet is part of the gated execution-readiness chain. It adds observation and validation only.

Execution remains disabled.
