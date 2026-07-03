# FP-MCP-248 — OpenCode HTTP Wait Endpoint Semantics Probe

## Checkpoint Type

```text
WAIT_ENDPOINT_PROBE_RESULT
```

## Summary

The FP-MCP-248 OpenCode HTTP wait endpoint semantics probe ran with cleanup enabled. It created one titled OpenCode session, submitted the tiny canary prompt through /session/{id}/prompt_async, called /api/session/{id}/wait once with a bounded timeout, read /session/{id}/message after wait, and deleted only the created canary session. The probe returned sessionCreated=true, promptAsyncSubmitted=true, promptAsyncHttpStatus=204, waitEndpointCalled=true, waitEndpointSucceeded=false, waitEndpointTimedOut=false, waitHttpStatus=503, waitContentType=application/json, messagesAfterWaitHttpStatus=200, messagesAfterWaitCount=2, assistantMessageCountAfterWait=1, assistantTextObservedAfterWait=false, canaryTextObservedAfterWait=false, sessionDeleted=true, deleteHttpStatus=200. This is a useful negative observation: /api/session/{id}/wait as invoked did not provide a successful completion boundary, while the message endpoint remained reachable after the wait failure.

## Claim

```text
FP_MCP_248_OPENCODE_HTTP_WAIT_ENDPOINT_RETURNED_503_MESSAGE_ENDPOINT_REMAINED_REACHABLE
```

## Caveats

- The probe used POST /api/session/{id}/wait; the observed 503 may indicate wrong endpoint variant, wrong method, missing prerequisite state, or OpenCode server-side wait unavailability.
- The message endpoint returned two messages and one assistant message after wait, but the current parser did not observe assistant text or the exact canary string in that response shape.
- This does not invalidate the FP-MCP-247 result where message-based completion observed OPENCODE_HTTP_CANARY_OK without using wait.
- Further inspection should compare message response shapes and possibly test documented non-api wait endpoint variants before using wait as a completion source.

## Boundaries

- A tiny OpenCode prompt was submitted via /session/{id}/prompt_async.
- The wait endpoint was called once with bounded timeout.
- No ForgePilot runner start endpoint was contacted.
- No OpenCode process was started by this probe.
- No execution approval was created, consumed, or authorized.
- No local execution clearance was created.
- Only the probe-created session was deleted.
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
FP_MCP_248_OPENCODE_HTTP_WAIT_ENDPOINT_RETURNED_503_MESSAGE_ENDPOINT_REMAINED_REACHABLE
```
