# FP-MCP-364 — Correct guarded sequencer false-positive next-gate behavior

## Checkpoint Type

    MCP_GUARDED_SEQUENCER_CORRECTION_RESULT

## Summary

Bridge commit 1688722 corrected the guarded sequencer false-positive path diagnosed in FP-MCP-363.

The fix propagates the observed current clearance id from the validated clearance artifact into enablement validation. This prevents stale enablement evidence tied to an older clearance from satisfying the enablement prerequisite when the caller omits input.clearanceId.

The corrected behavior is that a stale enablement clearanceId mismatch returns PREVIEW_SCOPED_ENABLEMENT with ENABLEMENT_CLEARANCE_ID_MISMATCH instead of falling through to FRESH_ORIENTATION_BEFORE_START.

## Claim

    FP-MCP-364 corrects the stale-enable­ment clearanceId false-positive by validating enablement against the current observed clearance artifact id.

## Structured Evidence

    sourceBaseline:
      coreBaseCommit: 2a0d501
      bridgeBranch: feature/oauth-auth0
      bridgeBaseCommit: 3ba467a
      bridgeResultCommit: 1688722

    governingEvidence:
      planPacket: FP-MCP-362
      diagnosticPacket: FP-MCP-363
      diagnosticFinding: enablementStatus skipped clearanceId validation when input.clearanceId was omitted

    changedFiles:
      - src/guarded-canary-gate-sequencer.ts
      - scripts/test-fp-mcp-345.ts

    diffSummary:
      filesChanged: 2
      insertions: 116
      deletions: 3

    correctedCodePath:
      file: src/guarded-canary-gate-sequencer.ts
      function: getGuardedCanaryNextGate
      behaviorBefore: enablementStatus received the original input, so the clearanceId mismatch check was skipped when input.clearanceId was absent.
      behaviorAfter: getGuardedCanaryNextGate derives observedClearanceId from clearance.id and passes a copied input object into enablementStatus.
      inputMutation: false
      fallback: falls back to input.clearanceId only when clearance.id is not a non-empty string

    expectedBehaviorAfterFix:
      staleEnablementClearanceIdDetectedWhenCallerOmitsClearanceId: true
      expectedNextRequiredGate: PREVIEW_SCOPED_ENABLEMENT
      expectedReason: ENABLEMENT_CLEARANCE_ID_MISMATCH
      noFalseFallthroughTo: FRESH_ORIENTATION_BEFORE_START

    tests:
      testCommand: pnpm exec tsx scripts/test-fp-mcp-345.ts
      result: PASS
      totalTests: 16
      totalAssertions: 58
      failures: 0
      addedTests:
        - matching clearanceId does not produce ENABLEMENT_CLEARANCE_ID_MISMATCH
        - stale enablement clearanceId is rejected when caller omits clearanceId

    verification:
      toolContractCheck: PASS
      typecheckDirectNodeTypescript: PASS
      hardcodedPacketIdLint: PASS
      hardcodedPacketIdReferencesMatchedAllowlist: 170
      gitDiffCheck: PASS
      registerToolCount: 78
      build: PASS

    preservedToolSurface:
      registeredToolCount: 78
      contractCount: 78
      defaultVisibleCount: 11
      chatgptSafeVisibleCount: 11
      devVisibleCount: 76
      allVisibleCount: 78
      duplicateRegisteredTools: []
      duplicateContracts: []
      missingContracts: []
      extraContracts: []

    unchangedPublicContract:
      toolsAdded: false
      toolsRemoved: false
      toolsRenamed: false
      inputSchemasChanged: false
      outputSchemasChanged: false
      descriptionsChanged: false
      annotationsChanged: false
      approvalLiteralsChanged: false
      surfaceProfilesChanged: false

## Caveats

- This checkpoint records the source-level correction and deterministic test result.
- Runtime service was not restarted as part of this checkpoint.
- Runtime validation should be recorded separately after build, restart, Actions refresh, and connector diagnostics.
- The correction is intentionally narrow and does not attempt broader sequencer redesign.
- The original conditional clearanceId check inside enablementStatus remains conditional, but getGuardedCanaryNextGate now supplies the observed current clearance id derived from clearanceStatus.

## Boundaries

- No tools added.
- No tools removed.
- No tools renamed.
- No schema changes.
- No description changes.
- No annotation changes.
- No approval literal changes.
- No surface-profile changes.
- No default safe surface relaxation.
- No OpenCode start.
- No runner start endpoint contact.
- No execution approval consumed.
- No disable switch cleared.
- No FP-027 canary run.
- No service restart.

## Non-Execution Boundary

    execution authorized: false
    approval consumed: false
    disable switch cleared: false
    runner start endpoint contacted: false
    OpenCode started: false
    FP-027 canary run: false

## Expected Result

    FP-MCP-364 records the minimal guarded sequencer correction that prevents stale enablement evidence from advancing the sequencer when the caller omits clearanceId.
