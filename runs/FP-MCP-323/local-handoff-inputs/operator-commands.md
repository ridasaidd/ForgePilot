# FP-MCP-323 Operator Commands

This note is non-executing.

Use the local client only after fresh operator artifacts exist and the sequencer has confirmed the final local gate.

From the MCP bridge repo:

```bash
cd /home/ridasaidd/forgepilot-chatgpt-mcp
node scripts/local-guarded-apply.mjs \
  --input /home/ridasaidd/forgepilot/runs/FP-MCP-323/local-handoff-inputs/fresh-input.json \
  --output /home/ridasaidd/forgepilot/runs/FP-MCP-323/local-handoff-inputs/local-client-result.json
```

Required environment:

- `FORGEPILOT_MCP_TOKEN` must already be available to the local shell.
- Do not print or commit the token.

Stop after the first returned result.
