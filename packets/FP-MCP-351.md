# FP-MCP-351 — MCP server normalization audit package

## Checkpoint Type

```text
ARCHITECTURE_AUDIT_RESULT
```

## Summary

The MCP bridge now contains five audit/planning documents: docs/mcp-server-normalization-audit.md, docs/mcp-tool-risk-matrix.md, docs/mcp-tool-surface-inventory.json, docs/server-ts-refactor-plan.md, and docs/refactor-executor-recommendation.md. The audit measured src/server.ts at 18,640 lines and 68 registered MCP tools, classified the tool surface into ChatGPT-safe, gated-visible, and dev/hidden groups, and recommended behavior-preserving extraction plus contract/surface-profile work before additional runner operations. The bridge docs were committed at 5e08d9d after pnpm test passed.

## Claim

```text
FP-MCP-351 created a research-backed MCP server normalization audit, tool inventory, risk matrix, refactor plan, and executor recommendation for reducing src/server.ts ambiguity before further operational execution work.
```

## Caveats

- The tool classification is an initial static inventory and should be regenerated after tool registration changes.
- The audit documents do not change runtime tool behavior.
- The bridge branch remains ahead of origin until pushed manually because prior push attempts were blocked by host safety checks.
- The recommendation is to use Copilot/Codex/Claude for the first mechanical extraction, not DeepSeek/Qwen through OpenCode until the bridge is normalized.

## Boundaries

- Did not refactor server.ts in this packet.
- Did not change any MCP runtime behavior.
- Did not start OpenCode.
- Did not contact runner start.
- Did not create clearance.
- Did not record clearance intent.
- Did not consume approval.
- Did not clear the disable switch.

## Non-Execution Boundary

```text
execution authorized: false
approval consumed: false
disable switch cleared: false
runner start endpoint contacted: false
OpenCode started: false
FP-027 canary run: false
```

## Expected Result

```text
FP-MCP-351 created a research-backed MCP server normalization audit, tool inventory, risk matrix, refactor plan, and executor recommendation for reducing src/server.ts ambiguity before further operational execution work.
```
