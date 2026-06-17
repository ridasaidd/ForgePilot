# FP-012 Audit: Qwen Execution

**Auditor:** DeepSeek  
**Executed by:** Qwen-3.7-Max  
**Execution commit:** `4f1d955`  
**Audit date:** 2026-06-17

---

## Verdict

**ACCEPTED_WITH_NOTES**

---

## Verification Summary

| Check | Result |
|-------|--------|
| `pnpm typecheck` | PASS (0 errors) |
| `pnpm test` | PASS (375/375) |
| FP-012 tests | 107/107 pass |
| Prior tests (FP-004/005/008/009/010/011) | All pass |

---

## Acceptance Criteria Compliance

| AC | Criterion | Verdict |
|----|-----------|---------|
| AC1 | Classification records persisted | PASS |
| AC2 | Comparison records persisted | PASS |
| AC3 | Classification append-only | PASS |
| AC4 | Comparison append-only | PASS |
| AC5 | Classification axes + vocabularies | PASS |
| AC6 | Comparison outcome + basis vocabularies | PASS |
| AC7 | Comparison references model/evidence/execution IDs | PASS |
| AC8 | Comparison preserves admission state at comparison time | PASS |
| AC9 | Comparison does not mutate evidence records | PASS |
| AC10 | Comparison does not mutate packet intent | PASS |
| AC11 | Comparison does not mutate validation/admission events | PASS |
| AC12 | Invalid classification vocabulary rejected | PASS |
| AC13 | Invalid comparison vocabulary rejected | PASS |
| AC14 | Classification history queryable by packet | PASS |
| AC15 | Comparison history queryable by packet | PASS |
| AC16 | Latest derived without deleting history | PASS (see Note 1) |
| AC17 | Prior behavior (FP-004/005/008/009/010/011) preserved | PASS |
| AC18 | Existing tests continue to pass | PASS |
| AC19 | No routing/ranking/recommendation/dashboard/report/cost/benchmark | PASS |

---

## Scope Audit

### Allowed additions present:
- `src/db/task-classification.ts` — classification events, corrections, queries
- `src/db/model-comparison.ts` — comparison events, corrections, queries, JSON helpers
- `migrations/008_fp012_task_classification_comparison.sql` — base FP-012 tables
- `migrations/009_fp012_correction.sql` — model_identity, explicit FK columns, correction tables
- `tests/fp012.test.ts` — 107 tests
- FP-012 tables added to `src/db/schema.sql` (append-only, no existing lines modified)

### Forbidden behaviors absent:
- No model routing
- No automatic model selection
- No model ranking or leaderboards
- No dashboards or reports
- No cost optimization
- No provider recommendation
- No local model benchmarking
- No workflow orchestration changes
- No packet execution policy changes
- FP-008/009/010/011 tables not replaced or mutated
- No forbidden columns (`rank`, `score`, `routing_decision`, `recommendation`, `leaderboard_position`, `cost_estimate`, `benchmark_score`)

---

## Inspection: Correction Tables and `getLatest` Functions

### Concern evaluated

Qwen uses separate correction tables:
- `fp012_task_classification_corrections` (references `fp012_task_classification_events.id`)
- `fp012_model_comparison_corrections` (references `fp012_model_comparison_events.id`)

The question: Do `getLatestTaskClassification()` and `getLatestModelComparison()` account for correction rows, or only latest original event rows?

### Finding

Both functions query only the event tables:

```sql
-- getLatestTaskClassification (task-classification.ts:199-212)
SELECT * FROM fp012_task_classification_events
WHERE packet_id = ? ORDER BY created_at DESC, id DESC LIMIT 1

-- getLatestModelComparison (model-comparison.ts:302-315)
SELECT * FROM fp012_model_comparison_events
WHERE packet_id = ? ORDER BY created_at DESC, id DESC LIMIT 1
```

Neither function joins or merges data from the correction tables. When a user calls `recordTaskClassificationCorrection()` or `recordModelComparisonCorrection()`, the correction is stored as a separate row but `getLatest*` returns the original event row unchanged.

The test at `tests/fp012.test.ts:2676` confirms this behavior:
```
should get latest comparison while preserving correction history
  - adds 2 corrections to a comparison
  - getLatestModelComparison returns the same original comparison (same id)
  - corrections exist separately (2 rows in correction table)
```

### Assessment

This does **not** violate AC16. AC16 requires: *"The latest classification or comparison can be derived without deleting history."* The `getLatest*` functions derive the latest event without deleting history — they satisfy the literal requirement.

However, this is a **design gap** (Note 1):
- The FP-012 packet lists *"derived read functions that compute current classification or comparison summary"* as an allowed approach for append-only correction.
- No such summary/compute function exists. Callers who want the *effective corrected* classification must manually read corrections via `getTaskClassificationCorrections()` / `getModelComparisonCorrections()` and apply `corrected_fields` + `new_values` to the original event.
- The `getLatest*` function names imply they return the current effective state, but after corrections they return only the latest event row.
- A `getEffectiveTaskClassification()` / `getEffectiveModelComparison()` function that merges corrections into a computed summary would close this gap.

---

## Migration / Schema Consistency

| Artifact | Status |
|----------|--------|
| `src/db/schema.sql` | Contains all FP-012 tables (events + corrections) with `model_identity` and explicit FK columns |
| `migrations/008_*.sql` | Creates base event tables (without model_identity, explicit columns, corrections) |
| `migrations/009_*.sql` | Adds model_identity, explicit FK columns, correction tables via ALTER + CREATE |
| Migration ordering | Alphabetical sort ensures 008 runs before 009 |
| Migration idempotence | Tested: re-running migrate does not fail |
| Schema.sql vs migrations | schema.sql reflects final state after both migrations — consistent |

No inconsistency found. The base migration (008) creates a subset schema; the correction migration (009) extends it. This is normal sequential migration design.

---

## Evidence Rules Verification

1. **Comparison explicitly records admission state at comparison time** — `evidence_admission_states` column is a JSON array validated against `ADMITTED | PENDING | REJECTED | QUARANTINED | NOT_EVALUATED`. Tested with all 5 states (`tests/fp012.test.ts:1121-1140`).

2. **Comparison does not silently promote non-admitted evidence** — The `evidence_admission_states` field is explicit and caller-controlled. No code automatically promotes or changes admission state.

3. **Comparison does not mutate evidence records** — Verified by snapshot comparison before/after `recordModelComparison()` at `tests/fp012.test.ts:1182-1221`.

---

## Implementation Quality Notes

1. **Strong validation**: Both TypeScript-level (`validateEnum`) and SQLite CHECK constraints enforce vocabularies at two layers. Invalid values are rejected at both the application and database levels.

2. **Cross-packet reference rejection**: Both classification and comparison functions verify that referenced records belong to the same packet. Correction functions also enforce this.

3. **JSON parse helpers**: `parseEvidenceAdmissionStates()`, `parseKnownDefects()`, etc. safely handle both populated and empty JSON arrays with try/catch fallbacks.

4. **Non-mutation guarantees**: 6 dedicated tests verify that comparisons do not mutate evidence records, packet intent, FP-008 classifications, FP-008 outcomes, FP-009 admission events, or FP-011 validation events.

5. **No existing files modified** (except `schema.sql` which is append-only): `git diff 8cd21e3..4f1d955 -- src/db/` confirms only schema.sql changed, and only additions were made.

---

## Notes

1. **Note 1 (AC16 design gap)**: `getLatestTaskClassification()` and `getLatestModelComparison()` return the latest event row but do not merge correction data. After corrections are recorded, these functions still return the original uncorrected event. Consumers who need the effective corrected state must manually compose corrections. Adding `getEffectiveTaskClassification()` / `getEffectiveModelComparison()` functions would close this gap and fulfill the packet's "derived read functions that compute current summary" allowance more completely.

