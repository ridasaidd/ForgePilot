# FP-MCP-267 — Operator Workflow Trace Legacy Normalization

## Checkpoint Type

```text
TOOL_IMPLEMENTATION_RESULT
```

## Summary

Updated the operator workflow trace summarizer to normalize both OPERATOR_WORKFLOW_TRACE_V1 records and earlier manual V0 trace artifacts with nested events arrays. The summarizer now expands legacy event entries, preserves root workflow metadata, counts event-level deviations, counts actual or declared side effects, lists tool mismatches, and adds review focus for missing or unrecognized deviation fields only when needed. Build and test passed, and a direct built-module validation against existing OPERATOR V0 traces returned four normalized events with WRONG_ADJACENT_TOOL_CALLED: 3 and UNEXPECTED_SIDE_EFFECT: 1.

## Claim

```text
FP-MCP-267 implemented legacy/manual operator workflow trace normalization in the MCP bridge summarizer, replacing UNKNOWN-only summaries for V0 manual trace artifacts with normalized deviation and side-effect counts.
```

## Caveats

- This implementation was validated through build/test and direct built-module execution, but the running MCP service may need reload before the updated summarizer behavior is visible through ChatGPT MCP.
- The packet does not change the writer schema and does not mutate historical V0 trace files.
- The workspace inspection tool continued to display a path as rc/operator-workflow-trace.ts and staged status for raw M status; raw git status was used as source of truth.

## Boundaries

- No OpenCode process was started.
- No OpenCode HTTP session was created.
- No prompt was submitted.
- No wait endpoint was called.
- No ForgePilot runner start endpoint was contacted.
- No execution approval was consumed.
- No disable switch was cleared.
- No secrets or .env files were read.
- Terminal was used only for repo inspection, source edit, build/test, direct module validation, and commit scaffolding.

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
FP-MCP-267 implemented legacy/manual operator workflow trace normalization in the MCP bridge summarizer, replacing UNKNOWN-only summaries for V0 manual trace artifacts with normalized deviation and side-effect counts.
```
