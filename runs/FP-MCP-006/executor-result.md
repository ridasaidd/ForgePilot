# FP-MCP-006 Executor Result

## Packet

FP-MCP-006 — OpenCode Run Request Validation Tool

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
5fed31f
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
961f90c
```

## Implementation Summary

FP-MCP-006 added a read-only ForgePilot MCP validation tool:

```text
forgepilot_validate_opencode_run_request
```

The tool validates whether a proposed ForgePilot-scoped OpenCode run request is acceptable under the FP-MCP-005 boundary.

The tool accepts only structured fields:

```text
packetId
modelId
runMode
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

* packet id format
* packet existence under `packets/`
* model allowlist membership
* run mode allowlist membership
* ForgePilot working tree cleanliness

The tool returns:

* `valid`
* `executionEnabled`
* `requiresApproval`
* `packetExists`
* `modelAllowed`
* `runModeAllowed`
* `workingTreeClean`
* `baseCommit`
* `wouldUseArtifactDir`
* `boundaryVersion`
* `statusSource`
* `reasons`

## Allowed Models

Initial allowed model identifiers:

```text
deepseek-v4-pro-high
qwen-3.7-max
```

## Allowed Run Modes

Initial allowed run mode:

```text
DESIGN_ONLY
```

## Execution Boundary

The tool always reports:

```json
{
  "executionEnabled": false,
  "requiresApproval": true
}
```

A valid response means the request is structurally valid under the current boundary.

It does not mean OpenCode may run.

## Artifact Boundary

The tool derives an artifact directory label:

```text
runs/<packetId>/<modelId>-<runMode>/
```

The tool does not create that directory.

The artifact directory is derived only from validated structured inputs.

## Logging Boundary

The tool is covered by sanitized MCP invocation logging.

Allowed log contents:

* tool name
* invocation start
* PASS or FAIL
* sanitized error code
* duration in milliseconds

Forbidden log contents:

* tool arguments
* packet contents
* prompts
* conversations
* file contents
* tool result contents
* secrets
* environment variables
* raw OpenCode configuration
* shell output

## Build and Test Result

Bridge verification:

```text
pnpm build: PASS
pnpm test: PASS
```

Service restart:

```text
forgepilot-chatgpt-mcp-oauth.service: active (running)
```

## ChatGPT MCP Connector Verification

The new tool became visible after the Actions refresh and runtime propagation delay.

The full resource listing initially still exposed five callable tools, but a narrower OpenCode query exposed the new tool.

Validated tool:

```text
forgepilot_validate_opencode_run_request
```

### Valid Request

Input:

```json
{
  "packetId": "FP-MCP-006",
  "modelId": "qwen-3.7-max",
  "runMode": "DESIGN_ONLY"
}
```

Observed result:

```json
{
  "valid": true,
  "executionEnabled": false,
  "requiresApproval": true,
  "packetExists": true,
  "modelAllowed": true,
  "runModeAllowed": true,
  "workingTreeClean": true,
  "baseCommit": "5fed31f",
  "wouldUseArtifactDir": "runs/FP-MCP-006/qwen-3.7-max-DESIGN_ONLY/",
  "boundaryVersion": "FP-MCP-006",
  "statusSource": "ForgePilot validation-only policy",
  "reasons": []
}
```

### Unknown Packet

Input:

```json
{
  "packetId": "FP-MCP-999",
  "modelId": "qwen-3.7-max",
  "runMode": "DESIGN_ONLY"
}
```

Observed result:

```json
{
  "valid": false,
  "executionEnabled": false,
  "requiresApproval": true,
  "packetExists": false,
  "modelAllowed": true,
  "runModeAllowed": true,
  "workingTreeClean": true,
  "baseCommit": "5fed31f",
  "wouldUseArtifactDir": null,
  "boundaryVersion": "FP-MCP-006",
  "statusSource": "ForgePilot validation-only policy",
  "reasons": [
    "UNKNOWN_PACKET"
  ]
}
```

### Disallowed Model

Input:

```json
{
  "packetId": "FP-MCP-006",
  "modelId": "glm-5",
  "runMode": "DESIGN_ONLY"
}
```

Observed result:

```json
{
  "valid": false,
  "executionEnabled": false,
  "requiresApproval": true,
  "packetExists": true,
  "modelAllowed": false,
  "runModeAllowed": true,
  "workingTreeClean": true,
  "baseCommit": "5fed31f",
  "wouldUseArtifactDir": null,
  "boundaryVersion": "FP-MCP-006",
  "statusSource": "ForgePilot validation-only policy",
  "reasons": [
    "DISALLOWED_MODEL"
  ]
}
```

### Disallowed Run Mode

Input:

```json
{
  "packetId": "FP-MCP-006",
  "modelId": "qwen-3.7-max",
  "runMode": "EXECUTE_PACKET"
}
```

Observed result:

```json
{
  "valid": false,
  "executionEnabled": false,
  "requiresApproval": true,
  "packetExists": true,
  "modelAllowed": true,
  "runModeAllowed": false,
  "workingTreeClean": true,
  "baseCommit": "5fed31f",
  "wouldUseArtifactDir": null,
  "boundaryVersion": "FP-MCP-006",
  "statusSource": "ForgePilot validation-only policy",
  "reasons": [
    "DISALLOWED_RUN_MODE"
  ]
}
```

## Scope Confirmation

FP-MCP-006 did not add:

* OpenCode execution
* OpenCode CLI invocation
* OpenCode API invocation
* shell execution
* arbitrary prompt execution
* artifact creation
* file writes
* Git mutation
* SQLite mutation
* secret exposure
* environment variable exposure

## Result

FP-MCP-006 satisfies its validation-only scope.

Status:

```text
ACCEPTED_FOR_VERIFICATION
```

