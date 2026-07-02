# SHADOW-REF-004 — Shadow Refactor Plan Audit

## Boundary

This artifact is a read-only audit of a planning artifact.

It is not implementation, not model execution, not execution proof, and not authorization to modify the live MCP bridge server.

## Audited Artifact

```text
instrument-projects/forgepilot-chatgpt-mcp/plans/SHADOW-REF-003-shadow-refactor-plan.md
```

## Inputs Reviewed

```text
instrument-projects/forgepilot-chatgpt-mcp/plans/SHADOW-REF-001-server-structure-map.md
instrument-projects/forgepilot-chatgpt-mcp/plans/SHADOW-REF-002-high-risk-zones.md
instrument-projects/forgepilot-chatgpt-mcp/plans/SHADOW-REF-003-shadow-refactor-plan.md
docs/shadow-refactor-rules.md
docs/project-checklist-rules.md
```

## Verdict

```text
ACCEPTED_WITH_REQUIRED_FIXES_BEFORE_IMPLEMENTATION
```

The plan is acceptable as a planning artifact and safe to use for the next read-only/baseline packets.

It is not sufficient to authorize implementation yet.

## Scope Compliance Check

| Check | Result | Notes |
|---|---|---|
| Live entrypoint preserved | `PASS` | Plan explicitly keeps `src/server.ts` live until switch. |
| No implementation authorized | `PASS` | Plan states no implementation work is authorized. |
| Critical zones deferred | `PASS` | Auth, transport, tool schemas, terminal execution, approval, and remote runner start are deferred. |
| Candidate layout only proposed | `PASS` | Layout is explicitly not implementation order. |
| Model execution not authorized | `PASS` | Model participation boundaries are limited before implementation. |
| Switch requires dedicated packet | `PASS` | Switch and direct proof are separated into later packets. |

## Shadow-Refactor Rule Compliance

| Rule | Result | Notes |
|---|---|---|
| Live entrypoint preservation | `PASS` | `src/server.ts` remains live. |
| Candidate built beside live implementation | `PASS` | Candidate entrypoint is late-phase only. |
| No service switch before proof | `PASS` | Switch phase requires direct ChatGPT MCP proof. |
| Rollback preserved | `PASS` | Plan keeps old implementation through switch/proof. |
| Old implementation cleanup delayed | `PASS` | Cleanup is separate Phase 8. |
| Model workers bounded | `PASS` | Implementation authority requires later packet. |

## Risk-Zone Compliance

The plan respects the major CRITICAL zones identified in SHADOW-REF-002.

| Risk zone | Plan treatment | Result |
|---|---|---|
| HTTP `/mcp` transport/startup | Deferred to switch/late transport phase | `PASS` |
| OAuth/auth gate | Deferred to late/dedicated packet | `PASS` |
| MCP tool names/schemas | Frozen during early packets | `PASS` |
| `forgepilot_execute_terminal_command` | Deferred to late parity proof | `PASS` |
| Human approval validation/consumption | Dedicated safety/audit packet | `PASS` |
| Remote runner start | Dedicated remote-runner packet | `PASS` |
| Execution enablement/disable switch | Dedicated policy packet | `PASS` |

## Sequencing Assessment

The high-level sequencing is safe:

1. rules and analysis,
2. plan audit,
3. model roster/profiling rules,
4. baseline verification,
5. contract snapshots,
6. tiny helper extractions,
7. candidate assembly,
8. critical-zone migration,
9. switch/proof,
10. cleanup.

This sequence correctly delays implementation until after baseline and audit work.

## Required Fixes Before Implementation

These do not block the plan as a planning artifact, but they must be resolved before any packet edits MCP bridge code.

### FIX-001 — Define model roster/profiling rules before model execution

The plan references `FP-META-029 — Model roster and profiling rules` but that packet does not yet exist.

Before any model worker modifies code, ForgePilot must define:

- allowed models,
- allowed roles,
- trust states,
- promotion/demotion criteria,
- evidence requirements.

### FIX-002 — Capture baseline bridge verification before code movement

Before any bridge code edit, record baseline:

- current build/typecheck command,
- current test command if available,
- current smoke command if available,
- package scripts,
- current MCP tool list snapshot.

### FIX-003 — Define tool-contract snapshot format

Before moving tool registration or changing candidate tool assembly, define how tool names/schemas/descriptions are captured and compared.

### FIX-004 — Define first implementation packet acceptance template

Before `SHADOW-REF-009` or any code-changing packet, define a reusable acceptance template requiring:

- one extraction only,
- forbidden zones,
- before/after behavior checks,
- build/typecheck,
- bridge git status,
- rollback path,
- audit requirement if risk is medium or higher.

## Non-Blocking Recommendations

### REC-001 — Keep `SHADOW-REF-005` as model-role selection only

Do not let `SHADOW-REF-005` become implementation.

### REC-002 — Add baseline verification before more planning expansion

The next practical packet after model roster should be baseline verification, not more architecture speculation.

### REC-003 — Prefer field-reader or reason-normalization helpers as first extraction

Do not begin with repo/git helpers if they touch cwd/root assumptions in surprising ways.

Field readers or reason normalization are smaller first probes.

## Recommended Next Packet

Recommended next packet:

```text
FP-META-029 — Model Roster and Profiling Rules
```

Reason:

The plan has been accepted for planning use, but implementation and model participation should not proceed until model role/trust rules exist.

## Audit Boundary

This audit accepts the plan as a planning artifact only.

It does not authorize implementation, model execution, bridge edits, MCP schema changes, service restarts, or runtime switching.
