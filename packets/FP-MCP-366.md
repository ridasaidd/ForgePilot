# FP-MCP-366 — Expose sanitized guarded sequencer observer to safe surface

## Checkpoint Type

    MCP_SAFE_SURFACE_EXPOSURE_RESULT

## Summary

Bridge commit 32f49e6 intentionally exposed forgepilot_observe_next_gate to the ChatGPT-safe MCP surface after sanitizing its output.

This implements the FP-MCP-365 recommendation: expose the observer only after suppressing execution-adjacent convenience payloads. The observer remains read-only and now returns a safer observer-shaped response by setting nextToolArguments to null and suppressing followOnAfterSuccess.

The ChatGPT-safe/default visible tool count intentionally changed from 11 to 12. Registered tool count and total contract count remained unchanged.

## Claim

    FP-MCP-366 exposes only the sanitized read-only guarded sequencer observer to ChatGPT-safe while preserving tool count, contract count, and non-execution boundaries.

## Structured Evidence

    sourceBaseline:
      coreBaseCommit: a612333
      bridgeBranch: feature/oauth-auth0
      bridgeBaseCommit: 1688722
      bridgeResultCommit: 32f49e6

    governingEvidence:
      planPacket: FP-MCP-362
      diagnosticPacket: FP-MCP-363
      correctionPacket: FP-MCP-364
      eligibilityAuditPacket: FP-MCP-365
      eligibilityAuditDecision: C - expose only after modifications

    changedFiles:
      - src/tool-groups/inline-after-diagnostics-tools.ts
      - src/tool-registry/tool-contracts.ts
      - scripts/check-tool-contracts.mjs
      - scripts/test-fp-mcp-345.ts

    diffSummary:
      filesChanged: 4
      insertions: 50
      deletions: 6

    exposedTool:
      name: forgepilot_observe_next_gate
      previousSurface: gated
      newSurface: chatgpt-safe
      sideEffectClass: READ_ONLY
      requiresPopup: false
      writesFiles: false
      contactsRunner: false
      startsOpenCode: false
      consumesApproval: false
      clearsDisableSwitch: false

    outputSanitization:
      helper: sanitizeObserveNextGateResult
      file: src/tool-groups/inline-after-diagnostics-tools.ts
      nextToolArguments: null
      followOnAfterSuccess: undefined
      nextRequiredGatePreserved: true
      reasonsPreserved: true
      boundaryPreserved: true
      publicSchemaChanged: false

    surfaceChange:
      defaultVisibleCountBefore: 11
      defaultVisibleCountAfter: 12
      chatgptSafeVisibleCountBefore: 11
      chatgptSafeVisibleCountAfter: 12
      registeredToolCount: 78
      contractCount: 78
      devVisibleCount: 76
      allVisibleCount: 78
      otherToolSurfacesChanged: false

    unchangedAdjacentTools:
      forgepilot_get_guarded_canary_next_gate: gated
      forgepilot_apply_guarded_canary_next_gate: legacy

    verification:
      toolContractCheck: PASS
      expectedToolCount: 78
      expectedChatgptSafeCount: 12
      registeredToolCount: 78
      contractCount: 78
      chatgptSafeContractCount: 12
      defaultVisibleCount: 12
      chatgptSafeVisibleCount: 12
      devVisibleCount: 76
      allVisibleCount: 78
      chatgptSafeExactMatch: true
      nonSafeVisibleInChatgptSafe: []
      duplicateRegisteredTools: []
      duplicateContracts: []
      missingContracts: []
      extraContracts: []
      typecheckDirectNodeTypescript: PASS
      hardcodedPacketIdLint: PASS
      hardcodedPacketIdReferencesMatchedAllowlist: 170
      gitDiffCheck: PASS
      registerToolCount: 78

    tests:
      command: pnpm exec tsx scripts/test-fp-mcp-345.ts
      result: PASS
      totalTests: 18
      totalAssertions: 69
      failures: 0
      addedCoverage:
        - production sanitizeObserveNextGateResult helper returns nextToolArguments null and followOnAfterSuccess undefined
        - real TOOL_CONTRACTS entry for forgepilot_observe_next_gate is chatgpt-safe
        - sibling guarded sequencer tools remain not chatgpt-safe

    mcpOpenAIBestPracticeAlignment:
      readOnlyAnnotationMatchesBehavior: true
      serverSideSafetyEnforcedBeyondAnnotation: true
      safeProfileAvoidsExecutionAdjacentConveniencePayloads: true
      observerRemainsObservationNotAction: true
      surfaceChangeExplicitlyTested: true

## Caveats

- This checkpoint records source-level exposure and tests only.
- Runtime service was not restarted as part of this checkpoint.
- Runtime validation should be recorded separately after build, restart, Actions refresh, and connector diagnostics.
- The observer is now ChatGPT-safe by contract, but live visibility must be confirmed after restart.
- The sanitized observer still reports nextRequiredGate and reasons for state transparency.
- The richer unsanitized guarded next-gate output remains available through non-safe surfaces where applicable.

## Boundaries

- No tools added.
- No tools removed.
- No tools renamed.
- No public schema changes.
- No approval literal changes.
- No mutating tool behavior changes.
- No runner start behavior changes.
- No OpenCode behavior changes.
- No default safe surface relaxation beyond the single audited observer exposure.
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

    FP-MCP-366 records the intentional exposure of the sanitized read-only guarded sequencer observer to the ChatGPT-safe surface, changing safe/default visible count from 11 to 12 while preserving the non-execution boundary.
