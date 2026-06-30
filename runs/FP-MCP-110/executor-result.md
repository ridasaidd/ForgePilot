# FP-MCP-110 Executor Result

Result: SUCCESS

Implemented the guarded start endpoint disabled stub.

## Packet

- FP-MCP-110 — Guarded Start Endpoint Disabled Stub Implementation

## Implementation commits

- 0c06682 Implement disabled runner start stub
- d0389b8 Enforce auth on disabled runner start stub

## Files changed

- runner/server.mjs

## Implementation summary

FP-MCP-110 refined the existing runner start-shaped endpoint:

- existing route: POST /runner/start-run
- endpoint state: PRESENT_DISABLED
- endpoint behavior: hard-disabled fail-closed stub
- start callable: false
- execution enabled: false
- OpenCode started: false
- runner run id created: false
- approval consumed: false
- request artifact mutated: false

The implementation also updated runner capabilities metadata from advertisement-only metadata to disabled-stub metadata.

## Capability metadata observed on raw authenticated runner endpoint

Authenticated local runner capabilities endpoint:

- http://127.0.0.1:8791/runner/capabilities

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
  "checkedAt": "2026-06-30T13:41:30.646Z",
  "reasons": [
    "EXECUTION_DISABLED"
  ]
}
```

## Unauthenticated start observation

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
  "checkedAt": "2026-06-30T13:40:18.737Z",
  "reasons": [
    "RUNNER_AUTH_FAILED"
  ]
}
```

Result:

- unauthenticated request failed at auth boundary
- disabled-start processing did not authorize execution
- executionStarted remained false
- opencodeStarted remained false
- runnerRunId remained null

## Authenticated start observation

Request:

- POST http://127.0.0.1:8791/runner/start-run
- Authorization: Bearer local runner token
- request body included packetId FP-MCP-110 and approval phrase

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
  "checkedAt": "2026-06-30T13:40:24.298Z",
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
- canonical approval phrase was not sufficient to start
- executionStarted remained false
- opencodeStarted remained false
- runnerRunId remained null
- approvalConsumed remained false
- requestArtifactMutated remained false
- no pre-start evidence created
- no post-start evidence created

## MCP bridge observation

The MCP bridge status tool observed the updated disabled-stub metadata that FP-MCP-108 already passed through:

- startOperationName: start-disabled-stub
- startCapabilityCallable: false
- startRecordsPreStartState: false
- startRecordsPostStartState: false
- startReturnsRunnerRunId: false
- startDisabledReason: START_ENDPOINT_PRESENT_DISABLED
- startBlockingReasons:
  - START_ENDPOINT_DISABLED
  - START_NOT_CALLABLE
  - RUNNER_EXECUTION_DISABLED
  - OPENCODE_EXECUTION_DISABLED
- supportedOperations:
  - capabilities
  - validate-request
- executionEnabled: false

Bridge passthrough gap observed:

- raw runner endpoint includes `startEndpointPresent`
- raw runner endpoint includes `startEndpointState`
- current MCP bridge status output does not yet pass through those two fields

This gap does not affect runner behavior.

A follow-up bridge passthrough packet should add these two fields to MCP status output.

Suggested next packet:

- FP-MCP-111 — Bridge Start Endpoint State Passthrough

## Safety result

Preserved:

- startCapabilityCallable: false
- executionEnabled: false
- supportedOperations remained validation-safe
- OpenCode not started
- runnerRunId not created
- approval not consumed
- approval artifact not mutated
- request artifact not mutated
- no execution artifacts created
- no model provider contacted

## Conclusion

FP-MCP-110 succeeded.

A disabled start-shaped endpoint now exists as a hard-disabled fail-closed stub.

The endpoint is authenticated and cannot start execution.
