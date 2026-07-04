# FP-MCP-323 Local Handoff Inputs

This directory is for local-operator input artifacts only.

Do not run expired FP-MCP-320 artifacts.
Use fresh short-lived approval, clearance, capability observation, and scoped enablement.

The local client script is in the MCP bridge repo:

`/home/ridasaidd/forgepilot-chatgpt-mcp/scripts/local-guarded-apply.mjs`

The operator should create a fresh JSON input file here only after the sequencer reports the final expected local gate.

Required result path convention:

`runs/FP-MCP-323/local-handoff-inputs/local-client-result.json`

Stop after the first returned result.
