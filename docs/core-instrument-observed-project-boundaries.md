# Core, Instrument, and Observed Project Boundaries

## Purpose

Define where ForgePilot work belongs after V1.0.

ForgePilot must remain an observatory, not a dumping ground for every project-specific task it observes.

## Three Project Classes

| Class | Meaning | Packet location | Example |
|---|---|---|---|
| ForgePilot core | Project-agnostic observatory rules, evidence semantics, reporting, persistence, admission, comparison, and operator workflows. | `packets/` | `FP-META-*`, `FP-OPS-*`, `FP-*` |
| Instrument project | A separate project required for ForgePilot operation or observation. It is not ForgePilot core, but ForgePilot depends on it. | `instrument-projects/<project>/` | `forgepilot-chatgpt-mcp` |
| External observed project | A separate project being studied by ForgePilot but not required for ForgePilot operation. | `observed-projects/<project>/` | `terminal-explorer`, future repos |

## Core Rule

```text
ForgePilot root packets define the observatory.

Instrument-project and observed-project packets describe work being observed by the observatory.
```

## ForgePilot Core Packets

Use root `packets/` for work that changes or defines project-agnostic ForgePilot behavior, including:

- evidence semantics,
- packet lifecycle semantics,
- admission semantics,
- comparison semantics,
- model profiling rules,
- allowed-model policy,
- reporting rules,
- observed-project workspace layout,
- instrument-project boundaries,
- operator workflows,
- ForgePilot core implementation,
- MCP instrument contract changes.

## Instrument Projects

An instrument project is a project that is separate from ForgePilot core but required for ForgePilot operation.

The first instrument project is:

```text
instrument-projects/forgepilot-chatgpt-mcp/
```

The MCP bridge is an instrument project because:

- it is a separate repository,
- it is not ForgePilot core logic,
- ChatGPT uses it to operate ForgePilot,
- ForgePilot depends on it for MCP-based orchestration,
- normal engineering work on it should be observed separately.

## External Observed Projects

External observed projects are projects ForgePilot studies but does not depend on operationally.

They should live under:

```text
observed-projects/<project>/
```

External observed project packets must not be placed in root ForgePilot `packets/` unless the work changes ForgePilot itself.

## Instrument Project Workspace Layout

Each instrument project should use this layout:

```text
instrument-projects/<project>/
  README.md
  packets/
  plans/
  runs/
  model-results/
  audits/
  comparisons/
  observations/
```

Recommended meanings:

| Path | Meaning |
|---|---|
| `packets/` | Project-specific task packets. |
| `plans/` | Human or model-created plans. |
| `runs/` | Execution and verification artifacts. |
| `model-results/` | Raw or summarized model outputs. |
| `audits/` | Audit artifacts. |
| `comparisons/` | Cross-model or implementation comparisons. |
| `observations/` | Operational observations about the project. |

## When MCP Bridge Work Belongs in Root Packets

MCP bridge work belongs in root ForgePilot packets only when it changes the observatory instrument contract.

Examples:

- new MCP tool capability,
- OpenAI Actions schema change,
- new approval/evidence contract,
- new telemetry capture contract,
- new direct ChatGPT invocation proof requirement,
- bridge-to-ForgePilot evidence protocol changes,
- security or safety boundary changes that affect the observatory.

## When MCP Bridge Work Belongs in the Instrument Project Workspace

MCP bridge work belongs under `instrument-projects/forgepilot-chatgpt-mcp/` when it is project-specific engineering work.

Examples:

- `server.ts` shadow refactor,
- module extraction,
- internal helper cleanup,
- test organization,
- internal build cleanup,
- implementation planning for bridge-only maintainability,
- model benchmarking on bridge refactor tasks.

## Historical FP-MCP Packets

Pre-V1 `FP-MCP-*` packets remain valid historical bootstrap evidence.

They must not be renamed, moved, deleted, or rewritten to match the post-V1 boundary.

Their classification is:

```text
Historical bootstrap packets for the ForgePilot MCP instrument.
```

Post-V1 MCP bridge implementation work should use the instrument-project workspace unless it changes the instrument contract.

## Shadow Refactoring Classification

The MCP bridge `server.ts` shadow refactor is an instrument-project task.

It should be planned and recorded under:

```text
instrument-projects/forgepilot-chatgpt-mcp/
```

A future root ForgePilot packet may define general shadow-refactor rules, but the concrete `server.ts` refactor packets should be project-specific.

Shadow refactors must follow:

```text
docs/shadow-refactor-rules.md
```


## Model Roster Boundary

Global model roster and profiling rules belong in ForgePilot core because they define observatory policy.

Project-specific model results belong in the relevant project workspace.

For the MCP bridge shadow refactor, model outputs should go under:

```text
instrument-projects/forgepilot-chatgpt-mcp/model-results/
```

## Boundary

This document defines where work is recorded.

It does not start project work, admit evidence, rank models, route work, change MCP tools, or migrate historical packets.


## Project Checklists

Project-specific checklists must follow:

```text
docs/project-checklist-rules.md
```

For the MCP bridge shadow refactor, the initial checklist is:

```text
instrument-projects/forgepilot-chatgpt-mcp/checklists/server-shadow-refactor.md
```
