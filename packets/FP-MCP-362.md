# FP-MCP-362 — Guarded sequencer refactor and MCP conformance plan

## Checkpoint Type

    MCP_GUARDED_SEQUENCER_REFACTOR_PLAN

## Summary

This packet records the governing plan for guarded sequencer work after completion of the inline MCP registration extraction series.

The plan requires evidence-first diagnosis of the false-positive guarded sequencer next-gate behavior before implementing any correction. It also defines MCP and OpenAI conformance standards that future sequencer packets must preserve.

## Claim

    FP-MCP-362 records the required work order, anti-false-positive invariant, and MCP/OpenAI conformance standards for future guarded sequencer work.

## Structured Evidence

    sourceBaseline:
      coreBaseCommit: 1ee33c4
      bridgeLatestConfirmedCommit: 3ba467a
      bridgeBranch: feature/oauth-auth0

    planDocument:
      path: docs/mcp/guarded-sequencer-refactor-plan.md
      purpose: govern guarded sequencer diagnosis, correction, and runtime validation

    requiredFutureOrder:
      - FP-MCP-363: Diagnose guarded sequencer false-positive next-gate behavior
      - FP-MCP-364: Correct guarded sequencer false-positive next-gate behavior
      - FP-MCP-364A: Runtime validation after guarded sequencer correction

    governingInvariant:
      statement: A next gate may be reported only if all prerequisite evidence for that exact tuple is present, current, unexpired, and positively valid.
      blockedCases:
        - absence
        - mismatch
        - expiry
        - stale state
        - fallback defaults
        - invalid evidence
        - consumed approval where relevant

    mcpOpenAIConformancePrinciple:
      toolDescriptorsGuideModel: true
      runtimeGuardsConstrainServer: true
      artifactsRecordWhatHappened: true
      contractChecksProveSurfaceStability: true
      runtimeDiagnosticsProveSafeBoundary: true
      annotationsAreNotAuthorization: true

    relevantLocalizedSource:
      extractedToolGroup: src/tool-groups/inline-after-diagnostics-tools.ts
      relevantTools:
        - forgepilot_apply_guarded_canary_next_gate
        - forgepilot_get_guarded_canary_next_gate
        - forgepilot_observe_next_gate
        - forgepilot_preview_clearance_creation
        - forgepilot_record_clearance_intent

    requiredPreservedCounts:
      registeredToolCount: 78
      contractCount: 78
      defaultVisibleCount: 11
      chatgptSafeVisibleCount: 11
      devVisibleCount: 76
      allVisibleCount: 78

## Caveats

- This packet records a plan only.
- It does not diagnose the false-positive sequencer behavior.
- It does not implement a sequencer correction.
- It does not modify the MCP bridge.
- It does not run runtime validation.
- It does not claim full MCP/OpenAI conformance has already been achieved; it defines the standard future packets must use.

## Boundaries

- No bridge source changes.
- No tool additions.
- No tool removals.
- No tool renames.
- No schema changes.
- No profile changes.
- No OpenCode start.
- No runner start endpoint contact.
- No approval consumption.
- No disable-switch clearing.
- No canary run.

## Expected Result

    FP-MCP-362 creates the canonical plan that future guarded sequencer packets must follow before diagnosis, correction, and runtime validation proceed.
