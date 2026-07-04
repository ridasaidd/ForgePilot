# FP-MCP-322 — Local Client Script Implementation Result

## Checkpoint Type

```text
TOOL_IMPLEMENTATION_RESULT
```

## Summary

The MCP bridge now contains scripts/local-guarded-apply.mjs. The script uses the installed MCP SDK streamable HTTP client, requires the bearer token from the operator environment, allows only forgepilot_apply_guarded_canary_next_gate, accepts input and output file paths, and writes a structured result JSON. The script was syntax-checked with node --check and committed in the bridge as 11d4490.

## Claim

```text
FP-MCP-322 added a local-only MCP client script in the bridge repo that reads a JSON input file, calls exactly one allowed guarded executor tool through the running MCP server, and writes the full MCP result JSON to an explicit output path.
```

## Caveats

- The script has not been used for the final local attempt in this session.
- The operator must provide fresh short-lived approval, clearance, capability observation, and scoped enablement before any final use.
- The bearer token is required from the local operator environment and is not printed or recorded.

## Boundaries

- No runner start endpoint contact by this checkpoint.
- No approval consumption by this checkpoint.
- No OpenCode start by this checkpoint.
- No canary run by this checkpoint.
- The script is intended to call one MCP tool per invocation and then stop.

## Non-Execution Boundary

```text
execution authorized: false
approval consumed: false
disable switch cleared: false
runner start endpoint contacted: false
OpenCode started: false
FP-027 canary run: false
```

## Expected Result

```text
FP-MCP-322 added a local-only MCP client script in the bridge repo that reads a JSON input file, calls exactly one allowed guarded executor tool through the running MCP server, and writes the full MCP result JSON to an explicit output path.
```
