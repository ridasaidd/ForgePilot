# FP-MCP-117 Request Artifact Evidence

Result: PASSED

Created and committed a real non-executing OpenCode request artifact for FP-MCP-117.

## Packet

- FP-MCP-117 — Guarded Preflight Report With Real Request Artifact

## Request Artifact Creation

Tool:

- `forgepilot_create_opencode_run_request`

Input:

```json
{
  "packetId": "FP-MCP-117",
  "modelId": "deepseek-v4-pro-high",
  "runMode": "DESIGN_ONLY",
  "approval": "CREATE_REQUEST_ARTIFACT"
}
```

Observed:

```json
{
  "created": true,
  "valid": true,
  "executionEnabled": false,
  "executionStarted": false,
  "requiresApproval": true,
  "approvalAccepted": true,
  "requestId": "REQ-20260630T160920008Z-195b9969",
  "requestArtifactPath": "runs/FP-MCP-117/opencode-requests/REQ-20260630T160920008Z-195b9969.json",
  "packetId": "FP-MCP-117",
  "modelId": "deepseek-v4-pro-high",
  "runMode": "DESIGN_ONLY",
  "baseCommit": "034cfdb",
  "boundaryVersion": "FP-MCP-081",
  "implementationBoundaryVersion": "FP-MCP-083",
  "statusSource": "ForgePilot request-artifact policy",
  "reasons": []
}
```

## Artifact Commit

The created request artifact was committed.

Commit:

- `8d20e85 Record FP-MCP-117 request artifact`

Artifact path:

- `runs/FP-MCP-117/opencode-requests/REQ-20260630T160920008Z-195b9969.json`

## Request Artifact Validation

Tool:

- `forgepilot_validate_remote_runner_request`

Input:

```json
{
  "packetId": "FP-MCP-117",
  "requestId": "REQ-20260630T160920008Z-195b9969"
}
```

Observed after committing request artifact:

```json
{
  "eligible": true,
  "executionEnabled": false,
  "executionStarted": false,
  "runnerContacted": false,
  "packetId": "FP-MCP-117",
  "requestId": "REQ-20260630T160920008Z-195b9969",
  "requestArtifactPath": "runs/FP-MCP-117/opencode-requests/REQ-20260630T160920008Z-195b9969.json",
  "packetExists": true,
  "requestExists": true,
  "requestArtifactValid": true,
  "modelAllowed": true,
  "runModeAllowed": true,
  "workingTreeClean": true,
  "baseCommitMatches": true,
  "creationCommitExists": true,
  "artifactCommitExists": true,
  "creationCommitAncestorOfArtifactCommit": true,
  "artifactCommitReachableFromHead": true,
  "safeArtifactDir": true,
  "artifactDir": "runs/FP-MCP-117/deepseek-v4-pro-high-DESIGN_ONLY/",
  "currentCommit": "8d20e85",
  "requestBaseCommit": "034cfdb",
  "creationCommit": "034cfdb",
  "artifactCommit": "8d20e85",
  "modelId": "deepseek-v4-pro-high",
  "runMode": "DESIGN_ONLY",
  "boundaryVersion": "FP-MCP-015",
  "statusSource": "ForgePilot remote-runner validation-only policy",
  "reasons": []
}
```

## Validation Result

Passed:

- `eligible: true`
- `requestExists: true`
- `requestArtifactValid: true`
- `modelAllowed: true`
- `runModeAllowed: true`
- `workingTreeClean: true`
- `baseCommitMatches: true`
- `creationCommitExists: true`
- `artifactCommitExists: true`
- `creationCommitAncestorOfArtifactCommit: true`
- `artifactCommitReachableFromHead: true`
- `safeArtifactDir: true`
- `runnerContacted: false`
- `executionStarted: false`
- `reasons: []`

## Safety Result

No execution occurred.

OpenCode was not started.

The runner start endpoint was not contacted.

No runner run id was created.

No approval was consumed.

The only artifact creation was the intended non-executing request artifact.
