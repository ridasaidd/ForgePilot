# FP-MCP-267 — Operator Workflow Trace Legacy Normalization Live Surfacing

## Checkpoint Type

```text
POST_RELOAD_TOOL_SURFACING_RESULT
```

## Summary

After MCP reload, the live forgepilot_summarize_operator_workflow_traces tool was called for packetId OPERATOR and workflowId FP-MCP-266-session-orientation. It returned traceCount 4, deviationCounts WRONG_ADJACENT_TOOL_CALLED: 3 and UNEXPECTED_SIDE_EFFECT: 1, side-effect counts, tool mismatch listings, and read-only boundary flags. A V1 workflow trace recording this live-surface proof was written and committed before this checkpoint.

## Claim

```text
FP-MCP-267 legacy/manual trace normalization is now visible through the live ChatGPT MCP summarizer: older V0 OPERATOR traces summarize as event-level deviations instead of UNKNOWN-only records.
```

## Caveats

- The live result confirms summarizer normalization behavior is visible through ChatGPT MCP, but it also preserves the underlying control-plane deviations from the historical traces.
- This checkpoint does not mutate historical V0 trace files; it records read-only summarizer behavior.
- No live OpenCode lifecycle action was performed.

## Boundaries

- No OpenCode process was started.
- No OpenCode HTTP session was created.
- No prompt was submitted.
- No wait endpoint was called.
- No ForgePilot runner start endpoint was contacted.
- No execution approval was consumed.
- No disable switch was cleared.
- No secrets or .env files were read.

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
FP-MCP-267 legacy/manual trace normalization is now visible through the live ChatGPT MCP summarizer: older V0 OPERATOR traces summarize as event-level deviations instead of UNKNOWN-only records.
```
