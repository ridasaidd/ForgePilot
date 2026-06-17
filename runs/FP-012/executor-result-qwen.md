# FP-012 Executor Result

## Packet

FP-012 — Task Classification and Model Comparison Protocol

## Summary

Implemented a protocol for classifying ForgePilot packets and comparing model executions in a structured, evidence-backed way. FP-012 records what was observed about a task and what was observed when comparing executions. It does not decide future routing.

## Implementation

### Migrations

- `migrations/008_fp012_task_classification_comparison.sql`
  - `fp012_task_classification_events` — append-only task classification observations with CHECK constraints on all 7 axes
  - `fp012_model_comparison_events` — append-only model comparison observations with CHECK constraints on outcome and basis vocabularies
  - Indexes on `packet_id` and `(packet_id, created_at)` for both tables

- `migrations/009_fp012_correction.sql`
  - Adds `model_identity` column to `fp012_task_classification_events`
  - Adds explicit `execution_a_id`, `execution_b_id`, `evidence_a_id`, `evidence_b_id`, `model_a_id`, `model_b_id`, `model_a_role`, `model_b_role` columns to `fp012_model_comparison_events`
  - `fp012_task_classification_corrections` — append-only correction records referencing prior classification observations
  - `fp012_model_comparison_corrections` — append-only correction records referencing prior comparison observations
  - Foreign keys from execution columns to `packet_executions(execution_id)` and evidence columns to `evidence_records(evidence_id)`

### TypeScript Modules

- `src/db/task-classification.ts`
  - `recordTaskClassification()` — validates all 7 axes against FP-012 vocabularies, verifies packet exists, inserts append-only record with `model_identity`
  - `recordTaskClassificationCorrection()` — records append-only correction with cross-packet reference rejection
  - `getTaskClassificationsByPacket()` — retrieves full classification history ordered chronologically
  - `getTaskClassification()` — retrieves single classification by id
  - `getLatestTaskClassification()` — derives latest classification without deleting history
  - `getTaskClassificationCorrections()` — retrieves corrections for a given classification

- `src/db/model-comparison.ts`
  - `recordModelComparison()` — validates outcome/basis vocabularies, evidence admission states, cross-packet references for execution/evidence IDs, inserts append-only record with explicit model/execution/evidence columns
  - `recordModelComparisonCorrection()` — records append-only correction with cross-packet reference rejection
  - `getModelComparisonsByPacket()` — retrieves full comparison history ordered chronologically
  - `getModelComparison()` — retrieves single comparison by id
  - `getLatestModelComparison()` — derives latest comparison without deleting history
  - `getModelComparisonCorrections()` — retrieves corrections for a given comparison
  - JSON parsing helpers for all array fields

### Schema

- `src/db/schema.sql` — updated with canonical FP-012 table definitions including `model_identity`, explicit execution/evidence/model columns, and correction tables

### Tests

- `tests/fp012.test.ts` — 107 tests covering all 19 acceptance criteria plus correction protocol fidelity

## Acceptance Criteria

| # | Criterion | Status |
|---|-----------|--------|
| AC1 | Task classification records can be persisted | PASS |
| AC2 | Model comparison records can be persisted | PASS |
| AC3 | Classification records are append-only | PASS |
| AC4 | Comparison records are append-only | PASS |
| AC5 | Classification supports all required axes and vocabularies | PASS |
| AC6 | Comparison supports all required outcome and basis vocabularies | PASS |
| AC7 | Comparison records can reference model/evidence/execution identifiers | PASS |
| AC8 | Comparison records preserve admission state at comparison time | PASS |
| AC9 | Comparison does not mutate evidence records | PASS |
| AC10 | Comparison does not mutate packet intent | PASS |
| AC11 | Comparison does not mutate validation or admission events | PASS |
| AC12 | Invalid classification vocabulary values are rejected | PASS |
| AC13 | Invalid comparison vocabulary values are rejected | PASS |
| AC14 | Derived query functions can retrieve classification history by packet | PASS |
| AC15 | Derived query functions can retrieve comparison history by packet | PASS |
| AC16 | Latest classification or comparison can be derived without deleting history | PASS |
| AC17 | Existing FP-004, FP-005, FP-008, FP-009, FP-010, FP-011 behaviors preserved | PASS |
| AC18 | Existing tests continue to pass | PASS |
| AC19 | No routing, ranking, recommendation, dashboard, report, cost optimization, or benchmarking added | PASS |

## Correction Protocol

- Classification corrections: append-only rows in `fp012_task_classification_corrections` referencing `correction_of` with `correction_reason`, `corrected_fields`, `new_values`, and `actor`
- Comparison corrections: append-only rows in `fp012_model_comparison_corrections` with same structure
- Cross-packet correction references are rejected
- Original records are never mutated when corrections are added
- Comparison corrections preserve execution/evidence/model identifiers and defect history

## Scope Discipline

No out-of-scope behavior was added:
- No model routing
- No automatic model selection
- No model ranking or leaderboards
- No dashboards or reports
- No cost optimization
- No provider recommendation
- No local model benchmarking
- No workflow orchestration changes
- No packet execution policy changes
- FP-008, FP-009, FP-010, FP-011 tables are not replaced or mutated

## Core Rule Compliance

> Task classification is observation. Model comparison is observation.
> Neither classification nor comparison mutates packet intent, evidence records, validation state, admission state, or execution history.

Verified by 6 dedicated non-mutation tests covering evidence records, packet intent, FP-008 classifications, FP-008 outcomes, FP-009 admission events, and FP-011 validation events.
