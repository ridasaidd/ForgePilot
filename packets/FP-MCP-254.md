# FP-MCP-254 — OpenCode HTTP Lifecycle Orchestrator Skeleton

## Checkpoint Type

```text
HTTP_LIFECYCLE_ORCHESTRATOR_RESULT
```

## Summary

The FP-MCP-254 OpenCode HTTP lifecycle orchestrator skeleton was implemented, exposed, and verified with a bounded canary lifecycle. The tool created one titled OpenCode session, submitted the canary prompt through /session/{id}/prompt_async, observed role-aware assistant completion through /session/{id}/message, and cleaned up the created session. Result: lifecycleRan=true, sessionCreated=true, promptAsyncSubmitted=true, assistantCompletionObserved=true, expectedTextObservedInAssistant=true, completionState=COMPLETED, cleanupAttempted=true, sessionDeleted=true, createHttpStatus=200, promptAsyncHttpStatus=204, finalMessagesHttpStatus=200, deleteHttpStatus=200, pollCount=6, assistantTextPaths=["[1].parts[2].text"], boundedAssistantTextExcerpts=["OPENCODE_HTTP_CANARY_OK"].

## Claim

```text
FP_MCP_254_OPENCODE_HTTP_LIFECYCLE_ORCHESTRATOR_COMPLETED_CANARY_WITH_CLEANUP
```

## Caveats

- Verified only with a tiny canary prompt.
- The observed assistant text path is an example shape, not a fixed index contract.
- The tool uses role-aware assistant text scanning as the completion rule.

## Boundaries

- No wait endpoint call.
- No runner start contact.
- No OpenCode process start by this tool.
- No approval consumption.
- No file-changing task requested.
- Only the created canary session was cleaned up.

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
FP_MCP_254_OPENCODE_HTTP_LIFECYCLE_ORCHESTRATOR_COMPLETED_CANARY_WITH_CLEANUP
```
