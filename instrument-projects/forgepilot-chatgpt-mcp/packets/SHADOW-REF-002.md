# SHADOW-REF-002 — MCP Bridge server.ts High-Risk Zones

## Project

```text
instrument-projects/forgepilot-chatgpt-mcp
```

## Source Repository

```text
/home/ridasaidd/forgepilot-chatgpt-mcp
```

## Task

Create a read-only high-risk zone analysis for the MCP bridge `src/server.ts` file.

## Goal

Identify the sections of the live MCP bridge server that must be protected, delayed, or isolated during any future shadow refactor.

SHADOW-REF-002 answers one question:

> Which parts of `src/server.ts` are highest risk to change, and what guardrails must future packets respect?

## Checklist Item

```text
SR-002 — Identify high-risk zones
```

## Inputs

```text
instrument-projects/forgepilot-chatgpt-mcp/plans/SHADOW-REF-001-server-structure-map.md
instrument-projects/forgepilot-chatgpt-mcp/runs/SHADOW-REF-001/server-functions.txt
instrument-projects/forgepilot-chatgpt-mcp/runs/SHADOW-REF-001/server-tool-markers.txt
instrument-projects/forgepilot-chatgpt-mcp/runs/SHADOW-REF-001/create-mcp-server-window.txt
```

## Scope

Allowed:

- read prior SHADOW-REF-001 artifacts,
- read `src/server.ts` if needed,
- classify risk zones,
- identify forbidden early-refactor areas,
- identify verification requirements for later packets,
- record a risk-zone analysis artifact.

Add expected artifact:

```text
instrument-projects/forgepilot-chatgpt-mcp/plans/SHADOW-REF-002-high-risk-zones.md
```

## Forbidden

Do not:

- edit the MCP bridge repository,
- edit `src/server.ts`,
- create candidate implementation files,
- change runtime entrypoint,
- change MCP tool schemas,
- change OpenAI Actions schema,
- change auth/OAuth behavior,
- change approval semantics,
- execute model implementation work,
- start refactor planning beyond risk classification.

## Model Role

Initial role:

```text
RISK_ANALYST
```

This packet may be used as a prompt for an open-weight model later, but this packet itself does not authorize model execution.

## Required Risk Analysis Content

The artifact must include:

1. baseline,
2. risk scale,
3. high-risk zone table,
4. forbidden early-refactor zones,
5. lower-risk candidate zones,
6. required verification by risk type,
7. implications for future shadow-refactor packets,
8. explicit non-refactor statement.

## Acceptance Criteria

1. Risk-zone artifact exists.
2. Artifact is read-only analysis only.
3. Artifact identifies high-risk zones and required guardrails.
4. Artifact identifies which zones should be deferred until late in the shadow refactor.
5. MCP bridge working tree remains clean.
6. ForgePilot working tree is clean after evidence is committed.
7. Checklist item SR-002 is updated only if evidence exists.

## Boundary

A risk-zone analysis is not a refactor plan, not implementation, not an audit, and not authorization to modify the live server.
