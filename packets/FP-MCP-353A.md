# FP-MCP-353A — Correct MCP tool contract manifest coverage

## Checkpoint Type

```text
TOOL_CONTRACT_MANIFEST_CORRECTION
```

## Summary

The MCP bridge correction in commit 43b2002 updated src/tool-registry/tool-contracts.ts and scripts/check-tool-contracts.mjs. The checker now scans src/server.ts, src/tool-groups/*.ts, and src/tool-registrations/recent-tools.ts. Verification showed 78 expected tools, 78 registered tools, 78 contracts, 11 ChatGPT-safe contracts, no duplicate registered tools, no duplicate contracts, no missing contracts, and no extra contracts. pnpm build and pnpm test passed. No runtime behavior changed.

## Claim

```text
FP-MCP-353A corrected the MCP tool contract manifest and checker to include the 10 additional tools registered through src/tool-registrations/recent-tools.ts, establishing exact coverage of all 78 actual registered bridge tools while keeping the ChatGPT-safe surface at 11 tools.
```

## Caveats

- FP-MCP-353A is a corrective manifest/checker patch required before FP-MCP-354 surface filtering.
- The corrected actual static registration surface is 78 tools, not the previously recorded 68.
- The 10 recent-tools registrations were conservatively classified outside chatgpt-safe.
- The running MCP service may still be using old loaded code until service restart/action refresh.
- The bridge branch remains ahead of origin until pushed manually.

## Boundaries

- Did not modify MCP runtime behavior.
- Did not move tool registrations.
- Did not add MCP tools.
- Did not remove MCP tools.
- Did not change tool names, descriptions, input schemas, output schemas, annotations, approval literals, or handlers.
- Did not implement surface filtering.
- Did not hide tools.
- Did not restart MCP.
- Did not start OpenCode.
- Did not contact runner start.
- Did not create clearance.
- Did not create enablement.
- Did not consume approval.
- Did not clear the disable switch.
- Did not modify .local/forgepilot/*.

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
FP-MCP-353A corrected the MCP tool contract manifest and checker to include the 10 additional tools registered through src/tool-registrations/recent-tools.ts, establishing exact coverage of all 78 actual registered bridge tools while keeping the ChatGPT-safe surface at 11 tools.
```
