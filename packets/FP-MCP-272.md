# FP-MCP-272 — Operator Review Manifest and Final-Brake Approval Doctrine

## Checkpoint Type

```text
OPERATOR_DOCTRINE_REQUIREMENT
```

## Summary

This checkpoint refines the FP-MCP-269/270/271 popup discussion. ForgePilot is not a consumer hand-holding wrapper or magical black box. It is an operator system intended for competent domain operators across fields, including but not limited to software development. No UI can prevent ignorant decisions. ForgePilot's safety responsibility is to prevent hidden scope, ambiguous authority, stale evidence, silent escalation, and unrecorded decisions, not to substitute for domain judgment. Human approval is meaningful only after the operator has reviewed the relevant packet, request, approval, artifact, workspace, commit, model, run mode, expiry, and side-effect evidence. The popup is the final confirmation boundary, analogous to a file-deletion or deploy confirmation: if the operator approves, the bounded action proceeds. Therefore, a popup is not itself the review process; it is a brake in case the AI selected or prepared the wrong action. Always allow is not universally bad and may be acceptable for stable low-risk observers, but it is forbidden by operator rule for fresh-scoped high-significance actions such as clearance creation, approval consumption, disable-switch changes, runner start, OpenCode start, prompt submission, and wait-endpoint calls, because those actions require fresh review of current state each time. Future clearance/execution workflows should present a review manifest before invoking the final popup so the operator knows exactly which files/artifacts and fields must be inspected before choosing Deny or Allow once.

## Claim

```text
FP-MCP-272 records that ForgePilot assumes competent domain operators; the approval popup is a final brake after review, not the review itself, and persistent approval is inappropriate only for fresh-scoped high-significance actions whose safety depends on current execution state.
```

## Caveats

- This is a doctrine and requirements checkpoint, not an implementation of a new preview tool or UI override.
- ForgePilot cannot make approval by an unqualified or inattentive person safe; it can only expose scope, evidence, and consequences for a competent operator.
- The platform popup may still expose Always allow. FP-MCP-272 records an operator rule against using it for fresh-scoped high-significance actions; it does not prove the platform can suppress the button.
- A review manifest must not become ritualized boilerplate. It must point to concrete files/artifacts/fields that the operator is responsible for checking.
- This doctrine applies beyond software development: any domain-specific ForgePilot usage assumes competent operators in that domain.

## Boundaries

- execution authorized: false
- local clearance created: false
- approval consumed: false
- disable switch cleared: false
- runner start endpoint contacted: false
- OpenCode started: false
- OpenCode HTTP session created: false
- prompt submitted: false
- wait endpoint called: false
- FP-027 canary run: false
- implementation changed: false
- UI changed: false

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
FP-MCP-272 records that ForgePilot assumes competent domain operators; the approval popup is a final brake after review, not the review itself, and persistent approval is inappropriate only for fresh-scoped high-significance actions whose safety depends on current execution state.
```
