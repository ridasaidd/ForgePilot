# FP-MCP-286 — Approval Validation Staleness Handoff

## Checkpoint Type

```text
SESSION_HANDOFF
```

## Summary

Progress saved before ending the session. ForgePilot is clean at d233280. MCP bridge expected latest state is feature/oauth-auth0 with recorder fix commit 1821e6f and validator fix commit d45e9cc. Approval artifact APPROVAL-20260704T131745827Z-219382da exists under runs/FP-MCP-276/approvals/ and was committed in ForgePilot commit dbe0b1e. It is scoped to FP-MCP-276, request REQ-20260704T115428653Z-fc0b6275, model deepseek-v4-pro-high, run mode DESIGN_ONLY, repoCommit 3a62f84, branch main, and expires at 2026-07-04T15:17:33Z. Last validation in this session still failed with APPROVAL_TEXT_INVALID, indicating the validator fix was not live in the active MCP process or tool surface. No clearance was created, no approval was consumed, no disable switch was cleared, no runner start endpoint was contacted, and no OpenCode action occurred.

## Claim

```text
FP-MCP-286 saves the current approval-validation state for continuation in a fresh ChatGPT session: approval evidence exists and is committed, the recorder fix and validator fix are committed in the MCP bridge, but the live validator still returned APPROVAL_TEXT_INVALID in this session, likely due to tool/runtime staleness.
```

## Caveats

- The approval artifact expires at 2026-07-04T15:17:33Z.
- Do not proceed to clearance preview until approval validation succeeds.
- A fresh session should first verify MCP bridge status and live validator behavior.
- If validation still fails after confirming bridge commit d45e9cc is live, the validator fix needs another patch.

## Boundaries

- no new approval artifact created by this checkpoint
- approval not validated successfully yet
- local clearance not created
- approval not consumed
- disable switch not cleared
- runner start endpoint not contacted
- OpenCode not started
- prompt not submitted
- wait not called
- canary not run

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
FP-MCP-286 saves the current approval-validation state for continuation in a fresh ChatGPT session: approval evidence exists and is committed, the recorder fix and validator fix are committed in the MCP bridge, but the live validator still returned APPROVAL_TEXT_INVALID in this session, likely due to tool/runtime staleness.
```
