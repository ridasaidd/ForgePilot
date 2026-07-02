# FP-MCP-156 Direct MCP Smoke Result

## Result

PASS.

The direct MCP persistence smoke proof succeeded after the FP-MCP-156 server-side implementation and bridge exposure work.

## Scope

This result records direct MCP proof for the FP-MCP-156 telemetry persistence tools:

- `forgepilot_persist_opencode_worker_telemetry`
- `forgepilot_read_persisted_opencode_worker_telemetry`

The proof used an existing OpenCode worker telemetry artifact from packet `FP-MCP-153` and did not admit the telemetry as evidence.

## Direct persist proof

Tool:

- `forgepilot_persist_opencode_worker_telemetry`

Input:

```json
{
  "packetId": "FP-MCP-153",
  "workerId": "WORKER-20260701T202417844Z-46c8a6f5",
  "approval": "PERSIST_OPENCODE_WORKER_TELEMETRY"
}
```

Observed result:

```json
{
  "persisted": true,
  "insertedOrUpdated": "updated",
  "admission_state": "NOT_EVALUATED"
}
```

## Direct read proof

Tool:

- `forgepilot_read_persisted_opencode_worker_telemetry`

Input:

```json
{
  "packetId": "FP-MCP-153",
  "workerId": "WORKER-20260701T202417844Z-46c8a6f5"
}
```

Observed result:

```json
{
  "worker_status": "SUCCEEDED",
  "terminal_state": "TERMINAL_SUCCEEDED",
  "provenance_completeness": "COMPLETE",
  "trust_tier": "TIER_2_VERIFIED_ARTIFACT",
  "validation_state": "VALID",
  "admission_state": "NOT_EVALUATED"
}
```

## Re-read confirmation in this session

A subsequent direct read of the persisted telemetry returned the same core persistence and classification observations:

```json
{
  "packet_id": "FP-MCP-153",
  "worker_id": "WORKER-20260701T202417844Z-46c8a6f5",
  "schema_version": "forgepilot.opencode-worker-telemetry.v1",
  "worker_status": "SUCCEEDED",
  "terminal_state": "TERMINAL_SUCCEEDED",
  "provenance_completeness": "COMPLETE",
  "trust_tier": "TIER_2_VERIFIED_ARTIFACT",
  "validation_state": "VALID",
  "admission_state": "NOT_EVALUATED"
}
```

## Non-admission boundary

This smoke result records persistence and readback only.

It does not admit the telemetry as evidence, does not use telemetry for routing, and does not change worker artifacts.

The persisted row remained:

- `admission_state`: `NOT_EVALUATED`

## Workspace observations before recording

Before recording this result, ForgePilot was observed as:

- branch: `main`
- commit: `d67c0cc`
- working tree: clean

The bridge repo was observed as:

- branch: `feature/oauth-auth0`
- commit: `dc1a412`
- working tree: clean

The legacy OpenCode server was observed listening on port `4096`.

No active OpenCode worker processes were observed.

The user-service status check could not connect to the user bus from the terminal execution context and is therefore not used as proof of service activity in this artifact.
