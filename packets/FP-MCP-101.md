# FP-MCP-101 — Preflight Tool Block Reproduction and Local CLI Fallback

## Task

Document and define a fallback path for guarded preflight observation when the MCP preflight tool call is blocked before reaching ForgePilot.

## Goal

Ensure ForgePilot can still record preflight evidence when the MCP transport or platform blocks a tool call before ForgePilot receives it.

This packet answers one question:

How should ForgePilot observe guarded preflight when the MCP tool invocation is blocked outside ForgePilot?

## Background

FP-MCP-100 attempted to observe readiness for the FP-MCP-099 request artifact.

Successful observations:

- disable switch status observed
- execution enablement status observed
- local request handoff validation observed
- remote runner validate-request observed

The guarded preflight tool call was not observed.

The tool call was blocked before reaching ForgePilot, so ForgePilot returned no preflight payload.

FP-MCP-100 correctly recorded this as:

- PARTIAL — PREFLIGHT TOOL CALL NOT OBSERVED

The next smallest step is to define a local fallback path for preflight evidence.

## Scope

Allowed:

- Document the MCP preflight tool block.
- Define local CLI fallback requirements.
- Define fallback evidence requirements.
- Define how local fallback evidence should be marked.
- Define safety invariants for local fallback.
- Record evidence under `runs/FP-MCP-101/`.

Forbidden:

- Do not implement the fallback yet.
- Do not create approval evidence.
- Do not consume approval.
- Do not enable execution.
- Do not relax the global disable switch.
- Do not contact the runner start endpoint.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create a runner run id.
- Do not mutate request artifacts.
- Do not change production MCP behavior.

## Request Context

The affected request was:

- packetId: FP-MCP-099
- requestId: REQ-20260630T115752019Z-25b7c1b8
- modelId: deepseek-v4-pro-high
- runMode: DESIGN_ONLY

## Observed Block

The MCP tool invocation for guarded preflight did not reach ForgePilot.

Therefore:

- no preflight schema was returned
- no gate payload was observed
- no ForgePilot preflight result can be claimed
- no execution was started

## Required Clarification

Define how ForgePilot should distinguish:

1. ForgePilot preflight failure
2. ForgePilot preflight blocker
3. MCP/platform transport block before ForgePilot receives the request
4. local CLI fallback preflight observation

## Required Fallback Contract

A local CLI fallback must:

- run on the ForgePilot host
- use the same repository checkout
- use the same request artifact
- use the same validation logic as MCP preflight, or explicitly declare any divergence
- never contact the runner start endpoint
- never start OpenCode
- never create a runner run id
- record whether it contacted the runner capabilities endpoint
- record whether it contacted validate-request
- record startEndpointContacted as false
- record opencodeStarted as false
- record executionStarted as false
- record executionAllowedNow
- record all gates and reasons
- record the command used
- record repo commit and working tree status
- record tool/version identity if available

## Required Evidence Classification

Fallback evidence must be clearly marked as:

- source: local CLI fallback
- transport: local shell
- mcpToolObserved: false
- forgePilotPreflightObserved: true or false
- fallbackUsed: true
- fallbackReason: MCP_PREFLIGHT_TOOL_CALL_BLOCKED_BEFORE_FORGEPILOT
- trust tier: not higher than local observed artifact unless separately verified

## Required Safety Results

Verification must show:

- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false
- no approval created
- no approval consumed
- no runner run id created
- global disable switch unchanged
- runner execution unchanged
- OpenCode execution unchanged

## Evidence

Record:

- `runs/FP-MCP-101/preflight-tool-block-and-cli-fallback.md`
- `runs/FP-MCP-101/verification.txt`

## Success Criteria

This packet is successful if:

1. The FP-MCP-100 preflight tool block is documented.
2. The difference between transport block and ForgePilot preflight result is explicit.
3. A local CLI fallback evidence contract is defined.
4. Safety invariants are preserved.
5. No execution is started.
6. The next implementation packet is identified.

## Non-goals

This packet does not implement the local CLI fallback.

This packet does not create approval evidence.

This packet does not consume approval.

This packet does not relax the disable switch.

This packet does not enable runner execution.

This packet does not enable OpenCode execution.

This packet does not perform a remote runner start.

This packet does not implement FP-MCP-099.
