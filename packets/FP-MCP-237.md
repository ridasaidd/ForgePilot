# FP-MCP-237 — FP-MCP-233 Guarded Start Integrity Review

## Checkpoint Type

```text
HISTORICAL_INTEGRITY_REVIEW
```

## Summary

Record an integrity review of the first successful guarded OpenCode execution path from FP-MCP-233. The engineering result remains real: popup-mediated local clearance was created, the remote runner accepted the guarded start, OpenCode started, and DESIGN_ONLY outputs were produced and committed. The governance and lifecycle result is not clean: popup-mediated clearance was used before FP-MCP-217 reconciliation was recorded, full FP-027 canary discipline evidence was not captured for the actual first start, approval consumption failed after start due the hardcoded FP-MCP-036 scope bug, and a bounded approval reuse window existed until the approval and local clearance expired. This packet records the historical truth without erasing the successful run or laundering the integrity gaps.

## Claim

```text
FP_MCP_237_FP_MCP_233_GUARDED_START_INTEGRITY_REVIEW_RECORDED
```

## Caveats

- FP-MCP-233 was technically successful but governance-incomplete at the moment it ran.
- Popup-mediated clearance was later adopted explicitly by FP-MCP-236, but that decision came after the FP-MCP-233 start and therefore does not retroactively make the original start clean.
- The evidence does not prove process-tree snapshot immediately before runner contact, live abort-readiness check immediately before contact, or a formal no-retry/no-chaining state-machine gate for the actual first real start.
- Approval consumption was not recorded after the successful start; the single-use guarantee did not mechanically close immediately after execution.
- The approval and clearance reuse risk was bounded by expiry and by the requirement for another popup/tool call, but bounded risk is not the same as a fulfilled guarantee.
- No evidence indicates that a second start was attempted with the same approval.
- This packet is historical review only; it does not attempt retroactive consumption or any new start.

## Boundaries

- execution authorized by this packet: false
- approval created: false
- approval consumed: false
- local clearance created: false
- runner start endpoint contacted: false
- OpenCode started: false
- FP-027 canary run: false
- historical start erased: false
- historical integrity gaps hidden: false

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
FP_MCP_237_FP_MCP_233_GUARDED_START_INTEGRITY_REVIEW_RECORDED
```
