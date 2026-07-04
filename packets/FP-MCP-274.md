# FP-MCP-274 — Clearance Review Manifest Live Surfacing

## Checkpoint Type

```text
LIVE_TOOL_SURFACING_RESULT
```

## Summary

FP-MCP-274 verifies the post-reload live MCP surface for the FP-MCP-273 preview tool. Discovery found forgepilot_preview_operator_local_execution_clearance_review_manifest. A live read-only preview call using the stale historical tuple returned previewOnly true, the follow-on tool name, the operator final-brake rule, review artifacts, exact scope fields, current repository state, approval validation result, and side-effect review. The preview correctly marked the stale tuple as not eligible because current commit and approval scope no longer match. It also showed that an existing gitignored local clearance file is present and that a follow-on clearance action would mutate the existing local file rather than create a new one. The boundary confirmed no clearance creation, no clearance mutation, no clearance deletion, no files written, no approval consumption, no disable-switch clearing, no runner start contact, and no OpenCode start.

## Claim

```text
After MCP bridge reload, the clearance review manifest preview tool is visible in ChatGPT MCP and one live read-only preview call succeeded without creating clearance, consuming approval, contacting the runner, starting OpenCode, submitting a prompt, or calling wait.
```

## Caveats

- The live preview intentionally used a stale historical tuple, so ineligibility is the expected result.
- This packet verifies live surfacing and read-only preview behavior only; it does not approve or create clearance.
- The existing local clearance file is old and not made valid by this preview.

## Boundaries

- no clearance created
- no clearance mutated
- no clearance deleted
- no files written by preview
- no approval consumed
- no disable switch changed
- no runner start contacted
- no OpenCode started
- no OpenCode session created
- no prompt submitted
- no wait call made

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
After MCP bridge reload, the clearance review manifest preview tool is visible in ChatGPT MCP and one live read-only preview call succeeded without creating clearance, consuming approval, contacting the runner, starting OpenCode, submitting a prompt, or calling wait.
```
