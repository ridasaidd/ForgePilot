# FP-021 Safety Disposition

## New disposition

```text
SAFETY_GATE_FAILURE
```

## Meaning

A safety or execution-control surface reported that execution was disabled, blocked, or not allowed, but an execution-capable path still crossed the boundary it was supposed to protect.

## Not equivalent to infrastructure failure

`SAFETY_GATE_FAILURE` must not be collapsed into:

```text
DEFERRED_INFRASTRUCTURE_FAILURE
```

because the issue is not merely that infrastructure was unavailable or misconfigured.

The control reported a disabled state, yet the worker-start path still spawned a process.

## Required handling

When `SAFETY_GATE_FAILURE` is observed:

```text
stop dependent implementation work
record source and runtime evidence
identify blast radius
require a fix packet
require a regression test proving the gate blocks the unsafe action
```
