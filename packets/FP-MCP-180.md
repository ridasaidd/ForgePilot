# FP-MCP-180 — Guarded Runner Capability Predicate Normalization

## Task

Normalize the guarded preflight runner capability predicate so it accepts the current guarded runner shape without enabling execution.

This packet fixes a stale fail-closed readiness predicate identified by FP-MCP-179.

## Source Finding

FP-MCP-179 found that guarded preflight still expected the original pre-contact runner shape introduced by the `Add guarded start` source commit:

```text
startEndpointState === PRESENT_GUARDED
!startCapabilityCallable
!unexpectedSupportedOperation
```

The live runner now intentionally reports:

```text
startEndpointState: CALLABLE_GUARDED
startCapabilityCallable: true
supportedOperations includes start-run
executionEnabled: false
```

## Required Fix

The normalized predicate must accept:

```text
runnerConfigured: true
runnerReachable: true
startEndpointPresent: true
startEndpointState: CALLABLE_GUARDED
startCapabilityCallable: true
supportedOperations includes start-run
executionEnabled: false
```

The normalized predicate must continue to reject:

```text
execute
execution
unknown direct execution operations
missing start-run
non-guarded or unknown endpoint states
executionEnabled: true during preflight eligibility
```

## Safety Requirements

The fix must preserve:

```text
executionPermitted: false
runnerStartEndpointContacted: false
startEndpointContacted: false
opencodeStarted: false
approvalConsumed: false
requestArtifactMutated: false
```

until the explicit consuming-action step.

## False-Open Audit Requirement

After the fix, trace every consumer of:

```text
runnerCapabilityStatePassed
eligibleForFutureGuardedStart
unexpectedSupportedOperation
startCapabilityCallable
startEndpointState
supportedOperations
```

and confirm the normalized predicate does not create a permissive execution path.

## Pattern Note

This is the fourth observed instance of the same bug family:

```text
FP-021: gate not wired in at all
FP-028: policy surfaces disagreed on field meaning
FP-MCP-173: field-name mismatch caused false negative
FP-MCP-179: predicate expected obsolete runner capability shape
```

After this fix lands, the guarded preflight predicate should be considered for a from-scratch re-derivation and focused test suite, not just further incremental patches.

## Expected Result

```text
RUNNER_CAPABILITY_PREDICATE_NORMALIZED_SOURCE_VERIFIED_FAIL_CLOSED_BOUNDARY_PRESERVED
```
