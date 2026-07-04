# FP-MCP-340 — Guarded Wrapper Preview Follow-On Contract

## Checkpoint Type

```text
CONTRACT_CLARIFICATION
```

## Summary

Record the read-only implementation finding that forgepilot_apply_guarded_canary_next_gate accepts applyPreviewFollowOn?: boolean. At PREVIEW_CLEARANCE, the wrapper returns preview-only when applyPreviewFollowOn is absent or false. It invokes createOperatorLocalExecutionClearance only after a successful preview and applyPreviewFollowOn: true. The repeated-preview result in FP-MCP-339 was therefore caused by a missing follow-on confirmation argument, not by host blocking, approval failure, or raw-tool exposure.

## Claim

```text
The guarded next-gate wrapper intentionally returns clearance preview only unless applyPreviewFollowOn is true.
```

## Caveats

- No code was modified.
- No clearance was created.
- No enablement was tested.
- No runner endpoint was contacted.
- OpenCode was not started.

## Boundaries

- Contract clarification only.
- Read-only implementation inspection.
- No wrapper invocation in this checkpoint.
- No approval consumption.
- No control change.

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
The guarded next-gate wrapper intentionally returns clearance preview only unless applyPreviewFollowOn is true.
```
