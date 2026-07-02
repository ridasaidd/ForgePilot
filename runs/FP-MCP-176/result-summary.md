# FP-MCP-176 Result Summary

## Result

```text
OPENCODE_HTTP_HEALTH_ENDPOINT_NOT_PROVEN_NO_HTTP_PROBE_ATTEMPTED
```

## Finding

The installed OpenCode package resolves to a binary distribution:

```text
/home/ridasaidd/.nvm/versions/node/v24.4.1/lib/node_modules/opencode-ai/bin/opencode.exe
ELF 64-bit LSB executable, ARM aarch64
```

A read-only grep over readable package files did not find a source-confirmed `/health`, `/version`, `/status`, or `/ping` endpoint.

## Decision

No HTTP probe was attempted.

Reason:

```text
No source-confirmed execution-free HTTP health/version endpoint was found.
Speculative HTTP requests to unknown endpoints would blur the pre-canary boundary.
```

## Accepted gap

```text
OpenCode process/socket liveness: proven by FP-MCP-175
OpenCode HTTP/API functionality: not proven
model authentication: not proven
prompt execution: not proven
```

The canary remains the first execution-path and application-layer proof unless a future source-confirmed health endpoint is identified.

## Safety boundary

```text
http_request_sent: false
opencode_run_invoked: false
worker_started: false
prompt_sent: false
runner_start_endpoint_contacted: false
approval_consumed: false
request_artifact_mutated: false
canary_retried: false
```
