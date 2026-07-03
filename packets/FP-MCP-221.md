# FP-MCP-221 — Operator Clearance Observer Tool Discovery Mismatch

## Checkpoint Type

```text
TOOL_DISCOVERY_MISMATCH_AFTER_SERVICE_RESTART
```

## Summary

Record the post-restart tool discovery result for FP-MCP-220. The MCP bridge service was restarted by the operator and the running process was observed using /home/ridasaidd/forgepilot-chatgpt-mcp/dist/server.js with cwd /home/ridasaidd/forgepilot-chatgpt-mcp. The checkout is clean at MCP bridge commit 02ce465 and dist/server.js contains the new forgepilot_get_operator_local_execution_clearance_status registration. However, ChatGPT tool discovery still does not expose that new observer tool. This is recorded as a tool-manifest/discovery mismatch, not an implementation failure and not an execution event.

## Claim

```text
FP_MCP_221_OPERATOR_CLEARANCE_OBSERVER_DISCOVERY_MISMATCH_RECORDED
```

## Caveats

- systemctl --user cat could not be read from the MCP terminal context because the user bus was unavailable there, but the process command line and cwd were observed directly through /proc and ps.
- The new observer exists in source and compiled dist output and pnpm build previously passed.
- The observer could not be called through ChatGPT because the tool is not exposed in the active tool manifest.
- No local clearance artifact was created.
- No approval was consumed, no disable switch was cleared, no runner start endpoint was contacted, no OpenCode process was started, and FP-027 did not run.

## Boundaries

- execution authorized: false
- approval consumed: false
- disable switch cleared: false
- runner start endpoint contacted: false
- OpenCode started: false
- FP-027 canary run: false
- standing execution authority created: false
- tool discovery only: true

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
FP_MCP_221_OPERATOR_CLEARANCE_OBSERVER_DISCOVERY_MISMATCH_RECORDED
```
