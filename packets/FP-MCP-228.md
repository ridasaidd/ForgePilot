# FP-MCP-228 — One-Shot Disable-Switch Clearance Policy for Guarded Canary

## Checkpoint Type

```text
ONE_SHOT_DISABLE_CLEARANCE_POLICY_DECISION
```

## Summary

Record the policy decision for the final deliberate execution blocker after FP-MCP-227 produced valid approval evidence and valid operator-local clearance, while guarded preflight remained blocked only by the deliberate disable/execution-enable policy. The disable switch must not become a standing enable mode. Any future clearance must be one-shot, tuple-bound, and self-revoking: validate the request artifact, approval, operator-local clearance, and guarded preflight; clear execution only for the exact validated attempt; contact the runner start endpoint at most once; record approval consumption and pre/post state; then immediately restore disabled state or otherwise make the tuple unusable for any second attempt. This packet is a policy decision only and does not implement or perform execution enablement.

## Claim

```text
FP_MCP_228_ONE_SHOT_DISABLE_CLEARANCE_POLICY_RECORDED
```

## Caveats

- The FP-MCP-227 approval and operator-local clearance were valid at observation time but are time-boxed and may expire before implementation is ready.
- The existing local clearance artifact expires at 2026-07-03T13:22:30.944357Z and must not be reused after expiry.
- The existing approval expires at 2026-07-03T13:30:00.000Z and must not be consumed after expiry.
- No standing execution authority is approved by this policy.
- No generic global disable-switch clearing tool is approved.
- The next implementation must preserve FP-MCP-217: execution authorization remains human-local and outside the model-callable MCP surface; MCP may observe/validate but must not create local clearance.
- If implementation cannot complete before expiry, a fresh approval and fresh local clearance must be created and observed before any canary attempt.

## Boundaries

- execution authorized by this packet: false
- approval consumed: false
- disable switch cleared: false
- runner start endpoint contacted: false
- OpenCode started: false
- FP-027 canary run: false
- local clearance artifact created: false
- local clearance artifact mutated: false
- standing execution authority created: false
- global execution enablement approved: false

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
FP_MCP_228_ONE_SHOT_DISABLE_CLEARANCE_POLICY_RECORDED
```
