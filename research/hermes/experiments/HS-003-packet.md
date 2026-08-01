# HS-003 — Hermes Human Interaction and Control Plane Survey

## Status

READY — Knowledge Pipeline research packet

## Packet ID

`HS-003`

## Title

Determine which Hermes human-interaction and lifecycle-control capabilities already exist, which are configured locally, which are absent from the current ForgePilot adapter, and which gaps genuinely require implementation.

## 1. Purpose

HS-003 is a research and compatibility survey.

It must not begin by designing a new approval system.

It must first establish the native Hermes control plane for:

- human questions and answers;
- Kanban comments;
- blocked-task handling;
- unblock and rerun;
- archive and quarantine;
- task edits before redispatch;
- recurrence and block-loop containment;
- messaging-platform delivery;
- approval routing;
- operator notification;
- task, run, session, and outer Runs API identity.

The objective is to distinguish configuration gaps, adapter gaps, version differences, policy restrictions, and genuinely missing functionality.

This packet produces knowledge, not implementation.

## 2. Background Evidence

HS-002-CANARY-001 observed:

1. A verifier entered `needs_input`.
2. The active native run terminated with outcome `blocked`.
3. Human comments and unblock were performed through the Hermes dashboard.
4. Unblocking preserved the original task and dependency graph.
5. Hermes created a new native run on the same task.
6. The new run restarted from the task instructions rather than continuing the blocked run.
7. Unchanged blocking instructions caused repeated blocking and redispatch.
8. `block_loop_detected` was emitted, but repeated promotion and dispatch continued through native run 13.
9. Manual archive stopped the loop.
10. The current ForgePilot Hermes MCP adapter did not expose the required comment, unblock, edit, archive, quarantine, or redispatch mutations.

HS-003 must independently verify relevant claims and must not silently treat the HS-002 interpretation as authoritative beyond its recorded evidence.

## 3. Primary Research Question

What is the actual human-interaction and lifecycle-control contract of the locally installed Hermes version, and what is the smallest safe ForgePilot integration required to operate it without keeping the dashboard continuously open?

## 4. Secondary Questions

### Q1 — Native Kanban controls

Does the installed Hermes version support:

- comment;
- edit task title or body;
- assign or reassign;
- unblock;
- dispatch;
- archive;
- quarantine or triage;
- block-recurrence inspection;
- dependency changes;
- status changes?

For every operation, identify:

- CLI command;
- native agent tool;
- dashboard action;
- API or MCP action;
- authorization boundary;
- applicable task states;
- resulting event;
- resulting run behavior.

### Q2 — `needs_input` semantics

Determine precisely:

- whether `needs_input` always terminates the active native run;
- whether any native path suspends and resumes the same run;
- whether comments are included in the next run's task context;
- whether editing the task body before unblock changes the next run;
- whether a human answer can be injected into the existing worker session;
- whether task-level rerun and session-level resume are separate capabilities.

### Q3 — Block-loop containment

Determine:

- the installed `BLOCK_RECURRENCE_LIMIT`;
- where it is configured;
- whether the counter is task-wide or reason-specific;
- when it resets;
- expected `block_loop_detected` behavior;
- expected transition to `triage`, quarantine, or another state;
- why HS-002 continued through run 13;
- whether auto-decomposition, promotion, or another component bypassed containment;
- whether installed 0.19.1 behavior differs from current online documentation.

### Q4 — Messaging and remote control

Determine what Hermes natively supports through Telegram, Discord, Slack, WhatsApp, or other configured messaging platforms for:

- proactive notification;
- home-channel delivery;
- `clarify` questions;
- dangerous-command approval;
- slash commands;
- Kanban reads;
- Kanban comment;
- Kanban unblock;
- task edit;
- archive;
- approval and denial;
- interaction while another agent is running.

Do not configure or contact a real messaging platform unless G0 separately approves that live test.

### Q5 — OC as human-interaction endpoint

Determine whether the operational orchestrator can reliably serve as the durable human-facing endpoint after the original OC run has completed.

Test or establish from evidence:

- how a fresh OC locates the workflow;
- how it discovers blocked descendants;
- how it reads the exact decision request;
- whether it can append the human decision;
- whether it can edit and unblock the correct task;
- whether it can prevent a repeat block before redispatch;
- which state remains durable across OC sessions.

### Q6 — ForgePilot adapter boundary

For each native Hermes capability, determine whether it is currently exposed by the ForgePilot Hermes MCP.

Explicitly inspect the current adapter for:

- task comment;
- task edit;
- unblock;
- archive;
- quarantine or triage;
- reassign;
- dependency mutation;
- dispatch;
- recurrence inspection;
- human-answer injection;
- worker-session resume.

Do not infer absence from memory. Inspect the live tool surface and source.

## 5. Required Evidence Layers

Every capability must be classified separately at these layers:

1. **Documented on Hermes `main`**
2. **Present in installed Hermes 0.19.1 source**
3. **Enabled by local configuration**
4. **Exposed in native CLI**
5. **Exposed in dashboard**
6. **Exposed to Hermes agent profiles**
7. **Exposed by ForgePilot Hermes MCP**
8. **Observed live**

Do not collapse these layers into a single yes/no answer.

## 6. Required Classification

Assign every capability exactly one primary classification:

- `NATIVE_AND_WORKING`
- `NATIVE_BUT_UNCONFIGURED`
- `NATIVE_BUT_PROFILE_RESTRICTED`
- `NATIVE_BUT_VERSION_DEPENDENT`
- `NATIVE_BUT_NOT_EXPOSED_BY_FORGEPILOT`
- `DOCUMENTED_BUT_CONTRADICTED_BY_LOCAL_OBSERVATION`
- `REQUIRES_BOUNDED_ADAPTER`
- `NOT_SUPPORTED`
- `UNRESOLVED`

Also record confidence:

- `HIGH`
- `MEDIUM`
- `LOW`

## 7. Required Research Sequence

### Phase A — Preserve baseline

Record without mutation:

- installed Hermes version;
- relevant profile names;
- current Kanban toolsets enabled per profile;
- current ForgePilot Hermes MCP tools;
- messaging platforms configured, without exposing secrets;
- block-recurrence configuration;
- dashboard version if separately identifiable;
- relevant service versions and health;
- HS-002 task, event, and run identifiers.

Do not print tokens, secrets, environment values, bot credentials, or private chat identifiers.

### Phase B — Official documentation survey

Use only official Hermes sources for technical claims:

- Hermes GitHub repository;
- Hermes official documentation contained in that repository;
- tagged release source for 0.19.1 where available.

Inspect at minimum:

- Kanban documentation;
- CLI reference;
- messaging overview;
- Telegram and Discord interaction documentation;
- security and approval documentation;
- gateway internals;
- relevant source implementing block recurrence, unblock, comment, task edit, archive, dispatch, auto-decomposition, and messaging commands.

Treat online `main` documentation as potentially newer than 0.19.1.

### Phase C — Installed-source comparison

Inspect the locally installed Hermes 0.19.1 code and compare it to the official source.

Determine exact code paths for:

- blocked outcome creation;
- unblock transition;
- recurrence counter;
- `block_loop_detected`;
- triage routing;
- dispatcher eligibility;
- auto-decomposer behavior;
- task comments included in worker context;
- task edits;
- session resume, if present;
- slash-command handling for `/kanban`, `/approve`, `/deny`, or equivalents.

Record exact files, functions, and relevant line ranges or commits where possible.

### Phase D — Live read-only inspection

Use existing HS-002 evidence and bounded reads to verify:

- task identity preservation;
- native runs 4–13;
- comments;
- unblock events;
- `block_loop_detected`;
- auto-decomposer edits;
- promotions;
- archive event 93;
- recurrence count;
- unchanged dependency graph.

No new mutation is required for this phase.

### Phase E — Minimal live experiments

Run only experiments needed to resolve questions not answered by documentation, source, configuration, and HS-002 evidence.

Experiments must use a dedicated disposable board.

Permitted examples:

1. Comment before unblock, then confirm the next run reads the comment.
2. Edit task body before unblock, then confirm the next run follows the edited body.
3. Reach the configured recurrence limit and observe the expected terminal state.
4. Compare native CLI unblock with dashboard unblock.
5. Test whether a fresh OC can operate the same blocked task.
6. Test a messaging interaction only after separate G0 approval.

No repository work, Git operations, service changes, configuration edits, or external messaging tests are permitted without separate approval.

Every experiment must include a containment rule preventing an automatic requeue loop.

Maximum automatic recurrence for a canary: 2.

Archive or quarantine immediately if the containment rule fails.

## 8. Capability Matrix Deliverable

Produce a matrix with at least these rows:

| Capability | Docs main | 0.19.1 source | Local config | CLI | Dashboard | Agent tool | ForgePilot MCP | Live observed | Classification | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|
| task comment | | | | | | | | | | |
| task edit | | | | | | | | | | |
| unblock | | | | | | | | | | |
| rerun same task | | | | | | | | | | |
| resume same native run | | | | | | | | | | |
| archive | | | | | | | | | | |
| quarantine/triage | | | | | | | | | | |
| recurrence inspection | | | | | | | | | | |
| block-loop containment | | | | | | | | | | |
| remote notification | | | | | | | | | | |
| remote human answer | | | | | | | | | | |
| OC workflow rediscovery | | | | | | | | | | |
| worker-session resume | | | | | | | | | | |

Add rows when needed.

## 9. Required Deliverable

Produce:

# Hermes Capability Survey HS-003 — Human Interaction and Control Plane

Required sections:

1. Executive Summary
2. Baseline and Version Matrix
3. HS-002 Evidence Revalidation
4. Native Kanban Lifecycle Controls
5. `needs_input` and Resumption Semantics
6. Block-Loop Containment
7. Messaging and Remote Human Interaction
8. Operational Orchestrator Continuity
9. ForgePilot MCP Gap Analysis
10. Capability Matrix
11. Confirmed Observations
12. Contradictions and Version Differences
13. Unresolved Questions
14. Recommendations
15. Proposed Minimal Adapter Surface
16. Limitations
17. Evidence Index

## 10. Recommendation Rules

For every identified gap, choose exactly one:

- `BUILD_NOTHING`
- `CONFIGURE_HERMES`
- `UPDATE_PROFILE_POLICY`
- `EXPOSE_BOUNDED_FORGEPILOT_ADAPTER`
- `REPORT_HERMES_VERSION_DISCREPANCY`
- `RUN_FURTHER_CANARY`
- `OUTSIDE_SCOPE`

Do not recommend implementation merely because the dashboard is inconvenient.

Prefer native Hermes controls when they exist and can be safely configured or exposed.

## 11. Proposed Minimal Adapter Constraints

If the evidence supports a ForgePilot adapter, recommend only the smallest bounded operations necessary.

Potential operations to evaluate, not pre-approve:

- task comment;
- task edit with exact expected version or state;
- unblock;
- archive or quarantine;
- recurrence inspection;
- explicit redispatch;
- pending human-decision list.

Any future mutation tool should require:

- exact board;
- exact task;
- expected current status;
- bounded operation;
- idempotency;
- explicit authorization;
- durable audit event;
- no generic shell;
- no arbitrary database write;
- no hidden workflow reconstruction.

Do not implement these tools in HS-003.

## 12. Independent Verification

A separate verifier must:

- confirm all cited official documentation;
- confirm installed 0.19.1 source findings;
- reproduce live read-only observations;
- confirm experiments remained bounded;
- challenge causal claims;
- identify any conflation of task, native run, worker session, outer Runs API run, and ChatGPT session;
- verify every classification in the capability matrix;
- return `PASS`, `FAIL`, or `INCOMPLETE`.

A `FAIL` or `INCOMPLETE` verdict blocks synthesis.

## 13. Synthesis

A synthesizer may proceed only after verifier `PASS`.

The synthesizer must preserve:

- confirmed facts;
- contradictory evidence;
- version distinctions;
- confidence labels;
- unresolved questions;
- the difference between native capability and adapter exposure.

The synthesizer must not convert inference into observation.

## 14. Hard Constraints

Do not:

- modify any repository;
- commit, push, merge, tag, or branch;
- edit Hermes configuration;
- restart services;
- configure a messaging platform;
- send external messages;
- expose secrets or private identifiers;
- implement MCP tools;
- patch Hermes;
- alter HS-002 evidence;
- recreate the HS-002 loop;
- permit more than two automatic canary recurrences;
- treat online `main` behavior as proof of installed 0.19.1 behavior.

Stop and report when required evidence cannot be gathered safely.

## 15. Success Criteria

HS-003 succeeds only if ForgePilot can answer, with evidence:

1. Which human-interaction and lifecycle controls Hermes already provides.
2. Which controls are present in 0.19.1.
3. Which controls are configured locally.
4. Which controls are available only through dashboard or CLI.
5. Which controls are missing from the ForgePilot adapter.
6. Why HS-002 exceeded the documented recurrence behavior.
7. Whether the dashboard must remain open for human governance.
8. Whether messaging can provide a safe asynchronous control channel.
9. What the smallest justified next implementation is.
10. What should not be built because Hermes already provides it.

## 16. Starting Official Sources

Use these as starting points, then verify exact installed-version behavior:

- `website/docs/user-guide/features/kanban.md`
- `website/docs/reference/cli-commands.md`
- `website/docs/user-guide/messaging/index.md`
- `website/docs/user-guide/messaging/telegram.md`
- `website/docs/user-guide/messaging/discord.md`
- `website/docs/user-guide/security.md`
- `website/docs/developer-guide/gateway-internals.md`

Repository:

`NousResearch/hermes-agent`

Do not rely on third-party summaries for technical conclusions.
