# Model Execution Evidence Review

## 1. Purpose

This document consolidates model execution evidence from ForgePilot packets FP-010, FP-011, and FP-012. It converts observed model behavior into structured project knowledge.

This review answers:

> What did ForgePilot learn from recent model execution evidence?

It does not answer:

> Which model is globally better?

This review is descriptive and evidence-bound. It does not create routing policy, ranking policy, or provider preference.

## 2. Scope

Packets reviewed:

- FP-010 — SQLite Evidence Persistence
- FP-011 — Metrics Validation and Admission Integration
- FP-012 — Task Classification and Model Comparison Protocol

Models compared within each packet:

- Qwen 3.7 Max
- DeepSeek V4 Pro High

This review covers packet-level execution summaries, audit summaries, correction summaries, observed model behavior patterns, implementation fidelity observations, scope-discipline observations, evidence-model alignment observations, and limitations of the evidence.

This review does not add, change, or implement model routing, automatic model selection, global model ranking, leaderboards, dashboards, reports, provider recommendation, cost optimization logic, local model benchmarking, workflow orchestration changes, packet execution policy changes, SQLite schema changes, migrations, CLI behavior, aggregation logic, admission logic, validation logic, or telemetry ingestion logic.

## 3. Evidence Sources Reviewed

The following repository evidence was inspected:

### Directly Recorded Evidence

- `runs/FP-010/executor-result.md`, `executor-result-qwen.md`, `executor-result-deepseek.md`
- `runs/FP-010/comparison-result.md`
- `runs/FP-010/audit-deepseek-by-qwen.md`, `audit-qwen-by-deepseek.md`
- `runs/FP-010/metrics.json`, `metrics-qwen.json`, `metrics-deepseek.json`
- `runs/FP-010/verification.txt`, `verification-qwen.txt`, `verification-deepseek.txt`
- `runs/FP-011/executor-result.md`, `executor-result-qwen.md`, `executor-result-deepseek.md`
- `runs/FP-011/comparison-result.md`
- `runs/FP-011/audit-deepseek-by-qwen.md`, `audit-qwen-by-deepseek.md`
- `runs/FP-011/metrics.json`, `metrics-qwen.json`, `metrics-deepseek.json`
- `runs/FP-011/verification.txt`, `verification-qwen.txt`, `verification-deepseek.txt`
- `runs/FP-012/executor-result.md`, `executor-result-qwen.md`, `executor-result-deepseek.md`
- `runs/FP-012/comparison-result.md`
- `runs/FP-012/audit-deepseek-by-qwen.md`, `audit-qwen-by-deepseek.md`
- `runs/FP-012/postfix-audit-qwen-by-deepseek.md`
- `runs/FP-012/metrics.json`, `metrics-qwen.json`, `metrics-deepseek.json`
- `runs/FP-012/verification.txt`, `verification-qwen.txt`, `verification-deepseek.txt`
- `eval-comparisons/FP-META-010/final-comparison.md`
- `eval-comparisons/FP-META-011/final-comparison.md`
- `eval-comparisons/FP-META-012/final-comparison.md`
- `metrics/packet-log.csv`
- Packet definitions: `packets/FP-010.md`, `packets/FP-011.md`, `packets/FP-012.md`

### Audit Conclusions

Audit verdicts recorded by cross-model auditors for each packet execution.

### Comparison Conclusions

Comparison outcomes recorded in `comparison-result.md` for each packet.

### Inferred Patterns

Cross-packet behavioral patterns derived from comparing per-packet evidence.

### Unsupported Speculation

None presented. All observations are evidence-bound.

## 4. Packet-by-Packet Summary

### FP-010 — SQLite Evidence Persistence

**Task:** Implement minimal SQLite persistence layer for evidence records.

**Models:** Qwen 3.7 Max vs DeepSeek V4 Pro High

**Audit outcomes:**
- Qwen audited by DeepSeek: ACCEPTED
- DeepSeek audited by Qwen: ACCEPTED

**Comparison outcome:** QWEN_SELECTED

**Decision basis:** Schema integration quality. Qwen modeled `packet_id` as an integer foreign key to the existing `packets(id)` table, which was more relationally consistent with ForgePilot's SQLite design.

**Verification:**
- Qwen: 188 tests passed, 24 FP-010 tests, typecheck passed
- DeepSeek: 184 tests passed, 28 FP-010 tests, typecheck passed

**Corrections:**
- Qwen: Self-corrected 1 truthy-check validation bug (`if (params.trust_tier)` to `if (params.trust_tier !== undefined)`), added 2 tests.
- DeepSeek: Required 3 corrections — (1) `validation_state` initially allowed `NOT_EVALUATED` and used it as default, (2) `trust_tier` initially allowed empty string and used it as default, (3) TypeScript validation used truthy check instead of `!== undefined`.

**Scope discipline:** Both implementations preserved all FP-010 scope boundaries. Neither added routing, ranking, cost optimization, task classification, admission policy logic, dashboards, reports, or leaderboards.

### FP-011 — Metrics Validation and Admission Integration

**Task:** Implement validation and admission integration for FP-010 persisted evidence records.

**Models:** Qwen 3.7 Max vs DeepSeek V4 Pro High

**Audit outcomes:**
- DeepSeek audited by Qwen: ACCEPTED
- Qwen audited by DeepSeek: ACCEPTED

**Comparison outcome:** DEEPSEEK_SELECTED

**Decision basis:** Packet vocabulary and schema alignment. DeepSeek used `validation_state` and `admission_state` for event results, directly matching the packet's state-axis vocabulary. DeepSeek also updated `src/db/schema.sql`, keeping the canonical schema aligned.

**Verification:**
- DeepSeek: 257 tests passed, 40 FP-011 tests, typecheck passed
- Qwen: 247 tests passed, 57 FP-011 tests, typecheck passed

**Corrections:**
- DeepSeek: 1 fix attempt — initial implementation incorrectly returned admission outcomes in a `validation_state` field. Corrected before commit by separating `ValidationResult` and `AdmissionEvaluationResult` types.
- Qwen: 2 fix attempts — required cleanup for dead code and event naming documentation. Used `validation_outcome` / `admission_outcome` naming instead of the packet's direct vocabulary. Observed cost: $2.61 USD.

**Scope discipline:** Both implementations preserved all FP-011 scope boundaries. Neither added routing, ranking, task classification, leaderboards, dashboards, reports, cost optimization, model recommendation, or model comparison matrices.

### FP-012 — Task Classification and Model Comparison Protocol

**Task:** Define and implement a protocol for classifying packets and comparing model executions.

**Models:** Qwen 3.7 Max vs DeepSeek V4 Pro High

**Audit outcomes:**
- DeepSeek audited by Qwen: ACCEPTED_WITH_NOTES (initial), ACCEPTED (post-fix)
- Qwen audited by DeepSeek: ACCEPTED_WITH_NOTES

**Comparison outcome:** DEEPSEEK_SELECTED

**Decision basis:** Evidence-first and schema-bound requirements alignment. DeepSeek modeled task classification and model comparison as explicit append-only observation records with relational structure, canonical schema integration, comparison references, correction handling, and preservation of compared identifiers.

**Verification:**
- DeepSeek: 344 tests passed, typecheck passed
- Qwen: 375 tests passed, 107 FP-012 tests, typecheck passed

**Corrections:**
- DeepSeek: 1 post-audit correction — `recordModelComparisonCorrection` initially failed to carry forward `model_a_defects` and `model_b_defects` when defect fields were omitted. Narrow fix, covered by regression test, accepted in post-fix audit.
- Qwen: Larger correction pass required — initial implementation used a looser JSON-array-centered design with weaker relational guarantees. Correction added explicit execution, evidence, and model columns, `model_identity`, correction tables, and schema integration (second migration `009_fp012_correction.sql`). Final design retained a weaker correction-derivation model where `getLatest*` functions return event rows rather than effective corrected summaries.

**Scope discipline:** Both implementations preserved all FP-012 scope boundaries. Neither added routing, ranking, recommendation, dashboard, report, cost optimization, or benchmarking behavior.

## 5. Cross-Packet Observations

### 5.1 Both Models Achieved Acceptance on All Three Packets

Across FP-010, FP-011, and FP-012, both Qwen and DeepSeek reached accepted audit status. Neither model produced a rejected implementation. This is directly recorded evidence.

### 5.2 Selection Alternated

- FP-010: Qwen selected (schema integration quality)
- FP-011: DeepSeek selected (packet vocabulary and schema alignment)
- FP-012: DeepSeek selected (evidence-first and schema-bound alignment)

Selection was not one-sided. This is directly recorded evidence from comparison artifacts.

### 5.3 Correction Patterns Differed

- DeepSeek required more corrections on FP-010 (3 issues) but fewer on FP-011 (1 issue) and FP-012 (1 narrow post-audit fix).
- Qwen required fewer corrections on FP-010 (1 self-correction) but more on FP-011 (2 fix attempts) and FP-012 (larger correction pass with second migration).

This is directly recorded evidence from executor-result and metrics artifacts.

### 5.4 Schema-Bound Tasks Favored Relational Integration

In all three packets, the selected implementation was the one that more closely integrated with ForgePilot's existing SQLite relational model:
- FP-010: Qwen's integer FK to `packets(id)` was selected over DeepSeek's text `packet_id`.
- FP-011: DeepSeek's direct `validation_state`/`admission_state` vocabulary and canonical schema update was selected over Qwen's `validation_outcome`/`admission_outcome` naming.
- FP-012: DeepSeek's explicit relational columns and canonical schema integration was selected over Qwen's JSON-array-centered design that required a second migration.

This is an inferred pattern from comparison outcomes.

### 5.5 Test Count Did Not Predict Selection

Higher test counts did not correlate with selection:
- FP-010: DeepSeek had more FP-010 tests (28 vs 24) but Qwen was selected.
- FP-011: Qwen had more FP-011 tests (57 vs 40) but DeepSeek was selected.
- FP-012: Qwen had more total tests (375 vs 344) but DeepSeek was selected.

This is directly recorded evidence.

### 5.6 Scope Discipline Was Consistent

Neither model violated scope boundaries in any of the three packets. All audits confirmed absence of routing, ranking, leaderboards, dashboards, reports, cost optimization, and other forbidden behavior. This is directly recorded evidence from audit artifacts.

### 5.7 First-Pass Alignment Varied by Task Type

- FP-010 (persistence): Qwen showed stronger first-pass schema alignment.
- FP-011 (validation/admission): DeepSeek showed stronger first-pass vocabulary alignment but had a type-level defect.
- FP-012 (classification/comparison protocol): DeepSeek showed stronger first-pass protocol alignment with a narrow post-audit defect.

This is an inferred pattern from correction and audit evidence.

## 6. Model Behavior Observations

### Qwen 3.7 Max

| Observation | Evidence Basis | Confidence | Type |
|---|---|---|---|
| Stronger relational schema design on FP-010 | `comparison-result.md` for FP-010 | High | Directly observed |
| Self-corrected truthy-check bug on FP-010 | `executor-result.md`, `metrics-qwen.json` | High | Directly observed |
| Used independent naming conventions on FP-011 (`validation_outcome` vs `validation_state`) | `executor-result-qwen.md`, `comparison-result.md` for FP-011 | High | Directly observed |
| Required larger correction pass on FP-012 with second migration | `comparison-result.md`, `audit-deepseek-by-qwen.md` for FP-012 | High | Directly observed |
| Produced more tests per packet on FP-011 and FP-012 | `metrics-qwen.json` for FP-011, FP-012 | High | Directly observed |
| `getLatest*` functions did not merge corrections on FP-012 | `audit-deepseek-by-qwen.md` for FP-012 (Note 1) | High | Directly observed |
| Observed cost of $2.61 on FP-011 | `metrics.json` for FP-011 | High | Directly recorded |

### DeepSeek V4 Pro High

| Observation | Evidence Basis | Confidence | Type |
|---|---|---|---|
| Required 3 corrections on FP-010 (state vocabulary and validation bugs) | `metrics-deepseek.json`, `verification-deepseek.txt` for FP-010 | High | Directly observed |
| Stronger packet vocabulary alignment on FP-011 | `comparison-result.md` for FP-011 | High | Directly observed |
| Updated canonical `schema.sql` on FP-011 | `executor-result-deepseek.md` for FP-011 | High | Directly observed |
| Initial type-level defect on FP-011 (admission outcomes in validation_state field) | `metrics.json` for FP-011, `comparison-result.md` | High | Directly observed |
| Stronger first-pass protocol alignment on FP-012 | `comparison-result.md` for FP-012 | High | Directly observed |
| Narrow post-audit correction on FP-012 (defect carry-forward) | `postfix-audit-qwen-by-deepseek.md` | High | Directly observed |
| Used text `packet_id` instead of FK on FP-010 | `comparison-result.md` for FP-010 | High | Directly observed |

## 7. Limitations

1. **Three packets only.** This review covers FP-010, FP-011, and FP-012. Observed patterns may not generalize to other packet types or task domains.

2. **Two models only.** Only Qwen 3.7 Max and DeepSeek V4 Pro High are compared. No other models are represented in this evidence set.

3. **Persistence-heavy tasks.** All three packets are schema-bound persistence tasks. The evidence does not cover CLI, documentation-only, refactoring, bugfix, or telemetry tasks at the same depth.

4. **Single execution per model per packet.** Each model executed each packet once (with corrections). No repeated executions exist to measure consistency or variance.

5. **Cost data is sparse.** Only FP-011 Qwen has an explicitly recorded cost observation ($2.61 USD). No other cost or token data is available.

6. **Audit is cross-model.** Each model audited the other. Audit quality may be influenced by the auditor model's own interpretation of packet requirements.

7. **Correction circumstances differ.** Corrections were applied under different conditions (self-discovered vs audit-identified, pre-commit vs post-audit). Direct comparison of correction burden is limited by these contextual differences.

8. **Eval-comparison packets (FP-META-010, FP-META-011, FP-META-012) are separate.** These meta-packets covered documentation and standards tasks, not the implementation packets reviewed here. Their evidence is noted but not conflated with FP-010/011/012 evidence.

## 8. Non-Decisions

This review explicitly does not establish:

- A global model ranking
- A routing policy
- A provider recommendation
- A cost optimization rule
- An automatic model-selection signal
- A leaderboard result
- A preference for one model across all task types

Any observed pattern is limited to the reviewed packets (FP-010, FP-011, FP-012) and must not be extrapolated beyond the evidence.

## 9. Recommended Next Questions

1. Do the observed correction patterns hold for non-persistence task types (CLI, refactoring, bugfix)?
2. Is the relational schema alignment pattern consistent when packets require more complex multi-table designs?
3. Can correction burden be measured more precisely with token-level or cost-level tracking across both models?
4. Does first-pass alignment improve for either model as the project schema grows more complex?
5. Are there task characteristics that predict which model will require fewer corrections?
6. How does audit quality vary when the auditor model is evaluating an implementation approach it did not choose?
7. Should ForgePilot record more structured cost and token data to enable future evidence-bound cost-effort observations?
