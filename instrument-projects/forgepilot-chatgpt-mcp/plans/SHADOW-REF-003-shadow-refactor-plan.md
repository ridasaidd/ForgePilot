# SHADOW-REF-003 — server.ts Shadow Refactor Plan

## Boundary

This artifact is planning-only.

It is not implementation, not model execution, not audit, and not authorization to modify the live MCP bridge server.

## Baseline

| Field | Value |
|---|---|
| Source repository | `/home/ridasaidd/forgepilot-chatgpt-mcp` |
| Branch | `feature/oauth-auth0` |
| Commit | `3a16d68` |
| Live entrypoint | `src/server.ts` |
| Size | `10,364` lines |
| Structure map | `plans/SHADOW-REF-001-server-structure-map.md` |
| Risk analysis | `plans/SHADOW-REF-002-high-risk-zones.md` |

## Planning Principles

1. Preserve the live entrypoint until a dedicated switch packet.
2. Build knowledge before implementation.
3. Freeze public MCP tool names and schemas during early packets.
4. Defer CRITICAL zones until late-stage packets.
5. Prefer tiny mechanical extractions over broad rewrites.
6. Require before/after evidence for every behavior-preserving change.
7. Keep rollback material until direct ChatGPT MCP proof succeeds.
8. Treat each model worker task as bounded and evidence-producing.

## Protected Zones

These zones must not be touched during early implementation packets:

| Zone | Risk | Earliest allowed phase |
|---|---|---|
| HTTP `/mcp` transport and startup | `CRITICAL` | Switch phase only |
| OAuth/auth gate and metadata | `CRITICAL` | Late candidate phase or dedicated auth packet |
| MCP tool names/schemas/descriptions | `CRITICAL` | Contract-change packet only |
| `forgepilot_execute_terminal_command` | `CRITICAL` | Late candidate phase with direct proof |
| Human approval validation/consumption | `CRITICAL` | Dedicated safety/audit packet |
| Remote runner start request | `HIGH` | Dedicated remote-runner packet |
| Execution enablement/disable switch | `HIGH` | Dedicated policy packet |

## Candidate Layout Recommendation

Preferred eventual candidate layout:

```text
src/server.ts                 # live entrypoint until switch
src/server-next.ts            # candidate entrypoint only when authorized
src/server-next/
  repo.ts                     # git/repo helpers
  ids.ts                      # packet/request/approval id validation helpers
  fields.ts                   # string/boolean/object field readers
  reasons.ts                  # reason normalization helpers
  opencode-status.ts          # OpenCode capability/status helpers
  remote-runner.ts            # remote runner URL/capability/validate helpers
  artifacts.ts                # artifact read/write helpers
  tool-result.ts              # structured result and error wrapper helpers
  tools.ts                    # candidate tool registration after helpers stabilize
  transport.ts                # candidate HTTP/OAuth transport, late phase only
```

This is a candidate shape, not an implementation order.

## Staged Packet Sequence

### Phase 0 — Rules and analysis complete

Already completed:

| Packet | Result |
|---|---|
| `FP-META-026` | Core/instrument/observed project boundary |
| `FP-META-027` | Shadow refactor rules |
| `FP-META-028` | Project checklist rules |
| `SHADOW-REF-001` | Structure map |
| `SHADOW-REF-002` | High-risk zones |

### Phase 1 — Planning and audit

| Future packet | Purpose | Implementation? |
|---|---|---|
| `SHADOW-REF-004` | Audit this shadow refactor plan | No |
| `FP-META-029` | Model roster and profiling rules | No |
| `SHADOW-REF-005` | Select model roles for MCP bridge refactor | No |

### Phase 2 — Baseline verification before code movement

| Future packet | Purpose | Implementation? |
|---|---|---|
| `SHADOW-REF-006` | Capture baseline build/test/smoke behavior for bridge | No bridge code changes |
| `SHADOW-REF-007` | Capture tool contract snapshot | No bridge code changes |
| `SHADOW-REF-008` | Capture helper behavior fixtures for first extraction | No bridge code changes |

### Phase 3 — First low/medium-risk mechanical extractions

These packets may edit bridge code, but only after baseline/audit packets exist.

| Future packet | Candidate extraction | Risk |
|---|---|---|
| `SHADOW-REF-009` | Extract pure field readers into a helper module | Low/Medium |
| `SHADOW-REF-010` | Extract reason-list normalization helpers | Low/Medium |
| `SHADOW-REF-011` | Extract repository/git helpers | Medium |
| `SHADOW-REF-012` | Extract OpenCode status/capability helpers | Medium |

Rules for each:

- one extraction per packet,
- no tool schema/name changes,
- no runtime entrypoint switch,
- build/typecheck required,
- before/after output comparison where feasible,
- bridge working tree clean after commit.

### Phase 4 — Medium/high-risk evidence helper extraction

| Future packet | Candidate extraction | Risk |
|---|---|---|
| `SHADOW-REF-013` | Extract artifact path/id validation helpers | High |
| `SHADOW-REF-014` | Extract request artifact helpers | High |
| `SHADOW-REF-015` | Extract execution dry-run artifact helpers | High |
| `SHADOW-REF-016` | Extract guarded-start report helpers | High |

Each requires dedicated fixtures and audit.

### Phase 5 — Candidate assembly

| Future packet | Purpose |
|---|---|
| `SHADOW-REF-017` | Create `src/server-next.ts` candidate entrypoint from extracted modules |
| `SHADOW-REF-018` | Candidate build/typecheck/smoke verification |
| `SHADOW-REF-019` | Candidate tool contract comparison against live server |

Still no runtime switch.

### Phase 6 — Critical-zone migration

| Future packet | Purpose |
|---|---|
| `SHADOW-REF-020` | Candidate MCP tool registration assembly |
| `SHADOW-REF-021` | Candidate terminal command tool parity proof |
| `SHADOW-REF-022` | Candidate auth/OAuth transport parity proof |

These are late because they touch CRITICAL behavior.

### Phase 7 — Switch and proof

| Future packet | Purpose |
|---|---|
| `SHADOW-REF-023` | Switch runtime entrypoint to candidate |
| `SHADOW-REF-024` | Direct ChatGPT MCP proof after switch |
| `SHADOW-REF-025` | Observation window and rollback readiness review |

### Phase 8 — Cleanup

| Future packet | Purpose |
|---|---|
| `SHADOW-REF-026` | Retire old implementation after proof |
| `SHADOW-REF-027` | Final cleanup and checklist completion |

## Verification Gates

| Gate | Required before |
|---|---|
| Structure map and risk analysis | Any refactor plan |
| Plan audit | Any code movement |
| Model roster/profiling rules | Any model execution |
| Baseline build/typecheck/smoke | Any bridge code edit |
| Tool contract snapshot | Any tool registration movement |
| Direct ChatGPT MCP proof | Any switch acceptance |
| Rollback path | Any switch packet |

## Model-Worker Participation Boundaries

Allowed before implementation:

- structure mapping,
- risk analysis,
- plan proposal,
- plan audit,
- fixture suggestion,
- extraction candidate review.

Not allowed yet:

- modifying bridge files,
- creating `server-next.ts`,
- changing tool schemas,
- changing auth/OAuth,
- changing terminal execution,
- changing approval logic.

Implementation authority should begin only after model roster/profiling rules exist and a specific packet grants a bounded role.

## Rollback / Switch Strategy

1. Live `src/server.ts` remains the runtime entrypoint.
2. Candidate code is built beside the live entrypoint.
3. Old implementation remains available through switch and proof.
4. Switch requires a dedicated packet.
5. After switch, direct ChatGPT MCP proof is required.
6. Cleanup happens only in a later packet after proof and observation.

## First Implementation Candidate Recommendation

The first implementation candidate, after audit and baseline verification, should be one of:

1. pure string/boolean/object field readers,
2. reason-list normalization helpers,
3. repository/git helpers,
4. OpenCode status/capability helpers.

Do not start with auth, transport, tool registration, terminal execution, human approval, remote runner start, or execution enablement.

## Recommended Next Checklist Item

```text
SR-004 — Audit shadow refactor plan
```

The plan should be audited before any implementation packet is created.

## Explicit Non-Implementation Statement

No MCP bridge files were changed by this plan.

No `server-next.ts` was created.

No runtime entrypoint was changed.

No OpenAI Actions schema or MCP tool contract was changed.

No model implementation work was authorized.
