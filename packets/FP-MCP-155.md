# FP-MCP-155 — MCP Bridge Tool Registration Refactor v1

## Task

Refactor the ForgePilot ChatGPT MCP bridge so recently added tool registrations and schemas are moved out of the large `src/server.ts` file into focused modules.

## Goal

Reduce the risk of future changes by separating tool implementation modules, output schemas, and MCP registration code before adding telemetry persistence or more execution tools.

FP-MCP-155 should make the bridge easier to maintain without changing public tool behavior.

## Background

Recent packets added several first-class MCP tools:

- FP-MCP-147 terminal command execution,
- FP-MCP-152 workspace snapshots,
- FP-MCP-153 OpenCode worker invocation,
- FP-MCP-154 OpenCode worker telemetry capture.

The implementation has kept core logic mostly in separate modules, but `src/server.ts` still owns many schemas and registrations and continues to grow.

The user explicitly noted that once the system is stable enough, the MCP files should be refactored.

FP-MCP-153 and FP-MCP-154 now have direct ChatGPT MCP proof, so this is the right point to perform a small bounded refactor before adding persistence.

## Scope

Implement a bounded refactor in:

`/home/ridasaidd/forgepilot-chatgpt-mcp`

Focus on the newest, well-understood tools only:

- workspace snapshot tool,
- OpenCode worker tools,
- OpenCode worker telemetry tools.

## Required Refactor Shape

Move registration and schema code for the scoped tools out of `src/server.ts` into focused files, for example:

- `src/tool-registrations/workspace-snapshot-tools.ts`
- `src/tool-registrations/opencode-worker-tools.ts`
- `src/tool-registrations/opencode-worker-telemetry-tools.ts`

The exact file names may vary, but the refactor must make the separation clear.

## Requirements

The refactor must:

- preserve existing public tool names,
- preserve input schemas,
- preserve output schemas,
- preserve descriptions where practical,
- preserve annotations where practical,
- preserve `runLoggedTool` behavior,
- preserve `structuredJsonResult` behavior,
- preserve imports of implementation modules,
- avoid broad rewrites of unrelated legacy tool registrations,
- keep behavior equivalent for the scoped tools.

## Safety Requirements

The refactor must not:

- change runtime behavior intentionally,
- add new execution surfaces,
- remove existing tools,
- weaken approval checks,
- change command execution policy,
- start OpenCode workers,
- stop or restart the legacy OpenCode server except for normal MCP bridge service restart after build.

## Non-Goals

This packet does not implement:

- telemetry persistence,
- SQLite storage,
- routing decisions,
- admission logic,
- new MCP tools,
- broad formatting-only rewrites,
- complete decomposition of all historical MCP tools.

## Acceptance Criteria

1. MCP bridge build passes.
2. `src/server.ts` is smaller or has visibly less scoped registration/schema code for the new tools.
3. Scoped tool names remain present in compiled `dist/server.js`.
4. Workspace snapshot direct MCP call still works after restart.
5. OpenCode worker read/status/result tools remain visible after refresh/reconnect.
6. OpenCode worker telemetry read/capture tools remain visible after refresh/reconnect.
7. A read-only or non-mutating direct smoke call verifies at least one refactored tool path.
8. Legacy OpenCode server remains running and is not attached to, stopped, or restarted.
9. ForgePilot and bridge repositories are clean after evidence is recorded.

## Verification Requirements

Verify at minimum:

- `pnpm build` in the bridge repo,
- source diff confirms scoped registrations moved out of `src/server.ts`,
- compiled artifact still includes scoped tool names,
- MCP bridge service active after restart,
- direct workspace snapshot or telemetry read call works,
- final clean-state check.

## Expected Result

The MCP bridge becomes easier to maintain before FP-MCP-156 or equivalent telemetry persistence work begins.

Future packets can add persistence without continuing to overload `src/server.ts`.
