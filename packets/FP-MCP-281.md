# FP-MCP-281 — Simplified Human Approval Evidence Path

## Checkpoint Type

```text
APPROVAL_EVIDENCE_PATH_DECISION
```

## Summary

After FP-MCP-280 showed that the structured approval recorder path was too brittle and could be platform-blocked, FP-MCP-281 records a simpler doctrine. Human approval should not require custom confirmation modals or excessive ceremony. A clear operator statement in chat can be recorded as semantic approval evidence when it is bound to a specific packet/request/model/run mode/commit/branch and when the operator acknowledges responsibility. The MCP modal remains useful as authorization for the evidence-recording tool call, but it is not the semantic approval itself. This packet records the simplified approval evidence path only; it does not approve FP-MCP-276, create clearance, consume approval, clear disable switches, contact runner start, start OpenCode, submit prompts, call wait, or run a canary.

## Claim

```text
FP-MCP-281 simplifies the human approval model: for scoped ForgePilot approvals, the human operator's clear chat statement may serve as semantic approval evidence, while MCP/tool approval modals authorize the tool action only; the human operator remains the last line of defense and owns authorization, policy judgment, and final responsibility.
```

## Caveats

- This packet records the approval-path doctrine only; it is not approval for FP-MCP-276.
- Future approval evidence must still bind to a concrete request scope.
- The human operator's responsibility is not transferred to GPT or ForgePilot.
- The MCP modal authorizes tool use; it should not be treated as the only place where semantic approval can exist.
- Approval still does not prove correctness and does not admit execution evidence.

## Boundaries

- FP-MCP-276 not approved by this packet
- local clearance not created
- approval not consumed
- disable switch not cleared
- runner start endpoint not contacted
- OpenCode not started
- OpenCode session not created
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
FP-MCP-281 simplifies the human approval model: for scoped ForgePilot approvals, the human operator's clear chat statement may serve as semantic approval evidence, while MCP/tool approval modals authorize the tool action only; the human operator remains the last line of defense and owns authorization, policy judgment, and final responsibility.
```
