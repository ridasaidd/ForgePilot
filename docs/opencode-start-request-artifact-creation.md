# OpenCode Start Request Artifact Creation

Packet: FP-MCP-082

## Result

FP-MCP-082 created a durable non-executing OpenCode request artifact, but the created artifact does not yet satisfy the full FP-MCP-082 request artifact contract.

This is a useful implementation-boundary result.

The MCP path can create a request artifact without starting OpenCode, but the artifact shape is still the earlier FP-MCP-007 shape.

## Created Request Artifact

```text
requestId: REQ-20260629T131053102Z-5f58e3e3
requestArtifactPath: runs/FP-MCP-082/opencode-requests/REQ-20260629T131053102Z-5f58e3e3.json
modelId: deepseek-v4-pro-high
runMode: DESIGN_ONLY
executionEnabled: false
executionStarted: false
```

## Confirmed Non-Execution Facts

```text
executionAllowedNow: false
globalDisableActive: true
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
startEndpointContacted: false
opencodeStarted: false
runnerRunIdCreated: false
```

## Contract Mismatch

The created artifact was valid JSON and durable, but it recorded:

```text
schemaVersion: FP-MCP-007
boundaryVersion: FP-MCP-007
status: REQUEST_RECORDED
```

FP-MCP-082 expected the request artifact to include the expanded FP-MCP-082 contract fields, including:

```text
schemaVersion: FP-MCP-082
artifactType: opencode-start-request
requestState: CREATED_NOT_STARTED
createdByTool: forgepilot_create_opencode_run_request
runnerStartEndpointContactAuthorized: false
executionEnablementAuthorized: false
executionAllowedNow: false
globalDisableActive: true
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
startEndpointContacted: false
opencodeStarted: false
runnerRunId: null
approvalRequired: true
approvalId: null
approvalPath: null
consumptionRequired: true
consumptionId: null
statusSources
boundaryVersion: FP-MCP-081
```

Therefore, FP-MCP-082 should not be marked fully complete until the create-request tool is updated to emit the FP-MCP-082 artifact contract.

## Implementation Boundary Preserved

No execution-capable behavior was observed.

The create request path did not:

```text
enable execution
relax the global disable switch
contact runner start endpoint
start OpenCode
create runnerRunId
consume approval
create approval evidence
create consumption evidence
mutate approval evidence
mutate consumption evidence
refactor server.ts
```

## Next Implementation Step

Update the create-request implementation so `forgepilot_create_opencode_run_request` emits the FP-MCP-082 request artifact shape while preserving the existing non-execution behavior.

This should be done as a code patch, because it will likely modify server-side MCP tool code.

