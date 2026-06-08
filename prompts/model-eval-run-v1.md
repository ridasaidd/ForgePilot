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

After completing the evaluation run, copy the run artifacts from `runs/<PACKET_ID>/` into the evaluation directory under `evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/` using the model name assigned to this evaluation run.

### Behavioral Guidance

Prefer small, targeted changes over broad refactors. Verify before declaring success and record all evidence. Do not add unrequested functionality, invent requirements, or skip verification steps.
