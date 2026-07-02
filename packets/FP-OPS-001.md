# FP-OPS-001 — Checklist Namespace Guidance

## Task

Update the ForgePilot progress checklist so incomplete and future-facing capability entries include recommended packet namespace guidance.

## Goal

Help future sessions select the correct packet namespace without defaulting to `FP-MCP-*`.

## Scope

Update:

```text
docs/forgepilot-progress-checklist.md
```

The checklist should include advisory namespace guidance such as:

- recommended namespace,
- reason,
- whether the guidance is advisory or governing.

## Required Rule

The checklist may recommend a namespace, but the governing rule remains:

```text
docs/packet-namespace-taxonomy.md
```

The checklist must not pre-assign exact packet numbers unless a packet already exists.

## Non-Goals

- No packet renaming.
- No taxonomy change.
- No implementation code.
- No MCP tools.
- No SQLite schema.
