# FP-MCP-344 — Guarded Wrapper Follow-On Flag Isolation

## Checkpoint Type

```text
HOST_BOUNDARY_CHARACTERIZATION
```

## Summary

Record that forgepilot_apply_guarded_canary_next_gate was allowed by the ChatGPT host when called with debug packet/request/approval context and applyPreviewFollowOn: true. ForgePilot safely rejected the call because the request artifact was missing or invalid and the next gate was unsupported by the executor. No files were written, no approval was consumed, no runner endpoint was contacted, and OpenCode was not started.

## Claim

```text
The applyPreviewFollowOn flag alone does not trigger a ChatGPT host block when used with debug context.
```

## Caveats

- This did not use the real FP-MCP-295 request tuple.
- This did not use a valid approval.
- This does not prove the real late-gate follow-on path is host-allowed.
- This does not create clearance.
- This does not test enablement.
- This does not reach final guarded execution.

## Boundaries

- Debug context only.
- No files written.
- No approval consumed.
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
The applyPreviewFollowOn flag alone does not trigger a ChatGPT host block when used with debug context.
```
