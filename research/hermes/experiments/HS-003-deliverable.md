# Hermes Capability Survey HS-003 — Human Interaction and Control Plane

Date: 2026-08-01
Board: hs-003
Task: t_cdfcdf15 (assignee: forgepilot-synthesizer)
Produced by: Synthesis (packet Section 13), after independent verifier t_f19164b0 returned PASS.
Sole specification: /home/ridasaidd/forgepilot/research/hermes/experiments/HS-003-packet.md
(sha256 40ce36cc0633ca5d5946ed440ca9f7de6d96f69b4643a29f4832cb8186af3cc1, 14588 bytes —
byte-exactness verified by the verifier STEP 0 and independently by each phase A–E; this
synthesizer session re-read the packet in full, 473 lines).

Citation tags used throughout: [A:§n] Phase-A-report.md section; [B:Qn] Phase-B-report.md
answer; [C:§n] Phase-C-report.md section; [D:§n] Phase-D-report.md section; [E:En]
Phase-E-report.md experiment; [V:Dn] Verification-report.md duty. Confidence labels are the
packet Section 6 HIGH/MEDIUM/LOW labels as recorded by the phases and re-verified by the
verifier. Every stated fact traces to the phase/verification evidence; inference is labeled
as inference.

---

## 1. Executive Summary

HS-003 asked which Hermes human-interaction and lifecycle-control capabilities already
exist, which are configured locally, which are absent from the current ForgePilot adapter,
and which gaps genuinely require implementation (packet Section 1). The survey ran five
read-only/source phases (A baseline, B documentation, C installed-source, D live read-only
revalidation, E minimal bounded live experiments) and an independent adversarial
verification that returned **PASS** with no material errors [V:Verdict].

Headline findings:

1. **The native control plane exists and works.** Comment, unblock, rerun-same-task,
   archive, triage (as status), recurrence inspection, dependency link/unlink, status
   changes, assign/reassign, and the /kanban slash surface are NATIVE_AND_WORKING at
   layers 1/2 (docs main + installed 0.19.1 source) and, where live-tested, at layer 8
   [B:Q1][C:§4][E:§5]. Title/body edit is native via dashboard REST and the headless
   `specify` path; the documented CLI `edit --title/--body` verb does not exist in either
   version (D1) [B:§0][E:E02].
2. **A blocked `needs_input` task terminates its run; unblock opens a NEW run that
   restarts from the task instructions.** There is no same-run suspend/resume and no
   worker-session resume for kanban runs (NOT_SUPPORTED, HIGH) [B:Q2][C:2.10][D:§4 obs 2/6].
3. **Block-loop containment's primitive works (limit 2 → triage + block_loop_detected),
   but its end-to-end halt promise is contradicted by local observation (MEDIUM):** the
   gateway auto-decomposer (default on) re-promotes triage tasks back to ready before
   dispatch each tick, which is the source-grounded mechanism behind HS-002's runs 4–13
   with recurrences climbing past the limit [C:2.7][V:D5.1][D:§3.5–3.7].
4. **Remote notification and remote human answer are natively supported but NOT
   configured locally** — no messaging platform is configured (layer 3 NATIVE_BUT_UNCONFIGURED),
   and no live messaging test was permitted without G0 approval [A:§5][B:Q4][E:§5 #13].
5. **The ForgePilot Hermes MCP exposes only board-create and task-create mutations**;
   comment, edit, unblock, archive, quarantine/triage, reassign, dependency mutation,
   redispatch, recurrence write, human-answer injection, and worker-session resume are
   all NATIVE_BUT_NOT_EXPOSED_BY_FORGEPILOT at layer 7 (HIGH) [A:§4][D:§4 obs 10][V:D7].
6. **The dashboard does not need to remain open for board governance:** CLI
   comment/unblock/archive and (once a messaging platform is configured) /kanban, /approve,
   /deny cover the human-decision loop; the dashboard is one of several native surfaces and
   its REST API is session-cookie-gated (not headlessly scriptable without credentials)
   [B:Q4][E:E04][V:D5].
7. **Smallest justified next implementation:** a bounded ForgePilot adapter surface
   (task comment; unblock with expected status; archive; recurrence read; pending
   human-decision list) — evaluated, not pre-approved, against packet Section 11
   constraints (Section 15 below). What should NOT be built: same-run resume, a distinct
   quarantine status, headless dashboard auth bypass, generic shell/DB-write or hidden
   workflow-reconstruction tools.

Every capability below carries exactly one packet Section 6 classification plus one
HIGH/MEDIUM/LOW confidence; the native-capability vs adapter-exposure distinction is
preserved throughout.

---

## 2. Baseline and Version Matrix

Recorded by Phase A, read-only, before any other phase ran [A:§1–§9]:

| Item | Baseline (recorded 2026-08-01) | Evidence |
|---|---|---|
| Installed Hermes | v0.19.1 (2026.7.30), upstream 126ff707, 1 commit behind; editable git install at /home/ridasaidd/.hermes/hermes-agent; Python 3.11.15; OpenAI SDK 2.24.0; `hermes --version` output verbatim in [A:§1] | [A:§1] |
| CLI launcher | /home/ridasaidd/.local/bin/hermes (4-line bash wrapper, not a symlink) | [A:§1][C:§1] |
| Profiles | default (gateway running, PID 781565), forgepilot-operational-orchestrator, forgepilot-orchestrator, forgepilot-synthesizer, forgepilot-verifier, forgepilot-worker (current) — all model deepseek-v4-flash | [A:§2] |
| Kanban toolset per profile | NOT statically enabled in any profile config.yaml; workers receive kanban tools via HERMES_KANBAN_TASK (dispatcher); 12 native kanban tools registered in installed source (kanban_show/list/complete/block/heartbeat/comment/attach/attach_url/attachments/create/unblock/link); kanban_list + kanban_unblock are orchestrator-gated (_check_kanban_orchestrator_mode) | [A:§3][V:D2.5] |
| ForgePilot Hermes MCP | 22 `forgepilot_hermes_*` tools (bridge repo forgepilot-chatgpt-mcp @ 9cfb36f4); readonly GET sidecar 127.0.0.1:8652; mutation POST sidecar 127.0.0.1:8653; runner 127.0.0.1:8791; auth via bearer tokens + HMAC envelope (names only, no values) | [A:§4] |
| Adapter mutations | board_create + task_create ONLY; no comment/edit/unblock/archive/quarantine/reassign/redispatch/dependency mutation | [A:§4][D:§4 obs 10] |
| Messaging platforms | none configured (Telegram/Discord/WhatsApp/Signal/Slack/Email/SMS/… all ✗ per `hermes status`; no `platforms:` section in any config.yaml) | [A:§5] |
| Block-recurrence config | BLOCK_RECURRENCE_LIMIT = 2, module constant hermes_cli/kanban_db.py:134; no config-file key, no env override in installed source | [A:§6][C:2.3] |
| Dashboard | PID 774587 (host 100.80.45.13:4096); not separately versioned — FastAPI reports 0.19.1, web package.json 0.0.0, kanban plugin manifest 1.0.0 | [A:§7] |
| Services | Gateway PID 781565 (manual, default profile; dispatcher embedded, kanban.dispatch_in_gateway default true, 60 s tick); dashboard 774587; MCP bridge 860124; ops server 628532; readonly sidecar 836534; mutation sidecar 860131; runner 10829. PIDs unchanged across all phases (no restarts) [V:D4.4] | [A:§8][V:D4.4] |
| HS-002 identifiers | Board hs-002-canary-001; tasks t_00c48c5a (OC) / t_82769ccf (GC) / t_36b0fdbd (worker) / t_b45b698c (verifier, archived); native runs #1–#13 (verifier owns 4–13); block_loop_detected with recurrences 8–10 vs limit 2; archive event 93; Runs API runs run_9c91277a26244d2e94af3b40cacce500 (completed) and run_b5ff349d52564b3e84fd7d7914caf878 (stopping) | [A:§9][D:§3] |

Version matrix (docs main vs installed 0.19.1) [B:§0][C:§3]:

| File (website/docs + source) | installed 0.19.1 | main (2026-08-01 fetch) | Verdict |
|---|---|---|---|
| user-guide/features/kanban.md | 1011 lines | 1035 lines | DIFFERS — main adds only "Multi-profile setups: delivery is profile-owned" (main 907–929); all other kanban.md content byte-identical |
| kanban-tutorial.md, kanban-worker-lanes.md, cli-commands.md, toolsets-reference.md, slash-commands.md, messaging/index.md, telegram.md, discord.md, relay.md, security.md, gateway-internals.md, sessions.md | identical line counts | identical | 12/13 docs identical (line counts + sampled/full reads) |
| hermes_cli/kanban_db.py | 10010 | 10156 | +146; surveyed functions identical; main adds list_comments_after (:3583) |
| hermes_cli/kanban.py | 3236 | 3236 | identical (incl. run_slash, edit verb) |
| gateway/kanban_watchers.py | 1489 | 1493 | +4; surveyed regions identical |
| tools/kanban_tools.py | 2156 | 2235 | +79; same 12 tools; main adds inject_new_comments_from_env (:335) |
| plugins/kanban/dashboard/plugin_api.py | 2598 | 2825 | +227; same route set + /estimate x2, /projects |
| gateway/slash_commands.py / run.py | 5483 / 25766 | 5503 / 25962 | +20 / +196; /kanban handler identical at :432 both |

Main-only features (absent in installed 0.19.1) [C:§3]: (1) live operator-note injection
into a RUNNING kanban worker (`inject_new_comments_from_env` tools/kanban_tools.py:335 +
`list_comments_after` kanban_db.py:3583; steer-based, 6 s poll, watermark; 0 hits in the
installed tree); (2) dashboard estimate/projects routes (no control-plane impact);
(3) kanban.md multi-profile delivery section (docs only). BLOCK_RECURRENCE_LIMIT=2 and the
block/unblock/specify/dispatch logic are identical in both trees [C:§3].

---

## 3. HS-002 Evidence Revalidation

Phase D revalidated every HS-002 claim against primary board data (read-only CLI reads of
board hs-002-canary-001) and the verifier independently reproduced the numbers [D:§3–§4][V:D3].

All ten packet Section 2 observations: **CONFIRMED** [D:§4]:

1. Verifier entered `needs_input` — blocked event {reason "Approve YES or NO?", kind
   needs_input, recurrences 1} @1785607871, run 4. CONFIRMED.
2. Active native run terminated with outcome `blocked` — run 4 row, ended same second. CONFIRMED.
3. Human comments and unblock via dashboard — 2 comments authored "dashboard" ("Yes"
   @1785607941, "YES" @1785608003) bracketing the single unblocked event @1785607971;
   dashboard PATCH→unblock_task code path (plugin_api.py:874–881). CONFIRMED (event-side;
   the unblock event carries no author field — inference disclosed [D:§3.4]).
4. Unblock preserved task + dependency graph — id t_b45b698c constant; parents
   [t_36b0fdbd] unchanged; zero link/unlink events. CONFIRMED.
5. Hermes created a new native run on the same task — run 5 claimed @1785608027 after
   unblock. CONFIRMED.
6. New run restarted from instructions, not resumed — run 5 distinct row, new pid
   (871932 vs 871436), fresh spawned events/session; no run-resume path in source. CONFIRMED.
7. Unchanged instructions caused repeated blocking/redispatch — runs 5–13 all blocked,
   identical reason. CONFIRMED.
8. block_loop_detected emitted but dispatch continued through run 13 — 9 events
   (recurrences 2..10, limit 2, runs 5–13) interleaved with specified→promoted→claimed→spawned. CONFIRMED.
9. Manual archive stopped the loop — archived is the final event @1785609127, no run 14;
   "manual" qualifier rests on the HS-002 report (no author payload). CONFIRMED (event-side).
10. ForgePilot adapter lacked comment/unblock/edit/archive/quarantine/redispatch mutations
    — independently grepped: 22 tools; kanban mutations = board_create + task_create only;
    sidecars: PUT/PATCH/DELETE → 405. CONFIRMED.

Primary numbers (t_b45b698c) [D:§3][V:D3.1]: 74 events; 20 comments (10 verifier
"Approve YES or NO?", 2 dashboard "Yes"/"YES", 8 auto-decomposer "Specified — …"); 10 runs
(ids 4–13, all outcome=blocked, non-overlapping); exactly 1 unblocked event; 9
block_loop_detected (recurrences 2,3,4,5,6,7,8,9,10, limit 2); 8 specified events
(7 title+body, 1 body-only @1785608729) each with an "auto-decomposer"-authored audit
comment; 9 promoted events (1 initial + 8 post-specify); archived final; board-wide 93
events; dependency graph unchanged (OC t_00c48c5a → GC t_82769ccf → worker t_36b0fdbd →
verifier t_b45b698c).

Disclosed limitations, all accepted by the verifier [D:§6][V:minor notes]:
- D-PKT-1 (packet defect): packet §7 Phase D's `--board hs-003` pointer for HS-002 evidence
  is wrong; the HS-002 board slug is hs-002-canary-001. Resolved by Phase A without data loss.
- D-002-1 (phrasing): HS-002 report says "Yes, YES then unblocked"; actual event order is
  "Yes" @1785607941 → unblocked @1785607971 → "YES" @1785608003. Substance unaffected.
- Q-1: numeric event id 93 verified by reconstruction (93 rows, archive last, AUTOINCREMENT
  ids in insertion order, kanban_db.py:1240–1247), not by direct DB read (deny rule +
  dashboard 401). HIGH confidence; the literal id column remains unread read-only.
- Q-2: unblock/archive event authorship ("dashboard"/"human") is inferred from adjacent
  dashboard comments + dashboard PATCH code path + HS-002 report; the event payload has no
  author field.
- Q-3: a chat session id in the preserved worker log is redacted (<session-id>) per the
  no-private-identifiers constraint.

---

## 4. Native Kanban Lifecycle Controls

Per-operation surface inventory (layers 1/2/4/5/6 evidence from Phases B/C; live layer-8
evidence where noted). Every operation below has a callable installed code path [C:§2][B:Q1]:

| Operation | CLI | Dashboard | Agent tool | REST/API | Event | Resulting run behavior |
|---|---|---|---|---|---|---|
| comment | `kanban comment <id> "<text>" [--author]` (kcli:567) | card thread + POST /comments (pa:1125, default author "dashboard") | kanban_comment (kt:2095) | POST /tasks/:id/comments | commented | included in next run's context (build_worker_context, capped 30×2 KB) [E:E01] |
| edit title/body | NOT_SUPPORTED as title/body verb (D1; `edit` = completed-task recovery only, kcli:604–623); `specify` rewrites via LLM (triage→todo) | PATCH /tasks/:id title/body branch (pa:946–966) | none in 12-tool set | PATCH /tasks/:id | edited (payload NULL) | next run reads CURRENT task row at spawn → edit before unblock changes next run [C:2.9][E:E02] |
| assign / reassign | assign (kcli:477), reassign (kcli:509) | assignee row + bulk reassign | none | PATCH /tasks/:id assignee | assigned | assign_task refuses running tasks (kb:3326) |
| unblock | `kanban unblock <id>... [--reason]` (kcli:647; --reason auto-comment "UNBLOCK: …") | status action row; PATCH status=ready→unblock_task (pa:874–881) | kanban_unblock (orchestrator-gated, kt:111–124/2140) | PATCH /tasks/:id status | unblocked | closes stale run as reclaimed; task→ready (all parents done) or todo; NEVER triage; block_recurrences preserved [E:E01/E03] |
| dispatch | `kanban dispatch [--dry-run] [--max N]` (kcli:708) | "Nudge dispatcher" + POST /dispatch (pa:2006) | none (gateway component) | POST /dispatch | (claimed/spawned per task) | eligibility: status='ready' AND claim_lock IS NULL (kb:8213–8217); new run row per attempt [E:E02 run 3 auto-claimed] |
| archive | `kanban archive <id>...` (kcli:691; `--rm` purge) | status row; PATCH status=archived | none in 12-tool set | PATCH /tasks/:id status | archived | reclaims in-flight run; terminal event [D:§4 obs 9][E:teardown] |
| quarantine/triage | no push-to-triage verb; entry via loop breaker, create --triage; exit via specify/decompose | "→ triage" status row (PATCH status=triage, pa:889–890) | kanban_block routes to triage at recurrence limit | PATCH /tasks/:id status | block_loop_detected / status | triage is a first-class status; distinct "quarantine" NOT_SUPPORTED [E:E03] |
| recurrence inspection | show / runs / diagnostics (kcli:528,807) | last-20 events in card drawer; GET /tasks/:id events | kanban_show (events + worker_context) | GET /tasks/:id (events[]) | — | block_recurrences column + event payloads {reason,kind,recurrences,limit} [D:§3.5] |
| dependency changes | link / unlink (kcli:550–556) | dependency editor + POST/DELETE /links | kanban_link (orchestrator); no unlink tool | POST/DELETE /links | (link/unlink events) | cycle-detected; same-board only; HS-002 graph unchanged (zero events) [D:§3.10] |
| status changes | complete/block/schedule/promote/archive (no raw set-status verb) | drag-drop + status row + bulk | kanban_block / kanban_complete (lifecycle subset) | PATCH /tasks/:id status (rejects direct running) | status / blocked / completed / archived | complete resets block_kind/recurrences (kb:4770–4771) |

Slash surface: /kanban <action> shares the CLI argparse tree via run_slash
(kcli:3161–3236; gsc:432–538), bypasses the running-agent busy guard, auto-subscribes on
create, truncates at ~3800 chars on messaging; /approve (gsc:5167) and /deny (gsc:5225)
plus plain-text yes/no approval routing (gr:8398–8445) [B:Q4][C:2.11]. `/kanban edit`
inherits D1 (no title/body edit via messaging either).

---

## 5. `needs_input` and Resumption Semantics

Direct answers to packet Q2, each with evidence [B:Q2][C:2.1/2.2/2.8/2.10][E:E01/E02/E03][D:§4]:

1. **Does `needs_input` always terminate the active native run?** YES. kanban_block
   kind=needs_input → block_task truly-blocked branch closes the run with outcome
   "blocked" (kb:5653–5665; synthesized zero-duration run when never claimed) and sets the
   task status to blocked (or triage at the loop limit). `blocked` is a terminal run
   outcome; runs are "one row per attempt" (kanban.md:907–919). HIGH. Live: HS-002 run 4
   ended the same second as the blocked event; E01/E03 runs closed per block [D:§4 obs 2][E:E01/E03].
2. **Does any native path suspend and resume the same run?** NO. No suspend/resume of
   task_runs exists anywhere in installed source; unblock opens a NEW run row (unblock_task
   kb:5754 closes any stale run as 'reclaimed'; dispatcher claims and spawns a new run).
   HIGH. Live: HS-002 run 5 was a fresh pid/session that restarted from the task body
   [D:§4 obs 6].
3. **Are comments included in the next run's task context?** YES. build_worker_context
   includes the comment thread (most recent 30, 2 KB cap each) and it is delivered via
   kanban_show worker_context + KANBAN_GUIDANCE system-prompt injection
   (kb:9055–9300; kt:466; agent_init.py:1417–1419). HIGH. Live: E01 — marker comment posted
   before unblock; run 2 completed "E01-readback: yes" [E:E01].
4. **Does editing the task body before unblock change the next run?** YES by construction
   — build_worker_context reads the CURRENT task row (title kb:9097, body kb:9117–9119) at
   spawn; specify_triage_task rewrites title/body and the next run reads the new body
   (kb:5820–5908). MEDIUM from docs alone (docs do not spell out the workflow); HIGH from
   source; live: E02 Part C — specify-rewritten body → run 3 completed "E02-BODY-V2"
   exactly [E:E02]. The direct human dashboard edit before unblock was not headlessly
   executable (401 no_cookie) — recorded, not asserted [E:E02 Part B].
5. **Can a human answer be injected into the existing worker session?** NO in 0.19.1. A
   blocked run is closed; there is no kanban-native injection path. Main (post-0.19.1)
   adds steer-based live comment injection (`inject_new_comments_from_env` +
   `list_comments_after`) — NATIVE_BUT_VERSION_DEPENDENT; absent from the installed tree
   (0 hits). Not live-testable without messaging/G0 approval [C:§3][E:§5 #12].
6. **Are task-level rerun and session-level resume separate capabilities?** YES — task_runs
   (one row per attempt) vs state.db chat sessions (hermes --resume / /resume gsc:4304;
   gateway-restart auto-resume). Separate tables, separate lifecycles. HIGH [B:Q2][C:2.10].

---

## 6. Block-Loop Containment

Answers to packet Q3 [B:Q3][C:2.3–2.7][E:E03][D:§3.5–3.9][V:D5.1]:

- **Installed BLOCK_RECURRENCE_LIMIT = 2** — module constant kanban_db.py:134, identical in
  main. Not configurable via config.yaml or env in installed source (no config key, no env
  read; docs say "raise the limit" without a config path — code-level only). HIGH.
- **Counter semantics:** task-wide, kind-scoped — `same_cause = prev_kind == kind`;
  `recurrences = prev + 1 if same_cause else 1` (kb:5577–5578); compared by block kind
  (needs_input/capability/transient), not full reason string. Survives unblock
  (unblock_task deliberately does NOT reset it, kb:5795–5804); resets to 0 ONLY on
  successful completion (kb:4770–4771/4787–4788). HIGH.
- **Expected behavior at limit:** block_task routes the task to status='triage', clears
  claim/pid, stores block_kind/block_recurrences, closes the run with outcome 'blocked',
  and emits `block_loop_detected {reason, kind, recurrences, limit}` (kb:5580–5618); the
  ordinary `blocked` event is NOT emitted on that path; the notifier pings loudly ("routed
  to TRIAGE — needs a human decision", kw:460–478). HIGH. Live: E03 — run 4 blocked
  (recurrences 1); after experimenter unblock, run 5 tripped exactly at recurrences 2,
  emitted {reason "E03-approve?", kind needs_input, recurrences 2, limit 2}, task observed
  in triage at poll 4, archived 1 s later; 0 automatic recurrences [E:E03].
- **Why HS-002 exceeded documented behavior (the causal claim, MEDIUM):** the gateway
  AUTO-DECOMPOSER (`_auto_decompose_tick` kw:1337–1412; kanban.auto_decompose default
  true, kw:50; per_tick default 3) runs BEFORE dispatch in each dispatcher-loop iteration
  (kw:1435–1438) and calls decompose_task(tid, author="auto-decomposer") on every triage
  task; with LLM fanout=false the specify fallback rewrites title/body and flips
  triage→todo (kdec:347–380 → specify_triage_task kb:5820–5908), then recompute_ready
  promotes todo→ready→dispatch. specify/unblock never reset block_recurrences, so the
  counter climbs past the limit while auto_decompose is on — the loop breaker alone cannot
  halt the cycle. Evidence: 8 `specified` events whose audit comments are authored
  "auto-decomposer" (a string produced only by that code path), each immediately followed
  by promoted→claimed→spawned, with block_loop_detected recurrences climbing 2..10 despite
  limit 2 [D:§3.6–3.7][V:D5.1]. Residual honesty: the gateway tick itself was not observed
  in a gateway log, and E03 intentionally archived before the tick fired; the end-to-end
  classification is therefore MEDIUM — a conservative, verifier-endorsed choice [V:D5.1][E:§5 #14].
- **Docs vs observation:** kanban.md:975 describes routing to triage as "breaking the
  unblock↔re-block loop"; the docs describe auto-decompose (kanban.md:542/564) and the loop
  breaker separately and do not document their interaction. Observed 0.19.1 behavior
  re-promotes triage tasks, so the containment-level classification is
  DOCUMENTED_BUT_CONTRADICTED_BY_LOCAL_OBSERVATION (MEDIUM); the primitive breaker itself is
  NATIVE_AND_WORKING (HIGH). [B:Q3][C:§4][V:D7].
- **Installed 0.19.1 vs online main:** recurrence logic identical in both trees; no
  version difference for containment [B:Q3][C:§3].

---

## 7. Messaging and Remote Human Interaction

Answers to packet Q4. Every messaging capability is natively implemented (layers 1/2, HIGH)
but NOT configured locally (layer 3 = NATIVE_BUT_UNCONFIGURED, Phase A: zero platforms
configured) and NOT live-tested (packet requires separate G0 approval for live messaging;
none granted — none run) [A:§5][B:Q4][E:§5 #13].

| Capability | Native support (docs + installed source) | Local status |
|---|---|---|
| Proactive notification | gateway notifier polls task_events, delivers one message per terminal event (completed/blocked/gave_up/crashed/timed_out) to subscribed chats; auto-subscribe on /kanban create (default true); CLI notify-subscribe/list/unsubscribe (kcli:765–797); block_loop_detected loud ping (kw:460–478); home-channel delivery (/sethome, TELEGRAM_HOME_CHANNEL etc.) | UNCONFIGURED |
| clarify questions | gateway renders numbered prompt/buttons; multi-select; agent.clarify_timeout default 600 s with sentinel unblock on timeout | UNCONFIGURED |
| Dangerous-command approval | approvals.mode smart/manual; fail-closed timeout (security.md:142); messaging reply words yes/no (security.md:216–219); /approve [/deny] slash; plain-text yes/no auto-routing (gr:8398–8445 — source ahead of docs) | UNCONFIGURED (deny glob rules active locally per Phase A) |
| Slash commands | full registry incl. /kanban, /approve, /deny, /sethome, /queue, /steer, /stop, /resume; admin/user tier split | UNCONFIGURED |
| Kanban reads/comments/unblock/archive via messaging | /kanban <action> = run_slash = same argparse tree as CLI; every CLI verb works; bypasses running-agent guard; ~3800-char truncation | UNCONFIGURED (CLI/TUI equivalent exists) |
| Interaction while another agent runs | busy_input_mode interrupt/queue/steer; /steer injects mid-turn; /kanban exempt from the guard | UNCONFIGURED |
| Remote board control without the dashboard | documented as fully possible via CLI + /kanban + notifications (kanban.md:808–858, 891–905); human decision = unblock + comment via CLI//kanban (kanban.md:831–832) | MEDIUM (documented workflow; not live-verified this survey) |

Remote notification and remote human answer therefore classify as NATIVE_AND_WORKING at
layers 1/2 (HIGH) with layer 3 explicitly NATIVE_BUT_UNCONFIGURED [B:Q4][C:§4][V:D7].
No messaging platform was configured or contacted during HS-003 (hard constraint + G0 gate).

---

## 8. Operational Orchestrator Continuity

Answers to packet Q5. The composite "OC as durable human-facing endpoint after its original
run completed" is NOT documented as a designed workflow; it is composable from native
primitives (list/show/comment/unblock tools; worker_lanes.md:87–89) [B:Q5].

- **Primitives — NATIVE_AND_WORKING (HIGH):** a fresh OC run can list boards/tasks
  (kanban_list --status blocked, --assignee), show a task (status, reason, comment thread,
  events), post a decision comment (kanban_comment), and unblock (kanban_unblock —
  orchestrator-gated; hidden from dispatcher-scoped workers) [B:Q5][C:2.11][V:D7].
- **Composite — UNRESOLVED (MEDIUM):** not documented as a single feature; the survey
  tested it live (E05) [E:E05]:
  - Fresh OC LOCATES the blocked task and reads the EXACT decision request (status=blocked,
    kind=needs_input, reason "E05 approve?", comment thread): **CONFIRMED** live.
  - OC APPENDS the human decision via kanban_comment ("E05-APPROVED", comment_id 5,
    ok:true): **CONFIRMED** live; the downstream run read it and completed "E05-ok".
  - OC UNBLOCKS the correct task: **NOT achieved** — the dispatched OC's terminal had
    `hermes` not on PATH (exit 127 "hermes: command not found"); the operator completed the
    unblock with the full-path wrapper. This is an environment/integration detail (PATH
    lacks /home/ridasaidd/.local/bin; dispatcher-spawned agents also lack the
    orchestrator-gated kanban_unblock tool), NOT a Hermes capability gap. A retry with the
    full binary path was intentionally not performed (one-dispatch bound) [E:E05][V:minor 5].
- **Durable state across OC sessions:** task rows, runs, comments, events, links, and
  notify subscriptions live in per-board SQLite; a fresh run of the same task reads the
  full worker_context (build_worker_context). Documented durability HIGH; the composite
  workflow remains UNRESOLVED until the unblock step is demonstrated end-to-end [B:Q5][E:§5 #11].

---

## 9. ForgePilot MCP Gap Analysis

Current adapter surface (observed, not inferred) [A:§4][D:§4 obs 10][V:D2.10/D3]:

- Bridge (forgepilot-chatgpt-mcp, commit 9cfb36f4): 22 `forgepilot_hermes_*` tools —
  conversation_get, conversations_list, events_poll, events_wait, health,
  kanban_board_create, kanban_boards_list, kanban_inspect, kanban_task_create,
  kanban_task_events_poll, kanban_task_events_wait, kanban_task_get, kanban_tasks_list,
  messages_read, messages_send, permissions_list_open, permissions_respond,
  run_approval_respond, run_events, run_start, run_status, run_stop.
- Readonly sidecar (127.0.0.1:8652): GET /health, /v1/boards, /v1/boards/{slug}/tasks,
  /v1/boards/{slug}/tasks/{task_id}, /v1/boards/{slug}/tasks/{task_id}/events,
  /v1/boards/{slug}/inspect; POST/PUT/PATCH/DELETE → 405.
- Mutation sidecar (127.0.0.1:8653): POST /v1/boards (board create), POST
  /v1/boards/{boardSlug}/tasks (task create) only; PUT/PATCH/DELETE → 405; other POST → 404.
- Both sidecars carry EXPECTED_HERMES_VERSION = "0.19.0" source constants (env override
  HERMES_KANBAN_EXPECTED_VERSION supported; process env not inspected) and bearer/HMAC
  auth (names only).

Missing from the adapter (all NATIVE_BUT_NOT_EXPOSED_BY_FORGEPILOT at layer 7, HIGH)
[A:§4][B:Q6][V:D7]: task comment; task edit; unblock; archive; quarantine/triage;
reassign; dependency mutation; dispatch/redispatch; recurrence inspection (write side —
reads partially exposed via readonly sidecar GET events/inspect); human-answer injection;
worker-session resume. Native Hermes provides every one of these control-plane operations
in at least one native surface (Section 4); the adapter currently exposes only
board-create + task-create mutations plus read-only GETs — matching HS-002's finding that
comment/unblock/archive were dashboard-only from the adapter's perspective [A:§4][D:§4 obs 10].

Official hermes-agent docs contain no ForgePilot adapter documentation (adapter lives in a
separate repo); layer-7 evidence is Phase A/D source + live process inspection, not docs
[B:Q6].

---

## 10. Capability Matrix

Columns are the packet Section 5 evidence layers. Values are the phase/verification
recordings; cells are marked not-observed/UNRESOLVED where no evidence exists. Each row
carries exactly one primary classification (packet Section 6) + one confidence
(HIGH/MEDIUM/LOW); sub-notes are preserved where the evidence splits (e.g. layer 3 vs 7).

Key: L1 docs main · L2 0.19.1 source · L3 local config · L4 CLI · L5 dashboard ·
L6 agent tool · L7 ForgePilot MCP · L8 live observed.
Evidence anchors: B=B report, C=C report, E=E report, D=D report, V=verifier.

| Capability | L1 Docs main | L2 0.19.1 source | L3 Local config | L4 CLI | L5 Dashboard | L6 Agent tool | L7 ForgePilot MCP | L8 Live observed | Classification | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|
| task comment | native (kanban.md:64,714) | native (add_comment kb:3518) | enabled (dispatcher-gated tools) | native (kcli:567) | native (POST /comments pa:1125) | kanban_comment (kt:2095) | NOT exposed (22-tool surface) | E01 marker→next-run readback; HS-002 20 comments | NATIVE_AND_WORKING | HIGH |
| task edit (title/body) | native via dashboard REST/specify; CLI `edit --title/--body` claim DOCUMENTED_BUT_CONTRADICTED (D1 kanban.md:706) | native via pa PATCH :946–966 + specify kb:5820; CLI edit recovery-only kcli:604–623 | dashboard auth-gated; specify headless-capable | NOT_SUPPORTED as title/body verb (D1 live, E02-A) | native (PATCH /tasks/:id; card drawer) | none in 12-tool set | NOT exposed | E02-C: specify-rewritten body → run "E02-BODY-V2"; direct dashboard edit not headlessly observable | NATIVE_AND_WORKING (dashboard REST/specify); D1 flagged | HIGH |
| unblock | native (kanban.md:268–285,719) | native (unblock_task kb:5754; never triage; preserves recurrences) | enabled (gateway dispatcher; orchestrator tool gate) | native (kcli:647; --reason auto-comment) | native (PATCH status=ready pa:874–881) | kanban_unblock (orchestrator-gated kt:111–124) | NOT exposed | E01/E03 CLI unblock live; HS-002 dashboard unblock event-side; E04 dashboard not headlessly observable | NATIVE_AND_WORKING | HIGH |
| rerun same task | native (new run per attempt kanban.md:907–919) | native (unblock→ready; dispatch_once kb:8057; claim+_default_spawn new run) | enabled (embedded dispatcher, 60 s tick) | native (unblock/dispatch/promote) | native (unblock/status row) | kanban_unblock (orchestrator-gated) | NOT exposed | HS-002 runs 4–13; E01 run 2; E03 run 5; E05 run 8 — all new runs after unblock | NATIVE_AND_WORKING | HIGH |
| resume same native run | NOT_SUPPORTED (blocked = terminal outcome) | NOT_SUPPORTED (_end_run kb:3831 closes; no run resume path) | n/a | NOT_SUPPORTED (kanban); `--resume` = chat sessions only | NOT_SUPPORTED | NOT_SUPPORTED | not exposed (n/a) | HS-002 run 5 fresh pid/session (restart, not resume); E01/E03 fresh sessions | NOT_SUPPORTED | HIGH |
| archive | native (kanban.md:720,951) | native (archive_task kb:6144; reclaims in-flight run) | enabled | native (kcli:691) | native (status row; PATCH status=archived) | none in 12-tool set | NOT exposed | HS-002 archive event 93 final (loop stopped); E01–E05 teardown archives | NATIVE_AND_WORKING | HIGH |
| quarantine/triage | native as status triage (kanban.md:62,554); distinct "quarantine" NOT_SUPPORTED | triage entries kb:5586/5871/6101; PATCH :889; no quarantine status/verb | enabled (statuses incl. triage) | no push-to-triage verb (loop breaker / create --triage / specify+decompose exits) | native ("→ triage" status row) | kanban_block routes to triage at limit | NOT exposed | E03 triage terminal state at limit 2 (poll 4); HS-002 block_loop_detected→re-promotions | NATIVE_AND_WORKING (triage as status); quarantine NOT_SUPPORTED | HIGH |
| recurrence inspection | native (event payload kanban.md:975; show/runs) | native (block_recurrences column kb:949; events; runs rows) | enabled | native (show/runs/diagnostics kcli:528,807) | native (last-20 events in drawer; GET /tasks/:id events) | kanban_show (events + worker_context) | read-only exposure via sidecar GET events + GET inspect; no write | HS-002 9 payloads (recurrences 2..10, limit 2); E03 payload {2,2} | NATIVE_AND_WORKING | HIGH |
| block-loop containment | breaker native (kanban.md:975); end-to-end halt DOCUMENTED_BUT_CONTRADICTED_BY_LOCAL_OBSERVATION (docs imply triage breaks loop) | breaker native (limit kb:134; triage kb:5580–5618; counter survives unblock kb:5795; resets on complete kb:4770); auto-decomposer re-promotion present (kw:1337–1412, before dispatch kw:1435–1438) | limit NOT configurable (module constant); kanban.auto_decompose default true (config key exists) | block reports triage landing (kcli:2285–2289); unblock/promote/archive control | status row → triage | kanban_block (triage at limit) | NOT exposed | E03 triage at limit 2 (bounded; breaker works when cycle stopped); HS-002 runs 5–13 continued (auto-decomposer re-promotion) | DOCUMENTED_BUT_CONTRADICTED_BY_LOCAL_OBSERVATION (end-to-end halt; primitive NATIVE_AND_WORKING) | MEDIUM (end-to-end) / HIGH (primitive) |
| remote notification | native (notifier, TERMINAL_KINDS, notify CLI kanban.md:891–905) | native (notifier kw:115; TERMINAL_KINDS :167; block_loop ping kw:460–478; subs kb:9516) | NATIVE_BUT_UNCONFIGURED (no platforms, Phase A) | native (notify-subscribe/list/unsubscribe kcli:765–797) | subscriptions documented (kanban.md:897–903); not live-observed | none (not a tool) | NOT exposed | not-observed (no platforms configured; live messaging requires G0) | NATIVE_AND_WORKING (L1/L2); L3 NATIVE_BUT_UNCONFIGURED | HIGH |
| remote human answer | native (/kanban, /approve, /deny; kanban.md:808–858; slash-commands.md:274–275; security.md:216–219) | native (gsc:432–538; /approve :5167; /deny :5225; plain-text routing gr:8398–8445) | NATIVE_BUT_UNCONFIGURED (no platforms) | /kanban shares CLI argparse tree (run_slash kcli:3161–3236) | n/a (messaging surface) | n/a | NOT exposed | not-observed (no platforms; G0 required) | NATIVE_AND_WORKING (L1/L2); L3 NATIVE_BUT_UNCONFIGURED | HIGH |
| OC workflow rediscovery | primitives native (worker-lanes.md:87–89; kanban.md:294); composite not documented as designed workflow | primitives present (list/show/comment/unblock; orchestrator gate kt:111–124) | OC profiles configured (kanban section: orchestrator_profile, default_assignee) | native (list/show/comment/unblock) | n/a | kanban_show/list/comment/unblock (orchestrator-gated) | NOT exposed | E05: fresh OC located task + read decision request + appended decision comment (CONFIRMED); OC unblock failed (hermes not on PATH — environment) | UNRESOLVED (composite; primitives NATIVE_AND_WORKING) | MEDIUM (composite) / HIGH (primitives) |
| worker-session resume | NOT_SUPPORTED (kanban runs); chat-session resume separate (sessions.md:98–188) | NOT_SUPPORTED (no task_runs resume; --resume / /resume gsc:4304 = chat sessions) | n/a (chat sessions separate) | NOT_SUPPORTED (kanban); `hermes --resume` = chat sessions | n/a (chat /resume via messaging) | NOT_SUPPORTED | not exposed | HS-002 run 5 fresh session (restart, not resume); E01/E03 fresh sessions | NOT_SUPPORTED (kanban run); chat-session resume separate | HIGH |
| human-answer injection into live worker | not documented for 0.19.1; main adds steer-based injection (messaging/index.md:396–420 + main-only tool) | NOT_SUPPORTED in 0.19.1 (0 refs for inject_new_comments_from_env / list_comments_after) | n/a | NOT_SUPPORTED | n/a | NOT_SUPPORTED in 0.19.1; main: kanban_tools.py:335 inject_new_comments_from_env | NOT exposed | not-observed (not testable without messaging/G0) | NOT_SUPPORTED (0.19.1) / NATIVE_BUT_VERSION_DEPENDENT (main) | HIGH |
| dependency mutation | native (link/unlink kanban.md:711–712; cli-commands.md:613–614) | native (link_tasks kb:3408; unlink_tasks kb:3462) | enabled | native (link/unlink kcli:550–556) | native (dependency editor; POST/DELETE /links) | kanban_link (orchestrator); no unlink tool | NOT exposed | HS-002 zero link/unlink events (graph unchanged — capability itself not live-mutated in HS-003) | NATIVE_AND_WORKING | HIGH |
| status changes | native (kanban.md statuses; PATCH) | native (complete kb:4689; block kb:5471; schedule; promote; archive kb:6144; PATCH pa:860–914) | enabled | native (complete/block/schedule/promote/archive) | native (drag-drop, status row, bulk) | kanban_block / kanban_complete (lifecycle subset) | NOT exposed | HS-002 blocked→ready→blocked→archived; E01–E05 lifecycle events | NATIVE_AND_WORKING | HIGH |
| /kanban slash surface | native (kanban.md:808–858; slash-commands.md:110,268) | native (run_slash kcli:3161–3236 same argparse tree; gsc:432–538) | NATIVE_BUT_UNCONFIGURED (requires a messaging platform) | n/a (slash is messaging; CLI has equivalent verbs) | n/a | n/a | NOT exposed | not-observed (no platforms) | NATIVE_AND_WORKING (L1/L2); L3 NATIVE_BUT_UNCONFIGURED | HIGH |
| assign / reassign | native (kanban.md assign/reassign; cli-commands.md:612) | native (assign_task kb:3326; reassign_task kb:4522) | enabled | native (assign kcli:477; reassign kcli:509) | native (assignee row, bulk reassign) | none (no assign tool) | NOT exposed | not-observed in HS-003 live tests (assignees stable) | NATIVE_AND_WORKING | HIGH |
| ForgePilot MCP exposure (L7-centric) | n/a (not in official docs) | n/a (adapter is external) | sidecars configured (:8652 readonly, :8653 mutation); bearer+HMAC auth names recorded | n/a | n/a | n/a | NATIVE_BUT_NOT_EXPOSED_BY_FORGEPILOT for all control-plane mutations (board_create + task_create only; 22 tools) | adapter source inspected (Phases A/D); no live mutation test | NATIVE_BUT_NOT_EXPOSED_BY_FORGEPILOT | HIGH |

19 rows total (13 required + 6 added: human-answer injection, dependency mutation, status
changes, /kanban slash surface, assign/reassign, ForgePilot MCP exposure). Every
classification was independently re-verified by the verifier (duty 7): all SUPPORTED
[V:D7]. All 8 evidence layers are represented; genuinely unobserved cells are marked
not-observed rather than inferred.

---

## 11. Confirmed Observations

Confirmed facts (observation-level, each traced to evidence; inference labeled):

1. Installed Hermes is v0.19.1 (2026.7.30, upstream 126ff707, 1 commit behind), editable
   git install at /home/ridasaidd/.hermes/hermes-agent [A:§1].
2. 12 native kanban tools are registered; kanban_list and kanban_unblock are
   orchestrator-gated; workers receive tools via HERMES_KANBAN_TASK [A:§3][V:D2.5].
3. ForgePilot Hermes MCP exposes 22 tools; mutations limited to board-create + task-create;
   readonly GET sidecar and mutation POST sidecar run on loopback [A:§4][D:§4 obs 10].
4. No messaging platform is configured locally [A:§5].
5. BLOCK_RECURRENCE_LIMIT=2 is a non-configurable module constant in 0.19.1 [A:§6][C:2.3].
6. HS-002: task identity preserved; 10 native runs 4–13 all outcome=blocked; 1 unblocked
   event; 9 block_loop_detected (recurrences 2..10, limit 2); 8 auto-decomposer specified
   events; 9 promoted; archive final; 93 board events; dependency graph unchanged
   [D:§3][V:D3].
7. All ten packet Section 2 HS-002 observations CONFIRMED (obs 9 event-side, "manual"
   qualifier per HS-002 report) [D:§4][V:D3.4].
8. Comments are included in the next run's task context (live: E01 "E01-readback: yes") [E:E01].
9. An edited task body is followed by the next run (live: E02-C "E02-BODY-V2"); CLI
   `edit --title/--body` does not exist in 0.19.1 (live: E02-A; D1) [E:E02].
10. At the recurrence limit the task lands in triage with `block_loop_detected {reason,
    kind, recurrences, limit}` and NO ordinary `blocked` event; the run row closes with
    outcome 'blocked' (live: E03) [E:E03].
11. CLI unblock works live: `unblocked` event, task→ready, new native run, recurrence
    counter preserved; `--reason` records an "UNBLOCK: …" comment (E01/E03) [E:E01/E03].
12. A fresh OC run can locate a blocked task, read the exact decision request, and append
    a decision comment (live: E05) [E:E05].
13. The dashboard REST surface requires a session cookie (401 no_cookie; root 302→/login);
    dashboard unblock/comment/edit are not headlessly observable without credentials
    (E04) [E:E04].
14. Dispatched agent terminals lack `hermes` on PATH (full path
    /home/ridasaidd/.local/bin/hermes required) and lack the orchestrator-gated
    kanban_unblock tool (E05) [E:E05].
15. Main (post-0.19.1) adds live operator-note injection into running kanban workers
    (inject_new_comments_from_env + list_comments_after); absent in 0.19.1 (0 hits) [C:§3][V:D2.8].
16. hs-003 board, repository, config, and services were untouched across all phases
    (PIDs match baseline; canary board archived on disk) [V:D4].
17. Zero automatic canary recurrences across Phase E (≤2 limit satisfied); every
    experiment had a pre-written containment rule; E03 archived 1 s after block_loop_detected,
    beating the 60 s auto-decompose tick [E:§4][V:D4].
18. Phase E canary board hs-003-canary-e01 archived at teardown to
    boards/_archived/hs-003-canary-e01-1785618115 (recoverable, no repo/config change) [E:§7][V:D4.1].

---

## 12. Contradictions and Version Differences

Contradictions (docs/source/local observation):

1. **D1 — CLI `kanban edit --title/--body` is documented but not implemented** in BOTH
   versions (kanban.md:706 vs kanban.py:604–623 = completed-task recovery only with
   --result/--summary/--metadata; grep 0 hits for --title/--body). Live-confirmed (E02-A:
   argparse rejects). Title/body edit is dashboard PATCH + specify only.
   Classification: DOCUMENTED_BUT_CONTRADICTED, HIGH. [B:§0][C:2.9][E:E02-A]
2. **Block-loop containment docs vs local observation** — kanban.md:975 implies triage
   "breaks the loop"; installed 0.19.1 re-promotes triage tasks via the auto-decomposer
   (HS-002 runs 4–13 continued; recurrences 2..10 with limit 2). Classification:
   DOCUMENTED_BUT_CONTRADICTED_BY_LOCAL_OBSERVATION (end-to-end), MEDIUM; breaker primitive
   NATIVE_AND_WORKING, HIGH. [B:Q3][C:2.7][D:§3.5–3.7][V:D5.1]
3. **D2 — cli-commands.md kanban table is a strict subset** of the full CLI verb set
   documented in kanban.md and present in kanban.py (reassign, promote, set-model,
   heartbeat, runs, stats, watch, log, notify-*, swarm, diagnostics, attach, attachments,
   attach-rm, reclaim, repair omitted). Documentation-consistency gap, both versions, HIGH.
   [B:§0 D2][V:D1.3]
4. **Source ahead of docs (same version):** gateway plain-text yes/no approval auto-routing
   (gr:8398–8445) is present in 0.19.1 source but not reflected in security.md's messaging
   approval section (which documents only the reply words). Flagged by Phase B; not a
   version difference. [B:§Unresolved][C:2.11]
5. **Packet pointer defects (corrected, no data loss):** packet §7 Phase D says find HS-002
   tasks via `--board hs-003` (actual slug hs-002-canary-001 — D-PKT-1); packet §16 says
   the forgepilot repo contains website/docs (actually the hermes-agent installed tree
   holds the docs — corrected by Phase B). [D:§6][B:§0]

Version differences (docs main vs installed 0.19.1):

6. kanban.md only: main adds "Multi-profile setups: delivery is profile-owned" (main
   907–929); all other surveyed docs identical by line count + sampled reads. [B:§0][V:D1.1]
7. Source drift: main-only `inject_new_comments_from_env` (tools/kanban_tools.py:335,
   6 s poll, watermark, steer-based) + `list_comments_after` (kanban_db.py:3583) — live
   operator-note injection into running workers; NOT in 0.19.1. [C:§3][V:D2.8]
8. Main-only dashboard routes: POST /estimate, POST /tasks/{id}/estimate, GET /projects
   (plugin_api.py:1767/1774/2292) — no control-plane impact. [C:§3]
9. BLOCK_RECURRENCE_LIMIT=2, block_task/unblock_task/specify/decompose/recompute_ready/
   archive/dispatch/build_worker_context logic, the 12-tool registration set, and
   _handle_kanban_command are identical in both trees (installed offsets verified by read;
   main offsets by function inventory). No behavioral difference in surveyed control-plane
   paths. [C:§3][V:D2]

---

## 13. Unresolved Questions

Recorded as unresolved by the phases/verifier; none blocks the survey conclusions, each is
scoped:

1. Dashboard unblock/comment/edit vs CLI equivalence — dashboard side not headlessly
   observable (session-cookie auth, 401 no_cookie; no credentials used). Equivalence rests
   on the shared unblock_task code path + live CLI observations; a credentialed test would
   close it. [E:E04][V:minor 1]
2. Direct human title/body edit before unblock — not headlessly executable in 0.19.1
   (dashboard-only); answered by source (current-row context build) + E02-C via the
   headless specify path, but the literal dashboard-edit→unblock sequence was not observed
   live. [E:E02 Part B][V:minor 4]
3. OC unblock step end-to-end — blocked by `hermes` not on PATH in dispatched terminals
   (exit 127); a follow-up canary with the full binary path (or an orchestrator-scoped
   session with kanban_unblock) would confirm the final step of the composite OC workflow.
   [E:E05][E:§5 #11][V:minor 5]
4. Auto-decompose gateway tick was not directly observed in a gateway log; attribution
   rests on the "auto-decomposer" comment author (unique to that code path) + source
   ordering (decompose before dispatch) + HS-002 event sequence. Hence MEDIUM for the
   end-to-end containment classification. [V:D5.1][E:§5 #14]
5. Human-answer injection into a RUNNING worker session — NOT_SUPPORTED in 0.19.1
   (main-only feature); not live-testable without messaging/G0 approval. [C:§3][E:§5 #12]
6. Messaging-based remote control (Q4) — natively supported but unconfigured; live tests
   require separate G0 approval (not granted). No live messaging observation exists. [A:§5][E:§5 #13]
7. Numeric event id 93 and unblock/archive authorship — read-only access cannot read the
   literal id column (deny rule + dashboard 401) or the author of author-less events;
   confirmed by reconstruction/inference and disclosed. A credentialed or DB-access
   verifier could close both. [D:§6 Q-1/Q-2][V:minor 2/3]
8. inject_new_comments_from_env call site on main — not located in the fetched runtime
   subset (7 candidate files, 0 hits); capability + semantics established from the tool
   definition and list_comments_after; the wiring point remains unread. [C:§3/§6]
9. BLOCK_RECURRENCE_LIMIT has no config/env path in installed source; whether operators
   can tune it other than by code edit is unanswered (docs mention raising it without a
   config key). [B:Q3][C:2.3]
10. Main-fetch evidence is point-in-time (2026-08-01, commit unknown); whole-file machine
    diffs were not computed (terminal denied on installed tree; execute_code unavailable
    headless) — equality claims cover every surveyed code path plus def/route/registration
    inventories; unread regions of the line deltas may contain unrelated changes. [B:§Limitations][C:§6]

---

## 14. Recommendations

For every identified gap, exactly one packet Section 10 option (rationale in line).
Native controls are preferred over implementation [B:Q4][packet §10]:

| # | Gap | Recommendation | Rationale |
|---|---|---|---|
| R1 | ForgePilot adapter lacks control-plane mutations (comment/edit/unblock/archive/triage/reassign/redispatch/recurrence-write) | EXPOSE_BOUNDED_FORGEPILOT_ADAPTER | Native Hermes provides every operation (Section 4); the adapter exposes only board/task create. Expose the smallest bounded set evaluated in Section 15 — do NOT build new Hermes capability. |
| R2 | D1: docs claim CLI `kanban edit --title/--body` that no version implements | REPORT_HERMES_VERSION_DISCREPANCY | Upstream docs defect present in both versions; capability itself exists natively (dashboard PATCH + specify) — no build. |
| R3 | Remote notification / remote human answer not available locally (no messaging platforms) | CONFIGURE_HERMES | Native support is complete (notifier, /kanban, /approve, /deny, home channel); configuring a platform is a config action, requires separate G0 approval for live messaging — not done in HS-003. |
| R4 | End-to-end block-loop halt not guaranteed: auto-decomposer re-promotes triage; docs omit the interaction | REPORT_HERMES_VERSION_DISCREPANCY | Docs (kanban.md:975) imply triage breaks the loop; observed 0.19.1 re-promotes. Report the docs/behavior gap upstream. Native operational control exists meanwhile: `kanban.auto_decompose: false` (or constraining per_tick) parks triage tasks — prefer that over implementation. |
| R5 | OC unblock step failed in dispatched sessions (hermes not on PATH; kanban_unblock orchestrator-gated) | UPDATE_PROFILE_POLICY | Environment/integration detail, not a capability gap: run OC sessions orchestrator-scoped (kanban toolset, no HERMES_KANBAN_TASK) or instruct with the full binary path /home/ridasaidd/.local/bin/hermes. |
| R6 | resume same native run NOT_SUPPORTED | BUILD_NOTHING | Task-level rerun + comments + edited-body-before-unblock already deliver the control workflow; same-run resume is not required and would be Hermes patching. |
| R7 | Distinct "quarantine" status NOT_SUPPORTED | BUILD_NOTHING | triage is the first-class parking/human-decision status; a separate quarantine adds no capability. |
| R8 | Human-answer injection into a live worker NOT in 0.19.1 | BUILD_NOTHING | Comment-then-unblock workflow is the native equivalent; the feature lands on main (version-dependent) — reassess after an upgrade, no build in 0.19.1. |
| R9 | Dashboard not headlessly accessible (session-cookie auth) | BUILD_NOTHING | CLI comment/unblock/archive and (once configured) /kanban cover headless governance; do not build an auth bypass or a dashboard replacement. |

---

## 15. Proposed Minimal Adapter Surface

Evaluation only — NOT pre-approval, NOT implementation (packet Section 11: "evaluate, not
pre-approve"; Section 14: no adapter/MCP implementation in HS-003). Each candidate
operation is checked against the Section 11 requirements: exact board, exact task,
expected current status, bounded operation, idempotency, explicit authorization, durable
audit event, no generic shell, no arbitrary database write, no hidden workflow
reconstruction. Evidence base: native code paths (C), live behavior (E), existing sidecar
pattern (A: bearer/HMAC envelope, ledger DB, expected-version checks).

| Candidate operation | Evidence supports considering? | Against Section 11 requirements |
|---|---|---|
| task comment | **YES — lowest-risk mutation.** Native add_comment is bounded (single INSERT + `commented` event), board+task-exact, audit-durable. Idempotency achievable via a client-supplied marker (verified unique per task). Authorization: reuse the existing bearer/HMAC envelope of the mutation sidecar. | Meets all ten; no shell, no DB bypass, no workflow reconstruction. |
| task edit with exact expected version/state | **YES, with preconditions.** 0.19.1 has NO task version counter (PATCH is inline SQL, no optimistic concurrency), so "exact expected version" must map to an expected-current-status (and optionally last-event timestamp) precondition checked before the bounded UPDATE; field whitelist (title/body/priority); `edited` event emitted natively. | Meets all ten only if the expected-state precondition is enforced adapter-side and the field set is bounded; otherwise risks stale overwrite. Note: this is the only candidate that cannot rely on a native version token in 0.19.1. |
| unblock | **YES.** unblock_task is bounded, board+task-exact, emits `unblocked`, never routes to triage, preserves the recurrence counter (audit-relevant). Require expected status=blocked (or scheduled) and explicit authorization; the operator-visible "UNBLOCK: <reason>" comment is a native side effect of the CLI path and can be reproduced. | Meets all ten; bounded; no hidden re-promotion (unblock alone does not reset recurrences — documented). |
| archive or quarantine | **archive: YES.** archive_task is bounded, emits `archived`, reclaims in-flight runs; strong containment op (HS-002 obs 9: archive stops the loop). **quarantine: consider ONLY as a status write to triage** with expected-state precondition — do NOT wire an auto-decompose/specify call, or the adapter would reconstruct the HS-002 loop. | archive meets all ten. triage-status write meets all ten only if it is a bare status change (equivalent to dashboard PATCH status=triage) with no decomposition side effects. |
| recurrence inspection | **YES — read-only, lowest risk of all.** Native events + block_recurrences already carry {reason, kind, recurrences, limit}; the readonly sidecar already exposes GET events + GET inspect. Formalizing it as an adapter read adds no mutation surface. | Meets all ten trivially (read-only). |
| explicit redispatch | **YES, ONLY as a bounded one-shot.** A redispatch mutation must be a thin, expected-state-guarded wrapper over unblock/promote for ONE exact task (equivalent to `unblock` then letting the dispatcher pick it up), NOT a generic dispatch-all, NOT a loop over tasks, and must NOT auto-decompose. | Meets all ten only as one-task/one-shot; a generic dispatch wrapper is rejected (bounded-operation + no-hidden-reconstruction requirements). |
| pending human-decision list | **YES — read-only.** List blocked/triage tasks with reason, kind, recurrences, and latest comment (native data); complements notification; no mutation. | Meets all ten trivially (read-only). |

Operations the evidence does NOT support considering: generic shell execution; arbitrary
database writes; hidden workflow reconstruction (auto-fanout, auto-re-promotion, silent
specify/decompose chains); session/run resume ("resume a blocked run") — NOT_SUPPORTED
natively, and the adapter must not fake it; dashboard-auth bypass.

Sequence priority if a bounded adapter were ever approved (evaluation only): recurrence
inspection (read) → pending human-decision list (read) → task comment → unblock (with
expected status) → archive → explicit redispatch (one-shot, expected status) → task edit
(expected state precondition). All mutations must reuse the existing sidecar auth +
ledger pattern and must require exact board + exact task + expected current status.

---

## 16. Limitations

1. Read-only tooling boundary: terminal commands referencing /home/ridasaidd/.hermes/*
   are blocked by approvals.deny; installed-tree inspection used file reads only; the
   board DBs were never opened directly; execute_code required interactive approval
   (headless run) [A:§0][B:§Limitations][C:§0].
2. Dashboard observations limited to unauthenticated probes (401/302); no dashboard write
   path was exercised (no credentials; packet constraint) [E:E04][E:§8].
3. E02-C's live body-edit test used the aux-LLM specify path (the only headless edit); the
   rewrite is not a deterministic byte-level edit (though the instruction survived verbatim
   and the worker's action matched exactly) [E:§8].
4. E05's OC unblock failure is environment-specific (PATH); a retry with the full binary
   path was deliberately not performed (one-dispatch bound) [E:§8].
5. Timing-sensitive observations (E03 triage→archive 1 s) rely on CLI poll latency; the
   auto-decompose tick was not observed firing on the canary board [E:§8][E:§5 #14].
6. Numeric event id 93 and event authorship (unblock/archive) are reconstruction/inference,
   disclosed and accepted by the verifier [D:§6][V:minor 2/3].
7. Main evidence is point-in-time (2026-08-01 fetch, commit unknown); equality claims
   cover the surveyed sections, not whole files [B:§Limitations][C:§6].
8. No live messaging test was performed (G0 approval required and not granted); all
   messaging conclusions are layers 1/2 (docs + source) + layer 3 unconfigured [A:§5][E:§5 #13].
9. The high-stakes causal chain (auto-decomposer re-promotion) is source- and
   event-author-attribution-backed but the gateway tick itself was not directly observed;
   the end-to-end containment classification is honestly held at MEDIUM [V:D5.1].
10. Synthesizer-session tooling note: this synthesizer run has no terminal/execution tool,
    so the deliverable's sha256 checksum and the base64 kanban_attach upload could not be
    computed in-session; the file is delivered via the task's durable artifact channel with
    its exact byte size recorded, and the sha256 must be computed by the orchestrator/
    verifier (see Evidence Index). This is a process limitation, not a finding about Hermes.

---

## 17. Evidence Index

Primary packet:
- /home/ridasaidd/forgepilot/research/hermes/experiments/HS-003-packet.md — sole spec;
  sha256 40ce36cc0633ca5d5946ed440ca9f7de6d96f69b4643a29f4832cb8186af3cc1, 14588 bytes
  (verified by verifier STEP 0 and Phases A–E; re-read in full by synthesis).

Phase reports (all attachments read in full by synthesis):
- Phase A — baseline: attachment Phase-A-report.md (19,732 B) on t_2f8e2c4b;
  also .md.gz (7,753 B). Packet sha256+size verified; version/profiles/toolsets/MCP
  surface/messaging/recurrence/dashboard/services/HS-002 identifiers [A].
- Phase B — documentation survey: attachment Phase-B-report.md (37,040 B) on t_d8f444e5;
  also .md.gz (13,499 B, sha256 round-trip verified 3315eefa…). 13-doc line inventory,
  D1/D2, Difference A, Q1–Q6 [B].
- Phase C — installed-source comparison: attachment Phase-C-report.md (33,947 B) on
  t_1d12bfe1 (+ .gz 13,605 B). Code paths at file:function:line for all 11 required
  behaviors; version drift table; main-only features [C].
- Phase D — live read-only inspection: attachment Phase-D-report.md (22,875 B) on
  t_589970fc. All 10 items verified; 10/10 HS-002 observations confirmed; discrepancies
  D-PKT-1/D-002-1/Q-1/Q-2/Q-3 [D].
- Phase E — minimal live experiments: attachment Phase-E-report.md (27,366 B; sha256
  6d2db40c7f6c1494a0a5fcae497d8139399eabcaf6dfb75134b36c855473dd19) on t_4151046e.
  E01–E05 verbatim event streams; containment accounting; teardown [E].
- Verification — attachment Verification-report.md (33,228 B; sha256
  1a5331a000c12e1685e18333bf8da7da0e163d0e53b2b49a51ca57deafe245d1) on t_f19164b0.
  Duties 1–7, verdict PASS, 19 capability rows all SUPPORTED, zero material errors [V].

Primary live/board data (read-only):
- HS-002 board hs-002-canary-001 (per-board DB
  /home/ridasaidd/.hermes/kanban/boards/hs-002-canary-001/kanban.db; read via CLI only):
  t_b45b698c 74 events / 20 comments / 10 runs; board-wide 93 events [D:§3][V:D3].
- HS-002 final report:
  /home/ridasaidd/forgepilot/research/hermes/experiments/HS-002-CANARY-001-final-report.md
  (cross-reference; not altered).
- Observations:
  /home/ridasaidd/forgepilot/research/hermes/observations/2026-08-01-human-approval-routing-and-task-resumption.md.
- Audits: /home/ridasaidd/forgepilot/audits/hermes-transition/ (7 files; inventory only).
- Phase E canary board (disposable, archived at teardown, recoverable):
  /home/ridasaidd/.hermes/kanban/boards/_archived/hs-003-canary-e01-1785618115/
  (kanban.db + board.json + worker logs for t_f818d8fa / t_ee86f526 / t_8bc2b2b3 /
  t_cb77bfcb / t_96ab3c0e) [E:§7][V:D4.1].
- Installed source (read-only): /home/ridasaidd/.hermes/hermes-agent (v0.19.1, 126ff707).
- Docs (read-only): installed website/docs under that tree; official main fetched to
  /tmp/hs003-main/ by Phases B/C and re-fetched by the verifier on 2026-08-01.
- Adapter source (read-only): /home/ridasaidd/forgepilot-chatgpt-mcp (9cfb36f4):
  src/tool-groups/hermes-tools.ts, integrations/hermes-kanban-readonly/server.py,
  integrations/hermes-kanban-mutation/server.py.

Deliverable artifact integrity:
- File: $HERMES_KANBAN_WORKSPACE/HS-003-deliverable.md
  (/home/ridasaidd/.hermes/kanban/boards/hs-003/workspaces/t_cdfcdf15/HS-003-deliverable.md).
- Byte size: recorded in the task completion metadata (exact wc -c equivalent via file
  read). sha256: NOT computable in the synthesizer session (no terminal/execution tool);
  the orchestrator/verifier should compute `sha256sum` on the artifact for the durable
  record. No fabrication intended or performed.

---

## 18. Success Criteria — Explicit Answers (Packet Section 15)

1. **Which human-interaction and lifecycle controls does Hermes already provide?**
   Comment; title/body edit (dashboard REST + specify); assign/reassign; unblock; dispatch;
   archive; triage (as status); recurrence inspection; dependency link/unlink; status
   changes; /kanban slash surface; gateway notifier (terminal-event notification);
   /approve + /deny + plain-text approval routing; chat-session resume (separate from
   kanban runs). All NATIVE_AND_WORKING at layers 1/2 (HIGH) [B:Q1][C:§4].
2. **Which controls are present in 0.19.1?** All of the above. NOT present in 0.19.1:
   live operator-note injection into a running worker (main-only), dashboard
   estimate/projects routes (main-only), multi-profile notification-delivery docs
   (main-only). BLOCK_RECURRENCE_LIMIT=2 identical in both trees [C:§3].
3. **Which controls are configured locally?** Kanban tools via dispatcher gating
   (HERMES_KANBAN_TASK), embedded gateway dispatcher (60 s), auto_decompose default true,
   dashboard running, approvals deny rules active. NOT configured: any messaging platform —
   remote notification and remote human answer are layer-3 NATIVE_BUT_UNCONFIGURED
   [A:§3/§5/§8].
4. **Which controls are available only through dashboard or CLI?** Title/body edit is
   dashboard PATCH (or headless `specify`) — the documented CLI `edit --title/--body` does
   not exist (D1). Dashboard unblock/comment/edit require a session cookie and are not
   headlessly scriptable; CLI unblock/comment/archive work headlessly. Push-to-triage has
   no CLI verb (loop breaker / dashboard / create --triage only). Everything else is
   available via CLI, dashboard, and (where applicable) agent tool [E:E02/E04][B:Q1].
5. **Which controls are missing from the ForgePilot adapter?** comment, edit, unblock,
   archive, quarantine/triage, reassign, dependency mutation, dispatch/redispatch,
   recurrence write, human-answer injection, worker-session resume — all
   NATIVE_BUT_NOT_EXPOSED_BY_FORGEPILOT; the adapter exposes board-create + task-create
   only (plus read-only GETs) [A:§4][D:§4 obs 10][V:D7].
6. **Why did HS-002 exceed the documented recurrence behavior?** The gateway
   auto-decomposer (default on, per_tick 3, runs BEFORE dispatch each tick) re-ingested
   the triage-routed task and re-promoted it (specify fallback rewrites title/body,
   triage→todo→ready→dispatch); specify/unblock never reset block_recurrences, so the
   counter climbed 2..10 past the limit while dispatch continued through run 13. Evidence:
   8 "auto-decomposer"-authored specified events each followed by promoted→claimed→spawned
   [D:§3.6–3.7], plus the source ordering (kw:1435–1438). MEDIUM confidence (tick not
   directly observed in a gateway log; attribution via author field + source) [V:D5.1].
7. **Must the dashboard remain open for human governance?** NO. The dashboard is one of
   several native surfaces; CLI comment/unblock/archive and (once a messaging platform is
   configured) /kanban + /approve + /deny cover the human-decision loop headlessly
   (live: E01/E03/E05 used CLI unblock/comment; HS-002's human path used the dashboard —
   both work). The dashboard's REST API is session-cookie-gated, so headless automation
   should use CLI//kanban, not dashboard scraping [B:Q4][E:E04].
8. **Can messaging provide a safe asynchronous control channel?** YES by design —
   notifier with terminal-event delivery, /kanban (same CLI verb surface, bypasses the
   running-agent guard, auto-subscribe on create), /approve + /deny + plain-text
   yes/no, home-channel delivery, steer/queue/interrupt modes — all native (layers 1/2,
   HIGH). NOT yet demonstrated locally: no platform is configured and live tests require
   G0 approval (not granted). Conclusion: the channel is safe by construction (bounded
   verbs, audit events, admin/user tiers); configuration + a G0-approved live test is the
   remaining step [B:Q4][A:§5].
9. **What is the smallest justified next implementation?** A bounded ForgePilot adapter
   surface, evaluated (not approved) in Section 15: start with read-only recurrence
   inspection + pending human-decision list (already partially exposed via the readonly
   sidecar), then task comment, unblock (expected status), archive, one-shot redispatch,
   and task edit with an expected-state precondition — all reusing the existing sidecar
   auth/ledger pattern and satisfying the Section 11 constraints. No Hermes-side changes
   are required for any of these; the native code paths exist [§15][C:§2].
10. **What should NOT be built because Hermes already provides it?** Same-run resume
    (native rerun + comments + edit-before-unblock cover the workflow); a distinct
    quarantine status (triage covers); a headless dashboard auth bypass (CLI//kanban
    cover headless governance); a generic dispatch/shell/DB-write adapter tool (bounded
    ops only); a messaging platform (configure the native one instead); any Hermes patch
    to change BLOCK_RECURRENCE_LIMIT behavior while `kanban.auto_decompose` can already
    be configured to park triage tasks [§14 R4/R6/R7/R9][packet §14].
