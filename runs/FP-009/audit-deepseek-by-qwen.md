---

# FP-009 Audit Report

**Auditor**: Qwen-3.7-Max
**Executor**: DeepSeek-V4-Pro-High
**Branch**: `eval/fp-009/deepseek-v4-pro-high`

---

## Audit Result: **ACCEPTED** (with 1 required fix)

---

## Findings

### 1. Does the implementation satisfy all FP-009 required behaviors?

**YES.** All 12 required test behaviors are implemented and verified:

| # | Required Behavior | Status |
|---|---|---|
| 1 | Admission events persisted | PASS |
| 2 | Review requests persisted | PASS |
| 3 | Invalidation events persisted | PASS |
| 4 | Invalidation requires review request | PASS |
| 5 | Eligibility derived from event chain | PASS |
| 6 | Observations not mutated on admission | PASS |
| 7 | Observations not mutated on invalidation | PASS |
| 8 | No mutable evidence-state fields on obs tables | PASS |
| 9 | Valid admission → eligible | PASS |
| 10 | Valid invalidation → ineligible | PASS |
| 11 | NO_ACTION does not defeat admission | PASS |
| 12 | Invalid/incomplete admission → not eligible | PASS |

All 9 acceptance criteria met. 157/157 tests pass. Typecheck clean.

### 2. Are SQLite constraints aligned with TypeScript validation?

**YES.** All CHECK constraints in the migration match the TypeScript `VALID_*` arrays exactly: observation types, admission decisions, actor types, trust tiers, validation states, review trigger types, and invalidation decisions. Defense-in-depth is correctly applied — TypeScript validates before SQL, and SQL CHECK constraints provide a second layer.

### 3. Does deriveEvidenceEligibility correctly handle multiple admissions and invalidations over time?

**NO — bug found.** See Required Fix #1 below.

### 4. Does invalidation require a review request for the same admission event?

**YES.** `recordAdmissionInvalidation()` at `src/db/evidence.ts:313-330` verifies:
- The review request exists
- The review request's `target_admission_event_id` matches the invalidation's `target_admission_event_id`

Both conditions throw on failure. Test at `tests/fp009.test.ts:551-587` confirms mismatch rejection.

### 5. Are source observations preserved without mutation?

**YES.** The evidence module contains only INSERT statements into the three new tables. No UPDATE or DELETE on any observation table. Tests at `tests/fp009.test.ts:834-923` verify field-by-field immutability before/after admission and invalidation for both classification and outcome observations.

### 6. Are there any hidden scope violations?

**NONE.** No routing, scoring, aggregation, dashboards, reports, or model selection behavior was added. Routing files (`src/routing/index.ts`, `src/types/routing.ts`) are single-line comment placeholders. The `routing_eligibility` and `routing_signal_eligibility` fields on observation tables are FP-008 artifacts, not introduced by FP-009.

### 7. Are there any evidence-integrity risks?

Two observations:

1. **Foreign keys not enforced at DB level** — `client.ts:14` enables WAL mode but does not set `PRAGMA foreign_keys = ON`. The `REFERENCES` constraints in the migration are advisory only. Application-level existence checks compensate, but a raw SQL bypass could insert orphan references. This is a **pre-existing condition** (not introduced by FP-009) and affects all migrations equally.

2. **No DB-level append-only triggers** — The three new tables have no BEFORE UPDATE/DELETE triggers to prevent mutation at the SQLite level. Append-only is enforced purely at the application layer. Consistent with how all other tables in the project work.

Neither is rejection-worthy given project conventions.

---

## Required Fix

### RF-1: `deriveEvidenceEligibility` returns prematurely on defeated admission

**File**: `src/db/evidence.ts:400-406`

**Bug**: When the first effective admission is defeated by an invalidation, the function immediately returns `{ eligible: false }` without checking whether a later, undefeated re-admission exists for the same observation.

**Scenario**:
1. Admission A1 → ADMITTED, VALID, provenance_complete (effective)
2. Invalidation I1 → defeats A1
3. Admission A2 → ADMITTED, VALID, provenance_complete (effective, re-admitted)

**Expected**: `eligible: true` (A2 is effective and undefeated)
**Actual**: `eligible: false` (returns on A1's defeat, never evaluates A2)

**Fix**: Change the early return on defeat to `continue` past the defeated admission:

```typescript
// Current (buggy):
for (const invalidation of invalidations) {
  if (isInvalidationDefeating(invalidation)) {
    return { eligible: false, admission_event: admission, defeating_invalidation: invalidation };
  }
}
return { eligible: true, admission_event: admission, defeating_invalidation: null };

// Fixed:
let defeated = false;
for (const invalidation of invalidations) {
  if (isInvalidationDefeating(invalidation)) {
    defeated = true;
    break;
  }
}
if (!defeated) {
  return { eligible: true, admission_event: admission, defeating_invalidation: null };
}
```

A test covering the re-admission-after-invalidation scenario should be added.

---

## Scope Violations

**None.**

## Evidence Integrity Concerns

- Pre-existing: `PRAGMA foreign_keys` not enabled (project-wide, not FP-009-specific)
- The re-admission bug (RF-1) could cause false-negative eligibility results in production if observations are re-admitted after invalidation
