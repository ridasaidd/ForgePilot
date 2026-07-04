# FP-MCP-306 — Scoped Enablement Tool Discovery and Negative Checks

## Checkpoint Type

```text
NEGATIVE_TOOL_CHECK_RESULT
```

## Summary

After the operator restarted the MCP bridge service and refreshed actions, api_tool discovery found the new scoped enablement tools: preview, create, and status. A stale FP-MCP-295 tuple using expired FP-MCP-302 approval, expired local clearance CLEARANCE-20260704T145411583Z-29b22ae0, current ForgePilot HEAD 638fbe3, and stale runner capability timestamp 2026-07-04T14:54:29.547Z was used for negative testing. The preview result was read-only and returned eligibleToInvokeEnablementPopup false with reasons including APPROVAL_EXPIRED, CLEARANCE_VALID_FAILED, and RUNNER_CAPABILITY_OBSERVATION_FRESH_FAILED. The create result returned enablementCreated false, enablementMutated false, filesWritten false, approvalUsableForExecution false, and reasons APPROVAL_NOT_USABLE_FOR_SCOPED_ENABLEMENT plus APPROVAL_EXPIRED. The status result reported enablementArtifactPresent false, eligibleForScopedExecutionEnablement false, and no usable local enablement. A terminal check confirmed the MCP bridge working tree is clean at 36c3d5a and .local/forgepilot/execution-enablement.json is absent.

## Claim

```text
FP-MCP-306 verified that the FP-MCP-305 scoped enablement tools are discoverable after bridge restart and that stale inputs fail closed: preview was read-only and ineligible, create refused without writing the enablement artifact, and status reported no usable enablement artifact. No guarded run was attempted.
```

## Caveats

- Only stale/expired negative checks were run; no fresh approval, clearance, or positive enablement was created.
- The previous local clearance file still exists but is expired and bound to requestArtifactCommit 9a0b6b7, so it is not usable for current HEAD 638fbe3.
- This packet does not integrate scoped enablement into aggregate orientation or guarded preflight reporting.
- No attempt was made to contact runner start or start OpenCode.

## Boundaries

- tool discovery and negative checks only
- no fresh approval created
- no local enablement artifact created
- no approval consumed
- no runner start contact
- no OpenCode session or worker started
- no prompt submitted
- no guarded canary run
- no direct HTTP execution authority

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
FP-MCP-306 verified that the FP-MCP-305 scoped enablement tools are discoverable after bridge restart and that stale inputs fail closed: preview was read-only and ineligible, create refused without writing the enablement artifact, and status reported no usable enablement artifact. No guarded run was attempted.
```
