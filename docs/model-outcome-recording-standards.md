# Model Outcome Recording Standards

## Purpose

This document defines standards for recording model execution outcomes, correction events, audit outcomes, comparison outcomes, and routing-relevant performance signals.

These standards answer one question:

**How did the model perform on this classified packet?**

This document defines recording policy only. It does not define SQLite storage, database schemas, CLI commands, routing logic, model selection behavior, scoring algorithms, autonomous execution, dashboards, reports, aggregation behavior, or model outcome persistence implementation.

---

## Governing Principles

These standards are constrained by:

- **P01** — ForgePilot records observations, not narratives.
- **P02** — Trust cannot be retroactively created.
- **P03** — ForgePilot does not optimize for favorable outcomes.
- **P04** — Only admitted evidence may influence observatory outputs.
- **P05** — Do not build infrastructure for evidence that does not yet exist.
- **P06** — Classification follows observation.

---

## Core Model

Model outcome recording must distinguish six independent categories of outcome observation:

1. Execution completion
2. Verification result
3. Audit result
4. Correction history
5. Comparison outcome
6. Routing signal value

These categories must not be collapsed into one status field.

A model may complete execution but fail audit.
A model may pass tests but violate packet scope.
A model may be accepted after correction but not count as first-pass success.
A model may lose comparison while still producing an accepted result.
A model may provide useful signal without producing mergeable evidence.

Each category answers a distinct question:

- **Execution completion** — Did the model finish the execution attempt?
- **Verification result** — Did mechanical checks pass?
- **Audit result** — Did independent review accept the output?
- **Correction history** — How many corrections and of what type were required?
- **Comparison outcome** — How did this execution compare to another execution?
- **Routing signal value** — What does this outcome indicate for future routing?

No category may be inferred from another category.

---

## Outcome Axis Independence Rules

Outcome axes are independent. The following examples illustrate lawful combinations:

- An execution may be `COMPLETED` with verification `PASSED` but audit `REJECTED`.
- An execution may have `FAILED` verification yet still provide useful routing signal.
- A model may have `first_pass_success: FALSE` but final audit `ACCEPTED` after correction.
- A comparison `LOSS` does not mean the result was incorrect — it means another execution was preferred.
- A model may have `NONE` human intervention but `MAJOR_SCOPE_DRIFT` detected by audit.

Each axis must be recorded independently based on available evidence.

---

## Execution Result

### Definition

Execution Result describes whether the model completed the requested execution attempt. It answers: did the execution finish, and in what state?

Execution Result must not imply correctness. A completed execution may still be rejected. A failed execution may still provide useful diagnostic signal.

### Controlled Vocabulary

| Value | Description |
|---|---|
| `NOT_STARTED` | The executor has not yet begun execution. |
| `RUNNING` | The executor is currently executing the packet. |
| `COMPLETED` | The executor finished the execution attempt. The attempt may have produced output regardless of quality. |
| `FAILED` | The executor encountered an unrecoverable error and could not complete the attempt. |
| `ABORTED` | The execution was intentionally terminated before completion by the executor, operator, or environment. |

### Recording Rules

Execution Result must be recorded during the executor run phase.

Execution Result must not be inferred from audit result. A rejected execution may have completed. An accepted execution must have completed.

Execution Result must be recorded before verification result and audit result.

---

## Verification Result

### Definition

Verification Result describes mechanical checks run after execution. It answers: did automated verification pass?

Verification Result must not be treated as audit acceptance. Passing tests is not equivalent to acceptance.

### Controlled Vocabulary

| Value | Description |
|---|---|
| `NOT_RUN` | Verification has not been executed. |
| `PASSED` | All mechanical checks passed. |
| `FAILED` | One or more mechanical checks failed. |
| `PARTIAL` | Some checks passed, some could not be run, or results are mixed without clear pass/fail. |
| `BLOCKED` | Verification could not be executed due to environmental or prerequisite issues. |

### Verification Checks

Verification Result may include:

- typecheck result
- test result
- lint result
- migration idempotence result
- required file existence checks
- forbidden file modification checks
- artifact existence checks
- syntax or formatting checks

### Recording Rules

Verification Result must record command output or references to command output.

Verification Result must be recorded during the verification phase, after execution completion.

Verification Result must not be overridden by audit judgment. If verification reported `FAILED` but audit accepts anyway, both records must be preserved independently.

---

## Audit Result

### Definition

Audit Result describes independent review of the execution output against the packet. It answers: did independent review accept the output?

Audit Result must be independent from Execution Result and Verification Result.

### Controlled Vocabulary

| Value | Description |
|---|---|
| `NOT_AUDITED` | No audit has been performed. |
| `ACCEPTED` | The auditor determined the execution output satisfies the packet requirements. |
| `REJECTED` | The auditor determined the execution output does not satisfy the packet requirements. |
| `ACCEPTED_WITH_NOTES` | The auditor accepted the output but recorded non-blocking issues, observations, or recommendations. |
| `BLOCKED` | The audit could not be completed due to missing artifacts, execution failure, or prerequisite issues. |

### Required Audit Record Fields

Audit Result must include:

| Field | Description |
|---|---|
| auditor identity | The identifier of the auditor (human name, role, or model identifier). |
| auditor model or human actor | Whether the auditor was a model or a human. |
| audited commit or artifact reference | The commit hash or artifact path that was audited. |
| blocking issues | Issues that caused rejection (required when REJECTED). |
| non-blocking notes | Observations that did not cause rejection but are worth recording. |
| root cause assessment | The auditor's assessment of what caused any failure. |
| required fix packet | Reference to a fix packet if one was generated as a result of rejection. |

### Recording Rules

Audit Result must be recorded during the audit phase, after verification.

Audit Result must not be set by the executor model.

Audit Result must not be inferred from verification result.

---

## First-Pass Success

### Definition

First-Pass Success describes whether the execution was accepted without correction. It answers: was the first attempt good enough?

First-Pass Success must be recorded separately from final acceptance. A model accepted after correction must not be treated as first-pass success.

### Controlled Vocabulary

| Value | Description |
|---|---|
| `TRUE` | The execution was accepted on the first attempt with no correction required. |
| `FALSE` | One or more corrections were required before acceptance or the execution was rejected. |
| `UNKNOWN` | The result cannot be determined from available evidence. |
| `NOT_APPLICABLE` | First-pass success is not meaningful for this execution (e.g., aborted, not audited, research-only). |

### Conditions for TRUE

First-Pass Success is `TRUE` only when all of the following are satisfied:

- The execution completed.
- Verification passed or was not required.
- Audit accepted the result (or accepted with notes but no changes were required).
- No corrective execution was required.
- No packet-scope fix was required before acceptance.
- No human intervention changed the execution path or output.

### Recording Rules

First-Pass Success must be recorded during the audit phase by the auditor.

First-Pass Success must not be modified by later comparison outcomes.

First-Pass Success must not be inferred from final acceptance. An execution accepted after correction is `first_pass_success: FALSE`.

---

## Correction Count

### Definition

Correction Count records the number of required corrective cycles after the initial execution. It answers: how many times did this execution need to be fixed?

### Controlled Vocabulary

Correction Count is a non-negative integer or `UNKNOWN`.

A correction count of `0` means the execution was accepted without any required corrections.

### Counting Rules

Correction Count must include only corrections required to satisfy the packet.

Correction Count must not include:

- Unrelated manual edits.
- Formatting-only edits.
- Post-merge cleanup (unless those edits were required for acceptance).
- Optional improvements not required for acceptance.
- Corrections to the packet itself (these are packet corrections, not execution corrections).

### Source Distinctions

Correction Count source must be distinguished:

| Source | Description |
|---|---|
| Executor self-correction | The executor detected and fixed the issue without external request. |
| Auditor-requested correction | The auditor identified the issue and requested a fix. |
| Human-requested correction | A human operator identified the issue and requested a fix. |
| Process correction | A workflow phase detected or required the correction. |
| Packet correction | The packet was revised after execution began, requiring the executor to adjust (counted as a correction but source is PACKET). |

### Recording Rules

Correction Count must be recorded during the audit phase.

Correction Count must be append-only. If a later review discovers an additional required correction, it must be added as a correction observation rather than overwriting the original count.

Correction Count source must be recorded alongside the count.

---

## Correction Type

### Definition

Correction Type describes what kind of correction was required. It answers: what was wrong that needed fixing?

A single execution may have multiple correction types.

### Controlled Vocabulary

| Value | Description |
|---|---|
| `NONE` | No correction was required. |
| `SCOPE_CORRECTION` | The executor produced work outside authorized boundaries and needed to remove or constrain it. |
| `SEMANTIC_CORRECTION` | The executor misunderstood the packet's requirements, intent, or acceptance criteria. |
| `MECHANICAL_CORRECTION` | The executor made a mechanical error (syntax error, broken import, wrong file reference) that required fix. |
| `TEST_CORRECTION` | Tests failed or were missing and needed to be added, fixed, or rewritten. |
| `ARTIFACT_CORRECTION` | Required artifacts were missing, malformed, or in wrong locations. |
| `PACKET_CORRECTION` | The packet itself was revised, requiring the executor to adapt to changed requirements. |
| `PROCESS_CORRECTION` | The correction was due to process issues (wrong branch, wrong base commit, lifecycle phase error). |
| `HUMAN_OVERRIDE` | A human operator manually changed or repaired the executor's output. |
| `UNKNOWN` | The type of correction cannot be determined from available evidence. |

### Recording Rules

Correction Type must be append-only. New correction types may be added as additional corrections are discovered.

Correction Type must not be overwritten after later acceptance. If the execution was accepted after a `SCOPE_CORRECTION`, the scope correction must remain recorded.

Multiple correction types for the same execution are recorded as a list.

---

## Scope Discipline

### Definition

Scope Discipline describes whether the model stayed inside the packet's authorized boundaries. It answers: did the executor respect the constraints?

### Controlled Vocabulary

| Value | Description |
|---|---|
| `WITHIN_SCOPE` | The executor stayed within all authorized boundaries. No unauthorized changes detected. |
| `MINOR_SCOPE_DRIFT` | The executor made small unauthorized changes that did not affect correctness, compliance, or artifact integrity. Example: adding a helpful but unrequested comment, touching a file incidentally. |
| `MAJOR_SCOPE_DRIFT` | The executor made substantial unauthorized changes that introduced new behavior, modified unauthorized files, or changed architecture without permission. |
| `SCOPE_VIOLATION` | The executor deliberately or significantly violated explicit scope constraints in a way that affects correctness, compliance, or observatory trust. |
| `UNKNOWN` | Scope discipline cannot be determined from available evidence. |

### Evaluation Factors

Scope Discipline must consider:

- Unauthorized files changed.
- Unauthorized behavior added.
- Architectural changes added without permission.
- Extra CLI/schema/routing behavior added.
- Task expansion beyond packet intent.
- Changes to files explicitly listed as forbidden in the packet.

### Recording Rules

Scope Discipline must not be inferred only from file count.

A large change can be within scope if authorized by the packet.

A small change can be a scope violation if it touches a file explicitly forbidden or adds an unauthorized behavior to a small number of lines.

Scope Discipline must be evaluated during audit by comparing the execution output against the packet's explicit constraints and implicit boundaries.

---

## Semantic Correctness

### Definition

Semantic Correctness describes whether the implementation satisfied the packet's meaning, not merely its surface requirements. It answers: did the executor understand what the packet was really asking?

Semantic Correctness must not be reduced to passing tests.

### Controlled Vocabulary

| Value | Description |
|---|---|
| `CORRECT` | The implementation fully satisfies the packet's intent, acceptance criteria, and underlying purpose. |
| `PARTIALLY_CORRECT` | The implementation satisfies some but not all semantic requirements. It may pass tests while misunderstanding key intent. |
| `INCORRECT` | The implementation fails to satisfy the packet's semantic requirements, even if it passes mechanical checks. |
| `NOT_EVALUATED` | Semantic correctness was not assessed during audit. |
| `UNKNOWN` | Semantic correctness cannot be determined from available evidence. |

### Evaluation Factors

Semantic Correctness must consider:

- Packet intent — what the packet is trying to accomplish, beyond its enumerated requirements.
- Acceptance criteria — explicit conditions that must be satisfied.
- Rejection criteria — explicit conditions that cause rejection.
- Governing principles — whether the implementation respects P01-P06.
- Edge cases — whether the implementation handles reasonable edge cases the packet implies.
- Consistency with existing standards — whether the implementation contradicts or undermines other ForgePilot standards.
- Whether tests actually prove the required behavior — tests that pass but don't test the right thing are not evidence of correctness.

### Recording Rules

Semantic Correctness must be evaluated during audit.

Semantic Correctness must not be inferred from test pass rate. Tests may pass while the implementation is semantically incorrect.

Semantic Correctness must not be inferred from audit result. An implementation may be `ACCEPTED` because it meets requirements while being `PARTIALLY_CORRECT` on semantic grounds.

---

## Invariant Compliance

### Definition

Invariant Compliance describes whether the execution preserved required system invariants. It answers: did the executor protect the rules that must always be true?

### Controlled Vocabulary

| Value | Description |
|---|---|
| `COMPLIANT` | All checked invariants were preserved. |
| `VIOLATED` | One or more invariants were broken by the execution. |
| `NOT_CHECKED` | Invariant compliance was not assessed during audit. |
| `NOT_APPLICABLE` | Invariant compliance is not relevant to this execution (e.g., research-only, documentation update that touches no invariants). |
| `UNKNOWN` | Invariant compliance cannot be determined from available evidence. |

### System Invariants

Invariants that must be checked when applicable include:

- Append-only event history — records are never overwritten in place.
- Immutable packet intent — packet requirements are not reinterpreted after execution.
- No automatic evidence admission — evidence is not admitted without explicit provenance verification.
- Explicit mapping requirements — qualitative labels are traceable to concrete values.
- Missing evidence remains null — unavailable values are not fabricated.
- Trust/admission/validation axes remain independent — these are never collapsed into one status.
- Environment owns truth — agents do not own truth.
- Classifications are observations, not mutable state — classifications are preserved as originally recorded.

### Recording Rules

Invariant Compliance must be evaluated during audit.

Invariant violations must be treated as high-value routing and audit signals. A model that preserves invariants correctly is more trustworthy for future routing than one that does not, even if both pass the same tests.

Invariant violations discovered after audit must be recorded as a correction observation.

---

## Human Intervention

### Definition

Human Intervention records whether a human had to correct, redirect, reinterpret, or rescue the execution. It answers: did this execution work without human help?

### Controlled Vocabulary

| Value | Description |
|---|---|
| `NONE` | No human intervention was required or performed. |
| `REVIEW_ONLY` | A human reviewed the output but did not change it. Review-only does not count as intervention unless the review changed the acceptance outcome. |
| `CLARIFICATION` | A human had to clarify ambiguous packet requirements or interpretation boundaries. |
| `CORRECTION_REQUEST` | A human explicitly requested a correction or fix from the executor. |
| `MANUAL_FIX` | A human manually changed files, repaired artifacts, or rewrote outputs. |
| `OVERRIDE` | A human overrode the audit result, comparison result, or acceptance decision. |
| `UNKNOWN` | Human intervention status cannot be determined from available evidence. |

### Distinction from Normal Review

Human review after execution does not automatically count as human intervention unless it changed the execution path or acceptance outcome.

A human performing a standard audit without requesting corrections, making manual changes, or overriding results is `REVIEW_ONLY`.

A human who corrects the executor's output, requests a fix run, or clarifies ambiguity that the executor could not resolve counts as `CLARIFICATION`, `CORRECTION_REQUEST`, or `MANUAL_FIX`.

### Recording Rules

Human Intervention must be recorded during the audit phase.

Human Intervention must distinguish normal review from corrective intervention. The default audit process may involve human review; that review is not intervention unless it changes something.

Human Intervention must be tracked as a routing signal. Models that require frequent human intervention are less suitable for unsupervised execution.

---

## Comparison Outcome

### Definition

Comparison Outcome records how an execution performed relative to another execution of the same packet. It answers: which execution was better, and in what way?

Comparison Outcome must not replace Audit Result. Two executions may both be accepted, while one is selected as the merge candidate. A losing execution may still provide admitted evidence.

### Controlled Vocabulary

| Value | Description |
|---|---|
| `NOT_COMPARED` | The execution has not been compared against another execution. |
| `WIN` | This execution was selected as the preferred implementation over at least one compared execution. |
| `LOSS` | Another execution was selected as preferred over this execution. |
| `TIE` | Multiple executions were judged equivalent and no winner was selected. |
| `ACCEPTED_NOT_SELECTED` | This execution was accepted but another accepted execution was selected for merge or preference. |
| `REJECTED` | This execution was excluded from comparison because it was rejected by audit. |
| `INCONCLUSIVE` | Comparison could not reach a decisive outcome (e.g., fundamentally different approaches, insufficient comparison criteria). |

### Required Comparison Record Fields

A comparison outcome must include:

| Field | Description |
|---|---|
| compared execution references | Identifiers of all executions compared (execution IDs, commits, branches). |
| comparison dimensions | The dimensions on which the comparison was made (correctness, constraint adherence, invasiveness, test quality, ambiguity). |
| winning dimensions | Which compared execution was preferred on each dimension and why. |
| comparison rationale | The reasoning behind the overall comparison outcome. |

### Recording Rules

Comparison Outcome must be recorded during the comparison phase, after all compared executions complete audit.

Comparison Outcome must not be written by the executor or auditor for their own execution. Only the comparison phase may write comparison outcomes.

Comparison Outcome must not be inferred from audit result alone. An execution with `AUDIT_RESULT: ACCEPTED` may still receive `LOSS` if another accepted execution was preferred.

A comparison win must not be treated as equivalent to correctness. A winning execution may have flaws; it was simply preferred over the alternatives under the comparison criteria.

---

## Non-Blocking Ambiguity

### Definition

Non-Blocking Ambiguity records ambiguity discovered during audit or comparison that did not require rejection. It answers: was there uncertainty that could matter but didn't block acceptance?

### Controlled Vocabulary

| Value | Description |
|---|---|
| `NONE` | No ambiguity was discovered. |
| `PRESENT` | Ambiguity was discovered but did not cause rejection. |
| `UNKNOWN` | Non-blocking ambiguity status cannot be determined from available evidence. |

### Required Ambiguity Record Fields

If `PRESENT`, the record must include:

| Field | Description |
|---|---|
| ambiguity description | What was ambiguous and why. |
| affected files or sections | Which parts of the implementation were affected by the ambiguity. |
| reason it was non-blocking | Why the ambiguity did not cause rejection (e.g., all reasonable interpretations were acceptable, ambiguity was in non-critical area). |
| routing influence | Whether this ambiguity should influence future routing (e.g., model handled ambiguity well, model interpreted it differently from expected). |

### Recording Rules

Non-blocking ambiguity is routing signal, not failure by itself.

Ambiguity that caused rejection is not non-blocking — it is a blocking issue recorded as part of the audit result.

Ambiguity discovered after audit must be recorded as a correction observation.

Non-Blocking Ambiguity must be evaluated during audit.

---

## Root Cause Level

### Definition

Root Cause Level records the apparent source of a failure, correction, or ambiguity. It answers: what caused the problem?

Root Cause Level must not assign blame without evidence. Root Cause Level must be allowed to remain `UNKNOWN`.

### Controlled Vocabulary

| Value | Description |
|---|---|
| `NONE` | No failure, correction, or ambiguity occurred. |
| `PACKET` | The packet was unclear, incorrect, incomplete, contradictory, or underspecified. |
| `EXECUTOR` | The executor model failed to follow clear instructions, violated constraints, produced incorrect work, or omitted required deliverables. |
| `AUDITOR` | The auditor made an incorrect judgment, missed evidence, or applied inconsistent criteria. |
| `PROCESS` | The workflow process caused the issue (wrong phase ordering, missing prerequisite, lifecycle error). |
| `ENVIRONMENT` | The execution environment caused the issue (missing dependencies, filesystem issues, tooling failure). |
| `TOOLING` | Tooling limitations, bugs, or misconfigurations caused the issue. |
| `UNKNOWN` | The root cause cannot be determined from available evidence. |

### Recording Rules

Root Cause Level must be recorded during audit when a failure, correction, or ambiguity is identified.

Root Cause Level must be corrected by append-only observation if later evidence changes the assessment. The original root cause classification must be preserved.

Multiple root cause levels may be recorded if a failure had multiple contributing sources.

Root Cause Level must be supported by evidence recorded in the audit. A root cause of `EXECUTOR` must reference specific executor errors and evidence.

---

## Routing Signal Eligibility

### Definition

Routing Signal Eligibility describes whether the outcome record may influence future routing analysis. It answers: can this outcome help choose a model next time?

Outcome records must not influence routing unless admitted as evidence. Outcome records may remain useful as signal even when not eligible as evidence.

### Controlled Vocabulary

| Value | Description |
|---|---|
| `NOT_ELIGIBLE` | The outcome record must not influence any routing analysis or recommendation. |
| `ELIGIBLE_AS_SIGNAL` | The outcome record may be used for routing signal exploration and analysis but not for automated routing decisions. |
| `ELIGIBLE_AS_EVIDENCE` | The outcome record may be used as admitted evidence to influence routing recommendations and decisions. |
| `QUARANTINED` | The outcome record was previously eligible but has been quarantined pending re-evaluation. |

### Eligibility Conditions

Routing Signal Eligibility must depend on:

| Condition | Requirement |
|---|---|
| Task classification availability | The packet must have a valid, admitted classification observation. |
| Provenance completeness | The outcome record must satisfy provenance completeness requirements for its trust tier. |
| Trust tier | The outcome record must be `TIER_2_VERIFIED_ARTIFACT` or higher. |
| Validation state | The outcome record must be `VALID`. |
| Admission state | The outcome record must be `ADMITTED`. |
| Audit result | The execution must have been audited. |
| Telemetry completeness | Telemetry fields (if applicable) must come from authoritative sources. |
| Correction history completeness | All corrections must be recorded and preserved. |

### Recording Rules

Routing Signal Eligibility must be determined after the outcome record is created, validated, and admitted.

Routing Signal Eligibility must not be determined solely by the executor or auditor. It requires independent validation against the conditions above.

Routing Signal Eligibility may change over time (e.g., promoted from `NOT_ELIGIBLE` to `ELIGIBLE_AS_EVIDENCE` after provenance is verified, demoted to `QUARANTINED` after issues are discovered). Changes must be recorded as transition observations.

Outcome records must not influence routing unless they are `ELIGIBLE_AS_EVIDENCE`.

---

## Outcome Record Requirements

### Definition

A model outcome record is the durable observation of how a model performed on a classified packet. Every execution must produce an outcome record.

### Required Fields

| Field | Description |
|---|---|
| `packet_id` | The identifier of the packet being executed. |
| `packet_classification_reference` | Reference to the packet's classification observation. Required when a classification exists. |
| `execution_id` | Unique identifier for this execution attempt. |
| `executor_model` | The model that performed the execution. |
| `executor_provider` | The provider of the executor model. |
| `execution_result` | Execution Result value from the controlled vocabulary. |
| `verification_result` | Verification Result value from the controlled vocabulary. |
| `audit_result` | Audit Result value from the controlled vocabulary. |
| `first_pass_success` | First-Pass Success value from the controlled vocabulary. |
| `correction_count` | Non-negative integer or `UNKNOWN`. |
| `correction_types` | List of Correction Type values. Empty list if `correction_count` is 0. |
| `scope_discipline` | Scope Discipline value from the controlled vocabulary. |
| `semantic_correctness` | Semantic Correctness value from the controlled vocabulary. |
| `invariant_compliance` | Invariant Compliance value from the controlled vocabulary. |
| `human_intervention` | Human Intervention value from the controlled vocabulary. |
| `comparison_outcome` | Comparison Outcome value from the controlled vocabulary. |
| `compared_execution_references` | List of execution identifiers compared against. Empty if `NOT_COMPARED`. |
| `non_blocking_ambiguity` | Non-Blocking Ambiguity value. If `PRESENT`, includes ambiguity record fields. |
| `root_cause_level` | List of Root Cause Level values. May be `[NONE]` or a list of contributing causes. |
| `routing_signal_eligibility` | Routing Signal Eligibility value from the controlled vocabulary. |
| `telemetry_reference` | Reference to the telemetry record for this execution, if available. |
| `audit_reference` | Reference to the audit record for this execution. |
| `created_at` | Timestamp when the outcome record was created. |

### Recording Rules

Outcome records must be created during the execution lifecycle, before audit.

Outcome records must be updated as phases complete (execution, verification, audit, comparison), with each phase populating the fields it owns.

Outcome records must not be overwritten. Corrections to outcome records are themselves observations.

---

## Correction and Revision

### Correction Model

Outcome corrections must be append-only observations. Previous outcome records must not be overwritten, deleted, or modified.

A correction creates a new observation that references the previous outcome record. The corrected record remains preserved.

### Correction Record Fields

A correction must include:

| Field | Description |
|---|---|
| `previous_outcome_reference` | Identifier or reference to the outcome record being corrected. |
| `corrected_fields` | The specific fields whose values are being changed. |
| `new_values` | The new values for each corrected field. |
| `reason` | The justification for the correction — what was discovered that made the original outcome record incorrect. |
| `actor` | The identifier of the actor making the correction. |
| `created_at` | Timestamp when the correction was created. |

### Correction Rules

Outcome correction is itself evidence. The fact that an outcome record was corrected, which fields were corrected, and why is observable data.

Frequent correction of outcome records must be treated as a process signal. It may indicate:

- Inadequate audit quality during initial review.
- Incomplete verification before audit.
- Premature outcome recording before all phases complete.
- Underspecified outcome axes that require reinterpretation.

A correction must not be used to retroactively improve an outcome record. If a model performed poorly, the original outcome must be preserved. Later discovery of mitigating factors is a separate observation.

Corrections must reflect improved understanding of the evidence, not reinterpretation of the model's performance for a more favorable outcome.

---

## Relationship to Task Classification

### Definition

Model outcome records must reference task classification when available. A model outcome must not be interpreted without the packet's task classification.

### Classification-Dependent Interpretation

The following interpretations must be disaggregated by task class:

- A model win on `STANDARDS` does not imply suitability for `SCHEMA`.
- A model first-pass success on `DOCUMENTATION` does not imply suitability for `TELEMETRY`.
- A model accepted after correction on `PERSISTENCE` does not imply suitability for `ROUTING`.
- A model win on `TESTING` does not imply suitability for `VALIDATION`.
- A model first-pass success with `LOOSE` constraint strictness does not imply suitability for `STRICT` or `FROZEN` constraints.
- A model accepted after `SCOPE_CORRECTION` must not be treated the same as a first-pass success when evaluating routing suitability.

### Outcome Records and Classification Evidence

Outcome records may inform routing only when:

1. The packet has an admitted classification observation.
2. Multiple outcome records exist for packets of the same task class.
3. The outcome records show measurable performance differences between models.
4. The performance differences are stable across comparable packets.
5. The outcome records themselves are admitted as evidence.

A model outcome record without a classification reference provides limited routing signal — it records that a model performed in some way on some packet, but without knowing what kind of work the packet represented, the signal cannot be generalized.

### Classification Does Not Replace Outcome Recording

Task classification describes the packet before execution. Outcome recording describes the model's performance during execution. Both are necessary for routing evidence.

Classification alone does not tell you whether a model succeeded. Outcome recording alone does not tell you what kind of work the model was attempting.

---

## Relationship to Telemetry

### Definition

Model outcome records and telemetry records serve different purposes.

- **Telemetry records** provide token counts, cost estimates, latency measurements, session identifiers, provider information, and other operational metrics.
- **Outcome records** describe model performance, judgment quality, scope discipline, semantic correctness, and routing-relevant signals.

### Independence Rules

Telemetry must not override audit outcome. Low token usage does not make an incorrect implementation correct. High token usage does not make a correct implementation incorrect.

Audit outcome must not fabricate telemetry. The auditor must not estimate or guess token counts, costs, or latency.

If telemetry is missing, cost and token fields in the outcome record must remain `null` or empty according to field type. Missing telemetry must not be replaced with estimates, defaults, or placeholder values.

### Telemetry as Supporting Evidence

Telemetry may support outcome interpretation when:

- Telemetry is from an authoritative source (OpenCode export or infrastructure measurement).
- Telemetry is admitted as evidence.
- Telemetry is correlated with outcome axes (e.g., high correction count with high token usage may indicate a model struggling with the task).

Telemetry must not substitute for outcome axes. A model using fewer tokens is not automatically more semantically correct. Cost efficiency is a separate concern from correctness.

### Missing Telemetry

When telemetry is unavailable:

- Token fields (`prompt_tokens`, `completion_tokens`, `reasoning_tokens`, `total_tokens`) remain `null`.
- Cost fields (`estimated_cost`) remain `null`.
- Latency may remain `null` if not measured.

Missing telemetry does not invalidate the outcome record. The outcome record's primary value is in the performance and judgment axes, not in operational measurements.

### Field Authority for Outcome Records

Outcome record fields and telemetry fields have different authorities:

| Field Category | Authority |
|---|---|
| Execution result, scope discipline, semantic correctness | Auditor judgment, verified against artifacts. |
| Token counts, cost, latency | Infrastructure or OpenCode telemetry. |
| Audit result, first-pass success, human intervention | Auditor judgment. |
| Comparison outcome | Comparison phase. |

Outcome records must not populate telemetry-owned fields. Telemetry records must not populate outcome-owned fields. Cross-references are preserved through the `telemetry_reference` field in the outcome record.

---

## Relationship to Other Standards

These standards complement:

- **Task Classification Standards** (`docs/task-classification-standards.md`) — Defines the packet classification axes (task class, risk level, constraint strictness, etc.) that provide the context necessary for interpreting model outcome records. Outcome records must reference task classification observations.

- **Metrics Trust and Validation** (`docs/metrics-trust-and-validation.md`) — Defines trust tiers, validation states, and admission rules. Outcome records are subject to the same provenance, trust, validation, and admission standards. An outcome record must have a trust tier, validation state, and admission state before it can be used as evidence.

- **Telemetry Authority and Field Ownership** (`docs/telemetry-authority-and-field-ownership.md`) — Defines which system is authoritative for each field. Outcome record fields must have defined authority, owner, source, and writer. Telemetry-owned fields (tokens, cost, latency) must not be populated by outcome records.

- **Persistence Standards** (`docs/persistence-standards.md`) — Defines how records survive over time. Outcome records must be persisted as append-only observations with full provenance, versioning, and supersession support.

- **Model Evaluation Harness** (`docs/model-evaluation-harness.md`) — Defines evaluation methodology and comparison procedures. Outcome recording standards provide the vocabulary and structure for the outcome axes recorded during evaluation.

---

## Constraints

- This document defines outcome recording policy only.
- This document does not add SQLite schema.
- This document does not add CLI behavior.
- This document does not add routing logic.
- This document does not add model selection behavior.
- This document does not add scoring algorithms.
- This document does not add autonomous execution behavior.
- This document does not add dashboards or reports.
- This document does not add aggregation behavior.
- This document does not implement model outcome persistence.
- This document does not treat passing tests as audit acceptance.
- This document does not treat final acceptance as first-pass success.
- This document does not treat comparison win as correctness.
- This document does not allow telemetry to override audit.
- This document does not allow outcome records to influence routing without admission.
- This document does not collapse outcome axes into one status.
- This document does not mutate prior outcome records.
- This document does not optimize for favorable model outcomes.
