# FP-MCP-150 — ForgePilot Master Plan

## Task

Create a comprehensive ForgePilot master plan that ties together the project purpose, architecture, MCP tooling, OpenCode harness, model executor/auditor workflow, evidence lifecycle, safety model, workspace model, and near-term roadmap.

## Goal

Pause feature expansion long enough to record the full direction of ForgePilot before additional MCP and observatory tools are added.

The plan must preserve the core purpose of ForgePilot: a software production observatory for AI-assisted development.

## Deliverable

Create:

`docs/forgepilot-master-plan.md`

## Required Content

The document must define:

1. ForgePilot purpose and mission.
2. Non-goals.
3. System roles and ownership boundaries.
4. Truth model: SQLite, Markdown, Git, server workspace, and GPT house.
5. Evidence lifecycle.
6. MCP role and tool layers.
7. OpenCode harness role.
8. GPT orchestration role.
9. Executor, auditor, comparator, and human roles.
10. Safety and approval model.
11. Metrics, telemetry, validation, and admission model.
12. Model routing future and constraints.
13. Development phases from current state to evidence-based orchestration.
14. Required tool roadmap.
15. Near-term packet roadmap.
16. Conditions required before routing or automation can influence decisions.

## Constraints

- Do not replace existing standards documents.
- Reference existing docs as supporting standards where appropriate.
- Do not add implementation code.
- Do not change schemas.
- Do not start or stop OpenCode.
- Do not claim that routing or autonomy exists today.
- Preserve the principle that ForgePilot records observations, not narratives.
- Preserve the principle that only admitted evidence may influence future decisions.

## Acceptance Criteria

1. `docs/forgepilot-master-plan.md` exists.
2. The document clearly states ForgePilot's purpose.
3. The document distinguishes project, tools, execution harness, and observatory.
4. The document includes a phased roadmap.
5. The document defines what must be true before evidence-based routing.
6. The document names FP-MCP-148, FP-MCP-149, and FP-MCP-150 in the near-term roadmap.
7. The document explains that direct GPT terminal access is an operator interface, not the product.
