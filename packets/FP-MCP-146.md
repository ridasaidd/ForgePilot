# FP-MCP-146 — MCP Bridge Surface for Runner Commit Binding and Starts

## Type

Implementation packet.

## Goal

Update the GPT-facing MCP bridge so it can surface FP-MCP-145 runner commit-binding fields and start guarded OpenCode runs without requiring manual shell scripts.

FP-MCP-145 completed the runner-side distinction between:

    controlRepoCommit
    targetWorkspaceCommit

This packet completes the bridge-facing surface so GPT can use the OpenCode harness through MCP while preserving the runner's safety boundaries.

## Background

The FP-MCP-145 verification run against `forgepilot-chatgpt-mcp` showed:

    controlRepoCommit: b37024e
    targetWorkspaceId: forgepilot-chatgpt-mcp
    targetWorkspaceCommit: 22e99d9

The runner correctly staged:

    packet.md
    request.json
    context.json
    instructions.md
    outputs/

The runner also instructed the worker not to resolve `controlRepoCommit` inside the target workspace and to use `targetWorkspaceCommit` for target repo git comparisons.

However, the MCP bridge still needs to expose this runner capability to GPT-facing tools.

## Target Repository

The implementation target is:

    /home/ridasaidd/forgepilot-chatgpt-mcp

The ForgePilot control/evidence repository remains:

    /home/ridasaidd/forgepilot

## Required Behavior

The MCP bridge must expose enough start-run functionality for GPT to request a guarded OpenCode run through the private runner.

The MCP bridge must not execute shell commands directly.

The MCP bridge must call the existing guarded runner endpoint:

    POST http://127.0.0.1:8791/runner/start-run

using the configured runner token.

## Required Tool Surface

The existing MCP start tool may be updated, or a new tool may be added.

The GPT-facing tool must support:

    packetId
    requestId
    approval
    targetWorkspaceId

The approval string must remain explicit and must equal:

    START_REMOTE_RUNNER_REQUEST

The bridge must preserve existing validation around packet id and request id.

The bridge must compute or forward:

    requestArtifactPath
    requestArtifactSha256
    baseCommit

The bridge must send to the runner:

    packetId
    requestId
    requestArtifactPath
    requestArtifactSha256
    baseCommit
    targetWorkspaceId
    boundaryVersion

## Required Response Fields

The MCP tool response must preserve and return runner response fields including:

    runnerRunId
    artifactDir
    controlRepoCommit
    targetWorkspaceId
    targetWorkspaceCommit
    opencodeWorkingDirectory
    taskBundleCreated
    taskBundlePath
    taskBundleRelativePath
    preStartEvidencePath
    postStartEvidencePath
    requestArtifactMutated
    executionStarted
    opencodeStarted
    reasons

The MCP bridge must not collapse these fields into a narrative summary only.

## Required Capabilities Surface

The MCP bridge remote runner status or capabilities response should expose runner fields when available:

    supportedWorkspaces
    defaultWorkspace
    workspaceRoutingEnabled
    commitBindingEnabled or equivalent
    taskBundleStagingEnabled or equivalent
    supportedRunModes
    allowedModels
    startEndpointState
    startCapabilityCallable

If adding new boolean names, they must be observational capability flags only. They must not imply trust or admission.

## Required Evidence Behavior

The MCP bridge must not move evidence out of ForgePilot.

Runner evidence remains under:

    /home/ridasaidd/forgepilot/runs/<packet>/<model>-<runMode>/

Task bundle scratch space remains under the target workspace:

    <targetWorkspace>/.forgepilot/tasks/<runnerRunId>/

The MCP bridge may report paths returned by the runner, but it must not mutate runner evidence.

## Required Constraints

The implementation must not weaken runner authentication.

The implementation must not accept arbitrary target workspace paths.

The implementation must not bypass the runner.

The implementation must not start OpenCode directly.

The implementation must not mutate request artifacts.

The implementation must preserve DESIGN_ONLY as the only supported run mode.

The implementation must preserve explicit approval.

The implementation must preserve fail-closed behavior for unknown workspace ids.

The implementation must not expose secrets, tokens, or environment contents.

The implementation must not treat `controlRepoCommit` as a target workspace commit.

## Verification Requirements

Verification must show:

1. MCP bridge typecheck/test or equivalent check passes.
2. Existing MCP bridge tools continue to work.
3. The MCP start tool accepts `targetWorkspaceId`.
4. The MCP start tool forwards `targetWorkspaceId` to the runner.
5. The MCP start tool response includes `controlRepoCommit`.
6. The MCP start tool response includes `targetWorkspaceCommit`.
7. The MCP start tool response includes `opencodeWorkingDirectory`.
8. The MCP start tool response includes task bundle fields.
9. Unknown workspace ids remain rejected.
10. Request artifacts remain unmutated.
11. The bridge does not start OpenCode directly.
12. The runner remains the only execution boundary.

## Success Criteria

This packet succeeds when GPT can use the MCP bridge to start a guarded runner OpenCode run with target workspace routing and commit-binding fields preserved in the response.

## Failure Criteria

This packet fails if:

- the bridge starts OpenCode directly,
- the bridge accepts arbitrary workspace paths,
- the bridge drops commit-binding fields,
- the bridge hides runner rejection reasons,
- request artifacts are mutated,
- runner authentication is weakened,
- or execution is allowed without explicit approval.
