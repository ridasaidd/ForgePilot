# FP-MCP-146 Implementation Design

## Packet: FP-MCP-146 — MCP Bridge Surface for Runner Commit Binding and Starts

### Overview

This document describes the implementation changes to `src/server.ts` in the `forgepilot-chatgpt-mcp` workspace to expose FP-MCP-145 runner commit-binding fields and support guarded OpenCode runs through the MCP bridge.

### Context

FP-MCP-145 completed the runner-side distinction between `controlRepoCommit` and `targetWorkspaceCommit`. This packet completes the bridge-facing surface so GPT can use the OpenCode harness through MCP while preserving the runner's safety boundaries.

The runner targets `POST http://127.0.0.1:8791/runner/start-run` using the configured runner token.

---

## Change 1: Add `targetWorkspaceId` to `startRemoteRunnerRequest`

### Location: `src/server.ts` ~line 7989

Add a `targetWorkspaceId` parameter to the function signature. The function should:

1. Accept `targetWorkspaceId: string | undefined` as a new parameter
2. Validate that the workspace id is known/valid (fail-closed for unknown workspace ids)
3. Pass `targetWorkspaceId` to the runner in the start request body
4. Pass `boundaryVersion` to the runner (currently already computed)

### Code changes:

**Function signature** (line 7989-7994):
```typescript
// BEFORE:
async function startRemoteRunnerRequest(
  packetId: string,
  requestId: string,
  approvalId: string | undefined,
  approval: string
): Promise<Record<string, unknown>> {

// AFTER:
async function startRemoteRunnerRequest(
  packetId: string,
  requestId: string,
  approvalId: string | undefined,
  approval: string,
  targetWorkspaceId?: string
): Promise<Record<string, unknown>> {
```

**Validation function** (new helper):
```typescript
const ALLOWED_WORKSPACE_IDS = ["forgepilot-chatgpt-mcp"] as const;

function isValidTargetWorkspaceId(workspaceId: string | undefined): boolean {
  if (workspaceId === undefined || workspaceId.trim().length === 0) {
    return true; // optional — default workspace used
  }
  return ALLOWED_WORKSPACE_IDS.includes(
    workspaceId as typeof ALLOWED_WORKSPACE_IDS[number]
  );
}
```

**Add rejection for unknown workspace** (before the start request, ~line 8433):
```typescript
// Before the gate that checks approvalAccepted && runnerConfigured && ...
// Add:
if (targetWorkspaceId !== undefined && !isValidTargetWorkspaceId(targetWorkspaceId)) {
  return baseStartRemoteRunnerResult({
    packetId,
    requestId,
    approvalAccepted,
    runnerConfigured,
    requestArtifactPath,
    requestArtifactSha256,
    baseCommit,
    artifactDir,
    checkedAt,
    localValidationPassed,
    remoteValidationPassed: false,
    disableSwitchStatusEvaluated,
    disableSwitchActive,
    effectiveDisableReason,
    effectiveDisableScope,
    ...preStartEvidenceResultFields,
    ...stateSnapshotResultFields,
    ...humanApprovalEvidenceResultFields,
    boundaryVersion: "FP-MCP-146",
    statusSource: "ForgePilot MCP bridge workspace routing policy",
    reasons: ["UNKNOWN_WORKSPACE_ID", ...reasons]
  });
}
```

**Update the start request body** (~line 8549-8558):
```typescript
// BEFORE:
const startRequest = {
  packetId,
  requestId,
  requestArtifactPath,
  requestArtifactSha256,
  baseCommit,
  approval: START_REMOTE_RUNNER_REQUEST_APPROVAL,
  approvalId: normalizedApprovalId,
  boundaryVersion: "FP-MCP-074"
};

// AFTER:
const startRequest = {
  packetId,
  requestId,
  requestArtifactPath,
  requestArtifactSha256,
  baseCommit,
  targetWorkspaceId: targetWorkspaceId ?? "forgepilot-chatgpt-mcp",
  boundaryVersion: "FP-MCP-146"
};
```

---

## Change 2: Parse and Return Runner Response Fields

### Location: `src/server.ts` ~line 8628-8769

After receiving the runner response, extract the new FP-MCP-145 fields:

```typescript
// New fields to extract from runnerResponse (~line 8641):
const controlRepoCommit =
  runnerResponse !== null ? getStringField(runnerResponse, "controlRepoCommit") : null;
const targetWorkspaceIdFromRunner =
  runnerResponse !== null ? getStringField(runnerResponse, "targetWorkspaceId") : null;
const targetWorkspaceCommit =
  runnerResponse !== null ? getStringField(runnerResponse, "targetWorkspaceCommit") : null;
const opencodeWorkingDirectory =
  runnerResponse !== null ? getStringField(runnerResponse, "opencodeWorkingDirectory") : null;
const taskBundleCreated =
  runnerResponse !== null ? getBooleanField(runnerResponse, "taskBundleCreated") : null;
const taskBundlePath =
  runnerResponse !== null ? getStringField(runnerResponse, "taskBundlePath") : null;
const taskBundleRelativePath =
  runnerResponse !== null ? getStringField(runnerResponse, "taskBundleRelativePath") : null;
const preStartEvidencePath =
  runnerResponse !== null ? getStringField(runnerResponse, "preStartEvidencePath") : null;
const postStartEvidencePath =
  runnerResponse !== null ? getStringField(runnerResponse, "postStartEvidencePath") : null;
const requestArtifactMutated =
  runnerResponse !== null ? getBooleanField(runnerResponse, "requestArtifactMutated") : null;
```

**Update the success return object** (~line 8736-8769) to include the new fields:
```typescript
return {
  started,
  accepted,
  approvalAccepted,
  runnerConfigured,
  runnerContacted: true,
  startEndpointContacted: true,
  executionStarted,
  opencodeStarted: executionStarted,
  executionAllowedNow: false,
  packetId,
  requestId,
  requestArtifactPath,
  requestArtifactSha256,
  baseCommit,
  runnerRunId,
  artifactDir: responseArtifactDir ?? artifactDir,
  runnerProtocolVersion,
  // === NEW FIELDS ===
  controlRepoCommit,
  targetWorkspaceId: targetWorkspaceIdFromRunner ?? targetWorkspaceId ?? "forgepilot-chatgpt-mcp",
  targetWorkspaceCommit,
  opencodeWorkingDirectory,
  taskBundleCreated: taskBundleCreated ?? false,
  taskBundlePath,
  taskBundleRelativePath,
  preStartEvidencePath,
  postStartEvidencePath,
  requestArtifactMutated: requestArtifactMutated ?? false,
  // === END NEW FIELDS ===
  boundaryVersion: "FP-MCP-146",
  statusSource: "remote runner start-run endpoint with workspace routing and commit binding",
  checkedAt,
  localValidationPassed,
  remoteValidationPassed,
  preStartStateRecorded,
  postStartStateRecorded,
  disableSwitchStatusEvaluated,
  disableSwitchActive,
  effectiveDisableReason,
  effectiveDisableScope,
  ...preStartEvidenceResultFields,
  ...stateSnapshotResultFields,
  ...humanApprovalEvidenceResultFields,
  reasons: uniqueReasons
};
```

---

## Change 3: Update `baseStartRemoteRunnerResult`

### Location: `src/server.ts` ~line 5747

Add the new fields to the base result with null/empty defaults to maintain consistency across all return paths:

```typescript
function baseStartRemoteRunnerResult(params: {
  // ... existing params ...
  controlRepoCommit?: string | null;
  targetWorkspaceId?: string | null;
  targetWorkspaceCommit?: string | null;
  opencodeWorkingDirectory?: string | null;
  taskBundleCreated?: boolean;
  taskBundlePath?: string | null;
  taskBundleRelativePath?: string | null;
  preStartEvidencePath?: string | null;
  postStartEvidencePath?: string | null;
  requestArtifactMutated?: boolean;
  // ...
}): Record<string, unknown> {
  return {
    // ... existing fields ...
    controlRepoCommit: params.controlRepoCommit ?? null,
    targetWorkspaceId: params.targetWorkspaceId ?? null,
    targetWorkspaceCommit: params.targetWorkspaceCommit ?? null,
    opencodeWorkingDirectory: params.opencodeWorkingDirectory ?? null,
    taskBundleCreated: params.taskBundleCreated ?? false,
    taskBundlePath: params.taskBundlePath ?? null,
    taskBundleRelativePath: params.taskBundleRelativePath ?? null,
    preStartEvidencePath: params.preStartEvidencePath ?? null,
    postStartEvidencePath: params.postStartEvidencePath ?? null,
    requestArtifactMutated: params.requestArtifactMutated ?? false,
    // ...
  };
}
```

---

## Change 4: Update Tool Registration

### Location: `src/server.ts` ~line 9997

Update the `forgepilot_start_remote_runner_request` tool registration:

**Input schema** — add `targetWorkspaceId`:
```typescript
inputSchema: {
  packetId: z.string().describe("Known ForgePilot packet id, for example FP-MCP-007."),
  requestId: z.string().describe("Request artifact id, for example REQ-20260619T084312145Z-a9960bd6."),
  approvalId: z.string().optional().describe("Human approval evidence artifact id."),
  approval: z.string().describe("Must exactly equal START_REMOTE_RUNNER_REQUEST."),
  targetWorkspaceId: z.string().optional().describe("Target workspace id for runner routing, for example forgepilot-chatgpt-mcp.")
},
```

**Tool handler** — pass `targetWorkspaceId` through:
```typescript
async ({ packetId, requestId, approvalId, approval, targetWorkspaceId }) =>
  runLoggedTool("forgepilot_start_remote_runner_request", async () => {
    const result = await startRemoteRunnerRequest(
      packetId,
      requestId,
      approvalId,
      approval,
      targetWorkspaceId
    );
    return structuredJsonResult(result);
  })
```

**Output schema** — update `ForgePilotStartRemoteRunnerRequestOutputSchema` (~line 387):
Add the new fields after the existing runner response fields:
```typescript
const ForgePilotStartRemoteRunnerRequestOutputSchema = {
  // ... existing fields ...
  controlRepoCommit: NullableStringSchema,
  targetWorkspaceId: z.string(),
  targetWorkspaceCommit: NullableStringSchema,
  opencodeWorkingDirectory: NullableStringSchema,
  taskBundleCreated: z.boolean(),
  taskBundlePath: NullableStringSchema,
  taskBundleRelativePath: NullableStringSchema,
  preStartEvidencePath: NullableStringSchema,
  postStartEvidencePath: NullableStringSchema,
  requestArtifactMutated: z.boolean(),
  // ...
};
```

---

## Change 5: Add Runner Capability Fields to Remote Runner Status

### Location: `src/server.ts` ~line 1249, `getRemoteRunnerStatus` function

Add parsing of new capability fields from the runner's capabilities response:

```typescript
// New capability fields to extract (~line 1348, inside the if (runnerReachable) block):
let supportedWorkspaces: string[] = [];
let defaultWorkspace: string | null = null;
let workspaceRoutingEnabled = false;
let commitBindingEnabled = false;
let taskBundleStagingEnabled = false;

// Inside the capabilityRecord extraction:
supportedWorkspaces = getStringArrayField(capabilityRecord, "supportedWorkspaces");
defaultWorkspace = getStringField(capabilityRecord, "defaultWorkspace");
workspaceRoutingEnabled = capabilityRecord.workspaceRoutingEnabled === true;
commitBindingEnabled = capabilityRecord.commitBindingEnabled === true;
taskBundleStagingEnabled = capabilityRecord.taskBundleStagingEnabled === true;
```

**Add to the return object** (~line 1360):
```typescript
return {
  // ... existing fields ...
  supportedWorkspaces,
  defaultWorkspace,
  workspaceRoutingEnabled,
  commitBindingEnabled,
  taskBundleStagingEnabled,
  // ...
};
```

**Update the associated schema** `ForgePilotRemoteRunnerStatusOutputSchema` (~line 220):
```typescript
const ForgePilotRemoteRunnerStatusOutputSchema = {
  // ... existing fields ...
  supportedWorkspaces: StringArraySchema,
  defaultWorkspace: NullableStringSchema,
  workspaceRoutingEnabled: z.boolean(),
  commitBindingEnabled: z.boolean(),
  taskBundleStagingEnabled: z.boolean(),
  // ...
};
```

---

## Change 6: Add `targetWorkspaceCommit` Validation to `validateRemoteRunnerEndpointRequest`

### Location: `src/server.ts` ~line 1977

When the runner returns validation results, also check `targetWorkspaceCommit` consistency. This ensures the runner's workspace commit matches what the bridge expects.

---

## Summary of File Changes

| File | Section | Change |
|------|---------|--------|
| `src/server.ts` | `ForgePilotStartRemoteRunnerRequestOutputSchema` | Add 10 new output fields |
| `src/server.ts` | `ForgePilotRemoteRunnerStatusOutputSchema` | Add 5 new capability fields |
| `src/server.ts` | `getRemoteRunnerStatus()` | Parse new capability fields |
| `src/server.ts` | `baseStartRemoteRunnerResult()` | Add new params and fields |
| `src/server.ts` | `startRemoteRunnerRequest()` | Accept `targetWorkspaceId`, validate, forward to runner, parse response |
| `src/server.ts` | `forgepilot_start_remote_runner_request` tool | Add `targetWorkspaceId` input, pass to function |

---

## Constraints Preserved

1. **No direct OpenCode execution** — bridge calls runner only, never executes shell commands
2. **No arbitrary workspace paths** — `targetWorkspaceId` validated against `ALLOWED_WORKSPACE_IDS`
3. **Runner remains only execution boundary** — all start logic delegated to runner via `POST /runner/start-run`
4. **Explicit approval required** — `approval` must equal `START_REMOTE_RUNNER_REQUEST`
5. **DESIGN_ONLY preserved** — `ALLOWED_OPENCODE_RUN_MODES` unchanged
6. **Fail-closed for unknown workspaces** — `UNKNOWN_WORKSPACE_ID` rejection reason
7. **No request artifact mutation** — bridge reads artifacts, never writes them
8. **No secret exposure** — no new env var access
9. **`controlRepoCommit` not treated as target commit** — distinct fields in response
10. **Evidence not moved** — runner evidence path reporting only

---

## Verification Checklist

1. `pnpm build` (tsc) passes with no type errors
2. `forgepilot_get_remote_runner_status` still works and returns new fields
3. `forgepilot_start_remote_runner_request` accepts `targetWorkspaceId`
4. Bridge forwards `targetWorkspaceId` to runner in request body
5. Response includes `controlRepoCommit`
6. Response includes `targetWorkspaceCommit`
7. Response includes `opencodeWorkingDirectory`
8. Response includes task bundle fields (`taskBundleCreated`, etc.)
9. Unknown workspace ids are rejected
10. Bridge does not start OpenCode directly (still calls runner only)
