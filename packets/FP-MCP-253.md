# FP-MCP-253 — OpenCode HTTP Session Cleanup Tool

## Checkpoint Type

```text
SESSION_CLEANUP_RESULT
```

## Summary

The FP-MCP-253 explicit OpenCode HTTP session cleanup tool was implemented, exposed, and verified against the intentionally retained FP-MCP-251 canary session. The tool deleted exactly session ses_0d5e10bf0fferWGbj7B9Hk8Ec8 after requiring sessionId and confirmSessionId to match and requiring approval DELETE_OPENCODE_HTTP_SESSION. The deletion returned deleteRan=true, explicitSessionIdMatched=true, sessionDeleted=true, deleteHttpStatus=200, deleteContentType=application/json, and authConfigured=true. The tool also confirmed sessionCreated=false, promptSubmitted=false, messageEndpointCalled=false, waitEndpointCalled=false, runnerStartEndpointContacted=false, and opencodeStarted=false. This closes the intentional leftover session caveat from FP-MCP-251 and establishes an explicit, guarded cleanup mechanism for future HTTP lifecycle tools.

## Claim

```text
FP_MCP_253_OPENCODE_HTTP_EXPLICIT_SESSION_CLEANUP_SUCCEEDED
```

## Caveats

- The cleanup tool is intentionally destructive for the explicitly named session, so it requires duplicate session-id confirmation plus a fixed approval literal.
- The tool does not verify post-delete absence via a follow-up read; it records the DELETE /session/{id} HTTP result only.
- The cleanup target was the intentionally retained canary session from FP-MCP-251, not an arbitrary or discovered session.

## Boundaries

- No OpenCode session was created by the cleanup tool.
- No prompt was submitted by the cleanup tool.
- No message endpoint was read by the cleanup tool.
- No wait endpoint was called by the cleanup tool.
- No OpenCode process was started by the cleanup tool.
- No ForgePilot runner start endpoint was contacted by the cleanup tool.
- No execution approval was created, consumed, or authorized by the cleanup tool.
- Only the explicitly named session id was targeted.

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
FP_MCP_253_OPENCODE_HTTP_EXPLICIT_SESSION_CLEANUP_SUCCEEDED
```
