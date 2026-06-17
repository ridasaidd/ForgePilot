# FP-011 Comparison Result — Metrics Validation and Admission Integration

## Packet

- Packet: FP-011
- Title: Metrics Validation and Admission Integration
- Benchmark base commit: 288769b

## Executor Results

| Model | Executor Commit | Auditor | Audit Verdict | Typecheck | Tests |
|---|---:|---|---|---|---|
| DeepSeek V4 Pro High | 65bfb2f | Qwen 3.7 Max | ACCEPTED | PASS | 257/257 |
| Qwen 3.7 Max | 737d21f | DeepSeek V4 Pro High | ACCEPTED | PASS | 247/247 |

## Outcome

Both implementations are accepted.

Selected implementation:

**DeepSeek V4 Pro High**

## Decision Basis

DeepSeek is selected because its implementation more directly matches the FP-011 packet vocabulary and persistence model.

Primary reasons:

1. DeepSeek uses `validation_state` and `admission_state` for validation/admission event results, directly matching the packet's state-axis vocabulary.
2. DeepSeek updates `src/db/schema.sql`, keeping the canonical schema aligned with the migration.
3. DeepSeek's corrected implementation cleanly separates validation results from admission results after review.
4. DeepSeek's event tables reference FP-010 `evidence_records(evidence_id)` and preserve append-only behavior.
5. DeepSeek's tests verify non-mutation, state-axis independence, `NOT_EVALUATED` handling, derived current state, and prior packet preservation.

Qwen is also accepted and provides a valid independent design. It uses `validation_outcome` and `admission_outcome` to distinguish append-only event outcomes from source-record state fields. This design was accepted by audit, but it is slightly less aligned with the packet's explicit vocabulary and does not update the canonical schema file.

## DeepSeek Notes

Strengths:

- Strong packet vocabulary alignment.
- Canonical schema update included.
- Append-only validation/admission event tables.
- Separate validation and admission result types after correction.
- Full verification passed: 257/257 tests.

Weaknesses:

- Initial implementation incorrectly returned admission outcomes in a `validation_state` field.
- The issue was caught before commit, corrected narrowly, and then accepted by Qwen audit.

## Qwen Notes

Strengths:

- Independent append-only event model.
- Strong test coverage.
- No mutation of existing implementation files.
- Explicit explanation of `validation_outcome` / `admission_outcome` naming.
- Full verification passed: 247/247 tests.

Weaknesses:

- Uses event outcome naming instead of the packet's direct `validation_state` / `admission_state` vocabulary.
- Does not update `src/db/schema.sql`.
- Required cleanup for dead code and event naming documentation.
- Qwen execution incurred observed Zen cost during follow-up work.

## Scope Compliance

Both implementations preserved FP-011 scope.

Neither implementation added:

- model routing,
- model ranking,
- task classification,
- leaderboards,
- dashboards,
- reports,
- cost optimization,
- model recommendation,
- local model benchmarking,
- model comparison matrices.

## Final Result

- DeepSeek V4 Pro High: ACCEPTED, SELECTED
- Qwen 3.7 Max: ACCEPTED, NOT SELECTED
- Comparison outcome: DEEPSEEK_SELECTED
