# FP-MCP-358 Inline Registration Extraction Evidence

## Result

Bridge commit 67f641e extracted the second inline MCP registration block from src/server.ts into src/tool-groups/inline-between-validate-opencode-and-phase3-tools.ts.

## Files Changed

- scripts/check-tool-contracts.mjs
- scripts/hardcoded-packet-id-allowlist.json
- src/server.ts
- src/tool-groups/inline-between-validate-opencode-and-phase3-tools.ts
- src/tool-registry/register-tools.ts

## Diff Summary

- 5 files changed
- 127 insertions
- 81 deletions
- new file: src/tool-groups/inline-between-validate-opencode-and-phase3-tools.ts

## Moved Tools

- forgepilot_create_opencode_run_request
- forgepilot_record_non_executing_run_request_artifact

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

The hardcoded packet-id allowlist was updated because two existing FP-MCP-007 example references moved from src/server.ts to src/tool-groups/inline-between-validate-opencode-and-phase3-tools.ts with the extracted block.

No new hardcoded packet IDs were introduced.

## Caveat

The extracted module uses broad dependency typing for moved output schemas. This did not change runtime behavior, but it remains a possible later type-hardening target.

## Boundary

No OpenCode start, runner start, execution approval, disable-switch change, or canary run occurred.
