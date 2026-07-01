# FP-MCP-153 Direct MCP Smoke Result

## Status

PASS

## Purpose

Verify that the FP-MCP-153 worker tools work through the actual ChatGPT MCP action surface after connector refresh and output schema hardening.

## Trigger

Initial direct call to `forgepilot_start_opencode_worker` failed with:

`Cannot read properties of undefined (reading '_zod')`

Cause:

The worker tools used `z.any()` as the top-level output schema placeholder. The MCP SDK expects output schema shapes compatible with the registration pattern used by the bridge.

## Fix

Bridge commit:

`ea0e014` — Harden FP-MCP-153 worker output schemas

The worker tools now use explicit output schemas for:

- worker status,
- start worker output,
- get worker status output,
- read worker result output.

## Direct MCP Tool Visibility

The following tools became visible in the ChatGPT connector catalog:

- `forgepilot_start_opencode_worker`
- `forgepilot_get_opencode_worker_status`
- `forgepilot_read_opencode_worker_result`

## Direct MCP Smoke Worker

Worker id:

`WORKER-20260701T202417844Z-46c8a6f5`

Prompt file:

`runs/FP-MCP-153/worker-smoke-prompt.md`

Target workspace:

`forgepilot`

Start result:

- direct MCP action returned successfully,
- status: `RUNNING`,
- pid: `731624`,
- worker evidence directory created.

Status result:

- status: `SUCCEEDED`,
- reason: `PROCESS_EXITED_ZERO`,
- completedAt: `2026-07-01T20:24:23.211Z`.

Read result:

- stdout: `FP-MCP-153 worker smoke test completed.`
- stdout truncated: false
- stderr included OpenCode model banner
- stderr truncated: false

## Worker Evidence Directory

`runs/FP-MCP-153/opencode-workers/WORKER-20260701T202417844Z-46c8a6f5/`

Expected files:

- `start-request.json`
- `pid.txt`
- `stdout.log`
- `stderr.log`
- `status.json`

## Conclusion

FP-MCP-153 is now verified end-to-end through the actual ChatGPT MCP action surface.

The earlier schema failure has been corrected.
