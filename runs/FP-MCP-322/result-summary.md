# FP-MCP-322 Result Summary

## Result

```text
FP-MCP-322 added a local-only MCP client script in the bridge repo that reads a JSON input file, calls exactly one allowed guarded executor tool through the running MCP server, and writes the full MCP result JSON to an explicit output path.
```

## Summary

The MCP bridge now contains scripts/local-guarded-apply.mjs. The script uses the installed MCP SDK streamable HTTP client, requires the bearer token from the operator environment, allows only forgepilot_apply_guarded_canary_next_gate, accepts input and output file paths, and writes a structured result JSON. The script was syntax-checked with node --check and committed in the bridge as 11d4490.

## Boundary

No execution was authorized. No approval was consumed. The disable switch was not cleared. The runner start endpoint was not contacted. OpenCode was not started. FP-027 did not run.
