# FP-MCP-293 — Minimal FP-027 Canary Path Selection

## Checkpoint Type

```text
NEXT_WORK_SELECTION
```

## Summary

FP-MCP-293 records the chosen next path without executing it. The registration-extraction refactor remains deferred as a model-executed workload until a minimal FP-027 canary has been completed and admitted. The canary must be boring and non-refactor, use one worker in DESIGN_ONLY mode, perform no source edits, and include process/state evidence at the contact boundary, live stop-readiness, no-retry/no-chaining discipline, and admitted result evidence. Manual maintenance remains a valid separate option only if explicitly packetized, but it is not the selected next path here. Direct HTTP remains design/canary/planning only under FP-MCP-291. This checkpoint does not create a request artifact, record approval, create clearance, clear disable switches, contact the runner start endpoint, start OpenCode, submit prompts, or run FP-027.

## Claim

```text
FP-MCP-293 selects Path A after the auditor accepted FP-MCP-292: the next real work should be a minimal FP-027 guarded/worker canary on a boring non-refactor task before any model-executed MCP bridge server.ts registration-extraction refactor is attempted.
```

## Caveats

- This selects the next path but does not run the canary.
- A fresh request/approval/preflight sequence is still required before any guarded/worker contact.
- Any expired prior approval must not be reused.
- The exact boring canary task still needs to be packetized before execution.
- The server.ts refactor remains deferred as a model-executed workload until the canary is admitted.

## Boundaries

- non-executing next-work selection only
- no request artifact created
- no human approval recorded
- no clearance created
- no disable switch cleared
- no runner start endpoint contact
- no OpenCode session or worker started
- no prompt submitted
- no FP-027 canary run
- no MCP bridge source changes
- no server.ts refactor

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
FP-MCP-293 selects Path A after the auditor accepted FP-MCP-292: the next real work should be a minimal FP-027 guarded/worker canary on a boring non-refactor task before any model-executed MCP bridge server.ts registration-extraction refactor is attempted.
```
