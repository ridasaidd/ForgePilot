# FP-MCP-321 — Local Operator Final Gate Handoff

## Status

LOCAL_OPERATOR_HANDOFF

## Reason

ChatGPT successfully helped implement and verify the guarded final-gate executor path in the MCP bridge, but platform safety checks repeatedly blocked the final gate once the workflow approached execution.

This packet moves the final gate to a local human-operator handoff while preserving ForgePilot safety boundaries.

## Known State

- ForgePilot core last observed commit before handoff: 2d0fd02
- MCP bridge branch: feature/oauth-auth0
- MCP bridge final-gate implementation commit: 663dc62
- Reference execution packet: FP-MCP-295
- Reference request id: REQ-20260704T142232816Z-a82a42b6
- Model: deepseek-v4-pro-high
- Run mode: DESIGN_ONLY
- Execution base commit: 5c0ab8b
- Target workspace: forgepilot

## Required Local Operator Rules

1. Do not reuse expired approval, clearance, or enablement artifacts.
2. Create fresh short-lived approval.
3. Commit and validate the approval.
4. Use the sequencer before each gate.
5. Create fresh local clearance.
6. Read fresh runner capability status.
7. Create fresh scoped enablement.
8. Confirm the sequencer reports the final gate.
9. Invoke exactly one final guarded executor attempt locally.
10. Stop immediately after the returned result.
11. Record the full returned JSON as evidence.
12. Do not infer success from absence of failure.

## Boundaries

- No unbounded retries.
- No direct manual bypass of ForgePilot gates.
- No arbitrary OpenCode start outside the runner contract.
- No continuation beyond the first returned result.
