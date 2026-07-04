# FP-MCP-265 — HTTP lifecycle single-shot positive invocation result

## Checkpoint Type

```text
POSITIVE_INVOCATION_RESULT
```

## Summary

FP-MCP-265 invoked forgepilot_run_opencode_http_lifecycle_single_shot_gate against source packet FP-MCP-254 and plan HTTPPLAN-20260703T233517042Z-9242deff using the exact prompt text 'Return exactly: OPENCODE_HTTP_CANARY_OK' and expected text 'OPENCODE_HTTP_CANARY_OK'. The prompt and expected hashes matched the plan. The gate evaluated the dry-run plan as eligible, wrote single-shot preflight/result artifacts under attempt HTTPINVOCATION-20260704T064320708Z-1e810791, created one session, submitted one prompt through prompt_async, observed expected assistant-role text, classified completion as COMPLETED, attempted cleanup, deleted the session, and returned no block reasons.

## Claim

```text
The surfaced OpenCode HTTP lifecycle single-shot gate successfully invoked a hash-matching single-shot lifecycle from the validated FP-MCP-254 plan, created one OpenCode HTTP session, submitted one bounded prompt, observed the expected assistant-role text, deleted the session, wrote preflight/result artifacts, and did not call wait, contact the ForgePilot runner start endpoint, start OpenCode from terminal, or consume approval.
```

## Caveats

- Two extra minimal session canary calls were accidentally made before the positive gate call while trying to invoke the correct tool. Both canaries created and deleted one session each, submitted no prompt, called no wait endpoint, contacted no runner start endpoint, started no OpenCode process, and consumed no approval.
- The positive invocation used a tiny canary prompt only; it proves the single-shot transport/control path, not model usefulness on a real ForgePilot task.
- The gate writes artifacts under source packet FP-MCP-254 because the lifecycle plan belongs to FP-MCP-254; FP-MCP-265 records/admit the result as a later checkpoint.
- The raw invocation artifacts were committed first in ForgePilot commit 22c6aad, then this canonical checkpoint records the admitted result.

## Boundaries

- single-shot only
- one bounded prompt in the positive gate call
- cleanup required and used
- no retained session from the positive gate
- no correction loop
- no multi-turn repair mode
- no wait endpoint call
- no ForgePilot runner start endpoint contact
- no OpenCode process start from terminal
- no approval consumption

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
The surfaced OpenCode HTTP lifecycle single-shot gate successfully invoked a hash-matching single-shot lifecycle from the validated FP-MCP-254 plan, created one OpenCode HTTP session, submitted one bounded prompt, observed the expected assistant-role text, deleted the session, wrote preflight/result artifacts, and did not call wait, contact the ForgePilot runner start endpoint, start OpenCode from terminal, or consume approval.
```
