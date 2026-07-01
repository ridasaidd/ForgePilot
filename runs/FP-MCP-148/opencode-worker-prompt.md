# FP-MCP-148 OpenCode Worker Prompt

Repository to modify:

`/home/ridasaidd/forgepilot-chatgpt-mcp`

ForgePilot packet:

`/home/ridasaidd/forgepilot/packets/FP-MCP-148.md`

Request artifact:

`/home/ridasaidd/forgepilot/runs/FP-MCP-148/opencode-requests/REQ-20260701T174913920Z-772131aa.json`

Base ForgePilot commit for request context:

`b4a7fd4`

## Task

Implement FP-MCP-148 in the MCP bridge repository.

## Required behavior

1. Add a terminal execution kill switch.
   - Environment variable name: `FORGEPILOT_TERMINAL_EXECUTION_ENABLED`.
   - If the value is exactly `false`, `forgepilot_execute_terminal_command` must refuse before spawning any shell command.
   - The refusal must still return a structured result explaining that terminal execution is disabled.
   - Existing non-terminal MCP tools must not be disabled by this switch.

2. Fix the sanitized command environment so project-local Node tooling works.
   - The terminal command tool should include `/home/ridasaidd/.nvm/versions/node/v24.4.1/bin` in PATH.
   - `pnpm build` in `/home/ridasaidd/forgepilot-chatgpt-mcp` should work through the terminal tool without a manual PATH prefix.
   - Do not reintroduce broad environment inheritance.

3. Block container-engine commands.
   - Block command execution when the invoked command attempts to use `docker`, `podman`, or `nerdctl`.
   - The block must happen before shell execution.
   - The block must be recorded in the tool result/evidence like other blocked commands.

4. Preserve existing behavior.
   - Keep ChatGPT MCP approval popup as the human approval surface.
   - Keep `approval: EXECUTE_TERMINAL_COMMAND` requirement.
   - Keep workspace allowlist behavior.
   - Keep existing hard blocks.
   - Keep stdout/stderr/exit/timing/evidence capture for allowed commands.
   - Do not change guarded OpenCode runner behavior.
   - Do not add unrelated features.

## Verification

Run from `/home/ridasaidd/forgepilot-chatgpt-mcp`:

1. `pnpm build`
2. Any existing tests or the repository test command if present.

Also inspect or manually verify that:

1. Kill switch false refuses before shell execution.
2. Container-engine commands are blocked before shell execution.
3. The terminal command tool remains registered.
4. Existing normal read-only commands still work when the kill switch is unset.

## Required output to report back

Return a concise implementation report containing:

- changed files,
- behavior implemented,
- verification commands and results,
- whether the MCP bridge service needs restart,
- any remaining gaps or audit concerns.

Do not commit changes. Do not restart services. Leave final commit/restart to GPT/human review.
