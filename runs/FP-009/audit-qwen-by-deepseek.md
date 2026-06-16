---

## FP-009 Audit: Qwen Implementation by DeepSeek-V4-Pro-High

### Result: **REJECTED**

---

### Findings

#### CRITICAL — `getEvidenceEligibility` fails the re-admission scenario (`src/db/evidence.ts:295-326`)

The function uses `admissions.find(...)` to pick the **first chronologically valid admission** (line 301), then checks only that admission's invalidations (line 312). If admission A1 is later defeated by invalidation I1, the function returns `eligible: false` and stops. It never examines admission A2, which re-admits the same observation and has no defeating invalidation.

**Trace of the audit scenario:**

| Step | Event | Expected | Actual |
|------|-------|----------|--------|
| 1 | A1 admits observation O | Eligible ✓ | Eligible ✓ |
| 2 | I1 defeats A1 | Ineligible | Ineligible |
| 3 | A2 re-admits O | **Eligible** (via A2) | **Ineligible** (A1 found first, I1 defeats it) |

The function's early-exit pattern (`find` then return) violates the packet's requirement:

> *A stored observation is currently eligible as evidence only when a valid admission event exists for the observation [...] and no later valid invalidation event defeats **that** admission.*

The phrase "that admission" is per-admission. A2 is a distinct admission event. A1's defeat does not defeat A2.

**Required fix:** Iterate **all** valid admissions and return eligible if **any** has no defeating invalidation. Update `admission_event` to reference the admission that actually grants eligibility, not the first valid one.

---

#### MINOR — Foreign key constraints not enforced at SQL level (`src/db/client.ts:13-15`)

`initDb()` does not issue `PRAGMA foreign_keys = ON`. The SQL schema declares foreign keys (`REFERENCES evidence_admission_events(id)`, etc.), but SQLite ignores them without the pragma. Application-level validation in `evidence.ts` compensates (lines 165-169, 204-222), but direct SQL access could bypass referential integrity.

**Risk:** Low. Application code validates before insert. Mitigation is adequate for V1 but represents a latent integrity gap.

**Recommended:** Add `db.pragma("foreign_keys = ON");` in `initDb()`.

---

### Items PASSED

| Requirement | Status | Evidence |
|---|---|---|
| Append-only admission events | PASS | `evidence.ts` — INSERT only, no UPDATE/DELETE |
| Append-only review requests | PASS | `evidence.ts` — INSERT only |
| Append-only invalidation events | PASS | `evidence.ts` — INSERT only |
| Invalidation requires recorded review | PASS | `evidence.ts:211-222` — validates review exists + targets same admission; SQL `REFERENCES` constraint |
| Invalidation targets admission event, not observation | PASS | Schema: `target_admission_event_id` → `evidence_admission_events(id)` |
| Observations not mutated on admission | PASS | Tests 6a/6b: `deepEqual` before/after confirms no change |
| Observations not mutated on invalidation | PASS | Tests 7a/7b: `deepEqual` before/after confirms no change |
| No `is_evidence`/`evidence_status` on observation tables | PASS | Tests 8a/8b: `PRAGMA table_info` confirms absence; migration adds no ALTER TABLE |
| Admission not automatic | PASS | `recordAdmissionEvent` must be called explicitly |
| Tests passing ≠ admission | PASS | Test 5: `getEvidenceEligibility` returns false with no admission |
| Audit accepted ≠ admission | PASS | No automatic admission on audit result |
| No routing/scoring/aggregation/dashboards | PASS | Grep of `evidence.ts` returns zero matches; no modified source files |
| TypeScript validation aligned with SQL constraints | PASS | Same enum values in both layers |
| Controlled vocabulary enforcement | PASS | Tests cover invalid types, decisions, actor types, trigger types |
| FP-008 observation tables preserved | PASS | Test "FP-008 preservation" confirms `admission_state` stays `'PENDING'` |
| Migration idempotency | PASS | Test: running migrate twice does not fail |
| All 142 tests pass | PASS | `verification.txt` confirms |
| `pnpm typecheck` passes | PASS | `verification.txt` confirms |

---

### Scope Violations

**None detected.** Only 3 new files were added (`evidence.ts`, `fp009.test.ts`, `005_fp009_evidence_admission.sql`). No existing source files were modified. No routing, scoring, aggregation, dashboard, report, or model-selection logic was introduced.

---

### Evidence Integrity Concerns

1. **Re-admission eligibility gap (CRITICAL):** As described above. An observation incorrectly loses evidence eligibility after re-admission.

2. **SQLite foreign keys dormant (MINOR):** Without `PRAGMA foreign_keys = ON`, the structural guarantees in the schema are not enforced at the storage layer. Application-level checks are present but are a single point of enforcement.

---

### Required Fixes

1. **Fix `getEvidenceEligibility`** in `src/db/evidence.ts:295-326` — replace the single-pass `admissions.find()` / early-return pattern with iteration over all valid admissions. For each valid admission, check for defeating invalidations. Return eligible + the first undefeated admission. Return ineligible only if **every** valid admission is defeated.

2. **Add test for re-admission after invalidation** — cover the specific audit scenario: A1 admits, I1 defeats A1, A2 re-admits the same observation, then verify `getEvidenceEligibility` returns `eligible: true` via A2.

3. **Recommended:** Add `PRAGMA foreign_keys = ON` to `initDb()` in `src/db/client.ts`.
