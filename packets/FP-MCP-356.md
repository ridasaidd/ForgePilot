# FP-MCP-356 — MCP registration orchestration extraction

## Checkpoint Type

    MCP_REGISTRATION_REFACTOR_RESULT

## Summary

Bridge commit 1b1c9dc extracted high-level MCP tool registration orchestration into src/tool-registry/register-tools.ts while preserving existing tool definitions and behavior.

The refactor added a narrow registration seam: src/server.ts still owns the legacy inline tool bodies, but high-level sequencing across grouped registrations, recent registrations, and inline registration callbacks now lives in registerForgePilotTools.

This was a phase-1 behavior-preserving refactor intended to reduce ambiguity in server.ts and make the MCP tool surface easier to audit before continuing sequencer work.

## Claim

    FP-MCP-356 extracted MCP registration orchestration from server.ts into an auditable registration module without changing tool names, schemas, handlers, approval literals, contract metadata, or surface-profile behavior.

## Structured Evidence

    sourceBaseline:
      bridgeBranch: feature/oauth-auth0
      bridgeBaseCommit: 533b590
      bridgeResultCommit: 1b1c9dc
      coreBaseCommit: b9bd581

    changedFiles:
      - src/server.ts
      - src/tool-registry/register-tools.ts

    diffSummary:
      filesChanged: 2
      insertions: 94
      deletions: 26
      newFiles:
        - src/tool-registry/register-tools.ts

    registrationStructure:
      newOrchestrator: src/tool-registry/register-tools.ts
      exportedFunction: registerForgePilotTools
      legacyInlineHandlersMoved: false
      legacyInlineHandlersWrappedAsCallbacks: true
      serverStillOwnsInlineToolBodies: true
      highLevelRegistrationOrderCentralized: true

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

## Caveats

- This was phase 1 only.
- Legacy inline tool handler bodies remain in src/server.ts.
- The refactor creates an orchestration seam but does not yet split the large legacy registration block into smaller modules.
- The canonical tsc wrapper previously had node-resolution issues in one shell mode, so direct TypeScript invocation through node was used and passed.
- Runtime service was not restarted as part of this checkpoint.
- Runtime Actions surface should be validated separately after service restart.

## Boundaries

- No tools added.
- No tools removed.
- No tools renamed.
- No input schemas changed.
- No output schemas changed.
- No descriptions changed.
- No approval literals changed.
- No handlers intentionally changed.
- No contract metadata changed.
- No surface-profile logic changed.
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

    FP-MCP-356 records a behavior-preserving MCP registration orchestration extraction that reduces server.ts ambiguity while preserving the checked 78-tool contract surface and 11-tool ChatGPT-safe default profile.
