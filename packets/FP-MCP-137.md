# FP-MCP-137 — Generalize Human Approval Packet Scope Binding

## Task

Generalize local guarded preflight human approval scope validation so it binds to the request artifact's packet id instead of a historical fixed packet id.

## Goal

Remove the remaining packet-scope mismatch observed in FP-MCP-136 while preserving explicit target commit binding and all non-execution safety guarantees.

This packet answers one question:

Can local guarded preflight validate human approval packet scope against the supplied request artifact rather than a hardcoded historical packet id?

## Background

FP-MCP-134 created a request artifact with explicit target fields:

```text
packetId: FP-MCP-134
requestId: REQ-20260630T202005438Z-86d20df4
targetExecutionCommit: bbf930a
approvedTargetExecutionCommit: bbf930a
```

FP-MCP-135 created matching approval evidence:

```text
scope.packetId: FP-MCP-134
scope.requestId: REQ-20260630T202005438Z-86d20df4
scope.approvedTargetExecutionCommit: bbf930a
scope.repoCommit: bbf930a
```

FP-MCP-136 normalized local preflight gate shape and confirmed target binding matched:

```text
approvalTargetExecutionCommit: bbf930a
requestTargetExecutionCommit: bbf930a
```

But `humanApprovalEvidence` still failed with:

```text
HUMAN_APPROVAL_EVIDENCE_PACKET_SCOPE_MISMATCH
```

This indicates that the local preflight skeleton still has a historical packet-scope assumption rather than deriving expected packet scope from the request artifact.

## Decision

Human approval packet scope must be validated against the request artifact being evaluated.

Expected approval scope should be derived from:

```text
requestArtifact.packetId
requestArtifact.requestId
requestArtifact.requestedModelId or requestArtifact.modelId
requestArtifact.requestedRunMode or requestArtifact.runMode
requestArtifact.repoBranch
requestArtifact.targetExecutionCommit
```

It must not be hardcoded to any historical packet id.

## Scope

Allowed:

- Modify `scripts/guarded-preflight-report.mjs` in the MCP bridge repository.
- Generalize human approval packet-scope validation.
- Use request artifact data to derive expected approval scope.
- Preserve explicit target commit binding behavior from FP-MCP-132.
- Preserve normalized gate object output from FP-MCP-136.
- Run local preflight against the FP-MCP-134 request and FP-MCP-135 approval pair.
- Record a fresh report under `runs/FP-MCP-137/`.
- Commit bridge implementation and ForgePilot evidence.

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

Use the known matching pair:

```text
request packet id: FP-MCP-134
request id: REQ-20260630T202005438Z-86d20df4
approval id: APPROVAL-20260630T202924964Z-65d76e90
targetExecutionCommit: bbf930a
approvedTargetExecutionCommit: bbf930a
```

## Expected Result

The fresh local preflight report should show:

```text
gates.humanApprovalEvidence.evaluated: true
gates.humanApprovalEvidence.reasons does not include HUMAN_APPROVAL_EVIDENCE_PACKET_SCOPE_MISMATCH
approvalTargetExecutionCommit: bbf930a
requestTargetExecutionCommit: bbf930a
```

If no other approval evidence issues remain, `humanApprovalEvidence` may pass.

If another issue remains, record it honestly.

## Required Safety Fields

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

- `runs/FP-MCP-137/implementation-evidence.md`
- `runs/FP-MCP-137/local-preflight-report.json`
- `runs/FP-MCP-137/local-preflight-report.md`
- `runs/FP-MCP-137/verification.txt`

## Success Criteria

This packet is successful if:

1. Human approval expected packet scope is derived from the evaluated request artifact.
2. Historical fixed packet-scope assumptions are removed from the local preflight skeleton.
3. The FP-MCP-134 / FP-MCP-135 pair no longer fails with `HUMAN_APPROVAL_EVIDENCE_PACKET_SCOPE_MISMATCH`.
4. Target commit binding remains visible and matched.
5. Gate shape remains normalized.
6. Safety fields remain non-executing.
7. Bridge implementation is committed.
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
