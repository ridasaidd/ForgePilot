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
```

## Per-Model Run Storage

Each model's evaluation run is stored under `evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/`.

This isolates run artifacts per model per packet, enabling fair and auditable comparisons.

## How to Use

1. Select a benchmark packet to evaluate against.
2. For each executor model under evaluation, run the model evaluation run prompt (`prompts/model-eval-run-v1.md`) targeting the benchmark packet.
3. After completion, copy the generated run artifacts from `runs/<PACKET_ID>/` into `evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/`.
4. Run the audit prompt for each evaluation run using the same auditor model.
5. Record measured variables for each run.
6. Compare results across models.
