# FP-MCP-153 — OpenCode Worker Invocation v1

## Task

Define and implement first-class MCP tools for starting and observing bounded OpenCode worker runs without using the generic terminal tool to supervise model execution directly.

## Goal

Move OpenCode worker execution out of ad hoc terminal commands and into a ForgePilot-controlled lifecycle with explicit request, start, status, result, and evidence artifacts.

FP-MCP-153 should make GPT able to start a bounded OpenCode worker safely while preserving ForgePilot's evidence discipline.

## Background

FP-MCP-147 gave GPT controlled terminal hands.

FP-MCP-148 hardened terminal execution with a kill switch and Node tooling path support.

FP-MCP-149 inventoried local OpenCode telemetry metadata before changing the legacy OpenCode server state.

FP-MCP-150 created the ForgePilot master plan.

FP-MCP-151 added terminal rate limiting and command shaping, including refusal of direct `opencode run` worker execution through the terminal tool.

FP-MCP-152 added a first-class workspace snapshot capability.

The next gap is controlled OpenCode worker invocation.

## Scope

Implement OpenCode worker invocation v1 in:

`/home/ridasaidd/forgepilot-chatgpt-mcp`

The implementation should add dedicated MCP tools and supporting module code.

## Required Tools

Add GPT-facing MCP tools:

1. `forgepilot_start_opencode_worker`
2. `forgepilot_get_opencode_worker_status`
3. `forgepilot_read_opencode_worker_result`

## Tool 1: `forgepilot_start_opencode_worker`

### Required Inputs

- `packetId: string`
- `requestId?: string`
- `targetWorkspaceId: string`
- `promptFile: string`
- `title?: string`
- `modelId?: string`
- `timeoutSeconds?: number`
- `approval: "START_OPENCODE_WORKER"`

### Requirements

The tool must:

- require exact approval `START_OPENCODE_WORKER`,
- allow only known workspaces,
- require `promptFile` to be inside the ForgePilot repository or allowed workspace,
- refuse if the prompt file is missing,
- refuse if another worker for the same packet is already active,
- start a fresh `opencode run` process without attaching to the legacy OpenCode server,
- write worker evidence under `runs/<packetId>/opencode-workers/<workerId>/`,
- return immediately after the worker has been started,
- not wait for model completion,
- not stop or restart the legacy OpenCode server.

### Required Start Evidence

The worker directory must contain at minimum:

- `start-request.json`,
- `pid.txt`,
- `stdout.log`,
- `stderr.log`,
- `status.json`.

`status.json` must initially record:

- worker id,
- packet id,
- request id if provided,
- model id if provided,
- target workspace,
- prompt file,
- process id,
- started timestamp,
- status `RUNNING`,
- stdout/stderr paths,
- approval source.

## Tool 2: `forgepilot_get_opencode_worker_status`

### Required Inputs

- `packetId: string`
- `workerId: string`

### Requirements

The tool must:

- read the worker status artifact,
- check whether the process is still active,
- update status to `SUCCEEDED`, `FAILED`, or `UNKNOWN_EXIT` if the process has ended,
- preserve stdout/stderr paths,
- return structured status,
- not start any process.

## Tool 3: `forgepilot_read_opencode_worker_result`

### Required Inputs

- `packetId: string`
- `workerId: string`
- `maxChars?: number`

### Requirements

The tool must:

- read status, stdout, and stderr for an existing worker,
- return bounded stdout/stderr content,
- report truncation,
- include evidence paths,
- not start, stop, or restart any process.

## Safety Requirements

The implementation must not:

- attach to the running legacy OpenCode server,
- stop or restart the legacy OpenCode server,
- read raw secrets,
- expose environment variable values,
- support arbitrary shell commands from user input,
- support arbitrary process killing,
- run more than one active worker per packet in v1.

The implementation should construct the `opencode run` invocation using fixed arguments, not arbitrary shell strings.

## Environment Requirements

Use the Node tooling path already established in FP-MCP-148:

`/home/ridasaidd/.nvm/versions/node/v24.4.1/bin`

Use a sanitized environment.

Do not print or record secret environment values.

## Non-Goals

This packet does not implement:

- full OpenCode telemetry ingestion,
- token/cost/session database parsing,
- model performance admission,
- SQLite persistence,
- routing decisions,
- multi-worker scheduling,
- worker cancellation,
- background queue management,
- prompt generation,
- MCP file refactor beyond what is needed for v1.

## Refactor Note

The MCP bridge has grown large. Once worker invocation and telemetry capture are stable enough, create a future refactor packet to split bridge logic into smaller modules.

Do not perform broad refactoring in FP-MCP-153 unless required for the worker tool implementation.

## Acceptance Criteria

1. MCP bridge build passes.
2. The three worker tools are visible through MCP discovery after refresh/reconnect.
3. Invalid approval for start is rejected.
4. Missing prompt file is rejected.
5. Starting a worker creates a worker directory and required artifacts.
6. Start returns without waiting for model completion.
7. Status tool returns `RUNNING` while active or terminal status after completion.
8. Result tool returns bounded stdout/stderr and truncation metadata.
9. Existing terminal tool still refuses direct `opencode run`.
10. Legacy OpenCode server remains running and is not attached to, stopped, or restarted.
11. ForgePilot and bridge repositories are clean after implementation evidence is recorded.

## Verification Requirements

Verify at minimum:

- `pnpm build` in bridge repo,
- tool discovery includes the three tools,
- invalid approval rejection,
- missing prompt rejection,
- one bounded worker start using an existing prompt file,
- worker status read,
- worker result read,
- legacy OpenCode server process remains present,
- direct terminal `opencode run` remains refused,
- implementation evidence recorded under `runs/FP-MCP-153/`.

## Expected Result

GPT can start and observe bounded OpenCode worker runs through purpose-built MCP tools rather than generic terminal supervision.

FP-MCP-153 prepares the system for FP-MCP-154 OpenCode Telemetry Capture v1.
