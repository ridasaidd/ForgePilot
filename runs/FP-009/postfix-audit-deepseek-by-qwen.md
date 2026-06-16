---

# FP-009 Post-Fix Audit Report

**Auditor**: Qwen-3.7-Max
**Executor**: DeepSeek-V4-Pro-High
**Fix commit**: `d00645d`

---

## Post-Fix Audit Result: **ACCEPTED**

---

## RF-1 Fix Verification

### Fix correctness

The diff at `src/db/evidence.ts:387-428` correctly resolves the bug:

- **Before**: Early `return { eligible: false }` on first defeated admission — never evaluated later admissions.
- **After**: Tracks `defeated` flag per admission, `continue`s to next admission when defeated. Returns `eligible: true` on the first undefeated effective admission. Falls through to `eligible: false` only when all effective admissions are defeated.

The fix also improves the terminal ineligible return by providing `lastEffectiveAdmission` and `lastDefeatingInvalidation` instead of `null, null` — better diagnostic information for consumers.

### Regression test

`tests/fp009.test.ts:833-914` covers the exact A1 → I1 → A2 scenario:

| Step | Action | Assertion |
|------|--------|-----------|
| 1 | Admission A1 created | `eligible === true`, admission is A1 |
| 2 | Review + invalidation I1 defeats A1 | `eligible === false`, defeating invalidation present |
| 3 | Admission A2 created (re-admission) | — |
| 4 | `deriveEvidenceEligibility` called | `eligible === true`, admission is A2 (not A1), no defeating invalidation |

All four assertions verified. Test passes.

### Scope of fix commit

Only 6 files changed (`4f2a8bf..d00645d`):

- `src/db/evidence.ts` — the fix (31 lines changed)
- `tests/fp009.test.ts` — regression test (83 lines added)
- `runs/FP-009/*` — verification artifacts and audit report

No migration changes. No observation table changes. No routing, scoring, dashboard, aggregation, report, or model-selection behavior added.

### Verification

| Check | Result |
|-------|--------|
| `pnpm typecheck` | PASS (0 errors) |
| `pnpm test` | PASS (158/158) |
| `pnpm fp -- init-db` (1st) | PASS |
| `pnpm fp -- init-db` (2nd) | PASS (idempotent) |

---

## Remaining Required Fixes

**None.**

## Scope Violations

**None.**

## Evidence Integrity Concerns

**None beyond the pre-existing project-wide `PRAGMA foreign_keys` condition** (not introduced by FP-009, not in scope for this fix).
