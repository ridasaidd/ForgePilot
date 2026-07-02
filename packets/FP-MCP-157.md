# FP-MCP-157 — Worker Telemetry Query Tool v1

## Task

Expose a read-only MCP query tool for persisted OpenCode worker telemetry observations.

## Goal

Allow GPT to query persisted worker telemetry rows without mutating telemetry, admitting evidence, scoring models, routing future work, or touching live OpenCode state.

FP-MCP-157 answers one question:

> Can persisted worker telemetry observations be safely queried through MCP?

## Background

FP-MCP-153 introduced bounded OpenCode worker invocation.

FP-MCP-154 introduced normalized worker telemetry capture.

FP-MCP-156 introduced SQLite persistence for worker telemetry observations.

FP-MCP-157 makes those persisted observations visible through a constrained read-only MCP query surface.

The architectural line is:

```text
capture → persist → read one row → query persisted observations
```

This packet must not cross into:

- admission,
- routing,
- model scoring,
- worker control,
- raw OpenCode internals.

FP-MCP-157 should make telemetry visible, not meaningful.

Querying is observation access. Meaning comes later through admission, reporting, and comparison packets.

## Scope

Implement one read-only MCP tool in:

```text
/home/ridasaidd/forgepilot-chatgpt-mcp
```

and any required ForgePilot-side CLI/database query support in:

```text
/home/ridasaidd/forgepilot
```

## Required MCP Tool

Add:

```text
forgepilot_query_persisted_opencode_worker_telemetry
```

## Required Inputs

All inputs are optional unless otherwise stated:

- `packetId?: string`
- `workerStatus?: string`
- `terminalState?: string`
- `validationState?: string`
- `admissionState?: string`
- `limit?: number`

## Query Semantics

The tool must query only the persisted SQLite table:

```text
opencode_worker_telemetry
```

It must not read live worker artifacts, recapture telemetry, or inspect raw OpenCode state.

## Allowed Filters

The tool may filter by:

- packet id,
- worker status,
- terminal state,
- validation state,
- admission state.

The tool may support a bounded limit.

Recommended default limit:

```text
20
```

Recommended maximum limit:

```text
100
```

## Required Output Shape

Return structured JSON similar to:

```json
{
  "rows": [
    {
      "packet_id": "FP-MCP-153",
      "worker_id": "WORKER-...",
      "worker_status": "SUCCEEDED",
      "terminal_state": "TERMINAL_SUCCEEDED",
      "trust_tier": "TIER_2_VERIFIED_ARTIFACT",
      "validation_state": "VALID",
      "admission_state": "NOT_EVALUATED",
      "persisted_at": "..."
    }
  ],
  "count": 1,
  "filters": {
    "packetId": "FP-MCP-153",
    "validationState": "VALID"
  },
  "limit": 20,
  "observation_semantics": "Persisted worker telemetry query results are observations, not admitted evidence or routing input."
}
```

## Required Row Fields

Each returned row should include at minimum:

- `packet_id`
- `worker_id`
- `schema_version`
- `captured_at`
- `persisted_at`
- `worker_status`
- `terminal_state`
- `provenance_completeness`
- `trust_tier`
- `validation_state`
- `admission_state`
- `duration_ms`
- `target_workspace_id`
- `model_id`
- `telemetry_path`

The tool may omit long fields such as full command args unless explicitly included later by another packet.

## Safety Requirements

The tool must not:

- mutate SQLite rows,
- persist new telemetry,
- recapture telemetry,
- start workers,
- stop workers,
- restart workers,
- attach to the legacy OpenCode server,
- read raw OpenCode session databases,
- infer model quality,
- rank models,
- make routing decisions,
- change admission state,
- treat query results as admitted evidence.

## Non-Goals

This packet does not implement:

- evidence admission,
- routing,
- model comparison,
- dashboards,
- reporting summaries,
- telemetry aggregation,
- score calculation,
- cost/token analysis,
- batch backfill,
- worker lifecycle control.

## Acceptance Criteria

1. Build passes.
2. Query tool is visible after connector refresh.
3. Query without filters returns persisted telemetry rows up to the default limit.
4. Query by packet id works.
5. Query by worker status works.
6. Query by terminal state works.
7. Query by validation state works.
8. Query by admission state works.
9. Limit is bounded and enforced.
10. Query result includes `observation_semantics`.
11. Query result does not mutate the database.
12. Query result does not start, stop, or inspect live workers.
13. Existing persisted FP-MCP-153 worker telemetry can be returned.
14. ForgePilot and bridge repositories are clean after evidence is recorded.

## Verification Requirements

Verify at minimum:

- ForgePilot typecheck,
- bridge build,
- query with no filters,
- query with `packetId = FP-MCP-153`,
- query with `workerStatus = SUCCEEDED`,
- query with `terminalState = TERMINAL_SUCCEEDED`,
- query with `validationState = VALID`,
- query with `admissionState = NOT_EVALUATED`,
- bounded limit behavior,
- direct MCP query after connector refresh,
- final clean-state check.

## Expected Result

GPT can query persisted worker telemetry observations safely through MCP.

Telemetry becomes visible and inspectable, but not meaningful in the admission, routing, or model-quality sense.

No aggregation is introduced in this packet. A simple filtered row query is the intended next step.
