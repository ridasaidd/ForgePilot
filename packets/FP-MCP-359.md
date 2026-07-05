# FP-MCP-359 — Extract third inline MCP registration block

## Checkpoint Type

    MCP_INLINE_REGISTRATION_EXTRACTION_RESULT

## Summary

Bridge commit 28dca2c extracted the third inline MCP registration block from src/server.ts into src/tool-groups/inline-between-validate-remote-runner-and-scoped-validation-tools.ts.

The extracted block was previously represented by the registerInlineBetweenValidateRemoteRunnerAndScopedValidation callback. FP-MCP-359 replaced that internal inline path rather than preserving it as legacy compatibility. The old inline callback body was removed from server.ts, and src/tool-registry/register-tools.ts now calls the extracted module directly.

The observable MCP tool surface remained unchanged.

## Claim

    FP-MCP-359 moved the third inline MCP registration block out of server.ts, removed the old inline path, and preserved the checked 78-tool surface with the 11-tool ChatGPT-safe default profile.

## Structured Evidence

    sourceBaseline:
      bridgeBranch: feature/oauth-auth0
      bridgeBaseCommit: 67f641e
      bridgeResultCommit: 28dca2c
      coreBaseCommit: 00a7916

    changedFiles:
      - scripts/check-tool-contracts.mjs
      - scripts/hardcoded-packet-id-allowlist.json
      - src/server.ts
      - src/tool-groups/inline-between-validate-remote-runner-and-scoped-validation-tools.ts
      - src/tool-registry/register-tools.ts

    diffSummary:
      filesChanged: 5
      insertions: 176
      deletions: 114
      newFiles:
        - src/tool-groups/inline-between-validate-remote-runner-and-scoped-validation-tools.ts

    extractedBlock:
      sourceCallbackRemovedFromServer: registerInlineBetweenValidateRemoteRunnerAndScopedValidation
      newModule: src/tool-groups/inline-between-validate-remote-runner-and-scoped-validation-tools.ts
      newRegistrationFunction: registerInlineBetweenValidateRemoteRunnerAndScopedValidationTools
      oldInlinePathPreserved: false
      duplicateCompatibilityPathKept: false
      serverStillOwnsMovedToolBodies: false

    movedTools:
      - forgepilot_validate_remote_runner_endpoint_request
      - forgepilot_evaluate_consuming_action_no_contact
      - forgepilot_dry_run_consuming_scoped_clearance

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
      reason: Existing packet-id examples moved with extracted block
      movedIds:
        - FP-MCP-007
        - FP-MCP-159
      oldFile: src/server.ts
      newFile: src/tool-groups/inline-between-validate-remote-runner-and-scoped-validation-tools.ts
      newHardcodedPacketIdsAdded: false
      unrelatedAllowlistEntriesChanged: false

## Caveats

- This checkpoint validates source-level extraction only.
- Runtime service was not restarted as part of this checkpoint.
- Runtime Actions surface should be validated separately after build and restart.
- The contract checker required a one-line scanner update to include the new registration module.
- The hardcoded packet-id allowlist was updated only because existing FP-MCP-007 and FP-MCP-159 example references moved files with the extracted block.
- The extracted module uses broad output-schema dependency typing similar to FP-MCP-357 and FP-MCP-358. This did not change runtime behavior, but it remains a possible later type-hardening target.
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

    FP-MCP-359 records a behavior-preserving replacement refactor that extracts the third inline MCP registration block from server.ts into a named tool-group module while preserving the checked 78-tool contract surface and 11-tool ChatGPT-safe default profile.
