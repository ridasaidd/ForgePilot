# FP-MCP-269 — Popup Clearance Human-Attention Display Requirements

## Checkpoint Type

```text
POLICY_REQUIREMENTS
```

## Summary

Record explicit requirements for what any popup-mediated local clearance approval must show and how it must behave. FP-MCP-236 deliberately revised FP-MCP-217 by allowing popup-mediated clearance under artifact/scope/binding controls, but those controls did not address the human-attention risk: an approval popup may be technically correct but too vague or frictionless to support real judgment. FP-MCP-269 closes the requirements gap by requiring popup displays to surface exact packet, request, approval, model, run mode, workspace, branch, HEAD, execution base, request artifact commit, expiry, and action side effects, and by requiring behavioral friction that distinguishes clearance creation from runner start or execution.

## Claim

```text
FP-MCP-269 defines human-attention display and friction requirements for popup-mediated local clearance so FP-MCP-236's weaker popup posture is not treated as a reflexive one-tap approval, before relying on it for future FP-027 guarded-runner-start work.
```

## Caveats

- This packet defines policy/requirements only; it does not implement UI changes in the MCP bridge or ChatGPT platform.
- This packet does not weaken FP-MCP-236's artifact/scope/binding controls; it adds a human-attention layer above them.
- This packet does not authorize any guarded runner start and does not run FP-027.
- Some popup UI behavior may be constrained by the ChatGPT/MCP client surface; if exact display control is not available, the MCP tool response/request text must compensate by making scope and side effects explicit before approval.
- Until these requirements are implemented or otherwise satisfied, popup-mediated clearance remains policy-adopted but human-attention-hardening-incomplete for future high-significance guarded starts.

## Boundaries

- execution authorized: false
- approval created: false
- approval consumed: false
- local clearance created: false
- runner start endpoint contacted: false
- OpenCode started: false
- OpenCode HTTP session created: false
- prompt submitted: false
- wait endpoint called: false
- disable switch cleared: false
- FP-027 canary run: false
- UI implementation changed: false

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
FP-MCP-269 defines human-attention display and friction requirements for popup-mediated local clearance so FP-MCP-236's weaker popup posture is not treated as a reflexive one-tap approval, before relying on it for future FP-027 guarded-runner-start work.
```
