# FP-MCP-143 — Target Workspace Routing Design

## Summary

Add a `targetWorkspaceId` field to the `/runner/start-run` request body, resolved
through a hardcoded allowlist to a filesystem path. The OpenCode process is launched
with `--dir <resolved path>` while all evidence artifacts continue to be written
under the ForgePilot repository root.

---

## 1. New Constant: Workspace Allowlist

Add after line 21 (`ALLOWED_RUN_MODES`):

```javascript
const WORKSPACE_ALLOWLIST = Object.freeze({
  forgepilot: "/home/ridasaidd/forgepilot",
  "forgepilot-chatgpt-mcp": "/home/ridasaidd/forgepilot-chatgpt-mcp"
});
```

---

## 2. New Function: Resolve Workspace

Add after `getOpenCodeModelForModelId` (after line 51):

```javascript
function resolveTargetWorkspace(targetWorkspaceId) {
  if (typeof targetWorkspaceId !== "string") {
    return null;
  }

  const trimmed = targetWorkspaceId.trim();

  if (trimmed.length === 0) {
    return null;
  }

  const resolved = WORKSPACE_ALLOWLIST[trimmed];

  if (resolved === undefined) {
    return null;
  }

  return resolved;
}
```

---

## 3. Modify `hasForbiddenExecutionFields`

Do NOT add `targetWorkspaceId` to the forbidden list. The packet explicitly permits
this field in the start request body. The existing forbidden list at line 381
remains unchanged:

```javascript
const forbidden = [
  "prompt",
  "command",
  "shell",
  "modelOverride",
  "runModeOverride",
  "artifactDirOverride",
  "env",
  "secrets",
  "providerCredentials"
];
```

---

## 4. Modify `handleStartRun` — Workspace Resolution and Validation

In `handleStartRun`, after the `executionEnabled` check (line 867) and before the
`validateRequestArtifact` call (line 869), insert workspace resolution:

```javascript
const targetWorkspaceId = getStringField(body, "targetWorkspaceId");
const targetWorkspace = resolveTargetWorkspace(
  targetWorkspaceId !== null ? targetWorkspaceId : "forgepilot"
);

if (targetWorkspace === null) {
  logOperationEnd(operation, startedAt, false, "DISALLOWED_WORKSPACE");

  jsonResponse(res, 403, {
    valid: false,
    accepted: false,
    executionEnabled: true,
    executionStarted: false,
    opencodeStarted: false,
    runnerRunId: null,
    startEndpointContacted: true,
    startEndpointState: "CALLABLE_GUARDED",
    startCapabilityCallable: true,
    executionAllowedNow: false,
    approvalConsumed: false,
    approvalConsumptionPath: null,
    preStartEvidenceCreated: false,
    postStartEvidenceCreated: false,
    requestArtifactMutated: false,
    targetWorkspaceId: targetWorkspaceId ?? "forgepilot",
    opencodeWorkingDirectory: null,
    runnerProtocolVersion: RUNNER_PROTOCOL_VERSION,
    boundaryVersion: BOUNDARY_VERSION,
    statusSource: "private dev runner guarded workspace resolution policy",
    checkedAt: nowIso(),
    reasons: [
      "DISALLOWED_WORKSPACE",
      "START_ENDPOINT_DISABLED",
      "START_NOT_CALLABLE",
      "EXECUTION_NOT_ALLOWED"
    ]
  });
  return;
}
```

---

## 5. Modify OpenCode Launch Command

Replace line 959 (`repoRoot`) with `targetWorkspace`:

```javascript
const opencodeArgs = [
  "run",
  "--dir",
  targetWorkspace,
  "--title",
  `ForgePilot ${validation.packetId} ${runnerRunId}`
];
```

---

## 6. Modify Post-Start Evidence

In the post-start state JSON (lines 1016-1039), add two new fields:

```javascript
targetWorkspaceId: targetWorkspaceId ?? "forgepilot",
opencodeWorkingDirectory: targetWorkspace,
```

These fields must appear in both the normal post-start state and the error-handler
post-start state (lines 983-1006).

---

## 7. Modify Post-Start Response

In the successful start response (lines 1043-1069), add two new fields:

```javascript
targetWorkspaceId: targetWorkspaceId ?? "forgepilot",
opencodeWorkingDirectory: targetWorkspace,
```

---

## 8. Modify the Pre-Start Evidence

Optionally, add `targetWorkspaceId` and `opencodeWorkingDirectory` to the pre-start
state (line 935) for consistent recording, but the packet only requires it in
post-start evidence.

---

## 9. Modify `capabilitiesResult`

Add workspace information to the capabilities response to advertise the feature:

```javascript
supportedWorkspaces: Object.keys(WORKSPACE_ALLOWLIST),
defaultWorkspace: "forgepilot",
workspaceRoutingEnabled: true,
```

---

## Safety Analysis

| Constraint | How enforced |
|---|---|
| No arbitrary paths accepted | Path only resolved via allowlist lookup, not from request body |
| No path traversal | Resolved path is a string literal from the allowlist constant |
| No unlisted workspace IDs | `resolveTargetWorkspace` returns `null` for unknown keys |
| Evidence stays in ForgePilot | All artifact paths use `repoRoot`, not `targetWorkspace` |
| Existing validation preserved | Workspace check is additive, between execution gate and request validation |
| No PATCH/APPLY modes | `ALLOWED_RUN_MODES` unchanged, remains `["DESIGN_ONLY"]` |
| Model allowlist preserved | `ALLOWED_MODELS` unchanged |
| Pre/post-start evidence preserved | Both evidence files still written via existing code paths |
| `targetWorkspaceId` recorded in evidence | Added to post-start state JSON |

---

## File Change Summary

File: `runner/server.mjs`

| Location | Change |
|---|---|
| After line 21 | Add `WORKSPACE_ALLOWLIST` constant |
| After line 51 | Add `resolveTargetWorkspace` function |
| Lines 835-867 area | Insert workspace resolution + rejection before validation |
| Line 959 | Change `repoRoot` to `targetWorkspace` in `--dir` arg |
| Lines 935-950 | Add workspace fields to pre-start state (optional) |
| Lines 985-1006 | Add workspace fields to error post-start state |
| Lines 1019-1039 | Add workspace fields to post-start state |
| Lines 1043-1069 | Add workspace fields to start response |
| `capabilitiesResult` | Add `supportedWorkspaces`, `defaultWorkspace`, `workspaceRoutingEnabled` |
