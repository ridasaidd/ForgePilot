# FP-MCP-247 Result Summary

## Result

```text
FP_MCP_247_OPENCODE_HTTP_ASYNC_PROMPT_CANARY_SUCCEEDED_MESSAGE_COMPLETION_OBSERVED
```

## Summary

The FP-MCP-247 minimal OpenCode HTTP async prompt canary ran successfully with cleanup enabled. It created one titled OpenCode session, submitted the tiny prompt through /session/{id}/prompt_async, read messages before and after, polled /session/status, observed the exact assistant text OPENCODE_HTTP_CANARY_OK, and deleted only the created canary session. The canary returned sessionCreated=true, promptAsyncSubmitted=true, promptAsyncHttpStatus=204, messagesAfterHttpStatus=200, messagesAfterCount=2, assistantMessageCountAfter=1, assistantTextObserved=true, canaryTextObserved=true, boundedAssistantTextExcerpt=OPENCODE_HTTP_CANARY_OK, cleanupAttempted=true, sessionDeleted=true, and deleteHttpStatus=200. It also confirmed waitEndpointCalled=false, runnerStartEndpointContacted=false, and opencodeStarted=false. The status timeline briefly reported sessionStatusType=busy on attempts 1 and 2, then returned null rather than idle; therefore completion was observed from /session/{id}/message contents, not from /session/status reaching idle.

## Boundary

No execution was authorized. No approval was consumed. The disable switch was not cleared. The runner start endpoint was not contacted. OpenCode was not started. FP-027 did not run.
