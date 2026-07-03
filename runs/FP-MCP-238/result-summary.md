# FP-MCP-238 Result Summary

## Result

```text
FP_MCP_238_APPROVAL_CONSUMPTION_REUSE_RISK_CLOSED_BY_EXPIRY_FIX_NOT_YET_LIVE
```

## Summary

Review the FP-MCP-234 approval-consumption scope fix and the FP-MCP-233 unconsumed approval state. The bridge fix exists at commit e4797c6, but the MCP service restart could not be performed from the MCP terminal environment because the user systemd bus was unavailable. Runtime diagnostics showed the live process still had the old PID, so the fix is not yet active in the running MCP service. Live validation proved the FP-MCP-233 approval is expired and unusable, and the popup-created local clearance is expired, stale against current HEAD, and not eligible. A consumption-recorder probe did not write consumption; it showed APPROVAL_EXPIRED plus the old APPROVAL_SCOPE_MISMATCH/APPROVAL_REQUEST_BINDING_INVALID/APPROVAL_TEXT_INVALID reasons, confirming the old service code is still live. The immediate reuse risk from the FP-MCP-233 unconsumed approval is closed by expiry and stale clearance, but the FP-MCP-234 fix still requires an external service restart and a fresh future-path verification.

## Boundary

No execution was authorized. No approval was consumed. The disable switch was not cleared. The runner start endpoint was not contacted. OpenCode was not started. FP-027 did not run.
