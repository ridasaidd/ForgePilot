# FP-008 Comparison Result

Packet: FP-008 — Classification and Outcome Persistence Implementation

Benchmark base branch: fp-008-benchmark-base
Benchmark base commit: c7f7910

## Compared Executions

### DeepSeek-V4-Pro-High

Branch:

- eval/fp-008/deepseek-v4-pro-high

Commits:

- e0a17a5 Execute FP-008 with DeepSeek
- 2884062 Audit FP-008 DeepSeek execution

Audit result:

- ACCEPTED

Summary:

DeepSeek implemented SQLite persistence for packet classification observations, classification corrections, model outcome observations, and model outcome corrections. The implementation added migration, validation, DB APIs, tests, optional read-only CLI commands, and required run artifacts.

Strengths:

- Strong final test coverage: 123/123 passing.
- Added explicit validation module.
- Added both TypeScript validation and SQLite CHECK constraints for most scalar controlled vocabularies.
- Added admission boundary enforcement after correction.
- Added cross-packet reference integrity after correction.
- Preserved FP-004 persistence and FP-005 telemetry behavior.
- Added optional list-only CLI commands for manual inspection.

Non-blocking notes:

- Required one pre-commit correction cycle for evidence-integrity issues:
  - rejecting `ADMITTED` in classification/outcome persistence APIs
  - adding cross-packet reference integrity checks
  - adding `root_cause_level` CHECK coverage
- `correction_count` is stored as TEXT rather than INTEGER.
- Some list-like fields are stored as plain TEXT rather than structured JSON strings.
- Added optional CLI surface area, which is acceptable but larger than necessary for FP-008.

### Qwen-3.7-Max

Branch:

- eval/fp-008/qwen-3.7-max

Commits:

- 380a742 Execute FP-008 with Qwen
- 79c0df2 Audit FP-008 Qwen execution

Audit result:

- ACCEPTED

Summary:

Qwen implemented SQLite persistence for packet classification observations, classification corrections, model outcome observations, and model outcome corrections. The implementation added migration, DB APIs, tests, and required run artifacts.

Strengths:

- Passed audit without required correction.
- No CLI surface area added; CLI was optional.
- `correction_count` is stored as INTEGER.
- List-like fields are stored as JSON strings.
- Rejects `ADMITTED` in classification/outcome persistence APIs.
- Rejects all required cross-packet reference mismatches.
- Enforces controlled vocabularies through TypeScript validation and SQLite CHECK constraints for scalar fields.
- Preserves FP-004 persistence and FP-005 telemetry behavior.
- Avoids routing, scoring, aggregation, reports, dashboards, model selection, and admission automation.

Non-blocking notes:

- Executor summary slightly overclaimed SQL CHECK coverage for JSON-list fields. Application-layer TypeScript validation covers those fields, and FP-008 allowed TypeScript validation, SQLite CHECK constraints, or both.
- `validation_state` defaults to `VALID` for records populated mostly with defaults, but records remain `PENDING` and low-trust, so this is acceptable for current scope.
- No CLI commands were added, so manual interaction requires direct SQL or programmatic API access.

## Decision

Winner:

- Qwen-3.7-Max

Outcome:

- Qwen selected as merge candidate.
- DeepSeek accepted but not selected.

## Rationale

Both executions satisfied FP-008 acceptance criteria and passed audit.

Qwen is selected because it produced the cleaner final candidate for this persistence implementation packet:

- no required correction cycle
- smaller implementation surface
- no optional CLI behavior
- better storage type for `correction_count`
- JSON-string representation for list-like fields
- all required evidence-integrity boundaries present from the committed execution

DeepSeek remains accepted and produced broader test coverage, but the required pre-commit correction cycle is an important outcome signal for this evidence-sensitive implementation packet.

## Evidence Signals

DeepSeek:

- first_pass_success: false
- fix_attempts: 1
- audit_result: ACCEPTED
- human_intervention: true
- root_cause: EXECUTOR
- pre_commit_correction_required: true

Qwen:

- first_pass_success: true
- fix_attempts: 0
- audit_result: ACCEPTED
- human_intervention: false
- root_cause: NONE
- pre_commit_correction_required: false

## Routing Signal Interpretation

This result complicates the earlier pattern.

DeepSeek remains strong on strict standards work, but FP-008 shows Qwen can outperform on implementation packets when the task includes clear evidence-integrity requirements up front.

This signal is not sufficient for automated routing. It may be used only as admitted comparison evidence after the result is accepted into the observatory history.
