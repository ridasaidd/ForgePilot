# FP-MCP-179 Result Summary

## Result

```text
RUNNER_CAPABILITY_PREDICATE_MISMATCH_CLASSIFIED_FAILS_CLOSED_FIX_REQUIRED_BEFORE_ENABLEMENT
```

## Finding

`UNEXPECTED_SUPPORTED_OPERATION` is not benign noise.

It is a stale guarded-preflight predicate relative to the current runner capability shape.

## Live runner shape

```text
startEndpointPresent: true
startEndpointState: CALLABLE_GUARDED
startCapabilityCallable: true
supportedOperations: capabilities, validate-request, start-run
executionEnabled: false
```

## Source predicate

`unexpectedSupportedOperation` is true when the runner advertises:

```text
start-run
execute
execution
```

The runner capability gate currently requires:

```text
startEndpointState === PRESENT_GUARDED
!startCapabilityCallable
!unexpectedSupportedOperation
```

So the gate still expects the older pre-contact/non-callable capability shape.

## Classification

```text
benign noise: false
schema/policy drift: true
fails open: false
fails closed: true
```

This is safe because it blocks. It is not correct for the intended canary path, because the current guarded runner intentionally advertises a callable guarded `start-run` operation while `executionEnabled` remains false.

## Required next work

```text
FP-MCP-180: normalize guarded preflight runner capability predicate
```

The fix must accept the current guarded capability shape only while preserving:

```text
executionPermitted: false
runnerStartEndpointContacted: false
opencodeStarted: false
approvalConsumed: false
```

until the explicit consuming-action step.
