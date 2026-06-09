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

## Constraints

* This harness defines methodology only. It does not add model routing.
* This harness does not add broker integration.
* This harness does not add autonomous execution.
* This harness does not add workflow orchestration.
* This harness does not add model selection logic.
* This harness does not modify existing runtime behavior.
