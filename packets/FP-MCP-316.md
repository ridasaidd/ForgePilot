# FP-MCP-316 — Guarded Canary Scoped Enablement Executor Extension

## Checkpoint Type

```text
NEXT_PACKET_PROPOSAL
```

## Summary

This packet is the next implementation target after FP-MCP-315. It should preserve the narrowed action surface and prevent operator selection of adjacent manual enablement tools by routing the next enablement gate through the sequencer-selected enforced executor path only. The extension must not contact runner start, consume approval, start OpenCode, or run the canary.

## Claim

```text
FP-MCP-316 should extend forgepilot_apply_guarded_canary_next_gate by exactly one guarded stage: when a valid scoped approval and valid operator-local clearance already exist for the FP-MCP-295 canary tuple, the enforced executor may internally preview and create scoped execution enablement, then stop before runner start.
```

## Caveats

- This is a packet proposal/checkpoint for the next implementation target, not the implementation itself.
- Any FP-MCP-315 clearance must be treated as expired and not reused.
- Runner start remains explicitly out of scope for FP-MCP-316.

## Boundaries

- Must not contact the runner start endpoint.
- Must not consume approval.
- Must not start OpenCode.
- Must not run the canary.
- Must not create or expose broad/standing enablement.
- Must not proceed beyond scoped enablement creation.
- Must keep adjacent manual enablement tools hidden from the default narrowed action surface.

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
FP-MCP-316 should extend forgepilot_apply_guarded_canary_next_gate by exactly one guarded stage: when a valid scoped approval and valid operator-local clearance already exist for the FP-MCP-295 canary tuple, the enforced executor may internally preview and create scoped execution enablement, then stop before runner start.
```
