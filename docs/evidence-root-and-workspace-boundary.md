# Evidence Root and Workspace Boundary

## Purpose

Define where ForgePilot core evidence ends, where project workspace evidence begins, and how reconstruction/reporting must scope its inputs.

## Core Rule

```text
A project workspace artifact is not ForgePilot core evidence unless a report explicitly scopes that project workspace as an input.
```

## Terms

| Term | Meaning |
|---|---|
| ForgePilot core repository | The source repository containing ForgePilot implementation, core docs, migrations, tests, root packets, and core governance evidence. |
| ForgePilot evidence root | The explicit filesystem root from which a report/reconstruction command reads evidence. |
| Project workspace root | A root containing project-specific packets, plans, runs, audits, comparisons, observations, and model outputs. |
| Instrument-project workspace | A project workspace for tooling used to operate ForgePilot, such as the ChatGPT MCP bridge. |
| Observed-project workspace | A project workspace for external software being observed by ForgePilot. |
| Bootstrap internal workspace | Historical project workspace content currently stored under the ForgePilot core repository during bootstrap. |

## Current Bootstrap Internal Workspace

The current bootstrap internal workspace is:

```text
instrument-projects/forgepilot-chatgpt-mcp/
```

This content is historical bootstrap evidence.

It must be preserved, not casually renamed, deleted, or moved.

## Future Preferred Layout

The preferred future layout is:

```text
/home/ridasaidd/forgepilot
  # ForgePilot core repository

/home/ridasaidd/forgepilot-workspaces
  # ForgePilot-managed project/evidence workspaces

/home/ridasaidd/forgepilot-chatgpt-mcp
  # Actual MCP bridge source repository
```

Project-specific packets, plans, checklists, runs, audits, comparisons, observations, and model outputs should eventually live under a project workspace root outside the ForgePilot core repository.

## Reconstruction and Reporting Scope

Core ForgePilot reports may read core evidence from explicit root-relative locations such as:

```text
packets/
runs/
docs/
```

Project workspace reports may read project evidence only when the project workspace root is explicitly selected.

Core reconstruction must not silently include:

```text
instrument-projects/
observed-projects/
```

unless a report explicitly declares that project workspace as input.

## Bootstrap Evidence Rule

Bootstrap internal workspace evidence may remain in the ForgePilot core repository for historical continuity.

However, its existence must not cause core V1 reports to treat project-specific packets or runs as core packets or runs.

## Current Conformance Status

Current conformance is evaluated in:

```text
runs/FP-META-030/reconstruction-path-boundary-check.txt
runs/FP-META-030/path-search-results.txt
runs/FP-META-030/reporting-source-excerpts.txt
```

The boundary rule is defined here, but operational conformance must be checked against code and not inferred from this document alone.



## Trust Classification for Current Check

```text
TIER_1_STATIC_SOURCE_INSPECTION
```

The FP-META-030 conformance check is based on command-captured grep output and focused source excerpts.

It is stronger than narrative self-report because the searched paths and source excerpts are committed as artifacts.

It is weaker than runtime tracing because it does not capture the actual paths read during an instrumented report run.

## Current Code Safety Caveat

The boundary rule is admitted as governance.

Current code appears conformant under static source inspection, but structural safety is not guaranteed by construction because reporting code can default `rootDir` to `process.cwd()`.

Therefore, future external workspace support must make evidence-root selection explicit before mixed core/project reporting becomes operational.

## Non-Goals

This document does not migrate files, implement external workspace support, change reporting behavior, or generate admission distribution reports.

## Boundary

A written boundary is governance.

A verified boundary requires evidence from code behavior or source/path inspection.
