# FP-MCP-367 Design Record

## Result

Design recorded.

## Artifact

- docs/mcp/bubblewrap-sandboxed-command-design.md
- packets/FP-MCP-367.md

## Decision

Use bubblewrap as the preferred lightweight sandbox layer for future ForgePilot MCP sandboxed command execution.

Do not expose direct terminal access.

Do not implement execution in this packet.

## Key Design Points

- Future command execution should operate on copied workspaces.
- The real host repository must not be mounted read-write.
- Network must be disabled by default.
- Secrets must not be mounted.
- Docker socket must not be mounted.
- The execute tool must remain gated.
- Safe/default ChatGPT surface should remain observational.
- Sandbox output is observation, not admitted evidence.
- Artifact export must be explicit and audited.

## Recommended Next Packet

FP-MCP-368 — Bubblewrap availability and capability diagnostic.

## Non-Execution Statement

No bridge implementation occurred.

No bubblewrap command was executed.

No MCP service was restarted.

No OpenCode start, runner start contact, approval consumption, disable-switch clearing, FP-027 canary run, or execution authorization occurred.
