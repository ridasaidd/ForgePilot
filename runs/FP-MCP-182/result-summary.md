# FP-MCP-182 Result Summary

## Result

```text
RUNNER_CAPABILITY_PREDICATE_LIVE_CONFIRMED_COMPOSITE_ONLY_DISABLE_BLOCKERS_REMAIN
```

## Fresh tuple

```text
requestId: REQ-20260702T210007524Z-4ba16774
approvalId: APPROVAL-20260702T210036474Z-fd2a5a94
approval expires: 2026-07-02T21:25:00Z
```

## Approval-aware validation

`forgepilot_validate_execution_preflight` reached ForgePilot with the approval id.

Passed gates:

```text
requestArtifact
lifecycle
packet
model
runMode
runnerIdentity
runnerCapability
humanApprovalEvidence
opencodeBoundary
```

Blocked/failed gates:

```text
disableSwitch: BLOCKED
executionEnablement: FAILED
```

Approval state:

```text
approvalEvidenceValid: true
approvalUsableForExecution: true
approvalConsumed: false
```

## Guarded report predicate confirmation

The approval-bearing guarded report was platform-blocked before reaching ForgePilot. A guarded report without the approval id reached ForgePilot and confirmed the FP-MCP-180 runtime fields:

```text
runnerCapabilityState: PASSED
UNEXPECTED_SUPPORTED_OPERATION: absent
startRunOperationAdvertised: true
directExecutionOperationAdvertised: false
unexpectedSupportedOperation: false
eligibleForFutureGuardedStart: false
```

The no-approval guarded report is not used to prove the human approval gate, because approval was omitted by construction.

## Remaining blockers

Confirmed disable/policy reasons:

```text
EXECUTION_DISABLED_GLOBAL
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
DISABLE_SWITCH_ACTIVE
EXECUTION_NOT_ALLOWED
START_REQUEST_BLOCKED_BY_DISABLE_SWITCH
```

The older validation tool also emitted the generic legacy reason:

```text
EXECUTION_DISABLED
```

## Safety boundary

```text
executionPermitted: false
executionStarted: false
opencodeStarted: false
startEndpointContacted: false
runnerRunId: null
approvalConsumed: false
requestArtifactMutated: false
canaryRetried: false
```

## Classification

```text
FP-MCP-180 runtime loaded: true
FP-MCP-180 runner capability predicate live-confirmed: true
full approval-bearing guarded report confirmed: false
reason: approval-bearing guarded report payload was platform-blocked before reaching ForgePilot
```
