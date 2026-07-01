# FP-MCP-145 Diff Guide — runner/server.mjs

All changes to the single file `runner/server.mjs`. Line numbers reference
current state at control repo commit `20a2396`.

---

## Hunk 1 — New function after `resolveTargetWorkspace` (after line 76)

Insert between `resolveTargetWorkspace` end brace and `stageTaskBundle`:

```diff
  }

+ async function getTargetWorkspaceCommit(opencodeWorkingDirectory) {
+   if (typeof opencodeWorkingDirectory !== "string" || opencodeWorkingDirectory.length === 0) {
+     return null;
+   }
+ 
+   try {
+     const { stdout } = await execFileAsync("git", ["rev-parse", "--short", "HEAD"], {
+       cwd: opencodeWorkingDirectory,
+       timeout: 5_000,
+       maxBuffer: 1024 * 1024
+     });
+ 
+     return stdout.trim();
+   } catch {
+     return null;
+   }
+ }
+ 
  async function stageTaskBundle(opencodeWorkingDirectory, runnerRunId, packetId, requestArtifactPath) {
```

**Lines:** +17

---

## Hunk 2 — Updated `stageTaskBundle` signature and body (lines 78–119)

### Signature change (line 78):

```diff
- async function stageTaskBundle(opencodeWorkingDirectory, runnerRunId, packetId, requestArtifactPath) {
+ async function stageTaskBundle(opencodeWorkingDirectory, runnerRunId, packetId, requestArtifactPath, targetWorkspaceId, controlRepoCommit, targetWorkspaceCommit) {
```

### instructions.md template replacement (lines 97–112):

```diff
-   const instructions = [
-     `ForgePilot staged task execution instructions.`,
-     ``,
-     `Packet: ${packetId}`,
-     `Runner run ID: ${runnerRunId}`,
-     ``,
-     `Read packet.md to understand the task requirements.`,
-     `Read request.json for the execution context details.`,
-     `Produce all DESIGN_ONLY implementation/evidence artifacts in the outputs/ directory.`,
-     ``,
-     `Do not read outside the current workspace.`,
-     `Do not expose secrets.`,
-     `Preserve ForgePilot evidence discipline.`
-   ].join("\n");
+   const instructions = [
+     `ForgePilot staged task execution instructions.`,
+     ``,
+     `Packet: ${packetId}`,
+     `Runner run ID: ${runnerRunId}`,
+     ``,
+     `Read packet.md to understand the task requirements.`,
+     `Read request.json for the execution context details.`,
+     `Read context.json for target workspace binding details.`,
+     `Produce all DESIGN_ONLY implementation/evidence artifacts in the outputs/ directory.`,
+     ``,
+     `The control repository is /home/ridasaidd/forgepilot.`,
+     `The control repository commit is ${controlRepoCommit}.`,
+     `The target workspace is ${targetWorkspaceId}.`,
+     `The target workspace path is ${opencodeWorkingDirectory}.`,
+     `The target workspace commit is ${targetWorkspaceCommit}.`,
+     ``,
+     `Do not resolve controlRepoCommit inside the target workspace.`,
+     `Use targetWorkspaceCommit for git comparisons inside the target workspace.`,
+     ``,
+     `Do not read outside the current workspace.`,
+     `Do not expose secrets.`,
+     `Preserve ForgePilot evidence discipline.`
+   ].join("\n");
```

### New context.json write (after instructions.md write, after line 112):

```diff
    await writeFile(path.join(bundleDir, "instructions.md"), instructions);
 
+   const context = {
+     controlRepoCommit,
+     targetWorkspaceId,
+     targetWorkspaceCommit,
+     opencodeWorkingDirectory
+   };
+ 
+   await writeFile(
+     path.join(bundleDir, "context.json"),
+     JSON.stringify(context, null, 2) + "\n"
+   );
+ 
    return {
      bundleDir,
      bundleRelativePath: `.forgepilot/tasks/${runnerRunId}`,
```

### Return value update (lines 116–117):

```diff
-     files: ["packet.md", "request.json", "instructions.md", "outputs/"]
+     files: ["packet.md", "request.json", "instructions.md", "context.json", "outputs/"],
+     controlRepoCommit,
+     targetWorkspaceCommit
```

**Lines:** ~+25 / ~-4 (net +21)

---

## Hunk 3 — `controlRepoCommit` resolution in `handleStartRun` (after line 976)

After workspace resolution succeeds and before `validateRequestArtifact`:

```diff
    if (opencodeWorkingDirectory === null) {
      // ... existing disallowed workspace rejection ...
    }
 
+   const controlRepoCommit = validation.requestBaseCommit || validation.baseCommit;
+ 
    const validation = await validateRequestArtifact(body);
```

**Wait — reorder needed.** The `controlRepoCommit` is needed *after* validation
(since it comes from validation output), so it must go after line 978. Actually,
the code at line 978 does validation, then there's a rejected/valid branch.

### Correct placement: after the rejected-request guard (after line 1008):

```diff
    const runnerRunId = `RUN-${new Date()
      .toISOString()
      .replace(/[-:.]/g, "")
      .replace("T", "T")
      .replace("Z", "Z")}-${Math.random().toString(16).slice(2, 10)}`;
 
+   const controlRepoCommit = validation.requestBaseCommit || validation.baseCommit;
+ 
    const artifactDir =
```

**Lines:** +2

---

## Hunk 4 — Resolve and guard `targetWorkspaceCommit` (after line 1022)

After `mkdir` for the artifact directory, before `stageTaskBundle`:

```diff
    const absoluteArtifactDir = path.join(repoRoot, artifactDir);
    await mkdir(absoluteArtifactDir, { recursive: true });
 
+   const targetWorkspaceCommit = await getTargetWorkspaceCommit(opencodeWorkingDirectory);
+ 
+   if (targetWorkspaceCommit === null) {
+     logOperationEnd(operation, startedAt, false, "TARGET_WORKSPACE_COMMIT_UNRESOLVABLE");
+ 
+     jsonResponse(res, 403, {
+       valid: false,
+       accepted: false,
+       executionEnabled: true,
+       executionStarted: false,
+       opencodeStarted: false,
+       runnerRunId: null,
+       startEndpointContacted: true,
+       startEndpointState: "CALLABLE_GUARDED",
+       startCapabilityCallable: true,
+       executionAllowedNow: false,
+       approvalConsumed: false,
+       approvalConsumptionPath: null,
+       preStartEvidenceCreated: false,
+       preStartEvidencePath: null,
+       postStartEvidenceCreated: false,
+       postStartEvidencePath: null,
+       requestArtifactMutated: false,
+       targetWorkspaceId: requestedTargetWorkspaceId,
+       opencodeWorkingDirectory,
+       controlRepoCommit,
+       targetWorkspaceCommit: null,
+       runnerProtocolVersion: RUNNER_PROTOCOL_VERSION,
+       boundaryVersion: BOUNDARY_VERSION,
+       statusSource: "private dev runner guarded target workspace commit resolution policy",
+       checkedAt: nowIso(),
+       reasons: ["TARGET_WORKSPACE_COMMIT_UNRESOLVABLE"]
+     });
+     return;
+   }
+ 
    const taskBundle = await stageTaskBundle(
```

**Lines:** +37

---

## Hunk 5 — Updated `stageTaskBundle` call (lines 1024–1029)

```diff
    const taskBundle = await stageTaskBundle(
      opencodeWorkingDirectory,
      runnerRunId,
      validation.packetId,
-     validation.requestArtifactPath
+     validation.requestArtifactPath,
+     requestedTargetWorkspaceId,
+     controlRepoCommit,
+     targetWorkspaceCommit
    );
```

**Lines:** +3

---

## Hunk 6 — Updated OpenCode prompt message (lines 1036–1050)

```diff
    const message = [
      `ForgePilot guarded DESIGN_ONLY execution request.`,
      `Packet: ${validation.packetId}`,
      `Request: ${validation.requestId}`,
      `Model: ${validation.modelId}`,
      `Run mode: ${validation.runMode}`,
-     `Target commit: ${validation.requestBaseCommit || validation.baseCommit}`,
+     `Control repo commit: ${controlRepoCommit}`,
+     `Target workspace commit: ${targetWorkspaceCommit}`,
      ``,
      `Read ${taskBundle.bundleRelativePath}/instructions.md.`,
      `The packet has been staged at ${taskBundle.bundleRelativePath}/packet.md.`,
      `The request artifact has been staged at ${taskBundle.bundleRelativePath}/request.json.`,
+     `Context has been staged at ${taskBundle.bundleRelativePath}/context.json.`,
      `Write outputs to ${taskBundle.bundleRelativePath}/outputs/.`,
      `Do not read outside the current workspace.`,
      `Do not expose secrets. Preserve ForgePilot evidence discipline.`
    ].join("\n");
```

**Lines:** +2 / -1 (net +1)

---

## Hunk 7 — Updated pre-start evidence (lines 1052–1076)

```diff
          targetWorkspaceId: requestedTargetWorkspaceId,
          opencodeWorkingDirectory,
+         controlRepoCommit,
+         targetWorkspaceCommit,
          taskBundleCreated: true,
```

**Lines:** +2

---

## Hunk 8 — Updated post-start evidence, error path (lines 1106–1142)

```diff
              targetWorkspaceId: requestedTargetWorkspaceId,
              opencodeWorkingDirectory,
+             controlRepoCommit,
+             targetWorkspaceCommit,
              taskBundleCreated: true,
```

**Lines:** +2

---

## Hunk 9 — Updated post-start evidence, success path (lines 1146–1175)

```diff
          targetWorkspaceId: requestedTargetWorkspaceId,
          opencodeWorkingDirectory,
+         controlRepoCommit,
+         targetWorkspaceCommit,
          taskBundleCreated: true,
```

**Lines:** +2

---

## Hunk 10 — Updated start response (lines 1179–1208)

```diff
      packetId: validation.packetId,
      requestId: validation.requestId,
      artifactDir,
+     targetWorkspaceId: requestedTargetWorkspaceId,
+     opencodeWorkingDirectory,
+     controlRepoCommit,
+     targetWorkspaceCommit,
      runnerProtocolVersion: RUNNER_PROTOCOL_VERSION,
```

**Lines:** +4

---

## Summary

| Metric | Count |
|---|---|
| New function added | 1 (`getTargetWorkspaceCommit`) |
| Existing function signature changed | 1 (`stageTaskBundle`) |
| New guard added | 1 (target workspace commit unresolvable → 403) |
| New staged file | 1 (`context.json`) |
| Lines added | ~95 |
| Lines removed | ~5 |
| Net line change | ~+90 |

### Unchanged invariants
- `WORKSPACE_ALLOWLIST` — untouched
- `resolveTargetWorkspace()` — untouched
- `validateRequestArtifact()` — untouched
- `gitObservation`, `gitSucceeds`, `resolveCommitShort`, `commitIsAncestor`, `findArtifactCommit`, `getCurrentCommit`, `getGitStatusShort` — all untouched, all still operate on control repo only
- `ALLOWED_MODELS`, `ALLOWED_RUN_MODES` — untouched
- `executionEnabled` guard — untouched (still checked first)
- Request artifact file — never written to
- Evidence directory — remains under `/home/ridasaidd/forgepilot/runs/`
- Task bundle structure — `.forgepilot/tasks/<runnerRunId>/` unchanged, just one new file
