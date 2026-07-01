# FP-MCP-143 — Target Workspace Routing for MCP v1 Runner Starts

## Type

Implementation packet.

## Goal

Add allowlisted target workspace routing to the MCP v1 runner start path.

The runner currently launches OpenCode with the ForgePilot repository as the working directory:

    /home/ridasaidd/forgepilot

That works for ForgePilot-local packets, but FP-MCP bridge implementation tasks target a separate repository:

    /home/ridasaidd/forgepilot-chatgpt-mcp

The first real MCP v1 runner start proved that the GPT to runner to OpenCode to DeepSeek path works, but the run could not complete because OpenCode treated the MCP bridge repository as an external directory and rejected access.

This packet adds a narrow routing abstraction so OpenCode can be launched in the correct target workspace while all evidence continues to be recorded in the ForgePilot repository.

## Required Behavior

Add support for a `targetWorkspaceId` value on guarded runner start requests.

The runner must resolve `targetWorkspaceId` through a local allowlist.

Allowed workspace IDs for this packet:

    forgepilot
    forgepilot-chatgpt-mcp

Resolved paths:

    forgepilot -> /home/ridasaidd/forgepilot
    forgepilot-chatgpt-mcp -> /home/ridasaidd/forgepilot-chatgpt-mcp

The runner must pass the resolved workspace path to OpenCode using:

    opencode run --dir <resolved target workspace>

Evidence artifacts must continue to be written under the ForgePilot repository:

    /home/ridasaidd/forgepilot/runs/...

## Required Constraints

The implementation must not accept arbitrary filesystem paths from request artifacts or start request bodies.

The implementation must not allow path traversal.

The implementation must not allow unlisted workspace IDs.

The implementation must not move ForgePilot evidence directories into the target workspace.

The implementation must not weaken existing request artifact validation.

The implementation must not introduce PATCH or APPLY execution modes.

The implementation must preserve DESIGN_ONLY as the only supported run mode.

The implementation must preserve the existing model allowlist.

The implementation must preserve pre-start and post-start evidence recording.

The implementation must record the selected `targetWorkspaceId` and resolved OpenCode working directory in post-start evidence.

## Expected Start Request Shape

A guarded start request may include this field:

    targetWorkspaceId: forgepilot-chatgpt-mcp

Example request body:

    {
      "packetId": "FP-MCP-134",
      "requestId": "REQ-20260630T202005438Z-86d20df4",
      "requestArtifactPath": "runs/FP-MCP-134/opencode-requests/REQ-20260630T202005438Z-86d20df4.json",
      "requestArtifactSha256": "29ab31f1e7db899539bafb8775b5e08ffdd58d6884afe7d001b24ed210283dcb",
      "baseCommit": "bbf930a",
      "targetWorkspaceId": "forgepilot-chatgpt-mcp"
    }

If `targetWorkspaceId` is omitted, the runner must default to:

    forgepilot

## Expected Evidence

The post-start evidence artifact must include fields equivalent to:

    {
      "targetWorkspaceId": "forgepilot-chatgpt-mcp",
      "opencodeWorkingDirectory": "/home/ridasaidd/forgepilot-chatgpt-mcp"
    }

The OpenCode arguments must include:

    opencode run --dir /home/ridasaidd/forgepilot-chatgpt-mcp

## Verification Requirements

Verification must show:

1. `node --check runner/server.mjs` passes.
2. Runner capabilities still report guarded start callable when execution is enabled.
3. A start request with no `targetWorkspaceId` uses `/home/ridasaidd/forgepilot`.
4. A start request with `targetWorkspaceId: forgepilot-chatgpt-mcp` uses `/home/ridasaidd/forgepilot-chatgpt-mcp`.
5. A start request with an unknown workspace ID is rejected.
6. No arbitrary raw workspace path is accepted.
7. Evidence is still written under `/home/ridasaidd/forgepilot/runs/...`.

## Success Criteria

This packet succeeds when the runner can launch OpenCode in an allowlisted target workspace while preserving ForgePilot as the evidence/control repository.

## Failure Criteria

This packet fails if:

- arbitrary paths are accepted,
- evidence is written outside ForgePilot,
- existing validation is weakened,
- DESIGN_ONLY constraints are weakened,
- OpenCode cannot still be launched for the default ForgePilot workspace,
- or the runner cannot reject an unknown workspace ID.
