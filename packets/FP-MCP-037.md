# FP-MCP-037 — Dry-Run Artifact Verification Tool

## Task

Implement a validation-only ForgePilot MCP tool that verifies FP-MCP-036 dry-run execution artifacts.

## Goal

Prove that ForgePilot can independently verify the contract-shaped dry-run artifacts produced by FP-MCP-036 without enabling execution, starting OpenCode, or contacting the runner start endpoint.

FP-MCP-037 answers one question:

**Can ForgePilot verify that a non-executing execution artifact dry-run is complete, internally consistent, hash-valid, and free of forbidden execution artifacts?**

The expected current result for the FP-MCP-036 dry-run is:

```text
verified: true
executionStarted: false
requiredArtifactsPresent: true
forbiddenArtifactsAbsent: true
manifestHashesValid: true
reason:
- EXECUTION_DISABLED
```

This is a successful result.

---

## Background

FP-MCP-035 defined the execution artifact contract.

FP-MCP-036 implemented a non-executing dry-run tool that writes the safe artifact subset:

```text
preflight-result.json
start-request.json
runner-acceptance.json
artifact-manifest.json
```

The dry-run must not write execution artifacts:

```text
execution-start.json
stdout.txt
stderr.txt
execution-result.json
execution-failure.json
```

FP-MCP-037 adds the verifier for those artifacts.

The verifier must read and validate artifacts.

It must not create new execution artifacts.

It must not call the runner start endpoint.

It must not start OpenCode.

---

## Scope Boundary

FP-MCP-037 may:

* add a validation-only MCP tool
* read dry-run artifacts under `runs/<packetId>/<modelId>-<runMode>/execution-dry-run/`
* verify required dry-run artifacts exist
* verify forbidden execution artifacts are absent
* verify artifact manifest schema
* verify child artifact SHA-256 hashes
* verify manifest self-hash if supplied as input or tool-observed value
* verify consistent packet id
* verify consistent request id
* verify consistent dry-run status
* verify `executionStarted: false`
* verify `executionPermitted: false`
* verify `submittedToRunner: false`
* verify `runnerContactedForStart: false`
* verify `EXECUTION_DISABLED`
* return structured verification results
* add TypeScript helpers if needed
* add output schemas if needed
* update docs if needed
* record verification artifacts

FP-MCP-037 must not:

* enable runner execution
* call `/runner/start-run`
* call the guarded start MCP tool
* call the dry-run writer tool
* start OpenCode
* invoke OpenCode CLI
* invoke OpenCode API
* call model providers
* execute shell commands through the runner
* create execution artifacts
* create or mutate dry-run artifacts during verification
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
forgepilot_verify_execution_artifact_dry_run
```

Recommended input:

```json
{
  "packetId": "FP-MCP-036",
  "requestId": "REQ-...",
  "modelId": "qwen-3.7-max",
  "runMode": "DESIGN_ONLY"
}
```

The packet id refers to the dry-run packet being verified.

The tool must be read-only.

It must not write files.

It must not call:

```text
/runner/start-run
```

It must not call the guarded start MCP tool.

It must not call the dry-run writer tool.

---

## Tool Annotations

Recommended annotations:

```text
readOnlyHint: true
destructiveHint: false
idempotentHint: true
openWorldHint: false
```

The tool should not need to contact external systems. It should verify repository-local artifacts only.

---

## Required Verification Directory

The verifier must inspect:

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

## Required Artifact Set

The verifier must require:

```text
preflight-result.json
start-request.json
runner-acceptance.json
artifact-manifest.json
```

If any required artifact is missing, verification must fail.

---

## Forbidden Artifact Set

The verifier must require these files to be absent:

```text
execution-start.json
stdout.txt
stderr.txt
execution-result.json
execution-failure.json
```

If any forbidden artifact exists, verification must fail.

---

## Required Checks

### 1. Directory Safety

Verify:

```text
artifact directory is normalized
artifact directory is repository-relative
artifact directory is under runs/<packetId>/
artifact directory includes model/run-mode scope
artifact directory ends with execution-dry-run/
```

### 2. Required Artifact Presence

Verify all required artifacts exist:

```text
preflight-result.json
start-request.json
runner-acceptance.json
artifact-manifest.json
```

### 3. Forbidden Artifact Absence

Verify all forbidden artifacts are absent:

```text
execution-start.json
stdout.txt
stderr.txt
execution-result.json
execution-failure.json
```

### 4. JSON Parse Validity

Verify JSON artifacts parse as objects:

```text
preflight-result.json
start-request.json
runner-acceptance.json
artifact-manifest.json
```

### 5. Manifest Consistency

Verify manifest contains child artifact entries for:

```text
preflight-result.json
start-request.json
runner-acceptance.json
```

The verifier may optionally compute and report the manifest file's own SHA-256, but it must not require the manifest to embed its own hash.

Reason:

```text
embedding a file's own final hash inside itself is circular
```

### 6. Child Hash Validity

Verify manifest hashes match actual SHA-256 values for:

```text
preflight-result.json
start-request.json
runner-acceptance.json
```

If any child hash mismatch occurs, verification must fail.

### 7. Packet and Request Consistency

Verify every artifact uses the same:

```text
packetId
requestId
```

Expected values come from tool input.

### 8. Dry-Run Consistency

Verify:

```text
dryRun: true
executionStarted: false
executionPermitted: false where present
submittedToRunner: false
runnerContactedForStart: false
runnerRunId: null
```

### 9. Reason Consistency

Verify expected reason code is present:

```text
EXECUTION_DISABLED
```

The verifier may allow additional stable reason codes only if they do not imply execution.

### 10. Boundary Consistency

Verify artifacts do not imply:

```text
start endpoint contacted
OpenCode started
execution accepted
execution started
process output captured
```

---

## Required Tool Output

The tool must return:

```json
{
  "schemaVersion": "FP-MCP-037",
  "verified": true,
  "packetId": "FP-MCP-036",
  "requestId": "REQ-...",
  "modelId": "qwen-3.7-max",
  "runMode": "DESIGN_ONLY",
  "artifactDir": "runs/FP-MCP-036/qwen-3.7-max-DESIGN_ONLY/execution-dry-run/",
  "requiredArtifactsPresent": true,
  "forbiddenArtifactsAbsent": true,
  "jsonArtifactsValid": true,
  "manifestValid": true,
  "manifestHashesValid": true,
  "packetRequestConsistent": true,
  "dryRunConsistent": true,
  "executionStarted": false,
  "startEndpointContacted": false,
  "opencodeStarted": false,
  "checkedAt": "2026-06-22T00:00:00.000Z",
  "artifactHashes": {},
  "manifestSelfHash": "...",
  "reasons": [
    "EXECUTION_DISABLED"
  ]
}
```

Additional fields are allowed if they are observations.

---

## Verification States

Each verification category should be represented as boolean top-level fields.

Recommended fields:

```text
requiredArtifactsPresent
forbiddenArtifactsAbsent
jsonArtifactsValid
manifestValid
manifestHashesValid
packetRequestConsistent
dryRunConsistent
reasonConsistent
boundaryConsistent
```

Top-level `verified` may only be true if all required verification categories pass.

---

## Failure Reason Codes

Required failure codes include:

```text
ARTIFACT_DIR_INVALID
REQUIRED_ARTIFACT_MISSING
FORBIDDEN_ARTIFACT_PRESENT
ARTIFACT_JSON_INVALID
MANIFEST_INVALID
MANIFEST_HASH_MISMATCH
PACKET_ID_MISMATCH
REQUEST_ID_MISMATCH
DRY_RUN_INCONSISTENT
EXECUTION_STARTED_UNEXPECTEDLY
START_ENDPOINT_CONTACTED_UNEXPECTEDLY
OPENCODE_STARTED_UNEXPECTEDLY
REASON_MISSING
```

Existing successful non-execution reason:

```text
EXECUTION_DISABLED
```

must remain present for the current verified dry-run.

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
Artifacts mutated by verifier: NO
```

---

## Verification Requirements

Verification must include:

1. Build/typecheck of the MCP bridge.
2. Service restart.
3. Action refresh if needed.
4. Invocation of the verifier against the committed FP-MCP-036 dry-run artifacts.
5. Confirmation that required artifacts are present.
6. Confirmation that forbidden artifacts are absent.
7. Confirmation that manifest child hashes are valid.
8. Confirmation that dry-run consistency passes.
9. Confirmation that `verified: true`.
10. Confirmation that verifier does not mutate artifacts.
11. Confirmation that no guarded start call occurred.
12. Confirmation that no OpenCode execution occurred.
13. Verification artifacts committed.

---

## Expected Files

Likely MCP bridge changes:

```text
src/server.ts
```

Expected ForgePilot verification artifacts:

```text
packets/FP-MCP-037.md
runs/FP-MCP-037/executor-result.md
runs/FP-MCP-037/verification.txt
```

The verifier should not create additional run artifacts under FP-MCP-036.

---

## Acceptance Criteria

FP-MCP-037 is accepted if:

```text
new verifier MCP tool exists
tool is read-only
tool does not call start-run
tool does not call dry-run writer
tool does not start OpenCode
tool verifies required dry-run artifacts are present
tool verifies forbidden execution artifacts are absent
tool verifies manifest child hashes
tool verifies packet/request consistency
tool verifies dry-run consistency
tool returns verified true for FP-MCP-036 dry-run artifacts
tool reports executionStarted false
tool reports startEndpointContacted false
tool reports opencodeStarted false
tool preserves EXECUTION_DISABLED
runner execution remains disabled
OpenCode execution remains disabled
verification artifacts are committed
repo is clean
```

---

## Failure Conditions

FP-MCP-037 fails if:

```text
executionStarted becomes true
OpenCode starts
OpenCode CLI is invoked
OpenCode API is invoked
runner execution is enabled
start-run endpoint is contacted
dry-run writer tool is invoked by verifier
shell executes through runner
artifacts are mutated by verifier
forbidden execution artifacts exist
manifest child hashes are invalid
required artifacts are missing
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
verified: true
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
requiredArtifactsPresent: true
forbiddenArtifactsAbsent: true
manifestHashesValid: true
reasons:
- EXECUTION_DISABLED
```

---

## Follow-Up

After FP-MCP-037, ForgePilot can proceed to:

```text
FP-MCP-038 — Execution Enablement Policy Contract
```

or equivalent.

That packet should define the policy conditions under which execution may become enabled, but must still not enable execution.
