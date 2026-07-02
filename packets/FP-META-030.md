# FP-META-030 — Evidence Root and Workspace Boundary

## Task

Define ForgePilot evidence-root and project-workspace boundaries, and record a current-code boundary conformance check.

## Goal

Prevent ForgePilot core reconstruction/reporting from silently including instrument-project or observed-project workspace evidence unless explicitly scoped.

FP-META-030 answers two questions:

> Where does ForgePilot core evidence end and project workspace evidence begin?

> Does the current reconstruction/reporting code appear to respect that boundary?

## Background

ForgePilot currently stores bootstrap instrument-project files inside the ForgePilot core repository under:

```text
instrument-projects/forgepilot-chatgpt-mcp/
```

That was useful for bootstrapping, but it creates a risk: core reconstruction/reporting code may implicitly walk project-workspace evidence as if it were ForgePilot core evidence.

A written boundary rule is governance. A checked boundary is evidence.

## Scope

Add:

```text
docs/evidence-root-and-workspace-boundary.md
runs/FP-META-030/reconstruction-path-boundary-check.txt
runs/FP-META-030/path-search-results.txt
```

Update:

```text
docs/forgepilot-progress-checklist.md
```

## Required Boundary Rules

The boundary document must define:

- ForgePilot core repository,
- ForgePilot evidence root,
- project workspace root,
- instrument-project workspace,
- observed-project workspace,
- bootstrap internal workspace,
- reconstruction/reporting scope,
- future external workspace handling.

## Required Verification Method

The boundary check must not be only a narrative self-report.

It must include concrete search output from the current codebase for path traversal and reporting/reconstruction behavior, including at least:

```text
readdir
readdirSync
glob
fast-glob
walk
packets
runs
instrument-projects
observed-projects
final-v1-project-report
project-summary
reconstruct
```

The artifact must state whether current conformance is:

```text
BOUNDARY_RULE_DEFINED_AND_CURRENT_CODE_APPEARS_CONFORMANT
BOUNDARY_RULE_DEFINED_WITH_CONFORMANCE_GAP
BOUNDARY_RULE_DEFINED_CONFORMANCE_NOT_YET_PROVEN
```

## Required Boundary

A project workspace checklist, packet, plan, run, audit, comparison, model output, or observation is not ForgePilot core evidence unless a report explicitly scopes that project workspace as an input.

Bootstrap internal workspace evidence must be preserved as historical evidence but must not be silently treated as core V1 evidence.

## Safety Requirements

This packet must not migrate files, delete files, rename historical packets, move historical packets, refactor code, change reconstruction behavior, change reporting behavior, execute models, or continue the MCP bridge implementation.

## Non-Goals

This packet does not implement an external workspace root, migrate existing project workspace files, fix conformance gaps, implement invalidation propagation, or generate an admission distribution report.

## Acceptance Criteria

1. Boundary document exists.
2. Current-code path boundary check artifact exists.
3. Search results are captured as evidence, not only summarized.
4. Any conformance gap is recorded honestly.
5. Follow-up requirement is recorded if conformance is not proven.
6. No implementation code changes are made.
7. Final git status is clean after evidence is recorded.
