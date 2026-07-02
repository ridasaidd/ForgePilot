# FP-META-027 — Shadow Refactor Rules

## Task

Define project-agnostic shadow refactor rules for ForgePilot-observed projects.

## Goal

Allow high-risk refactors to be prepared beside live code without disrupting operational systems, while preserving verification, rollback, and evidence boundaries.

FP-META-027 answers one question:

> How may ForgePilot safely observe a refactor when the current implementation must remain operational?

## Background

The first V1 operational observation identified refactor pressure in the MCP bridge `src/server.ts`, which has 10,364 lines and is used by the running MCP service.

The MCP bridge is now classified as an instrument project. The concrete `server.ts` refactor should live under `instrument-projects/forgepilot-chatgpt-mcp/`, but the shadow-refactor rules are project-agnostic and belong in ForgePilot core.

## Scope

Add:

```text
docs/shadow-refactor-rules.md
```

Update:

```text
docs/core-instrument-observed-project-boundaries.md
docs/forgepilot-progress-checklist.md
```

## Required Rules

The rules must define at minimum:

- live entrypoint preservation,
- shadow candidate location,
- no service switch before verification,
- rollback requirement,
- direct operational proof requirement for instrument projects,
- when old implementation may be removed,
- how model workers may participate,
- what evidence must be recorded.

## Required Boundary

Shadow refactoring prepares a candidate beside the live implementation.

It does not authorize replacing the live implementation until verification and operational proof succeed.

## Safety Requirements

This packet must not refactor the MCP bridge, add MCP tools, change OpenAI Actions schema, create SQLite schema, implement routing, rank models, select models, rename historical packets, move historical packets, or delete historical packets.

## Non-Goals

This packet does not start the `server.ts` refactor, create model runs, define the allowed model roster, or switch any service entrypoint.

## Acceptance Criteria

1. Shadow refactor rules document exists.
2. Live entrypoint preservation rule is defined.
3. Candidate/switch/rollback rules are defined.
4. Operational proof requirement is defined for instrument projects.
5. Model worker participation boundary is defined.
6. Boundary docs and checklist reference the rules.
7. No implementation code changes are made.
8. Final git status is clean after evidence is recorded.
