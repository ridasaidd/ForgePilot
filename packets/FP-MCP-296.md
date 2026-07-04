# FP-MCP-296 — Fresh Scoped Canary Approval Result

## Checkpoint Type

```text
HUMAN_APPROVAL_RESULT
```

## Summary

FP-MCP-296 records the approval result after the auditor accepted the FP-MCP-295 request artifact. The approval artifact was created at runs/FP-MCP-296/approvals/APPROVAL-20260704T142523179Z-10b0b6f3.json, committed at e0b8a08, and validated against the exact FP-MCP-295 request scope. The prior humanApprovalPresent:null state is clarified as the expected pre-approval state meaning approval evidence had not yet been created; after validation, guarded orientation reports humanApprovalPresent:true and the human approval gate passes. The guarded preflight remains intentionally blocked on global disable, runner/OpenCode execution disabled, missing pre-start evidence, missing state snapshot evidence, and evidence-ledger readiness. No approval was consumed and no execution was authorized.

## Claim

```text
FP-MCP-296 recorded and validated fresh scoped human approval evidence for the FP-MCP-295 minimal FP-027 guarded/worker canary request: approval APPROVAL-20260704T142523179Z-10b0b6f3, request REQ-20260704T142232816Z-a82a42b6, model deepseek-v4-pro-high, run mode DESIGN_ONLY, branch main, scoped repo commit 5c0ab8b; validation passed with approvalUsableForExecution true, scopeMatchesExpected true, artifactCommitted true, notConsumed true, while execution remained disabled and no runner start/OpenCode execution occurred.
```

## Caveats

- The approval expires at 2026-07-04T14:40:00.000Z and must not be reused after expiration.
- Approval validity does not clear the global disable switch or authorize runner start by itself.
- The approval is scoped to repo commit 5c0ab8b from the request artifact; the approval artifact commit is e0b8a08 and the request artifact commit is 5d14349.
- humanApprovalPresent:null before approval is treated as approval not yet created at that stage, not an explicit denial.
- The generic execution enablement component may still report humanApprovalRecorded:false while guarded preflight with approvalId shows the specific human approval gate passed; the specific scoped guarded preflight result is the relevant gate for this request.

## Boundaries

- approval evidence result only
- no approval consumed
- no clearance created
- no disable switch cleared
- no runner start endpoint contact
- no OpenCode session or worker started
- no prompt submitted
- no FP-027 canary run
- no source edits
- no MCP bridge source inspection or refactor
- guarded preflight still not passable

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
FP-MCP-296 recorded and validated fresh scoped human approval evidence for the FP-MCP-295 minimal FP-027 guarded/worker canary request: approval APPROVAL-20260704T142523179Z-10b0b6f3, request REQ-20260704T142232816Z-a82a42b6, model deepseek-v4-pro-high, run mode DESIGN_ONLY, branch main, scoped repo commit 5c0ab8b; validation passed with approvalUsableForExecution true, scopeMatchesExpected true, artifactCommitted true, notConsumed true, while execution remained disabled and no runner start/OpenCode execution occurred.
```
