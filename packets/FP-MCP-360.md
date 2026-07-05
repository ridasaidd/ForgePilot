# FP-MCP-360 — Extract fourth inline MCP registration block

## Checkpoint Type

    MCP_INLINE_REGISTRATION_EXTRACTION_RESULT

## Summary

Bridge commit 9b2e35b extracted the fourth inline MCP registration block from src/server.ts into src/tool-groups/inline-between-scoped-validation-and-read-file-tools.ts.

The extracted block was previously represented by the registerInlineBetweenScopedValidationAndReadFile callback. FP-MCP-360 replaced that internal inline path rather than preserving it as legacy compatibility. The old inline callback body was removed from server.ts, and src/tool-registry/register-tools.ts now calls the extracted module directly.

The remaining registerInlineAfterDiagnostics callback was intentionally left untouched.

The observable MCP tool surface remained unchanged.

## Claim

    FP-MCP-360 moved the fourth inline MCP registration block out of server.ts, removed the old inline path, preserved registerInlineAfterDiagnostics, and preserved the checked 78-tool surface with the 11-tool ChatGPT-safe default profile.

## Structured Evidence

    sourceBaseline:
      bridgeBranch: feature/oauth-auth0
      bridgeBaseCommit: 28dca2c
      bridgeResultCommit: 9b2e35b
      coreBaseCommit: c012376

    changedFiles:
      - scripts/check-tool-contracts.mjs
      - scripts/hardcoded-packet-id-allowlist.json
      - src/server.ts
      - src/tool-groups/inline-between-scoped-validation-and-read-file-tools.ts
      - src/tool-registry/register-tools.ts

    diffSummary:
      filesChanged: 5
      insertions: 938
      deletions: 699
      newFiles:
        - src/tool-groups/inline-between-scoped-validation-and-read-file-tools.ts

    extractedBlock:
      sourceCallbackRemovedFromServer: registerInlineBetweenScopedValidationAndReadFile
      newModule: src/tool-groups/inline-between-scoped-validation-and-read-file-tools.ts
      newRegistrationFunction: registerInlineBetweenScopedValidationAndReadFileTools
      oldInlinePathPreserved: false
      duplicateCompatibilityPathKept: false
      serverStillOwnsMovedToolBodies: false
      registerInlineAfterDiagnosticsPreserved: true

    movedTools:
      - forgepilot_record_execution_artifact_dry_run
      - forgepilot_verify_execution_artifact_dry_run
      - forgepilot_get_execution_enablement_status
      - forgepilot_get_execution_disable_switch_status
      - forgepilot_record_real_human_approval_evidence
      - forgepilot_record_structured_human_approval
      - forgepilot_record_human_approval_consumption
      - forgepilot_record_human_approval_evidence_dry_run_fixture
      - forgepilot_validate_human_approval_record
      - forgepilot_record_approved_pre_start_evidence_artifact
      - forgepilot_record_pre_start_evidence_dry_run
      - forgepilot_validate_pre_start_evidence
      - forgepilot_validate_start_request_state_snapshot
      - forgepilot_record_start_state_snapshot_dry_run
      - forgepilot_get_guarded_start_preflight_report
      - forgepilot_start_remote_runner_request

    conditionalRegistrationPreserved:
      - forgepilot_get_guarded_start_preflight_report
      - forgepilot_start_remote_runner_request

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
      oldFile: src/server.ts
      newFile: src/tool-groups/inline-between-scoped-validation-and-read-file-tools.ts
      newHardcodedPacketIdsAdded: false
      unrelatedAllowlistEntriesChanged: false
      fpMcp242SpecificRationalePreserved: true

## Caveats

- This checkpoint validates source-level extraction only.
- Runtime service was not restarted as part of this checkpoint.
- Runtime Actions surface should be validated separately after build and restart.
- The contract checker required a one-line scanner update to include the new registration module.
- The hardcoded packet-id allowlist was updated only because existing example references moved files with the extracted block.
- The FP-MCP-242 allowlist rationale was preserved and extended with FP-MCP-360 move context.
- The extracted module uses broad output-schema dependency typing similar to previous extracted modules. This did not change runtime behavior, but it remains a possible later type-hardening target.
- One inline registration callback remains in server.ts: registerInlineAfterDiagnostics.

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

    FP-MCP-360 records a behavior-preserving replacement refactor that extracts the fourth inline MCP registration block from server.ts into a named tool-group module while preserving the checked 78-tool contract surface and 11-tool ChatGPT-safe default profile.
