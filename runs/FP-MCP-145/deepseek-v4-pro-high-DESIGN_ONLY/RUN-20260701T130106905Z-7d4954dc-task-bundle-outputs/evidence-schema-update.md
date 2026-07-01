# FP-MCP-145 — Evidence Schema Update

## Affected Artifacts

| Artifact Type | File Pattern | Schema Version | Change |
|---|---|---|---|
| `runner-pre-start-state` | `RUN-*-pre-start.json` | `FP-MCP-142` | +2 fields |
| `runner-post-start-state` | `RUN-*-post-start.json` | `FP-MCP-142` | +2 fields |
| Start response body | HTTP 200 response | N/A | +4 fields |
| Start response body (rejection) | HTTP 403 response | N/A | +3 fields |

## Pre-Start Evidence (`runner-pre-start-state`)

### Current Schema (before FP-MCP-145)

```json
{
  "schemaVersion": "FP-MCP-142",
  "artifactType": "runner-pre-start-state",
  "packetId": "<string>",
  "requestId": "<string>",
  "runnerRunId": "<string>",
  "executionEnabled": "<boolean>",
  "startEndpointContacted": "<boolean>",
  "executionStarted": "<boolean>",
  "opencodeStarted": "<boolean>",
  "targetWorkspaceId": "<string>",
  "opencodeWorkingDirectory": "<string>",
  "taskBundleCreated": "<boolean>",
  "taskBundlePath": "<string>",
  "taskBundleRelativePath": "<string>",
  "taskBundleFiles": ["<string>"],
  "recordedAt": "<ISO 8601>"
}
```

### New Fields

| Field | Type | Description |
|---|---|---|
| `controlRepoCommit` | `string` | The ForgePilot control repository commit hash (short, e.g. `20a2396`) |
| `targetWorkspaceCommit` | `string` | The target workspace HEAD commit hash at time of runner start |

### Updated Schema

```json
{
  "schemaVersion": "FP-MCP-142",
  "artifactType": "runner-pre-start-state",
  "packetId": "<string>",
  "requestId": "<string>",
  "runnerRunId": "<string>",
  "executionEnabled": "<boolean>",
  "startEndpointContacted": "<boolean>",
  "executionStarted": "<boolean>",
  "opencodeStarted": "<boolean>",
  "targetWorkspaceId": "<string>",
  "opencodeWorkingDirectory": "<string>",
  "controlRepoCommit": "<string>",
  "targetWorkspaceCommit": "<string>",
  "taskBundleCreated": "<boolean>",
  "taskBundlePath": "<string>",
  "taskBundleRelativePath": "<string>",
  "taskBundleFiles": ["<string>"],
  "recordedAt": "<ISO 8601>"
}
```

### Example (same-repo)

```json
{
  "schemaVersion": "FP-MCP-142",
  "artifactType": "runner-pre-start-state",
  "packetId": "FP-MCP-145",
  "requestId": "REQ-20260701T125903957Z-3d529835",
  "runnerRunId": "RUN-20260701T130106905Z-7d4954dc",
  "executionEnabled": true,
  "startEndpointContacted": true,
  "executionStarted": false,
  "opencodeStarted": false,
  "targetWorkspaceId": "forgepilot",
  "opencodeWorkingDirectory": "/home/ridasaidd/forgepilot",
  "controlRepoCommit": "20a2396",
  "targetWorkspaceCommit": "20a2396",
  "taskBundleCreated": true,
  "taskBundlePath": "/home/ridasaidd/forgepilot/.forgepilot/tasks/RUN-20260701T130106905Z-7d4954dc",
  "taskBundleRelativePath": ".forgepilot/tasks/RUN-20260701T130106905Z-7d4954dc",
  "taskBundleFiles": [
    "packet.md",
    "request.json",
    "instructions.md",
    "context.json",
    "outputs/"
  ],
  "recordedAt": "2026-07-01T13:01:06.907Z"
}
```

---

## Post-Start Evidence (`runner-post-start-state`, success)

### Current Schema (before FP-MCP-145)

```json
{
  "schemaVersion": "FP-MCP-142",
  "artifactType": "runner-post-start-state",
  "packetId": "<string>",
  "requestId": "<string>",
  "runnerRunId": "<string>",
  "executionEnabled": "<boolean>",
  "startEndpointContacted": "<boolean>",
  "executionStarted": "<boolean>",
  "opencodeStarted": "<boolean>",
  "opencodePid": "<number | null>",
  "opencodeBin": "<string>",
  "opencodeModel": "<string | null>",
  "opencodeArgs": ["<string>"],
  "targetWorkspaceId": "<string>",
  "opencodeWorkingDirectory": "<string>",
  "taskBundleCreated": "<boolean>",
  "taskBundlePath": "<string>",
  "taskBundleRelativePath": "<string>",
  "stdoutPath": "<string>",
  "stderrPath": "<string>",
  "recordedAt": "<ISO 8601>"
}
```

### New Fields

Same two fields as pre-start: `controlRepoCommit`, `targetWorkspaceCommit`.

---

## Post-Start Evidence (`runner-post-start-state`, error path)

### Current Schema (before FP-MCP-145)

```json
{
  "schemaVersion": "FP-MCP-142",
  "artifactType": "runner-post-start-state",
  "packetId": "<string>",
  "requestId": "<string>",
  "runnerRunId": "<string>",
  "executionEnabled": "<boolean>",
  "startEndpointContacted": "<boolean>",
  "executionStarted": "<boolean>",
  "opencodeStarted": "<boolean>",
  "opencodeBin": "<string>",
  "opencodeModel": "<string | null>",
  "opencodeArgs": ["<string>"],
  "targetWorkspaceId": "<string>",
  "opencodeWorkingDirectory": "<string>",
  "taskBundleCreated": "<boolean>",
  "taskBundlePath": "<string>",
  "taskBundleRelativePath": "<string>",
  "errorCode": "<string>",
  "errorMessage": "<string>",
  "stdoutPath": "<string>",
  "stderrPath": "<string>",
  "recordedAt": "<ISO 8601>"
}
```

### New Fields

Same two fields: `controlRepoCommit`, `targetWorkspaceCommit`.

---

## Start Response (HTTP 200 success)

### Current Fields Relevant to Commit Identity

```
targetWorkspaceId    (already present — FP-MCP-143)
opencodeWorkingDirectory  (already present in evidence, not response)
```

### New Fields in Response

| Field | Type | Description |
|---|---|---|
| `targetWorkspaceId` | `string` | Workspace identifier (already present in start response) |
| `opencodeWorkingDirectory` | `string` | Resolved absolute path (moved from evidence-only to response) |
| `controlRepoCommit` | `string` | ForgePilot control repository commit |
| `targetWorkspaceCommit` | `string` | Target workspace HEAD commit |

---

## Start Response (HTTP 403 — TARGET_WORKSPACE_COMMIT_UNRESOLVABLE)

### New Rejection Reason

```
reasons: ["TARGET_WORKSPACE_COMMIT_UNRESOLVABLE"]
```

### Fields Included

```
targetWorkspaceId: requestedTargetWorkspaceId
opencodeWorkingDirectory: resolved path or null
controlRepoCommit: resolved from validation
targetWorkspaceCommit: null  (reason for rejection)
```

### Status Code

`403` — matching the existing `DISALLOWED_WORKSPACE` (403) and
`START_ENDPOINT_DISABLED` (403) conventions. This is not a validation failure
(which returns 200 with `valid: false`). It is a guarded execution block.

---

## Evidence Location Invariant

All evidence files remain under:

```
/home/ridasaidd/forgepilot/runs/<packetId>/<modelId>-<runMode>/
```

This path is always resolved relative to `repoRoot` (the ForgePilot control
repository). No evidence is written to the target workspace. This invariant
is unchanged from FP-MCP-142 / FP-MCP-143 / FP-MCP-144.

---

## Backward Compatibility

- Schema version `FP-MCP-142` is preserved (no breaking change to evidence structure).
- Existing consumers that read pre-start/post-start evidence by field name will
  simply see new fields they can ignore.
- The `taskBundleFiles` array gains one entry (`"context.json"`) — consumers
  iterating over it will naturally handle this.
- No existing fields are removed, renamed, or retyped.
