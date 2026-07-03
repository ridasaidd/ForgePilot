# FP-MCP-209 — Fresh Guarded Request Path Preparation

## Checkpoint Type

```text
FRESH_GUARDED_REQUEST_PATH_PREPARATION
```

## Summary

Record the decision to prepare a fresh non-executing guarded request path after FP-MCP-208 completed the workspace change inspection tool. The old FP-MCP-183 request/approval path is stale and must not be reused. This checkpoint creates a known packet before any request artifact creation attempt.

## Claim

```text
FP_MCP_209_FRESH_GUARDED_REQUEST_PATH_PREPARATION_RECORDED
```

## Caveats

- This checkpoint does not create a request artifact yet; it creates a known packet for the next request-artifact step.
- The old FP-MCP-183 approval is expired and bound to a stale target commit; it must not be reused.
- Execution remains globally disabled at this point.
- A future request artifact must be fresh and bound to the current target commit.
- A future approval must be fresh, scoped, single-use, and bound exactly to the fresh request artifact and commit.

## Boundaries

- execution authorized: false
- approval consumed: false
- disable switch cleared: false
- runner start endpoint contacted: false
- OpenCode started: false
- FP-027 canary run: false
- request artifact created by this checkpoint: false
- human approval created by this checkpoint: false
- terminal packet creation used: false

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
FP_MCP_209_FRESH_GUARDED_REQUEST_PATH_PREPARATION_RECORDED
```
