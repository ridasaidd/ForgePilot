# FP-MCP-181 — FP-MCP-180 Live Runner Capability Confirmation

## Task

Live-confirm the FP-MCP-180 guarded runner capability predicate normalization using a fresh, non-expired tuple.

This packet is read-only confirmation. It must not enable execution, contact the runner start endpoint, consume approval, start OpenCode, mutate request artifacts, or retry the canary.

## Context

The FP-MCP-178 approval expired before FP-MCP-180 runtime confirmation. This packet creates a fresh tuple instead of reusing expired approval evidence.

## Expected Runtime Result

```text
RUNNER_CAPABILITY_PREDICATE_LIVE_CONFIRMED_ONLY_DISABLE_BLOCKERS_REMAIN
```

## Expected Values

```text
runnerCapabilityState: PASSED
UNEXPECTED_SUPPORTED_OPERATION: absent
startRunOperationAdvertised: true
directExecutionOperationAdvertised: false
unexpectedSupportedOperation: false
eligibleForFutureGuardedStart: false
```

Expected remaining blockers:

```text
EXECUTION_DISABLED_GLOBAL
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
DISABLE_SWITCH_ACTIVE
EXECUTION_NOT_ALLOWED
START_REQUEST_BLOCKED_BY_DISABLE_SWITCH
```
