# FP-MCP-259 — HTTP Lifecycle Invocation Execution Gate Design

## Checkpoint Type

```text
HTTP_LIFECYCLE_INVOCATION_EXECUTION_GATE_DESIGN
```

## Summary

FP-MCP-259 defines the contract for a future real OpenCode HTTP lifecycle invocation gate without implementing or invoking it. The future gate may only run after a persisted lifecycle plan has passed the FP-MCP-257 reader/validator and the FP-MCP-258 artifact-only dry-run gate. The gate must require an exact plan id, exact source request id, exact plan artifact path, exact promptText and expectedText whose SHA-256 values match the persisted plan, exact lifecycle approval literal RUN_OPENCODE_HTTP_LIFECYCLE_ORCHESTRATOR, and a separate future invocation approval literal that is distinct from dry-run evaluation. Immediately before any lifecycle action, the future gate must re-read the plan, re-read the source request artifact, re-evaluate dry-run eligibility, confirm the plan remains PLAN_RECORDED_NOT_INVOKED, confirm the source request remains CREATED_NOT_STARTED, confirm lifecycleToolName is forgepilot_run_opencode_http_lifecycle_orchestrator, confirm cleanup is explicit, confirm prompt and expected text hashes match, and confirm no prior approval consumption, runner start contact, OpenCode start, or lifecycle invocation is recorded in the plan. If any check fails, the gate must return blocked without touching OpenCode. The first allowed real lifecycle action would be a direct call equivalent to the already-proven bounded lifecycle orchestrator, not the legacy worker path and not the remote runner start endpoint. The execution gate must produce an append-only invocation attempt artifact before and after the lifecycle, including session id if created, completion state, cleanup result, and final boundary booleans.

## Claim

```text
FP_MCP_259_HTTP_LIFECYCLE_INVOCATION_EXECUTION_GATE_CONTRACT_DEFINED_WITHOUT_IMPLEMENTATION
```

## Caveats

- This packet records a design contract only; no real invocation tool was implemented.
- Dry-run eligibility remains non-authorizing and must not be treated as permission.
- A future invocation tool must perform a fresh final preflight at invocation time, not rely on old FP-MCP-258 output.
- The design intentionally keeps the future HTTP lifecycle path separate from legacy worker tools and remote runner start tools.
- Prompt text may be accepted by a future invocation gate only if its SHA-256 matches the persisted plan; the plan artifact itself stores only hashes.

## Boundaries

- No OpenCode session was created.
- No prompt was submitted.
- No wait endpoint was called.
- No session was deleted.
- No OpenCode process was started.
- No runner start endpoint was contacted.
- No approval was consumed.
- No lifecycle was invoked.
- No source code was changed for a real invocation path.

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
FP_MCP_259_HTTP_LIFECYCLE_INVOCATION_EXECUTION_GATE_CONTRACT_DEFINED_WITHOUT_IMPLEMENTATION
```
