# FP-MCP-096 — Fresh Consumed Approval Preflight Isolation

## Task

Create, commit, validate, consume, and re-observe a fresh real approval evidence artifact before expiration to isolate the consumed-approval preflight gate.

## Goal

Determine whether guarded execution preflight rejects a consumed approval when the approval is otherwise valid, current, committed, unexpired, and correctly scoped.

This packet answers one question:

Does preflight block an otherwise valid approval solely because append-only consumption evidence marks it consumed?

## Background

FP-MCP-095 re-observed preflight using the FP-MCP-092 approval after consumption.

The consumed approval did not permit execution, but the intended isolated consumed-approval state was not reached because the approval had already become invalid for the current preflight context.

Observed blockers included:

- APPROVAL_SCOPE_MISMATCH
- APPROVAL_BASE_COMMIT_BINDING_INVALID
- APPROVAL_COMMIT_BINDING_INVALID
- APPROVAL_REQUEST_BINDING_INVALID
- APPROVAL_TEXT_INVALID
- APPROVAL_EXPIRED

The next smallest gate is to create a fresh approval bound to the current commit, commit it, validate it, consume it, commit consumption evidence, and immediately re-run preflight before expiration.

## Scope

Allowed:

- Create one fresh scoped real approval evidence artifact.
- Commit the approval artifact.
- Validate the committed approval artifact.
- Record append-only consumption evidence.
- Commit the consumption artifact.
- Re-run guarded execution preflight with the consumed approval id before expiration.
- Record whether preflight blocks specifically because the approval is consumed.
- Record observations under `runs/FP-MCP-096/`.

Forbidden:

- Do not mutate approval artifacts.
- Do not enable execution.
- Do not relax the global disable switch.
- Do not contact the runner start endpoint.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create a runner run id.
- Do not mutate request artifacts.
- Do not change production MCP behavior beyond recording approval and consumption evidence artifacts.

## Request Under Test

Use the existing committed request artifact:

- request packetId: FP-MCP-084
- requestId: REQ-20260630T094727908Z-630a4f0d
- modelId: deepseek-v4-pro-high
- runMode: DESIGN_ONLY
- branch: main

Bind the fresh approval to the current committed repository state at approval creation time.

## Required Sequence

1. Read current repository status.
2. Create fresh real approval evidence with a short but sufficient expiration.
3. Commit the approval artifact.
4. Validate the committed approval artifact.
5. Record append-only consumption evidence.
6. Commit the consumption artifact.
7. Immediately run guarded execution preflight with the consumed approval id.
8. Record whether the consumed approval is rejected as consumed.

## Required Observation

Record:

- approval creation result
- approval artifact id, path, and hash
- committed approval validation result
- consumption evidence id, path, and hash
- post-consumption preflight result
- approval validation state inside preflight
- consumption evidence state inside preflight
- whether approval is blocked as consumed
- all preflight gates and reasons
- execution safety fields

## Required Safety Results

Verification must show:

- executionPermitted: false
- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false
- global disable switch remains active
- runnerExecutionEnabled remains false
- opencodeExecutionEnabled remains false
- no runner run id created
- approval artifacts not mutated

## Evidence

Record:

- `runs/FP-MCP-096/fresh-consumed-approval-preflight.md`
- `runs/FP-MCP-096/verification.txt`

## Success Criteria

This packet is successful if:

1. A fresh real approval artifact is created and committed.
2. The committed approval validates before consumption.
3. Append-only consumption evidence is recorded and committed.
4. Preflight is run before expiration.
5. Preflight rejects the approval as consumed, or records a precise blocker if another gate prevents isolation.
6. No execution is started.
7. No runner start endpoint is contacted.
8. No approval artifact is mutated.

## Non-goals

This packet does not relax the disable switch.

This packet does not enable execution.

This packet does not start OpenCode.

This packet does not perform a remote runner start.

This packet does not admit model output.
