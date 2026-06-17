# FP-META-013 Evidence Review

## Packet List Reviewed

- FP-010 — SQLite Evidence Persistence
- FP-011 — Metrics Validation and Admission Integration
- FP-012 — Task Classification and Model Comparison Protocol

## Per-Packet Execution Summaries

### FP-010 — SQLite Evidence Persistence

**DeepSeek V4 Pro High:**
- Branch: `eval/fp-010/deepseek-v4-pro-high`
- Executor commit: `6268129`
- Implementation: 3 files created. `evidence_records` table with text `packet_id`, globally unique `run_id`. 28 FP-010 tests.
- Verification: Typecheck PASS, 184/184 tests PASS.
- Corrections: 3 (NOT_EVALUATED default for validation_state, empty string default for trust_tier, truthy-check validation bug).
- Audit verdict: ACCEPTED (by Qwen 3.7 Max).

**Qwen 3.7 Max:**
- Branch: `eval/fp-010/qwen-3.7-max`
- Executor commit: `d73108c`
- Implementation: 3 files created. `evidence_records` table with integer FK `packet_id` referencing `packets(id)`, per-packet unique `run_id`. 24 FP-010 tests.
- Verification: Typecheck PASS, 188/188 tests PASS.
- Corrections: 1 (truthy-check validation bug same as DeepSeek).
- Audit verdict: ACCEPTED (by DeepSeek V4 Pro High).

### FP-011 — Metrics Validation and Admission Integration

**DeepSeek V4 Pro High:**
- Branch: `eval/fp-011/deepseek-v4-pro-high`
- Executor commit: `65bfb2f`
- Implementation: 3 files created, `src/db/schema.sql` modified. Append-only `evidence_record_validation_events` and `evidence_record_admission_events` tables using `validation_state`/`admission_state` vocabulary. 40 FP-011 tests.
- Verification: Typecheck PASS, 257/257 tests PASS.
- Corrections: 1 (admission evaluation initially returned outcomes in validation_state; caught before commit).
- Audit verdict: ACCEPTED (by Qwen 3.7 Max).

**Qwen 3.7 Max:**
- Branch: `eval/fp-011/qwen-3.7-max`
- Executor commit: `737d21f`
- Implementation: 3 files created, no existing files modified. Append-only event tables using `validation_outcome`/`admission_outcome` naming. 57 FP-011 tests. Observed cost: $2.61 USD.
- Verification: Typecheck PASS, 247/247 tests PASS.
- Corrections: 2 (dead code cleanup, event naming documentation).
- Audit verdict: ACCEPTED (by DeepSeek V4 Pro High).

### FP-012 — Task Classification and Model Comparison Protocol

**DeepSeek V4 Pro High:**
- Branch: `eval/fp-012/deepseek-v4-pro-high`
- Initial executor commit: `42613fc`
- Post-fix commit: `ea1beb4`
- Implementation: 4 files created. Single migration with 2 append-only tables (`fp012_task_classification_events`, `fp012_model_comparison_events`) using self-referencing correction rows.
- Verification: Typecheck PASS, 344/344 tests PASS (post-fix).
- Corrections: 1 post-audit (comparison correction did not carry forward defect fields).
- Initial audit: ACCEPTED_WITH_NOTES (by Qwen 3.7 Max).
- Post-fix audit: ACCEPTED (by Qwen 3.7 Max).

**Qwen 3.7 Max:**
- Branch: `eval/fp-012/qwen-3.7-max`
- Executor commit: `4f1d955`
- Implementation: 5 files created, `src/db/schema.sql` modified. Two migrations creating 4 tables (events + corrections). 107 FP-012 tests.
- Verification: Typecheck PASS, 375/375 tests PASS.
- Corrections: 2 (extensive: added explicit FK columns, model_identity, correction tables in migration 009).
- Audit verdict: ACCEPTED_WITH_NOTES (by DeepSeek V4 Pro). Design gap: getLatest* functions return latest event row, not merged correction data.

## Per-Packet Audit Summaries

| Packet | Auditor | Executor | Verdict |
|--------|---------|----------|---------|
| FP-010 | Qwen 3.7 Max | DeepSeek V4 Pro High | ACCEPTED |
| FP-010 | DeepSeek V4 Pro High | Qwen 3.7 Max | ACCEPTED |
| FP-011 | Qwen 3.7 Max | DeepSeek V4 Pro High | ACCEPTED |
| FP-011 | DeepSeek V4 Pro High | Qwen 3.7 Max | ACCEPTED |
| FP-012 (initial) | Qwen 3.7 Max | DeepSeek V4 Pro High | ACCEPTED_WITH_NOTES |
| FP-012 (post-fix) | Qwen 3.7 Max | DeepSeek V4 Pro High | ACCEPTED |
| FP-012 | DeepSeek V4 Pro High | Qwen 3.7 Max | ACCEPTED_WITH_NOTES |

All 7 audit artifacts (6 primary cross-model audits plus 1 post-fix audit) returned accepted outcomes. No REJECTED verdicts were recorded. Across the 6 primary audits, 5 returned ACCEPTED and 1 returned ACCEPTED_WITH_NOTES (FP-012 Qwen).

## Per-Packet Correction Summaries

| Packet | Model | Corrections | Details |
|--------|-------|-------------|---------|
| FP-010 | DeepSeek V4 Pro High | 3 | validation_state default, trust_tier default, truthy-check bug |
| FP-010 | Qwen 3.7 Max | 1 | Same truthy-check bug |
| FP-011 | DeepSeek V4 Pro High | 1 | Admission/validation result type conflation (pre-commit) |
| FP-011 | Qwen 3.7 Max | 2 | Dead code cleanup, event naming documentation |
| FP-012 | DeepSeek V4 Pro High | 1 (post-audit) | Defect carry-forward in comparison correction |
| FP-012 | Qwen 3.7 Max | 2 (extensive) | Added explicit FK columns, model_identity, correction tables (migration 009); getLatest design gap noted |

Both models required corrections in all three packets. Neither model achieved first-pass success without any correction.

## Observed Behavior Patterns

### Directly Recorded

1. **Universal acceptance.** Both models were accepted by audit in all packets. Across the 6 primary cross-model audits (one per model per packet), 5 returned ACCEPTED and 1 returned ACCEPTED_WITH_NOTES (FP-012 Qwen). The FP-012 DeepSeek post-fix audit (7th artifact) confirmed resolution of the noted defect.

2. **Universal correction need.** Both models introduced errors in all 3 packets that required correction before or after audit.

3. **Scope preservation.** Both models preserved out-of-scope boundaries in all 3 packets. No routing, ranking, cost optimization, leaderboards, dashboards, reports, or automatic selection was found by any audit.

4. **State axis preservation.** Both models maintained independent trust_tier, validation_state, and admission_state axes across all persistence and evaluation implementations.

5. **Design divergence in FP-011.** DeepSeek matched packet vocabulary directly; Qwen used alternative outcome naming.

6. **Design divergence in FP-012.** DeepSeek used self-referencing correction rows in the event table; Qwen used separate correction tables. DeepSeek's getLatest returns event rows; Qwen's getLatest returns event rows without merging corrections.

### Inferred Patterns

1. **Schema integration tendency.** DeepSeek consistently updated `src/db/schema.sql` alongside migrations; Qwen updated it only in FP-012. This pattern is inferred from presence/absence of schema.sql updates across 3 packets.

2. **Correction surface area asymmetry in FP-012.** Qwen required more structural changes (4 tables, 2 migrations, 8 FK columns) compared to DeepSeek (2 tables, 1 migration). This inference compares correction scope within a single packet.

3. **Vocabulary fidelity tendency.** DeepSeek used packet vocabulary directly in both FP-011 and FP-012. Qwen chose alternative naming in FP-011. This inference is limited to 2 packets.

### Not Observed

- No model consistently produced zero errors across packets.
- No model consistently required fewer corrections across packets (counts vary by packet).
- No model consistently had higher test counts (alternated by packet).
- No model consistently used schema-bound design (both used FKs in FP-010 and FP-012; schema.sql update behavior diverged in FP-011).

## Evidence Limitations

1. **Three-packet sample.** This review covers only 3 packets. No conclusions generalize beyond FP-010, FP-011, and FP-012.

2. **Task type homogeneity.** All three packets were PERSISTENCE-type tasks involving SQLite schema, validation/admission logic, and classification/comparison protocols. Results may not extend to CLI, BUGFIX, REFACTOR, or ARCHITECTURE tasks.

3. **Single cost data point.** Cost was recorded only for Qwen FP-011 ($2.61). No cost analysis or comparison is possible.

4. **Cross-auditor model.** Each model audited the other. Auditor quality may interact with executor performance. No independent auditor was used.

5. **No reproduction.** All evidence is self-reported with cross-model audit. No evidence was independently reproduced.

6. **Admission state.** Evidence records for these packets have not been admitted through FP-011 admission pathways.

7. **Correction classification subjectivity.** Corrections were classified by models and auditors using different standards. Some "corrections" may be equivalently considered design refinements under different criteria.

## Final Conclusion

Based solely on evidence from FP-010, FP-011, and FP-012:

Both DeepSeek V4 Pro High and Qwen 3.7 Max produced accepted implementations for all three ForgePilot persistence packets. Neither model achieved error-free first-pass execution. Both models preserved scope boundaries and state-axis separation across all packets.

DeepSeek showed stronger schema-integration discipline (canonical schema updates in FP-011 and FP-012) and vocabulary fidelity (direct packet vocabulary in FP-011). Qwen showed stronger test volume (more tests in FP-011 and FP-012) but introduced alternative naming conventions and larger correction surface area in FP-012.

These observations apply only to FP-010, FP-011, and FP-012. They are not global model rankings, routing recommendations, or provider preferences. They are evidence records about specific packet executions, preserved for future reference.
