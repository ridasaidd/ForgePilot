# FP-MCP-139 — Pre-Start Evidence For Targeted Request

## Task

Create fresh non-executing pre-start evidence for the targeted FP-MCP-134 request and its matching FP-MCP-135 approval.

## Goal

Ensure the guarded preflight path can evaluate pre-start evidence for a target-bound request without enabling execution, starting OpenCode, contacting the runner start endpoint, consuming approval, or mutating existing request or approval artifacts.

This packet answers one question:

Can ForgePilot record pre-start evidence for a targeted guarded request while preserving the execution-disabled safety boundary?

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

FP-MCP-137 generalized human approval packet scope binding so approval scope is derived from the request artifact.

FP-MCP-138 bound approval commit checks to the request target commit rather than current repository HEAD.

After FP-MCP-138, current repository HEAD drift must remain observation-only. It must not invalidate approval evidence that is correctly bound to the request target execution commit.

## Decision

Pre-start evidence for a targeted request must be recorded as a fresh observation for the target-bound request.

The evidence must preserve:

```text
request packet id
request id
approval id
model id
run mode
target execution commit
approved target execution commit
current repository commit
execution-disabled state
runner start endpoint contact state
OpenCode start state
approval consumption state
request mutation state
approval mutation state
```

Current repository HEAD may be observed, but it must not replace the target execution commit as the binding value.

## Scope

Allowed:

- Create fresh pre-start evidence for the FP-MCP-134 targeted request.
- Use the known FP-MCP-135 approval id as non-consuming evidence context.
- Run non-executing local guarded preflight.
- Record local preflight output for FP-MCP-139.
- Record verification output for FP-MCP-139.
- Record whether `preStartEvidence` passes or remains blocked.
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
- Do not create a runner run id.
- Do not consume approval.
- Do not create approval consumption evidence.
- Do not mutate existing request artifacts.
- Do not mutate existing approval artifacts.
- Do not mutate existing FP-MCP-117 pre-start evidence.
- Do not mutate existing state snapshot evidence.
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

## Evidence Location

Record FP-MCP-139 evidence under:

```text
runs/FP-MCP-139/
```

The packet may also create or refresh request-scoped pre-start evidence at the established request pre-start evidence path if the local preflight evaluator requires that location.

If a request-scoped pre-start evidence path is used, it must be for the FP-MCP-134 request only:

```text
runs/FP-MCP-134/pre-start-evidence/REQ-20260630T202005438Z-86d20df4.json
```

Do not mutate older FP-MCP-117-era pre-start evidence.

## Required Evidence Files

Record:

```text
runs/FP-MCP-139/pre-start-evidence-contract.md
runs/FP-MCP-139/local-preflight-report.json
runs/FP-MCP-139/local-preflight-report.md
runs/FP-MCP-139/verification.txt
```

If a request-scoped pre-start evidence artifact is created, record its path and SHA-256 in the FP-MCP-139 evidence.

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
gates.humanApprovalEvidence is object-valued when emitted
```

The report must record pre-start evidence state and reasons.

If `preStartEvidence` still fails or remains incomplete, the reasons must be recorded honestly.

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
```

Any observation of runner capabilities must not contact the runner start endpoint.

Any observation of OpenCode readiness must not start OpenCode.

## Success Criteria

This packet is successful if:

1. Fresh pre-start evidence is recorded or the remaining pre-start blocker is precisely identified.
2. Local guarded preflight is run without execution.
3. The pre-start evidence gate is evaluated and recorded.
4. Target commit binding remains tied to `bbf930a`.
5. Human approval target binding does not regress to current-HEAD comparison.
6. Safety fields remain non-executing.
7. Existing request artifacts are not mutated.
8. Existing approval artifacts are not mutated.
9. ForgePilot packet and evidence are committed.

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
