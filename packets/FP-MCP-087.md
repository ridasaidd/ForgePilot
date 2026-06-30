# FP-MCP-087 — Remote Runner Capability Configuration Observation

## Task

Configure or observe the ForgePilot MCP remote runner capability path without enabling execution or contacting the runner start endpoint.

## Goal

Determine whether the MCP bridge can safely observe the remote runner capabilities endpoint.

This packet answers one question:

Can ForgePilot MCP read runner capability metadata without starting OpenCode or authorizing execution?

## Background

FP-MCP-085 recorded the execution readiness inventory.

Observed runner state:

- runnerConfigured: false
- runnerReachable: false
- supportedOperations: []
- runnerProtocolVersion: null
- reasons:
  - RUNNER_UNCONFIGURED

FP-MCP-086 fixed the endpoint validator failed-path output completeness bug.

The next smallest gate is runner capability observation, not execution.

## Scope

Allowed:

- Configure the MCP bridge environment for the remote runner base URL if needed.
- Configure non-secret runner capability access if needed.
- Restart the MCP bridge service after environment changes.
- Call `forgepilot_get_remote_runner_status`.
- Contact only the runner capabilities endpoint.
- Record observed runner capability metadata.
- Record verification artifacts under `runs/FP-MCP-087/`.

Forbidden:

- Do not enable execution.
- Do not relax the global disable switch.
- Do not contact the runner start endpoint.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create a runner run id.
- Do not consume approval.
- Do not create real approval evidence.
- Do not mutate approval evidence.
- Do not mutate request artifacts.
- Do not refactor MCP bridge code unless required solely to make capabilities observation schema-complete.

## Required Observation

Record:

- MCP bridge runner base URL configuration state.
- Whether the runner capabilities endpoint is reachable.
- Runner protocol version, if returned.
- Runner version, if returned.
- Supported operations, if returned.
- Supported run modes, if returned.
- Allowed models, if returned.
- Whether execution is enabled or disabled.
- Whether only the capabilities endpoint was contacted.
- Whether OpenCode was started.

## Required Safety Results

Verification must show:

- `executionEnabled: false`
- `executionStarted: false`
- OpenCode not started
- runner start endpoint not contacted
- global disable switch still active unless explicitly observed otherwise
- no approval consumed

## Evidence

Record:

- `runs/FP-MCP-087/runner-capability-observation.md`
- `runs/FP-MCP-087/verification.txt`

## Success Criteria

This packet is successful if:

1. The runner capability path is observed.
2. The observation distinguishes configured/unconfigured from reachable/unreachable.
3. The observation records supported runner metadata if available.
4. Only the capabilities endpoint is contacted.
5. No execution is started.
6. No runner start endpoint is contacted.
7. No approval is consumed.

## Non-goals

This packet does not authorize execution.

This packet does not start OpenCode.

This packet does not implement the runner start path.

This packet does not consume approval.

This packet does not admit model output.
