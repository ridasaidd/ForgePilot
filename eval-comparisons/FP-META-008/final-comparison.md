# FP-META-008 Final Comparison

DeepSeek-V4-Pro-High: ACCEPTED  
Qwen-3.7-Max: ACCEPTED  

Outcome: Qwen-3.7-Max win

## Reason

Both implementations satisfied the main documentation requirements and passed verification.

Qwen produced the stronger result because it followed the artifact procedure more accurately:

- Created `runs/FP-META-008/metrics.json`.
- Created `evals/model-eval-v1/FP-META-008/qwen-3.7-max/metrics.json`.
- Used the full base commit hash in `metrics.json`.
- Kept `comparison_outcome` as `null`.
- Did not invent additional comparison outcome values.
- Updated all three required documentation files clearly and concisely.

DeepSeek also produced a useful implementation, but had procedure and schema-alignment concerns:

- Initially created `metrics.json` only under `runs/FP-META-008/`.
- Required manual repair to copy metrics into the eval artifact directory.
- Used a short base commit hash in `metrics.json`.
- Added invented `comparison_outcome` examples (`WINNER`, `RUNNER_UP`, `TIE`, `INVALID`) not specified by the packet and not fully aligned with the existing comparison vocabulary.

## Verification

Both runs passed:

- `pnpm typecheck`
- `pnpm test`
- 13/13 tests passed

## Benchmark Note

FP-META-008 revealed a useful routing signal:

Qwen was stronger on procedure-following and artifact completeness for documentation/process tasks.

DeepSeek produced more detailed documentation but showed weaker adherence to the required artifact-copy procedure.
