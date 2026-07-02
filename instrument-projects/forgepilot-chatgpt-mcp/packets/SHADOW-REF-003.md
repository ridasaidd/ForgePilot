# SHADOW-REF-003 — MCP Bridge server.ts Shadow Refactor Plan

## Project

```text
instrument-projects/forgepilot-chatgpt-mcp
```

## Source Repository

```text
/home/ridasaidd/forgepilot-chatgpt-mcp
```

## Task

Create a planning-only shadow refactor plan for the MCP bridge `src/server.ts` file.

## Goal

Define a safe, staged sequence for reducing `src/server.ts` risk and size while preserving the live entrypoint until a verified switch packet.

SHADOW-REF-003 answers one question:

> What sequence of future packets should be used to refactor `src/server.ts` without breaking the live MCP bridge?

## Checklist Item

```text
SR-003 — Propose shadow refactor plan
```

## Inputs

```text
instrument-projects/forgepilot-chatgpt-mcp/plans/SHADOW-REF-001-server-structure-map.md
instrument-projects/forgepilot-chatgpt-mcp/plans/SHADOW-REF-002-high-risk-zones.md
docs/shadow-refactor-rules.md
docs/project-checklist-rules.md
```

## Scope

Allowed:

- read prior structure and risk artifacts,
- propose a staged packet sequence,
- define candidate layout options,
- define protected zones,
- define verification gates,
- define model-worker participation boundaries,
- record a planning artifact.

Add expected artifact:

```text
instrument-projects/forgepilot-chatgpt-mcp/plans/SHADOW-REF-003-shadow-refactor-plan.md
```

## Forbidden

Do not:

- edit the MCP bridge repository,
- edit `src/server.ts`,
- create `server-next.ts`,
- create candidate modules,
- change runtime entrypoint,
- change MCP tool schemas,
- change OpenAI Actions schema,
- change auth/OAuth behavior,
- change approval semantics,
- execute model implementation work,
- authorize implementation.

## Model Role

Initial role:

```text
PLANNER
```

This packet may be used as a prompt for an open-weight model later, but this packet itself does not authorize model execution.

## Required Plan Content

The artifact must include:

1. baseline,
2. planning principles,
3. protected zones,
4. staged packet sequence,
5. candidate layout recommendation,
6. verification gates,
7. model-worker participation boundaries,
8. rollback/switch strategy,
9. explicit non-implementation statement.

## Acceptance Criteria

1. Shadow refactor plan artifact exists.
2. Artifact is planning-only.
3. Artifact preserves the live entrypoint.
4. Artifact defers critical zones until late-stage packets.
5. Artifact identifies first implementation candidates without authorizing implementation.
6. MCP bridge working tree remains clean.
7. ForgePilot working tree is clean after evidence is committed.
8. Checklist item SR-003 is updated only if evidence exists.

## Boundary

A shadow refactor plan is not implementation, not audit, not model execution, and not authorization to modify the live server.
