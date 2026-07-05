# FP-MCP-367 — Bubblewrap sandboxed command execution design

## Checkpoint Type

    MCP_DESIGN_PACKET

## Summary

This packet records the design direction for using bubblewrap as a lightweight sandboxing layer for future ForgePilot MCP command execution.

The purpose is to avoid direct host terminal access while preserving a path toward bounded, evidence-producing diagnostic command execution.

This is a design-only checkpoint.

No bridge implementation, tool exposure, service restart, command execution, or bubblewrap invocation is performed by this packet.

## Claim

    ForgePilot should use bubblewrap for future sandboxed command execution, but only behind explicit gates, copied workspaces, no-network defaults, strict mount policy, output limits, audit artifacts, and non-admission-by-default evidence rules.

## Design Artifact

    docs/mcp/bubblewrap-sandboxed-command-design.md

## Core Position

The future MCP tool should not be a general terminal tool.

Preferred future name:

    forgepilot_execute_sandboxed_command

Rejected framing:

    forgepilot_execute_terminal_command

The tool must communicate that execution occurs inside a constrained sandbox, not directly on the Raspberry Pi host.

## Rationale

The server host is a Raspberry Pi 5.

Full machine virtualization is undesirable for this environment.

Bubblewrap is lightweight enough for the host and can provide a practical disposable command sandbox.

However, bubblewrap is not a full virtual machine. It shares the host kernel and must therefore be treated as risk reduction, not absolute safety.

## Required Boundaries

The future sandboxed command system must:

- avoid direct host repository mutation
- operate on copied workspaces
- avoid broad host mounts
- avoid host secrets
- avoid Docker socket exposure
- avoid privileged execution
- disable network by default
- enforce time and output limits
- record artifacts
- require explicit approval before execution
- keep execution tools out of ChatGPT-safe/default visibility

## Initial Surface Recommendation

Future execute tool:

    surface: gated
    sideEffectClass: EXECUTION or SANDBOXED_WRITE
    readOnlyHint: false
    destructiveHint: true
    openWorldHint: false when network disabled
    idempotentHint: false

The execution tool must not be ChatGPT-safe/default.

## Proposed Capability Split

Future design should prefer separate tools:

    forgepilot_preview_sandboxed_command
    forgepilot_execute_sandboxed_command
    forgepilot_read_sandboxed_command_result

The preview and read-result tools may become read-only surfaces if they do not execute commands and do not create artifacts.

The execute tool remains gated.

## Recommended Follow-On Sequence

    FP-MCP-368 — Bubblewrap availability and capability diagnostic
    FP-MCP-369 — Sandboxed command preview artifact
    FP-MCP-370 — Gated sandboxed command execution implementation
    FP-MCP-370A — Runtime validation without ChatGPT-safe execution exposure
    FP-MCP-371 — Sandboxed command output evidence recording

## Non-Goals

This packet does not:

- implement a sandbox runner
- expose a command execution MCP tool
- execute bubblewrap
- change MCP surface contracts
- add, remove, or rename MCP tools
- change approval behavior
- start OpenCode
- contact a runner
- clear a disable switch
- consume approval
- run FP-027 canary

## Non-Execution Boundary

    execution authorized: false
    approval consumed: false
    disable switch cleared: false
    runner start endpoint contacted: false
    OpenCode started: false
    FP-027 canary run: false

## Expected Result

    FP-MCP-367 establishes bubblewrap-backed sandboxed command execution as the preferred future direction while preserving the current non-execution MCP boundary.
