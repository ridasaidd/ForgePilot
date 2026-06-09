# Model Evaluation — v1

## Purpose

`model-eval-v1` is the first ForgePilot model evaluation harness version. It provides a standardized structure for comparing executor models using identical tasks, prompts, verification procedures, and auditing criteria.

## Directory Structure

```
evals/model-eval-v1/
  README.md                       # This file
  <PACKET_ID>/                    # Evaluation runs for a specific benchmark packet
    <MODEL_NAME>/                 # Run artifacts for a specific executor model
      execution-prompt.md         # The execution prompt used for this run
      executor-result.md          # Structured executor result summary
      verification.txt            # Raw verification command output
      audit-prompt.md             # Filled audit prompt for this run
      audit-result.md             # Auditor's determination and findings
      git-status.txt              # Git status at time of run
      relevant-diff.txt           # Diff of changes made during run
      metrics.json                # Structured metrics artifact for this run
```

## Per-Model Run Storage

Each model's evaluation run is stored under `evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/`.

This isolates run artifacts per model per packet, enabling fair and auditable comparisons.

## Metrics Artifact

Every evaluation run must produce a structured metrics artifact. The metrics artifact is stored at two locations:

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

## How to Use

1. Select a benchmark packet to evaluate against.
2. For each executor model under evaluation, run the model evaluation run prompt (`prompts/model-eval-run-v1.md`) targeting the benchmark packet.
3. After completion, copy the generated run artifacts from `runs/<PACKET_ID>/` into `evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/`, including the `metrics.json` artifact.
4. Run the audit prompt for each evaluation run using the same auditor model.
5. Record measured variables for each run.
6. Compare results across models.

## Packet Quality Checklist

Before using a benchmark packet for model evaluation, verify the following.

### Status/Value Semantics

* Every status label used in the packet (e.g., "successful", "failed", "completed") must be defined explicitly.
* If a status label maps to a database value, enum, or programmatic constant, that mapping must be stated in the packet.
* No packet may rely on executor inference of undocumented status or value mappings.

### Ambiguity Review

The packet author must perform an ambiguity review before executor runs begin:

* Identify every qualitative term in the packet (status labels, outcome descriptions, state transitions).
* Confirm each term traces to a concrete programmatic artifact or an explicit definition.
* Verify that no term can be interpreted in more than one way by a reasonable executor.
* Document any disambiguations made during the review in the packet itself.

### Required Packet Sections

Every FP-EVAL benchmark packet must include:

1. **Explicit domain vocabulary** — All domain-specific terms defined unambiguously.
2. **Required status/value mappings** — Every status value used in metrics documented with its programmatic mapping.
3. **Allowed interpretation boundaries** — Which interpretations are allowed and which are prohibited for each requirement.
4. **Constraint adherence checklist** — All implementation constraints enumerated as independently verifiable acceptance criteria.
5. **Comparison rubric reference** — Comparison must record correctness, constraint adherence, invasiveness, test quality, and ambiguity discovered.

### Comparison Record Requirements

Every model comparison must document these five dimensions with reasoning:

1. **Correctness** — Whether each model satisfied all stated requirements.
2. **Constraint adherence** — Whether each model respected all implementation constraints.
3. **Invasiveness** — How much each model modified beyond the minimum necessary.
4. **Test quality** — Whether each model's tests are well-structured and cover acceptance criteria.
5. **Ambiguity discovered** — Any packet ambiguities that led to divergent model interpretations.

---

## Contamination Prevention

The following rules must be followed to ensure fair model comparisons:

* **Same packet** — Every executor model must execute the identical packet. No substitutions or modifications are permitted.
* **Same base commit** — Every executor model must start from the same base commit. Record the base commit hash in each run's artifacts.
* **Isolated branch per model** — Each executor model must work on its own isolated branch, created from the same base commit. No model may write to another model's branch.
* **No merging until comparison complete** — Do not merge any benchmark implementation into a shared branch until all compared model runs are complete and results are recorded.
* **Invalid-run classification** — Any run violating the same-packet, same-base-commit, isolated-branch, or no-merge rules is classified as invalid and must not be included in comparisons.
* **Invalid-run artifact** — Invalid runs must produce an artifact at:

```
evals/model-eval-v1/<PACKET_ID>/<MODEL_ID>/invalid-run.md
```

This artifact must document the reason for invalidation.
