# FP-MCP-149 — OpenCode Local Telemetry Inventory

## Task

Create an auditable inventory of local OpenCode run telemetry before changing the long-running OpenCode server state.

## Goal

Preserve useful non-sensitive execution metadata that may not yet be represented in ForgePilot evidence.

## Scope

Create inventory artifacts under:

`runs/FP-MCP-149/`

The inventory must focus on metadata, not raw application content.

Allowed metadata includes:

- process and listener summary,
- candidate state directory names,
- file paths,
- file sizes,
- modified timestamps,
- file types,
- safe hashes where appropriate,
- mappings to ForgePilot packet ids and run ids,
- list of skipped files or directories with reasons.

## Boundaries

Do not copy whole application state directories.

Do not stop, restart, or kill OpenCode in this packet.

Do not mutate OpenCode local state.

Prefer metadata inventory over content capture.

## Deliverables

Create:

- `runs/FP-MCP-149/opencode-process-inventory.md`
- `runs/FP-MCP-149/opencode-state-inventory.json`
- `runs/FP-MCP-149/forgepilot-run-artifact-inventory.json`
- `runs/FP-MCP-149/capture-summary.md`

## Acceptance Criteria

1. OpenCode process/listener state is recorded.
2. Local OpenCode state is inventoried by metadata.
3. ForgePilot run artifacts related to OpenCode are inventoried.
4. Skipped files are listed with reasons.
5. A clear stop/restart recommendation is recorded.
6. OpenCode remains running at the end of the packet.
