# FP-MCP-094 — Approval Consumption Evidence Observation

## Task

Record append-only human approval consumption evidence for the committed FP-MCP-092 approval artifact without enabling execution, relaxing the disable switch, contacting the runner start endpoint, or starting OpenCode.

## Goal

Determine whether ForgePilot MCP can consume valid approval evidence through an append-only consumption artifact while preserving execution safety gates.

This packet answers one question:

Can approval consumption be recorded as evidence without mutating approval evidence or starting execution?

## Background

FP-MCP-092 created one scoped real human approval evidence artifact.

Created approval:

- approvalPacketId: FP-MCP-092
- approvalId: APPROVAL-20260630T112307543Z-5f55a9ce
- approvalPath: runs/FP-MCP-092/approvals/APPROVAL-20260630T112307543Z-5f55a9ce.json

FP-MCP-093 revalidated the committed approval artifact.

Observed:

- approvalEvidenceValid: true
- approvalValid: true
- approvalUsableForExecution: true
- artifactCommitted: true
- approvalConsumed: false
- executionAllowedNow: false
- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false
- reasons: []

The next smallest gate is approval consumption observation.

## Scope

Allowed:

- Record append-only approval consumption evidence.
- Validate that approval consumption evidence exists.
- Record consumption artifact id, path, hash, and validation state.
- Record that the original approval artifact was not mutated.
- Record that execution remains blocked by independent gates.
- Record observations under `runs/FP-MCP-094/`.

Forbidden:

- Do not mutate the approval artifact.
- Do not create another real approval artifact.
- Do not enable execution.
- Do not relax the global disable switch.
- Do not contact the runner start endpoint.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create a runner run id.
- Do not mutate request artifacts.
- Do not change production MCP behavior beyond recording append-only consumption evidence.

## Approval Artifact Under Consumption Observation

- approvalPacketId: FP-MCP-092
- approvalId: APPROVAL-20260630T112307543Z-5f55a9ce
- requestId: REQ-20260630T094727908Z-630a4f0d
- modelId: deepseek-v4-pro-high
- runMode: DESIGN_ONLY
- repoCommit: dbeded5
- branch: main

## Required Observation

Record:

- whether consumption evidence recording was evaluated
- whether consumption evidence was recorded
- consumption evidence id
- consumption evidence path
- consumption evidence hash
- whether consumption evidence is valid
- whether original approval artifact was mutated
- whether approval is now considered consumed by derived evidence
- whether execution remains blocked
- disable switch state
- runner execution enabled state
- OpenCode execution enabled state

## Required Safety Results

Verification must show:

- approval artifact not mutated
- executionAllowedNow: false
- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false
- global disable switch remains active
- runnerExecutionEnabled remains false
- opencodeExecutionEnabled remains false
- no runner run id created

## Evidence

Record:

- `runs/FP-MCP-094/approval-consumption-observation.md`
- `runs/FP-MCP-094/verification.txt`

## Success Criteria

This packet is successful if:

1. Append-only consumption evidence is recorded.
2. The original approval artifact is not mutated.
3. Consumption state is observable.
4. No execution is started.
5. No runner start endpoint is contacted.
6. The global disable switch remains active.
7. The next smallest gate is identified.

## Non-goals

This packet does not relax the disable switch.

This packet does not enable execution.

This packet does not start OpenCode.

This packet does not perform a remote runner start.

This packet does not admit model output.
