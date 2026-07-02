# SHADOW-REF-004 — Audit MCP Bridge Shadow Refactor Plan

## Project

```text
instrument-projects/forgepilot-chatgpt-mcp
```

## Source Repository

```text
/home/ridasaidd/forgepilot-chatgpt-mcp
```

## Task

Audit the planning-only MCP bridge `src/server.ts` shadow refactor plan.

## Goal

Determine whether `SHADOW-REF-003` is safe and specific enough to guide future baseline-verification and eventual implementation packets.

SHADOW-REF-004 answers one question:

> Is the proposed shadow refactor plan acceptable as a planning artifact, and what must be fixed before implementation work begins?

## Checklist Item

```text
SR-004 — Audit shadow refactor plan
```

## Inputs

```text
instrument-projects/forgepilot-chatgpt-mcp/plans/SHADOW-REF-001-server-structure-map.md
instrument-projects/forgepilot-chatgpt-mcp/plans/SHADOW-REF-002-high-risk-zones.md
instrument-projects/forgepilot-chatgpt-mcp/plans/SHADOW-REF-003-shadow-refactor-plan.md
docs/shadow-refactor-rules.md
docs/project-checklist-rules.md
```

## Scope

Allowed:

- read prior structure, risk, and plan artifacts,
- evaluate the plan against shadow-refactor rules,
- identify missing gates,
- identify overclaims,
- identify unsafe sequencing,
- record an audit artifact.

Add expected artifact:

```text
instrument-projects/forgepilot-chatgpt-mcp/audits/SHADOW-REF-004-plan-audit.md
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
- authorize implementation.

## Model Role

Initial role:

```text
AUDITOR
```

This packet may be used as a prompt for an open-weight model later, but this packet itself does not authorize model execution.

## Required Audit Content

The audit must include:

1. audit verdict,
2. scope compliance check,
3. shadow-refactor rule compliance,
4. risk-zone compliance,
5. sequencing assessment,
6. required fixes before implementation,
7. recommendations for next packet,
8. explicit non-implementation statement.

## Acceptance Criteria

1. Audit artifact exists.
2. Audit is read-only.
3. Audit gives a clear verdict.
4. Audit identifies any required fixes before implementation.
5. MCP bridge working tree remains clean.
6. ForgePilot working tree is clean after evidence is committed.
7. Checklist item SR-004 is updated only if evidence exists.

## Boundary

An audit may accept a planning artifact, but audit acceptance is not execution proof and does not authorize modifying the live server.
