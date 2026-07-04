# FP-MCP-292 — Refactor Execution Ordering Decision

## Checkpoint Type

```text
EXECUTION_ORDERING_DECISION
```

## Summary

FP-MCP-292 accepts the auditor's ordering correction. The refactor is a real workload and should not be used as the first proof of an unproven safety chain. Model-executed observed refactor work remains desirable, but it must come after a minimal FP-027 canary proves the guarded/worker path discipline on a throwaway task: one worker, DESIGN_ONLY, no source edits, process/state evidence at the contact boundary, live stop-readiness, no retry, no chaining, and admitted result evidence. The alternative is an explicit human/GPT manual-maintenance refactor packet, which is safe to do separately because it does not rely on the guarded/worker path. Direct HTTP remains design/canary/planning only under FP-MCP-291. Steering docs were updated in commit 4b704f6. No execution, refactor, OpenCode start, runner-start contact, approval consumption, or disable-switch change is authorized.

## Claim

```text
FP-MCP-292 decides that the MCP bridge server.ts registration-extraction refactor must not be the first real test of the guarded/worker execution safety chain: if model-executed, a minimal FP-027 guarded/worker canary on a boring non-refactor task must be completed and admitted first; if done before FP-027, the refactor must be explicitly packetized as human/GPT manual maintenance, not model execution and not direct-HTTP execution authority.
```

## Caveats

- This decision does not run FP-027.
- This decision does not authorize the server.ts refactor.
- This decision does not choose manual maintenance; it only defines manual maintenance as the only immediate refactor path before FP-027.
- If the project wants open-weight model execution for the refactor, FP-027 canary must come first.
- Direct HTTP remains unavailable for implementation execution authority.

## Boundaries

- decision-only packet
- no MCP bridge source changes
- no server.ts refactor
- no OpenCode session created
- no prompt submitted
- no runner start endpoint contact
- no approval consumed
- no disable switch cleared
- no FP-027 canary run
- no model execution authorized

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
FP-MCP-292 decides that the MCP bridge server.ts registration-extraction refactor must not be the first real test of the guarded/worker execution safety chain: if model-executed, a minimal FP-027 guarded/worker canary on a boring non-refactor task must be completed and admitted first; if done before FP-027, the refactor must be explicitly packetized as human/GPT manual maintenance, not model execution and not direct-HTTP execution authority.
```
