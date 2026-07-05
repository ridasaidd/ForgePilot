# FP-MCP-348 — FP-MCP-345 committed approval observe result

## Checkpoint Type

```text
CAPABILITY_SPLIT_LIVE_PROBE_RESULT
```

## Summary

After core and bridge clean-state verification, ChatGPT called forgepilot_observe_next_gate for FP-MCP-295 with approval APPROVAL-20260705T090508444Z-662c8664. The approval artifact was tracked and committed, but the observer reported valid=false with reason APPROVAL_EXPIRED_OR_INVALID because expiresAt was 2026-07-05T09:50:00.000Z and checkedAt was 2026-07-05T09:59:30.068Z. The capability-separated observer remained read-only and reported no files written, no approval consumed, no runner start endpoint contact, no OpenCode start, and no guarded canary run.

## Claim

```text
Committed fresh-session approval artifact was observed safely but was expired, so the next gate remained RECORD_APPROVAL and no clearance preview was attempted.
```

## Caveats

- This does not invalidate FP-MCP-345; it confirms the committed-artifact path and expiry gate behavior.
- The clearance preview was intentionally not called because the approval was not eligible.
- A fresh structured approval with a later expiry is required before retrying PREVIEW_CLEARANCE.

## Boundaries

- Did not call deprecated forgepilot_apply_guarded_canary_next_gate.
- Did not create clearance.
- Did not create enablement.
- Did not consume approval.
- Did not clear the disable switch.
- Did not contact runner start.
- Did not start OpenCode.

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
Committed fresh-session approval artifact was observed safely but was expired, so the next gate remained RECORD_APPROVAL and no clearance preview was attempted.
```
