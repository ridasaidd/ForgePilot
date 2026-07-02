# FP-MCP-176 — OpenCode HTTP Health Endpoint Safety Decision

## Task

Determine whether an additional execution-free HTTP-level OpenCode health/version probe is justified before the canary.

This packet must not send speculative HTTP requests to unknown OpenCode endpoints, start OpenCode, start a worker, send a prompt, contact the runner start endpoint, consume approval, mutate request artifacts, or retry the canary.

## Question

Is there a known, source-confirmed, execution-free OpenCode HTTP endpoint such as `/health` or `/version` that can be probed safely?

## Expected Result

```text
OPENCODE_HTTP_HEALTH_ENDPOINT_NOT_PROVEN_NO_HTTP_PROBE_ATTEMPTED
```
