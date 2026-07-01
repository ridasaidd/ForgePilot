# FP-MCP-146 DESIGN_ONLY Execution Result

**Packet**: FP-MCP-146  
**Request**: REQ-20260701T133309176Z-34bc6ab3  
**Runner Run**: RUN-20260701T133341720Z-0d7af9f0  
**Model**: deepseek-v4-pro-high  
**Run Mode**: DESIGN_ONLY  

## Execution Summary

The design analysis of the MCP bridge codebase in `forgepilot-chatgpt-mcp` is complete. The implementation changes required for FP-MCP-146 have been fully specified.

## Key Findings

### Current State
The MCP bridge (`src/server.ts`) has a well-structured `startRemoteRunnerRequest` function that:
- Validates request artifacts
- Checks approval evidence
- Evaluates disable switch status
- Validates pre-start evidence and state snapshots
- Validates human approval evidence
- Calls the runner's `POST /runner/start-run` endpoint
- Returns a structured response

### Missing Capabilities (to be added by this packet)
1. **No `targetWorkspaceId` support** — the start request body does not include workspace routing
2. **No commit-binding fields in response** — `controlRepoCommit` and `targetWorkspaceCommit` are not surfaced
3. **No workspace capability surface** — runner status doesn't expose `supportedWorkspaces`, `workspaceRoutingEnabled`, `commitBindingEnabled`, `taskBundleStagingEnabled`
4. **No task bundle fields** — `taskBundleCreated`, `taskBundlePath`, `taskBundleRelativePath` not in response
5. **No evidence path fields** — `preStartEvidencePath`, `postStartEvidencePath` not in response

## Required Changes (9 total)

| # | Location | Description |
|---|----------|-------------|
| 1 | `startRemoteRunnerRequest()` signature | Add `targetWorkspaceId?: string` parameter |
| 2 | New helper | `isValidTargetWorkspaceId()` with fail-closed behavior |
| 3 | Start request body | Forward `targetWorkspaceId` to runner |
| 4 | Response parsing | Extract 10 new fields from runner response |
| 5 | `baseStartRemoteRunnerResult()` | Add new params with null defaults |
| 6 | Tool registration | Add `targetWorkspaceId` input, pass to function |
| 7 | `getRemoteRunnerStatus()` | Parse workspace routing capabilities |
| 8 | `ForgePilotRemoteRunnerStatusOutputSchema` | Add capability fields |
| 9 | `ForgePilotStartRemoteRunnerRequestOutputSchema` | Add response fields |

## Safety Properties Preserved

- No direct OpenCode execution (bridge calls runner only)
- No arbitrary workspace paths (validated against ALLOWED_WORKSPACE_IDS)
- Runner remains the only execution boundary
- Explicit approval required (START_REMOTE_RUNNER_REQUEST)
- DESIGN_ONLY run mode preserved
- Fail-closed for unknown workspace ids
- No request artifact mutation
- No secret exposure
- controlRepoCommit not treated as target commit
- Evidence not moved from ForgePilot

## Verification

The design is verifiable through:
1. `pnpm build` (TypeScript compilation) passes
2. Schema validation ensures all new fields are typed
3. Existing tools continue to function (no regressions)
4. New `targetWorkspaceId` field accepted and forwarded
5. Response preserves all required runner fields
