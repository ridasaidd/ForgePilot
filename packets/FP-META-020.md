# FP-META-020 — Reporting Evidence Rules

## Task

Define the rules for ForgePilot reporting surfaces before implementing any report or summary command.

## Goal

Ensure future reports distinguish packet intent, implementation, verification, operational proof, observation, admission, comparison, and completion without silently promoting weaker states into stronger claims.

FP-META-020 answers one question:

> What may a ForgePilot report claim?

## Background

The progress checklist marks `Reporting / summary view` as `NOT_STARTED`.

Before a core reporting implementation is created, ForgePilot needs a reporting evidence rule set so the implementation does not accidentally collapse observation, verification, admission, and completion into one narrative status.

## Scope

Add:

```text
docs/reporting-evidence-rules.md
```

Update:

```text
docs/forgepilot-progress-checklist.md
```

## Required Rules

The reporting rules must define at minimum:

- reportable facts,
- prohibited claims,
- required labels for non-admitted observations,
- admitted evidence constraints,
- packet completion constraints,
- comparison constraints,
- manual action reporting constraints,
- source citation expectations for repo-local evidence.

## Required Boundary

A report may display non-admitted observations, but it must label them as observations and must not use them as evidence-backed conclusions.

## Safety Requirements

This packet must not:

- implement a report command,
- create SQLite schema,
- add MCP tools,
- change admission logic,
- rank models,
- route work,
- score packets,
- infer quality from telemetry.

## Non-Goals

This packet does not implement:

- report CLI,
- dashboard,
- MCP report tool,
- automatic packet reconstruction,
- evidence admission,
- comparison algorithm.

## Acceptance Criteria

1. `docs/reporting-evidence-rules.md` exists.
2. Reportable facts are defined.
3. Prohibited claims are defined.
4. Non-admitted observation labeling rule is defined.
5. Admitted evidence and comparison constraints are defined.
6. Manual action reporting constraints are defined.
7. Progress checklist references the reporting evidence rules.
8. No implementation code changes are made.
9. Final git status is clean after evidence is recorded.

## Verification Requirements

Verify at minimum:

- reporting evidence rules document exists,
- required rule sections exist,
- progress checklist references the document,
- no implementation code changed,
- final git status is clean.

## Expected Result

ForgePilot has a reporting semantics standard ready to constrain a later `FP-*` reporting implementation packet.
