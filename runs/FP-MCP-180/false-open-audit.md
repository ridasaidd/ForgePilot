# FP-MCP-180 False-Open Audit

## Variables traced

```text
runnerCapabilityStatePassed
eligibleForFutureGuardedStart
unexpectedSupportedOperation
startCapabilityCallable
startEndpointState
supportedOperations
startRunOperationAdvertised
directExecutionOperationAdvertised
```

## Normalized predicate

```text
runnerCapabilityStatePassed =
  runnerConfigured &&
  runnerReachable &&
  startEndpointPresent &&
  startEndpointState === "CALLABLE_GUARDED" &&
  startCapabilityCallable &&
  startRunOperationAdvertised &&
  !executionEnabled &&
  !unexpectedSupportedOperation
```

## Direct execution handling

```text
start-run: accepted as guarded start operation
execute: unexpected
action/execution: unexpected
```

`UNEXPECTED_SUPPORTED_OPERATION` now means direct execution operation advertised, not guarded start operation advertised.

## Consumers

`runnerCapabilityStatePassed` feeds:

```text
runnerCapabilityState gate state
eligibleForFutureGuardedStart
```

`eligibleForFutureGuardedStart` still requires:

```text
requestArtifactPassed
commitBindingPassed
modelAndRunModePassed
disableSwitchClear
runnerCapabilityStatePassed
!executionEnabled
!unexpectedSupportedOperation
```

## Hard false outputs preserved

The guarded preflight report still returns:

```text
executionPermitted: false
executionStarted: false
opencodeStarted: false
runnerStartEndpointContacted: false
startEndpointContacted: false
runnerRunId: null
approvalConsumed: false
requestArtifactMutated: false
```

## Real start path boundary

The real start path has a separate disabled-start boundary:

```text
runnerStartEndpointDisabled = startEndpointState === "PRESENT_DISABLED" || !startCapabilityCallable
```

So accepting `CALLABLE_GUARDED` with `startCapabilityCallable: true` in read-only preflight aligns with the existing real-start disabled boundary. It does not itself call that path.

## Conclusion

```text
false_open_found: false
failure_mode_after_fix: guarded readiness label normalized; execution remains blocked by explicit disable gates until consuming action
```
