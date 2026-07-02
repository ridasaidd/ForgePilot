# MCP Bridge server.ts Shadow Refactor Checklist

## Project

```text
instrument-projects/forgepilot-chatgpt-mcp
```

## Source Repository

```text
/home/ridasaidd/forgepilot-chatgpt-mcp
```

## Baseline

```text
branch: feature/oauth-auth0
commit: 3a16d68
live entrypoint: src/server.ts
server.ts size at observation: 10,364 lines
```

## Boundary

This checklist is an evidence index and planning surface.

It is not evidence by itself, and it does not authorize model execution without a scoped packet.

The live MCP bridge entrypoint must remain unchanged until a switch packet verifies and authorizes a runtime switch.

## Checklist

| ID | Item | Status | Packet | Evidence | Model role | Boundary | Notes |
|---|---|---|---|---|---|---|---|
| SR-001 | Create server.ts structure map | `COMPLETE` | `packets/SHADOW-REF-001.md` | `plans/SHADOW-REF-001-server-structure-map.md` | `STRUCTURE_MAPPER` | Structure map is not a refactor plan or implementation. | Read-only; completed from committed analysis artifact. |
| SR-002 | Identify high-risk zones | `NOT_STARTED` | — | — | `RISK_ANALYST` | Risk list does not authorize edits. | Include auth, approval, tool contracts, service startup. |
| SR-003 | Propose shadow refactor plan | `NOT_STARTED` | — | — | `PLANNER` | Plan does not authorize implementation. | Must preserve live entrypoint. |
| SR-004 | Audit shadow refactor plan | `NOT_STARTED` | — | — | `AUDITOR` | Audit acceptance is not execution proof. | Cross-model audit preferred. |
| SR-005 | Define candidate file/module layout | `NOT_STARTED` | — | — | `PLANNER` | Layout is not implementation. | Example: `src/server-next.ts`, `src/server-next/`. |
| SR-006 | First tiny mechanical extraction candidate | `NOT_STARTED` | — | — | `EXECUTOR_CANDIDATE` | Candidate extraction must not switch runtime entrypoint. | Scope must be one extraction only. |
| SR-007 | Candidate build verification | `NOT_STARTED` | — | — | `VERIFIER` | Build pass is not operational proof. | No service switch. |
| SR-008 | Candidate smoke verification | `NOT_STARTED` | — | — | `VERIFIER` | Smoke pass is not direct ChatGPT proof. | Compare behavior where feasible. |
| SR-009 | Switch packet readiness review | `NOT_STARTED` | — | — | `AUDITOR` | Readiness review does not switch service. | Requires rollback path. |
| SR-010 | Runtime switch to refactored candidate | `NOT_STARTED` | — | — | `EXECUTOR_CANDIDATE` | Switch requires dedicated packet and direct operational proof. | Dangerous step. |
| SR-011 | Direct ChatGPT MCP proof after switch | `NOT_STARTED` | — | — | `VERIFIER` | Direct proof validates connectivity, not global correctness. | Required before cleanup. |
| SR-012 | Old implementation cleanup | `NOT_STARTED` | — | — | `EXECUTOR_CANDIDATE` | Cleanup only after successful switch/proof. | Separate cleanup packet. |

## Deferred

OpenCode plugin integration is deferred.

ForgePilot CLI checklist management is deferred.

## Next Suggested Item

```text
SR-002 — Identify high-risk zones
```

This should become the first project-specific packet under:

```text
instrument-projects/forgepilot-chatgpt-mcp/packets/
```
