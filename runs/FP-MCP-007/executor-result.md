# FP-MCP-007 Executor Result

## Packet

FP-MCP-007 — OpenCode Run Request Artifact Tool

## Repository State

ForgePilot repository:

```text
/home/ridasaidd/forgepilot
```

ForgePilot branch:

```text
main
```

ForgePilot packet commit:

```text
87c4a44
```

Bridge repository:

```text
/home/ridasaidd/forgepilot-chatgpt-mcp
```

Bridge branch:

```text
feature/oauth-auth0
```

Bridge implementation commit:

```text
Add OpenCode run request artifact tool
```

## Implementation Summary

FP-MCP-007 added a write-capable but non-executing ForgePilot MCP tool:

```text
forgepilot_create_opencode_run_request
```

The tool creates a durable OpenCode run request artifact after validating the request under the FP-MCP-006 validation boundary.

The tool accepts only structured fields:

```text
packetId
modelId
runMode
approval
```

The tool does not accept:

* shell commands
* arbitrary prompts
* arbitrary filesystem paths
* Git arguments
* SQL
* secrets
* environment variables
* raw OpenCode configuration

## Behavior Implemented

The tool validates:

* approval value
* packet id format
* packet existence under `packets/`
* model allowlist membership
* run mode allowlist membership
* ForgePilot working tree cleanliness

The tool creates request artifacts only under:

```text
runs/<packetId>/opencode-requests/
```

The tool returns:

* `created`
* `valid`
* `executionEnabled`
* `executionStarted`
* `requiresApproval`
* `approvalAccepted`
* `requestId`
* `requestArtifactPath`
* `packetId`
* `modelId`
* `runMode`
* `baseCommit`
* `boundaryVersion`
* `statusSource`
* `reasons`

## Tool Annotation

The tool is intentionally not marked read-only because it creates a request artifact.

Expected annotation behavior:

```text
readOnlyHint: false
destructiveHint: false
idempotentHint: false
openWorldHint: false
```

## Execution Boundary

The tool always reports:

```json
{
  "executionEnabled": false,
  "executionStarted": false
}
```

A created request artifact means:

```text
A structured request was recorded.
```

It does not mean:

```text
OpenCode may now run.
```

## ChatGPT MCP Connector Verification

The tool became visible after Actions refresh and runtime propagation.

Validated tool:

```text
forgepilot_create_opencode_run_request
```

### Missing Approval

Input:

```json
{
  "packetId": "FP-MCP-007",
  "modelId": "qwen-3.7-max",
  "runMode": "DESIGN_ONLY",
  "approval": "NO"
}
```

Observed result:

```json
{
  "created": false,
  "valid": true,
  "executionEnabled": false,
  "executionStarted": false,
  "requiresApproval": true,
  "approvalAccepted": false,
  "requestId": null,
  "requestArtifactPath": null,
  "packetId": "FP-MCP-007",
  "modelId": "qwen-3.7-max",
  "runMode": "DESIGN_ONLY",
  "baseCommit": "87c4a44",
  "boundaryVersion": "FP-MCP-007",
  "statusSource": "ForgePilot request-artifact policy",
  "reasons": [
    "APPROVAL_REQUIRED"
  ]
}
```

### Unknown Packet

Input:

```json
{
  "packetId": "FP-MCP-999",
  "modelId": "qwen-3.7-max",
  "runMode": "DESIGN_ONLY",
  "approval": "CREATE_REQUEST_ARTIFACT"
}
```

Observed result:

```json
{
  "created": false,
  "valid": false,
  "executionEnabled": false,
  "executionStarted": false,
  "requiresApproval": true,
  "approvalAccepted": true,
  "requestId": null,
  "requestArtifactPath": null,
  "packetId": "FP-MCP-999",
  "modelId": "qwen-3.7-max",
  "runMode": "DESIGN_ONLY",
  "baseCommit": "87c4a44",
  "boundaryVersion": "FP-MCP-007",
  "statusSource": "ForgePilot request-artifact policy",
  "reasons": [
    "UNKNOWN_PACKET"
  ]
}
```

### Disallowed Model

Input:

```json
{
  "packetId": "FP-MCP-007",
  "modelId": "glm-5",
  "runMode": "DESIGN_ONLY",
  "approval": "CREATE_REQUEST_ARTIFACT"
}
```

Observed result:

```json
{
  "created": false,
  "valid": false,
  "executionEnabled": false,
  "executionStarted": false,
  "requiresApproval": true,
  "approvalAccepted": true,
  "requestId": null,
  "requestArtifactPath": null,
  "packetId": "FP-MCP-007",
  "modelId": "glm-5",
  "runMode": "DESIGN_ONLY",
  "baseCommit": "87c4a44",
  "boundaryVersion": "FP-MCP-007",
  "statusSource": "ForgePilot request-artifact policy",
  "reasons": [
    "DISALLOWED_MODEL"
  ]
}
```

### Disallowed Run Mode

Input:

```json
{
  "packetId": "FP-MCP-007",
  "modelId": "qwen-3.7-max",
  "runMode": "EXECUTE_PACKET",
  "approval": "CREATE_REQUEST_ARTIFACT"
}
```

Observed result:

```json
{
  "created": false,
  "valid": false,
  "executionEnabled": false,
  "executionStarted": false,
  "requiresApproval": true,
  "approvalAccepted": true,
  "requestId": null,
  "requestArtifactPath": null,
  "packetId": "FP-MCP-007",
  "modelId": "qwen-3.7-max",
  "runMode": "EXECUTE_PACKET",
  "baseCommit": "87c4a44",
  "boundaryVersion": "FP-MCP-007",
  "statusSource": "ForgePilot request-artifact policy",
  "reasons": [
    "DISALLOWED_RUN_MODE"
  ]
}
```

### Approved Valid Request

Input:

```json
{
  "packetId": "FP-MCP-007",
  "modelId": "qwen-3.7-max",
  "runMode": "DESIGN_ONLY",
  "approval": "CREATE_REQUEST_ARTIFACT"
}
```

Observed result:

```json
{
  "created": true,
  "valid": true,
  "executionEnabled": false,
  "executionStarted": false,
  "requiresApproval": true,
  "approvalAccepted": true,
  "requestId": "REQ-20260619T084312145Z-a9960bd6",
  "requestArtifactPath": "runs/FP-MCP-007/opencode-requests/REQ-20260619T084312145Z-a9960bd6.json",
  "packetId": "FP-MCP-007",
  "modelId": "qwen-3.7-max",
  "runMode": "DESIGN_ONLY",
  "baseCommit": "87c4a44",
  "boundaryVersion": "FP-MCP-007",
  "statusSource": "ForgePilot request-artifact policy",
  "reasons": []
}
```

## Created Request Artifact

Created artifact:

```text
runs/FP-MCP-007/opencode-requests/REQ-20260619T084312145Z-a9960bd6.json
```

The artifact was read successfully through `forgepilot_read_file`.

Observed artifact fields:

```text
schemaVersion: FP-MCP-007
createdBy: chatgpt-mcp
packetId: FP-MCP-007
modelId: qwen-3.7-max
runMode: DESIGN_ONLY
approvalScope: request-artifact-only
executionEnabled: false
executionStarted: false
boundaryVersion: FP-MCP-007
validationBoundary: FP-MCP-006
status: REQUEST_RECORDED
```

## Dirty Tree Guardrail

After the request artifact was created, repeated approved create calls failed with:

```text
DIRTY_WORKING_TREE
```

This confirms the tool refuses to create additional request artifacts while the ForgePilot repository has uncommitted output.

## Scope Confirmation

FP-MCP-007 did not add:

* OpenCode execution
* OpenCode CLI invocation
* OpenCode API invocation
* shell execution
* arbitrary prompt execution
* source file writes
* Git mutation
* SQLite mutation
* secret exposure
* environment variable exposure

## Result

FP-MCP-007 satisfies its request-artifact-only scope.

Status:

```text
ACCEPTED_FOR_VERIFICATION
```

