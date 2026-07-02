# SHADOW-REF-006 Closure Notes

## Baseline hash is the extraction reference

The `src/server.ts` baseline captured by SHADOW-REF-006 is:

```text
sha256: 8412f3a74973a4ca6740a89581e0ea9476f5d01d35f5207f3193ebfee825ba1e
lines: 10364
bytes: 328906
bridge commit: 3a16d68
```

Future shadow-extraction packets must reference this SHADOW-REF-006 baseline hash when proving that extraction preserved behavior or when explaining intentional source movement.

They must not silently replace this baseline by re-deriving a fresh pre-extraction hash.

## Tool enumeration method

The 29 registered MCP tools in SHADOW-REF-006 were enumerated by static parsing of `/home/ridasaidd/forgepilot-chatgpt-mcp/src/server.ts` for `mcpServer.registerTool(...)` calls.

The MCP server was not started to enumerate the tools.

Therefore the tool-contract snapshot is:

```text
TIER_2_VERIFIED_ARTIFACT_STATIC_SOURCE_PARSE
```

not:

```text
TIER_2_VERIFIED_ARTIFACT_LIVE_SERVER_ENUMERATION
```

## Boundary confirmation

The baseline verification did run bridge build/test commands:

```text
pnpm build
pnpm test
```

but did not restart services, switch live entrypoints, execute OpenCode workers, or launch the MCP server for contract enumeration.
