# FP-MCP-248 Result Summary

## Result

```text
FP_MCP_248_OPENCODE_HTTP_WAIT_ENDPOINT_RETURNED_503_MESSAGE_ENDPOINT_REMAINED_REACHABLE
```

## Summary

The FP-MCP-248 OpenCode HTTP wait endpoint semantics probe ran with cleanup enabled. It created one titled OpenCode session, submitted the tiny canary prompt through /session/{id}/prompt_async, called /api/session/{id}/wait once with a bounded timeout, read /session/{id}/message after wait, and deleted only the created canary session. The probe returned sessionCreated=true, promptAsyncSubmitted=true, promptAsyncHttpStatus=204, waitEndpointCalled=true, waitEndpointSucceeded=false, waitEndpointTimedOut=false, waitHttpStatus=503, waitContentType=application/json, messagesAfterWaitHttpStatus=200, messagesAfterWaitCount=2, assistantMessageCountAfterWait=1, assistantTextObservedAfterWait=false, canaryTextObservedAfterWait=false, sessionDeleted=true, deleteHttpStatus=200. This is a useful negative observation: /api/session/{id}/wait as invoked did not provide a successful completion boundary, while the message endpoint remained reachable after the wait failure.

## Boundary

No execution was authorized. No approval was consumed. The disable switch was not cleared. The runner start endpoint was not contacted. OpenCode was not started. FP-027 did not run.
