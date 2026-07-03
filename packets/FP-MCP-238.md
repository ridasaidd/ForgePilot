# FP-MCP-238 — Approval Consumption Fix Live Verification

## Checkpoint Type

```text
FIX_ACTIVATION_VERIFIED
```

## Summary

After the operator restarted and refreshed the MCP service, runtime diagnostics showed the service PID changed from 787440 to 789985, activating the FP-MCP-234 bridge fix. Live validation again proved the FP-MCP-233 approval is expired and unusable and the old popup-created clearance is expired, stale against current HEAD, and ineligible. A post-restart consumption-recorder probe did not write consumption because the approval is expired, but it no longer emitted APPROVAL_SCOPE_MISMATCH, APPROVAL_REQUEST_BINDING_INVALID, or APPROVAL_TEXT_INVALID. This verifies the hardcoded FP-MCP-036 scope bug is no longer active in the live service. Retroactive consumption of the expired FP-MCP-233 approval remains impossible; future fresh successful starts must verify immediate approval consumption under the fixed recorder.

## Claim

```text
FP_MCP_238_APPROVAL_CONSUMPTION_SCOPE_FIX_ACTIVE_OLD_APPROVAL_UNUSABLE
```

## Caveats

- This does not retroactively consume the FP-MCP-233 approval.
- The FP-MCP-233 approval remains unconsumed but expired and unusable.
- The old local clearance remains present on disk but is expired and stale against current HEAD, therefore ineligible.
- This verification proves the scope-mismatch bug is no longer active in the live service, but a future fresh unexpired approval path must still prove that consumption can be recorded immediately after a successful start.
- No runner start, OpenCode start, or new execution occurred during this verification.

## Boundaries

- execution authorized: false
- approval created: false
- approval consumed: false
- local clearance created: false
- runner start endpoint contacted: false
- OpenCode started: false
- FP-027 canary run: false
- disable switch cleared: false
- retroactive consumption claimed: false

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
FP_MCP_238_APPROVAL_CONSUMPTION_SCOPE_FIX_ACTIVE_OLD_APPROVAL_UNUSABLE
```
