# FP-MCP-288 — Direct OpenCode HTTP Design Lifecycle Smoke Result

## Checkpoint Type

```text
DIRECT_HTTP_MODEL_LIFECYCLE_RESULT
```

## Summary

FP-MCP-288 records that the direct OpenCode HTTP path is operational beyond read-only status checks. A minimal assistant-completion probe succeeded, and a bounded pure-design lifecycle prompt for MCP server.ts decomposition also succeeded after the first operation-worded prompt was correctly blocked by the lifecycle boundary. The successful lifecycle created one session, submitted one async prompt, observed the expected assistant marker SERVER_TS_REFACTOR_PLAN_READY, and deleted the session. This is sufficient to proceed toward a model-assisted server.ts refactor packet, while preserving the runner as legacy optional infrastructure.

## Claim

```text
The MCP bridge successfully used the direct OpenCode HTTP lifecycle path for a bounded design-only model interaction, without contacting the remote runner start endpoint, starting OpenCode, calling wait, or leaving the created session behind.
```

## Caveats

- The first design prompt was blocked by PROMPT_BLOCKED_BY_CANARY_BOUNDARY because it contained operation-like language; this is expected fail-closed behavior.
- The successful design lifecycle returned only a bounded assistant excerpt in the tool result; full design content was not retained after cleanup.
- No source code was modified by this checkpoint.
- This does not yet prove a model can safely perform code edits through the direct HTTP path; it proves bounded design interaction works.

## Boundaries

- runner start endpoint not contacted
- OpenCode process not started by the MCP bridge
- wait endpoint not called
- created session deleted
- approval not consumed
- disable switch not cleared
- server.ts not modified
- no workspace refactor performed

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
The MCP bridge successfully used the direct OpenCode HTTP lifecycle path for a bounded design-only model interaction, without contacting the remote runner start endpoint, starting OpenCode, calling wait, or leaving the created session behind.
```
