# FP-MCP-250 Result Summary

## Result

```text
FP_MCP_250_OPENCODE_HTTP_ROLE_AWARE_ASSISTANT_COMPLETION_OBSERVED
```

## Summary

The FP-MCP-250 OpenCode HTTP role-aware assistant completion probe ran with cleanup enabled. It created one titled OpenCode session, submitted the tiny canary prompt through /session/{id}/prompt_async, polled /session/{id}/message until assistant-role text contained OPENCODE_HTTP_CANARY_OK, and deleted only the created canary session. The probe returned sessionCreated=true, promptAsyncSubmitted=true, promptAsyncHttpStatus=204, finalMessagesHttpStatus=200, assistantCompletionObserved=true, canaryTextObservedInAssistant=true, completionObservation=ASSISTANT_CANARY_TEXT_OBSERVED, pollCount=4, finalMessagesCount=2, assistantMessageCount=1, assistantTextPartCount=1, userTextPartCount=1, assistantTextPaths=["[1].parts[2].text"], userTextPaths=["[0].parts[0].text"], boundedAssistantTextExcerpts=["OPENCODE_HTTP_CANARY_OK"], sessionDeleted=true, and deleteHttpStatus=200. This establishes the first reliable observed completion-reader rule for async OpenCode HTTP prompts: completion requires assistant-role text parts, not merely canary text anywhere in the message array.

## Boundary

No execution was authorized. No approval was consumed. The disable switch was not cleared. The runner start endpoint was not contacted. OpenCode was not started. FP-027 did not run.
