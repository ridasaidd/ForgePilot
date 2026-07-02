# FP-META-027 — Shadow Refactor Rules

## Task

Define ForgePilot's general shadow-refactor rules for refactoring live or instrument-critical systems.

## Goal

Allow high-risk refactors to be prepared beside a live entrypoint without breaking the running system, while preserving rollback and evidence boundaries.

FP-META-027 answers one question:

> How may ForgePilot safely observe and govern a refactor when the current implementation must remain live until proof exists?

## Background

The first V1 operational observation identified refactor pressure in the MCP bridge `src/server.ts`, which currently has 10,364 lines.

The MCP bridge is now classified as an instrument project. The concrete `server.ts` refactor belongs under `instrument-projects/forgepilot-chatgpt-mcp/`, but the general safety rules for shadow refactoring are ForgePilot core policy.

## Scope

Add:

```text
docs/shadow-refactor-rules.md
```

Update:

```text
docs/forgepilot-progress-checklist.md
instrument-projects/forgepilot-chatgpt-mcp/README.md
```

## Required Rules

The rules must define at minimum:

- live entrypoint preservation,
- candidate entrypoint naming,
- rollback preservation,
- allowed planning-only phase,
- implementation phase boundaries,
- verification gates before switch,
- direct operational proof before old entrypoint removal,
- model participation constraints,
- forbidden changes during shadow refactor,
- evidence requirements.

## Required Boundary

Shadow refactoring is not a license to change behavior.

It is a method for preparing behavior-preserving refactors while the current implementation remains live.

## Safety Requirements

This packet must not refactor the MCP bridge, add MCP tools, change OpenAI Actions schema, switch service entrypoints, create SQLite schema, implement routing, rank models, rename historical packets, move historical packets, or delete historical packets.

## Non-Goals

This packet does not start the shadow refactor, select model executors, execute model runs, define V2, or modify bridge code.

## Acceptance Criteria

1. Shadow refactor rules document exists.
2. Live entrypoint preservation is defined.
3. Candidate entrypoint and rollback rules are defined.
4. Verification gates before switch are defined.
5. Direct operational proof before old entrypoint removal is defined.
6. Model participation constraints are defined.
7. Instrument project README references the rules.
8. Progress checklist references the rules.
9. No implementation code changes are made.
10. Final git status is clean after evidence is recorded.
