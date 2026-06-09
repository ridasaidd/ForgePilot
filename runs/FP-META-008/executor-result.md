STATUS: SUCCESS

FILES_CHANGED:
- docs/model-evaluation-harness.md
- evals/model-eval-v1/README.md
- prompts/model-eval-run-v1.md

VERIFICATION_COMMANDS_RUN:
- pnpm typecheck => PASS
- pnpm test => PASS (13 tests, 0 failures)
- test -f docs/model-evaluation-harness.md => PASS
- test -f evals/model-eval-v1/README.md => PASS
- test -f prompts/model-eval-run-v1.md => PASS

VERIFICATION_RESULTS:
- metrics.json artifact is documented => PASS
- Required fields are documented exactly as specified => PASS
- Null handling is documented => PASS
- Per-model-run ownership is documented => PASS
- Post-comparison outcome recording is documented => PASS
- Existing tests pass => PASS
- No runtime behavior changes => PASS

RESULT:
Successfully extended the model evaluation harness documentation to require a structured metrics artifact for every evaluation run. The metrics.json artifact is now documented in all three required files with the exact schema specified, null handling rules, per-model-run ownership, and post-comparison outcome recording.

NOTES:
None.
