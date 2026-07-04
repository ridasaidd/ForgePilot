# FP-MCP-278 — MCP Refactor as First Observed Workload Decision

## Checkpoint Type

```text
OBSERVED_WORKLOAD_DECISION
```

## Summary

The project has reached the transition from building observatory controls toward using ForgePilot to observe real work. The MCP bridge server still needs refactoring, but that refactor should not be removed from the evidence stream by doing it manually as ordinary maintenance. It is a valuable first serious observed workload: real codebase, real architectural pressure, real regression risk, measurable outcomes, and clear cross-model comparison potential. This decision updates the sequence implied by FP-MCP-277: the master plan refresh should state that the MCP refactor is a planned observed workload. Before broad data gathering, FP-027 still must be completed end-to-end once and the observed refactor packet must define success criteria, forbidden changes, test commands, audit requirements, and comparison standards. No execution, approval, clearance, or runner contact is authorized by this decision.

## Claim

```text
FP-MCP-278 records that the MCP bridge server refactor should become an observed open-weight model workload, not silent GPT/operator maintenance before observation; GPT/operator should prepare the packet, constraints, tests, audit checklist, and comparison criteria, while open-weight models perform the refactor under ForgePilot observation.
```

## Caveats

- This decision does not start the MCP refactor.
- This decision does not authorize a model run.
- This decision does not approve FP-MCP-276 execution.
- This decision does not create local clearance or consume approval.
- The MCP refactor should be packetized before model execution, with exact module boundaries and behavior-preservation requirements.
- Broad data gathering should still wait until guarded execution and observation workflow are proven repeatable.

## Boundaries

- human approval not recorded
- local clearance not created
- approval not consumed
- disable switch not cleared
- runner start endpoint not contacted
- OpenCode not started
- OpenCode session not created
- prompt not submitted
- wait not called
- canary not run
- MCP bridge source not modified

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
FP-MCP-278 records that the MCP bridge server refactor should become an observed open-weight model workload, not silent GPT/operator maintenance before observation; GPT/operator should prepare the packet, constraints, tests, audit checklist, and comparison criteria, while open-weight models perform the refactor under ForgePilot observation.
```
