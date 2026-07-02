# FP-MCP-175 — OpenCode Liveness-Only Probe

## Task

Determine whether a safe, execution-free OpenCode liveness probe exists before retrying the canary.

This packet must not start OpenCode, start a worker, send a prompt, send an OpenCode run request, contact the runner start endpoint, consume approval, mutate request artifacts, or retry the canary.

## Question

Can OpenCode liveness be checked without crossing into execution-adjacent behavior?

## Safe Probe Boundary

Allowed:

```text
observe existing process list
observe existing TCP listeners
open and close a TCP socket with no payload
```

Forbidden:

```text
opencode run
worker start
prompt send
HTTP request to an unknown execution endpoint
runner start endpoint contact
approval consumption
request artifact mutation
canary retry
```

## Expected Result

```text
OPENCODE_LIVENESS_ONLY_PROBE_CONFIRMED_PROCESS_LISTENER_AND_TCP_CONNECT_NO_EXECUTION
```
