# FP-MCP-314 — Canary Action Surface Narrowing

## Checkpoint Type

```text
TOOL_SURFACE_HARDENING_RESULT
```

## Summary

The MCP bridge repository feature/oauth-auth0 advanced to 0c2d3cb with commit 'Narrow guarded canary action surface'. The change adds CANARY_ACTION_SURFACE_NARROWED defaulting to true and wraps adjacent guarded canary manual tool registrations behind if (!CANARY_ACTION_SURFACE_NARROWED). The enforced executor tool forgepilot_apply_guarded_canary_next_gate remains registered outside the narrow-surface guard. TypeScript compilation passed after the change.

## Claim

```text
FP-MCP-314 narrowed the default MCP bridge canary action surface so adjacent manual guarded canary tools are hidden unless FORGEPILOT_CANARY_ACTION_SURFACE_NARROWED=0. The enforced executor remains registered by default. Bridge commit 0c2d3cb contains the implementation.
```

## Caveats

- The MCP service must be restarted or actions refreshed before the narrowed surface appears in chat.
- The narrowed action surface is controlled by FORGEPILOT_CANARY_ACTION_SURFACE_NARROWED and defaults to narrowed unless set to 0.
- This packet does not run the canary.
- This packet does not create a new approval, clearance, or enablement.

## Boundaries

- implementation result only
- no approval created
- no approval consumed
- no clearance created
- no enablement created
- no runner start contact
- no OpenCode start
- no prompt submitted
- no canary run

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
FP-MCP-314 narrowed the default MCP bridge canary action surface so adjacent manual guarded canary tools are hidden unless FORGEPILOT_CANARY_ACTION_SURFACE_NARROWED=0. The enforced executor remains registered by default. Bridge commit 0c2d3cb contains the implementation.
```
