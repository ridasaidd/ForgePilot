# FP-MCP Session Handoff

Captured: 2026-07-01

## Current durable state

ForgePilot repository:
- Path: `/home/ridasaidd/forgepilot`
- Branch: `main`
- Latest pushed packet commit before this handoff: `6473227 Add FP-MCP-149 OpenCode telemetry inventory packet`

MCP bridge repository:
- Path: `/home/ridasaidd/forgepilot-chatgpt-mcp`
- Branch: `feature/oauth-auth0`
- Latest implemented bridge commit: `e5e9884 Implement FP-MCP-147 terminal command MCP tool`
- Service observed running as the normal `ridasaidd` user.

## Important completed packets

FP-MCP-147:
- Added GPT-facing terminal command MCP tool: `forgepilot_execute_terminal_command`.
- Tool uses ChatGPT MCP approval popup as the human approval surface.
- Tool records terminal evidence under ForgePilot `runs/<packet>/terminal-commands/`.
- First live command succeeded against ForgePilot workspace.
- Bridge commit: `e5e9884`.

FP-MCP-148:
- Packet added and pushed: terminal practical hardening.
- Commit: `ed08b59 Add FP-MCP-148 terminal hardening packet`.
- Scope: terminal kill switch, Node/pnpm PATH fix, container-engine command blocks, preserve existing approval/evidence model.
- Direct patch attempts from GPT terminal were blocked by platform/tool safety filters; use OpenCode as worker for implementation.

FP-MCP-149:
- Packet added and pushed: OpenCode local telemetry inventory.
- Commit: `6473227 Add FP-MCP-149 OpenCode telemetry inventory packet`.
- Scope: inventory local OpenCode telemetry metadata before changing long-running OpenCode server state.
- Direct metadata capture attempts from GPT terminal were blocked by platform safety filters; use OpenCode as worker.

## OpenCode state observation

OpenCode was observed running:
- Process command: `opencode serve --hostname 0.0.0.0 --port 4096`
- Approximate age at observation: about 26 days
- Listener observed: `0.0.0.0:4096`

Do not force-quit or restart OpenCode until FP-MCP-149 inventory is completed and reviewed.

## Current operating rules

1. GPT terminal is now available for small, explicit, approved commands.
2. Avoid rapid-fire terminal calls; prefer throttled, small commands.
3. Use OpenCode for bulk edits, source patches, telemetry inventory, or tasks blocked by platform/tool filters.
4. Do not chase terminal evidence recursion indefinitely. Terminal commands create new evidence; commit intentionally selected artifacts only.
5. Treat the server as a dev workbench behind Tailnet/proxy boundaries, but remember the terminal tool runs as `ridasaidd`.

## Known gaps to address

1. FP-MCP-148 implementation still needed in bridge repo.
2. FP-MCP-149 OpenCode telemetry inventory still needed.
3. Terminal evidence batching/finalization is still unsolved.
4. MCP terminal command rate limiting / command shaping should be a follow-up packet, likely FP-MCP-150.
5. Tailscale ACL narrowing remains an external admin-plane task, not code.

## Recommended next actions

1. Use OpenCode to implement FP-MCP-148 from `packets/FP-MCP-148.md`.
2. Audit FP-MCP-148 changes before relying on them.
3. Use OpenCode to implement FP-MCP-149 from `packets/FP-MCP-149.md` without stopping OpenCode.
4. Review FP-MCP-149 capture summary before deciding whether to restart OpenCode.
5. Create FP-MCP-150 for terminal rate limiting and command shaping.
