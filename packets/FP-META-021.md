# FP-META-021 — Project Summary Reporting Rules

## Task

Define rules for ForgePilot project-wide reporting before implementing a project report command.

## Goal

Ensure a project-wide report can aggregate packet and checklist state without turning partial evidence into narrative completion.

FP-META-021 answers one question:

> What may a ForgePilot project summary report claim across multiple packets?

## Background

FP-013 implemented a single-packet report summary view. The progress checklist still marks V1-wide reporting as incomplete.

Project-wide reporting is riskier than single-packet reporting because it can accidentally make broad claims from many partial facts.

## Scope

Add:

```text
docs/project-summary-reporting-rules.md
```

Update:

```text
docs/forgepilot-progress-checklist.md
```

## Required Rules

The rules must define at minimum:

- project-wide reportable facts,
- aggregation boundaries,
- status source precedence,
- checklist usage rules,
- packet inventory rules,
- incomplete/deferred/blocked reporting rules,
- V1 completion claim constraints,
- next-step recommendation constraints,
- prohibited project-wide claims.

## Required Boundary

A project report may summarize checklist entries and packet evidence, but it must not claim ForgePilot V1 is complete unless the checklist and committed evidence both support that claim.

## Safety Requirements

This packet must not:

- implement a project report command,
- create SQLite schema,
- add MCP tools,
- change admission logic,
- infer quality from telemetry,
- rank models,
- route work,
- rename historical packets.

## Non-Goals

This packet does not implement:

- project-report CLI,
- dashboard,
- MCP report tool,
- packet archive index,
- automatic checklist updates,
- refactor eligibility logic.

## Acceptance Criteria

1. `docs/project-summary-reporting-rules.md` exists.
2. Project-wide reportable facts are defined.
3. Aggregation boundaries are defined.
4. V1 completion claim constraints are defined.
5. Next-step recommendation constraints are defined.
6. Prohibited project-wide claims are defined.
7. Progress checklist references the rules.
8. No implementation code changes are made.
9. Final git status is clean after evidence is recorded.

## Verification Requirements

Verify at minimum:

- project summary reporting rules document exists,
- required sections exist,
- progress checklist references the document,
- no implementation code changed,
- final git status is clean.

## Expected Result

ForgePilot has a project-wide reporting standard ready to constrain a later `FP-*` project report implementation packet.
