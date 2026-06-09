# Model Evaluation Run Prompt — v1

**Version:** 1
**Purpose:** Standardized evaluation-run prompt for executing benchmark packets under the model evaluation harness.

---

## Instructions

You are executing a model evaluation run. Your objective is to execute the designated benchmark packet as an executor model and produce run artifacts for later audit and comparison.

### Execution Rules

1. Read the designated benchmark packet in full before taking any action.
2. Follow EXECUTOR_BASELINE_V1 for all execution behavior, verification, artifact generation, and scope discipline.
3. Execute the packet exactly as written. Do not interpret, extrapolate, or extend requirements beyond what is explicitly stated.
4. Produce only the deliverables the packet requests. Do not generate additional files, documentation, or artifacts unless the packet explicitly requires them.
5. Run all verification commands specified in the packet and record their full output.
6. Check every acceptance criterion individually with recorded evidence.
7. Stop after completion. Do not initiate follow-up work, propose next steps, or create additional packets.

### Artifact Rules

After completing the implementation, produce these run artifacts under `runs/<PACKET_ID>/`:

1. **executor-result.md** — Structured summary of status, files changed, verification results, and a short result summary.
2. **verification.txt** — Raw output of all verification commands run.
3. **audit-prompt.md** — A filled audit prompt assembled from the packet, executor result, verification output, git status, and git diff, containing no unresolved template placeholders.
4. **metrics.json** — Structured metrics artifact containing evaluation run data.

#### Metrics Artifact Schema

The `metrics.json` artifact must contain exactly the following fields:

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

#### Field Meanings

* **packet_category** — Records the task category used for future routing analysis.
* **auditor_model** — Records which model or human audited the run.
* **escalation_occurrence** — Records whether the run required escalation or frontier review.

#### Metrics Artifact Rules

* **Unavailable values** — Any field whose value is not available at the time of recording must be set to `null`.
* **Per-model-run ownership** — Each metrics artifact is generated per model run. One metrics artifact corresponds to one executor model executing one packet.
* **comparison_outcome** — This field remains `null` during individual executor runs. It is populated after comparison completion, when results from multiple models are compared.
* **String fields** — `packet_id`, `packet_category`, `model_id`, `auditor_model`, `base_commit`, `run_branch`, `audit_result`, and `notes` are string fields. Empty strings are used when the value is not yet determined.
* **Schema is normative** — The schema must be used exactly as specified. No fields may be added, removed, or renamed.
* **In-place updates** — `metrics.json` is updated in place as evaluation phases complete. The same artifact accumulates values across phases rather than being replaced.
* **No guessing** — If a value cannot be reliably determined, it must remain `null` or `""` according to its field type rather than being guessed.

#### Metrics Population Procedure

The `metrics.json` artifact is populated incrementally across four lifecycle phases. Each phase owns a specific set of fields.

##### Phase 1: Executor Run Start

The following fields are populated when the executor run begins:

* `packet_id`
* `packet_category`
* `model_id`
* `base_commit`
* `run_branch`

If unavailable, string fields use `""`.

##### Phase 2: Executor Run Completion

The following fields are populated when the executor run finishes:

* `execution_duration_seconds`
* `prompt_tokens`
* `completion_tokens`
* `reasoning_tokens`
* `total_tokens`
* `estimated_cost`
* `notes`

Unavailable number fields use `null`. Token and cost fields may remain `null` when provider usage data is unavailable.

##### Phase 3: Audit Completion

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

##### Phase 4: Comparison Completion

The following field is populated after comparison completion:

* `comparison_outcome`

`comparison_outcome` remains `null` until the model comparison is complete.

##### Evaluation Artifact Copy

After all phases complete, the same populated `metrics.json` artifact must be copied into:

```text
evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/metrics.json
```

### Scope Discipline

Do not:

* Invent requirements not present in the packet.
* Add features or functionality outside the packet scope.
* Expand the architecture beyond what the packet specifies.
* Skip verification or declare success without recorded evidence.
* Modify existing packet behavior or runtime behavior unless explicitly requested.
* Add routing logic, model provider logic, broker integration, or autonomous execution.
* Refactor code or restructure the project beyond what the packet requires.
* Create additional packets beyond what the packet requests.

### Post-Execution

After completing the evaluation run, copy the run artifacts from `runs/<PACKET_ID>/` into the evaluation directory under `evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/` using the model name assigned to this evaluation run. This includes the `metrics.json` artifact.

### Behavioral Guidance

Prefer small, targeted changes over broad refactors. Verify before declaring success and record all evidence. Do not add unrequested functionality, invent requirements, or skip verification steps.
