# FP-009 Executor Result

## Status: Complete (post-audit fix applied)

## Audit Fix: RF-1 — Re-admission after invalidation

**File**: `src/db/evidence.ts:387-425`

**Bug**: `deriveEvidenceEligibility` returned `{ eligible: false }` immediately when the first effective admission was defeated by an invalidation, without checking whether a later valid re-admission existed.

**Fix**: Changed the early `return { eligible: false }` on defeat to track defeat state and `continue` to the next admission. Only returns ineligible when all effective admissions across the chain have been defeated.

**Regression test**: Added test at `tests/fp009.test.ts:832-908` covering:
1. Valid admission A1 → eligible
2. Valid invalidation I1 defeats A1 → ineligible
3. Later valid admission A2 → eligible via A2

## Summary
Implemented evidence admission persistence as specified by FP-009. Three append-only tables were added to the SQLite schema with corresponding TypeScript persistence functions. Evidence eligibility is derived from the event chain, never stored as mutable state on observation rows.

## Files Created/Modified

| File | Action |
|------|--------|
| `migrations/005_fp009_evidence_admission.sql` | Created - SQLite migration for FP-009 tables |
| `src/db/evidence.ts` | Created - TypeScript persistence module |
| `tests/fp009.test.ts` | Created - 45 test cases covering all 12 required tests |

## Tables Created

- `evidence_admission_events` - append-only admission decisions
- `admission_review_requests` - append-only review triggers
- `admission_invalidation_events` - append-only invalidation decisions

## Key Design Decisions

1. **Polymorphic observation references**: `target_observation_type` + `target_observation_id` pattern references classification and outcome observations without coupling admission tables to any single observation table.

2. **Existence validation**: Admission events validate that the target observation exists before persisting.

3. **Chain integrity**: Invalidation events must reference both a target admission event and a review request, and the review request must reference the same admission event.

4. **Provenance as integer**: SQLite stores `provenance_complete` as INTEGER (0/1) with CHECK constraint; TypeScript API accepts boolean.

5. **Chronological ordering**: Derived eligibility walks admission events chronologically and checks for later invalidations that defeat them.

## Derived Eligibility Algorithm

```
For each admission event (chronological):
  If admission_decision != ADMITTED → skip
  If validation_state != VALID → skip
  If provenance_complete != 1 → skip
  For each invalidation event on this admission (chronological):
    If validation_state == VALID AND provenance_complete == 1
    AND (invalidation_decision == INVALIDATED OR QUARANTINED):
      → INELIGIBLE (with defeating invalidation)
  → ELIGIBLE
→ INELIGIBLE (no valid admission found)
```

## Invariants Preserved

- FP-008 observation tables remain immutable (no `is_evidence`, `evidence_status` fields)
- FP-008 classification/outcome observations unchanged
- FP-004 lifecycle events, execution attempts preserved
- FP-005 telemetry ingestion preserved
- All 158 tests pass (46 new, 112 existing)
