# FP-MCP-145 — Verification Plan

## Pre-Implementation Checks

### V0: Static Syntax Check

```bash
node --check runner/server.mjs
```

**Expected:** Exit code 0, no output.

---

## Execution-Disabled Tests (existing test runner)

### V1: Existing Runner Tests Pass

```bash
FORGEPILOT_RUNNER_TOKEN=test-token node runner/test-runner.mjs
```

**Expected:** All assertions pass, output includes "runner skeleton tests PASS".

**What this verifies:**
- Health endpoint works
- Capabilities requires auth (401)
- Capabilities with auth returns valid structure (200)
- Validate-request rejects without auth (401)
- Validate-request rejects unsafe paths
- Validate-request rejects forbidden execution fields
- Start-run returns 403 when execution disabled

---

## Capabilities Test

### V2: Workspace Routing Still Reported

```bash
curl -s -H "Authorization: Bearer <token>" http://127.0.0.1:8791/runner/capabilities | python3 -m json.tool
```

**Expected fields:**
```json
{
  "supportedWorkspaces": ["forgepilot", "forgepilot-chatgpt-mcp"],
  "defaultWorkspace": "forgepilot",
  "workspaceRoutingEnabled": true
}
```

**What this verifies:** FP-MCP-143 workspace allowlisting is preserved.
Capabilities endpoint unchanged.

---

## Execution-Enabled Tests (manual, guarded)

These tests require `FORGEPILOT_RUNNER_EXECUTION_ENABLED=true` and are
performed manually with close observation. Each test should be run, evidence
captured, then the runner process should be reverted to execution-disabled.

### V3: Same-Repository Start (Default Workspace)

**Setup:**
1. Start runner with `FORGEPILOT_RUNNER_EXECUTION_ENABLED=true`
2. Note control repo commit: `git rev-parse --short HEAD` in `/home/ridasaidd/forgepilot`

**Request:**
```json
POST /runner/start-run
Authorization: Bearer <token>
Content-Type: application/json

{
  "packetId": "FP-MCP-145",
  "requestId": "REQ-20260701T125903957Z-3d529835",
  "requestArtifactPath": "runs/FP-MCP-145/opencode-requests/REQ-20260701T125903957Z-3d529835.json",
  "baseCommit": "20a2396",
  "boundaryVersion": "FP-MCP-083",
  "targetWorkspaceId": "forgepilot"
}
```

**Verification Checklist:**
- [ ] Response status is 200
- [ ] `response.controlRepoCommit` is `"20a2396"` (or the current HEAD)
- [ ] `response.targetWorkspaceCommit` is the current HEAD of `/home/ridasaidd/forgepilot`
- [ ] `response.targetWorkspaceCommit === response.controlRepoCommit` (same repo)
- [ ] `response.targetWorkspaceId` is `"forgepilot"`
- [ ] `response.opencodeWorkingDirectory` is `"/home/ridasaidd/forgepilot"`
- [ ] `response.preStartEvidenceCreated` is `true`
- [ ] `response.postStartEvidenceCreated` is `true`
- [ ] Pre-start evidence file exists at the expected path
- [ ] Pre-start evidence contains `controlRepoCommit` and `targetWorkspaceCommit`
- [ ] Post-start evidence file exists at the expected path
- [ ] Post-start evidence contains `controlRepoCommit` and `targetWorkspaceCommit`
- [ ] Task bundle `instructions.md` contains commit distinction text
- [ ] Task bundle `context.json` exists with correct fields
- [ ] `taskBundleFiles` includes `"context.json"`

---

### V4: Cross-Repository Start (forgepilot-chatgpt-mcp)

**Setup:**
1. Start runner with `FORGEPILOT_RUNNER_EXECUTION_ENABLED=true`
2. Note control repo commit: `git rev-parse --short HEAD` in `/home/ridasaidd/forgepilot`
3. Note bridge repo commit: `git -C /home/ridasaidd/forgepilot-chatgpt-mcp rev-parse --short HEAD`

**Request:**
```json
POST /runner/start-run
Authorization: Bearer <token>
Content-Type: application/json

{
  "packetId": "FP-MCP-145",
  "requestId": "REQ-20260701T125903957Z-3d529835",
  "requestArtifactPath": "runs/FP-MCP-145/opencode-requests/REQ-20260701T125903957Z-3d529835.json",
  "baseCommit": "20a2396",
  "boundaryVersion": "FP-MCP-083",
  "targetWorkspaceId": "forgepilot-chatgpt-mcp"
}
```

**Verification Checklist:**
- [ ] Response status is 200
- [ ] `response.controlRepoCommit` is the ForgePilot HEAD commit
- [ ] `response.targetWorkspaceCommit` is the bridge repo HEAD commit
- [ ] `response.controlRepoCommit !== response.targetWorkspaceCommit` (different repos with different histories)
- [ ] `response.targetWorkspaceId` is `"forgepilot-chatgpt-mcp"`
- [ ] `response.opencodeWorkingDirectory` is `"/home/ridasaidd/forgepilot-chatgpt-mcp"`
- [ ] Task bundle is staged at `/home/ridasaidd/forgepilot-chatgpt-mcp/.forgepilot/tasks/<runnerRunId>/`
- [ ] Task bundle `instructions.md` says: "The control repository commit is `<controlCommit>`. The target workspace commit is `<targetCommit>`"
- [ ] Task bundle `instructions.md` says: "Do not resolve controlRepoCommit inside the target workspace."
- [ ] Task bundle `instructions.md` says: "Use targetWorkspaceCommit for git comparisons inside the target workspace."
- [ ] Task bundle `context.json` has correct distinct commit values
- [ ] Evidence is written to `/home/ridasaidd/forgepilot/runs/FP-MCP-145/...` (NOT to bridge repo)
- [ ] Request artifact in `runs/FP-MCP-145/opencode-requests/` is unmodified (SHA256 unchanged)

---

### V5: Rejected Workspace ID

**Request:**
```json
POST /runner/start-run
Authorization: Bearer <token>
Content-Type: application/json

{
  "packetId": "FP-MCP-145",
  "requestId": "REQ-20260701T125903957Z-3d529835",
  "requestArtifactPath": "runs/FP-MCP-145/opencode-requests/REQ-20260701T125903957Z-3d529835.json",
  "baseCommit": "20a2396",
  "boundaryVersion": "FP-MCP-083",
  "targetWorkspaceId": "nonexistent-workspace"
}
```

**Verification Checklist:**
- [ ] Response status is 403
- [ ] `response.reasons` includes `"DISALLOWED_WORKSPACE"`
- [ ] `response.targetWorkspaceId` is `"nonexistent-workspace"`
- [ ] `response.opencodeWorkingDirectory` is `null`
- [ ] `response.executionStarted` is `false`
- [ ] No evidence files created
- [ ] No task bundle created

---

### V6: Unresolvable Target Workspace Commit

**Setup:**
1. Create a workspace directory that is not a git repository:
   ```bash
   mkdir -p /tmp/not-a-repo
   ```
2. Temporarily add it to `WORKSPACE_ALLOWLIST`:
   ```javascript
   const WORKSPACE_ALLOWLIST = Object.freeze({
     forgepilot: "/home/ridasaidd/forgepilot",
     "forgepilot-chatgpt-mcp": "/home/ridasaidd/forgepilot-chatgpt-mcp",
     "not-a-repo": "/tmp/not-a-repo"
   });
   ```
3. Start runner with execution enabled.

**Request:**
```json
POST /runner/start-run
{
  "targetWorkspaceId": "not-a-repo"
}
```

**Verification Checklist:**
- [ ] Response status is 403
- [ ] `response.reasons` includes `"TARGET_WORKSPACE_COMMIT_UNRESOLVABLE"`
- [ ] `response.targetWorkspaceCommit` is `null`
- [ ] `response.controlRepoCommit` is present (resolved successfully)
- [ ] `response.executionStarted` is `false`
- [ ] No evidence files created
- [ ] No task bundle created
- [ ] No OpenCode spawned

**Teardown:** Revert `WORKSPACE_ALLOWLIST` and remove `/tmp/not-a-repo`.

---

### V7: Request Artifact Immutability

**Verification:**
```bash
# Before any start attempt
sha256sum runs/FP-MCP-145/opencode-requests/REQ-20260701T125903957Z-3d529835.json > /tmp/before.sha256

# After any start attempt
sha256sum runs/FP-MCP-145/opencode-requests/REQ-20260701T125903957Z-3d529835.json > /tmp/after.sha256

diff /tmp/before.sha256 /tmp/after.sha256
```

**Expected:** No diff — the request artifact was never modified by the runner.

---

### V8: Evidence Directory Location

**Verification:**
```bash
ls /home/ridasaidd/forgepilot/runs/FP-MCP-145/deepseek-v4-pro-high-DESIGN_ONLY/
```

**Expected:** Contains pre-start and post-start evidence files under the
ForgePilot control repository. No evidence files in the target workspace.

---

### V9: Instructions.md Content Check

After a start (same-repo or cross-repo):

```bash
cat .forgepilot/tasks/<runnerRunId>/instructions.md | grep -E "control repository|target workspace|Do not resolve|Use targetWorkspaceCommit"
```

**Expected output (at minimum):**
```
The control repository is /home/ridasaidd/forgepilot.
The control repository commit is <hash>.
The target workspace is <id>.
The target workspace path is <path>.
The target workspace commit is <hash>.
Do not resolve controlRepoCommit inside the target workspace.
Use targetWorkspaceCommit for git comparisons inside the target workspace.
```

---

## Verification Summary

| # | Test | What It Proves |
|---|---|---|
| V0 | `node --check` | Syntax validity |
| V1 | Existing tests pass | No regression |
| V2 | Capabilities endpoint | Workspace routing preserved |
| V3 | Same-repo start | Both commits recorded, same value |
| V4 | Cross-repo start | Commits differ, distinction explicit |
| V5 | Unknown workspace | Still rejected (403) |
| V6 | Unresolvable commit | Fails closed (403) |
| V7 | Request artifact SHA256 | No mutation |
| V8 | Evidence directory | Remains in control repo |
| V9 | Instructions content | Commit distinction in worker instructions |
