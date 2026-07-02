# FP-META-031 — Invalidation Propagation Rules

## Task

Define how invalidated evidence affects downstream ForgePilot artifacts, reports, summaries, comparisons, and project-workspace outputs.

## Goal

Prevent an admission invalidation event from being recorded without downstream artifacts knowing they may depend on revoked evidence.

FP-META-031 answers one question:

> When admitted evidence is later invalidated or quarantined, what downstream artifacts become stale, affected, or require reconstruction?

## Background

ForgePilot already records admission invalidation events. However, a revocation mechanism that only logs invalidation is incomplete if reports and downstream artifacts that depended on the invalidated evidence remain unflagged.

FP-META-030 defined evidence-root and workspace boundaries. FP-META-031 uses that boundary to define downstream propagation semantics.

## Scope

Add:

```text
docs/invalidation-propagation-rules.md
runs/FP-META-031/invalidation-source-search.txt
```

Update:

```text
docs/forgepilot-progress-checklist.md
```

## Required Rules

The document must define:

- invalidation source,
- dependency edge,
- downstream artifact,
- stale report,
- affected-by-invalidation marker,
- requires-reconstruction marker,
- cross-workspace propagation rule,
- non-propagation cases,
- append-only propagation requirement,
- current implementation status.

## Required Boundary

Invalidation propagation must follow explicit evidence dependencies and evidence-root/workspace boundaries.

A core evidence invalidation does not automatically rewrite project workspace artifacts.

A project workspace invalidation does not automatically rewrite core reports unless a core report explicitly depended on that workspace.

## Required Verification Method

This packet must include concrete search output from existing code/docs for invalidation and admission behavior. The result may be governance-only if implementation is not yet present, but that must be recorded honestly.

## Safety Requirements

This packet must not change database schema, implement propagation code, rewrite historical reports, migrate files, change admission logic, or mark existing reports stale by mutation.

## Non-Goals

This packet does not implement invalidation propagation. It defines propagation semantics and records whether current implementation exists.

## Acceptance Criteria

1. Invalidation propagation rules document exists.
2. Existing invalidation/admission search artifact exists.
3. Downstream artifact states are defined.
4. Cross-workspace propagation rule is defined.
5. Current implementation status is recorded honestly.
6. No implementation code changes are made.
7. Final git status is clean after evidence is recorded.
