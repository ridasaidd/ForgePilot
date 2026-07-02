# Packet Status Index

## Purpose

This index helps operators navigate ForgePilot packets without rewriting history.

It classifies packet state for navigation only.

It is not evidence by itself.

## Preservation Rule

Packets are immutable historical intent records.

Existing packet IDs must not be renamed, moved, deleted, invalidated, or reinterpreted merely because the taxonomy improved later.

The index may say:

```text
This packet would likely use a different namespace today.
```

The index must not change the packet ID.

## Status Vocabulary

| Status | Meaning |
|---|---|
| `ACTIVE` | Current or near-current work surface; future packets may build directly on it. |
| `COMPLETED` | Packet has committed evidence satisfying its scoped acceptance criteria. |
| `HISTORICAL` | Preserved as history; may not be the current operating surface. |
| `SUPERSEDED` | Later packets replaced or refined its operating role. |
| `DEFERRED` | Intentionally postponed. |
| `UNKNOWN` | Not yet reviewed/classified by this index. |

## Namespace Drift Rule

Historical namespace mismatch is not an error.

Example:

```text
FP-MCP-158 created a progress checklist before FP-OPS existed.
Future checklist work should use FP-OPS-*.
The historical FP-MCP-158 ID remains valid.
```

## Current Operating Packets

| Packet | Status | Current role | Notes |
|---|---|---|---|
| `FP-META-017` | `COMPLETED` | Packet namespace taxonomy | Governs future namespace selection. |
| `FP-OPS-001` | `COMPLETED` | Checklist namespace guidance | First OPS packet; checklist guidance is advisory. |
| `FP-OPS-002` | `COMPLETED` | Session bootstrap runbook | New sessions should begin here. |
| `FP-OPS-003` | `COMPLETED` | Manual action ledger | Records external/manual action pattern. |
| `FP-META-018` | `COMPLETED` | Evidence boundary doctrine | Defines evidence boundary semantics. |
| `FP-META-019` | `COMPLETED` | Namespace definition-of-done standards | Defines minimum verification burden by namespace. |
| `FP-META-020` | `COMPLETED` | Reporting evidence rules | Governs single-packet report claims. |
| `FP-013` | `COMPLETED` | Packet report summary view | First single-packet read-only report. |
| `FP-META-021` | `COMPLETED` | Project summary reporting rules | Governs project-wide report claims. |
| `FP-014` | `COMPLETED` | Project summary report | First project-wide read-only report. |
| `FP-META-022` | `COMPLETED` | Admission/comparison reconstruction rules | Governs reconstruction reports. |
| `FP-015` | `COMPLETED` | Reconstruction report | First read-only admission/comparison reconstruction report. |
| `FP-OPS-004` | `ACTIVE` | Packet status index v1 | This packet creates the index. |

## Known Namespace Drift Examples

| Packet | Historical namespace | Likely namespace today | Status | Notes |
|---|---|---|---|---|
| `FP-MCP-158` | `FP-MCP` | `FP-OPS` | `COMPLETED` | Created progress checklist before `FP-OPS-*` taxonomy existed. Do not rename. |
| `FP-META-017` | `FP-META` | `FP-META` | `COMPLETED` | Established packet namespace taxonomy. |
| `FP-OPS-001` | `FP-OPS` | `FP-OPS` | `COMPLETED` | First intended use of OPS namespace. |

## Broad Historical Buckets

This index does not yet classify every historical packet individually.

Until reviewed:

| Packet range / family | Status | Notes |
|---|---|---|
| Early `FP-META-*` packets before `FP-META-017` | `HISTORICAL` / `UNKNOWN` | Preserve as standards/evaluation history; review individually before calling superseded. |
| Early `FP-*` implementation packets before `FP-013` | `HISTORICAL` / `COMPLETED` | Many are core implementation history; use run evidence before making current claims. |
| Early `FP-MCP-*` bridge packets before `FP-MCP-153` | `HISTORICAL` / `UNKNOWN` | Preserve as MCP bridge history; review individually before current use. |
| `FP-MCP-153` through `FP-MCP-157` | `COMPLETED` | Current worker telemetry/MCP evidence chain. |
| `FP-MCP-158` | `COMPLETED` | Checklist creation; namespace drift example. |

## Operator Guidance

When looking at an old packet:

1. Do not rename it.
2. Do not move it.
3. Do not delete it.
4. Check whether committed run evidence exists.
5. Check whether a later packet supersedes or refines it.
6. If uncertain, mark `UNKNOWN`, not failed.

## Boundary

This index is an operator navigation aid.

It is not the evidence itself.

It must not be used to admit evidence, rank models, route work, or rewrite project history.
