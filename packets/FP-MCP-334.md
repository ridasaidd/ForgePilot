# FP-MCP-334 — Fresh Session Guarded Wrapper Expired Approval Probe

## Checkpoint Type

```text
HOST_BOUNDARY_CHARACTERIZATION
```

## Summary

Record that forgepilot_apply_guarded_canary_next_gate was allowed by the ChatGPT host at the PREVIEW_CLEARANCE stage. ForgePilot did not apply the gate because the FP-MCP-331 approval was expired or invalid. No files were written, no approval was consumed, no runner endpoint was contacted, and OpenCode was not started.

## Claim

```text
A fresh ChatGPT session could invoke the exposed guarded next-gate wrapper, and ForgePilot safely blocked progression because the approval had expired.
```

## Caveats

- This does not prove the wrapper will be allowed with a fresh valid approval.
- This does not create clearance.
- This does not test enablement.
- This does not reach final guarded execution.
- This does not start OpenCode.

## Boundaries

- ForgePilot rejected progression due to expired approval.
- No approval consumed.
- No files written by the wrapper.
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
A fresh ChatGPT session could invoke the exposed guarded next-gate wrapper, and ForgePilot safely blocked progression because the approval had expired.
```
