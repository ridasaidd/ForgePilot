# FP-MCP-260 Result Summary

## Result

```text
FP_MCP_260_HTTP_LIFECYCLE_INVOCATION_ATTEMPT_ARTIFACT_SCHEMA_DEFINED_WITHOUT_IMPLEMENTATION
```

## Summary

FP-MCP-260 defines the append-only artifact schema required before any future real OpenCode HTTP lifecycle invocation tool may be implemented. The schema introduces an invocation attempt directory under runs/<packetId>/opencode-http-lifecycle-invocations/<attemptId>/ and two required artifacts: preflight.json and result.json. preflight.json records the exact plan id, source request id, plan artifact path, request artifact path, promptTextSha256, expectedTextSha256, lifecycle tool binding, approval binding, cleanup policy, final preflight decision, and all negative boundary checks before any lifecycle action. result.json records the post-action lifecycle outcome, including whether a session was created, session id if created, prompt submission status, assistant completion state, cleanup status, HTTP statuses, bounded completion evidence, and final boundary booleans. The schema requires the first state to be PREPARED_NOT_STARTED and the terminal state to be one of BLOCKED_BEFORE_ACTION, COMPLETED_WITH_CLEANUP, COMPLETED_WITHOUT_CLEANUP, INCOMPLETE_WITH_CLEANUP, INCOMPLETE_WITHOUT_CLEANUP, ERROR_WITH_CLEANUP, or ERROR_WITHOUT_CLEANUP. The schema requires append-only behavior: preflight and result are created once, never mutated; corrections require a new attempt id. This packet does not implement a real invocation tool and does not create an invocation attempt artifact.

## Boundary

No execution was authorized. No approval was consumed. The disable switch was not cleared. The runner start endpoint was not contacted. OpenCode was not started. FP-027 did not run.
