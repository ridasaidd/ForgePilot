# FP-MCP-260 — HTTP Lifecycle Invocation Attempt Artifact Schema

## Checkpoint Type

```text
HTTP_LIFECYCLE_INVOCATION_ATTEMPT_SCHEMA
```

## Summary

FP-MCP-260 defines the append-only artifact schema required before any future real OpenCode HTTP lifecycle invocation tool may be implemented. The schema introduces an invocation attempt directory under runs/<packetId>/opencode-http-lifecycle-invocations/<attemptId>/ and two required artifacts: preflight.json and result.json. preflight.json records the exact plan id, source request id, plan artifact path, request artifact path, promptTextSha256, expectedTextSha256, lifecycle tool binding, approval binding, cleanup policy, final preflight decision, and all negative boundary checks before any lifecycle action. result.json records the post-action lifecycle outcome, including whether a session was created, session id if created, prompt submission status, assistant completion state, cleanup status, HTTP statuses, bounded completion evidence, and final boundary booleans. The schema requires the first state to be PREPARED_NOT_STARTED and the terminal state to be one of BLOCKED_BEFORE_ACTION, COMPLETED_WITH_CLEANUP, COMPLETED_WITHOUT_CLEANUP, INCOMPLETE_WITH_CLEANUP, INCOMPLETE_WITHOUT_CLEANUP, ERROR_WITH_CLEANUP, or ERROR_WITHOUT_CLEANUP. The schema requires append-only behavior: preflight and result are created once, never mutated; corrections require a new attempt id. This packet does not implement a real invocation tool and does not create an invocation attempt artifact.

## Claim

```text
FP_MCP_260_HTTP_LIFECYCLE_INVOCATION_ATTEMPT_ARTIFACT_SCHEMA_DEFINED_WITHOUT_IMPLEMENTATION
```

## Caveats

- This packet defines schema only; it does not implement an invocation attempt recorder or real invocation tool.
- A future implementation must use create-only writes for preflight.json and result.json.
- The preflight artifact must be written before any OpenCode HTTP lifecycle action.
- The result artifact must be written after lifecycle action or after pre-action blocking.
- Prompt text remains outside the artifact; only SHA-256 hashes are stored.
- A blocked preflight must produce result.json with terminalState=BLOCKED_BEFORE_ACTION and no OpenCode session id.

## Boundaries

- No OpenCode session was created.
- No prompt was submitted.
- No wait endpoint was called.
- No session was deleted.
- No OpenCode process was started.
- No runner start endpoint was contacted.
- No approval was consumed.
- No lifecycle was invoked.
- No source code was changed for a real invocation path.

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
FP_MCP_260_HTTP_LIFECYCLE_INVOCATION_ATTEMPT_ARTIFACT_SCHEMA_DEFINED_WITHOUT_IMPLEMENTATION
```
