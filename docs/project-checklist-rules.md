# Project Checklist Rules

## Purpose

Project checklists let ForgePilot guide work in instrument and observed projects without turning every task into root ForgePilot scope.

A project checklist is an evidence-bound planning surface for creating scoped packets and model-worker tasks.

## Core Boundary

```text
A checklist is an evidence index and planning surface.

It is not evidence by itself.
It does not authorize model execution without a scoped packet.
```

## Checklist Location

Instrument project checklists live under:

```text
instrument-projects/<project>/checklists/
```

External observed project checklists live under:

```text
observed-projects/<project>/checklists/
```

## Checklist File Format

The first implementation may be Markdown.

A later ForgePilot CLI or SQLite implementation may introduce structured JSON or database-backed state, but that is deferred.

## Required Checklist Fields

Each checklist item should include:

| Field | Meaning |
|---|---|
| ID | Stable item identifier. |
| Item | Short description of the task/capability. |
| Status | Current checklist state. |
| Packet | Packet that scopes or completed the item. |
| Evidence | Evidence path proving the status. |
| Model role | Model role if a model worker is involved. |
| Boundary | What the item must not be overinterpreted as proving. |
| Notes | Optional detail. |

## Allowed Statuses

| Status | Meaning |
|---|---|
| `NOT_STARTED` | Item is planned but no packet has begun. |
| `PACKET_READY` | A scoped packet exists, but execution has not completed. |
| `IN_PROGRESS` | Work has begun. |
| `BLOCKED` | Work cannot proceed without resolving a blocker. |
| `COMPLETE` | Evidence exists for the item's scoped completion. |
| `REJECTED` | Attempted work was rejected. |
| `DEFERRED` | Item is intentionally outside the current scope. |
| `UNKNOWN` | State cannot be determined from available evidence. |

## Update Rule

A checklist item may be marked `COMPLETE` only when the Evidence column points to committed evidence.

A checklist item may be marked `PACKET_READY` only when the Packet column points to an existing scoped packet.

A checklist item must remain `NOT_STARTED`, `IN_PROGRESS`, `UNKNOWN`, or `BLOCKED` if the required evidence does not exist.

## Packet Handoff Rule

Models must not receive a checklist item directly as an unbounded instruction.

The workflow is:

```text
checklist item
↓
scoped packet
↓
model-worker task
↓
verification/audit evidence
↓
checklist update
```

## Model Worker Boundary

Checklist items may mention model roles, but a model is not authorized to act until a scoped packet defines:

- task,
- allowed files,
- forbidden files,
- non-goals,
- required artifacts,
- verification commands,
- audit requirements,
- rollback expectations where applicable.

## Evidence Boundary

A checklist summarizes evidence. It does not create evidence.

A checklist may point to:

- packet files,
- run artifacts,
- verification results,
- audit results,
- comparison results,
- committed model outputs,
- project reports.

It must not upgrade a claim beyond the cited evidence.

## OpenCode Plugin Deferral

An OpenCode plugin is not required for the first checklist implementation.

The first implementation is file-based and ForgePilot-managed.

A plugin may be considered later if repeated observations show that manual handoff between checklist, packet, model run, and evidence recording creates unacceptable friction.

## CLI Deferral

ForgePilot CLI commands for checklist management are deferred.

Potential future commands:

```text
pnpm fp -- project-checklist --project <project>
pnpm fp -- next-checklist-item --project <project>
pnpm fp -- update-checklist-item --project <project> --item <id> --status <status>
```

These commands are not implemented by this packet.

## Boundary

These rules define checklist semantics.

They do not implement checklist persistence, execute models, select models, start project work, or create an OpenCode plugin.
