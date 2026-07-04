# FP-MCP-291 — Direct OpenCode HTTP Scope Decision

## Checkpoint Type

```text
ARCHITECTURE_SCOPE_DECISION
```

## Summary

FP-MCP-291 resolves the fork left open by FP-MCP-289 and FP-MCP-290. The decision rejects maintaining two independent proven-safe execution paths indefinitely. Direct HTTP remains useful for bounded planning and canary interactions, but it is not safety-equivalent to FP-027 and must not be used to satisfy FP-027 by resemblance. The abort question for direct HTTP is closed by scope rather than by equivalence: session deletion remains not admitted as a proven abort primitive, but no direct-HTTP abort primitive is required while direct HTTP remains outside real workspace-changing work. Any future attempt to expand direct HTTP beyond this scope is an architecture reversal requiring a new auditor-reviewed packet and missing safety-property proofs before scope changes. Steering docs were updated in commit dc6b6d3. No implementation, execution, approval consumption, disable switch change, OpenCode start, runner-start contact, or server.ts refactor is authorized by this packet.

## Claim

```text
FP-MCP-291 chooses the lower-risk Option B: direct OpenCode HTTP is permanently narrower-scoped as a design, canary, endpoint-shape, assistant-completion, and planning tool, and must not carry implementation execution authority for real workspace-changing code edits; real workspace-changing work remains assigned to the guarded/worker path and its safety gates.
```

## Caveats

- This decision does not prove or implement direct-HTTP abort semantics.
- This decision does not weaken FP-027; FP-027 remains open and unsatisfied.
- This decision forecloses incremental direct-HTTP capability creep: expansion requires a new architecture-reversal packet.
- Direct HTTP can still be used for bounded design/canary/planning interactions that do not perform real workspace-changing work.
- The server.ts refactor must use the accepted guarded/worker path or human/GPT manual maintenance under explicit packet boundaries, not direct-HTTP execution authority.

## Boundaries

- decision-only packet
- no implementation changes beyond steering documentation
- no MCP bridge source changes
- no OpenCode session created
- no prompt submitted
- no runner start endpoint contact
- no approval consumed
- no disable switch cleared
- no FP-027 canary run
- no server.ts refactor

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
FP-MCP-291 chooses the lower-risk Option B: direct OpenCode HTTP is permanently narrower-scoped as a design, canary, endpoint-shape, assistant-completion, and planning tool, and must not carry implementation execution authority for real workspace-changing code edits; real workspace-changing work remains assigned to the guarded/worker path and its safety gates.
```
