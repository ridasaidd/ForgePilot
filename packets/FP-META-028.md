# FP-META-028 — Project Checklist Rules

## Task

Define how ForgePilot creates and manages project-specific checklists for instrument and observed projects.

## Goal

Allow ForgePilot to guide open-weight model work through evidence-bound checklist items without requiring an OpenCode plugin as the first implementation.

FP-META-028 answers one question:

> How should ForgePilot manage project checklists that become scoped packets for model workers?

## Background

ForgePilot V1.0 is complete. Instrument-project work now has a workspace layout, and shadow-refactor rules exist.

The next operational need is a project checklist for the MCP bridge `server.ts` shadow refactor so model workers can receive bounded tasks rather than an unbounded refactor.

## Scope

Add:

```text
docs/project-checklist-rules.md
instrument-projects/forgepilot-chatgpt-mcp/checklists/server-shadow-refactor.md
```

Update:

```text
docs/core-instrument-observed-project-boundaries.md
docs/forgepilot-progress-checklist.md
instrument-projects/forgepilot-chatgpt-mcp/README.md
```

## Required Rules

The checklist rules must define:

- checklist purpose,
- checklist location,
- allowed statuses,
- required fields,
- evidence requirement,
- model-worker handoff rule,
- update rule,
- boundary between checklist and evidence,
- OpenCode plugin deferral.

## Required Boundary

A checklist is an evidence index and planning surface.

It is not evidence by itself, and it does not authorize model execution without a scoped packet.

## Safety Requirements

This packet must not refactor the MCP bridge, add MCP tools, change OpenAI Actions schema, create SQLite schema, implement routing, rank models, select models, execute models, rename historical packets, move historical packets, or delete historical packets.

## Non-Goals

This packet does not implement CLI checklist commands, implement an OpenCode plugin, start the `server.ts` refactor, or assign tasks to models.

## Acceptance Criteria

1. Project checklist rules document exists.
2. MCP bridge shadow-refactor checklist exists.
3. Checklist statuses and required fields are defined.
4. Checklist-to-packet/model-worker handoff rule is defined.
5. Checklist explicitly says it is not evidence by itself.
6. OpenCode plugin is deferred.
7. Boundary docs, progress checklist, and instrument README reference the checklist rules.
8. No implementation code changes are made.
9. Final git status is clean after evidence is recorded.
