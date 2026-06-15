# Model Evaluation Harness

## Purpose

The Model Evaluation Harness defines a standardized process for comparing executor models using identical tasks, prompts, verification procedures, and auditing criteria.

This harness defines the evaluation methodology only. It does not automate model execution, model routing, escalation, broker integration, or workflow orchestration.

---

## Controlled Variables

The following variables must be held constant across all evaluation runs for a given comparison:

* **Packet** — The same packet must be executed by every model under evaluation. This ensures that all models are tested against identical requirements, constraints, and acceptance criteria.
* **Executor baseline prompt version** — The same executor baseline prompt version must be used for every model under evaluation. This ensures that all models receive identical execution instructions and scope constraints.
* **Auditor baseline prompt version** — The same auditor baseline prompt version must be used when auditing results across models. This ensures consistent evaluation criteria.
* **Auditor model** — The same auditor model must be used to review results from all executor models. This eliminates auditor variance as a confounding factor.
* **Verification procedure** — The same verification commands and acceptance criteria must be applied to all evaluation runs. This ensures that results are measured consistently.

---

## Measured Variables

The following variables are recorded per evaluation run:

* **Audit result** — The auditor's determination (ACCEPTED / REJECTED / NEEDS_FRONTIER_REVIEW).
* **First-pass success** — Whether the executor satisfied all acceptance criteria on the first attempt without fixes.
* **Fix attempts** — The number of fix iterations required before acceptance or rejection.
* **Escalation occurrence** — Whether the packet was escalated to frontier review.
* **Root cause classification** — The root cause level if the run failed (ENVIRONMENT / PACKET / EXECUTOR / AUDITOR / HUMAN / NONE).
* **Human intervention** — Whether a human intervened during the evaluation run.
* **Notes** — Free-form notes capturing observations, anomalies, or context.

---

## Metrics Artifact

Every evaluation run must produce a structured metrics artifact. The metrics artifact ensures that evaluation data is preserved in a standardized format for later aggregation and analysis.

### Artifact Locations

The metrics artifact must be generated at two locations:

1. **Run artifact** — `runs/<PACKET_ID>/metrics.json`
2. **Evaluation artifact** — `evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/metrics.json`

The evaluation artifact is a copy of the run artifact, placed in the per-model evaluation directory after the run completes.

### Required Schema

The metrics artifact must contain exactly the following fields:

```json
{
  "packet_id": "",
  "packet_category": "",
  "model_id": "",
  "auditor_model": "",
  "base_commit": "",
  "run_branch": "",
  "audit_result": "",
  "comparison_outcome": null,
  "first_pass_success": null,
  "fix_attempts": null,
  "human_intervention": null,
  "root_cause": null,
  "ambiguity_discovered": null,
  "escalation_occurrence": null,
  "execution_duration_seconds": null,
  "prompt_tokens": null,
  "completion_tokens": null,
  "reasoning_tokens": null,
  "total_tokens": null,
  "estimated_cost": null,
  "notes": ""
}
```

### Field Meanings

* **packet_category** — Records the task category used for future routing analysis.
* **auditor_model** — Records which model or human audited the run.
* **escalation_occurrence** — Records whether the run required escalation or frontier review.

### Field Rules

* **Unavailable values** — Any field whose value is not available at the time of recording must be set to `null`.
* **Per-model-run ownership** — Each metrics artifact is generated per model run. One metrics artifact corresponds to one executor model executing one packet.
* **comparison_outcome** — This field remains `null` during individual executor runs. It is populated after comparison completion, when results from multiple models are compared.
* **String fields** — `packet_id`, `packet_category`, `model_id`, `auditor_model`, `base_commit`, `run_branch`, `audit_result`, and `notes` are string fields. Empty strings are used when the value is not yet determined.
* **Schema is normative** — Executors must use the schema exactly as specified. No fields may be added, removed, or renamed.
* **In-place updates** — `metrics.json` is updated in place as evaluation phases complete. The same artifact accumulates values across phases rather than being replaced.
* **No guessing** — If a value cannot be reliably determined, it must remain `null` or `""` according to its field type rather than being guessed.

### Metrics Population Procedure

The `metrics.json` artifact is populated incrementally across four lifecycle phases. Each phase owns a specific set of fields.

#### Phase 1: Executor Run Start

The following fields are populated when the executor run begins:

* `packet_id`
* `packet_category`
* `model_id`
* `base_commit`
* `run_branch`

If unavailable, string fields use `""`.

#### Phase 2: Executor Run Completion

The following fields are populated when the executor run finishes:

* `execution_duration_seconds`
* `prompt_tokens`
* `completion_tokens`
* `reasoning_tokens`
* `total_tokens`
* `estimated_cost`
* `notes`

Unavailable number fields use `null`. Token and cost fields may remain `null` when provider usage data is unavailable.

#### Phase 3: Audit Completion

The following fields are populated after audit completion:

* `auditor_model`
* `audit_result`
* `first_pass_success`
* `fix_attempts`
* `human_intervention`
* `root_cause`
* `ambiguity_discovered`
* `escalation_occurrence`

Unavailable boolean or numeric fields use `null`. Unavailable string fields use `""`.

#### Phase 4: Comparison Completion

The following field is populated after comparison completion:

* `comparison_outcome`

`comparison_outcome` remains `null` until the model comparison is complete.

#### Evaluation Artifact Copy

After all phases complete, the same populated `metrics.json` artifact must be copied into:

```text
evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/metrics.json
```

### Comparison Outcome Standards

The `comparison_outcome` field in `metrics.json` records the result of model comparison for a given benchmark packet. Only the following values are permitted:

#### Allowed Values

| Value | Definition |
|-------|-----------|
| `WINNER` | Assigned to the model selected as the strongest implementation for a benchmark packet. |
| `RUNNER_UP` | Assigned to a valid implementation that was not selected as the winner. |
| `TIE` | Assigned when multiple implementations are judged equivalent and no winner is selected. |
| `INVALID` | Assigned when a run is excluded from comparison due to failure, corruption, missing artifacts, audit rejection, or inability to complete evaluation. |

No other values are permitted for `comparison_outcome`.

#### Ownership

* Executors never populate `comparison_outcome`.
* Auditors never populate `comparison_outcome`.
* The comparison phase is solely responsible for populating `comparison_outcome`.

#### Recording Rules

* Exactly one winner may exist per benchmark unless a tie is declared.
* Multiple models may receive `TIE`.
* Multiple models may receive `RUNNER_UP`.
* `INVALID` runs are excluded from winner selection.
* `comparison_outcome` remains `null` until comparison completion.

#### Metrics Update Rules

* The comparison phase updates the existing `metrics.json` artifact in place.
* The comparison result must be written to:
    * `runs/<PACKET_ID>/metrics.json`
    * `evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/metrics.json`
* Comparison outcomes must not be inferred from branch names, packet names, or model names.
* Comparison outcomes must be determined from documented comparison results.

### Metrics Field Recording Standards

The following standards define how outcome and quality fields in `metrics.json` must be recorded. These standards ensure consistent recording across benchmark packets, auditors, and comparison runs.

#### first_pass_success

Record `true` only when the executor's first submitted implementation satisfies all acceptance criteria and is accepted without requiring a fix run.

Record `false` when the executor requires one or more fix attempts before acceptance or rejection.

Record `null` when the result is not yet known.

#### fix_attempts

Record `0` when the implementation is accepted on the first attempt.

Increment by `1` for each requested correction after the first executor result.

Record `null` when the result is not yet known.

#### human_intervention

Record `true` when a human manually changes files, repairs artifacts, rewrites outputs, resolves ambiguity for the executor, or gives corrective implementation guidance during the run.

Record `false` when the run completes without human correction or manual repair.

Record `null` when the result is not yet known.

#### ambiguity_discovered

Record `true` when the packet allows more than one reasonable interpretation, causes divergent model behavior, requires clarification, or contains underspecified terms that affect implementation or comparison.

Record `false` when no meaningful ambiguity is discovered.

Record `null` when the result is not yet known.

#### escalation_occurrence

Record `true` when the run requires frontier review, human arbitration, invalid-run handling, auditor escalation, or model escalation.

Record `false` when no escalation occurs.

Record `null` when the result is not yet known.

#### root_cause

Record `NONE` for accepted runs with no failure.

For failed, rejected, invalid, or escalated runs, record one of:

* `ENVIRONMENT` — When local setup, dependencies, test environment, filesystem, network, or tooling caused the issue.
* `PACKET` — When unclear, incorrect, incomplete, contradictory, or underspecified packet requirements caused the issue.
* `EXECUTOR` — When the executor model failed to follow clear instructions, violated constraints, produced incorrect work, or omitted required deliverables.
* `AUDITOR` — When the auditor made an incorrect judgment, missed evidence, or applied inconsistent criteria.
* `HUMAN` — When human operator error contaminated, interrupted, misdirected, or manually altered the run in a way that affected validity.

Record `null` when the result is not yet known.

#### Recording Standards Examples

* FP-EVAL-002 discovered packet ambiguity around the meaning of "Successful packets"; this should record `ambiguity_discovered: true` and `root_cause: PACKET`.
* A run that requires manually copying missing evaluation artifacts should record `human_intervention: true`.
* A run accepted on first submission with no repair should record `first_pass_success: true` and `fix_attempts: 0`.
* A run requiring frontier review should record `escalation_occurrence: true`.

---

## Comparison Rubric

Every model comparison must evaluate and record these five dimensions:

1. **Correctness** — Did the executor satisfy all stated requirements and acceptance criteria? Verified against the auditor's determination.
2. **Constraint adherence** — Did the executor respect all implementation constraints? Verified by diff inspection for prohibited changes.
3. **Invasiveness** — How much did the executor modify beyond the minimum necessary? Measured by file count, diff size, and whether existing modules were modified unnecessarily.
4. **Test quality** — Are the executor's tests well-structured, do they cover stated requirements, and do they avoid coupling to implementation details?
5. **Ambiguity discovered** — Did the packet contain ambiguous or underspecified requirements that led to divergent interpretations? Documented to improve future packet quality.

Comparisons must record which dimensions favored each model with supporting reasoning.

---

## Evaluation Rules

The following rules govern all evaluation runs:

* Models must be evaluated against the same packet.
* Audits should use the same auditor model across all runs being compared.
* Prompt versions must be recorded for every evaluation run.
* Results must be recorded in metrics.
* Evaluations must preserve run artifacts for auditability.

---

## Contamination Prevention

The following rules prevent contaminated model comparisons:

* **Same packet** — Every executor model under evaluation must execute the identical packet. No model may run a modified or substituted packet.
* **Same base commit** — Every executor model must start from the same base commit. The base commit hash must be recorded in each run's artifacts. No model may begin implementation from a different commit.
* **Isolated branch per model** — Each executor model must work on its own isolated branch. No model may write to another model's branch. Branches must be created from the same base commit.
* **No merging until comparison complete** — Benchmark implementation must not be merged into any shared branch until all compared model runs are complete and results have been recorded. Merging one model's implementation before all runs finish contaminates the comparison baseline.
* **Invalid-run classification** — Any run that violates the same-packet, same-base-commit, isolated-branch, or no-merge-before-completion rules is classified as an invalid run. Invalid runs must not be included in model comparisons.
* **Invalid-run artifact** — When a run is classified as invalid, an invalid-run artifact must be created at:

```
evals/model-eval-v1/<PACKET_ID>/<MODEL_ID>/invalid-run.md
```

This artifact must document the reason for invalidation.

---

## Evaluation Directory Structure

Evaluations are stored under `evals/`. The recommended structure for the first harness version is:

```
evals/
  model-eval-v1/
    README.md
    <PACKET_ID>/
      <MODEL_NAME>/
        execution-prompt.md
        executor-result.md
        verification.txt
        audit-prompt.md
        audit-result.md
        git-status.txt
        relevant-diff.txt
        metrics.json
```

Per-model run storage isolates each model's run artifacts under `evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/`. This preserves a complete record of each evaluation run for comparison and audit.

---

## Packet Quality Requirements

Future FP-EVAL benchmark packets must include the following to eliminate ambiguity and enable fair comparisons.

### Explicit Domain Vocabulary

Packets must define all domain-specific terms used in requirements and acceptance criteria. Qualitative labels such as "successful", "failed", "valid", or "clean" must be defined unambiguously. If a term maps to a programmatic value (database column, enum, constant), that mapping must be stated explicitly.

### Required Status/Value Mappings

Any status value used in success or failure metrics must be documented in the packet. If "successful" corresponds to a specific `packets.status` value, the packet must state which value or values constitute success. Packets must not rely on executor inference of undocumented mappings.

### Allowed Interpretation Boundaries

Packets must specify which interpretations are allowed and which are prohibited. If a requirement allows multiple valid approaches, those approaches must be enumerated or bounded. If a requirement has exactly one valid interpretation, that must be stated.

### Constraint Adherence Checklist

Every packet must include a constraint adherence checklist in its acceptance criteria. Each constraint must be independently verifiable. Example items:

- No schema changes.
- No migrations added.
- Only allowed files modified.
- No routing logic added.
- No provider logic added.

### Comparison Rubric Fields

Every FP-EVAL packet must require the comparison record to include all five comparison rubric dimensions: correctness, constraint adherence, invasiveness, test quality, and ambiguity discovered.

### Ambiguity Review

Before executor runs begin, the packet author must perform an ambiguity review. Every status label, value mapping, and qualitative term must be traceable to a concrete programmatic artifact or an explicit definition. The review must confirm that no term can be interpreted in more than one way by a reasonable executor. Any disambiguations must be recorded in the packet itself.

---

## Metrics Trust and Validation

All metrics records are subject to trust, validation, and admission standards. These standards govern whether a metrics record is safe to use as evidence in observatory outputs.

See `docs/metrics-trust-and-validation.md` for:

- Trust Tier definitions (TIER_0 through TIER_3)
- Validation State definitions (VALID, INVALID, INCOMPLETE, DEFERRED)
- Admission State definitions (NOT_EVALUATED, REJECTED, PENDING, ADMITTED, QUARANTINED)
- Provenance completeness requirements
- Admission rules and admission rules matrix
- TIER_1 resolution policy
- Demotion path from ADMITTED to QUARANTINED
- Historical data policy
- Signal vs evidence distinction

---

## Telemetry Authority and Field Ownership

All metrics fields are subject to field authority and ownership standards. These standards govern which system, lifecycle phase, or actor is authorized to write each field.

See `docs/telemetry-authority-and-field-ownership.md` for:

- Field Authority, Field Owner, Field Source, and Field Writer definitions
- Authority classes (EXECUTOR, AUDITOR, COMPARISON_PHASE, INFRASTRUCTURE, OPENCODE_TELEMETRY, HUMAN_OPERATOR, DERIVED, UNKNOWN)
- Field ownership matrix for all metrics fields
- OpenCode telemetry classification and trust
- Rules for unknown/unavailable values
- Rules for conflicting values
- Rules for derived fields

---

## Constraints

* This harness defines methodology only. It does not add model routing.
* This harness does not add broker integration.
* This harness does not add autonomous execution.
* This harness does not add workflow orchestration.
* This harness does not add model selection logic.
* This harness does not modify existing runtime behavior.
