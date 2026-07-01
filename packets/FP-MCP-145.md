# FP-MCP-145 — Target Workspace Commit Binding for Cross-Repo Runner Starts

## Type

Implementation packet.

## Goal

Add explicit target workspace commit binding to the MCP v1 runner start path.

FP-MCP-143 added target workspace routing.

FP-MCP-144 added task bundle staging so OpenCode can read packet and request context from inside the target workspace.

The next FP-MCP-134 retry showed that cross-repository execution still needs separate commit identities.

The ForgePilot control/evidence repository commit is not necessarily a valid commit in the target workspace repository.

## Problem Observed

The FP-MCP-134 task-bundle retry successfully launched OpenCode in:

    /home/ridasaidd/forgepilot-chatgpt-mcp

and successfully staged task context at:

    /home/ridasaidd/forgepilot-chatgpt-mcp/.forgepilot/tasks/RUN-20260701T124239073Z-c2cae54f/

The worker read:

    instructions.md
    packet.md
    request.json

However, it attempted to inspect commit `bbf930a` inside the MCP bridge repository:

    git show bbf930a:src/server.ts

That failed because `bbf930a` belongs to the ForgePilot control/evidence repository, not the MCP bridge repository.

## Required Distinction

The runner must distinguish these commits:

    controlRepoCommit
      The ForgePilot repository commit used for packets, request artifacts, and evidence.

    targetWorkspaceCommit
      The git commit of the resolved target workspace where OpenCode is launched.

For same-repository runs, these may be the same commit.

For cross-repository runs, these are expected to differ.

## Required Behavior

For every guarded runner start, the runner must resolve and record:

    controlRepoCommit
    targetWorkspaceId
    targetWorkspaceCommit

The control repository is always:

    /home/ridasaidd/forgepilot

The target workspace is resolved from `targetWorkspaceId` using the existing FP-MCP-143 workspace allowlist.

The target workspace commit must be resolved by running git inside the target workspace:

    git rev-parse --short HEAD

The runner must include both commit values in:

    pre-start evidence
    post-start evidence
    start response
    task bundle request/context
    task bundle instructions

## Required Prompt / Instruction Change

The staged `instructions.md` must explicitly distinguish control and target commits.

It must include text equivalent to:

    The control repository is /home/ridasaidd/forgepilot.
    The control repository commit is <controlRepoCommit>.
    The target workspace is <targetWorkspaceId>.
    The target workspace path is <opencodeWorkingDirectory>.
    The target workspace commit is <targetWorkspaceCommit>.

    Do not resolve controlRepoCommit inside the target workspace.
    Use targetWorkspaceCommit for git comparisons inside the target workspace.

## Required Task Bundle Change

The staged `request.json` or an additional staged context file must include:

    controlRepoCommit
    targetWorkspaceId
    targetWorkspaceCommit
    opencodeWorkingDirectory

It is acceptable to add a new staged file:

    context.json

if that keeps request artifact immutability clearer.

## Required Evidence

Pre-start and post-start evidence must include:

    controlRepoCommit
    targetWorkspaceId
    targetWorkspaceCommit
    opencodeWorkingDirectory
    taskBundleCreated
    taskBundlePath
    taskBundleRelativePath

The start response must include:

    controlRepoCommit
    targetWorkspaceId
    targetWorkspaceCommit
    opencodeWorkingDirectory

## Required Constraints

The implementation must not mutate request artifacts.

The implementation must not weaken request artifact validation.

The implementation must not accept arbitrary target workspace paths.

The implementation must preserve FP-MCP-143 target workspace allowlisting.

The implementation must preserve FP-MCP-144 task bundle staging.

The implementation must preserve DESIGN_ONLY as the only supported run mode.

The implementation must fail closed if the target workspace commit cannot be resolved.

The implementation must not use controlRepoCommit as a target workspace commit.

The implementation must not require external directory reads by OpenCode.

## Verification Requirements

Verification must show:

1. `node --check runner/server.mjs` passes.
2. Existing runner tests pass with execution disabled.
3. Capabilities still report workspace routing enabled.
4. A default ForgePilot workspace start records a targetWorkspaceCommit.
5. A `forgepilot-chatgpt-mcp` workspace start records the bridge repo HEAD as targetWorkspaceCommit.
6. Task bundle instructions distinguish controlRepoCommit and targetWorkspaceCommit.
7. Unknown workspace IDs remain rejected.
8. Request artifacts remain unmutated.
9. Evidence remains recorded under `/home/ridasaidd/forgepilot/runs/...`.

## Success Criteria

This packet succeeds when cross-repository OpenCode runs receive both the ForgePilot control commit and the target workspace commit, and the worker is instructed not to confuse them.

## Failure Criteria

This packet fails if:

- controlRepoCommit is used as the target workspace commit,
- target workspace commit cannot be resolved but execution continues,
- arbitrary workspace paths are accepted,
- request artifacts are mutated,
- task bundle staging is weakened,
- evidence moves outside ForgePilot,
- or DESIGN_ONLY constraints are weakened.
