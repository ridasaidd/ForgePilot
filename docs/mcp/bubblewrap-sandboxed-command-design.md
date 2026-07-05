# Bubblewrap Sandboxed Command Execution Design

## Purpose

ForgePilot may eventually need a controlled way to run diagnostic commands without giving ChatGPT direct terminal access to the host server.

The intended direction is not host terminal execution.

The intended direction is sandboxed command execution inside a disposable bubblewrap environment.

This design treats bubblewrap as a lightweight factory test cell for the Raspberry Pi 5 host.

## Core Distinction

Host terminal access and sandboxed command execution are different capabilities.

Host terminal access can mutate the real server, real repositories, service state, secrets, and runtime environment.

Sandboxed command execution should operate only inside a copied workspace with constrained visibility, no host write access, and explicit artifact export.

## Factory Analogy

The Raspberry Pi host is the factory building.

The real ForgePilot repositories are production inventory.

The MCP bridge is the control panel.

GPT is the control-room engineer.

Worker models and command runners are factory workers.

Bubblewrap provides a sealed test cell.

A worker may make a mess inside the test cell, but must not be able to damage the factory building, the production inventory, the master keys, or the control room.

## Proposed Tool Name

The future tool should be named:

    forgepilot_execute_sandboxed_command

It should not be named:

    forgepilot_execute_terminal_command

The name must communicate that execution occurs inside a sandbox, not directly on the host.

## Initial Surface Classification

The future tool must not be ChatGPT-safe/default.

Initial classification should be:

    surface: gated
    sideEffectClass: EXECUTION or SANDBOXED_WRITE
    readOnlyHint: false
    destructiveHint: true
    openWorldHint: false when network is disabled
    idempotentHint: false

The tool should require explicit approval before command execution.

## Required Non-Goals

The sandboxed command system must not:

- expose direct host shell access
- mount the real ForgePilot repository read-write
- mount /home broadly
- mount ~/.ssh
- mount ~/.config
- mount secrets
- mount /var/run/docker.sock
- run privileged
- start OpenCode
- contact the runner start endpoint
- consume ForgePilot execution approval
- clear disable switches
- run FP-027 canary
- mutate the real repository directly
- silently admit sandbox output as evidence

## Workspace Model

The host should create a temporary sandbox workspace.

The real repository should be copied into the sandbox workspace.

The sandbox should operate on the copy only.

Example conceptual mapping:

    host real repo:
      /home/ridasaidd/forgepilot

    sandbox copy:
      /tmp/forgepilot-sandbox-*/workspace

    inside bubblewrap:
      /workspace

No command inside the sandbox should receive write access to the real repository.

## Filesystem Policy

Allowed:

- copied workspace mounted read-write as /workspace
- private /tmp
- private /proc if required
- read-only system paths needed to execute basic commands
- read-only node/pnpm paths if required
- explicit artifact export directory, preferably append-only or copied out after execution

Forbidden:

- host root mounted read-write
- real repository mounted read-write
- broad /home mount
- SSH keys
- user config directories
- systemd control sockets
- Docker socket
- secrets
- credential stores
- arbitrary host device mounts

## Network Policy

Default network policy:

    network disabled

Network access should require a separate explicit packet and approval.

A no-network sandbox should use:

    openWorldHint: false

A future network-enabled sandbox would require:

    openWorldHint: true
    explicit packet authorization
    domain or endpoint policy
    additional prompt-injection and data-leakage controls

## Resource Limits

The sandbox runner should enforce:

- timeout
- maximum stdout size
- maximum stderr size
- maximum combined output size
- maximum filesystem artifact size
- CPU limit where feasible
- memory limit where feasible
- process/PID limit where feasible

Resource exhaustion should be classified as sandbox failure, not host failure.

## Command Policy

The first implementation should be conservative.

Initial allowed command categories:

- pwd
- ls
- git status
- git diff --stat
- git diff --name-only
- node scripts/check-tool-contracts.mjs
- node scripts/check-hardcoded-packet-ids.mjs
- pnpm build
- pnpm test
- pnpm exec tsx known-script.ts

Initial forbidden command categories:

- sudo
- su
- ssh
- scp
- curl
- wget
- docker
- podman
- systemctl
- journalctl against host services
- broad chmod/chown
- destructive commands against non-workspace paths
- commands that attempt to inspect secrets
- commands that attempt to escape the sandbox

The command policy should be explicit and machine-validated.

## Artifact Policy

Every sandbox run should produce an artifact record containing:

- packet id
- request id
- command
- working directory
- sandbox id
- sandbox policy version
- start time
- end time
- timeout status
- exit code
- stdout excerpt
- stderr excerpt
- output truncation markers
- changed file summary inside sandbox
- exported artifact paths
- non-execution boundary fields
- hash of copied workspace input if feasible
- hash of exported artifacts if feasible

Sandbox outputs are observations.

They are not admitted evidence until a later gate admits them.

## Approval Model

The future execution flow should be:

1. GPT observes state.
2. GPT proposes a sandboxed command.
3. MCP validates the command against policy.
4. MCP creates a preview artifact.
5. User approves the sandbox run.
6. MCP executes the command inside bubblewrap.
7. MCP records output artifacts.
8. GPT audits output.
9. A separate gate decides whether anything crosses into the real repository.

No command should execute merely because GPT generated it.

## MCP Tool Split

The design should prefer capability separation:

    forgepilot_preview_sandboxed_command
      read-only, creates no command execution

    forgepilot_execute_sandboxed_command
      gated, requires approval, executes inside bubblewrap

    forgepilot_read_sandboxed_command_result
      read-only, reads artifacts

The preview tool may eventually be ChatGPT-safe if it is purely read-only and creates no artifacts.

The execute tool must remain gated.

## Safety Principle

Bubblewrap protects the host from the command.

ForgePilot protects the project from trusting the command result.

Both are required.

## Initial Implementation Recommendation

Do not implement execution immediately.

First implement a diagnostic packet to confirm bubblewrap availability and capabilities.

Then implement a preview-only request artifact.

Only after that implement gated sandbox execution.

## Recommended Packet Sequence

    FP-MCP-367 — Bubblewrap sandboxed command execution design
    FP-MCP-368 — Bubblewrap availability and capability diagnostic
    FP-MCP-369 — Sandboxed command preview artifact
    FP-MCP-370 — Gated sandboxed command execution implementation
    FP-MCP-370A — Runtime validation without ChatGPT-safe execution exposure
    FP-MCP-371 — Sandboxed command output evidence recording

## Final Position

ForgePilot should use bubblewrap in the MCP, but not as direct terminal access.

The correct abstraction is a gated, disposable, evidence-producing sandboxed command runner.

The command runner should operate on copied workspaces, not production repositories.

The safe/default ChatGPT surface should remain observational.
