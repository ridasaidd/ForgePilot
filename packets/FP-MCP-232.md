# FP-MCP-232 — Add Popup-Approved Local Clearance Creation Tool

## Checkpoint Type

```text
TOOL_IMPLEMENTATION_RESULT
```

## Summary

Implemented a popup-approved MCP tool to create one short-lived, single-use operator-local execution clearance artifact without requiring the operator to paste and run a Python script. The tool validates the structured approval evidence first, refuses if approval is invalid, expired, unusable, or consumed, checks target workspace branch/commit/clean state and request artifact commit binding, writes only .local/forgepilot/execution-clearance.json in the MCP bridge workspace, and immediately reuses the read-only observer to validate that the created clearance is eligible. The tool does not consume approval, clear the disable switch, contact the runner start endpoint, start OpenCode, or run FP-027.

## Claim

```text
FP_MCP_232_POPUP_APPROVED_LOCAL_CLEARANCE_TOOL_IMPLEMENTED
```

## Caveats

- The running MCP service must be restarted before this new tool is available in ChatGPT.
- This tool intentionally relaxes the earlier strict FP-MCP-217 manual-shell boundary in favor of explicit popup-approved local clearance creation.
- The created clearance remains local, short-lived, exact-scoped, single-use, and bound to approval/request/model/run mode/branch/commits/workspace.
- The tool may overwrite an existing local clearance artifact; this is reported as clearanceMutated true.
- No canary or runner start was attempted by this packet.
- Existing FP-MCP-230 approval and local clearances are expired and must not be reused.

## Boundaries

- approval consumed: false
- disable switch cleared: false
- runner start endpoint contacted: false
- OpenCode started: false
- FP-027 canary run: false
- standing execution authority created: false
- broad clearance scope allowed: false

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
FP_MCP_232_POPUP_APPROVED_LOCAL_CLEARANCE_TOOL_IMPLEMENTED
```
