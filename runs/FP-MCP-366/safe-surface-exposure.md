# FP-MCP-366 Safe Surface Exposure Evidence

## Result

Bridge commit 32f49e6 exposed the sanitized read-only guarded sequencer observer to the ChatGPT-safe MCP surface.

## Bridge Commit

- branch: feature/oauth-auth0
- base commit: 1688722
- result commit: 32f49e6
- commit message: Expose sanitized guarded sequencer observer to safe surface

## Files Changed

- src/tool-groups/inline-after-diagnostics-tools.ts
- src/tool-registry/tool-contracts.ts
- scripts/check-tool-contracts.mjs
- scripts/test-fp-mcp-345.ts

## Diff Summary

- 4 files changed
- 50 insertions
- 6 deletions

## Exposed Tool

- forgepilot_observe_next_gate

Surface changed:

- before: gated
- after: chatgpt-safe

No other tool surface changed.

## Output Sanitization

The observer now uses sanitizeObserveNextGateResult.

Sanitized fields:

- nextToolArguments: null
- followOnAfterSuccess: undefined

Preserved fields:

- nextRequiredGate
- reasons
- boundary
- state/evidence summaries from the sequencer result

## Contract Counts

- registeredToolCount: 78
- contractCount: 78
- defaultVisibleCount: 12
- chatgptSafeVisibleCount: 12
- devVisibleCount: 76
- allVisibleCount: 78
- duplicateRegisteredTools: []
- duplicateContracts: []
- missingContracts: []
- extraContracts: []

## Tests

Command:

- pnpm exec tsx scripts/test-fp-mcp-345.ts

Result:

- 18 tests passed
- 69 assertions passed
- 0 failed

Added coverage:

- production sanitizer helper is tested
- actual TOOL_CONTRACTS surface for forgepilot_observe_next_gate is chatgpt-safe
- adjacent guarded sequencer tools remain not chatgpt-safe

## Verification

- node scripts/check-tool-contracts.mjs: PASS
- node ./node_modules/typescript/bin/tsc --noEmit: PASS
- node scripts/check-hardcoded-packet-ids.mjs: PASS
- git diff --check: PASS
- registerTool count: 78

## Public Contract

No MCP tools, public schemas, approval literals, or mutating behavior changed.

## Non-Execution Statement

No OpenCode start, runner start contact, approval consumption, disable-switch clearing, FP-027 canary run, or MCP service restart occurred.
