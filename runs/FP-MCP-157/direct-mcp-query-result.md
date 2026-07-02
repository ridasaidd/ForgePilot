# FP-MCP-157 Direct MCP Query Result

## Result

PASS.

After the OpenAI Actions schema was manually refreshed, the FP-MCP-157 query tool became visible in the ChatGPT MCP tool namespace and was directly invoked successfully.

## Tool

```text
forgepilot_query_persisted_opencode_worker_telemetry
```

## Input

```json
{
  "packetId": "FP-MCP-153",
  "limit": 5
}
```

## Observed output summary

The tool returned one persisted telemetry row.

Core returned values:

```json
{
  "count": 1,
  "filters": {
    "packetId": "FP-MCP-153"
  },
  "limit": 5,
  "firstRow": {
    "packet_id": "FP-MCP-153",
    "worker_id": "WORKER-20260701T202417844Z-46c8a6f5",
    "worker_status": "SUCCEEDED",
    "terminal_state": "TERMINAL_SUCCEEDED",
    "provenance_completeness": "COMPLETE",
    "trust_tier": "TIER_2_VERIFIED_ARTIFACT",
    "validation_state": "VALID",
    "admission_state": "NOT_EVALUATED"
  },
  "observation_semantics": "Persisted worker telemetry query results are observations, not admitted evidence or routing input."
}
```

## Safety boundary

The direct query proof was read-only.

It did not:

- mutate telemetry,
- persist new telemetry,
- recapture telemetry,
- start workers,
- stop workers,
- inspect live worker state,
- attach to the legacy OpenCode server,
- admit telemetry as evidence,
- infer model quality,
- rank models,
- make routing decisions.

## Operator note

The tool became visible only after the OpenAI Actions schema was manually refreshed from the Actions page.

Standing operational rule:

```text
New MCP tools are not discoverable by ChatGPT until the OpenAI action schema is manually refreshed from the Actions page.
```

## Final FP-MCP-157 status

COMPLETE.
