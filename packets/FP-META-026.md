# FP-META-026 — Core, Instrument, and Observed Project Boundaries

## Task

Define the boundary between ForgePilot core packets, instrument projects, and observed projects.

## Goal

Prevent ForgePilot's root packet namespace from becoming mixed with project-specific work while preserving the special role of the MCP bridge as an instrument project.

FP-META-026 answers one question:

> Where should future work live when ForgePilot observes a project, including a project it depends on?

## Background

ForgePilot V1.0 is complete. The first post-V1 observation identified shadow refactoring pressure in the MCP bridge `src/server.ts`.

The MCP bridge is in a liminal state:

- it is not ForgePilot core logic,
- it is a separate repository,
- it is required for ChatGPT to operate ForgePilot through MCP,
- it should be observable as a project,
- but contract-changing bridge work may still require ForgePilot core governance.

## Scope

Add:

```text
docs/core-instrument-observed-project-boundaries.md
instrument-projects/forgepilot-chatgpt-mcp/README.md
```

Update:

```text
docs/packet-namespace-taxonomy.md
docs/packet-namespace-definition-of-done.md
docs/forgepilot-progress-checklist.md
```

## Required Rules

The document must define:

- ForgePilot core,
- instrument projects,
- external observed projects,
- where each kind of packet belongs,
- when MCP bridge work belongs in root ForgePilot packets,
- when MCP bridge work belongs in `instrument-projects/forgepilot-chatgpt-mcp/`,
- how pre-V1 `FP-MCP-*` packets should be treated,
- the initial project workspace layout.

## Required Boundary

ForgePilot root packets define the observatory.

Observed-project and instrument-project packets describe work being observed by the observatory.

## Safety Requirements

This packet must not refactor the MCP bridge, add MCP tools, change OpenAI Actions schema, create SQLite schema, implement routing, rank models, rename historical packets, move historical packets, or delete historical packets.

## Non-Goals

This packet does not start the shadow refactor, select models, execute model runs, define V2, or migrate historical packets.

## Acceptance Criteria

1. Boundary document exists.
2. Instrument project workspace root exists for `forgepilot-chatgpt-mcp`.
3. Root packet taxonomy references the new boundary.
4. Definition-of-done guidance references project-specific workspaces.
5. Progress checklist references the boundary.
6. Historical `FP-MCP-*` packets are classified without renaming or moving them.
7. No implementation code changes are made.
8. Final git status is clean after evidence is recorded.
