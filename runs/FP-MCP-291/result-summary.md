# FP-MCP-291 Result Summary

## Result

```text
FP-MCP-291 chooses the lower-risk Option B: direct OpenCode HTTP is permanently narrower-scoped as a design, canary, endpoint-shape, assistant-completion, and planning tool, and must not carry implementation execution authority for real workspace-changing code edits; real workspace-changing work remains assigned to the guarded/worker path and its safety gates.
```

## Summary

FP-MCP-291 resolves the fork left open by FP-MCP-289 and FP-MCP-290. The decision rejects maintaining two independent proven-safe execution paths indefinitely. Direct HTTP remains useful for bounded planning and canary interactions, but it is not safety-equivalent to FP-027 and must not be used to satisfy FP-027 by resemblance. The abort question for direct HTTP is closed by scope rather than by equivalence: session deletion remains not admitted as a proven abort primitive, but no direct-HTTP abort primitive is required while direct HTTP remains outside real workspace-changing work. Any future attempt to expand direct HTTP beyond this scope is an architecture reversal requiring a new auditor-reviewed packet and missing safety-property proofs before scope changes. Steering docs were updated in commit dc6b6d3. No implementation, execution, approval consumption, disable switch change, OpenCode start, runner-start contact, or server.ts refactor is authorized by this packet.

## Boundary

No execution was authorized. No approval was consumed. The disable switch was not cleared. The runner start endpoint was not contacted. OpenCode was not started. FP-027 did not run.
