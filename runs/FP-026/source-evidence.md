# FP-026 Source Evidence

## Bridge commit

```text
8422542 Add OpenCode worker abort primitive
```

## Source changes

```text
src/opencode-worker.ts
```

Adds the `ABORTED` worker state, worker-record validation, packet/worker-scoped abort input, abort result shape, status-artifact update, and explicit partial-workspace rollback boundary.

```text
src/opencode-worker-telemetry.ts
```

Adds `TERMINAL_ABORTED` classification.

```text
src/tool-registrations/recent-tools.ts
```

Registers `forgepilot_abort_opencode_worker` and extends worker status schemas to include `ABORTED`.

## Runtime status

Source verified only. Live runtime confirmation is pending service restart/action refresh.
