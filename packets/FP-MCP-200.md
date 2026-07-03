# FP-MCP-200 — DeepSeek MCP Checkpoint Tool Hardening Handoff

## Task

Prepare a bounded DeepSeek/OpenCode implementation handoff for hardening the newly implemented MCP packet checkpoint recorder.

## Goal

Use OpenCode/DeepSeek for MCP bridge source modification instead of repeated ChatGPT terminal edits, preserving the intended control model:

```text
GPT: packet intent, scope, review, gate decisions
DeepSeek/OpenCode: source implementation
terminal: secondary scaffolding and recovery
```

## Context

FP-MCP-199 implemented `forgepilot_record_packet_checkpoint` in the MCP bridge.

The tool exists in bridge commit:

```text
958fc91 Add packet checkpoint recording tool
```

The tool is not yet visible in the current ChatGPT action surface, so service/action refresh is still required before GPT can call it directly.

## Handoff Target

DeepSeek should perform MCP bridge implementation work only after explicit execution authorization through the normal guarded path.

## Intended Implementation Scope

The preferred next implementation is to harden the checkpoint tool by moving its implementation out of `src/server.ts` into a dedicated module and preserving `server.ts` as registration-only glue.

Candidate target module:

```text
src/packet-checkpoint.ts
```

## Required Boundaries

DeepSeek must not:

```text
authorize execution
consume approval
clear disable switch
contact runner start endpoint
start OpenCode
run FP-027
change guarded-runner start behavior
change approval semantics
change disable-switch semantics
change request-artifact semantics
broaden terminal-command authority
perform broad refactors outside packet-checkpoint code
```

## Expected Artifacts

```text
runs/FP-MCP-200/deepseek-implementation-prompt.md
runs/FP-MCP-200/handoff-record.json
```

## Expected Result

```text
FP_MCP_200_DEEPSEEK_MCP_CHECKPOINT_TOOL_HARDENING_PROMPT_PREPARED
```
