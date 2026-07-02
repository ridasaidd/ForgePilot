# FP-MCP-158 — ForgePilot Progress Checklist v1

## Task

Create a repo-tracked progress checklist for ForgePilot V1 capability status.

## Goal

Make ForgePilot progress inspectable without turning the checklist into a roadmap, dashboard, narrative report, or machine-readable source of truth.

FP-MCP-158 answers one question:

> Can ForgePilot V1 progress be tracked from committed evidence without relying on private chat memory?

## Background

ForgePilot has accumulated enough dependent FP-MCP capabilities that a single-packet working memory is no longer sufficient.

The checklist should act as an evidence ledger index:

- what capability exists,
- what packet proves it,
- what evidence was recorded,
- what remains incomplete,
- what must not be inferred yet.

The checklist is not an implementation backlog and not a replacement for packet evidence.

## Scope

Add:

```text
docs/forgepilot-progress-checklist.md
```

The checklist must include:

- status vocabulary,
- current baseline,
- ForgePilot V1 completion definition,
- all known V1 capability entries at coarse capability level,
- evidence-backed status for recent FP-MCP packets,
- incomplete V1 checks,
- standing operational caveats.

## Required Status Vocabulary

Use a small controlled vocabulary:

- `NOT_STARTED`
- `PACKET_RECORDED`
- `IMPLEMENTED`
- `VERIFIED`
- `DIRECT_MCP_PROVEN`
- `RECORDED`
- `COMPLETE`
- `PARTIAL`
- `BLOCKED`
- `DEFERRED`

## Required Principle

The checklist must preserve this rule:

```text
Never mark something complete because we believe it works.
Mark it complete only because committed packet evidence proves it.
```

## Required V1 Completion Definition

ForgePilot V1 is complete when packet intent, execution, telemetry, verification, audit, admission, comparison, and reporting can be reconstructed from committed evidence and supported read-only queries, without relying on private chat memory.

## Required Initial Scope

The checklist should accurately cover recent FP-MCP worker/telemetry/query work, especially:

- FP-MCP-153
- FP-MCP-154
- FP-MCP-156
- FP-MCP-157

It may include older or adjacent capabilities at a coarse level where already known, but it must not pretend to reconstruct all historical packet evidence in v1.

## Safety Requirements

The checklist must not:

- create new architecture,
- define routing policy,
- score models,
- rank models,
- admit evidence,
- mutate SQLite schema,
- add MCP tools,
- introduce dashboard requirements,
- convert planning wishes into completed status.

## Non-Goals

This packet does not implement:

- SQLite checklist persistence,
- dashboard UI,
- report generator,
- model scoring,
- routing,
- telemetry aggregation,
- admission rules,
- automated checklist updating.

## Acceptance Criteria

1. `docs/forgepilot-progress-checklist.md` exists.
2. Status vocabulary is defined.
3. ForgePilot V1 completion definition is recorded.
4. Recent FP-MCP worker/telemetry/query packets are listed with evidence-backed statuses.
5. V1 incomplete capabilities are listed as incomplete.
6. FP-MCP-157 is marked complete only because direct MCP proof is recorded.
7. Manual OpenAI Actions schema refresh is recorded as an operational caveat.
8. The checklist clearly says it is an evidence index, not a roadmap or dashboard.
9. No implementation code changes are made.
10. ForgePilot repository is clean after evidence is recorded.

## Verification Requirements

Verify at minimum:

- checklist file exists,
- packet file exists,
- no implementation code changed,
- final git status is clean.

## Expected Result

ForgePilot has a first repo-tracked progress checklist that can be updated as future packets cross evidence boundaries.
