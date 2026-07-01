# FP-MCP-152 — Workspace State Snapshot

## Task

Define and implement a first-class workspace state snapshot capability for the GPT-facing MCP bridge.

## Goal

Give GPT a safe, repeatable way to observe the current server workspace state before planning, implementing, or handing off work.

The snapshot must capture operational context without requiring ad hoc shell probes for every session.

## Background

Recent FP-MCP work established that the server itself is part of the ForgePilot workspace, not merely a place where repositories live.

Relevant live workspace components include:

- ForgePilot repository,
- ForgePilot ChatGPT MCP bridge repository,
- MCP bridge service,
- private runner service,
- legacy OpenCode server,
- GPT house directory,
- git cleanliness,
- relevant process and listener state,
- recent packet/run evidence context.

FP-MCP-151 made terminal execution safer. FP-MCP-152 should now reduce reliance on repeated manual terminal probes by creating a structured snapshot artifact.

## Scope

Implement a read-only MCP capability in:

`/home/ridasaidd/forgepilot-chatgpt-mcp`

The capability should create or return a structured workspace snapshot covering the known ForgePilot workspace.

## Required Tool

Add a GPT-facing MCP tool:

`forgepilot_capture_workspace_snapshot`

The tool must be explicitly approved with:

`CAPTURE_WORKSPACE_SNAPSHOT`

## Required Inputs

- `packetId?: string`
- `includeProcesses?: boolean`
- `includeListeners?: boolean`
- `includeRecentEvidence?: boolean`
- `approval: "CAPTURE_WORKSPACE_SNAPSHOT"`

Defaults:

- `includeProcesses: true`
- `includeListeners: true`
- `includeRecentEvidence: true`

## Required Output

The tool must return structured JSON including:

- snapshot id,
- capture timestamp,
- ForgePilot repo branch, commit, cleanliness, short status,
- MCP bridge repo branch, commit, cleanliness, short status,
- MCP bridge service active state,
- private runner service active state if observable,
- legacy OpenCode server process presence,
- relevant listener summary,
- GPT house presence,
- latest packet files,
- latest run directories,
- recent evidence files when requested,
- snapshot artifact path.

## Artifact Requirements

The tool must write an append-only snapshot artifact under:

`/home/ridasaidd/forgepilot/runs/<packetId-or-OPERATOR>/workspace-snapshots/`

Artifact filename format:

`SNAPSHOT-<timestamp>-<shortHash>.json`

The artifact must contain the same structured data returned by the tool.

## Safety Requirements

The tool must be read-only except for writing its own snapshot artifact.

It must not:

- execute arbitrary user-provided shell,
- stop or restart services,
- kill processes,
- mutate repositories,
- inspect raw secret files,
- read raw OpenCode session content,
- copy application state directories.

## Evidence and Trust Semantics

A workspace snapshot is an observation, not proof of success.

It may be used for:

- session orientation,
- pre-work checks,
- handoff context,
- detecting dirty repositories,
- deciding whether a packet can start.

It must not be treated as admitted evidence for model performance or routing decisions by itself.

## Non-Goals

This packet does not implement:

- OpenCode worker invocation,
- OpenCode telemetry capture,
- SQLite persistence,
- routing decisions,
- admission logic,
- dashboard/reporting UI,
- external monitoring.

## Acceptance Criteria

1. MCP bridge build passes.
2. Tool `forgepilot_capture_workspace_snapshot` is exposed.
3. Tool refuses when approval is not exactly `CAPTURE_WORKSPACE_SNAPSHOT`.
4. Tool creates a snapshot artifact under the expected packet run directory.
5. Tool returns the snapshot id and artifact path.
6. Snapshot includes ForgePilot repo state.
7. Snapshot includes MCP bridge repo state.
8. Snapshot includes MCP bridge service state.
9. Snapshot includes legacy OpenCode process/listener observation when requested.
10. Snapshot includes GPT house presence.
11. Tool does not mutate either git repository except for the snapshot artifact in ForgePilot.
12. ForgePilot and bridge repositories are clean after recording implementation evidence.

## Verification Requirements

After implementation, verify at minimum:

- `pnpm build` in the bridge repository,
- tool schema is visible through MCP discovery,
- a valid snapshot capture works for `FP-MCP-152`,
- invalid approval is rejected,
- snapshot artifact exists and is valid JSON,
- returned repo cleanliness matches git status,
- MCP bridge service remains active,
- legacy OpenCode server is not stopped or restarted.

## Expected Result

GPT gains a safe first-class workspace observation tool.

This reduces repeated ad hoc terminal probing and prepares the system for FP-MCP-153 first-class OpenCode worker invocation.
