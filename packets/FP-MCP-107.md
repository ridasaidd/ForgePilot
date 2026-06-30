# FP-MCP-107 — FP-MCP-106 Manual Implementation Procedure

## Task

Define a manual/local implementation procedure for FP-MCP-106 disabled start capability metadata.

## Goal

Provide a controlled procedure for implementing metadata-only runner capability changes without using remote runner start, OpenCode start, or any execution path.

This packet answers one question:

How should FP-MCP-106 be implemented manually while preserving non-execution safety invariants?

## Background

FP-MCP-106 defines a metadata-only implementation task:

- add disabled start capability metadata to the runner capabilities response
- keep start not callable
- keep execution disabled
- preserve validation-only operations
- avoid any OpenCode start behavior

FP-MCP-106 request validation passed:

- local validation: passed
- remote validate-request: passed
- executionEnabled: false
- executionStarted: false
- opencodeStarted: false
- runner start endpoint not contacted

Because the runner does not yet advertise or implement start capability, FP-MCP-107 defines the manual implementation procedure for FP-MCP-106.

## Scope

Allowed:

- Inspect runner capability implementation files.
- Identify where runner capabilities response is produced.
- Add disabled start capability metadata only.
- Preserve existing supported operations unless explicitly justified.
- Run local tests or type checks if available.
- Restart the runner only if needed to observe capabilities.
- Observe runner capabilities after implementation.
- Record evidence under `runs/FP-MCP-107/`.

Forbidden:

- Do not implement a start endpoint.
- Do not make start callable.
- Do not enable execution.
- Do not relax the global disable switch.
- Do not create approval evidence.
- Do not consume approval.
- Do not contact the runner start endpoint.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create a runner run id.
- Do not mutate request artifacts.
- Do not change production execution behavior.
- Do not implement approval consumption behavior.
- Do not implement targetExecutionCommit/evidenceLedgerCommit execution behavior.

## Target Implementation

The implementation should update the runner capabilities response to include disabled start metadata.

Required metadata:

- `startCapabilityAdvertised`
- `startCapabilityCallable`
- `startCapabilityVersion`
- `startOperationName`
- `startRequiresApprovalEvidence`
- `startRequiresPreflight`
- `startRequiresDisableSwitchClear`
- `startRequiresRequestArtifactHash`
- `startRequiresTargetExecutionCommit`
- `startRequiresEvidenceLedgerValidation`
- `startRecordsPreStartState`
- `startRecordsPostStartState`
- `startReturnsRunnerRunId`
- `startDisabledReason`
- `startBlockingReasons`

Expected values:

- `startCapabilityAdvertised: true`
- `startCapabilityCallable: false`
- `startCapabilityVersion: guarded-start-capability-v0`
- `startOperationName: null`
- `startRequiresApprovalEvidence: true`
- `startRequiresPreflight: true`
- `startRequiresDisableSwitchClear: true`
- `startRequiresRequestArtifactHash: true`
- `startRequiresTargetExecutionCommit: true`
- `startRequiresEvidenceLedgerValidation: true`
- `startRecordsPreStartState: true`
- `startRecordsPostStartState: true`
- `startReturnsRunnerRunId: false`
- `startDisabledReason: START_CAPABILITY_ADVERTISEMENT_ONLY`
- `startBlockingReasons` includes:
  - `START_NOT_CALLABLE`
  - `RUNNER_EXECUTION_DISABLED`
  - `OPENCODE_EXECUTION_DISABLED`

## Supported Operations Requirement

Preferred behavior:

- `supportedOperations` remains:
  - `capabilities`
  - `validate-request`

Start metadata must be exposed separately.

Start must not be listed as supported while it is not callable.

## Manual Procedure

### Step 1 — Confirm clean repository

Run:

```text
git status --short
git rev-parse --short HEAD
```

Expected:

- clean working tree

### Step 2 — Locate runner capability implementation

Inspect likely files:

```text
runner/server.mjs
runner/
```

Identify where the capabilities response is constructed.

### Step 3 — Add metadata-only fields

Add disabled start capability fields to the capabilities response.

Do not add a start route.

Do not add start request handling.

Do not add OpenCode process launch behavior.

### Step 4 — Run available verification

Run available checks if present.

Possible commands:

```text
pnpm test
pnpm typecheck
node --check runner/server.mjs
```

Only run commands that exist for the repository.

### Step 5 — Restart runner if needed

If the capabilities endpoint is served by a long-running runner process, restart only the runner service required to observe the metadata change.

Do not enable execution.

Do not start OpenCode.

### Step 6 — Observe capabilities

Use read-only capability observation.

Expected after implementation:

- runner reachable
- capabilities endpoint returns metadata fields
- startCapabilityAdvertised: true
- startCapabilityCallable: false
- startReturnsRunnerRunId: false
- executionEnabled: false
- supportedOperations remains validation-safe
- no start endpoint contacted
- OpenCode not started

### Step 7 — Record evidence

Record:

- files changed
- test/typecheck output
- capability observation
- safety result
- commit hash

## Required Verification

Verification must show:

- metadata fields are present
- values match FP-MCP-106 requirements
- supportedOperations remain validation-safe
- start remains not callable
- executionEnabled remains false
- runnerExecutionEnabled remains false or absent
- opencodeExecutionEnabled remains false or absent
- startEndpointContacted is false or not applicable
- opencodeStarted is false or not applicable
- no runnerRunId created
- no approval created
- no approval consumed

## Evidence

Record:

- `runs/FP-MCP-107/manual-implementation-procedure.md`
- `runs/FP-MCP-107/verification.txt`

If implementation is performed in the same packet, also record:

- `runs/FP-MCP-107/executor-result.md`
- test/typecheck output
- capability observation output

## Success Criteria

This packet is successful if:

1. The manual implementation procedure is defined.
2. The exact target metadata fields are listed.
3. The required safety invariants are explicit.
4. The verification steps are explicit.
5. No execution is started.
6. No runner start endpoint is contacted.
7. OpenCode is not started.
8. The next implementation action is clear.

## Non-goals

This packet does not implement the metadata fields by itself.

This packet does not implement a start endpoint.

This packet does not make start callable.

This packet does not authorize execution.

This packet does not create approval evidence.

This packet does not consume approval.

This packet does not relax the disable switch.

This packet does not enable runner execution.

This packet does not enable OpenCode execution.

This packet does not perform a remote runner start.
