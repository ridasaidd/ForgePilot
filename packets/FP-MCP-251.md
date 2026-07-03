# FP-MCP-251 — OpenCode HTTP Assistant Completion Reader

## Checkpoint Type

```text
ASSISTANT_COMPLETION_READER_RESULT
```

## Summary

The FP-MCP-251 read-only OpenCode HTTP assistant completion reader was verified against an existing live canary session. A fresh tiny assistant-completion probe was first run with cleanup disabled to create session ses_0d5e10bf0fferWGbj7B9Hk8Ec8 and produce assistant output. The new reader then inspected that existing session with expectedText=OPENCODE_HTTP_CANARY_OK. The reader returned readRan=true, completionState=COMPLETED, assistantCompletionObserved=true, expectedTextObservedInAssistant=true, userExpectedTextObserved=true, messagesHttpStatus=200, messagesContentType=application/json, messagesTopLevelType=array, messagesCount=2, assistantMessageCount=1, assistantTextPartCount=1, userTextPartCount=1, assistantTextPaths=["[1].parts[2].text"], userTextPaths=["[0].parts[0].text"], boundedAssistantTextExcerpts=["OPENCODE_HTTP_CANARY_OK"]. The reader confirmed sessionCreated=false, promptSubmitted=false, waitEndpointCalled=false, sessionDeleted=false, runnerStartEndpointContacted=false, and opencodeStarted=false. This verifies the reusable read-only role-aware completion reader against the completion rule admitted in FP-MCP-250.

## Claim

```text
FP_MCP_251_OPENCODE_HTTP_ASSISTANT_COMPLETION_READER_CLASSIFIED_EXISTING_SESSION_COMPLETED
```

## Caveats

- A fresh canary session was intentionally created with cleanup disabled so the read-only reader had an existing live session id to inspect.
- The session ses_0d5e10bf0fferWGbj7B9Hk8Ec8 remains in OpenCode after this test because the reader is deliberately non-destructive and does not delete sessions.
- Both user and assistant messages contained OPENCODE_HTTP_CANARY_OK; completionState=COMPLETED was based on assistant-role text, not user text.
- The reader performs a single read of /session/{id}/message and does not poll; polling/orchestration should be implemented by a higher-level runner or future tool.

## Boundaries

- The completion reader did not create a session.
- The completion reader did not submit a prompt.
- The completion reader did not call any wait endpoint.
- The completion reader did not delete the session.
- The completion reader did not start OpenCode.
- The completion reader did not contact the ForgePilot runner start endpoint.
- The completion reader did not create, consume, or authorize execution approval.
- The completion reader did not request any file-editing task from the model.

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
FP_MCP_251_OPENCODE_HTTP_ASSISTANT_COMPLETION_READER_CLASSIFIED_EXISTING_SESSION_COMPLETED
```
