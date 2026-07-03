# FP-MCP-259 Result Summary

## Result

```text
FP_MCP_259_HTTP_LIFECYCLE_INVOCATION_EXECUTION_GATE_CONTRACT_DEFINED_WITHOUT_IMPLEMENTATION
```

## Summary

FP-MCP-259 defines the contract for a future real OpenCode HTTP lifecycle invocation gate without implementing or invoking it. The future gate may only run after a persisted lifecycle plan has passed the FP-MCP-257 reader/validator and the FP-MCP-258 artifact-only dry-run gate. The gate must require an exact plan id, exact source request id, exact plan artifact path, exact promptText and expectedText whose SHA-256 values match the persisted plan, exact lifecycle approval literal RUN_OPENCODE_HTTP_LIFECYCLE_ORCHESTRATOR, and a separate future invocation approval literal that is distinct from dry-run evaluation. Immediately before any lifecycle action, the future gate must re-read the plan, re-read the source request artifact, re-evaluate dry-run eligibility, confirm the plan remains PLAN_RECORDED_NOT_INVOKED, confirm the source request remains CREATED_NOT_STARTED, confirm lifecycleToolName is forgepilot_run_opencode_http_lifecycle_orchestrator, confirm cleanup is explicit, confirm prompt and expected text hashes match, and confirm no prior approval consumption, runner start contact, OpenCode start, or lifecycle invocation is recorded in the plan. If any check fails, the gate must return blocked without touching OpenCode. The first allowed real lifecycle action would be a direct call equivalent to the already-proven bounded lifecycle orchestrator, not the legacy worker path and not the remote runner start endpoint. The execution gate must produce an append-only invocation attempt artifact before and after the lifecycle, including session id if created, completion state, cleanup result, and final boundary booleans.

## Boundary

No execution was authorized. No approval was consumed. The disable switch was not cleared. The runner start endpoint was not contacted. OpenCode was not started. FP-027 did not run.
