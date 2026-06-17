# Model Execution Evidence Review

## Purpose

This document preserves what ForgePilot learned from model execution evidence in FP-010, FP-011, and FP-012. It is a reflective evidence-review artifact, not an implementation document.

It answers:

> What did ForgePilot learn from recent model execution evidence?

It does not answer:

> Which model is globally better?

## Scope

This review covers evidence from:

- **FP-010** — SQLite Evidence Persistence
- **FP-011** — Metrics Validation and Admission Integration
- **FP-012** — Task Classification and Model Comparison Protocol

The review is descriptive and evidence-bound. It does not create routing, ranking, cost optimization, leaderboards, or automatic model-selection behavior.

## Evidence Sources Reviewed

### FP-010

- `packets/FP-010.md`
- `runs/FP-010/executor-result-deepseek.md`
- `runs/FP-010/executor-result-qwen.md`
- `runs/FP-010/executor-result.md`
- `runs/FP-010/audit-deepseek-by-qwen.md`
- `runs/FP-010/audit-qwen-by-deepseek.md`
- `runs/FP-010/comparison-result.md`
- `runs/FP-010/metrics.json`
- `runs/FP-010/metrics-deepseek.json`
- `runs/FP-010/metrics-qwen.json`
- `runs/FP-010/verification.txt`
- `runs/FP-010/verification-deepseek.txt`
- `runs/FP-010/verification-qwen.txt`

### FP-011

- `packets/FP-011.md`
- `runs/FP-011/executor-result-deepseek.md`
- `runs/FP-011/executor-result-qwen.md`
- `runs/FP-011/executor-result.md`
- `runs/FP-011/audit-deepseek-by-qwen.md`
- `runs/FP-011/audit-qwen-by-deepseek.md`
- `runs/FP-011/comparison-result.md`
- `runs/FP-011/metrics.json`
- `runs/FP-011/metrics-deepseek.json`
- `runs/FP-011/metrics-qwen.json`
- `runs/FP-011/verification.txt`
- `runs/FP-011/verification-deepseek.txt`
- `runs/FP-011/verification-qwen.txt`

### FP-012

- `packets/FP-012.md`
- `runs/FP-012/executor-result-deepseek.md`
- `runs/FP-012/executor-result-qwen.md`
- `runs/FP-012/executor-result.md`
- `runs/FP-012/audit-deepseek-by-qwen.md`
- `runs/FP-012/audit-qwen-by-deepseek.md`
- `runs/FP-012/postfix-audit-qwen-by-deepseek.md`
- `runs/FP-012/comparison-result.md`
- `runs/FP-012/metrics.json`
- `runs/FP-012/metrics-deepseek.json`
- `runs/FP-012/metrics-qwen.json`
- `runs/FP-012/verification.txt`
- `runs/FP-012/verification-deepseek.txt`
- `runs/FP-012/verification-qwen.txt`

## Packet-by-Packet Summary

### FP-010 — SQLite Evidence Persistence

**Packet question:** Can ForgePilot store and retrieve evidence records for packet runs?

**Models compared:** DeepSeek V4 Pro High, Qwen 3.7 Max

**Directly recorded evidence:**

- **DeepSeek** created 3 files (migration, persistence module, 28 tests). All 184 tests passed. Typecheck passed. Audit by Qwen returned ACCEPTED.
- **Qwen** created 3 files (migration, persistence module, 24 tests). All 188 tests passed. Typecheck passed. Audit by DeepSeek returned ACCEPTED.
- DeepSeek stored `packet_id` as text (e.g., `FP-010`). Qwen stored `packet_id` as an integer foreign key referencing `packets(id)`.
- DeepSeek used a globally unique `run_id`. Qwen used `run_id` unique only within a packet (unique on `(packet_id, run_id)`).
- Both models preserved scope: no routing, ranking, cost optimization, task classification, or admission policy logic.
- Both models preserved state axis separation: trust_tier, validation_state, admission_state as independent columns with independent CHECK constraints.

**Correction history:**

| Model | Corrections | Nature |
|-------|------------|--------|
| DeepSeek V4 Pro High | 3 | validation_state defaulted to NOT_EVALUATED; trust_tier defaulted to empty string; truthy-check validation bug (`if (params.x)` → `if (params.x !== undefined)`) |
| Qwen 3.7 Max | 1 | Same truthy-check validation bug |

**Audit conclusions:**

- Both audits returned ACCEPTED.
- DeepSeek audit (by Qwen): All 10 criteria satisfied; 28 tests; noted self-correction of initial defects.
- Qwen audit (by DeepSeek): All 10 criteria satisfied; integer FK deemed correct relational normalization for `packet_id`.

**Comparison conclusions:**

- Outcome: QWEN_SELECTED.
- Basis: schema_integration_quality. Qwen's integer FK was deemed more relationally consistent with existing architecture.
- Both implementations accepted. Scope and state-axis boundaries preserved by both.

### FP-011 — Metrics Validation and Admission Integration

**Packet question:** Can a persisted evidence record be evaluated for evidence use without mutating the original observation?

**Models compared:** DeepSeek V4 Pro High, Qwen 3.7 Max

**Directly recorded evidence:**

- **DeepSeek** created 3 files, modified `src/db/schema.sql`. 40 FP-011 tests, 257 total tests passed. Typecheck passed. Audit by Qwen returned ACCEPTED.
- **Qwen** created 3 files, no modifications to existing files. 57 FP-011 tests, 247 total tests passed. Typecheck passed. Audit by DeepSeek returned ACCEPTED.
- DeepSeek used `validation_state` and `admission_state` column names directly in event tables, matching packet vocabulary. Qwen used `validation_outcome` and `admission_outcome` naming in event tables.
- DeepSeek updated `src/db/schema.sql` with canonical FP-011 definitions. Qwen did not.
- Both implemented append-only event tables referencing FP-010 `evidence_records`.
- Both preserved state axis independence and rejected NOT_EVALUATED as a validation state.
- Both confirmed no mutation of original evidence records.

**Correction history:**

| Model | First-pass success | Fix attempts | Notes |
|-------|-------------------|--------------|-------|
| DeepSeek V4 Pro High | false | 1 | Initial admission evaluation returned admission outcomes in a `validation_state` field; caught and corrected before commit |
| Qwen 3.7 Max | false | 2 | Required cleanup for dead code and event naming documentation; observed Zen cost: $2.61 |

**Audit conclusions:**

- Both audits returned ACCEPTED.
- DeepSeek audit (by Qwen): All 17 criteria satisfied. Separate `ValidationResult` and `AdmissionEvaluationResult` types after correction.
- Qwen audit (by DeepSeek): All 17 criteria satisfied. `validation_outcome`/`admission_outcome` naming was intentional and documented. No scope violations.

**Comparison conclusions:**

- Outcome: DEEPSEEK_SELECTED.
- Basis: packet_vocabulary_and_schema_alignment. DeepSeek used the packet's direct vocabulary and updated canonical schema.
- Both accepted. Both preserved scope.

### FP-012 — Task Classification and Model Comparison Protocol

**Packet question:** What kind of task was this, and how should two accepted or rejected executions be compared as evidence?

**Models compared:** DeepSeek V4 Pro High, Qwen 3.7 Max

**Directly recorded evidence:**

- **DeepSeek** created 4 files (migration, task-classification.ts, model-comparison.ts, tests). Initial audit: ACCEPTED_WITH_NOTES. Post-fix audit: ACCEPTED. Final: 344 tests passed. Typecheck passed.
- **Qwen** created 5 files including 2 migrations (008, 009), modified `src/db/schema.sql`. Audit: ACCEPTED_WITH_NOTES. Final: 375 tests passed. Typecheck passed.
- DeepSeek: Single migration creating 2 tables with self-referencing correction rows. Correction carry-forward of compared identifiers and defects.
- Qwen: Two migrations creating 4 tables (events + correction tables). `getLatestTaskClassification()` and `getLatestModelComparison()` return latest event row; corrections stored separately but not merged into derived summary.
- DeepSeek's initial comparison correction failed to carry forward `model_a_defects`/`model_b_defects` when omitted (defaulted to `[]`). Fixed in post-audit correction.
- Qwen's initial implementation used looser JSON-array-centered design; corrected with explicit FK columns, model identity, correction tables.

**Correction history:**

| Model | First-pass success | Audit verdict | Fix rounds | Notes |
|-------|-------------------|---------------|------------|-------|
| DeepSeek V4 Pro High | false | ACCEPTED_WITH_NOTES → ACCEPTED | 1 post-audit | Defect carry-forward inconsistency in comparison correction |
| Qwen 3.7 Max | false | ACCEPTED_WITH_NOTES | 2 (extensive) | Looser initial design; added explicit FK columns, model_identity, correction tables in migration 009; getLatest* functions do not merge correction data (design gap noted) |

**Audit conclusions:**

- DeepSeek initial audit (by Qwen): ACCEPTED_WITH_NOTES. Note: minor inconsistency in defect carry-forward.
- DeepSeek post-fix audit (by Qwen): ACCEPTED. Fix confirmed; regression test added.
- Qwen audit (by DeepSeek): ACCEPTED_WITH_NOTES. Note: `getLatestTaskClassification()` and `getLatestModelComparison()` return latest event row, not an effective corrected summary. Design gap identified but does not violate AC16 literally.

**Comparison conclusions:**

- Outcome: DEEPSEEK_SELECTED.
- Basis: COMPOSITE. Stronger first-pass alignment, relational evidence modeling, schema-bound implementation, narrower correction delta.
- Both accepted. Both preserved scope.

## Cross-Packet Observations

All observations below are limited to FP-010, FP-011, and FP-012.

### Directly Recorded Evidence

1. **Both models accepted in all 6 primary cross-model audits.** Across the 6 primary audits (one audit per model per packet), 5 returned ACCEPTED and 1 returned ACCEPTED_WITH_NOTES (FP-012 Qwen). One additional post-fix audit confirmed resolution of the FP-012 DeepSeek note, bringing total audit artifacts to 7. No primary or post-fix audit returned REJECTED.

2. **Both models required corrections in all 3 packets.** Neither model achieved first-pass success in any packet (per metrics.json records). Correction counts ranged from 1 to 3 per model per packet.

3. **Selection alternated by packet.** FP-010 selected Qwen. FP-011 selected DeepSeek. FP-012 selected DeepSeek. Selection basis differed per packet (schema integration, vocabulary alignment, relational modeling).

4. **Both models preserved scope boundaries in all 3 packets.** No audit found routing, ranking, cost optimization, leaderboards, dashboards, reports, or automatic model-selection logic.

5. **State axis separation preserved by both models across all packets.** trust_tier, validation_state, and admission_state remained independent axes in FP-010 and FP-011 implementations. FP-012 did not collapse them.

6. **Test count asymmetry observed but not correlated with selection.** Qwen wrote more tests in FP-011 (57 vs 40) and FP-012 (107 vs ~70). DeepSeek wrote more tests in FP-010 (28 vs 24). Selection outcome did not consistently favor higher test count.

7. **One model had observed cost recorded.** Qwen FP-011 execution incurred $2.61 USD (Zen cost, recorded in `runs/FP-011/metrics.json`). No cost data recorded for DeepSeek executions.

8. **Canonical schema update behavior differed.** DeepSeek updated `src/db/schema.sql` in FP-011 and FP-012. Qwen updated it only in FP-012. FP-011 comparison cited this as a factor.

### Inferred Patterns

1. **Schema integration discipline.** DeepSeek consistently updated `src/db/schema.sql` alongside migrations (FP-011, FP-012). Qwen did so only after correction in FP-012. This is an inference from comparison notes; it is not a global property of either model.

2. **Vocabulary fidelity.** DeepSeek matched packet vocabulary directly in both FP-011 (validation_state/admission_state) and FP-012 (classification/comparison terminology). Qwen introduced alternative naming in FP-011 (validation_outcome/admission_outcome). This inference is limited to the two packets where naming was material.

3. **Correction surface area.** Qwen required more extensive post-audit changes in FP-012 (added 4 explicit FK columns, model_identity, 2 correction tables). DeepSeek's FP-012 correction was limited to 2 lines of defect carry-forward logic.

### Unsupported Speculation (explicitly not presented as evidence)

- Statements about which model is "globally better"
- Claims that one model should always be used
- Claims that one provider is preferred
- Cost-efficiency rankings
- Predictions about future packet performance
- Any ranking beyond per-packet comparison outcomes

## Model Behavior Observations

Observations are evidence-bound and limited to the reviewed packets. Confidence levels are described per observation.

| # | Observation | Packets | Models | Evidence basis | Direct/Inferred | Confidence |
|---|-------------|---------|--------|---------------|-----------------|------------|
| 1 | Both models produced accepted implementations for all three packets | FP-010, FP-011, FP-012 | DeepSeek, Qwen | 6 primary cross-model audit verdicts (5 ACCEPTED, 1 ACCEPTED_WITH_NOTES); 1 post-fix audit confirming resolution; 7 total audit artifacts | Direct | High |
| 2 | Both models introduced errors requiring correction before audit acceptance | FP-010, FP-011, FP-012 | DeepSeek, Qwen | metrics.json fix_attempts fields, correction sections in executor results | Direct | High |
| 3 | DeepSeek used schema-bound relational design (FKs, canonical schema updates) in FP-011 and FP-012 | FP-011, FP-012 | DeepSeek | Schema update evidence in metrics, audit notes on relational design | Direct | High |
| 4 | Qwen used alternative naming conventions distinct from packet vocabulary in FP-011 | FP-011 | Qwen | validation_outcome/admission_outcome naming vs packet's validation_state/admission_state | Direct | High |
| 5 | Qwen wrote larger test suites in FP-011 and FP-012 | FP-011, FP-012 | Qwen | Test counts: FP-011 (57 vs 40), FP-012 (107 vs ~70) | Direct | High |
| 6 | Qwen produced a design gap in FP-012 where getLatest* functions do not merge correction data | FP-012 | Qwen | Audit note 1 from audit-deepseek-by-qwen.md | Direct | High |
| 7 | DeepSeek produced a defect carry-forward bug in FP-012 comparison correction | FP-012 | DeepSeek | Audit note from audit-qwen-by-deepseek.md, postfix audit | Direct | High |
| 8 | Qwen required more extensive post-audit restructuring in FP-012 | FP-012 | Qwen | Comparison to DeepSeek's correction: Qwen added 2 migrations, 4 tables, 8 FK columns vs DeepSeek's 1 migration, 2 tables | Inferred | Medium |
| 9 | DeepSeek showed stronger packet vocabulary fidelity | FP-011 | DeepSeek | Direct use of validation_state/admission_state vs outcome naming | Inferred | Medium |
| 10 | Both models showed self-correction capability before commit | FP-010, FP-011 | DeepSeek, Qwen | Truthy-check bug fixed before commit in FP-010; admission/validation conflation caught before commit in FP-011 | Direct | High |

## Limitations

1. **Packet count.** Only 3 packets were reviewed (FP-010, FP-011, FP-012). No inference generalizes beyond these packets.

2. **Task type range.** All three packets were PERSISTENCE-type tasks (schema, validation/admission, classification/comparison). No CLI, BUGFIX, REFACTOR, ARCHITECTURE, or EVALUATION tasks were observed.

3. **Cost data asymmetry.** Cost was recorded for only one model in one packet (Qwen FP-011: $2.61). No cost comparison is possible.

4. **Audit asymmetry.** Each model was audited by the other model. Audit quality depends on the auditor model and the audit instructions; different auditors might produce different findings.

5. **No reproduction.** No evidence records were independently reproduced. All evidence is self-reported with cross-model verification through audit.

6. **Selection basis variance.** Each packet used a different selection basis. No basis was applied consistently across packets, so no cross-packet selection pattern can be observed.

7. **Correction classification ambiguity.** Corrections were classified by the models themselves or by auditors. Some corrections may be equivalently classified as design choices under different standards.

8. **Evidence state.** All evidence records carry trust_tier of TIER_0_UNTRUSTED or TIER_1_SELF_REPORTED. No evidence was admitted through FP-009/FP-011 admission pathways before this review was written.

## Non-Decisions

This review explicitly does not:

1. **Create model rankings.** Comparison outcomes (QWEN_SELECTED, DEEPSEEK_SELECTED) apply only to their respective packets.

2. **Create routing policy.** No observation implies that any model should be automatically selected for any future packet.

3. **Create cost optimization rules.** The single cost data point ($2.61 for Qwen FP-011) is insufficient for cost-based decisions.

4. **Create provider recommendations.** No provider comparison was performed. Both models execute through the same opencode CLI.

5. **Create leaderboards.** No aggregate scoring, ranking, or leaderboard data exists in this review.

6. **Create automatic model selection.** Selection was performed by human decision through the comparison protocol, not by automated logic.

7. **Change workflow orchestration.** No changes to packet execution policy, model dispatch, or workflow order are implied.

8. **Create dashboard or report behavior.** This is a static evidence document, not a reporting system.

## Recommended Next Questions

Based on evidence reviewed, the following questions may guide future investigation:

1. **Correction classification:** What qualifies as a correction versus a design refinement? FP-010 truthy-check fix was clearly a bug; FP-012 Qwen's separate correction tables is a design choice. ForgePilot needs a taxonomy of correction types.

2. **Vocabulary fidelity standards:** Should ForgePilot define a policy for when event table columns must match packet vocabulary versus when alternative naming is acceptable? FP-011 Qwen's outcome naming was accepted but became a selection factor.

3. **Canonical schema maintenance:** Should packets that add tables be required to update `src/db/schema.sql`? Two of three comparisons cited schema update behavior.

4. **Correction surface area as a quality signal:** Should the number of files, migrations, or lines changed in corrections be recorded systematically? FP-012 showed asymmetric correction surface area.

5. **Evidence admission for comparison observations:** FP-012 comparison records exist as observations. Should they be admitted as evidence before influencing future packet design decisions?

6. **Cost recording completeness:** Should all model executions record cost data, or is selective recording sufficient? Asymmetric cost data prevents cross-model cost observation.

7. **Reproduction testing:** Should any evidence from FP-010, FP-011, or FP-012 be reproduced by an independent executor before it influences protocol decisions?
