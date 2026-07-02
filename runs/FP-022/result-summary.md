# FP-022 Result Summary

## Result

```text
EXECUTION_CAPABLE_TOOL_GATE_AUDIT_COMPLETE
```

## Expanded tool surface

SHADOW-REF-006 recorded 29 registered tools by static parsing of `src/server.ts` only.

FP-022 expanded the parse to include delegated registrations in:

```text
src/tool-registrations/recent-tools.ts
```

Expanded count:

```text
38 registered tools
```

## Finding A — SHADOW-REF-006 tool surface was incomplete

```text
TOOL_SURFACE_SNAPSHOT_INCOMPLETE_STATIC_SERVER_ONLY_PARSE
```

The SHADOW-REF-006 tool count of 29 was accurate for direct `src/server.ts` registrations, but incomplete for the effective registered tool surface because `registerRecentToolRegistrations(...)` adds additional tool registrations from `src/tool-registrations/recent-tools.ts`.

This does not invalidate the `server.ts` hash baseline, but it does mean future tool-contract acceptance must use the expanded tool-surface parser.

## Execution-capable entrypoints

FP-022 identifies three execution-capable registered tools:

```text
forgepilot_start_opencode_worker
forgepilot_start_remote_runner_request
forgepilot_execute_terminal_command
```

## Finding B — same FP-021 missing-gate pattern

```text
ONLY_FORGEPILOT_START_OPENCODE_WORKER_MATCHES_FP021_MISSING_GATE_PATTERN
```

`forgepilot_start_opencode_worker` reaches process spawn after only local checks and does not enforce the execution disable switch, guarded preflight, request validation, human approval, model/run-mode allowlists, or packet namespace policy.

## Finding C — remote runner start has explicit guarded gates

```text
REMOTE_RUNNER_START_HAS_GUARDED_GATE_PATH_BY_SOURCE_INSPECTION
```

`forgepilot_start_remote_runner_request` calls local request validation, runner status/capability checks, execution disable switch status, pre-start evidence validation, state snapshot validation, and human approval validation before contacting the runner start endpoint.

FP-022 does not prove those gates are bug-free, but it does not share the FP-021 missing-gate pattern.

## Finding D — terminal command execution is a separate command-authority surface

```text
TERMINAL_COMMAND_HAS_SEPARATE_TERMINAL_SAFETY_GATE_BY_SOURCE_INSPECTION
```

`forgepilot_execute_terminal_command` is execution-capable, but it is intentionally a terminal-command authority surface with its own gate:

```text
approval string
workspace allowlist
working-directory containment
non-empty command and rationale
timeout cap
rate limit
long-running guidance block
FORGEPILOT_TERMINAL_EXECUTION_ENABLED=false block
hard-block patterns
risk classification
pre/post git status capture
evidence logging
```

It does not use the OpenCode execution disable switch, but FP-022 classifies that as a separate policy surface rather than the same FP-021 bug.

A future governance packet may decide whether global execution-disable semantics should also cover terminal execution, but that is not the observed OpenCode worker-start gap.

## Extraction status

```text
EXTRACTION_REMAINS_BLOCKED_UNTIL_FP021_FIX
```

No extraction should resume until `forgepilot_start_opencode_worker` is fixed and regression-tested.
