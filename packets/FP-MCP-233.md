# FP-MCP-233 — Fresh Popup-Clearance Canary Attempt Result

## Checkpoint Type

```text
GUARDED_START_RESULT
```

## Summary

A fresh FP-MCP-233 structured approval was recorded, committed, and validated. The new FP-MCP-232 popup-approved local clearance tool created a short-lived local clearance for the exact tuple without manual Python scripting. A guarded start request for FP-MCP-223 was then accepted by the remote runner. OpenCode started successfully with runnerRunId RUN-20260703T174527866Z-8630e8a1 and completed a DESIGN_ONLY run. Runner pre/post start evidence, stdout/stderr logs, and the produced DESIGN_ONLY outputs were committed under runs/FP-MCP-223/deepseek-v4-pro-high-DESIGN_ONLY/. Approval consumption recording was attempted after start, but the existing consumption recorder refused due an approval-scope/text contract mismatch; this remains a follow-up fix and no duplicate start was attempted.

## Claim

```text
FP_MCP_233_POPUP_CLEARANCE_GUARDED_START_ACCEPTED_AND_DESIGN_ONLY_OUTPUTS_RECORDED
```

## Caveats

- Approval consumption evidence was not recorded because forgepilot_record_human_approval_consumption refused with APPROVAL_SCOPE_MISMATCH, APPROVAL_REQUEST_BINDING_INVALID, and APPROVAL_TEXT_INVALID.
- The failed approval-consumption recorder behavior appears to be a contract mismatch separate from the guarded start path.
- The OpenCode run output claims DESIGN_ONLY boundary preserved, but the start itself necessarily contacted the runner start endpoint and started OpenCode as intended for this canary.
- No second guarded start attempt was made after the successful start.
- The popup-created local clearance expires and must not be reused.

## Boundaries

- runner start endpoint contacted: true
- OpenCode started: true
- FP-027 canary/guarded DESIGN_ONLY run started: true
- approval consumed: false due recorder mismatch
- disable switch cleared as standing state: false
- standing execution authority created: false
- second start attempt after success: false

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
FP_MCP_233_POPUP_CLEARANCE_GUARDED_START_ACCEPTED_AND_DESIGN_ONLY_OUTPUTS_RECORDED
```
