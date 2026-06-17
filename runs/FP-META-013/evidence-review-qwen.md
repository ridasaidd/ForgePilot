# FP-META-013 Evidence Review

## 1. Packet List Reviewed

- FP-010 — SQLite Evidence Persistence
- FP-011 — Metrics Validation and Admission Integration
- FP-012 — Task Classification and Model Comparison Protocol

Models compared: Qwen 3.7 Max, DeepSeek V4 Pro High

## 2. Per-Packet Execution Summaries

### FP-010

| Field | Qwen 3.7 Max | DeepSeek V4 Pro High |
|---|---|---|
| Branch | `eval/fp-010/qwen-3.7-max` | `eval/fp-010/deepseek-v4-pro-high` |
| Executor commit | `d73108c` | `6268129` |
| Files created | 3 (migration, src, tests) | 3 (migration, src, tests) |
| Files modified | 0 | 0 |
| Tests added | 24 | 28 |
| Total tests | 188 | 184 |
| Typecheck | PASS | PASS |
| Key design choice | `packet_id` as INTEGER FK to `packets(id)` | `packet_id` as TEXT |
| Self-correction | Truthy-check bug fix (1 issue, 2 tests added) | 3 corrections (state vocabulary + validation bugs) |

### FP-011

| Field | Qwen 3.7 Max | DeepSeek V4 Pro High |
|---|---|---|
| Branch | `eval/fp-011/qwen-3.7-max` | `eval/fp-011/deepseek-v4-pro-high` |
| Executor commit | `737d21f` | `65bfb2f` |
| Files created | 3 (migration, src, tests) | 3 (migration, src, tests) |
| Files modified | 0 | 1 (`src/db/schema.sql`) |
| Tests added | 57 | 40 |
| Total tests | 247 | 257 |
| Typecheck | PASS | PASS |
| Key design choice | `validation_outcome`/`admission_outcome` naming | `validation_state`/`admission_state` naming |
| Fix attempts | 2 | 1 |
| Observed cost | $2.61 USD | Not recorded |

### FP-012

| Field | Qwen 3.7 Max | DeepSeek V4 Pro High |
|---|---|---|
| Branch | `eval/fp-012/qwen-3.7-max` | `eval/fp-012/deepseek-v4-pro-high` |
| Executor commit | `4f1d955` | `ea1beb4` (final), `42613fc` (initial) |
| Files created | 5 (2 migrations, 2 src, tests) | 4 (1 migration, 2 src, tests) |
| Files modified | 1 (`src/db/schema.sql`) | 0 (initially), then `schema.sql` in corrections |
| Tests added | 107 | 70+ |
| Total tests | 375 | 344 |
| Typecheck | PASS | PASS |
| Key design choice | JSON-array-centered, separate correction tables, second migration | Explicit relational columns, self-referencing corrections |
| Post-audit correction | None | 1 (defect carry-forward fix) |

## 3. Per-Packet Audit Summaries

### FP-010

| Auditor | Executor | Verdict | Key Findings |
|---|---|---|---|
| DeepSeek V4 Pro High | Qwen 3.7 Max | ACCEPTED | All 10 AC satisfied, schema design correct, state axes preserved, no scope violations |
| Qwen 3.7 Max | DeepSeek V4 Pro High | ACCEPTED | All 10 AC satisfied, dual enforcement (TypeScript + SQLite), comprehensive validation, no scope violations |

### FP-011

| Auditor | Executor | Verdict | Key Findings |
|---|---|---|---|
| DeepSeek V4 Pro High | Qwen 3.7 Max | ACCEPTED | All 13 critical checks pass, 17 AC met, append-only behavior verified, axis independence confirmed |
| Qwen 3.7 Max | DeepSeek V4 Pro High | ACCEPTED | All 17 AC satisfied, append-only event tables, state axes independent, 80-combination matrix tested |

### FP-012

| Auditor | Executor | Verdict | Key Findings |
|---|---|---|---|
| DeepSeek V4 Pro High | Qwen 3.7 Max | ACCEPTED_WITH_NOTES | All 19 AC pass, Note 1: `getLatest*` functions do not merge correction data (design gap, not AC violation) |
| Qwen 3.7 Max | DeepSeek V4 Pro High | ACCEPTED_WITH_NOTES | All 19 AC pass, Note 1: minor defect carry-forward inconsistency in corrections |
| Qwen 3.7 Max (post-fix) | DeepSeek V4 Pro High | ACCEPTED | Defect carry-forward corrected, regression test added, 344/344 tests pass, no scope expansion |

## 4. Per-Packet Correction Summaries

### FP-010

**Qwen corrections (1):**
- Truthy-check validation bug: `if (params.trust_tier)` changed to `if (params.trust_tier !== undefined)` for all three state axes. 2 tests added. Self-discovered during implementation.

**DeepSeek corrections (3):**
1. `validation_state` incorrectly allowed `NOT_EVALUATED` and used it as default. Removed `NOT_EVALUATED` from CHECK; default changed to `INCOMPLETE`.
2. `trust_tier` incorrectly allowed empty string `''` and used it as default. Removed `''` from CHECK; default changed to `TIER_0_UNTRUSTED`.
3. TypeScript validation skipped empty string values due to truthy check. Changed `if (params.x)` to `if (params.x !== undefined)`.

### FP-011

**Qwen corrections (2 fix attempts):**
- Required cleanup for dead code and event naming documentation.
- Used `validation_outcome`/`admission_outcome` naming instead of packet's direct `validation_state`/`admission_state` vocabulary.

**DeepSeek corrections (1 fix attempt):**
- Initial admission evaluation returned admission outcomes in a `validation_state` field. Corrected by separating `ValidationResult` and `AdmissionEvaluationResult` types.

### FP-012

**Qwen corrections (larger correction pass):**
- Initial implementation used JSON-array-centered design with weaker relational guarantees.
- Correction added: explicit execution/evidence/model columns, `model_identity` column, correction tables, second migration (`009_fp012_correction.sql`), schema.sql integration.
- Final design retained weaker correction-derivation model (`getLatest*` returns event rows, not effective corrected summaries).

**DeepSeek corrections (1 narrow post-audit fix):**
- `recordModelComparisonCorrection` did not carry forward `model_a_defects` and `model_b_defects` when correction params omitted them, defaulting to `[]` instead of preserving previous event values.
- Fix: 2 lines changed in `src/db/model-comparison.ts`, 1 regression test added.
- Post-fix audit: ACCEPTED.

## 5. Observed Behavior Patterns

### Pattern 1: Schema Integration Quality Was Associated With Selection

Across all three packets, the selected implementation was the one that more closely integrated with ForgePilot's existing SQLite relational model. This is an inferred pattern supported by three comparison outcomes.

**Confidence:** Medium (3 data points, all persistence tasks)

### Pattern 2: Correction Profiles Differ

- DeepSeek: More corrections on simpler tasks (FP-010: 3 issues), fewer on complex tasks (FP-011: 1, FP-012: 1 narrow fix).
- Qwen: Fewer corrections on simpler tasks (FP-010: 1 self-fix), more on complex tasks (FP-011: 2, FP-012: large correction pass).

**Confidence:** Low-Medium (3 data points, correction circumstances differ)

### Pattern 3: Test Count Does Not Predict Selection

Higher test counts did not correlate with selection in any of the three packets. The comparison artifacts cited design quality, vocabulary alignment, and schema integration as selection bases.

**Confidence:** High (directly recorded evidence across 3 packets)

### Pattern 4: Both Models Maintain Scope Discipline

Neither model introduced out-of-scope behavior in any packet. All audits confirmed absence of forbidden features.

**Confidence:** High (directly recorded evidence across 6 audits)

### Pattern 5: Both Models Achieve Eventual Acceptance

Both models reached accepted audit status on all three packets. No implementation was rejected.

**Confidence:** High (directly recorded evidence)

## 6. Evidence Limitations

1. **Sample size:** 3 packets, 2 models, 1 execution per model per packet.
2. **Task type:** All 3 packets are schema-bound persistence tasks. No coverage of CLI, refactoring, bugfix, or documentation-only tasks in this review.
3. **Cost data:** Only 1 explicit cost observation recorded ($2.61 for Qwen on FP-011). Insufficient for cost-effort analysis.
4. **No repeated executions:** Cannot measure consistency or variance within a model.
5. **Cross-model audit:** Each model audited the other. Audit interpretation may reflect auditor model biases.
6. **Correction context:** Corrections occurred under different conditions (self-discovered, audit-identified, pre-commit, post-audit). Direct comparison of correction burden is limited.
7. **Eval-comparison packets not conflated:** FP-META-010, FP-META-011, FP-META-012 covered documentation/standards tasks and are separate evidence from FP-010/011/012.

## 7. Final Conclusion

Across FP-010, FP-011, and FP-012, both Qwen 3.7 Max and DeepSeek V4 Pro High produced accepted implementations. Selection alternated: Qwen was selected for FP-010 (schema integration), DeepSeek was selected for FP-011 (vocabulary alignment) and FP-012 (protocol alignment).

Both models demonstrated strong scope discipline — neither introduced routing, ranking, leaderboards, dashboards, reports, cost optimization, or other forbidden behavior in any packet.

A consistent factor associated with selection across all three packets was the degree of alignment with ForgePilot's existing relational schema design and packet vocabulary. In each case, the model that more closely matched the existing architecture and packet terminology was the one selected, as stated in the comparison artifacts.

Correction patterns differed: DeepSeek required more corrections on the simpler persistence task (FP-010) but fewer on the more complex protocol tasks (FP-011, FP-012). Qwen required fewer corrections on FP-010 but more substantial corrections on FP-012.

These observations are limited to the three reviewed packets and must not be extrapolated as global model rankings, routing policies, or provider preferences.
