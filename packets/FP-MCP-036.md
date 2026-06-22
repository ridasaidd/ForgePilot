# FP-MCP-036 — Non-Executing Execution Artifact Dry-Run

## Task

Implement a non-executing dry-run path that writes FP-MCP-035 contract-shaped execution artifacts without starting OpenCode and without contacting the runner start endpoint.

## Goal

Prove that ForgePilot can produce auditable execution-artifact evidence structures before real execution exists.

FP-MCP-036 answers one question:

**Can ForgePilot generate the required execution artifact skeleton for a denied/non-executing run while preserving execution impossibility?**

The expected current result is:

```text
dryRunRecorded: true
executionStarted: false
executionPermitted: false
reason:
- EXECUTION_DISABLED
```

This is a successful result.

---

## Background

FP-MCP-035 defined the execution artifact contract.

Required future execution artifacts include:

```text
preflight-result.json
start-request.json
runner-acceptance.json
execution-start.json
stdout.txt
stderr.txt
execution-result.json
execution-failure.json
artifact-manifest.json
```

However, current ForgePilot state is intentionally non-executing:

```text
runner executionEnabled: false
OpenCode executionEnabled: false
supported run mode: DESIGN_ONLY
```

Therefore FP-MCP-036 must not create artifacts that imply execution started.

It should generate only the artifact subset appropriate for a non-executing dry-run.

---

## Scope Boundary

FP-MCP-036 may:

* add a non-executing dry-run MCP tool
* call the existing preflight validation tool/helper
* write contract-shaped dry-run artifacts
* write an artifact manifest
* record that execution was not permitted
* record that execution did not start
* record `EXECUTION_DISABLED`
* record request artifact provenance
* record runner/OpenCode boundary observations
* add TypeScript helpers if needed
* add output schemas if needed
* update docs if needed
* record verification artifacts

FP-MCP-036 must not:

* enable runner execution
* call `/runner/start-run`
* call the guarded start MCP tool
* start OpenCode
* invoke OpenCode CLI
* invoke OpenCode API
* call model providers
* execute shell commands through the runner
* create `execution-start.json`
* create `stdout.txt`
* create `stderr.txt`
* create `execution-result.json`
* create a real `runnerRunId`
* add a real execution harness
* add worker processes
* add queues
* add scheduling
* mutate SQLite
* change routing logic
* expose the private runner publicly
* commit tokens or secrets

---

## Required Tool

Add a new MCP tool:

```text
forgepilot_record_execution_artifact_dry_run
```

Recommended input:

```json
{
  "packetId": "FP-MCP-036",
  "requestId": "REQ-..."
}
```

The tool must be explicitly non-executing.

It must not call:

```text
/runner/start-run
```

It must not call the guarded start MCP tool.

It may call or reuse the preflight validation helper from FP-MCP-034.

---

## Tool Annotations

The tool writes artifacts, so it is not read-only.

Recommended annotations:

```text
readOnlyHint: false
destructiveHint: false
idempotentHint: false
openWorldHint: true
```

`openWorldHint` may be true because the preflight validation may contact the runner capabilities/validation boundary.

---

## Required Dry-Run Artifact Directory

Artifacts must be written under:

```text
runs/<packetId>/<modelId>-<runMode>/execution-dry-run/
```

Example:

```text
runs/FP-MCP-036/qwen-3.7-max-DESIGN_ONLY/execution-dry-run/
```

The directory must be:

```text
repository-relative
normalized
under runs/<packetId>/
model/run-mode scoped
free of path traversal
free of absolute paths
```

---

## Required Dry-Run Artifact Set

For current non-executing ForgePilot, the dry-run tool must write exactly the non-execution artifact subset:

```text
preflight-result.json
start-request.json
runner-acceptance.json
artifact-manifest.json
```

It must not write:

```text
execution-start.json
stdout.txt
stderr.txt
execution-result.json
execution-failure.json
```

because execution does not start.

---

## Required Artifact: `preflight-result.json`

Must contain the FP-MCP-034 preflight result.

Required fields:

```json
{
  "schemaVersion": "FP-MCP-036",
  "artifactType": "preflight-result",
  "packetId": "FP-MCP-036",
  "requestId": "REQ-...",
  "preflightEligible": false,
  "executionPermitted": false,
  "executionStarted": false,
  "checkedAt": "2026-06-22T00:00:00.000Z",
  "gates": {
    "requestArtifact": "PASSED",
    "lifecycle": "PASSED",
    "packet": "PASSED",
    "model": "PASSED",
    "runMode": "PASSED",
    "runnerIdentity": "PASSED",
    "runnerCapability": "PASSED",
    "executionEnablement": "FAILED",
    "opencodeBoundary": "PASSED",
    "artifactRecording": "NOT_EVALUATED",
    "secretsBoundary": "PASSED",
    "networkExposure": "PASSED"
  },
  "reasons": [
    "EXECUTION_DISABLED"
  ]
}
```

Additional observed fields may be included if they are non-secret observations.

---

## Required Artifact: `start-request.json`

Must describe the start request that would have been required, but must clearly mark it as not submitted.

Required fields:

```json
{
  "schemaVersion": "FP-MCP-036",
  "artifactType": "start-request",
  "dryRun": true,
  "submittedToRunner": false,
  "packetId": "FP-MCP-036",
  "requestId": "REQ-...",
  "requestArtifactPath": "runs/FP-MCP-036/opencode-requests/REQ-....json",
  "requestArtifactSha256": "...",
  "baseCommit": "...",
  "approval": "START_REMOTE_RUNNER_REQUEST",
  "boundaryVersion": "FP-MCP-036",
  "createdAt": "2026-06-22T00:00:00.000Z"
}
```

This artifact must not include secrets.

---

## Required Artifact: `runner-acceptance.json`

Must record that the runner was not asked to accept execution.

Required fields:

```json
{
  "schemaVersion": "FP-MCP-036",
  "artifactType": "runner-acceptance",
  "dryRun": true,
  "runnerContactedForStart": false,
  "accepted": false,
  "executionStarted": false,
  "runnerRunId": null,
  "packetId": "FP-MCP-036",
  "requestId": "REQ-...",
  "runnerProtocolVersion": "forgepilot-runner-v1",
  "runnerVersion": "0.1.0-fp-mcp-024",
  "checkedAt": "2026-06-22T00:00:00.000Z",
  "reasons": [
    "EXECUTION_DISABLED"
  ]
}
```

This artifact must not imply the runner rejected a submitted start request.

Correct meaning:

```text
runner was not asked to start execution because preflight denied permission
```

---

## Required Artifact: `artifact-manifest.json`

Must record every artifact written.

Required fields:

```json
{
  "schemaVersion": "FP-MCP-036",
  "artifactType": "artifact-manifest",
  "dryRun": true,
  "packetId": "FP-MCP-036",
  "requestId": "REQ-...",
  "executionStarted": false,
  "artifacts": [
    {
      "path": "runs/FP-MCP-036/qwen-3.7-max-DESIGN_ONLY/execution-dry-run/preflight-result.json",
      "sha256": "...",
      "required": true
    }
  ],
  "createdAt": "2026-06-22T00:00:00.000Z",
  "reasons": [
    "EXECUTION_DISABLED"
  ]
}
```

The manifest must include all dry-run artifacts and their SHA-256 hashes.

---

## Required Tool Output

The MCP tool must return:

```json
{
  "schemaVersion": "FP-MCP-036",
  "packetId": "FP-MCP-036",
  "requestId": "REQ-...",
  "dryRunRecorded": true,
  "executionPermitted": false,
  "executionStarted": false,
  "startEndpointContacted": false,
  "opencodeStarted": false,
  "artifactDir": "runs/FP-MCP-036/qwen-3.7-max-DESIGN_ONLY/execution-dry-run/",
  "artifacts": [
    "preflight-result.json",
    "start-request.json",
    "runner-acceptance.json",
    "artifact-manifest.json"
  ],
  "reasons": [
    "EXECUTION_DISABLED"
  ]
}
```

Additional fields are allowed if they are observations.

---

## Required Negative Checks

The tool must ensure these files are absent after the dry-run:

```text
execution-start.json
stdout.txt
stderr.txt
execution-result.json
execution-failure.json
```

If any of those files are created in the current non-executing state, FP-MCP-036 must fail.

---

## Artifact Meaning

The dry-run artifacts must not pretend execution happened.

They must show:

```text
preflight was evaluated
execution was not permitted
start request was not submitted
runner did not accept execution
execution did not start
contract-shaped artifacts can be recorded
```

---

## Reason Codes

Required reason code for current state:

```text
EXECUTION_DISABLED
```

Other allowed reason codes include:

```text
PREFLIGHT_FAILED
PREFLIGHT_BLOCKED
REQUEST_ARTIFACT_INVALID
REQUEST_ARTIFACT_MISSING
REQUEST_LIFECYCLE_INVALID
MODEL_NOT_ALLOWED
RUN_MODE_NOT_ALLOWED
RUNNER_UNREACHABLE
RUNNER_PROTOCOL_ERROR
ARTIFACT_WRITE_FAILED
MANIFEST_WRITE_FAILED
SECRETS_BOUNDARY_VIOLATION
OPENCODE_BOUNDARY_VIOLATION
```

---

## Safety Requirements

The implementation must preserve:

```text
OpenCode started: NO
OpenCode CLI invoked: NO
OpenCode API invoked: NO
Runner execution enabled: NO
Runner start endpoint contacted: NO
Shell executed through runner: NO
Secrets committed: NO
Runner publicly exposed: NO
```

---

## Verification Requirements

Verification must include:

1. Build/typecheck of the MCP bridge.
2. Service restart.
3. Action refresh if needed.
4. Creation of a fresh FP-MCP-036 request artifact.
5. Commit of the request artifact.
6. Preflight validation.
7. Dry-run tool invocation.
8. Confirmation that dry-run artifacts exist:

```text
preflight-result.json
start-request.json
runner-acceptance.json
artifact-manifest.json
```

9. Confirmation that execution artifacts do not exist:

```text
execution-start.json
stdout.txt
stderr.txt
execution-result.json
execution-failure.json
```

10. Confirmation that no guarded start call occurred.
11. Confirmation that no OpenCode execution occurred.
12. Verification artifacts committed.

---

## Expected Files

Likely MCP bridge changes:

```text
src/server.ts
```

Expected ForgePilot artifacts:

```text
packets/FP-MCP-036.md
runs/FP-MCP-036/opencode-requests/<request>.json
runs/FP-MCP-036/qwen-3.7-max-DESIGN_ONLY/execution-dry-run/preflight-result.json
runs/FP-MCP-036/qwen-3.7-max-DESIGN_ONLY/execution-dry-run/start-request.json
runs/FP-MCP-036/qwen-3.7-max-DESIGN_ONLY/execution-dry-run/runner-acceptance.json
runs/FP-MCP-036/qwen-3.7-max-DESIGN_ONLY/execution-dry-run/artifact-manifest.json
runs/FP-MCP-036/executor-result.md
runs/FP-MCP-036/verification.txt
```

---

## Acceptance Criteria

FP-MCP-036 is accepted if:

```text
new dry-run MCP tool exists
tool is explicitly non-executing
tool does not call start-run
tool does not start OpenCode
tool writes the four required dry-run artifacts
tool writes artifact-manifest.json with hashes
tool records executionPermitted false
tool records executionStarted false
tool records EXECUTION_DISABLED
tool confirms startEndpointContacted false
tool confirms opencodeStarted false
negative execution artifacts are absent
runner execution remains disabled
OpenCode execution remains disabled
verification artifacts are committed
repo is clean
```

---

## Failure Conditions

FP-MCP-036 fails if:

```text
executionStarted becomes true
OpenCode starts
OpenCode CLI is invoked
OpenCode API is invoked
runner execution is enabled
start-run endpoint is contacted
shell executes through runner
execution-start.json is written
stdout.txt is written
stderr.txt is written
execution-result.json is written
execution-failure.json is written
secrets are written to artifacts
runner is publicly exposed
```

---

## Expected Result

Current expected successful result:

```text
PASS
```

with:

```text
dryRunRecorded: true
executionPermitted: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
reasons:
- EXECUTION_DISABLED
```

---

## Follow-Up

After FP-MCP-036, ForgePilot can proceed to one of:

```text
FP-MCP-037 — Dry-Run Artifact Verification Tool
FP-MCP-037 — Execution Enablement Policy Contract
```

The safer next step is likely dry-run artifact verification.
