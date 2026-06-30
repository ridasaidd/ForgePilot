# FP-MCP-108 Executor Result

Result: SUCCESS

Implemented bridge passthrough for disabled runner start capability metadata.

## Repositories involved

ForgePilot packet/evidence repository:

- ~/forgepilot

Bridge implementation repository:

- ~/forgepilot-chatgpt-mcp

## Packet

- FP-MCP-108 — Bridge Runner Capability Metadata Passthrough

## Implementation summary

Updated the MCP bridge remote runner status output so that the `forgepilot_get_remote_runner_status` tool exposes disabled start capability metadata already present on the authenticated raw runner capabilities endpoint.

The change was limited to bridge status normalization/passthrough.

## Bridge implementation change

Changed:

- ~/forgepilot-chatgpt-mcp/src/server.ts

Added passthrough fields to the remote runner status schema and copied them from the runner capabilities response.

Required fields exposed:

- startCapabilityAdvertised
- startCapabilityCallable
- startCapabilityVersion
- startOperationName
- startRequiresApprovalEvidence
- startRequiresPreflight
- startRequiresDisableSwitchClear
- startRequiresRequestArtifactHash
- startRequiresTargetExecutionCommit
- startRequiresEvidenceLedgerValidation
- startRecordsPreStartState
- startRecordsPostStartState
- startReturnsRunnerRunId
- startDisabledReason
- startBlockingReasons

## Verification commands

The first patch script attempted:

- pnpm typecheck

Result:

- failed because this repository does not define a `typecheck` command

Manual verification then ran:

- pnpm test
- pnpm build

Observed:

- pnpm test invoked pnpm build
- pnpm build invoked tsc
- tsc passed

## Bridge restart

The MCP bridge service was restarted:

- systemctl --user restart forgepilot-chatgpt-mcp

Actions were refreshed after restart.

## MCP observation after restart

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
  "checkedAt": "2026-06-30T13:25:09.010Z",
  "supportedOperations": [
    "capabilities",
    "validate-request"
  ],
  "startCapabilityAdvertised": true,
  "startCapabilityCallable": false,
  "startCapabilityVersion": "guarded-start-capability-v0",
  "startOperationName": null,
  "startRequiresApprovalEvidence": true,
  "startRequiresPreflight": true,
  "startRequiresDisableSwitchClear": true,
  "startRequiresRequestArtifactHash": true,
  "startRequiresTargetExecutionCommit": true,
  "startRequiresEvidenceLedgerValidation": true,
  "startRecordsPreStartState": true,
  "startRecordsPostStartState": true,
  "startReturnsRunnerRunId": false,
  "startDisabledReason": "START_CAPABILITY_ADVERTISEMENT_ONLY",
  "startBlockingReasons": [
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

## Safety result

Preserved:

- executionEnabled: false
- supportedOperations:
  - capabilities
  - validate-request
- startCapabilityCallable: false
- startOperationName: null
- startReturnsRunnerRunId: false
- startDisabledReason: START_CAPABILITY_ADVERTISEMENT_ONLY
- startBlockingReasons include START_NOT_CALLABLE
- no runner start endpoint contacted
- no OpenCode process started
- no approval evidence created
- no approval consumed
- no runner run id created

## Conclusion

FP-MCP-108 succeeded.

The MCP bridge now exposes disabled runner start capability metadata while preserving non-execution behavior.
