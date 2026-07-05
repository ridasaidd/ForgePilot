# FP-MCP-363 — Diagnose guarded sequencer false-positive next-gate behavior

## Checkpoint Type

    MCP_GUARDED_SEQUENCER_DIAGNOSTIC_RESULT

## Summary

This packet records the diagnostic result for the guarded sequencer false-positive next-gate behavior governed by FP-MCP-362.

The diagnostic inspected bridge commit 3ba467a and identified one confirmed false-positive pathway: enablement validation can skip clearance-id cross-artifact validation when the caller omits input.clearanceId, even though input.clearanceId is API-legal optional input.

As a result, a stale enablement artifact created for an older clearance can remain valid after a newer clearance replaces the local clearance artifact, allowing the sequencer to advance to FRESH_ORIENTATION_BEFORE_START when it should instead require PREVIEW_SCOPED_ENABLEMENT.

## Claim

    FP-MCP-363 diagnoses a confirmed guarded sequencer false-positive path caused by conditional clearanceId validation in enablementStatus.

## Structured Evidence

    sourceBaseline:
      coreBaseCommit: b6b9b1c
      bridgeBranch: feature/oauth-auth0
      bridgeCommitInspected: 3ba467a
      bridgeWorkingTreeClean: true

    governingPlan:
      packet: FP-MCP-362
      path: docs/mcp/guarded-sequencer-refactor-plan.md
      invariant: A next gate may be reported only if all prerequisite evidence for that exact tuple is present, current, unexpired, and positively valid.

    filesInspected:
      - src/guarded-canary-gate-sequencer.ts
      - src/guarded-canary-gate-executor.ts
      - src/gate-intent-recorder.ts
      - src/operator-local-clearance.ts
      - src/operator-local-enablement.ts
      - src/tool-groups/inline-after-diagnostics-tools.ts
      - scripts/test-fp-mcp-345.ts

    toolsInspected:
      - forgepilot_get_guarded_canary_next_gate
      - forgepilot_observe_next_gate
      - forgepilot_apply_guarded_canary_next_gate
      - forgepilot_preview_clearance_creation
      - forgepilot_record_clearance_intent
      - forgepilot_preview_operator_local_scoped_execution_enablement_review_manifest
      - forgepilot_create_operator_local_scoped_execution_enablement
      - forgepilot_get_operator_local_scoped_execution_enablement_status

    helperFunctionsInspected:
      - getGuardedCanaryNextGate
      - requestStatus
      - approvalStatus
      - clearanceStatus
      - enablementStatus
      - freshRunner
      - applyGuardedCanaryNextGate
      - recordClearanceIntent

    derivedSequencerOrder:
      - BLOCKED_REPOSITORY_STATE when repo branch mismatches input branch or repo is not clean
      - BLOCKED_REQUEST_ARTIFACT when request artifact is invalid
      - RECORD_APPROVAL when approval artifact is invalid or missing
      - PREVIEW_CLEARANCE when clearance artifact is invalid or missing
      - FRESH_ORIENTATION when runner capability timestamp is missing or stale
      - PREVIEW_SCOPED_ENABLEMENT when enablement artifact is invalid or missing
      - FRESH_ORIENTATION_BEFORE_START after request, approval, clearance, runner freshness, and enablement pass

    confirmedFalsePositive:
      affectedFunction: enablementStatus
      affectedFile: src/guarded-canary-gate-sequencer.ts
      affectedCondition: input.clearanceId-gated clearanceId comparison
      reportedLine: 195
      reportedCondition: if input.clearanceId is provided and record.clearanceId does not equal input.clearanceId, add ENABLEMENT_CLEARANCE_ID_MISMATCH
      failureMode: When input.clearanceId is absent, enablementStatus does not compare the enablement clearanceId to the actual current clearance artifact clearanceId.
      falsePositiveResult: FRESH_ORIENTATION_BEFORE_START
      expectedResult: PREVIEW_SCOPED_ENABLEMENT
      expectedReason: ENABLEMENT_CLEARANCE_ID_MISMATCH

    falsePositiveScenario:
      - Caller invokes observe or get next gate without clearanceId.
      - Clearance A exists and enablement A references Clearance A.
      - Clearance B replaces the local clearance artifact using the same tuple but a different clearanceId.
      - Clearance B passes clearanceStatus.
      - Enablement A passes enablementStatus because input.clearanceId is absent and the clearanceId comparison is skipped.
      - Sequencer falls through to FRESH_ORIENTATION_BEFORE_START.
      - This is actionable and should not be reported while enablement references stale clearance evidence.

    secondaryConditionalGaps:
      clearanceStatus:
        - clearanceId check is conditional on input.clearanceId
        - approvalPacketId check is conditional on input.approvalPacketId
        - approvalId check is conditional on input.approvalId
      enablementStatus:
        - enablementId check is conditional on input.enablementId
        - approvalId check is conditional on input.approvalId
        - clearanceId check is conditional on input.clearanceId
      assessment: clearanceStatus still validates required tuple fields directly; enablementStatus clearanceId is the critical cross-artifact validation gap.

    antiFalsePositiveAssessment:
      requestMissingBlocks: true
      approvalMissingNeedsEvidence: true
      approvalInvalidNeedsEvidence: true
      approvalConsumedNeedsEvidence: true
      clearanceMissingNeedsEvidence: true
      clearanceExpiredNeedsEvidence: true
      clearanceTupleMismatchNeedsEvidence: true
      enablementMissingNeedsEvidence: true
      enablementExpiredNeedsEvidence: true
      enablementTupleMismatchNeedsEvidence: true
      enablementClearanceIdMismatchCanAdvance: true
      runnerCapabilityStaleNeedsEvidence: true
      branchMismatchBlocks: true

    proposedMinimalCorrection:
      packet: FP-MCP-364
      preferredOption: Propagate observed clearance.id from clearanceStatus into the enablementStatus input before enablement validation.
      expectedEffect: enablementStatus compares enablement.clearanceId against the actual current clearance artifact id even when caller omitted input.clearanceId.
      expectedBlockedGate: PREVIEW_SCOPED_ENABLEMENT
      expectedReason: ENABLEMENT_CLEARANCE_ID_MISMATCH

    suggestedTests:
      - stale enablement clearanceId is detected when input clearanceId is omitted
      - fresh enablement clearanceId passes when it matches current clearance
      - omitted input clearanceId still passes when current clearance and enablement agree

    mcpOpenAIConformanceObservations:
      readOnlyToolsObservedReadOnly: true
      mutatingToolsClearlyMutating: true
      exactApprovalLiteralsPresent: true
      structuredBlockedStatesPresent: true
      chatgptSafeSequencerSurfaceReadOnlyOrEvidenceOnly: true
      conformanceGap: Conditional ID checks can let stale enablement evidence satisfy the sequencer when caller omits optional clearanceId.

## Caveats

- This packet records diagnostic evidence only.
- The diagnostic report was produced from source inspection and state-path reasoning.
- No fix was implemented.
- No new deterministic test was implemented.
- Line numbers are from the inspected bridge commit 3ba467a and may shift after later edits.
- FP-MCP-364 must independently verify the exact diff and run checks.

## Boundaries

- No bridge source changes.
- No core behavior changes.
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
- No service restart.

## Expected Result

    FP-MCP-363 records the branch-level diagnostic evidence needed to authorize a minimal FP-MCP-364 sequencer correction.
