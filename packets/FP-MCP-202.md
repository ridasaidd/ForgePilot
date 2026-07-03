# FP-MCP-202 — Checkpoint Tool Runtime Command Resolution Fix Handoff

## Task

Prepare a bounded DeepSeek/OpenCode implementation prompt to fix the `forgepilot_record_packet_checkpoint` runtime failure observed in FP-MCP-201.

## Context

FP-MCP-201 live smoke-tested the refreshed `forgepilot_record_packet_checkpoint` MCP tool.

The tool was visible and callable, reached the bridge, and wrote partial checkpoint artifacts. It failed during its internal evidence execution step with:

```text
spawn pnpm ENOENT
```

This indicates the MCP service runtime cannot spawn `pnpm` from its environment, even though terminal sessions can run `pnpm`.

## Goal

Fix command resolution in the checkpoint tool so it does not depend on `pnpm` being present on the MCP service process PATH.

## Required Boundary

DeepSeek must not:

```text
authorize execution
consume approval
clear disable switch
contact runner start endpoint
start OpenCode
run FP-027 or any canary
change approval semantics
change disable-switch semantics
change request-artifact semantics
broaden terminal-command authority
perform broad unrelated refactors
```

## Expected Artifacts

```text
runs/FP-MCP-202/deepseek-runtime-fix-prompt.md
runs/FP-MCP-202/handoff-record.json
```

## Expected Result

```text
FP_MCP_202_DEEPSEEK_CHECKPOINT_TOOL_RUNTIME_FIX_PROMPT_PREPARED
```
