# FP-MCP-356 Registration Orchestration Extraction Evidence

## Result

Bridge commit 1b1c9dc extracted MCP tool registration orchestration into src/tool-registry/register-tools.ts.

## Files Changed

- src/server.ts
- src/tool-registry/register-tools.ts

## Diff Summary

- 2 files changed
- 94 insertions
- 26 deletions
- new file: src/tool-registry/register-tools.ts

## Refactor Shape

The new registerForgePilotTools function owns high-level registration sequencing across:

- grouped phase registration helpers
- recent tool registrations
- server-provided inline registration callbacks

The legacy inline tool handler bodies remain in src/server.ts for this phase.

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

## Boundary

No OpenCode start, runner start, execution approval, disable-switch change, or canary run occurred.

## Caveat

Runtime service was not restarted. Runtime Actions surface validation should occur separately after the bridge commit is pushed and deployed/restarted.
