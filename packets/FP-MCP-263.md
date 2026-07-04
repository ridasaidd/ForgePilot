# FP-MCP-263 — HTTP lifecycle single-shot gate implementation

## Checkpoint Type

```text
TOOL_IMPLEMENTATION_RESULT
```

## Summary

Implemented forgepilot_run_opencode_http_lifecycle_single_shot_gate in the MCP bridge. The gate reuses the existing plan invocation dry-run gate, blocks on approval mismatch, prompt/expected hash mismatch, ineligible plans, and cleanup-disabled plans, writes single-shot preflight/result artifacts around the lifecycle, creates at most one OpenCode HTTP session through the existing orchestrator, submits one prompt, attempts cleanup, and preserves V1 boundaries. Verification passed with pnpm test, including tsc and hardcoded packet-id lint. The new tool was not invoked in this session.

## Claim

```text
The MCP bridge now implements a gated OpenCode HTTP lifecycle single-shot tool that validates an existing lifecycle plan, requires caller-supplied prompt and expected text hashes to match the plan, enforces cleanup for V1, writes preflight/result artifacts, and delegates to the bounded HTTP lifecycle orchestrator without contacting the ForgePilot runner start endpoint or starting OpenCode from terminal.
```

## Caveats

- The running MCP server in this ChatGPT session has not been reloaded, so the newly implemented tool may not be surfaced until the bridge service restarts or reloads.
- The implementation was source-verified and build/test-verified, but the real single-shot gate was intentionally not invoked because FP-MCP-263 scoped implementation, not live model execution.
- The gate depends on caller-supplied promptText and expectedText because the lifecycle plan stores hashes, not raw prompt contents.
- If lifecycle cleanup fails after a session is created, the gate classifies the terminal state as CLEANUP_INCOMPLETE rather than treating absence of cleanup as success.

## Boundaries

- single-shot only
- cleanup required for V1
- no retained sessions by design
- no correction loops
- no multi-turn repair mode
- no wait endpoint call
- no ForgePilot runner start endpoint contact
- no OpenCode process start from terminal
- no approval consumption
- no direct invocation of the new real gate during implementation

## Non-Execution Boundary

```text
execution authorized: false
approval consumed: false
disable switch cleared: false
runner start endpoint contacted: false
OpenCode started: false
FP-027 canary run: false
```

## Expected Result

```text
The MCP bridge now implements a gated OpenCode HTTP lifecycle single-shot tool that validates an existing lifecycle plan, requires caller-supplied prompt and expected text hashes to match the plan, enforces cleanup for V1, writes preflight/result artifacts, and delegates to the bounded HTTP lifecycle orchestrator without contacting the ForgePilot runner start endpoint or starting OpenCode from terminal.
```
