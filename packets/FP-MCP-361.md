# FP-MCP-361 — Extract final inline MCP registration block

## Checkpoint Type

    MCP_INLINE_REGISTRATION_EXTRACTION_RESULT

## Summary

Bridge commit 3ba467a extracted the final inline MCP registration block from src/server.ts into src/tool-groups/inline-after-diagnostics-tools.ts.

The extracted block was previously represented by the registerInlineAfterDiagnostics callback. FP-MCP-361 replaced that internal inline path rather than preserving it as legacy compatibility. The old inline callback body was removed from server.ts, and src/tool-registry/register-tools.ts now calls the extracted module directly.

After this extraction, src/server.ts no longer contains inline registration callback declarations, and src/tool-registry/register-tools.ts no longer contains RegisterInlineTools callback plumbing.

The observable MCP tool surface remained unchanged.

## Claim

    FP-MCP-361 moved the final inline MCP registration block out of server.ts, removed the remaining callback plumbing, and preserved the checked 78-tool surface with the 11-tool ChatGPT-safe default profile.

## Structured Evidence

    sourceBaseline:
      bridgeBranch: feature/oauth-auth0
      bridgeBaseCommit: 9b2e35b
      bridgeResultCommit: 3ba467a
      coreBaseCommit: 794d7cf

    changedFiles:
      - scripts/check-tool-contracts.mjs
      - scripts/hardcoded-packet-id-allowlist.json
      - src/server.ts
      - src/tool-groups/inline-after-diagnostics-tools.ts
      - src/tool-registry/register-tools.ts

    diffSummary:
      filesChanged: 5
      insertions: 986
      deletions: 795
      newFiles:
        - src/tool-groups/inline-after-diagnostics-tools.ts

    extractedBlock:
      sourceCallbackRemovedFromServer: registerInlineAfterDiagnostics
      newModule: src/tool-groups/inline-after-diagnostics-tools.ts
      newRegistrationFunction: registerInlineAfterDiagnosticsTools
      oldInlinePathPreserved: false
      duplicateCompatibilityPathKept: false
      serverStillOwnsMovedToolBodies: false
      inlineCallbackDeclarationsRemainingInServer: 0
      inlineCallbackOptionFieldsRemainingInRegisterTools: 0
      registerInlineToolsTypeRemoved: true

    movedTools:
      - forgepilot_get_execution_gate_orientation
      - forgepilot_get_workspace_change_inspection
      - forgepilot_record_operator_workflow_trace
      - forgepilot_summarize_operator_workflow_traces
      - forgepilot_preview_operator_local_execution_clearance_review_manifest
      - forgepilot_create_operator_local_execution_clearance
      - forgepilot_get_operator_local_execution_clearance_status
      - forgepilot_record_packet_checkpoint
      - forgepilot_execute_terminal_command
      - forgepilot_preview_operator_local_scoped_execution_enablement_review_manifest
      - forgepilot_create_operator_local_scoped_execution_enablement
      - forgepilot_get_operator_local_scoped_execution_enablement_status
      - forgepilot_apply_guarded_canary_next_gate
      - forgepilot_get_guarded_canary_next_gate
      - forgepilot_observe_next_gate
      - forgepilot_preview_clearance_creation
      - forgepilot_record_clearance_intent

    preservedToolSurface:
      expectedToolCount: 78
      registeredToolCount: 78
      contractCount: 78
      expectedChatgptSafeCount: 11
      defaultVisibleCount: 11
      chatgptSafeVisibleCount: 11
      devVisibleCount: 76
      allVisibleCount: 78
      chatgptSafeExactMatch: true
      nonSafeVisibleInChatgptSafe: []
      duplicateRegisteredTools: []
      duplicateContracts: []
      missingContracts: []
      extraContracts: []

    verification:
      toolContractCheck: PASS
      typecheckDirectNodeTypescript: PASS
      hardcodedPacketIdLint: PASS
      hardcodedPacketIdReferencesMatchedAllowlist: 170
      gitDiffCheck: PASS
      registerToolCount: 78
      inlineCallbackDeclarationsRemainingInServer: 0
      registerInlineToolsCallbackPlumbingRemaining: 0

    allowlistUpdate:
      reason: Existing packet-id examples moved with extracted block
      movedIds:
        - FP-MCP-207
        - FP-027
        - FP-MCP-223
        - FP-MCP-230
        - FP-MCP-209
        - FP-MCP-216
        - FP-MCP-199
        - FP-MCP-147
      oldFile: src/server.ts
      newFile: src/tool-groups/inline-after-diagnostics-tools.ts
      newHardcodedPacketIdsAdded: false
      unrelatedAllowlistEntriesChanged: false

## Caveats

- This checkpoint validates source-level extraction only.
- Runtime service was not restarted as part of this checkpoint.
- Runtime Actions surface should be validated separately after build and restart.
- The contract checker required a one-line scanner update to include the new registration module.
- The hardcoded packet-id allowlist was updated only because existing example references moved files with the extracted block.
- The extracted module uses broad output-schema and helper dependency typing similar to previous extracted modules. This did not change runtime behavior, but it remains a possible later type-hardening target.
- This checkpoint does not claim that server.ts has reached its final architectural shape; it claims only that inline registration callback ownership was removed.

## Boundaries

- No tools added.
- No tools removed.
- No tools renamed.
- No input schemas intentionally changed.
- No output schemas intentionally changed.
- No descriptions intentionally changed.
- No annotations intentionally changed.
- No approval literals intentionally changed.
- No handler behavior intentionally changed.
- No contract metadata changed.
- No surface-profile behavior changed.
- No default safe surface relaxation.
- No OpenCode start.
- No runner start endpoint contact.
- No execution approval consumed.
- No disable switch cleared.
- No canary run.

## Non-Execution Boundary

    execution authorized: false
    approval consumed: false
    disable switch cleared: false
    runner start endpoint contacted: false
    OpenCode started: false
    FP-027 canary run: false

## Expected Result

    FP-MCP-361 records a behavior-preserving replacement refactor that extracts the final inline MCP registration block from server.ts into a named tool-group module while preserving the checked 78-tool contract surface and 11-tool ChatGPT-safe default profile.
