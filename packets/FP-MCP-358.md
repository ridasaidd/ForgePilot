# FP-MCP-358 — Extract second inline MCP registration block

## Checkpoint Type

    MCP_INLINE_REGISTRATION_EXTRACTION_RESULT

## Summary

Bridge commit 67f641e extracted the second inline MCP registration block from src/server.ts into src/tool-groups/inline-between-validate-opencode-and-phase3-tools.ts.

The extracted block was previously represented by the registerInlineBetweenValidateOpencodeAndPhase3 callback. FP-MCP-358 replaced that internal inline path rather than preserving it as legacy compatibility. The old inline callback body was removed from server.ts, and src/tool-registry/register-tools.ts now calls the extracted module directly.

The observable MCP tool surface remained unchanged.

## Claim

    FP-MCP-358 moved the second inline MCP registration block out of server.ts, removed the old inline path, and preserved the checked 78-tool surface with the 11-tool ChatGPT-safe default profile.

## Structured Evidence

    sourceBaseline:
      bridgeBranch: feature/oauth-auth0
      bridgeBaseCommit: 8ac2a5f
      bridgeResultCommit: 67f641e
      coreBaseCommit: a6b6724

    changedFiles:
      - scripts/check-tool-contracts.mjs
      - scripts/hardcoded-packet-id-allowlist.json
      - src/server.ts
      - src/tool-groups/inline-between-validate-opencode-and-phase3-tools.ts
      - src/tool-registry/register-tools.ts

    diffSummary:
      filesChanged: 5
      insertions: 127
      deletions: 81
      newFiles:
        - src/tool-groups/inline-between-validate-opencode-and-phase3-tools.ts

    extractedBlock:
      sourceCallbackRemovedFromServer: registerInlineBetweenValidateOpencodeAndPhase3
      newModule: src/tool-groups/inline-between-validate-opencode-and-phase3-tools.ts
      newRegistrationFunction: registerInlineBetweenValidateOpencodeAndPhase3Tools
      oldInlinePathPreserved: false
      duplicateCompatibilityPathKept: false
      serverStillOwnsMovedToolBodies: false

    movedTools:
      - forgepilot_create_opencode_run_request
      - forgepilot_record_non_executing_run_request_artifact

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

    allowlistUpdate:
      reason: FP-MCP-007 examples moved with extracted block
      oldFile: src/server.ts
      newFile: src/tool-groups/inline-between-validate-opencode-and-phase3-tools.ts
      newHardcodedPacketIdsAdded: false

## Caveats

- This checkpoint validates source-level extraction only.
- Runtime service was not restarted as part of this checkpoint.
- Runtime Actions surface should be validated separately after build and restart.
- The contract checker required a one-line scanner update to include the new registration module.
- The hardcoded packet-id allowlist was updated only because two existing FP-MCP-007 example references moved files with the extracted block.
- The extracted module uses broad schema dependency typing similar to FP-MCP-357. This did not change runtime behavior, but it remains a possible later type-hardening target.
- Remaining inline registration blocks still exist in server.ts and should be extracted in later packets.

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

    FP-MCP-358 records a behavior-preserving replacement refactor that extracts the second inline MCP registration block from server.ts into a named tool-group module while preserving the checked 78-tool contract surface and 11-tool ChatGPT-safe default profile.
