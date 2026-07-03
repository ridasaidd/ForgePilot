# FP-MCP-245 — OpenCode HTTP Session Status Shape Reader

## Checkpoint Type

```text
TOOL_IMPLEMENTATION_PARTIAL_LIVE_VERIFICATION
```

## Summary

Implemented and committed a read-only MCP tool, forgepilot_get_opencode_http_session_status_shape, intended to authenticate to the already-running local OpenCode HTTP server and summarize the /session/status JSON shape without creating sessions, sending prompts, reading message contents, calling wait, aborting sessions, starting OpenCode, or contacting the ForgePilot runner start endpoint. The bridge build and packet-id lint passed, the service was restarted, and compiled dist/server.js contains the new registration. However, the ChatGPT callable tool schema did not surface the new function in this session, so direct invocation from the assistant was not possible yet. The existing FP-MCP-244 HTTP status tool remained live and healthy after restart, returning authenticated=true, docReachable=true, sessionStatusReachable=true, sessionStatusHttpStatus=200, docPathCount=113, and sessionStatusTopLevelKeys=[].

## Claim

```text
FP_MCP_245_OPENCODE_HTTP_SESSION_STATUS_SHAPE_READER_IMPLEMENTED_SCHEMA_SURFACE_PENDING
```

## Caveats

- Direct live invocation of forgepilot_get_opencode_http_session_status_shape was not possible because the ChatGPT tool schema cache did not expose the newly registered function, despite source and dist containing the registration.
- The implementation commit a2aaa20 passed pnpm test and hardcoded packet-id lint before service restart.
- A read-only grep confirmed src/server.ts and dist/server.js contain forgepilot_get_opencode_http_session_status_shape and OPENCODE_HTTP_SESSION_STATUS_SHAPE_READER_V1.
- The existing forgepilot_get_opencode_http_session_status tool was invoked after restart and confirmed HTTP auth and /session/status access remained healthy.
- No new OpenCode sessions were created and no prompt was sent.

## Boundaries

- This checkpoint records implementation and partial live verification only.
- No OpenCode prompt was submitted.
- No OpenCode session was created, modified, waited on, or aborted.
- No OpenCode message contents were read.
- No ForgePilot runner start endpoint was contacted.
- No execution approval was created, consumed, or authorized.
- No local execution clearance was created.
- The shape-reader output must not be treated as directly observed from the MCP callable surface until the tool schema exposes the function and a direct invocation succeeds.

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
FP_MCP_245_OPENCODE_HTTP_SESSION_STATUS_SHAPE_READER_IMPLEMENTED_SCHEMA_SURFACE_PENDING
```
