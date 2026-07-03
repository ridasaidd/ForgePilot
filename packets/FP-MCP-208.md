# FP-MCP-208 — Workspace Change Inspection Tool Handoff

## Task

Prepare a bounded DeepSeek/OpenCode implementation prompt for a new read-only MCP bridge inspection tool:

```text
forgepilot_get_workspace_change_inspection
```

## Tool Gap

Manual DeepSeek/OpenCode work on the MCP bridge repeatedly produces uncommitted file changes that GPT/operator must inspect before accepting and committing.

Terminal `git status`, `git diff --stat`, `grep`, and patch inspection are valid debugging tools, but this pattern is stable, repeated, bounded, and operationally meaningful.

ForgePilot should expose a typed read-only inspection surface for model-made workspace changes.

## Classification

```text
READ_ONLY_MODEL_CHANGE_INSPECTION
```

## Scope

Implement read-only inspection only.

Do not stage files, commit files, write files, run builds/tests, create approvals, create request artifacts, start OpenCode, contact the runner start endpoint, or mutate execution state.

## Expected Artifacts

```text
runs/FP-MCP-208/deepseek-change-inspection-tool-prompt.md
runs/FP-MCP-208/handoff-record.json
```

## Expected Result

```text
FP_MCP_208_DEEPSEEK_WORKSPACE_CHANGE_INSPECTION_TOOL_PROMPT_PREPARED
```
