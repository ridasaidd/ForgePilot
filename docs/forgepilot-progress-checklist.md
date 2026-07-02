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


## Packet Namespace Rule

Packet namespace selection is governed by:

```text
docs/packet-namespace-taxonomy.md
```

Forward rule:

```text
Use the narrowest applicable namespace.
Do not default to FP-MCP-* unless the primary artifact is MCP bridge/tool/action integration.
Existing packet IDs remain historical and should not be renamed merely to match the taxonomy.
```

Current namespace families:

- `FP-*` — core ForgePilot observatory/product implementation
- `FP-META-*` — standards, semantics, governance, methodology
- `FP-MCP-*` — MCP bridge, tool, and OpenAI Actions integration
- `FP-OPS-*` — operator workflows, checklists, runbooks, handoffs

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
| Packet lifecycle | `COMPLETE` | `FP-013`, `FP-014`, `FP-015`, `FP-016`, `FP-OPS-004`, `FP-META-024` | Packet lifecycle states and report surfaces are indexed in `docs/packet-lifecycle-evidence-index.md`. | Packet existence supports only intent; lifecycle claims require supporting artifacts. |
| Worker lifecycle | `COMPLETE` | `FP-MCP-153` | Bounded OpenCode worker invocation has direct MCP proof and committed worker lifecycle artifacts. | Worker lifecycle proof does not imply routing or autonomous execution. |
| Worker telemetry capture | `COMPLETE` | `FP-MCP-154` | Normalized non-admitted worker telemetry capture exists and is directly readable. | Telemetry is observation, not admitted evidence. |
| Worker telemetry persistence | `COMPLETE` | `FP-MCP-156` | SQLite persistence exists, direct persist/read proof recorded in `runs/FP-MCP-156/direct-mcp-smoke-result.md`. | Persistence does not admit telemetry or make it routing input. |
| Worker telemetry query visibility | `COMPLETE` | `FP-MCP-157` | Query tool implemented, verified, direct MCP query proof recorded in `runs/FP-MCP-157/direct-mcp-query-result.md`. | Querying makes telemetry visible, not meaningful. |
| Verification evidence | `COMPLETE` | `FP-META-025` | Verification evidence is classified complete for V1 in `docs/v1-evidence-capability-completion-index.md`. | Passing verification is not admission. |
| Audit evidence | `COMPLETE` | `FP-META-025` | Audit evidence is classified complete for V1 in `docs/v1-evidence-capability-completion-index.md`; reconstruction reports audit artifact presence when available. | Audit is not comparison or admission by itself. |
| Admission state | `COMPLETE` | `FP-009`, `FP-010`, `FP-META-025` | Admission state is classified complete for V1; reports preserve `NOT_EVALUATED` and do not treat observations as admitted. | `NOT_EVALUATED` must not be treated as admitted evidence. |
| Comparison result | `COMPLETE` | `FP-META-025` | Comparison result evidence is classified complete for V1; reconstruction reports bounded comparison artifact presence. | Comparison must not be treated as global model ranking. |
| Reporting / summary view | `COMPLETE` | `FP-013`, `FP-014`, `FP-015`, `FP-016`, `FP-META-025` | V1 reporting and summary view is complete via packet, project, reconstruction, capability-detail, and completion indexes. | Report is an evidence index, not evidence itself. |
| Progress checklist | `COMPLETE` | `FP-MCP-158` | This document creates the first repo-tracked V1 progress checklist. | Checklist is an index, not evidence itself. |
| Completion criteria | `COMPLETE` | `FP-MCP-158` | V1 completion definition is recorded in this document. | Completion criteria do not imply completion. |
| Safety boundary documentation | `COMPLETE` | `FP-META-018`, `FP-META-023` | Consolidated safety boundary evidence index exists at `docs/safety-boundary-evidence-index.md`. | Safety statements map to sources/evidence but are not evidence by themselves. |
| Manual MCP Actions refresh process | `COMPLETE` | `FP-MCP-157` | Direct query proof records that new MCP tools require manual OpenAI Actions schema refresh before ChatGPT can discover them. | Bridge restart alone does not refresh ChatGPT action schema. |
| SQLite checklist persistence | `DEFERRED` | `FP-MCP-158` | Markdown is intentionally used for v1 checklist. SQLite persistence may come later after vocabulary stabilizes. | Do not over-engineer checklist state before manual use proves shape. |
| Routing | `DEFERRED` | none for V1 | Explicitly out of scope for current V1 completion work. | No model routing or optimization may be inferred. |
| Model scoring/ranking | `DEFERRED` | none for V1 | Explicitly out of scope for current V1 completion work. | Query results are not model-quality evidence. |
| Dashboard UI | `DEFERRED` | none for V1 | Explicitly out of scope for current V1 completion work. | Reporting can be CLI/docs before dashboard UI. |
| Packet namespace taxonomy | `COMPLETE` | `FP-META-017` | Namespace rules are documented in `docs/packet-namespace-taxonomy.md`. | Historical packet IDs remain unchanged. |
| Checklist namespace guidance | `COMPLETE` | `FP-OPS-001` | Checklist now includes advisory recommended namespace guidance for future work. | The taxonomy doc remains governing. |
| Packet namespace definition of done | `COMPLETE` | `FP-META-019` | Namespace-specific minimum completion standards are documented in `docs/packet-namespace-definition-of-done.md`. | Namespace implies verification burden, not feature value. |
| Manual action ledger | `COMPLETE` | `FP-OPS-003` | Manual external action recording pattern is documented in `docs/manual-action-ledger.md`. | Manual action still requires observable proof. |
| Packet status index | `COMPLETE` | `FP-OPS-004` | Packet navigation/archive index exists at `docs/packet-status-index.md`. | Index does not rename, delete, move, or invalidate packets. |
| Packet lifecycle evidence index | `COMPLETE` | `FP-META-024` | Lifecycle states and required evidence are documented in `docs/packet-lifecycle-evidence-index.md`. | Index does not create execution evidence. |
| V1 evidence capability completion index | `COMPLETE` | `FP-META-025` | Final V1 evidence capabilities are evaluated in `docs/v1-evidence-capability-completion-index.md`. | Completion is V1-scoped and does not include deferred routing/scoring/dashboard work. |
| V1 release and observation plan | `COMPLETE` | `FP-OPS-005` | V1 release record and observation protocol are documented in `docs/releases/forgepilot-v1.md` and `docs/v1-observation-plan.md`. | V2 must be evidence-triggered, not ambition-triggered. |
| Core/instrument/observed project boundary | `COMPLETE` | `FP-META-026` | Boundaries and workspace layout are defined in `docs/core-instrument-observed-project-boundaries.md`; MCP bridge classified as an instrument project. | Historical `FP-MCP-*` packets remain bootstrap evidence and are not moved. |
| Shadow refactor rules | `COMPLETE` | `FP-META-027` | General shadow-refactor safety rules are documented in `docs/shadow-refactor-rules.md`. | Concrete MCP bridge refactor work belongs in the instrument-project workspace. |
| Shadow refactor rules | `COMPLETE` | `FP-META-027` | Project-agnostic shadow refactor rules are documented in `docs/shadow-refactor-rules.md`. | Rules do not start the MCP bridge refactor or authorize model execution. |
| Project checklist rules | `COMPLETE` | `FP-META-028` | Project checklist semantics are documented in `docs/project-checklist-rules.md`; MCP bridge shadow-refactor checklist initialized. | Checklist is an evidence index, not evidence by itself. |
| Model roster and profiling rules | `COMPLETE` | `FP-META-029` | Model roles, task classes, trust states, promotion/demotion criteria, and initial OpenCode Go roster are documented in `docs/model-roster-and-profiling-rules.md`. | Availability is not trust; no model execution authorized. |
| Evidence root and workspace boundary | `COMPLETE` | `FP-META-030` | Boundary rules are documented in `docs/evidence-root-and-workspace-boundary.md`; grep/source-excerpt path check recorded in `runs/FP-META-030/`. | Current code appears conformant, but runtime path tracing is not yet implemented. |
| Invalidation propagation rules | `COMPLETE` | `FP-META-031` | Downstream invalidation semantics are documented in `docs/invalidation-propagation-rules.md`; current implementation status is `PROPAGATION_RULE_DEFINED_IMPLEMENTATION_NOT_PRESENT`. | Governance only; no propagation implementation yet. |
| Task-class-scoped model trust | `COMPLETE` | `FP-META-032` | Model trust scoping, provenance, provider-version/date-range caveats, and append-only promotion/demotion rules are documented in `docs/task-class-scoped-model-trust.md`. | Governance only; no model execution or trust database implementation. |
| V1 admission distribution report | `COMPLETE` | `FP-META-034` | Current SQLite admission distribution is recorded in `runs/FP-META-034/admission-distribution-report.md`; queried admission/evidence tables are present but contain zero rows. | V1 completion is not the same as admitted evidence; no model-trust labels counted. |
| First admitted evidence record end-to-end | `COMPLETE` | `FP-017` | One boring admitted evidence record and one rejected control record were created in SQLite and mechanically reported in `runs/FP-017/admission-distribution-report.md`. | Proves `evidence_records` admission-state plumbing; event linkage remains separate. |
| V1 report mechanical regeneration | `COMPLETE` | `FP-018` | Project report was mechanically regenerated by `runs/FP-018/generate-v1-report.py` at FP-018 closure; generated counts at that time were COMPLETE 39, DEFERRED 4 across 43 rows. | Does not reproduce old static FP-META-025 27/4 report because current checklist source changed. |
| Evidence record admission event linkage | `COMPLETE` | `FP-019` | Generic `evidence_admission_events` can now target `evidence_record`; tests prove admitted, rejected, and invalidated evidence-record event paths. | Legacy `evidence_record_admission_events` table remains; no historical backfill performed. |
| Canonical evidence-record admission event surface | `COMPLETE` | `FP-020` | `evidence_admission_events` is selected as canonical for `evidence_record` targets; tests prove generic-only, legacy-only, conflict, agreeing, and no-event query states. FP-017 records are backfilled into canonical generic events. | Legacy `evidence_record_admission_events` remains non-canonical; backfill limited to FP-017 records. |
| Bridge baseline verification capture | `COMPLETE` | `SHADOW-REF-006` | Bridge baseline captured at feature/oauth-auth0 commit 3a16d68; build/test passed; 29 registered MCP tools and server.ts hash recorded; baseline admitted through V1-O canonical evidence path. | Baseline capture only; no bridge code movement, service restart, live entrypoint switch, or OpenCode worker execution. |
| Tool-contract acceptance template | `COMPLETE` | `SHADOW-REF-007` | Future bridge extraction packets must reference the SHADOW-REF-006 baseline hash, use executor-driven implementation, preserve or explicitly scope tool-contract changes, pass build/test, and record evidence through the V1-O canonical path. | Template only; no bridge source movement, OpenCode worker execution, or MCP behavior change. |
| First executor-driven extraction handoff | `DEFERRED` | `SHADOW-REF-008` | First OpenCode handoff was blocked before extraction; evidence recorded through V1-O as a valid blocked-handoff observation. | SHADOW-REF packet ids are rejected by current request validator; worker start gate semantics conflict with disabled execution status. No bridge source files changed. |
| Execution-enable worker-start safety gate | `BLOCKING` | `FP-021` | Source inspection confirms `forgepilot_start_opencode_worker` can spawn OpenCode without enforcing the disable switch, guarded preflight, request validation, human approval, or model/run-mode gates. | Extraction is blocked until a fix packet adds regression proof that disabled execution prevents worker spawn. |
| Execution-capable tool gate audit | `COMPLETE` | `FP-022` | Expanded registered tool surface is 38 tools, not the SHADOW-REF-006 server-only count of 29; three execution-capable tools identified. Only `forgepilot_start_opencode_worker` matches the FP-021 missing execution-policy-gate pattern. | Future tool-contract acceptance must use expanded parser; extraction remains blocked until FP-021 is fixed. |
| OpenCode worker start safety gate fix | `COMPLETE` | `FP-023` | Bridge commit 3cd682c adds fail-closed disabled-state blocking to `startOpenCodeWorker` before worker id/artifact/process creation; no-spawn regression, build, test, and live restarted MCP runtime confirmation pass. | Extraction may resume only through the executor-governed path and still must use expanded 38-tool contract checks. |
| First executor-governed shadow extraction start | `BLOCKED_BY_POLICY` | `FP-024` | First bounded extraction prompt was created and live OpenCode worker start was attempted through policy; the fixed gate refused before worker id/artifact/process creation. | No extraction occurred because global execution policy remains disabled. This is safe policy enforcement, not a safety-gate failure. |
| Scoped executor enablement policy | `BLOCKING` | `FP-025` | Defines packet/workspace/model/run-mode/time-scoped enablement requirements for a future FP-024 retry and forbids unscoped global enablement. | Execution remains disabled because no registered worker abort primitive exists and no scoped enablement/approval-consumption path has been proven. |
| Evidence boundary doctrine | `COMPLETE` | `FP-META-018` | Evidence boundaries are documented in `docs/evidence-boundary-doctrine.md`. | Doctrine is not implementation or admission by itself. |
| Safety boundary evidence index | `COMPLETE` | `FP-META-023` | Safety boundaries are mapped to governing docs, evidence, and gates in `docs/safety-boundary-evidence-index.md`. | Index is not policy engine or evidence by itself. |
| Reporting evidence rules | `COMPLETE` | `FP-META-020` | Reporting claim boundaries are documented in `docs/reporting-evidence-rules.md`. | Reporting is an evidence index, not evidence itself. |
| Project summary reporting rules | `COMPLETE` | `FP-META-021` | Project-wide reporting claim boundaries are documented in `docs/project-summary-reporting-rules.md`. | Project report is an index, not evidence itself. |
| Admission/comparison reconstruction rules | `COMPLETE` | `FP-META-022` | Reconstruction boundaries are documented in `docs/admission-comparison-reconstruction-rules.md`. | Rules do not implement reconstruction. |
| Session bootstrap runbook | `COMPLETE` | `FP-OPS-002` | New-session bootstrap procedure is documented in `docs/session-bootstrap.md`. | Reduces dependence on private chat memory; not automation. |

## Recent Packet Evidence Index

| Packet | Capability | Status | ForgePilot Commit(s) | Bridge Commit(s) | Direct MCP Proof | Evidence Artifact(s) | Caveat |
|---|---|---|---|---|---|---|---|
| `FP-MCP-153` | Bounded worker invocation | `COMPLETE` | existing committed evidence | existing bridge support | PASS | worker lifecycle artifacts under `runs/FP-MCP-153/` | none recorded here |
| `FP-MCP-154` | Worker telemetry capture | `COMPLETE` | existing committed evidence | existing bridge support | PASS | telemetry artifacts under worker run directories | none recorded here |
| `FP-MCP-156` | Worker telemetry persistence | `COMPLETE` | `e3702da`, `09c5094`, `d67c0cc`, `d1b03d5` | `5c2e7af`, `dc1a412` | PASS | `runs/FP-MCP-156/direct-mcp-smoke-result.md` | persisted telemetry remains non-admitted |
| `FP-MCP-157` | Worker telemetry query visibility | `COMPLETE` | `dafa608`, `3b9d6e8`, `e91c91c`, `1e04c7f` | `3a16d68` | PASS | `runs/FP-MCP-157/direct-mcp-query-result.md` | manual OpenAI Actions schema refresh required for new MCP tools |
| `FP-MCP-158` | Progress checklist v1 | `COMPLETE` | this packet | none | not applicable | `docs/forgepilot-progress-checklist.md` | documentation-only checklist |


## Recommended Namespace Guidance

This section is advisory. The governing rule remains `docs/packet-namespace-taxonomy.md`.

Do not pre-assign exact packet numbers for future work unless the packet already exists. Recommend the namespace family and explain why.

| Future capability / work item | Current status | Recommended namespace | Reason |
|---|---|---|---|
| Reporting evidence rules | `COMPLETE` | `FP-META-*` | Defines semantics before implementation; completed by `FP-META-020`. |
| Project summary reporting rules | `COMPLETE` | `FP-META-*` | Defines project-wide report semantics; completed by `FP-META-021`. |
| Reporting / summary implementation | `PARTIAL` | `FP-*` | Core ForgePilot behavior; reports implemented by `FP-013`, `FP-014`, `FP-015`; capability detail integration added by `FP-016`. |
| Reporting via ChatGPT MCP | `NOT_STARTED` | `FP-MCP-*` | MCP bridge/tool exposure. |
| Checklist maintenance | `PARTIAL` | `FP-OPS-*` | Operator progress tracking; packet status index added by `FP-OPS-004`. |
| Session bootstrap updates | `COMPLETE` | `FP-OPS-*` | Operator runbook. |
| Manual action records/runbooks | `COMPLETE` | `FP-OPS-*` | External operator workflow. |
| Evidence boundary changes | `COMPLETE` | `FP-META-*` | Standards and semantics. |
| Admission/comparison reconstruction rules | `COMPLETE` | `FP-META-*` | Define evidence semantics before implementation; completed by `FP-META-022`. |
| Admission/comparison reconstruction implementation | `PARTIAL` | `FP-*` | Core query/report behavior; first read-only reconstruction report implemented by `FP-015`. |
| New MCP tool exposure for existing ForgePilot behavior | `DEFERRED` | `FP-MCP-*` | MCP integration only. |

## Incomplete V1 Capability Notes

### Reporting / Summary View

Status: `PARTIAL`

Single-packet reporting exists via `FP-013`; project summary reporting exists via `FP-014`. Reporting implementation must obey `docs/reporting-evidence-rules.md`. Project-wide reporting must obey `docs/project-summary-reporting-rules.md`.

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
