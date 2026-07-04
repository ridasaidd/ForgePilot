# FP-MCP-314 — Canary Action Surface Narrowing

## Checkpoint Type

```text
TOOL_IMPLEMENTATION_RESULT
```

## Summary

The MCP bridge repository feature/oauth-auth0 advanced from 5a75db7 to 0c2d3cb with commit 'Narrow guarded canary action surface'. The change adds CANARY_ACTION_SURFACE_NARROWED, defaulting to true unless FORGEPILOT_CANARY_ACTION_SURFACE_NARROWED=0. When narrow mode is active, the bridge does not register manual adjacent canary tools for execution preflight, guarded start preflight report, runner start, execution gate orientation, local clearance preview/create, scoped enablement preview/create/status. The enforced executor forgepilot_apply_guarded_canary_next_gate remains registered. pnpm test passed, including TypeScript build and hardcoded packet-id lint.

## Claim

```text
FP-MCP-314 narrowed the guarded canary action surface in the MCP bridge by default. Adjacent manual canary gate tools are no longer registered unless FORGEPILOT_CANARY_ACTION_SURFACE_NARROWED=0 is set. Bridge commit 0c2d3cb contains the implementation.
```

## Caveats

- The MCP service must be restarted or actions refreshed before the narrowed action surface is visible in chat.
- The individual lower-level tools still exist in source and can be exposed by setting FORGEPILOT_CANARY_ACTION_SURFACE_NARROWED=0 for development/debugging.
- This packet did not run the canary.
- This packet did not create approval, clearance, enablement, or contact runner start.

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
FP-MCP-314 narrowed the guarded canary action surface in the MCP bridge by default. Adjacent manual canary gate tools are no longer registered unless FORGEPILOT_CANARY_ACTION_SURFACE_NARROWED=0 is set. Bridge commit 0c2d3cb contains the implementation.
```
