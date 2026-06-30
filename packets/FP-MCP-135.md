# FP-MCP-135 — Matching Approval Evidence For Targeted Request

## Task

Create real-shaped human approval evidence bound to the FP-MCP-134 request artifact's explicit `targetExecutionCommit`, then evaluate it through the local guarded preflight path.

## Goal

Verify that approval evidence can bind cleanly to a request artifact with explicit target commit semantics while execution remains blocked.

This packet answers one question:

Can ForgePilot produce a matching request + approval evidence pair where the approval target commit equals the request target execution commit?

## Background

FP-MCP-131 selected approval binding Option D:

```text
approval evidence binds to approvedTargetExecutionCommit
```

FP-MCP-132 implemented target commit comparison in the local guarded preflight evaluator.

FP-MCP-133 defined explicit request target commit semantics:

```text
request.targetExecutionCommit
```

FP-MCP-134 updated request artifact creation so new request artifacts include:

```text
targetExecutionCommit
approvedTargetExecutionCommit
```

FP-MCP-134 produced a positive verification request artifact:

```text
requestId: REQ-20260630T202005438Z-86d20df4
baseCommit: bbf930a
targetExecutionCommit: bbf930a
approvedTargetExecutionCommit: bbf930a
```

FP-MCP-135 creates approval evidence scoped to that same target.

## Target Request Artifact

```text
packetId: FP-MCP-134
requestId: REQ-20260630T202005438Z-86d20df4
modelId: deepseek-v4-pro-high
runMode: DESIGN_ONLY
branch: main
targetExecutionCommit: bbf930a
approvedTargetExecutionCommit: bbf930a
```

## Scope

Allowed:

- Create one real-shaped human approval evidence artifact.
- Bind it to the FP-MCP-134 request artifact.
- Bind it to `targetExecutionCommit: bbf930a`.
- Use canonical approval text.
- Use non-secret operator identity.
- Set a sufficient expiration window for this test.
- Commit the approval evidence artifact.
- Run the local guarded preflight report against the request + approval pair.
- Record the raw JSON report.
- Record whether `humanApprovalEvidence` target binding passes.
- Record whether expiration passes or fails.
- Record safety fields.
- Record evidence under `runs/FP-MCP-135/`.

Forbidden:

- Do not mutate the FP-MCP-134 request artifact.
- Do not mutate prior approval artifacts.
- Do not enable execution.
- Do not make start callable.
- Do not add start to `supportedOperations`.
- Do not contact the runner start endpoint.
- Do not call `/runner/start-run`.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create runner run id.
- Do not consume approval.
- Do not create approval consumption evidence.
- Do not mutate pre-start evidence.
- Do not mutate state snapshot evidence.
- Do not implement `PRESENT_GUARDED`.
- Do not implement `CALLABLE_GUARDED`.
- Do not implement real guarded start.
- Do not relax the disable switch.

## Required Approval Artifact

Create one artifact under:

```text
runs/FP-MCP-135/approvals/<APPROVAL_ID>.json
```

It must include:

```text
schemaVersion: FP-MCP-125
artifactType: human-approval-evidence
artifactVersion: human-approval-evidence-v1
approvalState: VALID
approvalKind: GUARDED_START_PREFLIGHT_APPROVAL
approvalText: I approve this ForgePilot guarded start request.
canonicalApprovalText: I approve this ForgePilot guarded start request.
approvedAction: ALLOW_ONE_GUARDED_REMOTE_RUNNER_EXECUTION_ATTEMPT
scope.packetId: FP-MCP-134
scope.requestId: REQ-20260630T202005438Z-86d20df4
scope.modelId: deepseek-v4-pro-high
scope.runMode: DESIGN_ONLY
scope.branch: main
scope.approvedTargetExecutionCommit: bbf930a
scope.repoCommit: bbf930a
approvalUsableForExecution: true
humanApprovalRecorded: true
singleUse: true
consumedAt: null
approvalConsumed: false
approvalConsumptionCreated: false
executionStarted: false
opencodeStarted: false
startEndpointContacted: false
runnerStartEndpointContacted: false
requestArtifactMutated: false
```

`scope.repoCommit` is retained for compatibility, but the preferred binding field is:

```text
scope.approvedTargetExecutionCommit
```

## Expected Local Preflight Behavior

Run:

```text
node ~/forgepilot-chatgpt-mcp/scripts/guarded-preflight-report.mjs \
  --packet-id FP-MCP-134 \
  --request-id REQ-20260630T202005438Z-86d20df4 \
  --approval-id <APPROVAL_ID>
```

Preferred approval evidence result:

```text
humanApprovalEvidence:
  evaluated: true
  passed: true
  state: PASSED
  reasons: []
  approvalTargetExecutionCommit: bbf930a
  requestTargetExecutionCommit: bbf930a
```

If the current local preflight skeleton still hardcodes FP-MCP-117 in approval scope validation, the result may show:

```text
HUMAN_APPROVAL_EVIDENCE_PACKET_SCOPE_MISMATCH
```

If so, record it honestly. That would indicate the local skeleton needs one more generalization from fixed historical packet id to the supplied request packet id.

## Required Safety Fields

Regardless of approval evidence result, the report must preserve:

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

## Evidence

Record:

- `runs/FP-MCP-135/approval-artifact.md`
- `runs/FP-MCP-135/local-preflight-report.json`
- `runs/FP-MCP-135/local-preflight-report.md`
- `runs/FP-MCP-135/verification.txt`

## Success Criteria

This packet is successful if:

1. A real-shaped approval evidence artifact is created.
2. Approval evidence binds to `approvedTargetExecutionCommit: bbf930a`.
3. Approval evidence is committed.
4. Local preflight report is captured.
5. `humanApprovalEvidence` is evaluated.
6. Target commit binding result is recorded honestly.
7. Safety fields remain non-executing.
8. Runner start endpoint is not contacted.
9. OpenCode is not started.
10. Approval is not consumed.
11. Request artifact is not mutated.
12. Verification passes.

## Non-goals

This packet does not consume approval.

This packet does not implement approval consumption.

This packet does not enable execution.

This packet does not make start callable.

This packet does not add start to supported operations.

This packet does not implement `PRESENT_GUARDED`.

This packet does not implement `CALLABLE_GUARDED`.

This packet does not perform a remote runner start.
