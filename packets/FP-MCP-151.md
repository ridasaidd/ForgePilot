# FP-MCP-151 — Terminal Rate Limiting and Command Shaping

## Task

Define and implement practical rate limiting, command shaping, and safer execution ergonomics for the GPT-facing terminal MCP tool.

## Goal

Make `forgepilot_execute_terminal_command` reliable enough for repeated GPT-assisted operations without allowing command floods, self-blocking evidence writes, or long-running worker jobs to destabilize the MCP bridge.

FP-MCP-151 closes the operational gaps observed during FP-MCP-148 and FP-MCP-149.

## Background Observations

During FP-MCP-148 and FP-MCP-149, the terminal tool proved useful but exposed several issues:

1. Long-running OpenCode worker execution can exceed the terminal tool timeout and interrupt the ChatGPT/MCP stream.
2. Restarting the MCP bridge interrupts the active connection and may return a connector timeout even when the service restarts successfully.
3. Command-policy matching scans the entire submitted shell text, causing harmless artifact recording commands to self-block when their text mentions blocked command families or environment-related terms.
4. Rapid command sequences produce large amounts of terminal evidence and make the workspace noisy.
5. Some commands should be guided toward safer structured forms instead of arbitrary shell blobs.

## Scope

Implement terminal hardening in the MCP bridge repository:

`/home/ridasaidd/forgepilot-chatgpt-mcp`

The implementation may modify the terminal command module and server registration as needed.

## Required Behavior

### 1. Per-tool rate limiting

Add a small in-memory rate limiter for `forgepilot_execute_terminal_command`.

Minimum required policy:

- limit repeated terminal executions per process,
- return a structured refusal when the limit is exceeded,
- record the refusal as terminal evidence,
- do not execute the shell command when rate limited.

The initial limit should be conservative but usable for interactive GPT work.

Recommended default:

- no more than 12 terminal executions per 60 seconds.

### 2. Long-running command guidance

Detect commands that are likely to run longer than the terminal tool should supervise directly.

At minimum, detect direct model-worker launch patterns such as:

- `opencode run`

Required behavior:

- do not silently block ordinary read-only OpenCode inspection such as `opencode --help`,
- allow explicit short OpenCode help/status commands,
- for likely worker execution, return a structured refusal or warning that directs callers to use a future first-class OpenCode worker tool,
- record the refusal as evidence.

This is a temporary safety boundary until FP-MCP-153 introduces first-class OpenCode worker invocation.

### 3. Command text vs artifact text separation

Reduce false positives caused by policy scanning of heredoc artifact content.

Required behavior:

- policy should focus on executable command lines rather than arbitrary text being written into files,
- heredoc body text should not by itself trigger command blocking,
- executable lines before heredoc content must still be checked,
- dangerous executable command forms must remain blocked.

### 4. Evidence behavior preservation

All outcomes must continue to write terminal evidence:

- approved executed commands,
- blocked commands,
- rate-limited commands,
- long-running worker refusals,
- validation/refusal reasons.

Evidence must remain under:

`/home/ridasaidd/forgepilot/runs/<packetId-or-OPERATOR>/terminal-commands/`

### 5. Existing behavior preservation

Do not weaken FP-MCP-147 or FP-MCP-148 behavior.

Must preserve:

- ChatGPT MCP tool approval as the approval source,
- workspace allowlist,
- hard command blocks,
- terminal kill switch,
- Node tooling path support,
- stdout/stderr capture,
- pre/post git status capture,
- timeout behavior,
- evidence paths in return payloads.

## Non-Goals

This packet does not implement:

- first-class OpenCode worker invocation,
- OpenCode telemetry ingestion,
- detached background worker lifecycle,
- SQLite persistence,
- admission logic,
- Auth0/Tailscale changes,
- new external network exposure,
- stopping or restarting the legacy OpenCode server.

## Acceptance Criteria

1. Bridge build passes.
2. Existing terminal read-only command still works.
3. Existing `pnpm build` through the terminal tool still works without manual PATH prefix.
4. Existing hard blocks remain active.
5. Rate-limit refusal is implemented and records evidence.
6. Direct long-running OpenCode worker execution is refused or guided with evidence.
7. OpenCode help/status-style inspection remains allowed.
8. Heredoc artifact text no longer causes false blocking when the executable shell lines are safe.
9. MCP bridge service remains active after restart.
10. ForgePilot and bridge repositories are clean after recording implementation evidence.

## Verification Requirements

After implementation, verify at minimum:

- `pnpm build` in the bridge repository,
- a normal read-only terminal command,
- `pnpm build` through the terminal tool,
- a known hard-block command family remains blocked,
- a safe heredoc containing blocked-looking words in text can be written to an allowed ForgePilot run artifact,
- direct `opencode run` is refused or guided,
- `opencode --help` remains allowed,
- rate-limit behavior can be demonstrated with a bounded test or a unit-level helper check.

## Expected Result

The terminal MCP tool becomes safer and less brittle for repeated GPT-assisted operations while preserving the terminal as an explicit, approved, evidence-recording operator interface.

FP-MCP-151 prepares the system for FP-MCP-152 workspace snapshots and FP-MCP-153 first-class OpenCode worker invocation.
