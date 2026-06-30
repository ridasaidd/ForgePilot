# FP-MCP-103 — Runner Start Capability Gap Observation

## Task

Observe and document the current remote runner capability gap after FP-MCP-102 request validation.

## Goal

Confirm whether ForgePilot currently has a remote runner start capability available for controlled OpenCode execution.

This packet answers one question:

Can ForgePilot proceed from validated request artifacts to remote runner execution, or is start capability still absent?

## Background

FP-MCP-099 created a validated implementation request for targetExecutionCommit versus evidenceLedgerCommit preflight fields.

FP-MCP-100 observed readiness for FP-MCP-099 and confirmed execution remained blocked.

FP-MCP-101 defined a local CLI fallback contract after the MCP preflight tool call was blocked before reaching ForgePilot.

FP-MCP-102 created and validated a request artifact for implementing the local guarded preflight fallback command.

FP-MCP-102 request validation passed both:

- local remote-runner handoff validation
- authenticated remote runner validate-request

However, previous enablement observations showed the remote runner advertised only:

- capabilities
- validate-request

The runner did not advertise a start execution operation.

The next smallest observation is to record whether this capability gap still exists.

## Scope

Allowed:

- Read repository status.
- Read remote runner capability status.
- Read OpenCode readiness status.
- Read execution disable switch status.
- Read execution enablement status.
- Validate FP-MCP-102 request artifact locally.
- Validate FP-MCP-102 request artifact through remote runner validate-request endpoint.
- Record observations under `runs/FP-MCP-103/`.

Forbidden:

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
- Do not implement runner start capability.

## Request Context

The request under observation is:

- packetId: FP-MCP-102
- requestId: REQ-20260630T123936836Z-a102a576
- modelId: deepseek-v4-pro-high
- runMode: DESIGN_ONLY

## Required Observation

Record:

- repository status
- remote runner capability status
- supported runner operations
- whether start execution is advertised
- supported run modes
- allowed models
- OpenCode readiness status
- execution disable switch status
- execution enablement status
- local request validation result
- remote validate-request result
- safety fields

## Required Safety Results

Verification must show:

- executionAllowedNow: false unless unexpectedly changed elsewhere
- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false
- runnerExecutionEnabled: false
- opencodeExecutionEnabled: false
- no approval created
- no approval consumed
- no runner run id created

## Evidence

Record:

- `runs/FP-MCP-103/runner-start-capability-gap.md`
- `runs/FP-MCP-103/verification.txt`

## Success Criteria

This packet is successful if:

1. Runner capabilities are observed.
2. The presence or absence of start capability is explicit.
3. Execution enablement blockers are recorded.
4. FP-MCP-102 validation-only readiness remains clear.
5. No execution is started.
6. No runner start endpoint is contacted.
7. The next smallest implementation or observation packet is identified.

## Non-goals

This packet does not implement runner start capability.

This packet does not authorize execution.

This packet does not create approval evidence.

This packet does not consume approval.

This packet does not relax the disable switch.

This packet does not enable runner execution.

This packet does not enable OpenCode execution.

This packet does not perform a remote runner start.

This packet does not implement FP-MCP-102.
