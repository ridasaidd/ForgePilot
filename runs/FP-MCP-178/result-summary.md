# FP-MCP-178 Result Summary

## Result

```text
FP_027_CANARY_BLOCKED_BEFORE_RUNNER_CONTACT
```

## Fresh tuple

```text
packet: FP-MCP-178
requestId: REQ-20260702T200335727Z-c3299ea6
approvalId: APPROVAL-20260702T200411965Z-66483727
contactConfirmation: CONTACT_RUNNER_START_ENDPOINT_ONCE
```

## Fragile checkpoint result

The canonical state snapshot recorder succeeded this time.

```text
stateSnapshotAttemptId: ATTEMPT-20260702T200459184Z-de779d51
preStartSnapshotRecorded: true
postStartSnapshotRecorded: true
```

## Passed gates

```text
repository
requestArtifact
commitBinding
modelAndRunMode
preStartEvidence
stateSnapshotEvidence
humanApprovalEvidence
evidenceLedgerReadiness
```

## Blocking gates

```text
disableSwitch: FAILED
runnerCapabilityState: FAILED
opencodeReadiness: FAILED
```

Reasons:

```text
EXECUTION_DISABLED_GLOBAL
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
DISABLE_SWITCH_ACTIVE
EXECUTION_NOT_ALLOWED
START_REQUEST_BLOCKED_BY_DISABLE_SWITCH
UNEXPECTED_SUPPORTED_OPERATION
```

## OpenCode readiness state

```text
opencodeDiscoveryConfigured: true
opencodeConfigured: true
opencodeExecutionEnabled: false
liveOpenCodeChecked: false
opencodeReadyForFutureGuardedStart: false
```

## Safety boundary

```text
startToolInvoked: false
runnerStartEndpointContacted: false
startEndpointContacted: false
executionStarted: false
opencodeStarted: false
runnerRunId: null
approvalConsumed: false
requestArtifactMutated: false
canary_worker_started: false
retry_attempted: false
```

## Disposition

The canary did not contact the runner because guarded preflight still blocks on the global execution disable state and OpenCode execution disabled state.

No retry was attempted.
