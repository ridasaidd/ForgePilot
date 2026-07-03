# FP-MCP-241 — Fresh Guarded Start Lifecycle Preparation

## Checkpoint Type

```text
CANARY_PREPARATION
```

## Summary

Prepare a fresh DESIGN_ONLY lifecycle verification after FP-MCP-240. The planned sequence is fresh request artifact, fresh approval, popup local clearance, pre-contact discipline gate, one guarded start attempt, immediate approval consumption, output preservation, and final admitted evidence. This checkpoint is only a preparation record.

## Claim

```text
FP_MCP_241_FRESH_LIFECYCLE_CANARY_PREPARATION_RECORDED
```

## Caveats

- Preparation only.
- No request artifact is created by this checkpoint.
- No approval is created by this checkpoint.
- No clearance is created by this checkpoint.
- No runner contact or OpenCode start occurs in this checkpoint.
- The later start attempt must be exactly one attempt and must verify immediate approval consumption.

## Boundaries

- execution authorized: false
- approval consumed: false
- disable switch cleared: false
- runner start endpoint contacted: false
- OpenCode started: false
- FP-027 canary run: false

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
FP_MCP_241_FRESH_LIFECYCLE_CANARY_PREPARATION_RECORDED
```
