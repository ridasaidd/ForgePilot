# FP-OPS-005 — ForgePilot V1 Release and Observation Plan

## Task

Record ForgePilot V1.0 as complete and define the V1 observation period before any V1.x or V2 decision.

## Goal

Turn the committed V1 completion report into an explicit release artifact and establish how ForgePilot V1 will be used, observed, and evaluated.

FP-OPS-005 answers one question:

> How do we close V1.0 and collect operational evidence before deciding whether V1.x or V2 is justified?

## Background

`runs/FP-META-025/final-v1-project-report.json` reports:

```text
V1 Completion Status: COMPLETE
V1 Completion Reason: All non-deferred checklist capabilities are marked COMPLETE.
```

V1 should now be used and observed before proposing V2.

## Scope

Add:

```text
docs/releases/forgepilot-v1.md
docs/v1-observation-plan.md
runs/V1-OBSERVATION/log.md
```

Update:

```text
docs/forgepilot-progress-checklist.md
```

## Required Content

The release record must include:

- V1 completion commit,
- final V1 project report artifact,
- V1 completion meaning,
- explicit non-goals/deferred capabilities,
- clean repository state requirement.

The observation plan must include:

- observation questions,
- friction categories,
- V1.x triggers,
- V2 triggers,
- non-triggers,
- review cadence or review condition.

## Required Boundary

V2 must be evidence-triggered, not ambition-triggered.

V1.x may improve usability while preserving the V1 contract.

## Safety Requirements

This packet must not implement code, create SQLite schema, add MCP tools, change admission logic, rank models, route work, rename historical packets, move packet files, or delete packet files.

## Non-Goals

This packet does not start V2, define V2 architecture, implement dashboard UI, implement routing, implement model scoring, or add persistence.

## Acceptance Criteria

1. `docs/releases/forgepilot-v1.md` exists.
2. `docs/v1-observation-plan.md` exists.
3. `runs/V1-OBSERVATION/log.md` exists.
4. V1 completion is tied to committed project report evidence.
5. V1.x vs V2 decision rules are documented.
6. Progress checklist references the release and observation plan.
7. No implementation code changes are made.
8. Final git status is clean after evidence is recorded.
