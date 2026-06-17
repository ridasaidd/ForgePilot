# FP-012 Comparison Result

## Packet

- **ID:** FP-012
- **Title:** Task Classification and Model Comparison Protocol

## Compared executions

### DeepSeek V4 Pro High

- **Branch:** `eval/fp-012/deepseek-v4-pro-high`
- **Final commit:** `ea1beb4`
- **Initial execution commit:** `42613fc`
- **Audit:** Qwen 3.7 Max
- **Audit result:** `ACCEPTED_WITH_NOTES`
- **Post-fix audit result:** `ACCEPTED`
- **Verification:** `pnpm typecheck` passed; `pnpm test` passed with 344/344 tests.

### Qwen 3.7 Max

- **Branch:** `eval/fp-012/qwen-3.7-max`
- **Execution commit:** `4f1d955`
- **Audit:** DeepSeek V4 Pro High
- **Audit result:** `ACCEPTED_WITH_NOTES`
- **Verification:** `pnpm typecheck` passed; `pnpm test` passed with 375/375 tests.

## Result

**Selected implementation:** DeepSeek V4 Pro High

## Rationale

Both implementations satisfied the FP-012 acceptance criteria and preserved prior FP-004, FP-005, FP-008, FP-009, FP-010, and FP-011 behavior.

DeepSeek is selected for FP-012 because its implementation aligned more directly with the packet’s evidence-first and schema-bound requirements. It modeled task classification and model comparison as explicit append-only observation records with relational structure, canonical schema integration, comparison references, correction handling, and preservation of compared identifiers.

DeepSeek did require one post-audit correction: comparison correction events initially failed to carry forward defect history when defect fields were omitted. The issue was narrow, corrected directly, covered by regression tests, and accepted in a post-fix audit.

Qwen also reached an accepted state, but only after a larger correction pass. Its initial implementation passed tests while using a looser JSON-array-centered design with weaker relational guarantees. The correction improved protocol fidelity by adding explicit execution, evidence, and model columns, model identity, correction tables, and schema integration. However, the final audited design still retained a weaker correction-derivation model: correction rows are preserved separately, while `getLatestTaskClassification()` and `getLatestModelComparison()` return the latest event rows rather than an effective corrected summary.

## Observed model behavior for this packet

This comparison records an observation about FP-012 only. It is not a global model ranking.

- DeepSeek showed stronger first-pass alignment with packet constraints, relational evidence modeling, and schema-bound implementation.
- Qwen showed strong test completion ability, but looser initial protocol interpretation and higher correction cost before reaching acceptable fidelity.
- Qwen’s final implementation remained accepted with notes because corrected-state derivation was less complete than DeepSeek’s approach.

## Decision

For FP-012, DeepSeek is selected because it better preserves ForgePilot’s evidence model:

- append-only observations
- explicit relational identifiers
- canonical schema consistency
- correction behavior that preserves compared identifiers and defect history
- narrower correction delta
- stronger alignment with the packet’s intended protocol semantics

## Non-decision

This result must not be interpreted as:

- a global model ranking
- a routing policy
- a provider recommendation
- a cost optimization rule
- a leaderboard result
- an automatic model-selection signal

It is only an admitted comparison observation for FP-012.
