# FP-MCP-325 Observed Host Blocks

## Date

2026-07-04

## Context

During guarded ForgePilot MCP execution-path work, ChatGPT-hosted MCP calls began receiving host-platform safety blocks before reaching the MCP server.

## Observed Results

### Observation 1

Tool:

- `forgepilot_status`

Result:

- Allowed
- Returned ForgePilot core status
- Core branch: `main`
- Core commit: `c71632e`
- Working tree: clean

### Observation 2

Tool:

- `forgepilot_get_execution_disable_switch_status`

Arguments:

- packet id
- request id
- model id
- run mode

Result:

- Blocked by ChatGPT host safety layer before MCP invocation

Observed message:

- `This tool call was blocked by OpenAI's safety checks. Please double check what you are sending.`

### Observation 3

Tool:

- `forgepilot_record_packet_checkpoint`

Payload:

- Non-executing debug packet checkpoint
- Included execution-boundary wording

Result:

- Blocked by ChatGPT host safety layer before MCP invocation

### Observation 4

Tool:

- `forgepilot_record_packet_checkpoint`

Payload:

- Minimized neutral debug packet checkpoint
- No final execution request

Result:

- Blocked by ChatGPT host safety layer before MCP invocation

## Interpretation

The blocking behavior is not limited to the final guarded runner-start call.

The current session appears to block some ForgePilot MCP calls based on tool capability, recent context, argument semantics, or accumulated risk state.

## Boundary

No runner-start endpoint was contacted.

No OpenCode process was started.

No approval was consumed.

No token value was printed.

No ForgePilot execution gate was weakened.

## Result

This is a host-platform tool-call boundary observation, not a ForgePilot gate failure and not an MCP bridge runtime failure.
