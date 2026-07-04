# FP-MCP-318 — Guarded Canary Runner Start Executor Extension

## Checkpoint Type

```text
NEXT_PACKET_PROPOSAL
```

## Summary

FP-MCP-317 proved the live FP-MCP-316 executor can advance from fresh approval through clearance and scoped enablement while stopping before runner start. FP-MCP-318 is the next implementation target and should route the final runner-start gate through the same single enforced executor path. It must preserve the narrowed default action surface, prevent direct operator selection of adjacent runner-start tools, and make runner start a sequencer-selected, preflight-bound, one-attempt action only.

## Claim

```text
FP-MCP-318 should extend forgepilot_apply_guarded_canary_next_gate by exactly one final guarded stage: when valid approval, valid operator-local clearance, valid scoped execution enablement, fresh runner capability observation, and valid evidence/preflight bindings exist for the FP-MCP-295 canary tuple, the enforced executor may perform one bounded runner-start attempt and then stop.
```

## Caveats

- This is a packet proposal/checkpoint, not the implementation itself.
- All previous approvals, clearances, and scoped enablements should be treated as expired before any runner-start test.
- This is the first extension that may contact the runner start endpoint, so implementation and testing must be stricter than prior local-gate packets.

## Boundaries

- Must use only forgepilot_apply_guarded_canary_next_gate for the final start path.
- Must not expose forgepilot_start_remote_runner_request directly in the default narrowed guarded surface.
- Must consume approval only if the runner-start attempt is actually invoked according to the existing start contract.
- Must not start arbitrary OpenCode outside the remote runner contract.
- Must perform at most one bounded runner-start attempt.
- Must stop immediately after the runner-start result is returned.
- Must preserve global disable switch and preflight gating behavior.
- Must record or preserve pre-start/post-start evidence according to the existing runner-start contract.

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
FP-MCP-318 should extend forgepilot_apply_guarded_canary_next_gate by exactly one final guarded stage: when valid approval, valid operator-local clearance, valid scoped execution enablement, fresh runner capability observation, and valid evidence/preflight bindings exist for the FP-MCP-295 canary tuple, the enforced executor may perform one bounded runner-start attempt and then stop.
```
