# FP-MCP-287 Result Summary

## Result

```text
ForgePilot MCP should treat the remote runner as legacy optional infrastructure for now; the preferred near-term path for OpenCode model lifecycle work is the direct OpenCode HTTP API from the MCP bridge, with runner-start no longer required for the first HTTP-based model runs.
```

## Summary

FP-MCP-287 records the operator decision to keep the remote runner available for legacy/optional purposes while proceeding on the direct OpenCode HTTP lifecycle path. This checkpoint does not refactor server.ts, does not start OpenCode, does not contact the runner start endpoint, does not consume approval, and does not authorize model execution. It exists to mark the architectural pivot before preparing direct-HTTP lifecycle/model-run work.

## Boundary

No execution was authorized. No approval was consumed. The disable switch was not cleared. The runner start endpoint was not contacted. OpenCode was not started. FP-027 did not run.
