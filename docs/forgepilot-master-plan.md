# ForgePilot Master Plan

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

## 15. Near-term roadmap

### FP-MCP-148 — Terminal MCP Practical Hardening

Implement terminal kill switch, Node/pnpm PATH fix, and container-engine command blocks.

### FP-MCP-149 — OpenCode Local Telemetry Inventory

Inventory local OpenCode telemetry metadata before stopping or restarting the long-running OpenCode server.

### FP-MCP-150 — ForgePilot Master Plan

Record this comprehensive plan before further expansion.

### FP-MCP-151 — Terminal Rate Limiting and Command Shaping

Reduce rapid-fire command patterns and force large tasks toward worker runs.

### FP-MCP-152 — Workspace State Snapshot

Capture live server workspace state as operational truth: repos, services, processes, listeners, OpenCode state, and GPT house state.

### FP-MCP-153 — OpenCode Worker Invocation v1

Allow GPT to create and monitor bounded OpenCode worker tasks through MCP.

### FP-MCP-154 — OpenCode Telemetry Capture v1

Capture token, cost, duration, model, and tool-use telemetry into ForgePilot evidence where available.

### FP-MCP-155 — Executor/Auditor Harness v1

Run one model as executor and another as auditor under a controlled ForgePilot packet.

### FP-MCP-156 — Evidence Admission Query v1

Expose admitted evidence queries for future routing and orchestration decisions.

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
