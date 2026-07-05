# FP-MCP-366A Runtime Validation Evidence

## Result

PASS.

The sanitized guarded sequencer observer is visible in the live ChatGPT-safe MCP Actions surface.

## Bridge State

- branch: feature/oauth-auth0
- commit: 32f49e6
- commit message: Expose sanitized guarded sequencer observer to safe surface
- working tree: clean before runtime validation

## Build and Restart

- pnpm build: PASS
- service restarted: yes
- service: forgepilot-chatgpt-mcp
- runtime PID after restart: 878792
- working directory: /home/ridasaidd/forgepilot-chatgpt-mcp

## Actions Manifest Evidence

The ChatGPT Actions UI listed forgepilot_observe_next_gate with public visibility.

Visible description:

Read-only observation of the guarded canary state. Returns exactly one next required gate, reason codes, and a truthful boundary. It does not expose follow-on tool arguments in the safe observer response, performs no gate action, writes no files, and has no side effects.

Required input fields:

- executionPacketId
- requestId
- modelId
- runMode
- executionBaseCommit
- branch
- targetWorkspaceId

Optional input fields:

- approvalPacketId
- approvalId
- clearanceId
- enablementId
- runnerCapabilityCheckedAt
- stateSnapshotAttemptId
- desiredApprovalPacketId

## Tool Discovery Evidence

api_tool discovery for observe returned one tool:

- forgepilot_observe_next_gate

## Runtime Diagnostics

- checkedAt: 2026-07-05T22:05:08.770Z
- pid: 878792
- cwd: /home/ridasaidd/forgepilot-chatgpt-mcp
- node: v24.4.1
- platform: linux
- arch: arm64

Boundary:

- readOnly: true
- secretsDumped: false
- executionAuthorized: false
- approvalConsumed: false
- disableSwitchCleared: false
- runnerStartEndpointContacted: false
- opencodeStarted: false
- fp027CanaryRun: false

Reasons:

- CONFIGURED_PNPM_BIN_USES_ENV_NODE
- OPENCODE_CHECK_SKIPPED

## Caveat

The observer was not invoked with a request tuple during this runtime validation. This checkpoint validates live visibility and runtime boundary only.

## Non-Execution Statement

No OpenCode start, runner start contact, approval consumption, disable-switch clearing, FP-027 canary run, or execution authorization occurred.
