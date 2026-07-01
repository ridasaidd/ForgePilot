# FP-MCP-156 — Telemetry Persistence v1

## Task

Define and implement SQLite persistence for normalized OpenCode worker telemetry artifacts captured by FP-MCP-154.

## Goal

Allow ForgePilot to store worker telemetry observations in a queryable SQLite table while preserving the distinction between observation, validation, admission, and routing.

FP-MCP-156 should answer:

Can this captured worker telemetry be persisted as a durable observation without becoming admitted evidence or routing input?

## Background

FP-MCP-153 introduced first-class OpenCode worker invocation.

FP-MCP-154 introduced normalized telemetry capture and readback for worker artifacts.

FP-MCP-155 refactored recent MCP tool registrations so the bridge is easier to extend.

The next step is persistence.

ForgePilot already has precedent for SQLite-backed evidence and metrics tables in earlier packets. FP-MCP-156 should add a narrow table for worker telemetry observations only.

## Scope

Implement telemetry persistence in:

`/home/ridasaidd/forgepilot-chatgpt-mcp`

and, where needed, add migration/schema/test artifacts in:

`/home/ridasaidd/forgepilot`

The implementation may add MCP tools, bridge modules, migrations, and tests as needed.

## Required Tools

Add GPT-facing MCP tools:

1. `forgepilot_persist_opencode_worker_telemetry`
2. `forgepilot_read_persisted_opencode_worker_telemetry`

## Tool 1: `forgepilot_persist_opencode_worker_telemetry`

### Required Inputs

- `packetId: string`
- `workerId: string`
- `approval: "PERSIST_OPENCODE_WORKER_TELEMETRY"`

### Requirements

The tool must:

- require exact approval `PERSIST_OPENCODE_WORKER_TELEMETRY`,
- read an existing `telemetry.json` artifact,
- refuse if telemetry is missing,
- initialize/apply the required SQLite schema if needed,
- insert or upsert one persisted telemetry observation,
- preserve artifact paths and hashes,
- preserve observation classifications,
- return a structured persistence result,
- not start workers,
- not capture telemetry itself unless explicitly documented as not allowed.

The v1 behavior should require telemetry to already exist. Capture remains FP-MCP-154's responsibility.

## Tool 2: `forgepilot_read_persisted_opencode_worker_telemetry`

### Required Inputs

- `packetId: string`
- `workerId: string`

### Requirements

The tool must:

- read a persisted telemetry observation by packet id and worker id,
- return structured persisted telemetry,
- not mutate the database,
- refuse clearly if no persisted row exists.

## Database Requirements

Add a table for OpenCode worker telemetry observations.

Recommended table name:

`opencode_worker_telemetry`

Required fields:

- `packet_id`
- `worker_id`
- `schema_version`
- `captured_at`
- `persisted_at`
- `worker_status`
- `started_at`
- `completed_at`
- `duration_ms`
- `target_workspace_id`
- `workspace_path`
- `prompt_file`
- `prompt_file_sha256`
- `model_id`
- `command_executable`
- `command_args_json`
- `status_path`
- `status_sha256`
- `start_request_path`
- `start_request_sha256`
- `stdout_path`
- `stdout_byte_count`
- `stdout_sha256`
- `stderr_path`
- `stderr_byte_count`
- `stderr_sha256`
- `terminal_state`
- `provenance_completeness`
- `trust_tier`
- `validation_state`
- `admission_state`
- `telemetry_path`
- `observation_semantics`
- `reasons_json`

Uniqueness:

- unique on `(packet_id, worker_id)`

Indexes:

- `packet_id`
- `worker_status`
- `validation_state`
- `admission_state`

## Classification Requirements

Persisted telemetry remains an observation only.

FP-MCP-156 must preserve FP-MCP-154 classifications:

- trust tier: `TIER_2_VERIFIED_ARTIFACT`
- validation state: `VALID` or `INCOMPLETE`
- admission state: `NOT_EVALUATED`

The persistence tool must not change admission state to `ADMITTED`.

## Safety Requirements

The implementation must not:

- start workers,
- stop workers,
- restart the legacy OpenCode server,
- attach to the legacy OpenCode server,
- read raw OpenCode session databases,
- read secrets,
- expose environment variables,
- infer model quality,
- make routing decisions,
- treat persisted rows as admitted evidence.

## Non-Goals

This packet does not implement:

- model ranking,
- routing,
- admission review,
- dashboarding,
- cost/token parsing from raw OpenCode state,
- batch ingestion of historical telemetry,
- telemetry recapture,
- automatic persistence during worker completion.

## Acceptance Criteria

1. Build passes.
2. Migration/schema creation is idempotent.
3. Persist tool is visible after connector refresh.
4. Read persisted tool is visible after connector refresh.
5. Invalid approval is rejected.
6. Missing telemetry artifact is rejected clearly.
7. Existing FP-MCP-153 telemetry can be persisted.
8. Persisting the same telemetry twice is safe and idempotent/upserted.
9. Read persisted telemetry returns the stored row.
10. Persisted row has admission state `NOT_EVALUATED`.
11. Legacy OpenCode server remains running and untouched.
12. ForgePilot and bridge repositories are clean after evidence is recorded.

## Verification Requirements

Verify at minimum:

- bridge build,
- database schema initialization,
- invalid approval rejection,
- missing telemetry rejection,
- persist known telemetry worker,
- persist same worker again,
- read persisted telemetry,
- inspect persisted row classification fields,
- direct MCP smoke after connector refresh,
- final clean-state check.

## Expected Result

ForgePilot can persist normalized OpenCode worker telemetry as durable, queryable observations without admitting it as evidence or using it for routing.
