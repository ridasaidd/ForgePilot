# ForgePilot Progress Checklist

## Purpose

This checklist is an evidence ledger index for ForgePilot V1 progress.

It answers:

```text
What exists, what proves it, what remains incomplete, and what must not be inferred yet?
```

This checklist is not:

- a roadmap,
- a dashboard,
- an implementation backlog,
- a routing plan,
- a model scorecard,
- a replacement for packet evidence,
- a machine-readable source of truth.

The source of truth remains committed packet artifacts, run artifacts, migrations, tests, and supported read-only query tools.

## Update Rule

Never mark something complete because we believe it works.

Mark it complete only because committed packet evidence proves it.

Recommended update rhythm:

```text
packet implementation/evidence commit
→ verification evidence recorded
→ checklist updated only after the evidence boundary is crossed
```

## Status Vocabulary

| Status | Meaning |
|---|---|
| `NOT_STARTED` | No packet or committed implementation evidence exists yet. |
| `PACKET_RECORDED` | A packet exists, but implementation or verification evidence is not complete. |
| `IMPLEMENTED` | Implementation exists in committed code, but verification or direct proof is incomplete. |
| `VERIFIED` | Verification passed and is recorded, but a required direct MCP or operational proof is not complete. |
| `DIRECT_MCP_PROVEN` | The capability was proven through the MCP tool surface where applicable. |
| `RECORDED` | Evidence was recorded in committed run artifacts. |
| `COMPLETE` | Packet exists, implementation/evidence is committed, verification passed, required direct proof passed, and repos were clean after recording. |
| `PARTIAL` | Some evidence exists, but one or more required V1 criteria remain incomplete. |
| `BLOCKED` | Progress is blocked by an external/manual/system condition. |
| `DEFERRED` | Intentionally postponed and not treated as a failure. |

## ForgePilot V1 Completion Definition

ForgePilot V1 is complete when packet intent, execution, telemetry, verification, audit, admission, comparison, and reporting can be reconstructed from committed evidence and supported read-only queries, without relying on private chat memory.

V1 is not complete merely because individual components exist.

V1 is complete when a new operator or agent can inspect the repository and supported query surfaces and reconstruct what happened without relying on a previous ChatGPT session.

## Current Baseline

Last updated by:

- packet: `FP-MCP-158`
- ForgePilot branch: `main`
- ForgePilot baseline before checklist implementation: `2d79a9a`
- bridge branch: `feature/oauth-auth0`
- bridge baseline: `3a16d68`

Recent closed telemetry/query chain:

- `FP-MCP-153` bounded OpenCode worker invocation
- `FP-MCP-154` normalized worker telemetry capture
- `FP-MCP-156` worker telemetry persistence
- `FP-MCP-157` persisted telemetry query visibility

## V1 Capability Checklist

| Capability | Status | Evidence Packet(s) | Evidence / Notes | Boundary |
|---|---|---|---|---|
| Packet lifecycle | `PARTIAL` | earlier packets, FP-MCP series | Packets are committed and used as work units. Full V1 lifecycle summary still needs a supported reporting view. | Packet existence is not execution evidence. |
| Worker lifecycle | `COMPLETE` | `FP-MCP-153` | Bounded OpenCode worker invocation has direct MCP proof and committed worker lifecycle artifacts. | Worker lifecycle proof does not imply routing or autonomous execution. |
| Worker telemetry capture | `COMPLETE` | `FP-MCP-154` | Normalized non-admitted worker telemetry capture exists and is directly readable. | Telemetry is observation, not admitted evidence. |
| Worker telemetry persistence | `COMPLETE` | `FP-MCP-156` | SQLite persistence exists, direct persist/read proof recorded in `runs/FP-MCP-156/direct-mcp-smoke-result.md`. | Persistence does not admit telemetry or make it routing input. |
| Worker telemetry query visibility | `COMPLETE` | `FP-MCP-157` | Query tool implemented, verified, direct MCP query proof recorded in `runs/FP-MCP-157/direct-mcp-query-result.md`. | Querying makes telemetry visible, not meaningful. |
| Verification evidence | `PARTIAL` | FP-MCP evidence chain, earlier FP packets | Typecheck/build/test evidence exists for recent packets, but V1-wide verification reporting is not yet consolidated. | Passing verification is not admission. |
| Audit evidence | `PARTIAL` | earlier benchmark/evaluation packets | Audit workflow exists in earlier ForgePilot work, but current FP-MCP chain does not yet expose a consolidated audit query/report view. | Audit is not comparison or admission by itself. |
| Admission state | `PARTIAL` | FP-009, FP-010, FP-MCP-156/157 | Admission-state concepts and persistence exist; worker telemetry remains `NOT_EVALUATED`. V1 still needs a consolidated admission/reporting path. | `NOT_EVALUATED` must not be treated as admitted evidence. |
| Comparison result | `PARTIAL` | earlier benchmark packets | Comparison artifacts exist in earlier evaluation workflows. V1 still needs a supported way to reconstruct comparison state from committed evidence/read-only queries. | Comparison must use admitted evidence only where evidence claims are made. |
| Reporting / summary view | `NOT_STARTED` | none yet | No supported V1 report or summary view exists for packet/project state. | Manual raw-file inspection is not a V1 reporting surface. |
| Progress checklist | `COMPLETE` | `FP-MCP-158` | This document creates the first repo-tracked V1 progress checklist. | Checklist is an index, not evidence itself. |
| Completion criteria | `COMPLETE` | `FP-MCP-158` | V1 completion definition is recorded in this document. | Completion criteria do not imply completion. |
| Safety boundary documentation | `PARTIAL` | FP-MCP packets, boundary docs | Safety boundaries are repeatedly documented in packets and evidence. V1 still needs consolidated boundary reporting or index. | Safety statements must map back to enforced gates or evidence. |
| Manual MCP Actions refresh process | `COMPLETE` | `FP-MCP-157` | Direct query proof records that new MCP tools require manual OpenAI Actions schema refresh before ChatGPT can discover them. | Bridge restart alone does not refresh ChatGPT action schema. |
| SQLite checklist persistence | `DEFERRED` | `FP-MCP-158` | Markdown is intentionally used for v1 checklist. SQLite persistence may come later after vocabulary stabilizes. | Do not over-engineer checklist state before manual use proves shape. |
| Routing | `DEFERRED` | none for V1 | Explicitly out of scope for current V1 completion work. | No model routing or optimization may be inferred. |
| Model scoring/ranking | `DEFERRED` | none for V1 | Explicitly out of scope for current V1 completion work. | Query results are not model-quality evidence. |
| Dashboard UI | `DEFERRED` | none for V1 | Explicitly out of scope for current V1 completion work. | Reporting can be CLI/docs before dashboard UI. |

## Recent Packet Evidence Index

| Packet | Capability | Status | ForgePilot Commit(s) | Bridge Commit(s) | Direct MCP Proof | Evidence Artifact(s) | Caveat |
|---|---|---|---|---|---|---|---|
| `FP-MCP-153` | Bounded worker invocation | `COMPLETE` | existing committed evidence | existing bridge support | PASS | worker lifecycle artifacts under `runs/FP-MCP-153/` | none recorded here |
| `FP-MCP-154` | Worker telemetry capture | `COMPLETE` | existing committed evidence | existing bridge support | PASS | telemetry artifacts under worker run directories | none recorded here |
| `FP-MCP-156` | Worker telemetry persistence | `COMPLETE` | `e3702da`, `09c5094`, `d67c0cc`, `d1b03d5` | `5c2e7af`, `dc1a412` | PASS | `runs/FP-MCP-156/direct-mcp-smoke-result.md` | persisted telemetry remains non-admitted |
| `FP-MCP-157` | Worker telemetry query visibility | `COMPLETE` | `dafa608`, `3b9d6e8`, `e91c91c`, `1e04c7f` | `3a16d68` | PASS | `runs/FP-MCP-157/direct-mcp-query-result.md` | manual OpenAI Actions schema refresh required for new MCP tools |
| `FP-MCP-158` | Progress checklist v1 | `COMPLETE` | this packet | none | not applicable | `docs/forgepilot-progress-checklist.md` | documentation-only checklist |

## Incomplete V1 Capability Notes

### Reporting / Summary View

Status: `NOT_STARTED`

Required before V1:

- A supported way to inspect packet state without manually reading raw artifacts.
- The reporting surface must distinguish observation, verification, audit, admission, and comparison.
- Any evidence claims must clearly identify whether they are admitted or merely observed.

Non-goals for initial reporting:

- dashboard UI,
- model ranking,
- routing recommendations,
- score calculation.

### Verification Evidence Consolidation

Status: `PARTIAL`

What exists:

- Individual packets record typecheck/build/test/smoke evidence.

Missing for V1:

- A supported way to summarize verification state across packets.
- Clear distinction between verification pass and admission.

### Audit Evidence Consolidation

Status: `PARTIAL`

What exists:

- Earlier ForgePilot benchmark/evaluation workflows include audit artifacts.

Missing for V1:

- A supported way to inspect audit state across packets.
- A clear index from packet to audit artifact to final outcome.

### Admission / Comparison Reconstruction

Status: `PARTIAL`

What exists:

- Admission-state vocabulary and persistence exist in earlier work.
- Recent telemetry persistence records `admission_state` as `NOT_EVALUATED`.

Missing for V1:

- A supported read-only way to reconstruct admission/comparison state for a packet.
- A reporting path that refuses to treat non-admitted observations as evidence.

## Standing Operational Caveats

### Manual OpenAI Actions Schema Refresh

New MCP tools are not discoverable by ChatGPT until the OpenAI Actions schema is manually refreshed from the Actions page.

Observed in:

- `FP-MCP-157`

Operational implication:

```text
bridge implementation commit
→ bridge build
→ bridge service restart
→ manual OpenAI Actions refresh
→ direct ChatGPT MCP proof
```

### Telemetry Visibility Boundary

Telemetry query visibility does not make telemetry meaningful.

Persisted worker telemetry query results are observations, not admitted evidence or routing input.

### Checklist Boundary

This checklist is not proof by itself.

A checklist entry is trustworthy only to the extent that it points to committed packet evidence.

## Deferred Ideas

These may be considered after V1 evidence/reporting surfaces stabilize:

- SQLite-backed progress checklist persistence,
- automated checklist generation,
- dashboard UI,
- telemetry aggregation,
- cost/token analysis,
- routing policy,
- model scoring/ranking.
