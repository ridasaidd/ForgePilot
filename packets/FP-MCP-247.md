# FP-MCP-247 — OpenCode HTTP Minimal Async Prompt Canary

## Checkpoint Type

```text
ASYNC_PROMPT_CANARY_RESULT
```

## Summary

The FP-MCP-247 minimal OpenCode HTTP async prompt canary ran successfully with cleanup enabled. It created one titled OpenCode session, submitted the tiny prompt through /session/{id}/prompt_async, read messages before and after, polled /session/status, observed the exact assistant text OPENCODE_HTTP_CANARY_OK, and deleted only the created canary session. The canary returned sessionCreated=true, promptAsyncSubmitted=true, promptAsyncHttpStatus=204, messagesAfterHttpStatus=200, messagesAfterCount=2, assistantMessageCountAfter=1, assistantTextObserved=true, canaryTextObserved=true, boundedAssistantTextExcerpt=OPENCODE_HTTP_CANARY_OK, cleanupAttempted=true, sessionDeleted=true, and deleteHttpStatus=200. It also confirmed waitEndpointCalled=false, runnerStartEndpointContacted=false, and opencodeStarted=false. The status timeline briefly reported sessionStatusType=busy on attempts 1 and 2, then returned null rather than idle; therefore completion was observed from /session/{id}/message contents, not from /session/status reaching idle.

## Claim

```text
FP_MCP_247_OPENCODE_HTTP_ASYNC_PROMPT_CANARY_SUCCEEDED_MESSAGE_COMPLETION_OBSERVED
```

## Caveats

- This was the first canary that submitted an OpenCode model prompt, but the prompt was deliberately tiny and bounded: Return exactly: OPENCODE_HTTP_CANARY_OK.
- The tool did not call /api/session/{id}/wait or any wait endpoint, so wait semantics remain unverified.
- The status timeline observed busy briefly, but did not observe idle; /session/status should not yet be used as the sole completion source.
- The created canary session was deleted after observation; retained evidence is the ForgePilot checkpoint and structured record, not the OpenCode session itself.

## Boundaries

- A tiny OpenCode prompt was submitted via /session/{id}/prompt_async.
- No OpenCode wait endpoint was called.
- No ForgePilot runner start endpoint was contacted.
- No OpenCode process was started by this canary.
- No execution approval was created, consumed, or authorized.
- No local execution clearance was created.
- Only the canary-created session was deleted.
- No file-editing task was requested from the model.

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
FP_MCP_247_OPENCODE_HTTP_ASYNC_PROMPT_CANARY_SUCCEEDED_MESSAGE_COMPLETION_OBSERVED
```
