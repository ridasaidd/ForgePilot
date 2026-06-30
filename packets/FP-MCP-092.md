# FP-MCP-092 — Scoped Real Approval Evidence Creation Observation

## Task

Create and validate one scoped real human approval evidence artifact without consuming approval, enabling execution, relaxing the disable switch, contacting the runner start endpoint, or starting OpenCode.

## Goal

Determine whether ForgePilot MCP can create a real, scoped, single-use human approval evidence artifact that satisfies the approval validator contract while remaining unconsumed and non-executing.

This packet answers one question:

Can real approval evidence be created and validated safely before any execution attempt is possible?

## Background

FP-MCP-090 observed non-authorizing dry-run approval fixture behavior.

FP-MCP-091 documented the real approval evidence contract.

The contract requires real approval evidence to distinguish itself from dry-run approval-shaped evidence by using the real approval artifact type, exact request scope binding, canonical approval text, valid approval state, committed artifact storage, non-quarantined state, bounded expiration, and single-use semantics.

This packet may create real approval evidence, but it must not consume approval or authorize execution by itself.

## Scope

Allowed:

- Create one scoped real approval evidence artifact.
- Validate the created approval evidence artifact.
- Record approval artifact id, path, hash, scope, expiration, and validator output.
- Record whether it is valid approval evidence.
- Record whether it remains unconsumed.
- Record whether execution remains blocked by independent gates.
- Record observations under `runs/FP-MCP-092/`.

Forbidden:

- Do not consume approval.
- Do not enable execution.
- Do not relax the global disable switch.
- Do not contact the runner start endpoint.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create a runner run id.
- Do not mutate request artifacts.
- Do not change production MCP behavior beyond creating the scoped approval evidence artifact.

## Approval Scope

Bind the approval exactly to the existing request artifact:

- request packetId: FP-MCP-084
- requestId: REQ-20260630T094727908Z-630a4f0d
- modelId: deepseek-v4-pro-high
- runMode: DESIGN_ONLY
- branch: main

Bind the approval to the current committed repository state at creation time.

## Required Canonical Approval Text

The real approval evidence artifact must use the exact canonical approval text required by the MCP tool and validator.

The text must bind:

- packet id
- request id
- model id
- run mode
- repository commit
- branch

The approval text must not be inferred after creation.

## Required Observation

Record:

- whether real approval recording was evaluated
- approval artifact id
- approval artifact path
- approval artifact hash
- approval scope
- operator boundary
- expiration timestamp
- single-use state
- validation result
- whether approval evidence is valid
- whether approval is usable for execution evidence
- whether approval is consumed
- whether approval is revoked
- whether approval is quarantined
- whether execution remains blocked by independent gates
- disable switch state
- runner execution enabled state
- OpenCode execution enabled state

## Required Safety Results

Verification must show:

- approvalCreated: true
- approvalConsumed: false
- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false
- global disable switch remains active
- runnerExecutionEnabled remains false
- opencodeExecutionEnabled remains false
- no runner run id created

## Evidence

Record:

- `runs/FP-MCP-092/real-approval-creation-observation.md`
- `runs/FP-MCP-092/verification.txt`

## Success Criteria

This packet is successful if:

1. One real approval evidence artifact is created.
2. The artifact is scoped to exactly one request, model, run mode, branch, and commit.
3. The artifact validates according to the real approval evidence contract.
4. The artifact remains unconsumed.
5. No execution is started.
6. No runner start endpoint is contacted.
7. The global disable switch remains active.
8. The next smallest gate is identified.

## Non-goals

This packet does not consume approval.

This packet does not relax the disable switch.

This packet does not enable execution.

This packet does not start OpenCode.

This packet does not admit model output.

This packet does not perform a remote runner start.
