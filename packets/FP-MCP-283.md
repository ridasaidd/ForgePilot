# FP-MCP-283 — Approval Recorder Compatibility Fix

## Checkpoint Type

```text
MCP_BRIDGE_BUG_FIX_RESULT
```

## Summary

MCP bridge commit 1821e6f updates src/server.ts and the hardcoded packet-id allowlist. The real approval recorder now supports optional executionPacketId, accepts clear scoped operator approval statements as well as canonical approval text, records whether approval text was canonical or explicit, and extends max approval lifetime from 30 minutes to two hours. Validation passed with pnpm build and pnpm test. No approval artifact, local clearance, approval consumption, disable-switch change, runner contact, or OpenCode action occurred. The active MCP tool surface may need reload before the new schema is visible in ChatGPT.

## Claim

```text
FP-MCP-283 fixes the MCP bridge real-human approval recorder bug: approval scope is no longer hardcoded to FP-MCP-036, executionPacketId can bind approval scope separately from the recorder packet, simple scoped operator chat approval text is accepted, and the approval review window is now two hours.
```

## Caveats

- Bridge commit 1821e6f may require MCP reload before use.
- No approval artifact was recorded.
- Previous chat approval should not be silently converted after reload without an explicit scoped recording step.

## Boundaries

- approval artifact not recorded
- local clearance not created
- approval not consumed
- disable switch not cleared
- runner start endpoint not contacted
- OpenCode not started
- prompt not submitted
- wait not called
- canary not run

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
FP-MCP-283 fixes the MCP bridge real-human approval recorder bug: approval scope is no longer hardcoded to FP-MCP-036, executionPacketId can bind approval scope separately from the recorder packet, simple scoped operator chat approval text is accepted, and the approval review window is now two hours.
```
