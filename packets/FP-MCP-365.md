# FP-MCP-365 — Audit guarded sequencer observer safe-surface eligibility

## Checkpoint Type

    MCP_SAFE_SURFACE_ELIGIBILITY_AUDIT_RESULT

## Summary

This packet records the audit result for whether forgepilot_observe_next_gate should be exposed to the ChatGPT-safe MCP surface after the FP-MCP-364 guarded sequencer correction.

The audit inspected bridge commit 1688722 and found that forgepilot_observe_next_gate is registered and genuinely read-only, but is currently excluded from ChatGPT-safe because its tool contract surface is gated.

The audit recommends not exposing the tool as-is. It should be eligible for later ChatGPT-safe exposure only after output sanitization removes or suppresses execution-adjacent convenience fields such as nextToolArguments and followOnAfterSuccess.

## Claim

    FP-MCP-365 concludes that forgepilot_observe_next_gate is read-only but should not be exposed to ChatGPT-safe as-is because its current output includes follow-on action payloads that can nudge the model toward gated, mutating, or execution-adjacent tools.

## Structured Evidence

    sourceBaseline:
      coreBaseCommit: 8b68ebf
      bridgeBranch: feature/oauth-auth0
      bridgeCommitInspected: 1688722
      bridgeWorkingTreeClean: true

    governingPlan:
      packet: FP-MCP-362
      path: docs/mcp/guarded-sequencer-refactor-plan.md

    filesInspected:
      - src/guarded-canary-gate-sequencer.ts
      - src/guarded-canary-gate-executor.ts
      - src/tool-groups/inline-after-diagnostics-tools.ts
      - src/tool-registry/tool-contracts.ts
      - src/tool-registry/tool-contract.ts
      - src/tool-registry/surface-profile.ts
      - src/tool-registry/register-tools.ts
      - src/server.ts
      - scripts/check-tool-contracts.mjs
      - scripts/test-fp-mcp-345.ts

    docsInspected:
      - docs/mcp-tool-risk-matrix.md
      - docs/mcp-tool-surface-inventory.json
      - docs/mcp-server-normalization-audit.md
      - docs/mcp/guarded-sequencer-refactor-plan.md

    toolAudited:
      name: forgepilot_observe_next_gate
      registered: true
      registration: src/tool-groups/inline-after-diagnostics-tools.ts
      registrationGatedByCanaryActionSurfaceNarrowed: false
      handlerCalls:
        - getGuardedCanaryNextGate
      callsApplyGuardedCanaryNextGate: false

    currentContract:
      lifecycle: canonical
      sideEffectClass: READ_ONLY
      surface: gated
      requiresPopup: false
      writesFiles: false
      contactsRunner: false
      startsOpenCode: false
      consumesApproval: false
      clearsDisableSwitch: false
      deprecated: false
      sourceGroup: gate-observer

    annotations:
      readOnlyHint: true
      destructiveHint: false
      idempotentHint: true
      openWorldHint: false

    currentSafeSurfaceVisibility:
      visibleInChatgptSafe: false
      rootCause: contract surface is gated, and chatgpt-safe profile admits only chatgpt-safe contracts
      canaryActionSurfaceNarrowedCause: false

    behaviorAssessment:
      writesFiles: false
      createsArtifacts: false
      consumesApproval: false
      clearsDisableSwitch: false
      contactsRunnerStartEndpoint: false
      startsOpenCode: false
      runsFp027Canary: false
      mutatesClearanceOrEnablement: false
      networkCalls: false
      readsState: true
      readOnlyAssessment: true

    conformanceFindings:
      toolNameAccurate: true
      descriptionAccurateForReadOnlyBehavior: true
      annotationsMatchBehavior: true
      serverEnforcesSafetyBeyondAnnotations: true
      blockedStatesExplicit: true
      optionalInputsFailClosedAfterFPMCP364: true
      safeSurfaceDescriptionMismatch: description calls the tool ChatGPT-safe while contract surface is gated

    outputRisk:
      nextToolName:
        present: true
        risk: references gated or mutating tools that are not callable in ChatGPT-safe
      nextToolArguments:
        present: true
        risk: exposes pre-formed payloads and approval literals for follow-on actions
      followOnAfterSuccess:
        present: true
        risk: names mutating or execution-adjacent tools and can nudge model toward unsafe follow-on behavior
      boundary:
        present: true
        risk: none
      reasons:
        present: true
        risk: none

    recommendation:
      decision: C
      meaning: expose only after modifications
      exposeAsIs: false
      keepHiddenForever: false
      preferredFutureChange: sanitize observer output before moving contract surface to chatgpt-safe

    requiredFuturePacket:
      packet: FP-MCP-366
      purpose: expose sanitized read-only guarded sequencer observer to ChatGPT-safe
      requiredChanges:
        - suppress nextToolArguments in ChatGPT-safe observer output
        - suppress followOnAfterSuccess in ChatGPT-safe observer output
        - clarify description so it does not promise executable follow-on arguments
        - update contract surface from gated to chatgpt-safe only after sanitization
        - update expected ChatGPT-safe/default visible count from 11 to 12
      preserve:
        - registeredToolCount 78
        - contractCount 78
        - devVisibleCount 76
        - allVisibleCount 78
        - no runner contact
        - no OpenCode start
        - no approval consumption
        - no disable-switch clearing

## Caveats

- This packet records an audit result only.
- It does not expose forgepilot_observe_next_gate to ChatGPT-safe.
- It does not modify bridge contracts or source code.
- It does not validate a live observer call.
- It does not claim that ChatGPT-safe count should change before a separate implementation packet.
- The audit recommends output sanitization before exposure, not exposure as-is.

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
- No service restart.

## Expected Result

    FP-MCP-365 records that forgepilot_observe_next_gate is read-only but should only be exposed to ChatGPT-safe after its output is sanitized to avoid execution-adjacent convenience payloads.
