# FP-MCP-238 Result Summary

## Result

```text
FP_MCP_238_APPROVAL_CONSUMPTION_SCOPE_FIX_ACTIVE_OLD_APPROVAL_UNUSABLE
```

## Summary

After the operator restarted and refreshed the MCP service, runtime diagnostics showed the service PID changed from 787440 to 789985, activating the FP-MCP-234 bridge fix. Live validation again proved the FP-MCP-233 approval is expired and unusable and the old popup-created clearance is expired, stale against current HEAD, and ineligible. A post-restart consumption-recorder probe did not write consumption because the approval is expired, but it no longer emitted APPROVAL_SCOPE_MISMATCH, APPROVAL_REQUEST_BINDING_INVALID, or APPROVAL_TEXT_INVALID. This verifies the hardcoded FP-MCP-036 scope bug is no longer active in the live service. Retroactive consumption of the expired FP-MCP-233 approval remains impossible; future fresh successful starts must verify immediate approval consumption under the fixed recorder.

## Boundary

No execution was authorized. No approval was consumed. The disable switch was not cleared. The runner start endpoint was not contacted. OpenCode was not started. FP-027 did not run.
