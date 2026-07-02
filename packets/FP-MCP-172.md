# FP-MCP-172 — Fresh FP-027 Canary Restart Attempt

## Task

Restart the FP-027 canary sequence from a clean state after FP-MCP-171 recorded a premature blocked start invocation.

This packet must first confirm that the prior blocked invocation left no lingering state on the old FP-MCP-159 request, then use a fresh request artifact for the canary sequence to avoid overwriting previously admitted evidence artifacts.

## Goals

1. Confirm the FP-MCP-171 blocked invocation left no partial real state.
2. Avoid mutating old FP-MCP-159 pre-start/snapshot artifacts.
3. Prepare a fresh single-worker DESIGN_ONLY canary attempt.
4. Stop after one attempt/result, with no retry and no chained follow-up action.

## Safety boundaries

```text
no retry
no fan-out
single worker only
DESIGN_ONLY only
no mutation requirement
abort-readiness check only if worker id exists
```

## Expected result

```text
FP_027_CANARY_RESTART_ATTEMPT_RECORDED
```
