# FP-MCP-145 Implementation Plan

## Summary

Add explicit target workspace commit binding to the MCP v1 runner start path
(`runner/server.mjs`), so that cross-repository OpenCode runs receive both the
ForgePilot control repository commit and the target workspace commit, and the
worker is instructed not to confuse them.

## Single File Change

**File:** `runner/server.mjs`

No other files are affected. The runner is a self-contained single-file
Node.js ESM HTTP server with no external dependencies.

---

## Change 1 — New Function: `getTargetWorkspaceCommit`

**Location:** After `resolveTargetWorkspace` (line 76), before `stageTaskBundle` (line 78).

**Purpose:** Run `git rev-parse --short HEAD` inside the resolved target workspace
directory, returning the short commit hash or `null` on failure.

```javascript
async function getTargetWorkspaceCommit(opencodeWorkingDirectory) {
  if (typeof opencodeWorkingDirectory !== "string" || opencodeWorkingDirectory.length === 0) {
    return null;
  }

  try {
    const { stdout } = await execFileAsync("git", ["rev-parse", "--short", "HEAD"], {
      cwd: opencodeWorkingDirectory,
      timeout: 5_000,
      maxBuffer: 1024 * 1024
    });

    return stdout.trim();
  } catch {
    return null;
  }
}
```

**Key properties:**
- Operates with `cwd: opencodeWorkingDirectory` — NOT the control repo.
- Short commit hash (e.g., `abc1234`), matching the format of other commits.
- Returns `null` cleanly on failure (no throw) — caller handles fail-closed.
- 5-second timeout, 1 MiB buffer — matches existing `gitObservation` conventions.

**Comparison to existing `gitObservation` helper:** `gitObservation` hardcodes
`cwd: repoRoot` (the control repository). This new function is the **first** git
helper that targets a different working directory, so it requires its own
implementation rather than parameterizing the existing helper. Keeping the
existing `gitObservation` unchanged preserves backward compatibility with all
existing validation code paths.

---

## Change 2 — Enhanced `stageTaskBundle` Signature and Behavior

**Location:** `stageTaskBundle` (lines 78–119).

**Change:** Accept two additional parameters and pass them through to both
`instructions.md` content and a new staged `context.json` file.

### Current Signature

```javascript
async function stageTaskBundle(opencodeWorkingDirectory, runnerRunId, packetId, requestArtifactPath)
```

### New Signature

```javascript
async function stageTaskBundle(
  opencodeWorkingDirectory,
  runnerRunId,
  packetId,
  requestArtifactPath,
  targetWorkspaceId,
  controlRepoCommit,
  targetWorkspaceCommit
)
```

### Updated `instructions.md` Template (lines 97–112)

Replace the static template with a version that includes the commit distinction:

```javascript
const instructions = [
  `ForgePilot staged task execution instructions.`,
  ``,
  `Packet: ${packetId}`,
  `Runner run ID: ${runnerRunId}`,
  ``,
  `Read packet.md to understand the task requirements.`,
  `Read request.json for the execution context details.`,
  `Produce all DESIGN_ONLY implementation/evidence artifacts in the outputs/ directory.`,
  ``,
  `The control repository is /home/ridasaidd/forgepilot.`,
  `The control repository commit is ${controlRepoCommit}.`,
  `The target workspace is ${targetWorkspaceId}.`,
  `The target workspace path is ${opencodeWorkingDirectory}.`,
  `The target workspace commit is ${targetWorkspaceCommit}.`,
  ``,
  `Do not resolve controlRepoCommit inside the target workspace.`,
  `Use targetWorkspaceCommit for git comparisons inside the target workspace.`,
  ``,
  `Do not read outside the current workspace.`,
  `Do not expose secrets.`,
  `Preserve ForgePilot evidence discipline.`
].join("\n");
```

### New Staged File: `context.json`

After writing `instructions.md`, write a new `context.json` file:

```javascript
const context = {
  controlRepoCommit,
  targetWorkspaceId,
  targetWorkspaceCommit,
  opencodeWorkingDirectory
};

await writeFile(
  path.join(bundleDir, "context.json"),
  JSON.stringify(context, null, 2) + "\n"
);
```

### Updated Return Value

```javascript
return {
  bundleDir,
  bundleRelativePath: `.forgepilot/tasks/${runnerRunId}`,
  files: ["packet.md", "request.json", "instructions.md", "context.json", "outputs/"],
  controlRepoCommit,
  targetWorkspaceCommit
};
```

---

## Change 3 — Resolve `controlRepoCommit` in `handleStartRun`

**Location:** `handleStartRun` (line 855), after workspace resolution succeeds (line 976)
and before validation.

**Rationale:** The control repository commit is already available from validation
results (`validation.baseCommit`, `validation.requestBaseCommit`,
`validation.currentCommit`). The canonical control repo commit is
`validation.requestBaseCommit || validation.baseCommit` — this is the commit
already recorded at request creation time and already used in the opencode prompt.

### New Code Block (after line 976)

```javascript
const controlRepoCommit = validation.requestBaseCommit || validation.baseCommit;
```

This resolves `controlRepoCommit` before use in evidence, response, and task
bundle staging.

---

## Change 4 — Resolve and Guard `targetWorkspaceCommit`

**Location:** In `handleStartRun`, after `controlRepoCommit` resolution and
before `stageTaskBundle()` call (i.e., after line 1022, before the
`stageTaskBundle` call at line 1024).

### New Code Block

```javascript
const targetWorkspaceCommit = await getTargetWorkspaceCommit(opencodeWorkingDirectory);

if (targetWorkspaceCommit === null) {
  logOperationEnd(operation, startedAt, false, "TARGET_WORKSPACE_COMMIT_UNRESOLVABLE");

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
    preStartEvidencePath: null,
    postStartEvidenceCreated: false,
    postStartEvidencePath: null,
    requestArtifactMutated: false,
    targetWorkspaceId: requestedTargetWorkspaceId,
    opencodeWorkingDirectory,
    controlRepoCommit,
    targetWorkspaceCommit: null,
    runnerProtocolVersion: RUNNER_PROTOCOL_VERSION,
    boundaryVersion: BOUNDARY_VERSION,
    statusSource: "private dev runner guarded target workspace commit resolution policy",
    checkedAt: nowIso(),
    reasons: ["TARGET_WORKSPACE_COMMIT_UNRESOLVABLE"]
  });
  return;
}
```

**Fail-closed behavior:** If `git rev-parse --short HEAD` fails inside the
target workspace (no git repo, corrupted repo, inaccessible directory),
execution is blocked with a clear rejection reason. The runner never proceeds
to spawn OpenCode without resolving both commits.

---

## Change 5 — Updated `stageTaskBundle` Call

**Location:** Line 1024–1029.

### Current

```javascript
const taskBundle = await stageTaskBundle(
  opencodeWorkingDirectory,
  runnerRunId,
  validation.packetId,
  validation.requestArtifactPath
);
```

### Updated

```javascript
const taskBundle = await stageTaskBundle(
  opencodeWorkingDirectory,
  runnerRunId,
  validation.packetId,
  validation.requestArtifactPath,
  requestedTargetWorkspaceId,
  controlRepoCommit,
  targetWorkspaceCommit
);
```

---

## Change 6 — Updated OpenCode Prompt Message

**Location:** Lines 1036–1050.

### Current

```javascript
const message = [
  `ForgePilot guarded DESIGN_ONLY execution request.`,
  `Packet: ${validation.packetId}`,
  `Request: ${validation.requestId}`,
  `Model: ${validation.modelId}`,
  `Run mode: ${validation.runMode}`,
  `Target commit: ${validation.requestBaseCommit || validation.baseCommit}`,
  ``,
  `Read ${taskBundle.bundleRelativePath}/instructions.md.`,
  `The packet has been staged at ${taskBundle.bundleRelativePath}/packet.md.`,
  `The request artifact has been staged at ${taskBundle.bundleRelativePath}/request.json.`,
  `Write outputs to ${taskBundle.bundleRelativePath}/outputs/.`,
  `Do not read outside the current workspace.`,
  `Do not expose secrets. Preserve ForgePilot evidence discipline.`
].join("\n");
```

### Updated

```javascript
const message = [
  `ForgePilot guarded DESIGN_ONLY execution request.`,
  `Packet: ${validation.packetId}`,
  `Request: ${validation.requestId}`,
  `Model: ${validation.modelId}`,
  `Run mode: ${validation.runMode}`,
  `Control repo commit: ${controlRepoCommit}`,
  `Target workspace commit: ${targetWorkspaceCommit}`,
  ``,
  `Read ${taskBundle.bundleRelativePath}/instructions.md.`,
  `The packet has been staged at ${taskBundle.bundleRelativePath}/packet.md.`,
  `The request artifact has been staged at ${taskBundle.bundleRelativePath}/request.json.`,
  `Context has been staged at ${taskBundle.bundleRelativePath}/context.json.`,
  `Write outputs to ${taskBundle.bundleRelativePath}/outputs/.`,
  `Do not read outside the current workspace.`,
  `Do not expose secrets. Preserve ForgePilot evidence discipline.`
].join("\n");
```

**Key changes:**
1. `"Target commit:"` becomes two lines: `"Control repo commit:"` and `"Target workspace commit:"`.
2. References the new `context.json` staged file.
3. The `instructions.md` path reference and outputs directory reference remain the same.

---

## Change 7 — Updated Pre-Start Evidence

**Location:** Lines 1052–1076.

Add three fields to the pre-start evidence object:

```javascript
controlRepoCommit,
targetWorkspaceCommit,
```

Insert after `opencodeWorkingDirectory` (line 1066) and before `taskBundleCreated` (line 1067):

```javascript
{
  schemaVersion: "FP-MCP-142",
  artifactType: "runner-pre-start-state",
  packetId: validation.packetId,
  requestId: validation.requestId,
  runnerRunId,
  executionEnabled,
  startEndpointContacted: true,
  executionStarted: false,
  opencodeStarted: false,
  targetWorkspaceId: requestedTargetWorkspaceId,
  opencodeWorkingDirectory,
  controlRepoCommit,          // NEW
  targetWorkspaceCommit,      // NEW
  taskBundleCreated: true,
  taskBundlePath: taskBundle.bundleDir,
  taskBundleRelativePath: taskBundle.bundleRelativePath,
  taskBundleFiles: taskBundle.files,
  recordedAt: nowIso()
}
```

---

## Change 8 — Updated Post-Start Evidence (Success Path)

**Location:** Lines 1146–1175.

Add two fields to the post-start evidence object (same insertion point):

```javascript
{
  schemaVersion: "FP-MCP-142",
  artifactType: "runner-post-start-state",
  packetId: validation.packetId,
  requestId: validation.requestId,
  runnerRunId,
  executionEnabled,
  startEndpointContacted: true,
  executionStarted: true,
  opencodeStarted: true,
  opencodePid: child.pid ?? null,
  opencodeBin,
  opencodeModel,
  opencodeArgs,
  targetWorkspaceId: requestedTargetWorkspaceId,
  opencodeWorkingDirectory,
  controlRepoCommit,          // NEW
  targetWorkspaceCommit,      // NEW
  taskBundleCreated: true,
  taskBundlePath: taskBundle.bundleDir,
  taskBundleRelativePath: taskBundle.bundleRelativePath,
  stdoutPath,
  stderrPath,
  recordedAt: nowIso()
}
```

---

## Change 9 — Updated Post-Start Evidence (Error Path)

**Location:** Lines 1106–1142 (the `child.on("error")` handler).

Add the same two fields in the error evidence object:

```javascript
targetWorkspaceId: requestedTargetWorkspaceId,
opencodeWorkingDirectory,
controlRepoCommit,          // NEW
targetWorkspaceCommit,      // NEW
taskBundleCreated: true,
```

---

## Change 10 — Updated Start Response

**Location:** Lines 1179–1208.

Add two fields to the success response body:

```javascript
jsonResponse(res, 200, {
  valid: true,
  accepted: true,
  executionEnabled,
  executionStarted: true,
  opencodeStarted: true,
  runnerRunId,
  startEndpointContacted: true,
  startEndpointState: "CALLABLE_GUARDED",
  startCapabilityCallable: true,
  executionAllowedNow: true,
  approvalConsumed: false,
  approvalConsumptionPath: null,
  preStartEvidenceCreated: true,
  preStartEvidencePath: preStartStatePath,
  postStartEvidenceCreated: true,
  postStartEvidencePath: postStartStatePath,
  taskBundleCreated: true,
  taskBundlePath: taskBundle.bundleDir,
  taskBundleRelativePath: taskBundle.bundleRelativePath,
  requestArtifactMutated: false,
  packetId: validation.packetId,
  requestId: validation.requestId,
  artifactDir,
  // NEW fields:
  targetWorkspaceId: requestedTargetWorkspaceId,
  opencodeWorkingDirectory,
  controlRepoCommit,
  targetWorkspaceCommit,
  // existing:
  runnerProtocolVersion: RUNNER_PROTOCOL_VERSION,
  boundaryVersion: "FP-MCP-142",
  statusSource: "private dev runner guarded OpenCode start policy",
  checkedAt: nowIso(),
  reasons: []
});
```

---

## Constraints Verification

| Constraint | How Addressed |
|---|---|
| Must not mutate request artifacts | No writes to `runs/FP-MCP-145/opencode-requests/` or any request artifact path |
| Must not weaken request artifact validation | No changes to `validateRequestArtifact()` |
| Must not accept arbitrary target workspace paths | Workspace allowlist unchanged, rejection for unknown IDs unchanged |
| Must preserve FP-MCP-143 workspace allowlisting | No changes to `WORKSPACE_ALLOWLIST`, `resolveTargetWorkspace()` |
| Must preserve FP-MCP-144 task bundle staging | `stageTaskBundle()` enhanced but same bundle directory structure preserved |
| Must preserve DESIGN_ONLY as only supported run mode | No changes to `ALLOWED_RUN_MODES` |
| Must fail closed if target workspace commit cannot be resolved | New guard after workspace resolution but before task bundle staging |
| Must not use controlRepoCommit as target workspace commit | The two are resolved independently: `controlRepoCommit` from validation, `targetWorkspaceCommit` via git in target workspace |
| Must not require external directory reads by OpenCode | All context is staged inside the target workspace via task bundle |

---

## Verification Checklist (per FP-MCP-145)

| # | Requirement | Test |
|---|---|---|
| 1 | `node --check runner/server.mjs` passes | Static syntax check |
| 2 | Existing runner tests pass with execution disabled | `node runner/test-runner.mjs` |
| 3 | Capabilities still report workspace routing enabled | GET `/runner/capabilities` → `workspaceRoutingEnabled: true`, `supportedWorkspaces` |
| 4 | Default ForgePilot workspace records a `targetWorkspaceCommit` | Start with `targetWorkspaceId: "forgepilot"`, verify pre-start evidence contains `controlRepoCommit` and `targetWorkspaceCommit` |
| 5 | `forgepilot-chatgpt-mcp` workspace records bridge repo HEAD | Start with `targetWorkspaceId: "forgepilot-chatgpt-mcp"`, verify `targetWorkspaceCommit` equals `git rev-parse --short HEAD` run in `/home/ridasaidd/forgepilot-chatgpt-mcp` |
| 6 | Task bundle instructions distinguish commits | Read `.forgepilot/tasks/<runId>/instructions.md`, verify it contains both commits and the warning about not resolving control commit in target workspace |
| 7 | Unknown workspace IDs remain rejected | Start with `targetWorkspaceId: "nonexistent"` → 403 `DISALLOWED_WORKSPACE` |
| 8 | Request artifacts remain unmutated | Compare SHA256 of request artifact before and after start |
| 9 | Evidence remains under `/home/ridasaidd/forgepilot/runs/...` | Verify pre-start/post-start evidence paths are under control repo runs directory |
