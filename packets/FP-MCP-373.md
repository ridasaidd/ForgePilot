# FP-MCP-373 — Sandbox Preview Writer Smoke Test

## Purpose

Perform a smoke test of the non-executing sandbox preview artifact writer (implemented in FP-MCP-372) by creating exactly one preview JSON artifact for packet FP-MCP-373.

## Key Constraints

- Only writes a preview JSON artifact; does not execute the proposed command
- Does not invoke bubblewrap
- Does not expose the preview writer to ChatGPT-safe
- Does not consume approval
- Does not contact runner start
- Does not start OpenCode
- Does not run FP-027

## Preview Artifact

- Preview ID: PREVIEW-20260706T083445Z-a2a3ac3e
- Artifact Path: runs/FP-MCP-373/sandbox-preview/PREVIEW-20260706T083445Z-a2a3ac3e.json
- Artifact SHA-256: c0f67c844032743c5de58c83ab751afed089096d47fecd8d5e5b4c97cba1e370
- Proposed Command argv: ["pwd"]
- Proposed Command Executed: false

## Smoke Test Script

Bridge test script: scripts/test-fp-mcp-373.ts

The script calls the preview writer implementation directly to create the preview artifact. It does not import child_process, does not spawn/exec, and does not invoke bubblewrap.

## Validation Results

All 46 validations passed (see preview-artifact-validation.md for full list).

## Verification Commands

- pnpm build: PASS
- tsc --noEmit: PASS
- check-tool-contracts.mjs: PASS (79 tools, 12 chatgpt-safe)
- check-hardcoded-packet-ids.mjs: PASS
- test-fp-mcp-372.ts: PASS (68/0)
- git diff --check: PASS

## ChatGPT-Safe Surface

- New preview writer surface: dev
- New preview writer visibleInChatgptSafe: false
- Registered tools: 79
- ChatGPT-safe count: 12 (unchanged)

## Non-Execution Boundary

```
execution authorized: false
command executed: false
bubblewrap executed: false
shell executed: false
approval consumed: false
disable switch cleared: false
runner start endpoint contacted: false
OpenCode started: false
FP-027 canary run: false
```
