# FP-META-032 — Task-Class-Scoped Model Trust

## Task

Refine ForgePilot model trust rules so trust is scoped by model identity, task class, project/context, evidence references, date range, and assignment provenance.

## Goal

Prevent broad model trust labels from being interpreted as global authority.

FP-META-032 answers one question:

> What exactly does it mean to trust a model for a task?

## Background

FP-META-029 defined model roster and profiling rules. Review identified that trust labels such as `OBSERVED_SAFE_SMALL_CHANGE` are too broad unless scoped to task class, context, and evidence range.

Providers may update models under the same public name. A model may perform safely in one task class while being unsafe in another. Trust assignments themselves may later need promotion, demotion, or invalidation.

## Scope

Add:

```text
docs/task-class-scoped-model-trust.md
runs/FP-META-032/model-trust-source-search.txt
```

Update:

```text
docs/model-roster-and-profiling-rules.md
docs/forgepilot-progress-checklist.md
```

## Required Rules

The document must define:

- task-class-scoped trust,
- model identity and provider/version/date-range fields,
- project/context scope,
- evidence reference requirements,
- assigned_by/corrected_by provenance,
- assignment method,
- promotion/demotion as append-only transitions,
- provider update/re-observation rule,
- initial correction to broad FP-META-029 trust statements.

## Required Boundary

A model trust label is not global.

A model may be trusted for one task class and unobserved or demoted for another.

A model may only act within a scoped packet even if a trust assignment exists.

## Required Verification Method

This packet must include concrete source/docs search output for existing model trust, model outcome, and task-class interpretation language.

## Safety Requirements

This packet must not execute models, modify project code, rank models globally, implement routing, change SQLite schema, create model automation, or promote any model to unrestricted implementation authority.

## Non-Goals

This packet does not implement a model trust database, run benchmarks, select a winning model, or start MCP bridge implementation.

## Acceptance Criteria

1. Task-class-scoped model trust document exists.
2. Source/docs search artifact exists.
3. FP-META-029 broad initial trust language is refined or caveated.
4. Promotion/demotion transitions require provenance.
5. Provider update/re-observation rule is defined.
6. No implementation code changes are made.
7. Final git status is clean after evidence is recorded.
