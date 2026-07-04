# FP-MCP-308 — Gate Sequencer Implementation

## Checkpoint Type

```text
TOOL_IMPLEMENTATION_RESULT
```

## Summary

Implemented src/guarded-canary-gate-sequencer.ts and registered forgepilot_get_guarded_canary_next_gate in src/server.ts. The tool inspects current state and returns nextRequiredGate, nextToolName, nextToolArguments, followOnAfterSuccess, reasons, and boundary. MCP bridge pnpm build passed and pnpm test passed.

## Claim

```text
FP-MCP-308 added a read-only next-gate sequencer tool in the MCP bridge. Bridge commit 6b6fcc3 contains the implementation and tests pass.
```

## Caveats

- The MCP service may need restart or action refresh before the new tool is available in chat.
- This packet records implementation only.
- The tool is read-only.

## Boundaries

- no state-changing gate action performed by this checkpoint
- no model task performed
- no direct HTTP path used

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
FP-MCP-308 added a read-only next-gate sequencer tool in the MCP bridge. Bridge commit 6b6fcc3 contains the implementation and tests pass.
```
