# FP-MCP-144 — Target Workspace Task Bundle for MCP v1 Runner Starts

## Type

Implementation packet.

## Goal

Add target workspace task bundle staging to the MCP v1 runner start path.

FP-MCP-143 allowed the runner to launch OpenCode in an allowlisted target workspace. That fixed the external-directory blocker for MCP bridge tasks.

However, the next retry of FP-MCP-134 showed a new boundary issue: when OpenCode runs inside the target workspace, it cannot read the ForgePilot packet file from the control/evidence repository.

This packet adds a narrow staging abstraction.

The runner must copy the task context needed by OpenCode into the target workspace before launching OpenCode.

## Problem Observed

The runner successfully launched OpenCode with:

    --dir /home/ridasaidd/forgepilot-chatgpt-mcp

The runner correctly recorded:

    targetWorkspaceId: forgepilot-chatgpt-mcp
    opencodeWorkingDirectory: /home/ridasaidd/forgepilot-chatgpt-mcp

But OpenCode failed to read:

    /home/ridasaidd/forgepilot/packets/FP-MCP-134.md

because that file is outside the OpenCode workspace boundary.

## Required Behavior

For every guarded runner start, the runner must create a task bundle inside the resolved OpenCode working directory before spawning OpenCode.

Task bundle path:

    <opencodeWorkingDirectory>/.forgepilot/tasks/<runnerRunId>/

Required files:

    packet.md
    request.json
    instructions.md
    outputs/

The runner must write:

    packet.md       copy of the ForgePilot packet file
    request.json    copy of the request artifact JSON
    instructions.md execution instructions for OpenCode
    outputs/        directory where the worker model should place artifacts

OpenCode must be instructed to read the staged local instructions file instead of directly reading packets/<packetId>.md from the ForgePilot repository.

## Required Prompt Change

The OpenCode prompt should include the local task bundle path.

Instead of only saying:

    Read packets/<packetId>.md and produce the requested artifacts.

It should say:

    Read .forgepilot/tasks/<runnerRunId>/instructions.md.
    The packet has been staged at .forgepilot/tasks/<runnerRunId>/packet.md.
    The request artifact has been staged at .forgepilot/tasks/<runnerRunId>/request.json.
    Write outputs to .forgepilot/tasks/<runnerRunId>/outputs/.
    Do not read outside the current workspace.
    Do not expose secrets.
    Preserve ForgePilot evidence discipline.

## Required Evidence

The runner pre-start or post-start evidence must include:

    taskBundleCreated: true
    taskBundlePath: <absolute bundle path>
    taskBundleRelativePath: .forgepilot/tasks/<runnerRunId>
    taskBundleFiles:
      - packet.md
      - request.json
      - instructions.md
      - outputs/

The start response must include:

    taskBundleCreated
    taskBundlePath
    taskBundleRelativePath

## Required Constraints

The implementation must not allow arbitrary task bundle paths.

The implementation must not allow path traversal.

The task bundle must always be under:

    <opencodeWorkingDirectory>/.forgepilot/tasks/<runnerRunId>/

The task bundle must be derived from runner-controlled values, not user-supplied paths.

The runner must not copy secrets.

The runner must not weaken request artifact validation.

The runner must not change supported run modes.

The runner must preserve DESIGN_ONLY as the only allowed run mode.

The runner must preserve target workspace allowlisting from FP-MCP-143.

The runner must preserve ForgePilot as the evidence/control repository.

## Output Collection

This packet does not need to implement full output ingestion.

It is sufficient for the worker model to write outputs under:

    .forgepilot/tasks/<runnerRunId>/outputs/

A later packet may add output collection back into ForgePilot evidence.

## Verification Requirements

Verification must show:

1. `node --check runner/server.mjs` passes.
2. Starting a default ForgePilot workspace run creates a task bundle under `/home/ridasaidd/forgepilot/.forgepilot/tasks/<runnerRunId>/`.
3. Starting a `forgepilot-chatgpt-mcp` workspace run creates a task bundle under `/home/ridasaidd/forgepilot-chatgpt-mcp/.forgepilot/tasks/<runnerRunId>/`.
4. The staged `packet.md` exists and contains the packet content.
5. The staged `request.json` exists and contains the request artifact content.
6. The staged `instructions.md` exists and tells OpenCode to use the local staged files.
7. Unknown workspace IDs remain rejected.
8. Evidence still records under `/home/ridasaidd/forgepilot/runs/...`.

## Success Criteria

This packet succeeds when OpenCode can be launched in an allowlisted target workspace and can read all required task context from local staged files inside that workspace.

## Failure Criteria

This packet fails if:

- OpenCode must read ForgePilot packet files through external directory access,
- arbitrary bundle paths are accepted,
- task bundles are written outside the resolved target workspace,
- request validation is weakened,
- target workspace allowlisting is weakened,
- evidence is no longer recorded under ForgePilot,
- or DESIGN_ONLY constraints are weakened.
