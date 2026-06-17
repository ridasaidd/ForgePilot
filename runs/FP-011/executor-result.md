# FP-011 Execution Result

## Implementation Summary

### Files Created
- `migrations/007_fp011_validation_admission.sql` — Append-only validation and admission event tables
- `src/db/validation-admission.ts` — Validation and admission logic implementation
- `tests/fp011.test.ts` — Comprehensive test suite

### Files Modified
- `src/db/schema.sql` — Updated canonical schema with FP-011 tables

## Design Decisions

### Append-Only Architecture
Two append-only event tables were created to record validation and admission evaluations against FP-010 evidence records:

1. **`evidence_record_validation_events`** — Records each validation evaluation with:
   - Validation state (VALID, INVALID, INCOMPLETE, DEFERRED)
   - Actor provenance (who made the evaluation)
   - Detailed reasoning (what was checked, why)
   - Provenance completeness flag

2. **`evidence_record_admission_events`** — Records each admission evaluation with:
   - Admission state (NOT_EVALUATED, REJECTED, PENDING, ADMITTED, QUARANTINED)
   - Trust tier at time of admission
   - Actor provenance
   - Admission reasoning

### Key Design Principles
- **Original records never mutated**: The `evidence_records` table (FP-010) remains the historical source of truth. Validation/admission state is derived from the latest event in each event table.
- **State axes preserved**: Trust tier, validation state, and admission state remain independent fields. All 80 combinations (4 × 4 × 5) are valid.
- **NOT_EVALUATED rejection**: The `recordValidationEvent` function explicitly rejects NOT_EVALUATED with a clear error message.
- **NOT_EVALUATED acceptance**: NOT_EVALUATED remains a valid admission state, accepted in both the evidence_records insert and admission event recording.
- **Current state from event history**: `getCurrentValidationState()` and `getCurrentAdmissionState()` derive state from the latest event, not from the original record.

### Validation Rules
- **VALID**: All identity/provenance fields present, artifacts valid JSON arrays, no contradictions
- **INCOMPLETE**: Missing required fields (model_id, model_role, commit_sha, metrics_path, artifact_paths)
- **INVALID**: Malformed artifact JSON, impossible state combinations, missing fundamental identity
- **DEFERRED**: References artifacts but corresponding results not yet available

### Admission Rules
- **ADMITTED**: Validation is VALID, trust tier sufficient (not TIER_0_UNTRUSTED), audit evidence present
- **REJECTED**: Validation is INVALID, evidence known malformed
- **PENDING**: Validation is INCOMPLETE/DEFERRED, trust tier insufficient, awaiting review
- **QUARANTINED**: Previously admitted but current validation is no longer VALID
- **NOT_EVALUATED**: No admission evaluation performed (valid initial state)

## Verification Results
- TypeScript typecheck: PASSED
- All 257 tests: PASSED (0 failures)
- FP-011 tests: 40 tests across 17 test suites
- All previous packet tests (FP-004, FP-005, FP-008, FP-009, FP-010): PASSED

## Design Corrections (Review Feedback)
- **Separate result types**: `ValidationResult` (with `validation_state`) and `AdmissionEvaluationResult` (with `admission_state`) keep the two axes independent at the type level. `evaluateAdmissionForRecord` now returns `AdmissionEvaluationResult` and never carries admission outcomes in a `validation_state` field.
