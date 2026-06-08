# FP-003 Executor Result

## Status: SUCCESS

## Summary

Added a `build-audit-prompt` command to the ForgePilot CLI (`src/cli/forgepilot.ts`). The command automates audit prompt assembly by reading the packet file, executor result, verification output, git status, and git diff from standardized paths under `runs/<PACKET_ID>/`, then substitutes them into the audit template and validates that no template placeholders remain.

## Files Changed

- `src/cli/forgepilot.ts` — Added `build-audit-prompt` command with automatic path resolution, input validation, placeholder substitution, and output generation.
- `packets/FP-003.md` — Created packet file documenting the FP-003 requirements.

## CLI Usage

```
pnpm fp -- build-audit-prompt FP-003
pnpm fp -- --build-audit-prompt FP-003
```

## Design Decisions

- Follows existing `init-db` pattern: supports both flag (`--build-audit-prompt`) and positional (`build-audit-prompt`) invocation.
- Reuses the existing `prompts/audit-template.md` template.
- Title is extracted from the packet's first `#` heading; falls back to packet ID.
- Validates all input files exist before assembly.
- Checks that all seven template placeholders (TASK_ID, TASK_TITLE, ORIGINAL_PACKET, EXECUTOR_RESULT, VERIFICATION_OUTPUT, GIT_STATUS, RELEVANT_DIFF) are replaced after substitution.
- Creates the `runs/<PACKET_ID>/` directory if it does not exist.
- No model provider logic, routing logic, autonomous execution, broker integration, or network access added.
