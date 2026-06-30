# FP-MCP-107 Capabilities Observation

Result: PASSED

Observed the authenticated raw local runner capabilities endpoint after restarting the `forgepilot-runner` user service.

## Observation method

The endpoint requires the runner authorization token.

Unauthenticated local request returned:

- HTTP 401 Unauthorized
- reason: RUNNER_AUTH_FAILED

Authenticated local request used the token from the local runner environment file without exposing the token.

Environment source:

- ~/.config/forgepilot-runner.env

Endpoint:

- http://127.0.0.1:8791/runner/capabilities

## Required metadata fields

Observed:

- startCapabilityAdvertised: true
- startCapabilityCallable: false
- startCapabilityVersion: guarded-start-capability-v0
- startOperationName: null
- startRequiresApprovalEvidence: true
- startRequiresPreflight: true
- startRequiresDisableSwitchClear: true
- startRequiresRequestArtifactHash: true
- startRequiresTargetExecutionCommit: true
- startRequiresEvidenceLedgerValidation: true
- startRecordsPreStartState: true
- startRecordsPostStartState: true
- startReturnsRunnerRunId: false
- startDisabledReason: START_CAPABILITY_ADVERTISEMENT_ONLY
- startBlockingReasons:
  - START_NOT_CALLABLE
  - RUNNER_EXECUTION_DISABLED
  - OPENCODE_EXECUTION_DISABLED

## Supported operations

Observed:

- capabilities
- validate-request

Start is not listed in supported operations.

## Execution state

Observed:

- executionEnabled: false
- opencodeHarnessConfigured: false
- opencodeHarnessReachable: false
- reasons:
  - EXECUTION_DISABLED

## Conclusion

The runner now advertises disabled start capability metadata while preserving validation-only supported operations and disabled execution state.
