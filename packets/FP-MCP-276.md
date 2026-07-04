# FP-MCP-276 — Fresh Scoped Guarded Start Tuple Preparation

## Checkpoint Type

```text
PREPARATION_BOUNDARY
```

## Summary

This packet establishes the boundary for fresh scoped tuple preparation after FP-MCP-275 showed guarded runner start is still blocked. FP-MCP-276 may create a non-executing request artifact, validate and read that request, and prepare the exact approval text/path that a competent operator would later review. It must stop before recording real human approval unless the operator explicitly approves after reviewing the request and manifest. It must also stop before clearance creation, approval consumption, disable-switch handling, runner start contact, OpenCode start, prompt submission, wait calls, or any canary execution.

## Claim

```text
FP-MCP-276 is authorized only to prepare a fresh non-executing request and approval path for a future guarded start; it does not itself authorize human approval, clearance creation, disable-switch changes, runner contact, OpenCode start, prompt submission, wait calls, or canary execution.
```

## Caveats

- Proceeding with preparation is not approval to execute.
- Human approval requires a later explicit approval after reviewing the fresh request and manifest.
- Any future clearance must be preceded by the FP-MCP-273 preview tool against the fresh tuple.
- Global disable and execution enablement blockers from FP-MCP-275 remain active.

## Boundaries

- request artifact preparation allowed
- request validation/read allowed
- approval path preparation allowed
- real human approval not authorized by this checkpoint
- clearance creation not authorized
- approval consumption not authorized
- disable switch change not authorized
- runner start contact not authorized
- OpenCode start not authorized
- prompt submission not authorized
- wait call not authorized
- canary execution not authorized

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
FP-MCP-276 is authorized only to prepare a fresh non-executing request and approval path for a future guarded start; it does not itself authorize human approval, clearance creation, disable-switch changes, runner contact, OpenCode start, prompt submission, wait calls, or canary execution.
```
