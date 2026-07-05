# FP-MCP-347 — Structured Approval Host Block After Capability Split

## Checkpoint Type

```text
HOST_BLOCK_OBSERVATION
```

## Summary

Record the host-platform block encountered when retrying forgepilot_record_structured_human_approval for FP-MCP-346 scoped to FP-MCP-295, after a successful forgepilot_observe_next_gate live probe and successful FP-MCP-346 packet creation.

## Claim

```text
After FP-MCP-345 capability-separated tools were deployed and FP-MCP-346 was admitted, ChatGPT allowed read-only observe and packet checkpoint recording but blocked a structured approval recorder call for the real FP-MCP-295 execution tuple.
```

## Caveats

- The blocked call occurred before ForgePilot tool invocation completed, so no approval artifact was created.
- This does not invalidate the read-only observe probe, which succeeded.
- This does not test preview_clearance_creation or record_clearance_intent because no fresh committed approval was available.
- The context may have been hot after previous gate/approval discussion.

## Boundaries

- No approval artifact created by the blocked call.
- No approval consumed.
- No clearance created.
- No enablement created.
- No runner start endpoint contacted.
- No OpenCode started.
- No deprecated apply wrapper called.

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
After FP-MCP-345 capability-separated tools were deployed and FP-MCP-346 was admitted, ChatGPT allowed read-only observe and packet checkpoint recording but blocked a structured approval recorder call for the real FP-MCP-295 execution tuple.
```
