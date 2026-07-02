# FP-META-029 — Model Roster and Profiling Rules

## Task

Define ForgePilot model roster and profiling rules for open-weight model participation in observed and instrument projects.

## Goal

Ensure model availability does not imply trust, and ensure models can only participate in roles justified by evidence and scoped packets.

FP-META-029 answers one question:

> Which models may participate in ForgePilot-observed work, under what roles, and how can they be promoted or demoted?

## Background

The MCP bridge shadow-refactor plan audit requires model roster/profiling rules before any model execution or implementation work begins.

The user has identified multiple OpenCode Go models that may eventually participate in ForgePilot-observed work. ForgePilot must distinguish availability from permission and permission from trust.

## Scope

Add:

```text
docs/model-roster-and-profiling-rules.md
```

Update:

```text
docs/forgepilot-progress-checklist.md
instrument-projects/forgepilot-chatgpt-mcp/checklists/server-shadow-refactor.md
```

## Required Rules

The document must define:

- model roster purpose,
- model identity fields,
- allowed model roles,
- allowed task classes,
- trust states,
- promotion criteria,
- demotion criteria,
- evidence requirements,
- default restrictions for unobserved models,
- MCP bridge shadow-refactor participation boundary.

## Required Boundary

Model availability is not trust.

A model may be allowed for read-only planning before it is allowed for implementation.

No model may modify project code unless a scoped packet explicitly grants implementation authority.

## Safety Requirements

This packet must not execute models, call OpenCode, refactor the MCP bridge, add MCP tools, change OpenAI Actions schema, create SQLite schema, implement routing, rank models globally, rename historical packets, move historical packets, or delete historical packets.

## Non-Goals

This packet does not select a winning model, implement routing, score models, implement model automation, run benchmarks, or create an OpenCode plugin.

## Acceptance Criteria

1. Model roster and profiling rules document exists.
2. Allowed roles and task classes are defined.
3. Trust states are defined.
4. Promotion and demotion criteria are defined.
5. Initial known OpenCode Go model roster is recorded as available but not automatically trusted.
6. MCP bridge shadow-refactor model participation boundary is defined.
7. Checklist references FP-META-029 completion.
8. No implementation code changes are made.
9. Final git status is clean after evidence is recorded.
