# FP-MCP-138 — Human Approval Evidence Passing Gate Contract

## Task

Inspect the remaining `humanApprovalEvidence` blockers after FP-MCP-137 and define the exact conditions required for that gate to pass.

## Goal

Turn human approval evidence from a partially passing gate into a fully specified preflight gate that can pass without enabling execution.

This packet answers one question:

What remains before `gates.humanApprovalEvidence` can pass for the FP-MCP-134 request and FP-MCP-135 approval pair?

## Background

FP-MCP-134 created a request artifact with explicit target commit fields:

```text
requestId: REQ-20260630T202005438Z-86d20df4
targetExecutionCommit: bbf930a
approvedTargetExecutionCommit: bbf930a
```

FP-MCP-135 created matching approval evidence:

```text
approvalId: APPROVAL-20260630T202924964Z-65d76e90
scope.packetId: FP-MCP-134
scope.requestId: REQ-20260630T202005438Z-86d20df4
scope.approvedTargetExecutionCommit: bbf930a
scope.repoCommit: bbf930a
```

FP-MCP-136 normalized local preflight gate shape:

```text
gates: object
rawGates: preserved original list when applicable
```

FP-MCP-137 generalized human approval packet scope binding:

```text
expected approval packet scope derives from requestData.packetId
```

FP-MCP-137 removed:

```text
HUMAN_APPROVAL_EVIDENCE_PACKET_SCOPE_MISMATCH
```

The next step is to inspect and define the remaining blocker, if any, for:

```text
gates.humanApprovalEvidence
```

## Scope

Allowed:

- Run local guarded preflight against the FP-MCP-134 request and FP-MCP-135 approval pair.
- Inspect `gates.humanApprovalEvidence`.
- Record all remaining reasons and observations.
- Define the complete passing contract for `humanApprovalEvidence`.
- If the remaining issue is only a local evaluator mismatch against valid artifact fields, patch the local evaluator.
- Preserve target commit binding semantics.
- Preserve normalized gate shape.
- Record evidence under `runs/FP-MCP-138/`.
- Commit bridge implementation only if needed.
- Commit ForgePilot evidence.

Forbidden:

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
- Do not mutate request artifacts.
- Do not mutate approval artifacts.
- Do not mutate pre-start evidence.
- Do not mutate state snapshot evidence.
- Do not implement `PRESENT_GUARDED`.
- Do not implement `CALLABLE_GUARDED`.
- Do not implement real guarded start.
- Do not relax the disable switch.

## Verification Pair

Use:

```text
request packet id: FP-MCP-134
request id: REQ-20260630T202005438Z-86d20df4
approval id: APPROVAL-20260630T202924964Z-65d76e90
targetExecutionCommit: bbf930a
approvedTargetExecutionCommit: bbf930a
```

## Human Approval Passing Contract

For the gate to pass, the local evaluator must require:

```text
approval artifact exists
approval artifact is valid JSON
approval artifact type is human approval evidence
approval state is VALID
approval text matches canonical expected text
approval action is the expected guarded-start approval action
approval is not expired
approval is single-use
approval is not consumed
approval is not revoked
approval is not quarantined
scope.packetId matches request packet id
scope.requestId matches request id
scope.modelId matches request model id
scope.runMode matches request run mode
scope.approvedTargetExecutionCommit matches request.targetExecutionCommit
compatibility scope.repoCommit, if present, matches target commit
operator identity is non-secret
approval artifact remains unmutated
request artifact remains unmutated
```

The gate must not require:

```text
execution enabled
runner execution enabled
OpenCode execution enabled
disable switch inactive
approval consumed
approval consumption evidence created
pre-start evidence present
state snapshot evidence present
runner start endpoint contacted
```

Those belong to other gates.

## Expected Result

Preferred result after FP-MCP-138:

```text
gates.humanApprovalEvidence.evaluated: true
gates.humanApprovalEvidence.passed: true
gates.humanApprovalEvidence.state: PASSED
gates.humanApprovalEvidence.reasons: []
```

If another blocker remains, record it honestly and define the next repair packet.

## Safety Requirements

The report must preserve:

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

- `runs/FP-MCP-138/human-approval-gate-contract.md`
- `runs/FP-MCP-138/local-preflight-report.json`
- `runs/FP-MCP-138/local-preflight-report.md`
- `runs/FP-MCP-138/verification.txt`

## Success Criteria

This packet is successful if:

1. Remaining `humanApprovalEvidence` blockers are inspected and recorded.
2. Human approval passing contract is recorded.
3. Target commit binding remains visible and matched.
4. Packet scope mismatch remains absent.
5. Gate shape remains normalized.
6. Safety fields remain non-executing.
7. If evaluator patch is needed and safe, bridge implementation is committed.
8. ForgePilot evidence is committed.
9. Verification passes.

## Non-goals

This packet does not consume approval.

This packet does not implement approval consumption.

This packet does not enable execution.

This packet does not make start callable.

This packet does not add start to supported operations.

This packet does not implement `PRESENT_GUARDED`.

This packet does not implement `CALLABLE_GUARDED`.

This packet does not perform a remote runner start.
