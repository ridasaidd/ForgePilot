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

## Constraints

* This harness defines methodology only. It does not add model routing.
* This harness does not add broker integration.
* This harness does not add autonomous execution.
* This harness does not add workflow orchestration.
* This harness does not add model selection logic.
* This harness does not modify existing runtime behavior.
