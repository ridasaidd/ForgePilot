# FP-009 Comparison Result

## Packet

packets/FP-009.md

## Packet Title

FP-009 — Evidence Admission Persistence

## Benchmark Base

Branch: fp-009-benchmark-base
Commit: 20c8cee
Base packet commit: 5d03816

## Compared Implementations

### DeepSeek-V4-Pro-High

Branch: eval/fp-009/deepseek-v4-pro-high

Commits:

- 4f2a8bf Execute FP-009 with DeepSeek
- b48c074 Audit FP-009 DeepSeek execution with Qwen
- d00645d Fix FP-009 readmission eligibility derivation
- 9f38a4d Post-fix audit FP-009 DeepSeek execution with Qwen

Initial verification:

- pnpm typecheck: PASS
- pnpm test: PASS, 157/157
- pnpm fp -- init-db: PASS
- pnpm fp -- init-db again: PASS

Post-fix verification:

- pnpm typecheck: PASS
- pnpm test: PASS, 158/158
- pnpm fp -- init-db: PASS
- pnpm fp -- init-db again: PASS

Audit result:

- Initial audit: ACCEPTED with one required fix
- Required fix: RF-1, readmission eligibility derivation
- Post-fix audit: ACCEPTED
- Final status: ACCEPTED_AFTER_FIX

### Qwen-3.7-Max

Branch: eval/fp-009/qwen-3.7-max

Commits:

- 3c66ef9 Execute FP-009 with Qwen
- d4df254 Audit FP-009 Qwen execution with DeepSeek
- 86fa160 Fix FP-009 Qwen readmission eligibility derivation
- 0927051 Post-fix audit FP-009 Qwen execution with DeepSeek

Initial verification:

- pnpm typecheck: PASS
- pnpm test: PASS, 142/142
- pnpm fp -- init-db: PASS
- pnpm fp -- init-db again: PASS

Post-fix verification:

- pnpm typecheck: PASS
- pnpm test: PASS, 143/143
- pnpm fp -- init-db: PASS
- pnpm fp -- init-db again: PASS

Audit result:

- Initial audit: REJECTED pending required fix
- Required fix: RF-1, readmission eligibility derivation
- Post-fix audit: ACCEPTED
- Final status: ACCEPTED_AFTER_FIX

## Shared Audit Finding

Both implementations initially missed the same temporal event-chain edge case:

- Admission A1 admits observation O.
- Invalidation I1 defeats A1.
- Admission A2 later re-admits O.
- Derived eligibility must return eligible true via A2.

This finding is significant because FP-009 is fundamentally an event-chain packet. Both models implemented the basic admission and invalidation paths, but initially failed the temporal recovery path.

Both cross-model audits caught the issue.

Both executors corrected the issue.

Both post-fix audits accepted the correction.

## Scope Discipline

Both implementations respected the FP-009 scope boundary.

Neither implementation added:

- routing
- scoring
- dashboards
- reports
- aggregation
- model selection
- automatic admission
- mutable evidence-state fields on observation rows

Both preserved the core FP-009 invariant:

Current evidence eligibility is derived from the valid event chain, never stored as mutable truth on the observation.

## Evidence Integrity

Both implementations created the required FP-009 persistence layer:

- evidence_admission_events
- admission_review_requests
- admission_invalidation_events

Both implementations preserved FP-008 observation immutability.

Both implementations tested that is_evidence and evidence_status were not added to observation tables.

Both implementations required invalidation to reference a review request.

Both implementations required the review request to target the same admission event being invalidated.

## Difference Summary

### DeepSeek Strengths

- Broader test coverage.
- More extensive FP-009 test suite.
- Post-fix test count: 158/158.
- Strong preservation coverage across FP-004, FP-005, and FP-008 behaviors.
- Post-fix audit accepted the RF-1 correction.

### DeepSeek Weaknesses

- Initially missed the re-admission-after-invalidation edge case.
- Required one audit-driven correction cycle.
- Larger implementation and test surface.

### Qwen Strengths

- Smaller implementation.
- Clean scope discipline.
- Passed all initial verification.
- Corrected the audit finding with a narrow targeted change.
- Post-fix audit accepted the RF-1 correction.

### Qwen Weaknesses

- Initially missed the same re-admission-after-invalidation edge case.
- Initial audit result was rejected pending required fix.
- Lower test coverage than DeepSeek.
- Initial eligibility implementation used first-valid-admission selection, which was too shallow for the event-chain model.

## Final Selection

Selected implementation:

DeepSeek-V4-Pro-High

Selection status:

ACCEPTED_AFTER_FIX

Reason:

DeepSeek and Qwen both required one audit-driven correction for the same temporal event-chain bug. After equivalent correction cycles and accepted post-fix audits, DeepSeek is selected because it produced broader test coverage and a more comprehensive verification surface while still respecting FP-009 scope constraints.

Qwen is also accepted after fix, but not selected.

## Final Outcome

- DeepSeek-V4-Pro-High: ACCEPTED_AFTER_FIX, SELECTED
- Qwen-3.7-Max: ACCEPTED_AFTER_FIX, NOT_SELECTED
- Outcome: DEEPSEEK_SELECTED

## Evidence Notes

This benchmark produced an important ForgePilot evidence signal:

Cross-model audit exposed a shared temporal reasoning failure.

The event-chain bug was not caught by either executor's initial test suite, but it was caught by the opposing model during audit when the temporal scenario was explicitly included.

This suggests FP-009 should record the following evaluation signal:

- temporal_event_chain_reasoning: WEAK_INITIAL
- cross_model_audit_value: HIGH
- post_audit_correction: SUCCESSFUL

This is useful routing evidence for future packets involving append-only event chains, derived state, admission/invalidation semantics, or temporal recovery paths.
