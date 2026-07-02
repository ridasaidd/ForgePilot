# FP-025 Abort Path Inspection

## Result

```text
NO_REGISTERED_WORKER_ABORT_TOOL_FOUND
```

## Inspection method

Static grep over bridge source for:

```text
stop worker
cancel worker
kill worker
terminate worker
abort worker
SIGTERM
process.kill
forgepilot_* stop/cancel/abort/kill
```

## Findings

Only these relevant source references were found:

```text
src/terminal-command.ts: killSignal: "SIGTERM"
src/opencode-worker.ts: process.kill(pid, 0)
```

`process.kill(pid, 0)` is a liveness check, not an abort primitive.

No registered MCP tool exists for stopping, cancelling, killing, terminating, or aborting an OpenCode worker.

## Consequence

OpenCode execution must not be enabled until a worker abort primitive is implemented and verified.
