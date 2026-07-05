# FP-MCP-357 Inline Registration Extraction Evidence

## Result

Bridge commit 8ac2a5f extracted the first inline MCP registration block from src/server.ts into src/tool-groups/inline-before-phase1-list-tools.ts.

## Files Changed

- scripts/check-tool-contracts.mjs
- src/server.ts
- src/tool-groups/inline-before-phase1-list-tools.ts
- src/tool-registry/register-tools.ts

## Diff Summary

- 4 files changed
- 726 insertions
- 529 deletions
- new file: src/tool-groups/inline-before-phase1-list-tools.ts

## Moved Tools

- forgepilot_get_opencode_http_session_status
- forgepilot_get_opencode_http_session_status_shape
- forgepilot_run_opencode_http_minimal_session_canary
- forgepilot_run_opencode_http_minimal_async_prompt_canary
- forgepilot_run_opencode_http_wait_endpoint_probe
- forgepilot_run_opencode_http_message_shape_probe
- forgepilot_run_opencode_http_assistant_completion_probe
- forgepilot_read_opencode_http_assistant_completion
- forgepilot_delete_opencode_http_session
- forgepilot_run_opencode_http_lifecycle_orchestrator
- forgepilot_adapt_request_to_opencode_http_lifecycle
- forgepilot_record_opencode_http_lifecycle_plan
- forgepilot_read_opencode_http_lifecycle_plan
- forgepilot_evaluate_opencode_http_lifecycle_plan_invocation_dry_run
- forgepilot_record_opencode_http_lifecycle_invocation_attempt_dry_run
- forgepilot_run_opencode_http_lifecycle_single_shot_gate
- forgepilot_get_remote_runner_status

## Preserved Surface Counts

- expectedToolCount: 78
- registeredToolCount: 78
- contractCount: 78
- expectedChatgptSafeCount: 11
- defaultVisibleCount: 11
- chatgptSafeVisibleCount: 11
- devVisibleCount: 76
- allVisibleCount: 78
- chatgptSafeExactMatch: true
- duplicateRegisteredTools: []
- duplicateContracts: []
- missingContracts: []
- extraContracts: []

## Verification

- node scripts/check-tool-contracts.mjs: PASS
- node ./node_modules/typescript/bin/tsc --noEmit: PASS
- node scripts/check-hardcoded-packet-ids.mjs: PASS
- git diff --check: PASS
- registerTool count: 78

## Caveat

The extracted module uses broad dependency typing for moved output schemas. This did not change runtime behavior, but it remains a possible later type-hardening target.

## Boundary

No OpenCode start, runner start, execution approval, disable-switch change, or canary run occurred.
