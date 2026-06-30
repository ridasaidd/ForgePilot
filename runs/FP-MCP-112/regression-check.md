# FP-MCP-112 Disabled Start Stub Safety Regression Check

Result: PASSED

Ran a safety regression check for the disabled runner start stub.

No execution was enabled.

No start operation was made callable.

OpenCode was not started.

No approval was consumed.

No runner run id was created.

No request artifact was mutated.

## Packet

- FP-MCP-112 — Disabled Start Stub Safety Regression Check

## Repository state

Observed before local runner checks:

- repo: ForgePilot
- branch: main
- commit: c251995
- workingTreeClean: true

## MCP bridge status observation

Tool:

- forgepilot_get_remote_runner_status

Observed:

```json
{
  "bridgeHostRole": "staging-control-plane",
  "runnerHostRole": "dev-execution-plane",
  "runnerConfigured": true,
  "runnerReachable": true,
  "runnerEndpointLabel": "configured",
  "runnerVersion": "0.1.0-fp-mcp-024",
  "runnerProtocolVersion": "forgepilot-runner-v1",
  "executionEnabled": false,
  "liveRunnerChecked": true,
  "statusSource": "remote runner capabilities endpoint",
  "boundaryVersion": "FP-MCP-018",
  "checkedAt": "2026-06-30T15:31:31.122Z",
  "supportedOperations": [
    "capabilities",
    "validate-request"
  ],
  "startCapabilityAdvertised": true,
  "startCapabilityCallable": false,
  "startCapabilityVersion": "guarded-start-capability-v0",
  "startOperationName": "start-disabled-stub",
  "startEndpointPresent": true,
  "startEndpointState": "PRESENT_DISABLED",
  "startRequiresApprovalEvidence": true,
  "startRequiresPreflight": true,
  "startRequiresDisableSwitchClear": true,
  "startRequiresRequestArtifactHash": true,
  "startRequiresTargetExecutionCommit": true,
  "startRequiresEvidenceLedgerValidation": true,
  "startRecordsPreStartState": false,
  "startRecordsPostStartState": false,
  "startReturnsRunnerRunId": false,
  "startDisabledReason": "START_ENDPOINT_PRESENT_DISABLED",
  "startBlockingReasons": [
    "START_ENDPOINT_DISABLED",
    "START_NOT_CALLABLE",
    "RUNNER_EXECUTION_DISABLED",
    "OPENCODE_EXECUTION_DISABLED"
  ],
  "supportedRunModes": [
    "DESIGN_ONLY"
  ],
  "allowedModels": [
    "deepseek-v4-pro-high",
    "qwen-3.7-max"
  ],
  "reasons": []
}
```

Result:

- bridge status reports disabled start endpoint state
- bridge status reports execution disabled
- bridge status reports start not callable
- bridge status keeps supported operations validation-safe

## Raw authenticated runner capabilities

Endpoint:

- http://127.0.0.1:8791/runner/capabilities

Authentication:

- local runner token from ~/.config/forgepilot-runner.env
- token value not recorded

Observed:

```json
{
  "runnerConfigured": true,
  "runnerHostRole": "dev-execution-plane",
  "runnerVersion": "0.1.0-fp-mcp-024",
  "runnerProtocolVersion": "forgepilot-runner-v1",
  "executionEnabled": false,
  "opencodeHarnessConfigured": false,
  "opencodeHarnessReachable": false,
  "supportedOperations": [
    "capabilities",
    "validate-request"
  ],
  "startCapabilityAdvertised": true,
  "startCapabilityCallable": false,
  "startCapabilityVersion": "guarded-start-capability-v0",
  "startOperationName": "start-disabled-stub",
  "startEndpointPresent": true,
  "startEndpointState": "PRESENT_DISABLED",
  "startRequiresApprovalEvidence": true,
  "startRequiresPreflight": true,
  "startRequiresDisableSwitchClear": true,
  "startRequiresRequestArtifactHash": true,
  "startRequiresTargetExecutionCommit": true,
  "startRequiresEvidenceLedgerValidation": true,
  "startRecordsPreStartState": false,
  "startRecordsPostStartState": false,
  "startReturnsRunnerRunId": false,
  "startDisabledReason": "START_ENDPOINT_PRESENT_DISABLED",
  "startBlockingReasons": [
    "START_ENDPOINT_DISABLED",
    "START_NOT_CALLABLE",
    "RUNNER_EXECUTION_DISABLED",
    "OPENCODE_EXECUTION_DISABLED"
  ],
  "supportedRunModes": [
    "DESIGN_ONLY"
  ],
  "allowedModels": [
    "deepseek-v4-pro-high",
    "qwen-3.7-max"
  ],
  "statusSource": "private dev runner static policy",
  "checkedAt": "2026-06-30T15:31:46.872Z",
  "reasons": [
    "EXECUTION_DISABLED"
  ]
}
```

Result:

- raw runner capabilities report disabled start endpoint state
- executionEnabled is false
- startCapabilityCallable is false
- supportedOperations remains validation-safe
- reasons include EXECUTION_DISABLED

## Unauthenticated start request

Request:

- POST http://127.0.0.1:8791/runner/start-run
- no Authorization header

Observed:

```json
{
  "valid": false,
  "accepted": false,
  "runnerConfigured": true,
  "runnerContacted": true,
  "executionEnabled": false,
  "executionStarted": false,
  "opencodeStarted": false,
  "runnerRunId": null,
  "startEndpointContacted": true,
  "runnerProtocolVersion": "forgepilot-runner-v1",
  "boundaryVersion": "FP-MCP-024",
  "statusSource": "private dev runner authentication policy",
  "checkedAt": "2026-06-30T15:31:46.923Z",
  "reasons": [
    "RUNNER_AUTH_FAILED"
  ]
}
```

Result:

- unauthenticated request failed at auth boundary
- executionStarted remained false
- opencodeStarted remained false
- runnerRunId remained null

## Authenticated start request

Request:

- POST http://127.0.0.1:8791/runner/start-run
- Authorization: local runner token
- Content-Type: application/json
- body:
  - packetId: FP-MCP-112
  - requestId: REGRESSION-CHECK
  - approval: START_REMOTE_RUNNER_REQUEST

Observed:

```json
{
  "valid": false,
  "accepted": false,
  "executionEnabled": false,
  "executionStarted": false,
  "opencodeStarted": false,
  "runnerRunId": null,
  "startEndpointContacted": true,
  "startEndpointState": "PRESENT_DISABLED",
  "startCapabilityCallable": false,
  "executionAllowedNow": false,
  "approvalConsumed": false,
  "approvalConsumptionPath": null,
  "preStartEvidenceCreated": false,
  "postStartEvidenceCreated": false,
  "requestArtifactMutated": false,
  "runnerProtocolVersion": "forgepilot-runner-v1",
  "boundaryVersion": "FP-MCP-024",
  "statusSource": "private dev runner disabled start stub policy",
  "checkedAt": "2026-06-30T15:31:46.970Z",
  "reasons": [
    "START_ENDPOINT_DISABLED",
    "START_NOT_CALLABLE",
    "EXECUTION_NOT_ALLOWED",
    "RUNNER_EXECUTION_DISABLED",
    "OPENCODE_EXECUTION_DISABLED"
  ]
}
```

Result:

- authenticated request failed closed
- canonical approval phrase did not authorize execution
- executionAllowedNow remained false
- approvalConsumed remained false
- preStartEvidenceCreated remained false
- postStartEvidenceCreated remained false
- requestArtifactMutated remained false
- executionStarted remained false
- opencodeStarted remained false
- runnerRunId remained null

## Safety result

Preserved:

- executionEnabled: false
- startCapabilityCallable: false
- supportedOperations:
  - capabilities
  - validate-request
- unauthenticated start fails with RUNNER_AUTH_FAILED
- authenticated start fails with START_ENDPOINT_DISABLED
- executionStarted: false
- opencodeStarted: false
- runnerRunId: null
- approvalConsumed: false
- requestArtifactMutated: false
- no execution authorized
- no OpenCode start observed
- no runner run id created

## Conclusion

FP-MCP-112 passed.

The disabled start stub continues to preserve all non-execution safety invariants across bridge status, raw runner capabilities, unauthenticated start request, and authenticated start request.
