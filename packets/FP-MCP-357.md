# FP-MCP-357 — Extract and remove first inline registration block

## Checkpoint Type

    MCP_INLINE_REGISTRATION_EXTRACTION_RESULT

## Summary

Bridge commit 8ac2a5f extracted the first inline MCP registration block from src/server.ts into src/tool-groups/inline-before-phase1-list-tools.ts.

The extracted block was previously represented by the registerInlineBeforePhase1List callback introduced during FP-MCP-356. FP-MCP-357 replaced that internal inline path rather than preserving it as legacy compatibility. The old inline callback body was removed from server.ts, and src/tool-registry/register-tools.ts now calls the extracted module directly.

The observable MCP tool surface remained unchanged.

## Claim

    FP-MCP-357 moved the first inline MCP registration block out of server.ts, removed the old inline path, and preserved the checked 78-tool surface with the 11-tool ChatGPT-safe default profile.

## Structured Evidence

    sourceBaseline:
      bridgeBranch: feature/oauth-auth0
      bridgeBaseCommit: 1b1c9dc
      bridgeResultCommit: 8ac2a5f
      coreBaseCommit: 07b83ca

    changedFiles:
      - scripts/check-tool-contracts.mjs
      - src/server.ts
      - src/tool-groups/inline-before-phase1-list-tools.ts
      - src/tool-registry/register-tools.ts

    diffSummary:
      filesChanged: 4
      insertions: 726
      deletions: 529
      newFiles:
        - src/tool-groups/inline-before-phase1-list-tools.ts

    extractedBlock:
      sourceCallbackRemovedFromServer: registerInlineBeforePhase1List
      newModule: src/tool-groups/inline-before-phase1-list-tools.ts
      newRegistrationFunction: registerInlineBeforePhase1ListTools
      oldInlinePathPreserved: false
      duplicateCompatibilityPathKept: false
      serverStillOwnsMovedToolBodies: false

    movedTools:
      - forgepilot_get_opencode_http_session_status
      - forgepilot_get_opencode_http_session_status_shape
      - forgepilot_run_opencode_http_minimal_session_canary
      - forgepilot_run_opencode_http_minimal_async_prompt_canary
      - forgepilot_run_opencode_http_wait_endpoint_probe
      - forgepilot_run_opencode_http_message_shape_probe
      - forgepilot_run_opencode_http_assistant_completion_probe
      - forgepilot_read_opencode_http_assistant_completion
      - forgepilot_delete_opencode_http_session
      - forgepilot_run_opencode_http_lifecycle_orchestrator
      - forgepilot_adapt_request_to_opencode_http_lifecycle
      - forgepilot_record_opencode_http_lifecycle_plan
      - forgepilot_read_opencode_http_lifecycle_plan
      - forgepilot_evaluate_opencode_http_lifecycle_plan_invocation_dry_run
      - forgepilot_record_opencode_http_lifecycle_invocation_attempt_dry_run
      - forgepilot_run_opencode_http_lifecycle_single_shot_gate
      - forgepilot_get_remote_runner_status

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

## Caveats

- This checkpoint validates source-level extraction only.
- Runtime service was not restarted as part of this checkpoint.
- Runtime Actions surface should be validated separately after build and restart.
- The contract checker required a one-line scanner update to include the new registration module.
- The extracted module uses broad schema dependency typing for moved output schemas. This did not change runtime behavior, but it should be considered for later type-hardening.
- Remaining inline registration blocks still exist in server.ts and should be extracted in later packets.

## Boundaries

- No tools added.
- No tools removed.
- No tools renamed.
- No input schemas intentionally changed.
- No output schemas intentionally changed.
- No descriptions intentionally changed.
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

    FP-MCP-357 records a behavior-preserving replacement refactor that extracts the first inline MCP registration block from server.ts into a named tool-group module while preserving the checked 78-tool contract surface and 11-tool ChatGPT-safe default profile.
