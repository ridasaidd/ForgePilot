# FP-MCP-155 Executor Result

## Status

ACCEPTED_FOR_REVIEW

## Implementation Repository

`/home/ridasaidd/forgepilot-chatgpt-mcp`

## Implementation Branch

`feature/oauth-auth0`

## Implementation Commit

`7ba74e4` — Refactor recent MCP tool registrations

## Packet

`packets/FP-MCP-155.md`

## Summary

FP-MCP-155 performed a bounded MCP bridge refactor.

Moved recent/scoped MCP tool schemas and registrations out of `src/server.ts` into:

`src/tool-registrations/recent-tools.ts`

Scoped tools moved:

- `forgepilot_capture_workspace_snapshot`
- `forgepilot_start_opencode_worker`
- `forgepilot_get_opencode_worker_status`
- `forgepilot_read_opencode_worker_result`
- `forgepilot_capture_opencode_worker_telemetry`
- `forgepilot_read_opencode_worker_telemetry`

`src/server.ts` now imports:

`registerRecentToolRegistrations`

and calls it from `createMcpServer`.

## Refactor Result

`src/server.ts` diffstat:

- 2 insertions
- 272 deletions

New module:

`src/tool-registrations/recent-tools.ts`

This preserves the public tool names, schemas, descriptions, annotations, `runLoggedTool`, and `structuredJsonResult` behavior for the scoped tools.

## Verification

### Build

Command:

`pnpm build`

Result:

PASS

Evidence:

`runs/FP-MCP-155/terminal-commands/TERM-20260701T205347780Z-ed14adf0-result.json`

### Diff review

The diff confirmed recent registration/schema code was removed from `src/server.ts` and moved to `src/tool-registrations/recent-tools.ts`.

Evidence:

`runs/FP-MCP-155/terminal-commands/TERM-20260701T205402595Z-08f4c216-result.json`

### Direct telemetry read smoke

Tool:

`forgepilot_read_opencode_worker_telemetry`

Worker:

`WORKER-20260701T202417844Z-46c8a6f5`

Result:

PASS

Returned telemetry:

- schema: `forgepilot.opencode-worker-telemetry.v1`
- worker status: `SUCCEEDED`
- terminal state: `TERMINAL_SUCCEEDED`
- provenance completeness: `COMPLETE`
- validation state: `VALID`
- admission state: `NOT_EVALUATED`

### Direct workspace snapshot smoke

Tool:

`forgepilot_capture_workspace_snapshot`

Snapshot:

`SNAPSHOT-20260701T210005290Z-ed9fed1e`

Result:

PASS

Snapshot reported:

- ForgePilot branch: `main`
- ForgePilot commit: `73070be`
- ForgePilot clean: true
- Bridge branch: `feature/oauth-auth0`
- Bridge commit: `7ba74e4`
- Bridge clean: true
- MCP bridge service: active
- runner service: active
- legacy OpenCode server: present

Artifact:

`runs/FP-MCP-155/workspace-snapshots/SNAPSHOT-20260701T210005290Z-ed9fed1e.json`

## Safety Observations

FP-MCP-155 did not:

- add new public tools,
- remove scoped public tools,
- weaken approval checks,
- start OpenCode workers,
- attach to the legacy OpenCode server,
- stop or restart the legacy OpenCode server.

The MCP bridge service was restarted only to load the refactor.

## Next Step

The next packet can safely proceed to telemetry persistence, likely:

`FP-MCP-156 — Telemetry Persistence v1`
