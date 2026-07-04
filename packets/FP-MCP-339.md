# FP-MCP-339 — Guarded Wrapper Repeats Clearance Preview

## Checkpoint Type

```text
WRAPPER_PROGRESS_CHARACTERIZATION
```

## Summary

Record that FP-MCP-338 created and validated a fresh approval, then called forgepilot_apply_guarded_canary_next_gate twice. Both wrapper calls were allowed by the host. The first call returned preview-only PREVIEW_CLEARANCE as expected. The second call also returned PREVIEW_CLEARANCE, wrote no files, consumed no approval, did not clear controls, did not contact the runner start endpoint, and did not start OpenCode. This suggests the wrapper does not currently advance from preview to clearance creation without an additional confirmation signal or implementation change.

## Claim

```text
The exposed guarded next-gate wrapper was allowed by the ChatGPT host with a fresh valid approval, but repeated calls returned PREVIEW_CLEARANCE and did not create clearance.
```

## Caveats

- This is not a ChatGPT host block.
- This is not a ForgePilot approval validation failure.
- This does not create clearance.
- This does not test enablement.
- This does not reach final guarded execution.
- This does not start OpenCode.

## Boundaries

- No files written by the wrapper.
- No approval consumed.
- No clearance artifact written.
- No runner contact.
- No OpenCode start.
- No token handling.

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
The exposed guarded next-gate wrapper was allowed by the ChatGPT host with a fresh valid approval, but repeated calls returned PREVIEW_CLEARANCE and did not create clearance.
```
