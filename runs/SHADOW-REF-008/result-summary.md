# SHADOW-REF-008 Result Summary

## Result

```text
EXECUTOR_HANDOFF_BLOCKED_NO_EXTRACTION
```

## What happened

The first executor-driven shadow extraction was not performed.

Preflight found two blockers before source code movement:

```text
1. forgepilot_validate_opencode_run_request rejects SHADOW-REF-* packet ids as INVALID_PACKET_ID, even for committed SHADOW-REF-007.
2. execution disable/status tools report OpenCode execution disabled, while forgepilot_start_opencode_worker still started a worker when called with a legacy FP-MCP packet id.
```

## Accidental worker observation

A probe call using legacy packet id `FP-MCP-036` started an OpenCode worker even though execution status reported disabled.

```text
worker_id: WORKER-20260702T121741820Z-e60730d6
packet_id: FP-MCP-036
model_id: deepseek-v4-pro-high
target_workspace_id: forgepilot-chatgpt-mcp
prompt_file: /home/ridasaidd/forgepilot/package.json
status: FAILED
duration_ms: 2308
terminal_state: TERMINAL_FAILED
validation_state: VALID
admission_state: NOT_EVALUATED
```

The worker failed quickly with `PROCESS_EXITED_1` and an OpenCode server error. It produced no stdout and did not modify bridge source.

## Boundary

```text
No bridge source files were modified.
No behavior-preserving extraction was attempted.
No extraction evidence was admitted.
The blocked handoff itself is recorded as evidence.
```

## Disposition

```text
DEFERRED_INFRASTRUCTURE_FAILURE
```

Follow-up required before first extraction:

```text
OpenCode request validation must accept SHADOW-REF packet ids or the extraction namespace must be explicitly bridged.
Worker start must be reconciled with execution disable/status gates.
```
