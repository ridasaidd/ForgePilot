# FP-010 Executor Result

## Packet

FP-010 — SQLite Evidence Persistence

## Execution Summary

Implemented minimal SQLite evidence persistence layer for ForgePilot evidence records.

## Files Changed

### New Files

- `migrations/006_fp010_evidence_persistence.sql` — Migration creating `evidence_records` table with provenance fields, state axes, and indexes.
- `src/db/evidence-records.ts` — Evidence record insertion and retrieval functions with state validation.
- `tests/fp010.test.ts` — 24 tests covering migration idempotence, insertion, retrieval, state constraints, artifact paths, and provenance.

### Unchanged Files

All existing files remain unmodified. No changes to routing, model ranking, cost optimization, task classification, admission policy logic, dashboards, reports, or leaderboards.

## Schema

The `evidence_records` table stores:

- `evidence_id` — Primary key
- `packet_id` — FK to packets
- `run_id` — Unique run identifier
- `model_id` — Model identifier
- `model_role` — Role the model performed
- `branch` — Git branch
- `commit_sha` — Git commit
- `executor_result` — Executor outcome
- `verification_result` — Verification outcome
- `audit_result` — Audit outcome
- `comparison_result` — Comparison outcome
- `metrics_path` — Path to metrics artifact
- `artifact_paths` — JSON array of artifact paths
- `trust_tier` — TIER_0_UNTRUSTED | TIER_1_SELF_REPORTED | TIER_2_VERIFIED_ARTIFACT | TIER_3_REPRODUCIBLE (default: TIER_0_UNTRUSTED)
- `validation_state` — VALID | INVALID | INCOMPLETE | DEFERRED (default: INCOMPLETE)
- `admission_state` — NOT_EVALUATED | REJECTED | PENDING | ADMITTED | QUARANTINED (default: NOT_EVALUATED)
- `created_at` — Timestamp

## State Axes

The three state axes remain separate:

- `trust_tier` defaults to `TIER_0_UNTRUSTED`
- `validation_state` defaults to `INCOMPLETE`
- `admission_state` defaults to `NOT_EVALUATED`

FP-010 stores state values but does not decide them. Policy logic is reserved for FP-011.

## Scope Boundaries Preserved

- No routing logic implemented
- No model ranking logic implemented
- No cost optimization implemented
- No task classification implemented
- No admission policy logic beyond storing provided state values
- No dashboards, reports, or leaderboards
- Existing markdown and JSON run artifacts remain the human-readable evidence trail

## Correction Applied

Fixed truthy-check validation bug: Changed `if (params.trust_tier)` to `if (params.trust_tier !== undefined)` (and similarly for validation_state and admission_state) to ensure empty strings are validated and rejected at the application layer.

Added tests:
- `should reject empty string trust_tier` — validates that `trust_tier: ""` is rejected
- `should reject NOT_EVALUATED for validation_state` — validates axis separation (NOT_EVALUATED belongs to admission_state only)
