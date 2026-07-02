# SHADOW-REF-002 — server.ts High-Risk Zones

## Boundary

This artifact is read-only risk analysis.

It is not a refactor plan, not an implementation, not an audit, and not authorization to modify the live MCP bridge server.

## Baseline

| Field | Value |
|---|---|
| Source repository | `/home/ridasaidd/forgepilot-chatgpt-mcp` |
| Branch | `feature/oauth-auth0` |
| Commit | `3a16d68` |
| File | `src/server.ts` |
| Size | `10,364` lines |
| Live entrypoint | `src/server.ts` |
| Input structure map | `plans/SHADOW-REF-001-server-structure-map.md` |

## Risk Scale

| Level | Meaning |
|---|---|
| `CRITICAL` | Changing this can break ChatGPT-to-MCP connectivity, execution safety, auth, approval integrity, or public tool contracts. Defer until late and require dedicated proof. |
| `HIGH` | Changing this can corrupt evidence, alter policy semantics, or break important tool behavior. Requires targeted packet and audit. |
| `MEDIUM` | Changing this can break helper behavior or project assumptions but is likely mechanically extractable with focused verification. |
| `LOW` | Likely extractable with simple tests/smoke checks if dependencies are controlled. |

## High-Risk Zone Table

| Zone | Approx. lines | Risk | Why risky | Guardrail |
|---|---:|---|---|---|
| HTTP `/mcp` transport and server startup | 10268–10364 | `CRITICAL` | This is the runtime connectivity path used by ChatGPT. A mistake can disconnect the orchestrator. | Do not touch until candidate is assembled and switch packet exists. |
| OAuth/auth gate | 10–11, 10274–10315 | `CRITICAL` | Auth mode, protected resource metadata, and `WWW-Authenticate` behavior are externally visible. | No early extraction. Any change requires auth-specific smoke/proof. |
| MCP tool names and schemas | 9280–10268 | `CRITICAL` | Tool names and input schemas are the instrument contract with ChatGPT/OpenAI Actions. | No schema/name changes unless explicitly scoped as instrument-contract work. |
| `forgepilot_execute_terminal_command` tool | ~10229–10268 | `CRITICAL` | This is the current command execution path and approval boundary. | Defer; requires direct ChatGPT invocation proof after any change. |
| Human approval validation | 3821–4240 | `CRITICAL` | Approval text, secret checks, IDs, and committed evidence checks protect human authorization. | No semantic edits. Extract only after tests and audit exist. |
| Human approval recording/consumption | 4240–5669 | `CRITICAL` | Consumption records and real approval evidence must remain append-only and non-mutating. | Dedicated packet and audit required. |
| Execution preflight gates | 2341–2806 | `HIGH` | Gate semantics prevent unauthorized starts and encode safety reasons. | Extract only with before/after fixture checks. |
| Execution enablement / disable switch | 3464–3815 | `HIGH` | Disable switch and enablement policy prevent accidental execution. | Do not combine with unrelated refactor. |
| Remote runner start request | 8093–9014, ~10154 | `HIGH` | Controls when a remote run may start and what evidence is required. | No-contact/contact boundary must be preserved. |
| Remote runner validate/capability helpers | 1200–1320, 1970–2065, ~9596 | `HIGH` | Some tools may contact configured validate/capabilities endpoints but not start execution. | Preserve contact boundary exactly. |
| Artifact path/id validation | 1134–1608, 2814–3451 | `HIGH` | Mistakes risk path traversal, wrong evidence writes, or corrupted artifact semantics. | Extract with path traversal and invalid-id checks. |
| OpenCode request artifact creation | 9014–9240, ~9489 | `HIGH` | Request artifacts are part of evidence chain and model-run handoff. | Requires artifact shape comparison. |
| Guarded-start preflight report | 7302–8093, ~10124 | `HIGH` | Encodes readiness derivation and safety gates. | Extract only after input/output fixtures are captured. |
| Tool error wrapper | 9240–9280 | `MEDIUM` | Affects all tool responses and error codes. | Can be extracted early only if all tools still wrap errors identically. |
| Repository/git helpers | 29–146 | `MEDIUM` | Helpers touch git state and evidence commit discovery. | Good early candidate after baseline tests. |
| OpenCode status/capability helpers | 1122–1320 | `MEDIUM` | Read-only status but user-visible policy result. | Candidate for early extraction with JSON snapshot comparison. |

## Forbidden Early-Refactor Zones

The following should not be touched in the first implementation packets:

1. HTTP transport and `httpServer.listen`.
2. OAuth/auth gate and metadata endpoints.
3. MCP tool names, descriptions, schemas, and public registration order.
4. `forgepilot_execute_terminal_command` implementation path.
5. Human approval real evidence and consumption paths.
6. Remote runner start request behavior.
7. Execution enablement/disable switch semantics.

## Lower-Risk Candidate Zones

Lower-risk does not mean safe to edit without a packet. It means these are better candidates for the first tiny mechanical extraction after planning and audit.

| Candidate | Approx. lines | Why candidate |
|---|---:|---|
| Pure string/boolean field readers | 1673–1682, 1981–1990, 8994–9014 | Small helper logic; likely testable with simple fixtures. |
| Reason list normalization helpers | 1990–2000, 2353–2357, 3815 | Pure-ish helper behavior. |
| Tool error sanitization | 9240–9253 | Small and isolated, but affects all tools. |
| Packet/request id validation helpers | 1134–1608 | Cohesive, but security-sensitive; needs focused tests. |
| Git/repo helpers | 29–146 | Cohesive early utility region; must preserve working-directory assumptions. |
| OpenCode status/capability reporting | 1122–1320 | Mostly read-only status/capabilities. |

## Required Verification by Risk Type

| Risk type | Required verification before implementation acceptance |
|---|---|
| Tool contract | Compare tool names and schemas before/after; direct ChatGPT proof if changed. |
| Auth/OAuth | Metadata endpoint behavior, `/mcp` auth behavior, expected `WWW-Authenticate` behavior. |
| Terminal execution | Direct ChatGPT MCP invocation, approval evidence path, blocked-command behavior. |
| Human approval | Fixture validation for valid/invalid approval, secret-like text, consumption immutability. |
| Execution preflight | Before/after fixture outputs for pass/block reasons. |
| Remote runner | Explicit no-start proof unless packet is a start packet; endpoint contact boundaries. |
| Artifact paths | Invalid id/path traversal fixtures; expected artifact path snapshots. |
| Status/capabilities | JSON snapshot comparison. |
| Startup/transport | Build, service restart, `/mcp` transport smoke, direct ChatGPT tool call. |

## Implications for Future Shadow-Refactor Packets

1. The next packet should still be read-only planning or audit, not implementation.
2. Implementation should begin only after a model roster/profiling rule or project-specific model selection rule exists.
3. The first implementation packet should target a low/medium-risk helper, not transport, auth, approval, or terminal execution.
4. Public MCP tool schemas should be frozen during early refactor packets.
5. Runtime switch must remain late and dedicated.
6. Old `src/server.ts` remains live until switch proof exists.

## Recommended Next Checklist Item

```text
SR-003 — Propose shadow refactor plan
```

Recommended caveat: the plan should be planning-only and should explicitly preserve all CRITICAL zones until late-stage packets.

## Explicit Non-Refactor Statement

No MCP bridge files were changed by this risk analysis.

No `server-next.ts` was created.

No runtime entrypoint was changed.

No OpenAI Actions schema or MCP tool contract was changed.

No model implementation work was authorized.
