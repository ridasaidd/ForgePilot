# FP-META-017 — Packet Namespace Taxonomy

## Task

Define ForgePilot packet namespace rules so new packets use the narrowest appropriate namespace instead of defaulting to `FP-MCP-*`.

## Goal

Prevent packet naming drift and make packet IDs communicate the primary domain of the work.

FP-META-017 answers one question:

> Which packet namespace should future ForgePilot work use?

## Background

ForgePilot currently has several packet families:

- `FP-*`
- `FP-META-*`
- `FP-MCP-*`

Recent work used `FP-MCP-*` for many packets because the active development phase focused on the ChatGPT MCP bridge. That was practical, but it risks turning `FP-MCP-*` into a default bucket for unrelated work.

Packet names should classify the primary artifact and intent of the packet, not merely the session or phase in which the packet was created.

## Scope

Add a repo-tracked packet namespace taxonomy document.

Recommended path:

```text
docs/packet-namespace-taxonomy.md
```

Update the progress checklist so future sessions see the namespace rule.

## Required Namespace Definitions

Define at minimum:

- `FP-*`
- `FP-META-*`
- `FP-MCP-*`
- `FP-OPS-*`

## Required Forward Rule

Existing packet IDs remain historical and should not be renamed merely to match the new taxonomy.

New packets should use the narrowest applicable namespace.

If a packet affects multiple areas, choose the namespace of the primary artifact being changed.

## Required Examples

The taxonomy must include concrete examples such as:

- SQLite evidence/reporting implementation → `FP-*`
- trust/admission/completion rules → `FP-META-*`
- MCP bridge tools/actions/server integration → `FP-MCP-*`
- operator checklists/runbooks/manual refresh procedures → `FP-OPS-*`

## Safety Requirements

This packet must not:

- rename historical packets,
- rewrite git history,
- move existing committed evidence,
- change implementation code,
- add MCP tools,
- create SQLite schema,
- change admission, routing, or scoring behavior.

## Non-Goals

This packet does not implement:

- packet migration,
- automated namespace validation,
- packet generator changes,
- schema persistence,
- dashboard/reporting logic.

## Acceptance Criteria

1. Packet namespace taxonomy document exists.
2. Four namespaces are defined: `FP`, `FP-META`, `FP-MCP`, `FP-OPS`.
3. Forward rule is recorded.
4. Historical packet IDs are explicitly preserved.
5. Examples are included.
6. Progress checklist references the taxonomy.
7. No implementation code changes are made.
8. ForgePilot repository is clean after evidence is recorded.

## Verification Requirements

Verify at minimum:

- taxonomy document exists,
- progress checklist references taxonomy,
- no implementation code changed,
- final git status is clean.

## Expected Result

Future sessions have a repo-tracked rule for selecting packet namespaces and should not default to `FP-MCP-*` unless the packet is primarily about MCP bridge/tool/action integration.
