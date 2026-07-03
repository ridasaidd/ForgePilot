# FP-MCP-243 — OpenCode HTTP API Discovery

## Checkpoint Type

```text
READ_ONLY_API_DISCOVERY_RESULT
```

## Summary

Authenticated Basic HTTP access to the already-running local OpenCode server was verified by the operator. The OpenAPI document at /doc returned HTTP 200, content-type application/json, and exposed 113 paths, including /session, /session/status, /session/{sessionID}/message, /session/{sessionID}/abort, /event, /api/session/{sessionID}/prompt, and /api/session/{sessionID}/wait. This confirms that ForgePilot MCP can move from terminal-output inference toward explicit OpenCode HTTP session lifecycle observation.

## Claim

```text
FP_MCP_243_OPENCODE_HTTP_API_DISCOVERED
```

## Caveats

- The successful authenticated /doc probe was executed by the operator locally because the MCP terminal wrapper blocked commands that handled OPENCODE_SERVER_PASSWORD, even when values were not printed.
- The discovery did not create sessions, send prompts, abort sessions, mutate files, or start OpenCode.
- Endpoint semantics such as /api/session/{sessionID}/wait and /event still require packeted read-only implementation and verification before use as evidence.
- Credentials are available to the MCP service environment through OPENCODE_SERVER_USERNAME and OPENCODE_SERVER_PASSWORD, but secret values were not printed or committed.

## Boundaries

- This checkpoint records discovery only and does not authorize execution.
- No runner start endpoint was contacted by this checkpoint.
- No OpenCode HTTP prompt was submitted by this checkpoint.
- No approval was consumed and no local execution clearance was created.
- Future HTTP MCP tools must treat start acceptance and completion as separate observations.

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
FP_MCP_243_OPENCODE_HTTP_API_DISCOVERED
```
