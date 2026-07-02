# FP-MCP-175 Result Summary

## Result

```text
OPENCODE_LIVENESS_ONLY_PROBE_CONFIRMED_PROCESS_LISTENER_AND_TCP_CONNECT_NO_EXECUTION
```

## Finding

A safe, execution-free pre-canary liveness probe exists at the process/listener/TCP level.

It does not prove application/API functionality, model authentication, prompt execution, or canary success.

## Workspace snapshot

```text
snapshotId: SNAPSHOT-20260702T193617422Z-9ca964a5
bridge service active: true
runner service active: true
opencode process observed: true
opencode process: opencode serve --hostname 0.0.0.0 --port 4096
listener observed: 0.0.0.0:4096 users:(("opencode",pid=367970,fd=18))
```

## TCP liveness probe

```text
target: 127.0.0.1:4096
tcp_connect_succeeded: true
payload_sent: false
http_request_sent: false
prompt_sent: false
request_artifact_used: false
worker_start_requested: false
opencode_started_by_probe: false
runner_start_endpoint_contacted: false
```

## What this proves

```text
OpenCode server process is running
OpenCode port 4096 is listening
A local TCP connection to port 4096 succeeds
```

## What this does not prove

```text
OpenCode application API is functional
OpenCode can execute a prompt
model authentication is valid
runner start canary will succeed
```

## Safety boundary

```text
opencode_run_invoked: false
worker_started: false
prompt_sent: false
http_request_sent: false
runner_start_endpoint_contacted: false
approval_consumed: false
request_artifact_mutated: false
canary_retried: false
```
