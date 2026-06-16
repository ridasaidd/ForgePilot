# Audit Prompt — FP-004

**Task:** FP-004 — SQLite Metrics Persistence Implementation

---

## Instructions

You are an auditor. Your sole responsibility is to verify that the executor's
output satisfies the original packet as written.

### Rules

1. **Audit against the original packet only.** Do not evaluate work that was not
   requested. Do not audit against imagined requirements.

2. **Do not reward extra work.** Work beyond the packet scope is not relevant to
   the audit. Extra work does not compensate for missed requirements.

3. **Do not suggest architecture expansion.** Do not propose new features,
   refactors, or design changes beyond what the packet specifies.

4. **Do not accept partial completion unless explicitly allowed.** If the packet
   does not state that partial completion is acceptable, all deliverables must
   be satisfied. Partial completion is a FAIL.

5. **Return the structured output below.** Do not add commentary, summaries, or
   explanations outside the required fields.

---

## Original Packet

FP-004 — SQLite Metrics Persistence Implementation

Task

Implement the first SQLite-backed persistence model for ForgePilot metrics and packet execution evidence.

Goal

Create a durable SQLite persistence foundation that records packet intent, lifecycle observations, and execution attempts without collapsing them into a single mutable status field.

FP-004 answers one implementation question:

How does ForgePilot physically store packet execution evidence while preserving trust, authority, and history?

This packet implements storage only.

It does not add model routing, OpenCode telemetry ingestion, autonomous execution, broker behavior, aggregation, reporting, scoring, or routing decisions.

Governing Principles

This packet is constrained by:

* P01 — ForgePilot records observations, not narratives.
* P02 — Trust cannot be retroactively created.
* P03 — ForgePilot does not optimize for favorable outcomes.
* P04 — Only admitted evidence may influence observatory outputs.
* P05 — Do not build infrastructure for evidence that does not yet exist.
* P06 — Classification follows observation.

Prior Standards

Implementation must follow:

* docs/metrics-trust-and-validation.md
* docs/telemetry-authority-and-field-ownership.md
* docs/persistence-standards.md
* docs/model-evaluation-harness.md

FP-004 must not redefine those standards. It implements the minimum SQLite foundation required to preserve them.

Core Persistence Doctrine

Gates never mutate packet intent.

Gates only append observations.

Execution records are attempts, not outcomes.

The final state of a packet must be derived from recorded observations, not manually asserted as the source of truth.

Required SQLite Model

Implement a V1 persistence model with these logical entities:

packets
  immutable packet intent
packet_lifecycle_events
  append-only state observations
packet_executions
  append-only compute attempts
packet_current_state
  derived current state, not source of truth

Required Tables

packets

Stores immutable packet intent.

Required fields:

* packet_id
* title
* packet_path
* packet_hash
* created_at

Rules:

* packet_id must be unique.
* Packet intent must not be mutated by lifecycle gates.
* If packet content changes, the packet hash must allow the change to be detected.
* Runtime state must not be stored in packets.

packet_lifecycle_events

Stores append-only observations about a packet lifecycle.

Required fields:

* event_id
* packet_id
* event_type
* lifecycle_state
* source
* actor
* reason
* artifact_path
* execution_id
* created_at

Rules:

* Events must be append-only.
* Events must never rewrite packet intent.
* Events may reference an execution attempt through execution_id.
* Previous lifecycle states must remain reconstructable from the event stream.
* The current lifecycle state must be derived from the latest valid lifecycle event.

Required lifecycle states:

* CREATED
* VALIDATED
* ADMITTED
* REJECTED
* QUARANTINED
* SUPERSEDED
* ARCHIVED

Required execution-related lifecycle event types:

* EXECUTION_STARTED
* EXECUTION_COMPLETED
* EXECUTION_FAILED

Execution completion must map to:

EXECUTION_COMPLETED -> SUCCEEDED

Do not use COMPLETED as an execution state.

packet_executions

Stores append-only compute attempts.

Required fields:

* execution_id
* packet_id
* attempt_number
* trace_id
* requested_model
* executed_model
* provider
* execution_state
* started_at
* completed_at
* error_code
* error_message
* executor_result_path
* verification_path
* audit_prompt_path
* created_at

Rules:

* A packet may have more than one execution attempt.
* packet_id alone must not identify a compute attempt.
* execution_id must identify one concrete execution attempt.
* attempt_number must support retries.
* Execution rows are append-only evidence of attempts.
* Execution success does not automatically imply audit acceptance.
* Execution failure does not invalidate packet intent.

Required execution states:

* RUNNING
* SUCCEEDED
* FAILED

Error rules:

* error_code must be stable and queryable.
* error_code must not store raw exception strings.
* error_message may store a sanitized human-readable message.
* Raw provider exceptions must not be persisted directly as query keys.

Examples of valid error_code values:

* PROVIDER_TIMEOUT
* PROVIDER_RATE_LIMIT
* PROVIDER_AUTH_FAILED
* EXECUTOR_FAILED
* VERIFICATION_FAILED
* UNKNOWN_ERROR

packet_current_state

Expose the current packet state as a derived view or derived query result.

Rules:

* packet_current_state must not be the source of truth.
* It must be reconstructable from packet_lifecycle_events.
* If implemented as a table, it must be treated as a cache only.
* If implemented as a view, the view must derive from lifecycle events.
* Historical lifecycle events must remain queryable.

Preferred implementation:

packet_current_state as a SQLite view

Migration Requirements

Create or update SQLite migration tooling so the FP-004 persistence model can be initialized idempotently.

Requirements:

* Migration must be safe to run more than once.
* Existing database initialization behavior must remain working.
* Existing tests must continue to pass.
* New tables/views must be created if absent.
* No existing packet/evaluation behavior may be broken.

Code Requirements

Add or update code that supports:

1. Initializing the SQLite persistence schema.
2. Recording packet intent.
3. Appending lifecycle events.
4. Creating execution attempt records.
5. Marking execution attempts as succeeded or failed.
6. Reading current packet state from lifecycle events.
7. Testing idempotent initialization.
8. Testing append-only lifecycle behavior.
9. Testing multiple execution attempts for one packet.
10. Testing stable error_code and separate error_message.

Scope Boundaries

FP-004 must not implement:

* OpenCode telemetry ingestion.
* Token counting.
* Cost ingestion.
* Provider API calls.
* Model routing.
* Broker behavior.
* Autonomous execution.
* Scoring.
* Aggregation.
* Reporting dashboards.
* Routing decisions.
* Historical backfill of previous runs.

OpenCode telemetry ingestion will be handled by a later packet.

--- Full packet omitted for brevity; audit against original at packets/FP-004.md ---

---

## Executor Result

FP-004 SQLite Metrics Persistence implementation completed successfully using DeepSeek V4 Pro High as executor.

### Files Created/Modified

| File | Action | Description |
|------|--------|-------------|
| `migrations/002_fp004_persistence.sql` | Created | FP-004 persistence schema migration (includes ALTER TABLE for packets, CREATE TABLE for lifecycle events and executions, CREATE VIEW for current state) |
| `src/db/persistence.ts` | Created | Core persistence library with 9 functions covering all required operations |
| `tests/persistence.test.ts` | Created | 25 tests across 9 suites covering all acceptance criteria |
| `src/db/schema.sql` | Modified | Updated schema snapshot to include FP-004 tables and view |

### Schema Implemented

1. **packets** — Extended with `title`, `packet_path`, `packet_hash` columns. Existing columns preserved for backward compatibility.
2. **packet_lifecycle_events** — New append-only table with all required fields and indexes.
3. **packet_executions** — New append-only table with unique (packet_id, attempt_number) constraint, indexes on execution_state and error_code.
4. **packet_current_state** — SQLite VIEW deriving current state from latest lifecycle event using ROW_NUMBER() window function.

### Persistence Functions

| Function | Purpose |
|----------|---------|
| `recordPacketIntent()` | Records immutable packet intent |
| `appendLifecycleEvent()` | Appends a lifecycle observation |
| `createExecutionAttempt()` | Creates execution attempt with RUNNING state |
| `markExecutionSucceeded()` | Sets execution_state to SUCCEEDED |
| `markExecutionFailed()` | Sets execution_state to FAILED with error_code and error_message |
| `getCurrentPacketState()` | Reads derived current state from view |
| `getPacketLifecycleEvents()` | Reads full lifecycle event history |
| `getPacketExecutions()` | Reads all execution attempts |
| `getPacketById()` | Retrieves a packet record |

### Acceptance Criteria

All criteria met. 39 tests pass (14 existing + 25 new). Migration is idempotent. No scope violations.

---

## Verification Output

```
pnpm typecheck — PASS (no errors)
pnpm test — PASS (39 tests, 0 failures)
pnpm fp -- init-db (x3) — PASS (idempotent, succeeds on repeated runs)
```

Full verification details in runs/FP-004/verification.txt

---

## Git Status

```
 M src/db/schema.sql
?? migrations/002_fp004_persistence.sql
?? src/db/persistence.ts
?? tests/persistence.test.ts
```

---

## Relevant Diff

```
 src/db/schema.sql | 64 ++++++++++++++++++++++++++++++++++++++++++++++++++++---
 1 file changed, 61 insertions(+), 3 deletions(-)
```

Schema snapshot updated: added `title`, `packet_path`, `packet_hash` to packets table; added `packet_lifecycle_events` table; added `packet_executions` table; added `packet_current_state` view.

---

## Required Output

Return exactly:


AUDIT_STATUS: ACCEPTED | REJECTED | NEEDS_FRONTIER_REVIEW

BLOCKING_ISSUES:

NON_BLOCKING_NOTES:

ROOT_CAUSE_LEVEL:
ENVIRONMENT | PACKET | EXECUTOR | AUDITOR | HUMAN | NONE

ROOT_CAUSE_REASON:

REQUIRED_FIX_PACKET:
