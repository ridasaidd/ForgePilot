# FP-MCP-141 — Fresh Target-Bound Approval Evidence For Existing Request

## Task

Create fresh target-bound human approval evidence for the existing FP-MCP-134 request after the original FP-MCP-135 approval expired.

## Goal

Restore the human approval evidence gate for the known target-bound request without mutating expired approval evidence, consuming approval, enabling execution, starting OpenCode, contacting the runner start endpoint, or changing the request artifact.

This packet answers one question:

Can ForgePilot record fresh human approval evidence for an existing targeted request while preserving the execution-disabled safety boundary?

## Background

FP-MCP-134 introduced target execution commit binding in request artifacts.

The known request artifact is:

```text
packetId: FP-MCP-134
requestId: REQ-20260630T202005438Z-86d20df4
modelId: deepseek-v4-pro-high
runMode: DESIGN_ONLY
baseCommit: bbf930a
targetExecutionCommit: bbf930a
approvedTargetExecutionCommit: bbf930a
executionStarted: false
opencodeStarted: false
startEndpointContacted: false
runnerRunId: null
```

FP-MCP-135 recorded the original target-bound approval evidence:

```text
approvalId: APPROVAL-20260630T202924964Z-65d76e90
path: runs/FP-MCP-135/approvals/APPROVAL-20260630T202924964Z-65d76e90.json
scope.packetId: FP-MCP-134
scope.requestId: REQ-20260630T202005438Z-86d20df4
scope.modelId: deepseek-v4-pro-high
scope.runMode: DESIGN_ONLY
scope.branch: main
scope.approvedTargetExecutionCommit: bbf930a
scope.repoCommit: bbf930a
```

FP-MCP-136 normalized local guarded preflight report gates.

FP-MCP-137 generalized human approval packet scope binding.

FP-MCP-138 bound approval commit checks to the request target commit rather than current repository HEAD.

FP-MCP-139 recorded fresh pre-start evidence for the targeted request.

FP-MCP-140 recorded fresh non-executing state snapshot evidence for the targeted request.

FP-MCP-140 also observed that the original FP-MCP-135 approval had expired:

```text
requestArtifactState: PASSED
preStartEvidenceState: PASSED
stateSnapshotEvidenceState: PASSED
humanApprovalEvidenceState: FAILED
humanApprovalEvidenceReason: HUMAN_APPROVAL_EVIDENCE_EXPIRED
```

That observation must not be retroactively repaired by mutating the old approval.

## Decision

The expired FP-MCP-135 approval remains historical evidence only.

FP-MCP-141 must create a fresh approval artifact scoped to the same request and the same target execution commit:

```text
scope.packetId: FP-MCP-134
scope.requestId: REQ-20260630T202005438Z-86d20df4
scope.modelId: deepseek-v4-pro-high
scope.runMode: DESIGN_ONLY
scope.branch: main
scope.approvedTargetExecutionCommit: bbf930a
scope.repoCommit: bbf930a
```

The new approval must be create-only.

It must not consume approval.

It must not authorize execution while the disable switch and runner/OpenCode gates remain closed.

Current repository HEAD may be recorded as observation only and must not replace the target execution commit as the binding value.

## Scope

Allowed:

- Create fresh human approval evidence for the existing FP-MCP-134 request.
- Bind the fresh approval to `targetExecutionCommit == bbf930a`.
- Bind the fresh approval to `approvedTargetExecutionCommit == bbf930a`.
- Run non-executing local guarded preflight.
- Record local preflight output for FP-MCP-141.
- Record verification output for FP-MCP-141.
- Confirm request artifact, pre-start evidence, state snapshot evidence, and human approval evidence gates.
- Record remaining gate reasons honestly.
- Commit ForgePilot packet and evidence.

Forbidden:

- Do not mutate the FP-MCP-135 approval artifact.
- Do not mutate any existing approval artifact.
- Do not mutate the FP-MCP-134 request artifact.
- Do not mutate FP-MCP-139 pre-start evidence.
- Do not mutate FP-MCP-140 state snapshot evidence.
- Do not consume approval.
- Do not create approval consumption evidence.
- Do not enable execution.
- Do not make start callable.
- Do not add start to `supportedOperations`.
- Do not contact the runner start endpoint.
- Do not call `/runner/start-run`.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create a real runner run id.
- Do not implement `PRESENT_GUARDED`.
- Do not implement `CALLABLE_GUARDED`.
- Do not implement real guarded start.
- Do not relax the disable switch.
- Do not convert current repository HEAD drift into approval target mismatch.

## Verification Pair

Use the known target-bound request:

```text
request packet id: FP-MCP-134
request id: REQ-20260630T202005438Z-86d20df4
model id: deepseek-v4-pro-high
run mode: DESIGN_ONLY
targetExecutionCommit: bbf930a
approvedTargetExecutionCommit: bbf930a
```

The original expired approval is observation-only:

```text
expired approval id: APPROVAL-20260630T202924964Z-65d76e90
expired approval path: runs/FP-MCP-135/approvals/APPROVAL-20260630T202924964Z-65d76e90.json
expired reason: HUMAN_APPROVAL_EVIDENCE_EXPIRED
```

The fresh approval must receive a new approval id and must be recorded separately.

## Evidence Location

Record FP-MCP-141 evidence under:

```text
runs/FP-MCP-141/
```

Fresh approval evidence may be stored under:

```text
runs/FP-MCP-141/approvals/
```

Do not overwrite or edit:

```text
runs/FP-MCP-135/approvals/APPROVAL-20260630T202924964Z-65d76e90.json
```

## Required Evidence Files

Record:

```text
runs/FP-MCP-141/fresh-approval-evidence-contract.md
runs/FP-MCP-141/approvals/<NEW_APPROVAL_ID>.json
runs/FP-MCP-141/local-preflight-report.json
runs/FP-MCP-141/local-preflight-report.md
runs/FP-MCP-141/verification.txt
```

## Verification Requirements

The fresh approval evidence must show:

```text
artifactType: human-approval-evidence
approvalState: VALID
approvalUsableForExecution: true
humanApprovalRecorded: true
approvalConsumed: false
consumedAt: null
approvalConsumptionCreated: false
executionStarted: false
opencodeStarted: false
startEndpointContacted: false
runnerStartEndpointContacted: false
requestArtifactMutated: false
```

The fresh approval scope must show:

```text
scope.packetId: FP-MCP-134
scope.requestId: REQ-20260630T202005438Z-86d20df4
scope.modelId: deepseek-v4-pro-high
scope.runMode: DESIGN_ONLY
scope.branch: main
scope.approvedTargetExecutionCommit: bbf930a
scope.repoCommit: bbf930a
```

The fresh local preflight report should show:

```text
requestArtifactState: PASSED
preStartEvidenceState: PASSED
stateSnapshotEvidenceState: PASSED
humanApprovalEvidenceState: PASSED
```

The report must preserve normalized gate shape:

```text
typeof gates == object
gates is not an array
gates.requestArtifact is object-valued
gates.preStartEvidence is object-valued
gates.stateSnapshotEvidence is object-valued
gates.humanApprovalEvidence is object-valued
```

## Safety Requirements

Safety fields must remain:

```text
eligibleForFutureGuardedStart: false
executionPermitted: false
executionStarted: false
opencodeStarted: false
runnerStartEndpointContacted: false
startEndpointContacted: false
runnerRunId: null
approvalConsumed: false
requestArtifactMutated: false
approvalArtifactMutated: false
preStartEvidenceMutated: false
stateSnapshotEvidenceMutated: false
```

Any observation of runner capabilities must not contact the runner start endpoint.

Any observation of OpenCode readiness must not start OpenCode.

## Success Criteria

This packet is successful if:

1. A fresh approval artifact is created for the existing target-bound request.
2. The expired FP-MCP-135 approval is not mutated.
3. The FP-MCP-134 request artifact is not mutated.
4. Pre-start evidence remains passing.
5. State snapshot evidence remains passing.
6. Fresh human approval evidence passes.
7. Target commit binding remains tied to `bbf930a`.
8. Human approval target binding does not regress to current-HEAD comparison.
9. Safety fields remain non-executing.
10. ForgePilot packet and evidence are committed.

## Non-goals

This packet does not consume approval.

This packet does not create approval consumption evidence.

This packet does not enable execution.

This packet does not make start callable.

This packet does not add start to supported operations.

This packet does not implement `PRESENT_GUARDED`.

This packet does not implement `CALLABLE_GUARDED`.

This packet does not perform a remote runner start.

This packet does not mutate expired approval evidence.

This packet does not mutate the FP-MCP-134 request artifact.

This packet does not mutate FP-MCP-139 or FP-MCP-140 evidence.
