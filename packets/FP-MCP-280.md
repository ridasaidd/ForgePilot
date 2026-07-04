# FP-MCP-280 — Operator Responsibility Structured Approval Modal Decision

## Checkpoint Type

```text
APPROVAL_BOUNDARY_PREPARATION
```

## Summary

FP-MCP-280 prepares the structured human approval boundary for the FP-MCP-276 request REQ-20260704T115428653Z-fc0b6275. The operator responsibility doctrine applies: the human operator owns authorization, policy judgment, and final responsibility. GPT prepares scope and evidence; ForgePilot records and enforces boundaries; the MCP approval modal is the final brake after review. This checkpoint exists so FP-MCP-280 can serve as the approval packet before a structured approval recorder retry. A prior full structured approval invocation was platform-blocked before reaching MCP; a compact retry reached MCP but correctly failed closed because FP-MCP-280 did not yet exist and the workspace was dirty. This checkpoint does not record approval itself.

## Claim

```text
FP-MCP-280 establishes that operator responsibility is the authority model and that structured human approval evidence may be recorded through the native MCP approval modal after review; approval recording does not create clearance, consume approval, clear disable switches, contact runner start, start OpenCode, submit prompts, call wait, or run a canary.
```

## Caveats

- This checkpoint is not human approval evidence.
- This checkpoint does not create local clearance.
- This checkpoint does not consume approval.
- This checkpoint does not clear the disable switch or enable execution.
- This checkpoint does not contact runner start or start OpenCode.
- A structured approval retry may still fail or be denied by the operator through the native MCP modal.

## Boundaries

- human approval not recorded by this checkpoint
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
FP-MCP-280 establishes that operator responsibility is the authority model and that structured human approval evidence may be recorded through the native MCP approval modal after review; approval recording does not create clearance, consume approval, clear disable switches, contact runner start, start OpenCode, submit prompts, call wait, or run a canary.
```
