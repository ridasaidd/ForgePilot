# SHADOW-REF-006 FP-022 Tool Surface Correction Note

SHADOW-REF-006 recorded 29 registered MCP tools by static parsing of direct `mcpServer.registerTool(...)` calls in:

```text
src/server.ts
```

FP-022 expanded the static parse to include delegated registrations in:

```text
src/tool-registrations/recent-tools.ts
```

Expanded effective registered tool count:

```text
38
```

Disposition:

```text
TOOL_SURFACE_SNAPSHOT_INCOMPLETE_STATIC_SERVER_ONLY_PARSE
```

This does not invalidate the SHADOW-REF-006 `src/server.ts` hash baseline.

It does mean future tool-contract acceptance packets must use the expanded tool-surface parser rather than the server-only parser.
