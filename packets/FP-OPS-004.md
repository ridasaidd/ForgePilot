# FP-OPS-004 — Packet Status Index v1

## Task

Create the first operator-facing packet status/archive index.

## Goal

Make historical, active, superseded, deferred, and taxonomy-mismatched packet state inspectable without renaming, deleting, or moving historical packets.

FP-OPS-004 answers one question:

> How should existing packets be classified for operator navigation without rewriting history?

## Background

ForgePilot now has many packets across `FP-*`, `FP-META-*`, `FP-MCP-*`, and `FP-OPS-*` namespaces. Some older packets may be historical, superseded, or broader than their namespace suggests.

The packet namespace taxonomy says historical IDs remain valid and should not be renamed merely to match the taxonomy.

## Scope

Add:

```text
docs/packet-status-index.md
```

Update:

```text
docs/forgepilot-progress-checklist.md
```

## Required Rules

The index must define status labels for packet navigation, including at minimum:

- `ACTIVE`
- `COMPLETED`
- `HISTORICAL`
- `SUPERSEDED`
- `DEFERRED`
- `UNKNOWN`

## Required Boundary

The index is an operator navigation aid.

It is not evidence by itself and must not rename, delete, move, invalidate, or reinterpret historical packet IDs.

## Safety Requirements

This packet must not rename packet files, delete packet files, move packet files, rewrite git history, change implementation code, create SQLite schema, add MCP tools, admit evidence, rank models, or route work.

## Non-Goals

This packet does not implement automated archive classification, dashboard UI, refactor eligibility, admission/comparison reconstruction, or packet migration.

## Acceptance Criteria

1. `docs/packet-status-index.md` exists.
2. Status vocabulary is defined.
3. Historical packet preservation rule is recorded.
4. Recent/current packets are classified.
5. Known historical namespace mismatch examples are recorded.
6. Progress checklist references the index.
7. No packet files are renamed, moved, or deleted.
8. No implementation code changes are made.
9. Final git status is clean after evidence is recorded.
