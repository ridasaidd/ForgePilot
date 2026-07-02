# FP-META-022 — Admission and Comparison Reconstruction Rules

## Task

Define how ForgePilot may reconstruct admission and comparison state for reporting without mutating evidence or inventing trust.

## Goal

Prepare a later core implementation that can report admission/comparison state from committed artifacts and read-only data while preserving evidence boundaries.

FP-META-022 answers one question:

> How may ForgePilot reconstruct admission and comparison state for reports?

## Background

The project report marks admission/comparison reconstruction as `PARTIAL` and recommends `FP-META-*` for the rules before implementation.

ForgePilot already has admission and comparison artifacts from earlier packets, but reporting must not collapse those into global model ranking, routing preference, or retroactive trust.

## Scope

Add:

```text
docs/admission-comparison-reconstruction-rules.md
```

Update:

```text
docs/forgepilot-progress-checklist.md
```

## Required Rules

The rules must define at minimum:

- reconstruction inputs,
- admission state reporting rules,
- comparison state reporting rules,
- precedence when sources disagree,
- unknown/missing state handling,
- historical packet handling,
- prohibited inferences,
- implementation constraints for a later `FP-*` packet.

## Required Boundary

Reconstruction is read-only.

It may summarize recorded state, but it must not create admission, invalidate evidence, rank models globally, or route future work.

## Safety Requirements

This packet must not implement reconstruction logic, create SQLite schema, mutate admission state, change comparison outcomes, rank models, route work, add MCP tools, or rename historical packets.

## Non-Goals

This packet does not implement a CLI, dashboard, MCP tool, admission policy, comparison algorithm, archive index, or refactor.

## Acceptance Criteria

1. `docs/admission-comparison-reconstruction-rules.md` exists.
2. Reconstruction inputs are defined.
3. Admission reporting rules are defined.
4. Comparison reporting rules are defined.
5. Unknown/missing state handling is defined.
6. Prohibited inferences are defined.
7. Progress checklist references the rules.
8. No implementation code changes are made.
9. Final git status is clean after evidence is recorded.
