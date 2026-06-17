# FP-012 Audit Result

## Packet
- **ID:** FP-012
- **Title:** Task Classification and Model Comparison Protocol

## Execution
- **Branch:** eval/fp-012/deepseek-v4-pro-high
- **Commit:** 42613fc
- **Executor:** DeepSeek V4 Pro High

## Auditor
- **Model:** Qwen 3.7 Max
- **Date:** 2026-06-17

## Verdict
**ACCEPTED_WITH_NOTES**

## Verification Commands

```
pnpm typecheck: PASSED (0 errors)
pnpm test: PASSED (343/343 tests, 0 failures)
```

## Acceptance Criteria Verification

| AC | Description | Status |
|----|-------------|--------|
| 1 | Task classification records can be persisted | PASS |
| 2 | Model comparison records can be persisted | PASS |
| 3 | Classification records are append-only | PASS |
| 4 | Comparison records are append-only | PASS |
| 5 | Classification supports all required axes and vocabularies | PASS |
| 6 | Comparison supports all required outcome and basis vocabularies | PASS |
| 7 | Comparison records can reference model/evidence/execution identifiers | PASS |
| 8 | Comparison records preserve admission state at comparison time | PASS |
| 9 | Comparison does not mutate evidence records | PASS |
| 10 | Comparison does not mutate packet intent | PASS |
| 11 | Comparison does not mutate validation or admission events | PASS |
| 12 | Invalid classification vocabulary values are rejected | PASS |
| 13 | Invalid comparison vocabulary values are rejected | PASS |
| 14 | Derived query functions can retrieve classification history by packet | PASS |
| 15 | Derived query functions can retrieve comparison history by packet | PASS |
| 16 | The latest classification or comparison can be derived without deleting history | PASS |
| 17 | Existing FP-004, FP-005, FP-008, FP-009, FP-010, and FP-011 behaviors are preserved | PASS |
| 18 | Existing tests continue to pass | PASS |
| 19 | No routing, ranking, recommendation, dashboard, report, cost optimization, or local benchmarking behavior is added | PASS |

## Scope Compliance

### In-Scope Behavior Verified
- Task classification protocol with 7 axes and controlled vocabularies
- Model comparison protocol with outcome, basis, and admission state tracking
- Append-only event tables with self-referencing correction rows
- Cross-packet reference rejection for classification corrections and comparison records
- Derived query functions for history and latest state
- SQLite migration and schema consistency

### Out-of-Scope Behavior Absent (Verified)
- No model routing
- No automatic model selection
- No model ranking
- No leaderboards
- No dashboards
- No reports
- No cost optimization
- No provider recommendation
- No local model benchmarking
- No workflow orchestration changes
- No packet execution policy changes

## Append-Only Verification

### Classification
- `recordTaskClassification` inserts new rows only
- `recordTaskClassificationCorrection` inserts new row with `correction_of` referencing prior event
- Original classification rows are never mutated
- `getLatestTaskClassification` derives current state via ORDER BY DESC LIMIT 1

### Comparison
- `recordModelComparison` inserts new rows only
- `recordModelComparisonCorrection` inserts new row with `correction_of` referencing prior event
- Original comparison rows are never mutated
- `getLatestComparison` derives current state via ORDER BY DESC LIMIT 1

## Admission State Preservation

- Comparison records explicitly store `model_a_admission_state` and `model_b_admission_state`
- Admission states default to `NOT_EVALUATED` when not provided
- Comparison does not mutate evidence records, validation events, or admission events
- Tests verify evidence record immutability after comparison insertion

## Comparison Correction Identifier Preservation

- `recordModelComparisonCorrection` carries forward from previous event:
  - `execution_a_id`, `execution_b_id`
  - `evidence_a_id`, `evidence_b_id`
  - `model_a_id`, `model_b_id`
  - `model_a_role`, `model_b_role`
  - `model_a_admission_state`, `model_b_admission_state`
  - `model_a_verification_result`, `model_b_verification_result`
  - `model_a_audit_result`, `model_b_audit_result`
  - `selected_model`, `selection_reason`
- Test "should preserve compared execution/evidence/model identifiers in correction latest derivation" verifies this behavior

## Schema and Migration Consistency

- Migration `migrations/008_fp012_task_classification_comparison.sql` creates both tables with correct DDL
- `src/db/schema.sql` includes canonical FP-012 table definitions
- Migration and schema DDL are identical
- Indexes on `packet_id` and `(packet_id, created_at)` are present for both tables
- CHECK constraints enforce controlled vocabularies at database level
- Foreign keys reference `packets(id)`, `packet_executions(execution_id)`, and `evidence_records(evidence_id)`

## FP-008/009/010/011 Preservation

- FP-008 tables (`packet_classification_observations`, `packet_classification_corrections`, `model_outcome_observations`, `model_outcome_corrections`) exist and function correctly
- FP-009 tables (`evidence_admission_events`, `admission_review_requests`, `admission_invalidation_events`) exist and function correctly
- FP-010 table (`evidence_records`) exists and functions correctly
- FP-011 tables (`evidence_record_validation_events`, `evidence_record_admission_events`) exist and function correctly
- FP-012 tables are distinct from and do not replace any prior packet tables

## Notes

1. **Minor inconsistency in correction defect carry-forward:** In `recordModelComparisonCorrection` (src/db/model-comparison.ts:292-293), `model_a_defects` and `model_b_defects` default to `[]` when not explicitly provided in the correction params, rather than carrying forward from the previous event like other fields (e.g., `model_a_verification_result` uses `params.model_a_verification_result ?? prevEvent.model_a_verification_result`). This is inconsistent with the carry-forward pattern used for other fields but does not violate any acceptance criteria, as defects are optional and the correction function accepts them as explicit parameters.

2. **Dual classification systems:** FP-012 introduces `fp012_task_classification_events` which is distinct from FP-008's `packet_classification_observations`. The two use different vocabularies and serve different purposes. FP-008 classification focuses on routing/skill axes while FP-012 classification focuses on task characteristics for comparison protocol. Both coexist without conflict.

## Conclusion

The FP-012 DeepSeek execution satisfies all 19 acceptance criteria. The implementation correctly adds task classification and model comparison protocols as append-only observations without mutating existing evidence, validation, admission, or packet intent records. Schema and migration are consistent. No forbidden behavior was added. The minor defect carry-forward inconsistency noted above does not affect correctness or acceptance criteria compliance.
