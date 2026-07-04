# FP-MCP-287 — Direct OpenCode HTTP Execution Path Decision

## Checkpoint Type

```text
EXECUTION_PATH_DECISION
```

## Summary

FP-MCP-287 records the operator decision to keep the remote runner available for legacy/optional purposes while proceeding on the direct OpenCode HTTP lifecycle path. This checkpoint does not refactor server.ts, does not start OpenCode, does not contact the runner start endpoint, does not consume approval, and does not authorize model execution. It exists to mark the architectural pivot before preparing direct-HTTP lifecycle/model-run work.

## Claim

```text
ForgePilot MCP should treat the remote runner as legacy optional infrastructure for now; the preferred near-term path for OpenCode model lifecycle work is the direct OpenCode HTTP API from the MCP bridge, with runner-start no longer required for the first HTTP-based model runs.
```

## Caveats

- The remote runner is not deleted and remains useful as a future isolated execution-plane abstraction.
- Existing guarded-runner artifacts remain historical evidence and should not be rewritten.
- FP-MCP-276 remains a runner-shaped preparation packet and should not be reused as authority for broad server.ts refactoring.
- A future implementation packet should make any code-level deprecation marker explicit in relevant docs or server capability metadata.

## Boundaries

- non-executing checkpoint only
- runner start endpoint not contacted
- OpenCode session not created
- prompt not submitted
- approval not consumed
- disable switch not cleared
- server.ts not modified

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
ForgePilot MCP should treat the remote runner as legacy optional infrastructure for now; the preferred near-term path for OpenCode model lifecycle work is the direct OpenCode HTTP API from the MCP bridge, with runner-start no longer required for the first HTTP-based model runs.
```
