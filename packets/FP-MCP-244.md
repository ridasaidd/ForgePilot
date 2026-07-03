# FP-MCP-244 — OpenCode HTTP Read-Only Session Status Tool

## Checkpoint Type

```text
TOOL_IMPLEMENTATION_LIVE_VERIFICATION
```

## Summary

Implemented and live-verified a read-only MCP tool, forgepilot_get_opencode_http_session_status, that authenticates to the already-running local OpenCode HTTP server and probes /doc plus /session/status without creating sessions, sending prompts, aborting sessions, starting OpenCode, or contacting the ForgePilot runner start endpoint. The live tool returned authenticated=true, docReachable=true, sessionStatusReachable=true, docPathCount=113, sessionStatusHttpStatus=200, and all selected session/completion-relevant endpoints present, including /session, /session/status, /session/{sessionID}/message, /session/{sessionID}/abort, /api/session/{sessionID}/prompt, /api/session/{sessionID}/wait, /event, /file/content, and /project/current.

## Claim

```text
FP_MCP_244_OPENCODE_HTTP_SESSION_STATUS_TOOL_LIVE_VERIFIED
```

## Caveats

- The first live verification attempt exposed OPENCODE_HTTP_AUTH_FAILED because systemd EnvironmentFile expansion differed from the operator shell probe; the operator then hardcoded the OpenCode server credentials into the MCP env file and restarted the service.
- A follow-up bridge fix normalized credential environment values before constructing the Basic auth header; bridge commit cd8b1cb passed pnpm test and hardcoded packet-id lint.
- The tool returns metadata only; it does not yet read session messages, wait for session completion, collect outputs, or map OpenCode sessions to ForgePilot runnerRunId artifacts.
- The credentials were not printed or committed by the tool or checkpoint.

## Boundaries

- This checkpoint records a read-only tool implementation and live verification only.
- No OpenCode prompt was submitted.
- No OpenCode session was created or aborted.
- No ForgePilot runner start endpoint was contacted.
- No execution approval was created, consumed, or authorized.
- No local execution clearance was created.
- Completion semantics still require a separate packet before being used as evidence for model-run completion.

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
FP_MCP_244_OPENCODE_HTTP_SESSION_STATUS_TOOL_LIVE_VERIFIED
```
