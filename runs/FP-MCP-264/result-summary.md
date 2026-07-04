# FP-MCP-264 Result Summary

## Result

```text
The surfaced OpenCode HTTP lifecycle single-shot gate fails closed when caller-supplied prompt and expected text hashes do not match the validated lifecycle plan, without creating an attempt artifact, creating a session, submitting a prompt, invoking the lifecycle, contacting the runner start endpoint, starting OpenCode, or consuming approval.
```

## Summary

A deliberate mismatch test invoked forgepilot_run_opencode_http_lifecycle_single_shot_gate against source packet FP-MCP-254 and plan HTTPPLAN-20260703T233517042Z-9242deff using prompt and expected text that could not match the plan hashes. The gate evaluated the dry-run plan as eligible, then blocked before action on PROMPT_HASH_MISMATCH and EXPECTED_TEXT_HASH_MISMATCH. It returned no attemptId or artifact paths and reported no session creation, prompt submission, cleanup, wait call, lifecycle invocation, runner start endpoint contact, OpenCode process start, or approval consumption. ForgePilot remained clean after the call.

## Boundary

No execution was authorized. No approval was consumed. The disable switch was not cleared. The runner start endpoint was not contacted. OpenCode was not started. FP-027 did not run.
