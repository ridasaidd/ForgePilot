# FP-MCP-113 Start Stub Tool Boundary Alignment

Result: PASSED

Aligned the MCP `forgepilot_start_remote_runner_request` tool boundary with the runner `PRESENT_DISABLED` start endpoint state.

The tool now fails closed inside the MCP bridge before contacting the runner start endpoint when:

- `startEndpointState: PRESENT_DISABLED`
- or `startCapabilityCallable: false`

No execution was enabled.

No start operation was made callable.

No runner start endpoint contact occurred during the MCP start-tool boundary test.

OpenCode was not started.

No approval was consumed.

No runner run id was created.

No request artifact was mutated.

## Packet

- FP-MCP-113 — Start Stub Tool Boundary Alignment

## Implementation repository

Bridge repository:

- ~/forgepilot-chatgpt-mcp

Implementation commit:

- 22e1c12 Fail closed on disabled runner start boundary

Implementation branch observed:

- feature/oauth-auth0

## Files changed

- ~/forgepilot-chatgpt-mcp/src/server.ts

## Implementation summary

Added bridge-side disabled start boundary classification to `startRemoteRunnerRequest`.

The tool reads remote runner status early and rejects before runner start endpoint contact if disabled-start state is observed.

Disabled-start detection:

- `startEndpointState === "PRESENT_DISABLED"`
- or `startCapabilityCallable === false`

Fail-closed result shape includes:

- `started: false`
- `accepted: false`
- `runnerContacted: false`
- `runnerStartEndpointContacted: false`
- `startEndpointContacted: false`
- `startEndpointPresent`
- `startEndpointState`
- `startCapabilityCallable`
- `executionStarted: false`
- `opencodeStarted: false`
- `executionAllowedNow: false`
- `runnerRunId: null`
- `approvalConsumed: false`
- `approvalConsumptionPath: null`
- `preStartEvidenceCreated: false`
- `postStartEvidenceCreated: false`
- `requestArtifactMutated: false`
- `boundaryVersion: FP-MCP-113`
- `statusSource: MCP bridge disabled-start boundary policy`

The bridge output schema was extended with optional observation fields needed for disabled-start boundary reporting.

## Build verification

Command:

- pnpm build

Observed:

- tsc passed

## Service restart

The MCP bridge service was restarted after implementation:

- systemctl --user restart forgepilot-chatgpt-mcp

Actions were refreshed after restart.

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
  "checkedAt": "2026-06-30T15:44:23.390Z",
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

- runner is reachable
- execution remains disabled
- start endpoint is present but disabled
- start capability is not callable
- supported operations remain validation-safe:
  - capabilities
  - validate-request

## MCP start-tool boundary observation

Tool:

- forgepilot_start_remote_runner_request

Input:

```json
{
  "packetId": "FP-MCP-113",
  "requestId": "REGRESSION-CHECK",
  "approval": "START_REMOTE_RUNNER_REQUEST"
}
```

Observed:

```json
{
  "started": false,
  "accepted": false,
  "approvalAccepted": true,
  "runnerConfigured": true,
  "runnerContacted": false,
  "startEndpointContacted": false,
  "executionStarted": false,
  "opencodeStarted": false,
  "executionAllowedNow": false,
  "packetId": "FP-MCP-113",
  "requestId": "REGRESSION-CHECK",
  "approvalId": null,
  "approvalPacketId": null,
  "approvalPath": null,
  "requestArtifactPath": null,
  "requestArtifactSha256": null,
  "baseCommit": "64a16a7",
  "runnerRunId": null,
  "artifactDir": null,
  "runnerProtocolVersion": null,
  "boundaryVersion": "FP-MCP-113",
  "statusSource": "MCP bridge disabled-start boundary policy",
  "checkedAt": "2026-06-30T15:44:49.331Z",
  "localValidationPassed": false,
  "remoteValidationPassed": false,
  "preStartStateRecorded": false,
  "postStartStateRecorded": false,
  "disableSwitchStatusEvaluated": false,
  "disableSwitchActive": false,
  "effectiveDisableReason": null,
  "effectiveDisableScope": null,
  "preStartEvidenceEvaluated": false,
  "preStartEvidenceComplete": false,
  "preStartEvidenceValid": false,
  "preStartEvidencePath": null,
  "preStartEvidenceMissingEvidence": [],
  "preStartEvidenceInconsistentEvidence": [],
  "stateSnapshotEvaluated": false,
  "stateSnapshotComplete": false,
  "stateSnapshotValid": false,
  "stateSnapshotPath": null,
  "stateSnapshotAttemptId": null,
  "stateSnapshotMissingEvidence": [],
  "stateSnapshotInconsistentEvidence": [],
  "humanApprovalEvidenceEvaluated": false,
  "humanApprovalEvidenceGatePassed": false,
  "humanApprovalEvidenceId": null,
  "humanApprovalEvidencePath": null,
  "humanApprovalEvidenceValid": false,
  "humanApprovalEvidenceUsableForExecution": false,
  "humanApprovalEvidenceReasons": [],
  "approvalValidationEvaluated": false,
  "approvalEvidenceValid": false,
  "approvalValid": false,
  "approvalUsableForExecution": false,
  "approvalConsumed": false,
  "consumptionEvidenceEvaluated": false,
  "consumptionEvidencePresent": false,
  "consumptionEvidenceValid": false,
  "consumptionEvidenceId": null,
  "consumptionEvidencePath": null,
  "approvalCreated": false,
  "approvalMutated": false,
  "humanApprovalRecorded": false,
  "reasons": [
    "START_ENDPOINT_DISABLED",
    "START_NOT_CALLABLE",
    "EXECUTION_NOT_ALLOWED",
    "RUNNER_EXECUTION_DISABLED",
    "OPENCODE_EXECUTION_DISABLED",
    "INVALID_REQUEST_ID"
  ],
  "runnerStartEndpointContacted": false,
  "startEndpointPresent": true,
  "startEndpointState": "PRESENT_DISABLED",
  "startCapabilityCallable": false,
  "approvalConsumptionPath": null,
  "preStartEvidenceCreated": false,
  "postStartEvidenceCreated": false,
  "requestArtifactMutated": false
}
```

Result:

- MCP start tool rejected inside bridge
- runnerContacted: false
- runnerStartEndpointContacted: false
- startEndpointContacted: false
- executionStarted: false
- opencodeStarted: false
- runnerRunId: null
- approvalConsumed: false
- requestArtifactMutated: false

`INVALID_REQUEST_ID` is expected because the test used `REGRESSION-CHECK` instead of a real request artifact.

The important safety result is that disabled-start boundary classification fired before start endpoint contact.

## Required reasons observed

Observed:

- `START_ENDPOINT_DISABLED`
- `START_NOT_CALLABLE`
- `EXECUTION_NOT_ALLOWED`
- `RUNNER_EXECUTION_DISABLED`
- `OPENCODE_EXECUTION_DISABLED`

Additional expected test-fixture reason:

- `INVALID_REQUEST_ID`

## Safety result

Preserved:

- executionEnabled: false
- startCapabilityCallable: false
- startEndpointState: PRESENT_DISABLED
- supportedOperations:
  - capabilities
  - validate-request
- runnerContacted: false
- runnerStartEndpointContacted: false
- startEndpointContacted: false
- executionStarted: false
- opencodeStarted: false
- runnerRunId: null
- approvalConsumed: false
- requestArtifactMutated: false
- no execution authorized
- no OpenCode start observed
- no runner run id created

## Conclusion

FP-MCP-113 passed.

The MCP start-shaped tool boundary is now aligned with the disabled runner start stub state.

When the runner reports `PRESENT_DISABLED`, the MCP bridge fails closed before contacting `/runner/start-run`.
