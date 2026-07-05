# FP-MCP-364 Correction Result Evidence

## Result

Bridge commit 1688722 fixed the guarded sequencer stale enablement clearance validation path diagnosed in FP-MCP-363.

## Bridge Commit

- branch: feature/oauth-auth0
- base commit: 3ba467a
- result commit: 1688722
- commit message: Fix guarded sequencer stale enablement clearance validation

## Files Changed

- src/guarded-canary-gate-sequencer.ts
- scripts/test-fp-mcp-345.ts

## Diff Summary

- 2 files changed
- 116 insertions
- 3 deletions

## Corrected Path

In getGuardedCanaryNextGate, the sequencer now derives observedClearanceId from the validated clearance artifact's id and passes it to enablementStatus through a copied input object.

This means enablement validation compares enablement.clearanceId against the current clearance artifact id even when the caller omits input.clearanceId.

## Before Behavior

When input.clearanceId was omitted, enablementStatus skipped ENABLEMENT_CLEARANCE_ID_MISMATCH. A stale enablement tied to an older clearance could remain valid after the local clearance artifact was replaced.

That could allow fallthrough to FRESH_ORIENTATION_BEFORE_START.

## After Behavior

Stale enablement clearanceId is rejected when caller omits clearanceId.

The expected next gate is PREVIEW_SCOPED_ENABLEMENT and the expected reason is ENABLEMENT_CLEARANCE_ID_MISMATCH.

## Tests

Command:

- pnpm exec tsx scripts/test-fp-mcp-345.ts

Result:

- 16 tests passed
- 58 assertions passed
- 0 failed

Added coverage:

- matching clearanceId does not produce ENABLEMENT_CLEARANCE_ID_MISMATCH
- stale enablement clearanceId is rejected when caller omits clearanceId

## Verification

- pnpm build: PASS
- node scripts/check-tool-contracts.mjs: PASS
- node ./node_modules/typescript/bin/tsc --noEmit: PASS
- node scripts/check-hardcoded-packet-ids.mjs: PASS
- git diff --check: PASS
- registerTool count: 78

## Preserved Surface

- registeredToolCount: 78
- contractCount: 78
- defaultVisibleCount: 11
- chatgptSafeVisibleCount: 11
- devVisibleCount: 76
- allVisibleCount: 78
- duplicateRegisteredTools: []
- duplicateContracts: []
- missingContracts: []
- extraContracts: []

## Public Contract

No MCP tools, schemas, descriptions, annotations, approval literals, contract metadata, or surface profiles were changed.

## Non-Execution Statement

No OpenCode start, runner start contact, approval consumption, disable-switch clearing, FP-027 canary run, or MCP service restart occurred.
