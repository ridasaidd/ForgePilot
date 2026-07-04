# FP-MCP-340 Result Summary

## Result

```text
The guarded next-gate wrapper intentionally returns clearance preview only unless applyPreviewFollowOn is true.
```

## Summary

Record the read-only implementation finding that forgepilot_apply_guarded_canary_next_gate accepts applyPreviewFollowOn?: boolean. At PREVIEW_CLEARANCE, the wrapper returns preview-only when applyPreviewFollowOn is absent or false. It invokes createOperatorLocalExecutionClearance only after a successful preview and applyPreviewFollowOn: true. The repeated-preview result in FP-MCP-339 was therefore caused by a missing follow-on confirmation argument, not by host blocking, approval failure, or raw-tool exposure.

## Boundary

No execution was authorized. No approval was consumed. The disable switch was not cleared. The runner start endpoint was not contacted. OpenCode was not started. FP-027 did not run.
