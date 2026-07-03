# FP-MCP-207 — Runtime Diagnostics and Gate Orientation Tool Handoff

## Task

Prepare a bounded DeepSeek/OpenCode implementation prompt for two new read-only MCP bridge tools:

1. `forgepilot_get_mcp_runtime_diagnostics`
2. `forgepilot_get_execution_gate_orientation`

## Tool Gap

FP-MCP-201 through FP-MCP-205 exposed a repeated diagnostic pattern:

```text
terminal checks were needed to compare terminal PATH vs MCP service PATH
service env file had to be inspected
running bridge process had to be checked for a specific variable
pnpm shim behavior had to be inspected
```

FP-MCP-206 exposed another repeated pattern:

```text
multiple read-only execution gate status tools were manually called and summarized in chat
```

These are stable, repeated, bounded operational observations and should become typed tools.

## Scope

Implement read-only tools only.

Do not implement a request-path orchestration tool in this packet. That requires a stronger write-path contract.

## Required Boundary

DeepSeek must not:

```text
authorize execution
consume approval
clear disable switch
contact runner start endpoint
start OpenCode
run FP-027 or any canary
create request artifacts
create approval artifacts
change approval semantics
change disable-switch semantics
change request-artifact semantics
broaden terminal-command authority
perform broad unrelated refactors
```

## Expected Artifacts

```text
runs/FP-MCP-207/deepseek-tooling-prompt.md
runs/FP-MCP-207/handoff-record.json
```

## Expected Result

```text
FP_MCP_207_DEEPSEEK_RUNTIME_DIAGNOSTICS_AND_GATE_ORIENTATION_TOOL_PROMPT_PREPARED
```
