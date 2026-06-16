---

## FP-009 Post-Fix Audit: Qwen Implementation by DeepSeek-V4-Pro-High

### Result: **ACCEPTED**

---

### Findings

#### RF-1 Fix Verified — `getEvidenceEligibility` now correctly handles re-admission (`src/db/evidence.ts:295-332`)

| Check | Status | Detail |
|---|---|---|
| A1 → I1 → A2 scenario | PASS | A1 defeated, A2 grants eligibility via `admission_event.id == a2.id` |
| Iterates all effective admissions | PASS | `filter` replaces `find`; for-loop checks each admission independently |
| Returns via first undefeated admission | PASS | Early return on line 325 with correct `admission_event` |
| Returns ineligible only when all defeated | PASS | Falls through to line 331 after full iteration |
| `admission_event` references correct admission | PASS | Returns A2, not A1, when A2 is the undefeated admission |
| `defeating_invalidation` reflects last defeat | PASS | Tracks `lastDefeatingInvalidation` through loop |
| No observation mutation | PASS | `getEvidenceEligibility` is read-only; no INSERT/UPDATE on observation tables |
| No `is_evidence`/`evidence_status` added | PASS | Unchanged from original audit |
| No scope violations | PASS | Only `evidence.ts` and `fp009.test.ts` modified; no routing/scoring/etc. |

#### Regression Test (`tests/fp009.test.ts:619-659`)

The test covers the exact audit scenario:
1. A1 created → eligibility true
2. I1 defeats A1 → eligibility false
3. A2 re-admits same observation → eligibility true
4. Asserts `admission_event.id === a2.id` (not a1.id)
5. Asserts `defeating_invalidation === null`

#### Verification Artifacts

| Artifact | Status |
|---|---|
| `pnpm typecheck` | PASS, 0 errors |
| `pnpm test` | PASS, **143/143** (was 142, +1 regression) |
| `pnpm fp -- init-db` first run | PASS |
| `pnpm fp -- init-db` second run | PASS (idempotent) |
| `runs/FP-009/verification.txt` | Updated, reflects 143 tests |
| `runs/FP-009/metrics.json` | Updated, includes `audit_fix` metadata |
| `runs/FP-009/executor-result.md` | Updated, documents audit fix |

---

### Remaining Required Fixes

**None.** The CRITICAL finding (RF-1) is resolved.

---

### Scope Violations

**None.** Only two implementation files modified: `src/db/evidence.ts` (eligibility logic fix) and `tests/fp009.test.ts` (regression test). All other changed files are audit/run documentation artifacts.

---

### Evidence Integrity Concerns

**None.** The fix preserves all invariants:
- Append-only admission/review/invalidation events unchanged
- Invalidation still requires recorded review request
- Invalidation still targets admission event, not observation
- Observations still unmutated
- No mutable evidence fields on observation tables
- Eligibility still derived purely from the event chain

The unaddressed MINOR recommendation (`PRAGMA foreign_keys = ON` in `initDb()`) remains a low-risk latent gap but does not block acceptance. Application-level validation in `recordReviewRequest` and `recordInvalidationEvent` continues to enforce referential integrity.
