# FP-011 Executor Result

## Packet
FP-011 — Metrics Validation and Admission Integration

## Implementation Summary

FP-011 adds validation and admission integration for persisted ForgePilot evidence records (FP-010). Evidence records can be evaluated for evidence use without mutating the original observation.

## Files Changed

### New Files
- `migrations/007_fp011_validation_admission_events.sql` — Append-only tables for validation and admission evaluation events
- `src/db/evidence-record-evaluation.ts` — Validation logic, admission integration, derived state functions
- `tests/fp011.test.ts` — Comprehensive test suite (57 tests)

### Modified Files
- None (all changes are additive)

## Design Decisions

### Append-Only Event Tables
Two new append-only tables record evaluation events:
- `evidence_record_validation_events` — Records validation outcomes (VALID, INVALID, INCOMPLETE, DEFERRED)
- `evidence_record_admission_events` — Records admission outcomes (NOT_EVALUATED, REJECTED, PENDING, ADMITTED, QUARANTINED)

Both tables reference `evidence_records.evidence_id` and preserve full evaluator provenance.

### No Mutation of Original Records
Original evidence records are never modified by validation or admission evaluations. All evaluation results are stored in separate append-only event tables. Current state is derived from the latest events.

### Independent State Axes
Trust tier, validation state, and admission state remain independent axes:
- Trust tier describes source/provenance confidence
- Validation state describes structural/logical usability (NOT_EVALUATED excluded)
- Admission state describes whether a record may influence observatory outputs (NOT_EVALUATED valid)

### Event Outcome Field Naming
The append-only event tables use `validation_outcome` and `admission_outcome` column names to distinguish evaluation event results from the original evidence record's `validation_state` and `admission_state` fields. These outcome fields map directly to the FP-011 validation/admission state vocabularies:
- `validation_outcome` uses the validation state vocabulary: VALID, INVALID, INCOMPLETE, DEFERRED
- `admission_outcome` uses the admission state vocabulary: NOT_EVALUATED, REJECTED, PENDING, ADMITTED, QUARANTINED

This naming separation reinforces that event outcomes are append-only evaluations, not mutations of the original record's state fields.

### Validation Rules
- **VALID**: All required identity and provenance fields present, artifact_paths valid JSON, state-axis values within allowed vocabularies, no logical contradiction
- **INCOMPLETE**: Missing model_id, model_role, commit_sha, metrics_path, or artifact_paths
- **INVALID**: Malformed artifact_paths JSON, invalid state vocabulary, NOT_EVALUATED used as validation_state
- **DEFERRED**: Prerequisite data not yet available

### Admission Rules
- **ADMITTED**: Only when validation outcome is VALID and trust_tier is not TIER_0_UNTRUSTED
- **REJECTED**: When validation outcome is INVALID
- **PENDING**: Structurally valid but requires review
- **QUARANTINED**: Previously admitted but later invalidated
- **NOT_EVALUATED**: No admission evaluation performed

## Acceptance Criteria Status

1. Validation logic exists for FP-010 evidence records — PASS
2. Admission integration exists for FP-010 evidence records — PASS
3. Validation and admission represented without mutating original records — PASS
4. Trust tier, validation state, admission state remain independent axes — PASS
5. NOT_EVALUATED not accepted as validation state — PASS
6. NOT_EVALUATED remains valid as admission state — PASS
7. Valid records can be identified — PASS
8. Incomplete records can be identified — PASS
9. Invalid records can be identified — PASS
10. Deferred records can be identified — PASS
11. Admission eligibility can be derived for valid records — PASS
12. Rejection can be derived for invalid records — PASS
13. Quarantine can be represented without deleting prior records — PASS
14. Tests verify append-only behavior — PASS
15. Tests verify FP-004, FP-005, FP-008, FP-009, FP-010 behavior preserved — PASS
16. Existing tests continue to pass — PASS (247/247)
17. No routing, ranking, task classification, leaderboards, dashboards, reports, cost optimization, or model recommendation added — PASS
