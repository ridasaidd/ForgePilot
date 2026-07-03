# FP-MCP-191 — Request Artifact Tool Contract Safety Alignment

## Task

Align the MCP request-artifact creation contract with OpenAI/MCP safety expectations by making the tool surface more truthful and less execution-authority-shaped without bypassing platform safety checks.

## Context

FP-MCP-187 observed a platform block on the first FP-MCP-183 fresh request-artifact creation attempt. FP-MCP-188 classified it as an enablement-adjacent platform block. FP-MCP-189 documented cadence and multi-command batching as plausible contributors. FP-MCP-190 diagnosed the bridge action contract and found that the tool was create-only and non-destructive, but not read-only, and had execution-adjacent language: `create`, `OpenCode run request`, `approval`, and `CREATE_REQUEST_ARTIFACT`.

The correct response is contract clarity, not bypass.

## Implementation

Bridge commit:

```text
679ef93 Clarify non-executing request artifact contract
```

Implemented changes in `/home/ridasaidd/forgepilot-chatgpt-mcp/src/server.ts`:

```text
1. Preserved the legacy forgepilot_create_opencode_run_request tool for compatibility.
2. Clarified the legacy tool description as a compatibility wrapper that records a non-executing local request artifact only.
3. Added forgepilot_record_non_executing_run_request_artifact as a clearer alias.
4. Added artifactRecordingConfirmation with literal RECORD_NON_EXECUTING_REQUEST_ARTIFACT.
5. Kept annotations honest: readOnlyHint false, destructiveHint false, idempotentHint false, openWorldHint false.
6. Added explicit output boundary fields: executionAuthorized false, runnerStartEndpointContacted false, opencodeStarted false, approvalConsumed false, artifactOnly true, requestArtifactOnly true.
7. Preserved server-side validation and execution-disable boundaries.
```

## Non-Bypass Boundary

This packet does not retry the blocked FP-MCP-183 request-creation call.

It does not rephrase a live call to evade a platform check.

It does not manually construct a request artifact.

It does not create approval evidence, consume approval evidence, contact the runner start endpoint, start OpenCode, or run the FP-027 canary.

## Verification

```text
pnpm build: PASS
```

## Expected Result

```text
FP_MCP_191_REQUEST_ARTIFACT_TOOL_CONTRACT_SAFETY_ALIGNED_SOURCE_VERIFIED_NO_LIVE_RETRY
```
