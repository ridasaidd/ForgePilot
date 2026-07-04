# FP-MCP-264 — Single-shot HTTP lifecycle gate fail-closed validation

## Checkpoint Type

```text
FAIL_CLOSED_VALIDATION_RESULT
```

## Summary

A deliberate mismatch test invoked forgepilot_run_opencode_http_lifecycle_single_shot_gate against source packet FP-MCP-254 and plan HTTPPLAN-20260703T233517042Z-9242deff using prompt and expected text that could not match the plan hashes. The gate evaluated the dry-run plan as eligible, then blocked before action on PROMPT_HASH_MISMATCH and EXPECTED_TEXT_HASH_MISMATCH. It returned no attemptId or artifact paths and reported no session creation, prompt submission, cleanup, wait call, lifecycle invocation, runner start endpoint contact, OpenCode process start, or approval consumption. ForgePilot remained clean after the call.

## Claim

```text
The surfaced OpenCode HTTP lifecycle single-shot gate fails closed when caller-supplied prompt and expected text hashes do not match the validated lifecycle plan, without creating an attempt artifact, creating a session, submitting a prompt, invoking the lifecycle, contacting the runner start endpoint, starting OpenCode, or consuming approval.
```

## Caveats

- This checkpoint validates the negative/fail-closed path only; it does not validate a positive single-shot lifecycle execution.
- The blocked call returned structured UI evidence but intentionally wrote no preflight/result artifacts because it blocked before artifact creation.
- The source plan remains invocation-eligible under the dry-run gate, so the block was specifically caused by prompt/expected text hash mismatch.

## Boundaries

- fail-closed validation only
- no positive lifecycle execution
- no session creation
- no prompt submission
- no attempt artifact creation
- no wait endpoint call
- no runner start endpoint contact
- no OpenCode process start from terminal
- no approval consumption
- single-shot V1 cleanup requirement preserved

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
The surfaced OpenCode HTTP lifecycle single-shot gate fails closed when caller-supplied prompt and expected text hashes do not match the validated lifecycle plan, without creating an attempt artifact, creating a session, submitting a prompt, invoking the lifecycle, contacting the runner start endpoint, starting OpenCode, or consuming approval.
```
