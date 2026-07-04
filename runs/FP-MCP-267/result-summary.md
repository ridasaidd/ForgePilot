# FP-MCP-267 Result Summary

## Result

```text
FP-MCP-267 legacy/manual trace normalization is now visible through the live ChatGPT MCP summarizer: older V0 OPERATOR traces summarize as event-level deviations instead of UNKNOWN-only records.
```

## Summary

After MCP reload, the live forgepilot_summarize_operator_workflow_traces tool was called for packetId OPERATOR and workflowId FP-MCP-266-session-orientation. It returned traceCount 4, deviationCounts WRONG_ADJACENT_TOOL_CALLED: 3 and UNEXPECTED_SIDE_EFFECT: 1, side-effect counts, tool mismatch listings, and read-only boundary flags. A V1 workflow trace recording this live-surface proof was written and committed before this checkpoint.

## Boundary

No execution was authorized. No approval was consumed. The disable switch was not cleared. The runner start endpoint was not contacted. OpenCode was not started. FP-027 did not run.
