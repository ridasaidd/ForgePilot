# FP-MCP-365 Safe-Surface Eligibility Audit Evidence

## Result

Audited forgepilot_observe_next_gate for ChatGPT-safe eligibility.

## Baseline

- bridge branch: feature/oauth-auth0
- bridge commit inspected: 1688722
- bridge working tree: clean
- core baseline before recording: 8b68ebf

## Finding

forgepilot_observe_next_gate is registered and read-only, but not visible in the ChatGPT-safe profile because its contract surface is gated.

The absence from ChatGPT-safe is caused by contract surface filtering, not CANARY_ACTION_SURFACE_NARROWED.

## Behavior Assessment

forgepilot_observe_next_gate:

- writes files: false
- creates artifacts: false
- consumes approval: false
- clears disable switch: false
- contacts runner start endpoint: false
- starts OpenCode: false
- runs FP-027 canary: false
- mutates clearance or enablement files: false
- calls applyGuardedCanaryNextGate: false
- calls getGuardedCanaryNextGate: true

The handler is read-only.

## Risk

The current output includes execution-adjacent convenience fields:

- nextToolName
- nextToolArguments
- followOnAfterSuccess

Those fields can name gated, mutating, or execution-adjacent tools and may include pre-formed follow-on arguments or approval literals.

This is not appropriate for ChatGPT-safe exposure as-is.

## Recommendation

Recommendation C: expose only after modifications.

The future exposure packet should sanitize the observer output before changing the contract surface to ChatGPT-safe.

Required future behavior:

- nextRequiredGate remains visible
- reasons remain visible
- boundary remains visible
- nextToolName may remain only if justified as state transparency
- nextToolArguments should be null or suppressed
- followOnAfterSuccess should be absent or suppressed
- read-only boundary must remain true

## Future Packet

Recommended next packet:

- FP-MCP-366 — Expose sanitized guarded sequencer observer to ChatGPT-safe

Expected contract count change after implementation:

- defaultVisibleCount: 11 -> 12
- chatgptSafeVisibleCount: 11 -> 12
- registeredToolCount: 78 unchanged
- contractCount: 78 unchanged
- devVisibleCount: 76 unchanged
- allVisibleCount: 78 unchanged

## Non-Execution Statement

No files were changed in the bridge repo. No commits were made in the bridge repo. No services were restarted. No OpenCode start, runner start contact, approval consumption, disable-switch clearing, or FP-027 canary run occurred.
