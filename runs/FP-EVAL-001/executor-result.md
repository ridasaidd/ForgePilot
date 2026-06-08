STATUS: SUCCESS
FILES_CHANGED:
- src/cli/forgepilot.ts
- tests/smoke.test.ts
VERIFICATION_COMMANDS_RUN:
- pnpm typecheck => PASS (exit 0, no errors)
- pnpm test => PASS (9/9 tests, 0 failures)
- pnpm fp -- prompt-baselines => PASS (exit 0, correct output)
VERIFICATION_RESULTS:
- pnpm fp -- prompt-baselines works => PASS
- Output includes ForgePilot => PASS
- Output includes Executor Baseline: prompts/executor-baseline-v1.md => PASS
- Output includes Auditor Baseline: prompts/auditor-baseline-v1.md => PASS
- Existing tests pass => PASS
- Only allowed source/test files are changed => PASS
- No routing logic added => PASS
- No broker integration added => PASS
- No model provider logic added => PASS
- No workflow orchestration added => PASS
RESULT:
Added a read-only `prompt-baselines` CLI command that prints the ForgePilot project name and available prompt baseline file paths. The command is accessible via `pnpm fp -- prompt-baselines`. Only allowed files were modified (src/cli/forgepilot.ts, tests/smoke.test.ts). All constraints respected. All tests pass. All acceptance criteria met.
NOTES:
None.
