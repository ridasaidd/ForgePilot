# FP-MCP-001 — OpenCode Executor Tool Boundary

## Task

Add a design document defining the OpenCode executor authority boundary for ForgePilot MCP.

## Goal

Define how ChatGPT may request scoped OpenCode executor work through ForgePilot MCP without giving ChatGPT arbitrary shell, filesystem, Git, database, server, or OpenCode authority.

FP-MCP-001 answers one question:

**How may ChatGPT request a ForgePilot-scoped OpenCode run without receiving arbitrary execution authority?**

This packet defines standards only.

It does not implement executor tools.

It does not add shell execution, filesystem mutation, Git mutation, SQLite mutation, OpenCode execution, telemetry ingestion, routing logic, aggregation logic, workflow orchestration, or autonomous execution.

---

## Scope Boundary

FP-MCP-001 adds documentation only.

It may add:

- `docs/opencode-executor-boundary.md`

It must not add:

- MCP executor tools
- shell execution
- OpenCode CLI calls
- OpenCode API calls
- write tools
- Git mutation
- SQLite mutation
- filesystem mutation
- telemetry ingestion
- routing behavior
- aggregation behavior
- autonomous execution

Any implementation proposal beyond the executor boundary design must be rejected.

---

## Governing Principles

This packet is constrained by:

- P01 — ForgePilot records observations, not narratives.
- P02 — Trust cannot be retroactively created.
- P03 — ForgePilot does not optimize for favorable outcomes.
- P04 — Only admitted evidence may influence observatory outputs.
- P05 — Do not build infrastructure for evidence that does not yet exist.
- P06 — Classification follows observation.

---

## Required Design Content

The design document must define:

1. Current MCP security baseline
2. Core executor boundary principle
3. Proposed future tool set
4. Required run boundary
5. Authority boundary
6. Required user approval
7. Model allowlist
8. Execution modes
9. Forbidden capabilities
10. Artifact requirements
11. Evidence rules
12. Failure rules
13. Lifecycle model
14. First implementation recommendation
15. Open questions

---

## Required Boundary Rule

ChatGPT must never receive a generic command runner.

ChatGPT may only request a named ForgePilot workflow action whose scope, inputs, outputs, authority, and artifact locations are constrained by ForgePilot.

Executor output is not evidence by default.

Executor output may become evidence only after artifacts exist, validation passes, audit occurs where required, and admission is explicitly recorded.

---

## Acceptance Criteria

- `docs/opencode-executor-boundary.md` exists.
- The document defines ChatGPT’s executor request boundary.
- The document rejects generic command execution.
- The document rejects arbitrary prompt execution.
- The document rejects arbitrary filesystem access.
- The document rejects arbitrary Git mutation.
- The document rejects arbitrary SQLite mutation.
- The document defines a proposed future tool set.
- The document defines required run boundaries.
- The document defines authority boundaries.
- The document defines user approval requirements.
- The document defines model allowlist requirements.
- The document defines execution mode requirements.
- The document defines forbidden tool shapes.
- The document defines artifact requirements.
- The document defines evidence rules.
- The document defines failure rules.
- The document recommends read-only OpenCode discovery before execution.
- The packet does not implement executor tools.
- The packet does not add OpenCode integration.
- The packet does not add shell execution.
- The packet does not add write tools.
- The packet is justified by `PRINCIPLES.md`.

---

## Verification Requirements

Run and record:

```bash
pnpm typecheck
pnpm test
