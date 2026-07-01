# FP-MCP-154 Direct MCP Smoke Result

## Status

PASS

## Purpose

Verify that the FP-MCP-154 telemetry tools work through the actual ChatGPT MCP action surface after reconnect/refresh.

## Direct MCP Tool Visibility

The following tools became visible in the ChatGPT connector catalog after reconnect:

- `forgepilot_capture_opencode_worker_telemetry`
- `forgepilot_read_opencode_worker_telemetry`

## Direct MCP Capture

Tool:

`forgepilot_capture_opencode_worker_telemetry`

Input:

- packet id: `FP-MCP-153`
- worker id: `WORKER-20260701T202417844Z-46c8a6f5`
- approval: `CAPTURE_OPENCODE_WORKER_TELEMETRY`

Result:

- schema version: `forgepilot.opencode-worker-telemetry.v1`
- worker status: `SUCCEEDED`
- duration: `5363` ms
- terminal state: `TERMINAL_SUCCEEDED`
- provenance completeness: `COMPLETE`
- trust tier: `TIER_2_VERIFIED_ARTIFACT`
- validation state: `VALID`
- admission state: `NOT_EVALUATED`
- stdout byte count: `40`
- stderr byte count: `37`

Telemetry artifact:

`runs/FP-MCP-153/opencode-workers/WORKER-20260701T202417844Z-46c8a6f5/telemetry.json`

## Direct MCP Readback

Tool:

`forgepilot_read_opencode_worker_telemetry`

Result:

Readback returned the same telemetry artifact without recapturing or mutating intentionally.

## Observation Semantics

Telemetry remains an observation only. It is not admitted evidence and is not routing input by itself.

## Conclusion

FP-MCP-154 is verified end-to-end through the actual ChatGPT MCP action surface.
