# FP-MCP-249 Result Summary

## Result

```text
FP_MCP_249_OPENCODE_HTTP_MESSAGE_SHAPE_PROBE_OBSERVED_USER_TEXT_PATH_AND_EMPTY_ASSISTANT_PARTS
```

## Summary

The FP-MCP-249 OpenCode HTTP message response shape probe ran with cleanup enabled. It created one titled OpenCode session, submitted the tiny canary prompt through /session/{id}/prompt_async, polled /session/{id}/message, returned structural message shapes and bounded text excerpts, and deleted only the created canary session. The probe returned sessionCreated=true, promptAsyncSubmitted=true, promptAsyncHttpStatus=204, messagesHttpStatus=200, messagesTopLevelType=array, messagesCount=2, canaryTextObserved=true, discoveredTextPaths=["[0].parts[0].text"], boundedTextExcerpts=["Return exactly: OPENCODE_HTTP_CANARY_OK"], sessionDeleted=true, and deleteHttpStatus=200. The observed message array contained entry 0 with keys info and parts, info.role=user, and parts[0] keys id,messageID,sessionID,text,type. Entry 1 had keys info and parts, info.role=assistant, but partsLength=0 at capture time. This explains the FP-MCP-248 observation where one assistant message existed but assistant text was not extractable: assistant metadata may appear before assistant text parts are populated, and user prompt text can satisfy naive canary text detection unless role-aware filtering is used.

## Boundary

No execution was authorized. No approval was consumed. The disable switch was not cleared. The runner start endpoint was not contacted. OpenCode was not started. FP-027 did not run.
