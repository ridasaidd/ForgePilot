# FP-MCP-249 — OpenCode HTTP Message Shape Probe

## Checkpoint Type

```text
MESSAGE_SHAPE_PROBE_RESULT
```

## Summary

The FP-MCP-249 OpenCode HTTP message response shape probe ran with cleanup enabled. It created one titled OpenCode session, submitted the tiny canary prompt through /session/{id}/prompt_async, polled /session/{id}/message, returned structural message shapes and bounded text excerpts, and deleted only the created canary session. The probe returned sessionCreated=true, promptAsyncSubmitted=true, promptAsyncHttpStatus=204, messagesHttpStatus=200, messagesTopLevelType=array, messagesCount=2, canaryTextObserved=true, discoveredTextPaths=["[0].parts[0].text"], boundedTextExcerpts=["Return exactly: OPENCODE_HTTP_CANARY_OK"], sessionDeleted=true, and deleteHttpStatus=200. The observed message array contained entry 0 with keys info and parts, info.role=user, and parts[0] keys id,messageID,sessionID,text,type. Entry 1 had keys info and parts, info.role=assistant, but partsLength=0 at capture time. This explains the FP-MCP-248 observation where one assistant message existed but assistant text was not extractable: assistant metadata may appear before assistant text parts are populated, and user prompt text can satisfy naive canary text detection unless role-aware filtering is used.

## Claim

```text
FP_MCP_249_OPENCODE_HTTP_MESSAGE_SHAPE_PROBE_OBSERVED_USER_TEXT_PATH_AND_EMPTY_ASSISTANT_PARTS
```

## Caveats

- The probe observed the canary text in the user message path [0].parts[0].text, not in assistant output.
- Assistant message metadata existed as the second array entry, but partsLength was 0 at capture time.
- The current shape probe stopped as soon as any canary text was observed, so it may have stopped before assistant text populated.
- Completion readers must be role-aware and should require assistant-role text parts, not merely presence of the canary string anywhere in messages.
- No wait endpoint was called in this probe.

## Boundaries

- A tiny OpenCode prompt was submitted via /session/{id}/prompt_async.
- No OpenCode wait endpoint was called.
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
FP_MCP_249_OPENCODE_HTTP_MESSAGE_SHAPE_PROBE_OBSERVED_USER_TEXT_PATH_AND_EMPTY_ASSISTANT_PARTS
```
