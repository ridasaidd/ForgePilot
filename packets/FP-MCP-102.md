# FP-MCP-102 — Local Guarded Preflight Fallback Command Implementation

## Task

Implement a local non-executing guarded preflight fallback command for cases where the MCP preflight tool invocation is blocked before reaching ForgePilot.

## Goal

Allow ForgePilot to produce structured guarded preflight evidence from the local CLI without relying on MCP tool transport.

This packet answers one question:

Can ForgePilot observe guarded execution preflight locally, without starting execution, when the MCP preflight tool call is unavailable?

## Background

FP-MCP-100 attempted to observe guarded execution preflight for the FP-MCP-099 request artifact.

The MCP preflight tool call was blocked before reaching ForgePilot.

FP-MCP-101 clarified that this is not a ForgePilot preflight failure and not a ForgePilot preflight blocker. It is a transport/platform invocation block.

FP-MCP-101 defined a local CLI fallback evidence contract.

The next smallest implementation step is to add a local non-executing command or script that emits structured preflight evidence.

## Scope

Allowed:

- Add a local CLI command or script for guarded preflight fallback.
- Reuse existing guarded preflight validation logic where possible.
- Emit a structured JSON artifact.
- Emit a human-readable Markdown summary if useful.
- Record the command invoked.
- Record repository status.
- Record request artifact identity.
- Record execution safety fields.
- Record gate states and reasons.
- Add tests or verification.
- Record evidence under `runs/FP-MCP-102/`.

Forbidden:

- Do not enable execution.
- Do not relax the global disable switch.
- Do not contact the runner start endpoint.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create a runner run id.
- Do not create approval evidence.
- Do not consume approval.
- Do not mutate request artifacts.
- Do not mutate approval artifacts.
- Do not mutate consumption artifacts.
- Do not change model routing or selection.
- Do not implement FP-MCP-099 target/evidence-ledger fields beyond what is necessary to support fallback observation.

## Required Command Behavior

The command must run locally on the ForgePilot host.

The command must accept:

- packet id
- request id
- output path

The command should be shaped approximately as:

    pnpm fp -- validate-execution-preflight \
      --packet FP-MCP-099 \
      --request REQ-20260630T115752019Z-25b7c1b8 \
      --output runs/FP-MCP-102/local-preflight.json

The exact command name may differ if the existing CLI structure requires it.

## Required Artifact Fields

The JSON artifact must include:

- schemaVersion
- packetId
- requestId
- source: local CLI fallback
- transport: local shell
- fallbackUsed: true
- fallbackReason: MCP_PREFLIGHT_TOOL_CALL_BLOCKED_BEFORE_FORGEPILOT
- mcpToolObserved: false
- command
- repoPath
- repoCommit
- workingTreeClean
- requestArtifactPath
- requestArtifactSha256
- modelId
- runMode
- executionAllowedNow
- executionPermitted
- executionStarted
- startEndpointContacted
- opencodeStarted
- runnerRunId
- runnerCapabilitiesContacted
- validateRequestContacted
- gates
- reasons
- checkedAt

## Required Safety Values

Unless existing gates unexpectedly permit otherwise, the fallback output must preserve:

- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false
- runnerRunId: null
- no approval created
- no approval consumed

## Required Verification

Verification must show:

- command runs locally
- JSON artifact is written
- JSON artifact is parseable
- request artifact identity is recorded
- repo commit is recorded
- working tree state is recorded
- executionStarted is false
- startEndpointContacted is false
- opencodeStarted is false
- no runner run id is created
- no approval is created
- no approval is consumed

## Evidence

Record:

- `runs/FP-MCP-102/executor-result.md`
- `runs/FP-MCP-102/verification.txt`
- `runs/FP-MCP-102/local-preflight.json`
- optional command output logs

## Success Criteria

This packet is successful if:

1. A local guarded preflight fallback command or script exists.
2. The fallback command writes structured JSON evidence.
3. The fallback artifact clearly identifies itself as local CLI fallback evidence.
4. The fallback preserves non-execution safety invariants.
5. Verification passes.
6. No execution is started.
7. No runner start endpoint is contacted.
8. OpenCode is not started.

## Non-goals

This packet does not authorize execution.

This packet does not create approval evidence.

This packet does not consume approval.

This packet does not relax the disable switch.

This packet does not enable runner execution.

This packet does not enable OpenCode execution.

This packet does not perform a remote runner start.

This packet does not implement the full FP-MCP-099 targetExecutionCommit/evidenceLedgerCommit field contract.
