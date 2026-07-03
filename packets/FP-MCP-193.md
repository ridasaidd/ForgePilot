# FP-MCP-193 — Source-Backed MCP Server Design Guidance

## Task

Record source-backed guidance for ForgePilot MCP server design so future work keeps terminal access secondary and develops primary operational control through safe, explicit MCP tools/resources/prompts.

## Context

After FP-MCP-192 live-confirmed the clarified non-executing request-artifact tool surface, the operator asked to look for online examples and guidance on properly developing MCP servers without violating OpenAI safety expectations.

## Sources Reviewed

```text
OpenAI Apps SDK Reference
OpenAI Apps SDK Security & Privacy Guide
OpenAI MCP and Connectors Guide
Model Context Protocol Tools specification
Model Context Protocol Resources specification
Model Context Protocol Prompts specification
modelcontextprotocol/servers reference repository
Recent MCP security/runtime-fault research and incident reporting
```

## Key Findings

```text
1. Tools are model-controlled and may be invoked automatically by the model; human-in-the-loop confirmation is recommended for trust and safety.
2. Resources are application-driven context and are a better fit for exposing read-only observatory data, packet state, run state, and evidence summaries.
3. Prompts are user-controlled templates and are a good fit for explicit workflows like “prepare execution decision review” or “summarize evidence for packet”.
4. OpenAI annotations must be truthful: readOnlyHint only when the tool does not create, update, delete, or send data.
5. Annotation hints influence ChatGPT framing only; ForgePilot must still enforce authorization, validation, policy gates, and audit logging server-side.
6. Sensitive actions should require explicit approval flows and careful review/logging of data shared with MCP servers.
7. Reference MCP servers are educational examples, not production-ready solutions; ForgePilot must keep its own threat model, admission gates, and evidence ledger.
8. MCP security literature and incidents show that tool composition, prompt injection, excessive permissions, and supply-chain trust are real risks.
```

## ForgePilot Design Consequences

```text
Terminal access remains secondary/debug/development control.
Primary control should move toward typed ForgePilot MCP tools, resources, and prompts.
Read-only observatory views should become MCP resources, not terminal commands.
Operator-selected workflows should become MCP prompts, not hidden model plans.
Mutating operations should remain tools with truthful non-read-only metadata.
Execution-adjacent tools must state non-execution boundaries explicitly.
Every mutating tool should produce structured, append-only evidence.
No tool should rely on ChatGPT annotations as the only safety boundary.
```

## Recommended Next Implementation Direction

```text
1. Add ForgePilot MCP resources for packet, run, request, approval, evidence, and ledger summaries.
2. Add user-controlled prompts for recurring operator workflows.
3. Reduce terminal usage to development-only fallback and debugging.
4. Keep execution enablement behind fresh tuple + explicit approval + consumed approval + disabled switch gates.
5. Continue avoiding rephrasing or metadata changes designed only to bypass platform checks.
```

## Expected Result

```text
FP_MCP_193_SOURCE_BACKED_MCP_SERVER_DESIGN_GUIDANCE_RECORDED
```
