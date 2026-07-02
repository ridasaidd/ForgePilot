# SHADOW-REF-001 — MCP Bridge server.ts Structure Map

## Project

```text
instrument-projects/forgepilot-chatgpt-mcp
```

## Source Repository

```text
/home/ridasaidd/forgepilot-chatgpt-mcp
```

## Task

Create a read-only structure map of the MCP bridge `src/server.ts` file.

## Goal

Understand the current shape of the 10,364-line live server entrypoint before any shadow refactor planning or implementation begins.

SHADOW-REF-001 answers one question:

> What major sections, responsibilities, contracts, and risk zones exist inside the current live `src/server.ts`?

## Checklist Item

```text
SR-001 — Create server.ts structure map
```

## Baseline

```text
ForgePilot commit: c1327a9
Bridge branch: feature/oauth-auth0
Bridge commit: 3a16d68
Live entrypoint: src/server.ts
server.ts size: 10,364 lines
```

## Scope

Allowed:

- read `src/server.ts`,
- inspect file structure,
- identify major sections,
- identify handlers and contracts,
- identify likely extraction seams,
- identify risk zones,
- record a structure map under the instrument-project workspace.

Add expected artifact:

```text
instrument-projects/forgepilot-chatgpt-mcp/plans/SHADOW-REF-001-server-structure-map.md
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
- start the shadow refactor implementation.

## Model Role

Initial role:

```text
STRUCTURE_MAPPER
```

This packet may be used as a prompt for an open-weight model later, but this packet itself does not authorize model execution.

## Required Structure Map Content

The structure map must include:

1. file baseline,
2. top-level responsibility summary,
3. major sections with approximate line ranges,
4. exported/imported dependencies if relevant,
5. MCP tool-related areas,
6. auth/OAuth/session areas,
7. terminal-command execution areas,
8. telemetry/evidence areas,
9. validation/error-handling areas,
10. service startup/runtime areas,
11. likely extraction seams,
12. high-risk zones,
13. explicit non-refactor statement.

## Acceptance Criteria

1. Structure map artifact exists.
2. Artifact is read-only analysis only.
3. Artifact identifies major responsibilities and approximate line ranges.
4. Artifact identifies risk zones.
5. Artifact identifies candidate extraction seams without authorizing implementation.
6. MCP bridge working tree remains clean.
7. ForgePilot working tree is clean after evidence is committed.
8. Checklist item SR-001 is updated only if evidence exists.

## Boundary

A structure map is not a refactor plan, not an implementation, not an audit, and not authorization to modify the live server.
