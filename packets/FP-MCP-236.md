# FP-MCP-236 — Adopt Popup-Mediated Local Clearance Policy

## Checkpoint Type

```text
POLICY_DECISION
```

## Summary

Resolve the FP-MCP-235 reconciliation by explicitly adopting popup-mediated local clearance for ForgePilot MCP guarded starts. This decision supersedes the FP-MCP-217 prohibition on MCP-created local clearance for this scoped use case. The reason is operational: the operator is mostly on mobile, approvals are time-limited, and requiring a separately pasted local Python/script command made the clearance window brittle and error-prone. The adopted posture is not equivalent to hands-on-keyboard outside-MCP clearance; it is a deliberate weaker but accepted posture with explicit compensating controls. The forgepilot_create_operator_local_execution_clearance tool may create one exact, short-lived, single-use local clearance only after explicit ChatGPT/MCP popup approval and validation of committed approval evidence, current target HEAD, branch, clean workspace, request artifact, execution-base ancestry, gitignored clearance path, model, run mode, request id, and target workspace. This packet records policy only and does not create clearance, consume approval, contact runner start, start OpenCode, or run FP-027.

## Claim

```text
FP_MCP_236_POPUP_MEDIATED_LOCAL_CLEARANCE_POLICY_ADOPTED
```

## Caveats

- This is a deliberate revision of FP-MCP-217, not a UX-only restatement.
- A ChatGPT/MCP popup remains inside the model-callable tool surface; the operator approves a model-proposed action rather than independently initiating the clearance outside MCP.
- The successful FP-MCP-233 run is not used as proof that the policy was already clean; it remains historically governance-incomplete until FP-MCP-237 records its integrity review.
- This policy adoption does not retroactively mark the FP-MCP-233 approval consumed.
- The approval-consumption fix must still be activated and verified in a later packet.
- Popup-mediated clearance is permitted only through the exact scoped tool contract; any broad, wildcard, standing, or long-lived clearance remains forbidden.

## Boundaries

- execution authorized: false
- approval created: false
- approval consumed: false
- local clearance created: false
- runner start endpoint contacted: false
- OpenCode started: false
- FP-027 canary run: false
- standing execution authority created: false
- broad clearance scope allowed: false

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
FP_MCP_236_POPUP_MEDIATED_LOCAL_CLEARANCE_POLICY_ADOPTED
```
