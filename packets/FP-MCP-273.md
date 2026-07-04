# FP-MCP-273 — Clearance Review Manifest Preview Tool

## Checkpoint Type

```text
TOOL_IMPLEMENTATION_RESULT
```

## Summary

FP-MCP-273 adds a non-mutating preview layer for clearance review. The bridge commit is 1ff559e on feature/oauth-auth0. The new tool name is forgepilot_preview_operator_local_execution_clearance_review_manifest and the new implementation function is previewOperatorLocalExecutionClearanceReviewManifest. The preview shows the operator what to review before the final popup: target packet, request artifact, approval artifact, local clearance output path, exact scope fields, current repository state, expiry, final-brake operator rule, and follow-on side effects. It also reports whether an existing local clearance file is present so the operator can see whether the follow-on clearance action would create a new file or overwrite an old local file. Validation passed with pnpm build, pnpm test, hardcoded packet-id lint, git diff --check, and direct built-module preview invocation. The active MCP runtime did not show the new tool before service reload, so post-reload live surfacing and one live read-only preview call remain follow-up work.

## Claim

```text
Implemented a read-only MCP bridge preview tool for operator review before local clearance creation; source commit, build, tests, lint, and direct built-module validation passed, while live MCP surfacing remains pending bridge reload.
```

## Caveats

- Live ChatGPT MCP surfacing is pending bridge reload.
- Direct validation used an old stale tuple, so the preview correctly reported ineligibility reasons for that tuple.
- An old gitignored local clearance file exists and is expired/unusable; FP-MCP-273 did not create or modify it.
- This packet implements the preview layer only; it does not run the guarded execution path.

## Boundaries

- no clearance created
- no clearance mutated
- no clearance deleted
- no execution started
- no runner start contacted
- no model session created
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
Implemented a read-only MCP bridge preview tool for operator review before local clearance creation; source commit, build, tests, lint, and direct built-module validation passed, while live MCP surfacing remains pending bridge reload.
```
