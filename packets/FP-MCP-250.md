# FP-MCP-250 — OpenCode HTTP Role-Aware Assistant Completion Probe

## Checkpoint Type

```text
ASSISTANT_COMPLETION_PROBE_RESULT
```

## Summary

The FP-MCP-250 OpenCode HTTP role-aware assistant completion probe ran with cleanup enabled. It created one titled OpenCode session, submitted the tiny canary prompt through /session/{id}/prompt_async, polled /session/{id}/message until assistant-role text contained OPENCODE_HTTP_CANARY_OK, and deleted only the created canary session. The probe returned sessionCreated=true, promptAsyncSubmitted=true, promptAsyncHttpStatus=204, finalMessagesHttpStatus=200, assistantCompletionObserved=true, canaryTextObservedInAssistant=true, completionObservation=ASSISTANT_CANARY_TEXT_OBSERVED, pollCount=4, finalMessagesCount=2, assistantMessageCount=1, assistantTextPartCount=1, userTextPartCount=1, assistantTextPaths=["[1].parts[2].text"], userTextPaths=["[0].parts[0].text"], boundedAssistantTextExcerpts=["OPENCODE_HTTP_CANARY_OK"], sessionDeleted=true, and deleteHttpStatus=200. This establishes the first reliable observed completion-reader rule for async OpenCode HTTP prompts: completion requires assistant-role text parts, not merely canary text anywhere in the message array.

## Claim

```text
FP_MCP_250_OPENCODE_HTTP_ROLE_AWARE_ASSISTANT_COMPLETION_OBSERVED
```

## Caveats

- The canary prompt was deliberately tiny and bounded: Return exactly: OPENCODE_HTTP_CANARY_OK.
- Both user prompt text and assistant response text contained the canary string; completion must therefore be role-aware and specifically require assistant-role text.
- The assistant text appeared at [1].parts[2].text in this run; readers should scan assistant-role text parts rather than assuming a fixed part index.
- This probe did not call the wait endpoint; wait semantics remain negative/unreliable based on FP-MCP-248.

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
FP_MCP_250_OPENCODE_HTTP_ROLE_AWARE_ASSISTANT_COMPLETION_OBSERVED
```
