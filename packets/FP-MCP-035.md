# FP-MCP-035 — Execution Artifact Contract

## Task

Define the complete artifact contract for any future ForgePilot remote runner execution.

## Goal

Create a durable contract for what a future real execution run must record before, during, and after execution.

FP-MCP-035 answers one question:

**If ForgePilot ever permits real remote runner execution, what evidence artifacts must exist for the run to be auditable?**

This packet is contract-only.

It must not enable execution.

It must not start OpenCode.

It must not add a real execution harness.

It must not execute shell commands through the runner.

---

## Background

ForgePilot MCP has reached the non-executing preflight layer.

Completed prior packets:

```text
FP-MCP-028 — request artifact lifecycle validation fixed
FP-MCP-029 — guarded start non-execution verified
FP-MCP-030 — structured rejection reason preserved
FP-MCP-031 — runner start response contract documented
FP-MCP-032 — state artifact status vocabulary aligned
FP-MCP-033 — guarded execution preflight contract documented
FP-MCP-034 — non-executing preflight validation tool implemented
```

FP-MCP-034 provides a validation-only preflight result:

```text
preflightEligible: false
executionPermitted: false
executionStarted: false
reason:
- EXECUTION_DISABLED
```

That is the correct current state.

Before ForgePilot can ever implement real execution, it needs a complete artifact contract.

Execution without artifacts would create action without evidence.

ForgePilot must not do that.

---

## Scope Boundary

FP-MCP-035 may:

* define required future execution artifacts
* define artifact filenames
* define artifact schemas
* define artifact lifecycle
* define pre-execution artifacts
* define in-execution artifacts
* define post-execution artifacts
* define failure artifacts
* define stdout and stderr recording rules
* define exit-code recording rules
* define timing metadata rules
* define runner response recording rules
* define request digest recording rules
* define model and run-mode provenance rules
* define secret redaction requirements
* define artifact immutability expectations
* add documentation under `docs/`
* record verification artifacts

FP-MCP-035 must not:

* enable runner execution
* set `FORGEPILOT_RUNNER_EXECUTION_ENABLED=true`
* start OpenCode
* invoke OpenCode CLI
* invoke OpenCode API
* call model providers
* execute shell commands through the runner
* add a real execution harness
* add worker processes
* add queues
* add scheduling
* mutate SQLite
* change routing logic
* expose the private runner publicly
* commit tokens or secrets
* treat artifact contract definition as execution authorization

---

## Governing Principles

This packet is constrained by:

* P01 — ForgePilot records observations, not narratives.
* P02 — Trust cannot be retroactively created.
* P03 — ForgePilot does not optimize for favorable outcomes.
* P04 — Only admitted evidence may influence observatory outputs.
* P05 — Do not build infrastructure for evidence that does not yet exist.
* P06 — Classification follows observation.

---

## Core Artifact Principle

A future execution run is not evidence unless its artifacts make the run auditable.

ForgePilot must preserve:

```text
what was requested
what was validated
what was permitted
what was started
what command boundary was used
what model/run mode was selected
what process returned
what stdout/stderr were captured
what exit code was observed
what files were produced
what verification followed
what reasons were recorded
```

No artifact may rely on a later narrative to create trust.

---

## Required Artifact Directory

Future execution artifacts must live under the request artifact directory declared by the request artifact.

Recommended shape:

```text
runs/<packetId>/<modelId>-<runMode>/
```

For example:

```text
runs/FP-MCP-035/qwen-3.7-max-DESIGN_ONLY/
```

The artifact directory must be:

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

A future execution-capable runner must be able to produce these files.

### 1. `preflight-result.json`

Records the FP-MCP-034-style preflight result that allowed or denied execution.

Required fields:

```json
{
  "schemaVersion": "FP-MCP-035",
  "artifactType": "preflight-result",
  "packetId": "FP-MCP-035",
  "requestId": "REQ-...",
  "preflightEligible": false,
  "executionPermitted": false,
  "executionStarted": false,
  "checkedAt": "2026-06-22T00:00:00.000Z",
  "gates": {},
  "reasons": []
}
```

If execution is not permitted, this artifact may be the final execution evidence artifact.

### 2. `start-request.json`

Records the exact request sent from the bridge to the runner start boundary.

Required fields:

```json
{
  "schemaVersion": "FP-MCP-035",
  "artifactType": "start-request",
  "packetId": "FP-MCP-035",
  "requestId": "REQ-...",
  "requestArtifactPath": "runs/FP-MCP-035/opencode-requests/REQ-....json",
  "requestArtifactSha256": "...",
  "baseCommit": "...",
  "approval": "START_REMOTE_RUNNER_REQUEST",
  "boundaryVersion": "FP-MCP-035",
  "createdAt": "2026-06-22T00:00:00.000Z"
}
```

Must not include secrets.

### 3. `runner-acceptance.json`

Records whether the runner accepted the start request.

Required fields:

```json
{
  "schemaVersion": "FP-MCP-035",
  "artifactType": "runner-acceptance",
  "packetId": "FP-MCP-035",
  "requestId": "REQ-...",
  "accepted": false,
  "executionStarted": false,
  "runnerRunId": null,
  "runnerProtocolVersion": "forgepilot-runner-v1",
  "runnerVersion": "0.1.0-fp-mcp-024",
  "checkedAt": "2026-06-22T00:00:00.000Z",
  "reasons": []
}
```

If the runner rejects the request, this artifact must include stable reason codes.

### 4. `execution-start.json`

Records the exact moment execution begins.

Required fields:

```json
{
  "schemaVersion": "FP-MCP-035",
  "artifactType": "execution-start",
  "packetId": "FP-MCP-035",
  "requestId": "REQ-...",
  "runnerRunId": "RUN-...",
  "executionStarted": true,
  "startedAt": "2026-06-22T00:00:00.000Z",
  "modelId": "qwen-3.7-max",
  "runMode": "DESIGN_ONLY",
  "artifactDir": "runs/FP-MCP-035/qwen-3.7-max-DESIGN_ONLY/",
  "commandBoundary": "opencode-harness",
  "reasons": []
}
```

This artifact must not exist unless execution actually starts.

### 5. `stdout.txt`

Captures stdout from the execution process.

Rules:

```text
must be UTF-8 text or explicitly marked as truncated
must not contain secrets
may be empty
must be referenced by execution-result.json
```

### 6. `stderr.txt`

Captures stderr from the execution process.

Rules:

```text
must be UTF-8 text or explicitly marked as truncated
must not contain secrets
may be empty
must be referenced by execution-result.json
```

### 7. `execution-result.json`

Records process completion.

Required fields:

```json
{
  "schemaVersion": "FP-MCP-035",
  "artifactType": "execution-result",
  "packetId": "FP-MCP-035",
  "requestId": "REQ-...",
  "runnerRunId": "RUN-...",
  "executionStarted": true,
  "executionFinished": true,
  "startedAt": "2026-06-22T00:00:00.000Z",
  "finishedAt": "2026-06-22T00:00:00.000Z",
  "durationMs": 0,
  "exitCode": 0,
  "signal": null,
  "stdoutPath": "runs/FP-MCP-035/qwen-3.7-max-DESIGN_ONLY/stdout.txt",
  "stderrPath": "runs/FP-MCP-035/qwen-3.7-max-DESIGN_ONLY/stderr.txt",
  "producedArtifacts": [],
  "reasons": []
}
```

`execution-result.json` must exist for any execution that starts, even if the process fails.

### 8. `execution-failure.json`

Records failure if execution cannot complete cleanly.

Required when:

```text
runner accepted but failed before process start
process could not be spawned
process timed out
process was killed
stdout/stderr capture failed
artifact write failed
process result could not be classified
```

Required fields:

```json
{
  "schemaVersion": "FP-MCP-035",
  "artifactType": "execution-failure",
  "packetId": "FP-MCP-035",
  "requestId": "REQ-...",
  "runnerRunId": "RUN-...",
  "failureStage": "PROCESS_START",
  "executionStarted": false,
  "executionFinished": false,
  "reasons": [
    "PROCESS_START_FAILED"
  ],
  "recordedAt": "2026-06-22T00:00:00.000Z"
}
```

### 9. `artifact-manifest.json`

Records every artifact written for the run.

Required fields:

```json
{
  "schemaVersion": "FP-MCP-035",
  "artifactType": "artifact-manifest",
  "packetId": "FP-MCP-035",
  "requestId": "REQ-...",
  "runnerRunId": "RUN-...",
  "artifacts": [
    {
      "path": "runs/FP-MCP-035/qwen-3.7-max-DESIGN_ONLY/preflight-result.json",
      "sha256": "...",
      "required": true
    }
  ],
  "createdAt": "2026-06-22T00:00:00.000Z"
}
```

---

## Required Artifact Lifecycle

A future execution-capable runner must record artifacts in this order:

```text
1. preflight-result.json
2. start-request.json
3. runner-acceptance.json
4. execution-start.json, only if execution actually starts
5. stdout.txt and stderr.txt, if execution starts
6. execution-result.json, if execution starts
7. execution-failure.json, if execution fails before a normal result can be recorded
8. artifact-manifest.json
```

If execution is denied by preflight, the minimum acceptable artifact set is:

```text
preflight-result.json
artifact-manifest.json
```

If the runner rejects a start request, the minimum acceptable artifact set is:

```text
preflight-result.json
start-request.json
runner-acceptance.json
artifact-manifest.json
```

If execution starts, the minimum acceptable artifact set is:

```text
preflight-result.json
start-request.json
runner-acceptance.json
execution-start.json
stdout.txt
stderr.txt
execution-result.json
artifact-manifest.json
```

---

## Artifact State Vocabulary

Artifact-producing execution must use stable states.

Recommended states:

```text
PREFLIGHT_RECORDED
START_REQUEST_RECORDED
RUNNER_ACCEPTED
RUNNER_REJECTED
EXECUTION_STARTED
EXECUTION_FINISHED
EXECUTION_FAILED
ARTIFACT_MANIFEST_RECORDED
```

`NOT_IMPLEMENTED` remains valid for the current non-executing skeleton state.

---

## Failure Stage Vocabulary

Failure stages must use stable uppercase strings:

```text
PREFLIGHT
START_REQUEST
RUNNER_ACCEPTANCE
PROCESS_START
PROCESS_RUNNING
PROCESS_TIMEOUT
PROCESS_TERMINATION
STDOUT_CAPTURE
STDERR_CAPTURE
ARTIFACT_WRITE
RESULT_CLASSIFICATION
MANIFEST_WRITE
```

---

## Reason Codes

Reason codes must be stable uppercase strings.

Required reason codes include:

```text
EXECUTION_DISABLED
PREFLIGHT_FAILED
PREFLIGHT_BLOCKED
START_REQUEST_FAILED
RUNNER_REJECTED_REQUEST
RUNNER_PROTOCOL_ERROR
RUNNER_ACCEPTED_BUT_NO_RUN_ID
PROCESS_START_FAILED
PROCESS_TIMEOUT
PROCESS_EXIT_NONZERO
PROCESS_SIGNALLED
STDOUT_CAPTURE_FAILED
STDERR_CAPTURE_FAILED
ARTIFACT_WRITE_FAILED
MANIFEST_WRITE_FAILED
SECRET_REDACTION_FAILED
SECRETS_BOUNDARY_VIOLATION
NETWORK_BOUNDARY_VIOLATION
OPENCODE_BOUNDARY_VIOLATION
```

New reason codes must be additive.

Existing reason-code meanings must not be changed.

---

## Secret Handling

Execution artifacts must not contain:

```text
runner tokens
authorization headers
environment secrets
model provider API keys
OAuth tokens
session cookies
private keys
passwords
```

If secret redaction cannot be guaranteed, execution must fail closed.

Required failure reason:

```text
SECRET_REDACTION_FAILED
```

or:

```text
SECRETS_BOUNDARY_VIOLATION
```

---

## Stdout and Stderr Rules

`stdout.txt` and `stderr.txt` must:

```text
be repository-relative artifacts
be referenced by execution-result.json
be allowed to be empty
be bounded or explicitly marked as truncated
be secret-redacted before commit
```

If truncation occurs, `execution-result.json` must record:

```json
{
  "stdoutTruncated": true,
  "stderrTruncated": true
}
```

---

## Immutability Expectations

Artifacts are append-only observations.

A future implementation must not silently rewrite prior execution artifacts.

If correction is required, it must be recorded as a new observation artifact, not hidden mutation.

Recommended future correction artifact:

```text
artifact-correction.json
```

FP-MCP-035 does not require implementation of correction artifacts.

---

## Current Expected System Classification

Current system remains non-executing.

Expected current classification:

```text
execution artifacts contract defined
executionEnabled: false
OpenCode executionEnabled: false
executionStarted: false
```

This is a PASS condition.

---

## Verification Requirements

Verification must confirm:

```text
contract documentation exists
required artifact set is defined
required artifact lifecycle is defined
required schemas are defined
failure stages are defined
reason codes are defined
secret handling is defined
stdout/stderr rules are defined
runner execution remains disabled
OpenCode execution remains disabled
no execution is attempted
```

---

## Expected Documentation Artifact

Recommended file:

```text
docs/execution-artifact-contract.md
```

The document must define:

```text
required artifact files
required artifact schemas
artifact lifecycle
failure artifacts
stdout/stderr handling
reason codes
secret handling
immutability expectations
current non-execution classification
```

---

## Expected Verification Artifacts

Recommended files:

```text
runs/FP-MCP-035/executor-result.md
runs/FP-MCP-035/verification.txt
```

---

## Acceptance Criteria

FP-MCP-035 is accepted if:

```text
packet is committed
execution artifact contract documentation is committed
required artifacts are defined
required artifact lifecycle is defined
artifact schemas are defined
failure stages are defined
reason codes are defined
secret handling is defined
stdout/stderr rules are defined
runner execution remains disabled
OpenCode execution remains disabled
no execution is attempted
verification artifacts are committed
repo is clean
```

---

## Failure Conditions

FP-MCP-035 fails if:

```text
executionStarted becomes true
OpenCode starts
OpenCode CLI is invoked
OpenCode API is invoked
runner execution is enabled
shell executes through runner
the packet adds a real execution harness
secrets are written to artifacts
runner is publicly exposed
the artifact contract permits execution without evidence
```

---

## Safety Confirmation Required

The executor result must explicitly state:

```text
OpenCode started: NO
OpenCode CLI invoked: NO
OpenCode API invoked: NO
Runner execution enabled: NO
Shell executed through runner: NO
Secrets committed: NO
Runner publicly exposed: NO
```

---

## Non-Goals

FP-MCP-035 does not:

```text
implement execution
enable execution
add OpenCode harness calls
add worker processes
add queues
add scheduling
add SQLite persistence
add dashboards
change routing
change authentication
expose the private runner publicly
```

---

## Expected Follow-Up

After FP-MCP-035, ForgePilot may safely proceed to:

```text
FP-MCP-036 — Non-Executing Execution Artifact Dry-Run
```

or equivalent.

That follow-up should generate mock/contract artifacts without starting OpenCode.
