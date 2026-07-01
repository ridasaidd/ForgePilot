# FP-MCP-154 — OpenCode Telemetry Capture v1

## Task

Define and implement first-class telemetry capture for OpenCode worker runs started through the FP-MCP-153 worker invocation tools.

## Goal

Turn OpenCode worker run artifacts into normalized ForgePilot telemetry observations without treating them as admitted evidence or routing input.

FP-MCP-154 should answer:

What can ForgePilot safely observe about an OpenCode worker run after it starts and after it completes?

## Background

FP-MCP-153 introduced first-class worker lifecycle tools:

- `forgepilot_start_opencode_worker`
- `forgepilot_get_opencode_worker_status`
- `forgepilot_read_opencode_worker_result`

Those tools create worker directories under:

`runs/<packetId>/opencode-workers/<workerId>/`

Each worker directory contains start request, pid, stdout, stderr, and status artifacts.

FP-MCP-154 adds a telemetry layer on top of those worker artifacts.

## Scope

Implement OpenCode worker telemetry capture v1 in:

`/home/ridasaidd/forgepilot-chatgpt-mcp`

The implementation may add a dedicated module and small MCP registrations.

## Required Tools

Add GPT-facing MCP tools:

1. `forgepilot_capture_opencode_worker_telemetry`
2. `forgepilot_read_opencode_worker_telemetry`

## Tool 1: `forgepilot_capture_opencode_worker_telemetry`

### Required Inputs

- `packetId: string`
- `workerId: string`
- `approval: "CAPTURE_OPENCODE_WORKER_TELEMETRY"`

### Requirements

The tool must:

- require exact approval `CAPTURE_OPENCODE_WORKER_TELEMETRY`,
- read an existing worker directory only,
- refuse if the worker status artifact does not exist,
- refresh/read worker status using existing worker status logic if possible,
- read worker stdout/stderr metadata,
- compute safe hashes for worker artifacts,
- write normalized telemetry artifact under the worker directory,
- return structured telemetry.

### Required Artifact

Write:

`runs/<packetId>/opencode-workers/<workerId>/telemetry.json`

The telemetry artifact must include at minimum:

- schema version,
- packet id,
- worker id,
- captured timestamp,
- worker status,
- started/completed timestamps when available,
- duration milliseconds when computable,
- target workspace id,
- workspace path,
- prompt file path,
- prompt file sha256,
- model id if present,
- command executable path,
- command args metadata,
- stdout path,
- stderr path,
- stdout byte count,
- stderr byte count,
- stdout sha256,
- stderr sha256,
- status artifact sha256,
- start request artifact sha256,
- terminal state classification,
- provenance completeness classification,
- trust tier classification,
- validation state classification,
- admission state classification,
- observation semantics.

## Tool 2: `forgepilot_read_opencode_worker_telemetry`

### Required Inputs

- `packetId: string`
- `workerId: string`

### Requirements

The tool must:

- read an existing telemetry artifact,
- return structured telemetry,
- not recapture or mutate telemetry,
- refuse if telemetry is missing.

## Classification Requirements

Telemetry is an observation, not admitted evidence.

Initial v1 classifications:

- trust tier: `TIER_2_VERIFIED_ARTIFACT`
- validation state: `VALID` when required artifacts exist and hashes can be computed, otherwise `INCOMPLETE`
- admission state: `NOT_EVALUATED`

Terminal state classification should be derived from worker status:

- `SUCCEEDED` -> `TERMINAL_SUCCEEDED`
- `FAILED` -> `TERMINAL_FAILED`
- `UNKNOWN_EXIT` -> `TERMINAL_UNKNOWN_EXIT`
- `RUNNING` -> `NON_TERMINAL_RUNNING`

Provenance completeness should be:

- `COMPLETE` when status, start request, stdout, stderr, prompt hash, worker id, packet id, workspace, and timestamps are present,
- otherwise `INCOMPLETE`.

## Safety Requirements

The implementation must not:

- start workers,
- stop workers,
- restart services,
- attach to the legacy OpenCode server,
- read raw OpenCode session databases,
- read secrets,
- expose environment variables,
- infer model performance quality,
- admit evidence for routing.

It may read only worker artifacts created by FP-MCP-153.

## Non-Goals

This packet does not implement:

- cost/token parsing from OpenCode internal state,
- SQLite persistence,
- routing decisions,
- model ranking,
- admission review,
- dashboarding,
- broad MCP refactor,
- telemetry ingestion from legacy OpenCode server state.

## Acceptance Criteria

1. MCP bridge build passes.
2. Tool `forgepilot_capture_opencode_worker_telemetry` is visible after connector refresh.
3. Tool `forgepilot_read_opencode_worker_telemetry` is visible after connector refresh.
4. Invalid capture approval is rejected.
5. Missing worker telemetry capture is rejected with a clear error.
6. Capturing telemetry for an existing FP-MCP-153 worker creates `telemetry.json`.
7. Telemetry includes status, duration, artifact paths, byte counts, hashes, classifications, and observation semantics.
8. Read telemetry returns the captured artifact without mutation.
9. No worker or service is started, stopped, or restarted by telemetry capture.
10. ForgePilot and bridge repositories are clean after implementation evidence is recorded.

## Verification Requirements

Verify at minimum:

- `pnpm build` in bridge repo,
- invalid approval rejection,
- missing worker rejection,
- capture telemetry for a known FP-MCP-153 worker,
- read telemetry for that worker,
- verify telemetry JSON exists and is valid,
- verify legacy OpenCode server remains running,
- record implementation evidence under `runs/FP-MCP-154/`.

## Expected Result

ForgePilot can capture normalized, safe, non-admitted telemetry observations from OpenCode worker runs.

FP-MCP-154 prepares the system for future SQLite persistence and evidence admission work.
