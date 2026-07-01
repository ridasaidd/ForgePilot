# FP-MCP-140 — State Snapshot Evidence For Targeted Request

## Task

Create fresh non-executing start-state snapshot evidence for the targeted FP-MCP-134 request.

## Goal

Ensure the guarded preflight path can evaluate state snapshot evidence for a target-bound request after pre-start evidence passes, without enabling execution, starting OpenCode, contacting the runner start endpoint, consuming approval, or mutating existing request, approval, or pre-start evidence artifacts.

This packet answers one question:

Can ForgePilot record pre/post start-state snapshot evidence for a targeted guarded request while preserving the execution-disabled safety boundary?

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

FP-MCP-135 recorded matching human approval evidence scoped to that request and target commit.

The known approval artifact is:

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

FP-MCP-139 created fresh request-scoped pre-start evidence for the targeted request.

The FP-MCP-139 corrected verification summary showed:

```text
requestArtifactState: PASSED
requestArtifactPassed: true
preStartEvidenceState: PASSED
preStartEvidencePassed: true
humanApprovalEvidenceState: PASSED
humanApprovalEvidencePassed: true
```

The remaining expected blockers were still execution-bound gates:

```text
EXECUTION_DISABLED_GLOBAL
DISABLE_SWITCH_ACTIVE
START_ENDPOINT_DISABLED
START_NOT_CALLABLE
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
```

## Decision

State snapshot evidence for a targeted request must be recorded as fresh non-executing observation evidence.

The state snapshot evidence must preserve:

```text
request packet id
request id
approval id
model id
run mode
target execution commit
approved target execution commit
pre-start evidence path
pre-start evidence sha256
current repository commit
execution-disabled state
runner start endpoint contact state
OpenCode start state
approval consumption state
request mutation state
approval mutation state
pre-start evidence mutation state
```

Current repository HEAD may be observed, but it must not replace the target execution commit as the binding value.

## Scope

Allowed:

- Create fresh non-executing start-state snapshot evidence for the FP-MCP-134 targeted request.
- Use the known FP-MCP-135 approval id as non-consuming evidence context.
- Use the FP-MCP-139 pre-start evidence as prerequisite evidence.
- Run non-executing local guarded preflight.
- Record local preflight output for FP-MCP-140.
- Record verification output for FP-MCP-140.
- Record whether `stateSnapshotEvidence` passes or remains blocked.
- Record remaining gate reasons honestly.
- Commit ForgePilot packet and evidence.

Forbidden:

- Do not enable execution.
- Do not make start callable.
- Do not add start to `supportedOperations`.
- Do not contact the runner start endpoint.
- Do not call `/runner/start-run`.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create a real runner run id.
- Do not consume approval.
- Do not create approval consumption evidence.
- Do not mutate existing request artifacts.
- Do not mutate existing approval artifacts.
- Do not mutate existing pre-start evidence.
- Do not mutate older state snapshot evidence.
- Do not implement `PRESENT_GUARDED`.
- Do not implement `CALLABLE_GUARDED`.
- Do not implement real guarded start.
- Do not relax the disable switch.
- Do not convert current repository HEAD drift into approval target mismatch.

## Verification Pair

Use the known target-bound request and approval pair:

```text
request packet id: FP-MCP-134
request id: REQ-20260630T202005438Z-86d20df4
approval id: APPROVAL-20260630T202924964Z-65d76e90
model id: deepseek-v4-pro-high
run mode: DESIGN_ONLY
targetExecutionCommit: bbf930a
approvedTargetExecutionCommit: bbf930a
approval repoCommit: bbf930a
approval approvedTargetExecutionCommit: bbf930a
```

Use the FP-MCP-139 pre-start evidence artifact:

```text
path: runs/FP-MCP-134/pre-start-evidence/REQ-20260630T202005438Z-86d20df4.json
```

## Evidence Location

Record FP-MCP-140 evidence under:

```text
runs/FP-MCP-140/
```

The packet may also create request-scoped state snapshot evidence at the established request state snapshot path if the local preflight evaluator requires that location:

```text
runs/FP-MCP-134/start-state-snapshots/REQ-20260630T202005438Z-86d20df4/
```

Do not mutate older state snapshot evidence.

## Required Evidence Files

Record:

```text
runs/FP-MCP-140/state-snapshot-evidence-contract.md
runs/FP-MCP-140/local-preflight-report.json
runs/FP-MCP-140/local-preflight-report.md
runs/FP-MCP-140/verification.txt
```

If request-scoped state snapshot artifacts are created, record their paths and SHA-256 values in the FP-MCP-140 evidence.

## Verification Requirements

The fresh local preflight report must show the known request and approval pair:

```text
packetId: FP-MCP-134
requestId: REQ-20260630T202005438Z-86d20df4
approvalId: APPROVAL-20260630T202924964Z-65d76e90
requestTargetExecutionCommit: bbf930a
approvalTargetExecutionCommit: bbf930a
```

The report must preserve normalized gate shape:

```text
typeof gates == object
gates is not an array
gates.preStartEvidence is object-valued when emitted
gates.stateSnapshotEvidence is object-valued when emitted
gates.humanApprovalEvidence is object-valued when emitted
```

The report must record state snapshot evidence state and reasons.

If `stateSnapshotEvidence` still fails or remains incomplete, the reasons must be recorded honestly.

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
```

Any observation of runner capabilities must not contact the runner start endpoint.

Any observation of OpenCode readiness must not start OpenCode.

## Success Criteria

This packet is successful if:

1. Fresh state snapshot evidence is recorded or the remaining state snapshot blocker is precisely identified.
2. Local guarded preflight is run without execution.
3. The state snapshot evidence gate is evaluated and recorded.
4. Pre-start evidence remains passing.
5. Human approval evidence remains passing.
6. Target commit binding remains tied to `bbf930a`.
7. Human approval target binding does not regress to current-HEAD comparison.
8. Safety fields remain non-executing.
9. Existing request artifacts are not mutated.
10. Existing approval artifacts are not mutated.
11. Existing pre-start evidence is not mutated.
12. ForgePilot packet and evidence are committed.

## Non-goals

This packet does not consume approval.

This packet does not create approval consumption evidence.

This packet does not enable execution.

This packet does not make start callable.

This packet does not add start to supported operations.

This packet does not implement `PRESENT_GUARDED`.

This packet does not implement `CALLABLE_GUARDED`.

This packet does not perform a remote runner start.

This packet does not fix the newer full approval evidence contract fields from FP-MCP-067 / FP-MCP-072.

This packet does not mutate the FP-MCP-135 approval artifact.

This packet does not mutate the FP-MCP-139 pre-start evidence artifact.
