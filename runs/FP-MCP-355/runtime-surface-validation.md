# FP-MCP-355 Runtime Surface Validation Evidence

## Result

Runtime validation confirmed the FP-MCP-354 safe surface behavior.

## Safe Surface

- Expected visible safe tools: 11
- Observed visible safe tools: 11
- Broad tools visible by default: false
- Checkpoint recorder visible by default: false
- Restored service environment: FORGEPILOT_MCP_SURFACE=chatgpt-safe

## Safe Runtime Diagnostics

- checkedAt: 2026-07-05T12:41:19.680Z
- pid: 859211
- cwd: /home/ridasaidd/forgepilot-chatgpt-mcp
- nodeVersion: v24.4.1
- readOnly: true
- opencodeStarted: false
- runnerStartEndpointContacted: false

## Post-Restore Diagnostics

A later safe-surface check observed:

- checkedAt: 2026-07-05T13:19:53.899Z
- pid: 860402
- cwd: /home/ridasaidd/forgepilot-chatgpt-mcp
- nodeVersion: v24.4.1
- readOnly: true
- opencodeStarted: false
- runnerStartEndpointContacted: false
- executionAuthorized: false
- approvalConsumed: false
- disableSwitchCleared: false

## Temporary Dev Surface Observation

FORGEPILOT_MCP_SURFACE=dev exposed broader tools only after explicit systemd override, daemon reload, service restart, and Actions refresh. The per-call ChatGPT approval popup flagged ConfigOverride risk.

## Recorder Failure

Attempts to record FP-MCP-355 through forgepilot_record_packet_checkpoint failed with “Error in message stream”. Manual recording was used because the recorder path was unstable.

## Boundary

No OpenCode start, runner start, execution approval, disable-switch change, or canary run occurred.
