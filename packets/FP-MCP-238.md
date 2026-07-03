# FP-MCP-238 — Approval Consumption Fix Activation Review

## Checkpoint Type

```text
FIX_ACTIVATION_PARTIAL_REVIEW
```

## Summary

Review the FP-MCP-234 approval-consumption scope fix and the FP-MCP-233 unconsumed approval state. The bridge fix exists at commit e4797c6, but the MCP service restart could not be performed from the MCP terminal environment because the user systemd bus was unavailable. Runtime diagnostics showed the live process still had the old PID, so the fix is not yet active in the running MCP service. Live validation proved the FP-MCP-233 approval is expired and unusable, and the popup-created local clearance is expired, stale against current HEAD, and not eligible. A consumption-recorder probe did not write consumption; it showed APPROVAL_EXPIRED plus the old APPROVAL_SCOPE_MISMATCH/APPROVAL_REQUEST_BINDING_INVALID/APPROVAL_TEXT_INVALID reasons, confirming the old service code is still live. The immediate reuse risk from the FP-MCP-233 unconsumed approval is closed by expiry and stale clearance, but the FP-MCP-234 fix still requires an external service restart and a fresh future-path verification.

## Claim

```text
FP_MCP_238_APPROVAL_CONSUMPTION_REUSE_RISK_CLOSED_BY_EXPIRY_FIX_NOT_YET_LIVE
```

## Caveats

- The FP-MCP-234 bridge fix has been committed but is not yet active in the live MCP service.
- The MCP terminal environment could not run systemctl --user restart because it could not connect to the user bus: No medium found.
- The FP-MCP-233 approval was not retroactively consumed and cannot be treated as mechanically consumed.
- The old approval is expired and unusable by live validator evidence, not merely inferred from timestamps.
- The old local clearance is expired and stale against current HEAD by live observer evidence.
- The consumption-recorder probe was non-writing because approval was unusable; it confirmed old service code still emits the hardcoded-scope mismatch reasons.
- A later packet must restart the MCP service outside the MCP terminal environment and verify the consumption fix with a fresh non-starting fixture or the next fresh guarded start lifecycle.

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
FP_MCP_238_APPROVAL_CONSUMPTION_REUSE_RISK_CLOSED_BY_EXPIRY_FIX_NOT_YET_LIVE
```
