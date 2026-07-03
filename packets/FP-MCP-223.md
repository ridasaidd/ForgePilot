# FP-MCP-223 — Fresh Request Tuple for Operator-Local Clearance Path

## Checkpoint Type

```text
FRESH_REQUEST_TUPLE_PREPARATION
```

## Summary

Create the FP-MCP-223 non-executing packet anchor so a fresh request artifact can be recorded against current ForgePilot HEAD after FP-MCP-222. The prior FP-MCP-209 request and FP-MCP-216 approval tuple is stale and must not be used for operator-local clearance. This checkpoint records preparation only and does not create local clearance, consume approval, clear the disable switch, contact the runner start endpoint, start OpenCode, or run FP-027.

## Claim

```text
FP_MCP_223_FRESH_REQUEST_TUPLE_PREPARATION_RECORDED
```

## Caveats

- Several attempted non-executing request artifact recordings for FP-MCP-223 failed closed with UNKNOWN_PACKET before this packet anchor existed; those attempts created no request artifact and did not authorize or start execution.
- The old FP-MCP-209 tuple remains stale because its target execution commit is 4bd1977, while ForgePilot HEAD after FP-MCP-222 is 219fe9d before this checkpoint.
- Fresh request and fresh approval must be bound to the post-checkpoint current HEAD, not to the old FP-MCP-209 tuple.
- This checkpoint does not create the operator-local clearance artifact; that remains a human-local act outside the model-callable MCP surface under FP-MCP-217.

## Boundaries

- execution authorized: false
- approval consumed: false
- disable switch cleared: false
- runner start endpoint contacted: false
- OpenCode started: false
- FP-027 canary run: false
- local clearance artifact created: false
- standing execution authority created: false

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
FP_MCP_223_FRESH_REQUEST_TUPLE_PREPARATION_RECORDED
```
