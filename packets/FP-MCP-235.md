# FP-MCP-235 — Reconcile FP-MCP-217 With Popup-Approved Local Clearance

## Checkpoint Type

```text
POLICY_RECONCILIATION_OPENED
```

## Summary

Record an explicit governance reconciliation for the conflict between FP-MCP-217 and FP-MCP-232. FP-MCP-217 established that MCP may observe and validate operator-local clearance, but must not create it; the final clearance act belonged outside the model-callable MCP surface. FP-MCP-232 introduced forgepilot_create_operator_local_execution_clearance, a popup-approved MCP tool that creates the clearance artifact. This is not merely a UX improvement; it is a weaker and different safety posture that revises the FP-MCP-217 boundary if adopted. This packet does not ratify the popup-mediated posture merely because it worked once. It opens the policy decision explicitly and requires a follow-up decision before popup-mediated clearance is used for further real starts.

## Claim

```text
FP_MCP_235_FP_MCP_217_POPUP_CLEARANCE_RECONCILIATION_RECORDED
```

## Caveats

- FP-MCP-232/233 are classified as functionally successful but governance-incomplete until this reconciliation is resolved.
- A ChatGPT approval popup is still inside the model-callable MCP tool surface and does not satisfy the original FP-MCP-217 hands-on-keyboard outside-MCP boundary.
- The fact that the FP-MCP-233 run succeeded must not be used to launder or retroactively justify the boundary change.
- Both outcomes remain valid for the reconciliation: restore FP-MCP-217 original local-shell clearance requirement, or deliberately adopt popup-mediated clearance with documented threat-model changes and compensating controls.
- Popup-mediated clearance should not be used for additional real starts until a follow-up decision explicitly resolves this reconciliation.
- This checkpoint itself does not disable or remove the FP-MCP-232 tool; it records the governance state and required decision before further use.

## Boundaries

- execution authorized: false
- approval created: false
- approval consumed: false
- local clearance created: false
- runner start endpoint contacted: false
- OpenCode started: false
- FP-027 canary run: false
- popup-mediated clearance ratified: false
- standing execution authority created: false

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
FP_MCP_235_FP_MCP_217_POPUP_CLEARANCE_RECONCILIATION_RECORDED
```
