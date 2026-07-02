# FP-MCP-173 — OpenCode Readiness Blocker Classification

## Task

Classify the `OPENCODE_NOT_CONFIGURED` blocker observed during FP-MCP-172 before any further canary attempt.

This packet is observational/classification-only.
It must not enable execution, contact the runner start endpoint, start OpenCode, mutate request artifacts, or retry the canary.

## Questions

1. What does `OPENCODE_NOT_CONFIGURED` mean in the guarded preflight result?
2. Is it an infrastructure/environment fact, a policy state, or a schema/predicate mismatch?
3. Is the remote runner itself configured and reachable?
4. Is this expected or new information?
5. Does the configured-field mismatch appear anywhere else in a way that could fail open?

## Expected Result

```text
OPENCODE_NOT_CONFIGURED_CLASSIFIED_AS_READINESS_LABEL_FALSE_NEGATIVE_NO_FALSE_OPEN_CONSUMER_FOUND
```
