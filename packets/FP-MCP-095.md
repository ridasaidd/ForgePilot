# FP-MCP-095 — Post-Consumption Preflight Re-Observation

## Task

Re-observe guarded execution preflight after append-only approval consumption evidence has been recorded.

## Goal

Determine whether guarded execution preflight correctly treats the FP-MCP-092 approval evidence as consumed after FP-MCP-094 recorded append-only consumption evidence.

This packet answers one question:

Does preflight reject or block a consumed approval while preserving execution safety?

## Background

FP-MCP-092 created one scoped real approval evidence artifact:

- approvalPacketId: FP-MCP-092
- approvalId: APPROVAL-20260630T112307543Z-5f55a9ce
- requestId: REQ-20260630T094727908Z-630a4f0d
- modelId: deepseek-v4-pro-high
- runMode: DESIGN_ONLY
- repoCommit: dbeded5
- branch: main

FP-MCP-093 revalidated the committed approval artifact.

Observed:

- approvalEvidenceValid: true
- approvalValid: true
- approvalUsableForExecution: true
- artifactCommitted: true
- approvalConsumed: false
- reasons: []

FP-MCP-094 recorded append-only approval consumption evidence.

Observed:

- approvalConsumptionRecorded: true
- consumptionId: CONSUMPTION-20260630T112907770Z-c3970483
- approvalConsumed: true
- approvalMutated: false
- executionAllowedNow: false
- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false

The next smallest gate is to re-observe preflight with the consumed approval id.

## Scope

Allowed:

- Validate guarded execution preflight using the consumed approval id.
- Observe approval validation state after consumption.
- Observe consumption evidence state.
- Record whether approval is rejected or blocked as consumed.
- Record execution safety fields.
- Record observations under `runs/FP-MCP-095/`.

Forbidden:

- Do not create new approval evidence.
- Do not consume approval again.
- Do not mutate approval evidence.
- Do not enable execution.
- Do not relax the global disable switch.
- Do not contact the runner start endpoint.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create a runner run id.
- Do not mutate request artifacts.
- Do not change production MCP behavior.

## Request and Approval Under Test

Request:

- packetId: FP-MCP-084
- requestId: REQ-20260630T094727908Z-630a4f0d

Approval:

- approvalPacketId: FP-MCP-092
- approvalId: APPROVAL-20260630T112307543Z-5f55a9ce

Consumption evidence:

- consumptionPacketId: FP-MCP-094
- consumptionId: CONSUMPTION-20260630T112907770Z-c3970483

## Required Observation

Record:

- preflight result
- gate states
- reasons
- approval validation state
- approval consumed state
- consumption evidence state
- whether consumed approval is usable for execution
- whether execution remains blocked
- disable switch state
- runner execution enabled state
- OpenCode execution enabled state
- start endpoint contact state

## Required Safety Results

Verification must show:

- executionPermitted: false
- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false
- consumed approval does not authorize execution
- global disable switch remains active
- runnerExecutionEnabled remains false
- opencodeExecutionEnabled remains false
- no runner run id created

## Evidence

Record:

- `runs/FP-MCP-095/post-consumption-preflight.md`
- `runs/FP-MCP-095/verification.txt`

## Success Criteria

This packet is successful if:

1. Preflight is evaluated with the consumed approval id.
2. Consumption state is observed.
3. Consumed approval does not permit execution.
4. No execution is started.
5. No runner start endpoint is contacted.
6. No approval evidence is mutated.
7. The next smallest gate is identified.

## Non-goals

This packet does not create approval evidence.

This packet does not consume approval.

This packet does not relax the disable switch.

This packet does not enable execution.

This packet does not start OpenCode.

This packet does not perform a remote runner start.

This packet does not admit model output.
