# FP-MCP-294 — Minimal FP-027 Guarded Worker Canary Preparation

## Checkpoint Type

```text
CANARY_PREPARATION
```

## Summary

FP-MCP-294 prepares, but does not run, the minimal FP-027 canary selected by FP-MCP-293. The canary task is deliberately inert and non-refactor: ask one DESIGN_ONLY worker to read docs/forgepilot-master-plan.md and summarize its document structure at a high level without editing files, touching src/server.ts, inspecting MCP bridge source, changing workspace state, running commands, or chaining into any follow-up. The stale FP-MCP-276 tuple must not be reused because newer evidence commits have changed HEAD and the old approval has expired. The next eligible packet should create a fresh non-executing request artifact for this canary after FP-MCP-294 is committed, then proceed through operator review, fresh approval, preview/clearance, disable/enablement gates, pre-start evidence, process/state snapshot, live stop-readiness, no-retry/no-chaining evidence, exactly-one runner start contact, result verification, and admission. This checkpoint does not create the request artifact or authorize execution.

## Claim

```text
FP-MCP-294 prepares the minimal FP-027 guarded/worker canary as a fresh, boring, non-refactor task and explicitly forbids reusing stale FP-MCP-276 request/approval artifacts: the future canary must create a fresh request bound to the then-current clean ForgePilot HEAD before any approval, clearance, runner-start contact, OpenCode start, prompt submission, or approval consumption.
```

## Caveats

- This is preparation only; it does not run the canary.
- The exact future request must be created fresh after this checkpoint commit so it binds to the then-current clean HEAD.
- Do not reuse FP-MCP-276 request or approval artifacts for the future canary.
- The selected task must not touch src/server.ts or any MCP bridge source file.
- The selected task must not perform source edits, shell commands, git operations, or follow-up chaining.
- Direct HTTP remains unavailable for execution authority under FP-MCP-291.

## Boundaries

- non-executing preparation only
- no request artifact created
- no human approval recorded
- no approval consumed
- no clearance created
- no disable switch cleared
- no runner start endpoint contact
- no OpenCode session or worker started
- no prompt submitted
- no FP-027 canary run
- no source edits
- no MCP bridge source inspection or refactor

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
FP-MCP-294 prepares the minimal FP-027 guarded/worker canary as a fresh, boring, non-refactor task and explicitly forbids reusing stale FP-MCP-276 request/approval artifacts: the future canary must create a fresh request bound to the then-current clean ForgePilot HEAD before any approval, clearance, runner-start contact, OpenCode start, prompt submission, or approval consumption.
```
