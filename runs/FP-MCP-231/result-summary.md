# FP-MCP-231 Result Summary

## Result

```text
FP_MCP_231_GUARDED_START_EVIDENCE_ORDERING_FIXED
```

## Summary

Recorded and fixed the guarded-start dirty-tree blocker discovered during the FP-MCP-230 one-shot start attempt. The previous rejected start evidence was first preserved in ForgePilot. The MCP bridge guarded start path was then patched so it no longer writes local start-state evidence into the target ForgePilot workspace before contacting the runner. The bridge now defers local non-start/rejection evidence until after runner validation and skips local post-state writes when execution actually starts, preserving a clean target workspace at runner validation time.

## Boundary

No execution was authorized. No approval was consumed. The disable switch was not cleared. The runner start endpoint was not contacted. OpenCode was not started. FP-027 did not run.
