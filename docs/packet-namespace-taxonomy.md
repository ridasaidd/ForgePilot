# Packet Namespace Taxonomy

## Purpose

ForgePilot packet IDs must communicate the primary domain of the work.

Do not default to `FP-MCP-*` merely because the current development phase or current ChatGPT session is focused on the MCP bridge.

Use the narrowest applicable namespace.

## Governing Rule

Existing packet IDs remain historical.

Do not rename, move, or rewrite historical packet IDs merely to match this taxonomy.

For new packets:

```text
Choose the namespace of the primary artifact or rule being changed.
```

If a packet touches multiple areas, classify by the primary deliverable.

If the primary deliverable is unclear, prefer the namespace that best describes the durable artifact being committed, not the tool used to commit it.

## Namespaces

### `FP-*` — Core ForgePilot Capability

Use `FP-*` for core ForgePilot observatory/product implementation.

This includes durable behavior in the ForgePilot repo itself, such as:

- SQLite persistence for core observatory concepts,
- packet/evidence/admission/reporting CLI behavior,
- core database modules,
- core migrations,
- core tests,
- supported read-only query surfaces inside ForgePilot,
- reporting commands that reconstruct packet state.

Examples:

| Work | Namespace |
|---|---|
| Add SQLite table for packet reports | `FP-*` |
| Implement admission persistence | `FP-*` |
| Add report CLI over admitted evidence | `FP-*` |
| Add verification-state reconstruction query | `FP-*` |

### `FP-META-*` — Standards, Semantics, and Governance

Use `FP-META-*` for rules, standards, methodology, and design governance.

This includes:

- trust tier definitions,
- validation/admission semantics,
- packet lifecycle rules,
- completion criteria,
- namespace taxonomy,
- evaluation standards,
- process constraints,
- architectural freeze or boundary rules.

Examples:

| Work | Namespace |
|---|---|
| Define trust tier standards | `FP-META-*` |
| Define what V1 complete means | `FP-META-*` |
| Define packet namespace rules | `FP-META-*` |
| Define admission eligibility semantics | `FP-META-*` |

### `FP-MCP-*` — MCP Bridge, Tools, and Actions Integration

Use `FP-MCP-*` only when the primary work is about the ChatGPT MCP bridge/tool/action/server integration.

This includes:

- adding or changing MCP tools,
- bridge server implementation,
- OpenAI Actions schema behavior,
- direct MCP smoke proofs,
- MCP bridge auth/server/transport behavior,
- MCP wrapper code that exposes ForgePilot capabilities to ChatGPT.

Examples:

| Work | Namespace |
|---|---|
| Expose a ForgePilot query as an MCP tool | `FP-MCP-*` |
| Add MCP bridge auth behavior | `FP-MCP-*` |
| Record direct MCP smoke proof for a new tool | `FP-MCP-*` |
| Document manual OpenAI Actions refresh as an MCP operational caveat | usually `FP-OPS-*`, unless primary artifact is bridge behavior |

Boundary:

Using an MCP tool to edit files does not make the packet `FP-MCP-*`.

The packet is `FP-MCP-*` only when MCP bridge/tool/action integration is the primary subject.

### `FP-OPS-*` — Operator Workflow, Checklists, and Runbooks

Use `FP-OPS-*` for operator-facing workflow and operational control artifacts.

This includes:

- progress checklists,
- runbooks,
- handoff procedures,
- manual OpenAI Actions refresh procedure,
- operational caveats,
- session bootstrap procedures,
- maintenance checklists.

Examples:

| Work | Namespace |
|---|---|
| Create ForgePilot progress checklist | `FP-OPS-*` |
| Document manual Actions schema refresh steps | `FP-OPS-*` |
| Create next-session bootstrap handoff procedure | `FP-OPS-*` |
| Create release checklist | `FP-OPS-*` |

## Namespace Selection Examples

| Proposed packet | Correct namespace | Reason |
|---|---|---|
| Add SQLite reporting table | `FP-*` | Core ForgePilot implementation. |
| Define reporting evidence rules | `FP-META-*` | Standards/semantics. |
| Expose reporting through ChatGPT MCP | `FP-MCP-*` | MCP tool integration. |
| Add report-running operator checklist | `FP-OPS-*` | Operator workflow. |
| Add telemetry aggregation CLI | `FP-*` | Core implementation. |
| Define telemetry aggregation safety rules | `FP-META-*` | Governance/semantics. |
| Add MCP query for telemetry aggregation | `FP-MCP-*` | MCP exposure. |
| Update progress checklist after evidence commit | `FP-OPS-*` | Operational tracking. |

## Historical Note

Some existing packets may be broader than their namespace suggests.

For example, `FP-MCP-158` created the first progress checklist even though future checklist work should usually use `FP-OPS-*`.

This taxonomy is forward-looking.

Historical packet IDs remain valid historical evidence.

## Anti-Patterns

Do not choose a namespace because:

- the current session happens to be about MCP,
- the assistant used an MCP terminal tool to edit files,
- the packet number is the next available number in a familiar sequence,
- the work feels adjacent to recent work but changes a different primary artifact.

Do choose a namespace because:

- it matches the primary durable artifact,
- it matches the semantic layer being changed,
- it makes future packet browsing easier,
- it avoids turning `FP-MCP-*` into a catch-all bucket.

## Quick Decision Rule

```text
Is the packet changing core ForgePilot behavior?        → FP-*
Is the packet defining rules/semantics/process?         → FP-META-*
Is the packet changing MCP bridge/tool/action behavior? → FP-MCP-*
Is the packet changing operator docs/checklists/runbooks? → FP-OPS-*
```


## Post-V1 Project Boundary

After ForgePilot V1.0, root ForgePilot packets are reserved for ForgePilot core work: observatory rules, evidence semantics, reporting, admission/comparison semantics, operator workflows, core implementation, and instrument-contract changes.

Project-specific work must live in a project workspace unless it changes ForgePilot itself.

Instrument projects live under:

```text
instrument-projects/<project>/
```

External observed projects live under:

```text
observed-projects/<project>/
```

The MCP bridge is classified as an instrument project. Pre-V1 `FP-MCP-*` packets remain historical bootstrap evidence and must not be moved or renamed.

See `docs/core-instrument-observed-project-boundaries.md`.
