# FP-MCP-359 Inline Registration Extraction Evidence

## Result

Bridge commit 28dca2c extracted the third inline MCP registration block from src/server.ts into src/tool-groups/inline-between-validate-remote-runner-and-scoped-validation-tools.ts.

## Files Changed

- scripts/check-tool-contracts.mjs
- scripts/hardcoded-packet-id-allowlist.json
- src/server.ts
- src/tool-groups/inline-between-validate-remote-runner-and-scoped-validation-tools.ts
- src/tool-registry/register-tools.ts

## Diff Summary

- 5 files changed
- 176 insertions
- 114 deletions
- new file: src/tool-groups/inline-between-validate-remote-runner-and-scoped-validation-tools.ts

## Moved Tools

- forgepilot_validate_remote_runner_endpoint_request
- forgepilot_evaluate_consuming_action_no_contact
- forgepilot_dry_run_consuming_scoped_clearance

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

## Allowlist Update

The hardcoded packet-id allowlist was updated because existing FP-MCP-007 and FP-MCP-159 example references moved from src/server.ts to src/tool-groups/inline-between-validate-remote-runner-and-scoped-validation-tools.ts with the extracted block.

No new hardcoded packet IDs were introduced.

## Caveat

The extracted module uses broad dependency typing for moved output schemas. This did not change runtime behavior, but it remains a possible later type-hardening target.

## Boundary

No OpenCode start, runner start, execution approval, disable-switch change, or canary run occurred.
