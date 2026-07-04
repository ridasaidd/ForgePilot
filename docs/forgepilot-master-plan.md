# ForgePilot Master Plan

## 0. Orientation contract

This document orients the project. It is not the current-state ledger.

Current-state truth must be derived from admitted evidence in the ForgePilot repository. Active FP-027 guarded-runner-start steering is tracked by:

- `runs/FP-MCP-277/fp027-master-checklist.md`
- `runs/FP-MCP-277/fp027-master-checklist.json`

The operating rule is:

```text
The master plan orients.
The ledger proves.
The checklist steers.
```

Do not treat stale roadmap text as authority over admitted packet evidence.

## 1. Purpose

ForgePilot is a software production observatory for AI-assisted development.

Its purpose is to turn AI-assisted software work into an observable, auditable, evidence-producing process.

ForgePilot exists to answer one long-term question:

> What actually causes successful AI-assisted software delivery?

It answers that question by recording packets, executions, verification, audits, comparisons, telemetry, and admission decisions over time.

ForgePilot does not optimize for favorable stories. It records observations.

ForgePilot does not trust model claims by default. It requires evidence.

ForgePilot does not route work from vibes. Future routing may only use admitted evidence.

## 2. Non-goals

ForgePilot is not:

- an agent framework,
- a benchmark leaderboard,
- a generic model router,
- a chat memory system,
- a terminal remote-control tool,
- a pile of automation scripts,
- a replacement for verification, audit, or human judgment.

ForgePilot may use agents, models, terminals, MCP tools, OpenCode, and scripts, but those are tools. The product is the observatory.

## 3. System roles

### GPT

GPT is the orchestrator, architect, reviewer, and run director.

GPT may request bounded actions, inspect workspace state, draft packets, review diffs, compare evidence, and decide what to ask executors or auditors to do.

GPT owns no durable truth.

### ForgePilot repository

The ForgePilot repository is the evidence ledger and policy workspace.

It stores packets, run artifacts, docs, standards, metrics artifacts, and source code for the observatory itself.

### SQLite

SQLite is the intended runtime and environment truth layer.

It should eventually store normalized packet state, evidence records, metrics, admissions, telemetry, model outcomes, and routing signals.

### Markdown

Markdown is policy and knowledge truth.

Architecture decisions, standards, plans, packets, audit results, comparison records, and rationale documents live in Markdown unless they need normalized runtime querying.

### MCP bridge

The MCP bridge is the controlled capability boundary between GPT and the workspace.

It exposes tools for reading state, creating request artifacts, requesting approved terminal commands, validating preflight gates, and eventually invoking bounded worker runs.

The MCP bridge is not the observatory. It is an interface to the observatory and workspace.

The mechanism of human approval and clearance is part of the policy surface, not an implementation detail. Popup-mediated local clearance is allowed only as a scoped, short-lived, single-use, operator-reviewed mechanism, and only when the relevant review manifest and evidence gates are satisfied.

### OpenCode

OpenCode is the execution harness.

It provides access to open-weight or external models that can act as executors, auditors, comparators, or specialists.

OpenCode should perform bounded tasks and return artifacts. It should not own truth.

### Open-weight models

Open-weight models are replaceable workers.

They may execute packets, audit implementations, compare outputs, classify failures, or summarize telemetry. Their claims become evidence only after validation and admission.

### Human operator

The human operator owns authorization, policy judgment, and final responsibility.

Human approval may authorize bounded execution, but human approval alone does not convert output into admitted evidence.

Operator competence is a precondition. ForgePilot does not attempt to make execution safe for unqualified use; it exposes scope, provenance, side effects, and state so a competent operator can make an informed decision.

Approval is not one undifferentiated action. Current evidence separates operator review, human approval evidence, final popup confirmation, local clearance, approval consumption, guarded start contact, and evidence admission. The approval popup is a final brake after review, not the review itself.

Creation of execution clearance is itself a tracked policy boundary. FP-MCP-217 originally kept local clearance creation outside MCP; FP-MCP-236 revised that boundary for popup-mediated, short-lived, single-use, exact-scope local clearance under compensating controls.

### Server workspace

The server workspace is the live lab bench.

It includes repositories, services, processes, listeners, local tool state, OpenCode state, and the GPT house.

The workspace is source-of-truth for live operational state, but only recorded and admitted artifacts become observatory evidence.

### GPT house

The GPT house is a non-secret server-side orientation space for cross-session memory.

It helps future sessions recover context, but it is not admitted evidence by itself.

## 4. Truth model

ForgePilot uses layered truth:

1. Git records committed repository history.
2. Markdown records policy, packets, rationale, audits, and plans.
3. SQLite records normalized operational truth.
4. The server workspace records live operational state.
5. The GPT house records orientation memory.
6. Model context is not durable truth.

The core rule remains:

> The environment owns truth. Agents own no truth.

## 5. Evidence lifecycle

The target lifecycle is:

```text
DRAFT
READY
REQUESTED
EXECUTED
VERIFIED
AUDITED
COMPARED
ADMISSION_REVIEWED
ADMITTED / REJECTED / QUARANTINED
```

A packet defines intent before execution.

A request binds a packet to model, mode, workspace, and commit.

Execution produces artifacts.

Verification checks observable behavior.

Audit evaluates correctness and constraint adherence.

Comparison evaluates multiple valid outputs when applicable.

Admission decides whether the evidence may influence observatory outputs.

Routing decisions may only use admitted evidence.

## 6. MCP role

The MCP bridge should evolve into four tool layers.

### Operator tools

Operator tools help GPT inspect and maintain the workspace:

- read repository status,
- read packets and runs,
- inspect service state,
- record handoffs,
- create workspace snapshots,
- run small approved terminal commands.

### Execution tools

Execution tools create and run bounded work:

- create OpenCode request artifacts,
- bind run requests to packet, commit, workspace, model, and mode,
- start bounded worker runs only after gates pass,
- capture executor outputs.

### Evidence tools

Evidence tools record what happened:

- execution artifacts,
- verification artifacts,
- audit artifacts,
- comparison artifacts,
- metrics artifacts,
- telemetry artifacts,
- admission events.

### Policy tools

Policy tools determine whether artifacts are usable:

- validate packets,
- validate requests,
- validate provenance,
- classify outcomes,
- evaluate admission eligibility,
- query admitted evidence,
- support future routing recommendations.

## 7. Direct terminal access

Direct GPT terminal access is an operator interface, not the product.

It is useful for small, explicit, approved commands:

- status checks,
- verification commands,
- commits and pushes,
- service restarts,
- small handoff artifacts.

It should not replace packet discipline, OpenCode execution, audit, telemetry, or admission.

Large edits, bulk telemetry capture, and multi-file changes should prefer OpenCode worker runs or explicitly bounded packets.

## 8. OpenCode harness role

OpenCode is the worker harness beneath GPT orchestration.

The desired flow is:

```text
GPT selects or drafts packet
ForgePilot records request
OpenCode runs selected model as executor
ForgePilot records output
Another model or GPT audits
ForgePilot records audit
Comparison/admission determines evidence value
```

OpenCode should not be treated as the source of truth. Its local state should be inventoried and preserved where relevant, then normalized into ForgePilot evidence.

## 9. Model roles

### Executor

An executor implements a packet under constraints.

### Auditor

An auditor reviews an executor result against packet requirements, acceptance criteria, and boundaries.

### Comparator

A comparator evaluates multiple accepted outputs and records relative strengths.

### Classifier

A classifier may label task type, failure mode, risk, or routing eligibility, but classification must follow observation.

### Router

A future router may recommend models or workflows only from admitted evidence.

## 10. Safety model

Safety is layered:

1. Human approval for bounded actions.
2. Workspace allowlists.
3. Disable switches.
4. Terminal-specific kill switch.
5. Command policy and rate limits.
6. Preflight validation.
7. Evidence recording.
8. Audit and admission gates.
9. Network and service boundaries.
10. Human override.

Approval authorizes an action. It does not prove the action succeeded, and it does not admit evidence.

## 11. Metrics, telemetry, validation, and admission

Metrics and telemetry are observations.

They may be incomplete, untrusted, or structurally invalid.

ForgePilot must distinguish:

- trust tier,
- validation state,
- admission state,
- provenance completeness,
- evidence usefulness,
- routing eligibility.

Existing standards support this model:

- `docs/model-evaluation-harness.md`
- `docs/metrics-trust-and-validation.md`
- `docs/telemetry-authority-and-field-ownership.md`
- `docs/persistence-standards.md`
- `docs/model-outcome-recording-standards.md`
- `docs/task-classification-standards.md`

## 12. Routing future

Routing is not the current goal. Evidence collection is the current goal.

Routing becomes valid only when ForgePilot has enough admitted evidence to support recommendations.

The minimum admitted-evidence threshold per model, task class, condition, and confidence level is not yet defined. That threshold is a known future standard, not something this plan silently assumes.

Routing must not use raw model claims, unvalidated telemetry, rejected artifacts, quarantined records, or narrative summaries without evidence.

Future routing may answer:

- which model performs best for this task class,
- which auditor catches this failure mode,
- which workflow has the lowest correction rate,
- which packet patterns create ambiguity,
- when to escalate to a stronger model or human.

## 13. Development phases

### Phase 0 — Manual evidence

Packets, manual execution, manual verification, manual audit, Markdown artifacts.

### Phase 1 — SQLite observatory

Normalize packets, runs, metrics, evidence records, validation states, and admission states.

### Phase 2 — MCP-controlled workspace

Expose controlled tools for GPT to inspect and operate the workspace with approval and evidence.

### Phase 3 — OpenCode worker harness

Allow GPT to create bounded OpenCode worker requests and collect structured results.

### Phase 4 — Executor/auditor evaluations

Run multiple models under controlled packets with cross-model audit and comparison.

### Phase 5 — Evidence admission pipeline

Admit, reject, or quarantine evidence through explicit gates.

### Phase 6 — Evidence-based recommendations

Use admitted evidence to recommend models, workflows, packet improvements, and audit strategies.

### Phase 7 — Adaptive orchestration

Allow GPT to orchestrate more of the workflow, still bounded by packet discipline, safety gates, and admitted evidence.

## 14. Required tool roadmap

ForgePilot and the MCP bridge need these tool families:

1. Workspace state snapshot tools.
2. Terminal command tools with throttling and policy.
3. OpenCode request and worker invocation tools.
4. Telemetry capture tools.
5. Evidence artifact recording tools.
6. Verification recording tools.
7. Audit recording tools.
8. Comparison recording tools.
9. Admission review tools.
10. SQLite query tools for admitted evidence.
11. Model outcome and task classification tools.
12. Handoff and GPT house orientation tools.

## 15. Current steering pointers

This section is an orientation pointer, not the current-state source of truth.

The older FP-MCP-148 through FP-MCP-156 roadmap represented an earlier phase of the MCP work. It is now superseded for steering purposes by admitted evidence in the FP-MCP ledger and by the FP-MCP-277 checklist.

Current FP-027 standing rule, carried forward verbatim from FP-MCP-268:

> Do not declare FP-027 satisfied by resemblance to any OpenCode HTTP execution path. It requires the guarded runner start path with the original boundary evidence present at the moment of runner contact.

Current steering artifacts:

- `runs/FP-MCP-277/fp027-master-checklist.md`
- `runs/FP-MCP-277/fp027-master-checklist.json`

Current orientation decisions:

- FP-MCP-277 reconstructs the FP-027 master checklist from admitted evidence.
- FP-MCP-278 records that the MCP bridge server refactor should become an observed open-weight model workload, not silent GPT/operator maintenance before observation.
- The MCP refactor should be packetized with constraints, success criteria, forbidden changes, test commands, audit checklist, and comparison criteria.
- Open-weight models should perform the implementation under ForgePilot observation. GPT/operator should prepare the experiment and evaluate evidence.

Current next allowed FP-027 action:

- operator reviews the prepared FP-MCP-276 request and manifest, then explicitly approves or holds/denies.

Current forbidden actions before missing gates pass:

- runner start endpoint contact,
- OpenCode start,
- prompt submission,
- wait call,
- approval consumption,
- disable-switch change before explicit gate.


## 15a. Direct OpenCode HTTP narrowed scope

FP-MCP-291 resolves the FP-MCP-289 fork. Direct OpenCode HTTP is permanently narrower-scoped as a design, canary, endpoint-shape, assistant-completion, and planning tool.

The chosen architecture is the lower-risk default: ForgePilot will not maintain two independent safe-run paths for real workspace-changing work. That work remains assigned to the guarded/worker path and its safety gates.

Direct HTTP is not safety-equivalent to FP-027. It must not be treated as satisfying FP-027 by resemblance. FP-027 remains open until the guarded-runner checklist is satisfied by admitted evidence.

The abort question for direct HTTP is closed by scope, not by equivalence. Session deletion is still not admitted as a proven abort primitive. No direct-HTTP abort primitive is required while direct HTTP remains outside real workspace-changing work.

The prompt wording boundary is a useful fail-closed observation, but it remains a soft heuristic until structurally proven. The durable rule is the admitted narrow scope.

Any future proposal to expand direct HTTP beyond this scope is an architecture reversal. It must reopen FP-MCP-291 in a new auditor-reviewed packet and prove the missing safety properties before the scope changes.


## 15b. Refactor execution ordering

FP-MCP-292 resolves the ordering question after FP-MCP-291. The MCP bridge `server.ts` registration-extraction refactor must not be the first real test of the guarded/worker execution safety chain.

If the refactor is executed by a model through the guarded/worker path, a minimal FP-027 canary must be completed first on a boring, non-refactor task. That canary must prove the planned discipline on the real path: one worker, DESIGN_ONLY, no source edits, process/state evidence at the contact boundary, live stop-readiness, no retry, no chaining, and admitted result evidence.

Only after that canary is admitted may the registration-extraction packet become the second real use of the guarded/worker path.

If the operator chooses to do the registration extraction before FP-027, it must be explicitly scoped as human/GPT manual maintenance, not model execution through the guarded/worker path and not direct-HTTP execution authority.

## 16. Conditions before routing or automation

Before routing or automation can influence decisions, ForgePilot must have:

1. Structured evidence records.
2. Provenance completeness checks.
3. Validation states.
4. Admission states.
5. Reliable model identity recording.
6. Task classification standards applied consistently.
7. Outcome recording standards applied consistently.
8. Audit artifacts for relevant runs.
9. Comparison artifacts for multi-model runs.
10. SQLite-backed queries over admitted evidence.
11. Clear exclusion of rejected and quarantined evidence.
12. Human override and review paths.

Until those conditions are met, GPT may recommend next steps, but ForgePilot must not present routing as evidence-based automation.

A later standard must define how much admitted evidence is enough for a routing recommendation by model, task class, operating condition, and confidence level. Until that standard exists, routing remains advisory and explicitly non-authoritative.

## 17. North star

The final goal is not for GPT to do everything directly.

The final goal is evidence-based orchestration:

```text
GPT orchestrates.
OpenCode executes.
Models perform bounded work.
ForgePilot observes.
Audits evaluate.
SQLite remembers.
Admission controls what future decisions may use.
```

ForgePilot succeeds when future decisions are not based on memory, preference, or vibes, but on admitted evidence from real software production workflows.
