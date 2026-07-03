# FP-MCP-217 — Execution Clearance Surface Design Decision

## Checkpoint Type

```text
EXECUTION_CLEARANCE_SURFACE_DESIGN_DECISION
```

## Summary

Record the design decision not to implement a broad MCP-invocable global disable-switch clearing tool as the next step. Execution clearance is the highest-risk surface in the bridge and must not be treated like a normal convenience tool. The preferred first implementation direction is human-local operator-controlled clearance outside the model-callable MCP surface, with MCP tools limited to observing and validating that clearance rather than creating it.

## Claim

```text
FP_MCP_217_EXECUTION_CLEARANCE_SURFACE_DESIGN_DECISION_RECORDED
```

## Caveats

- This packet is a design decision only; no MCP bridge code is modified.
- This packet does not create an execution-clearance tool.
- This packet does not clear the disable switch.
- This packet does not consume approval.
- This packet does not contact the runner start endpoint, start OpenCode, or run FP-027.
- The fresh FP-MCP-216 approval remains valid only until its expiry and must not be consumed while execution remains disabled.
- A future implementation packet must separately design and verify the operator-local clearance mechanism before any execution attempt.

## Boundaries

- execution clearance tool implemented: false
- MCP-invocable global disable-switch clearing approved: false
- execution grant issued by this packet: false
- execution authorized: false
- approval consumed: false
- disable switch cleared: false
- runner start endpoint contacted: false
- OpenCode started: false
- FP-027 canary run: false
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
FP_MCP_217_EXECUTION_CLEARANCE_SURFACE_DESIGN_DECISION_RECORDED
```
