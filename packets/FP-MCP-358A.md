# FP-MCP-358A — Runtime validation after second inline registration extraction

## Checkpoint Type

    MCP_RUNTIME_VALIDATION_RESULT

## Summary

After FP-MCP-358 bridge commit 67f641e, the MCP bridge was built and restarted from dist/server.js. Connector runtime diagnostics confirmed the restarted service remained in the safe, read-only non-execution boundary.

FP-MCP-358 extracted the second inline MCP registration block from src/server.ts into src/tool-groups/inline-between-validate-opencode-and-phase3-tools.ts. The moved tools were forgepilot_create_opencode_run_request and forgepilot_record_non_executing_run_request_artifact.

This runtime checkpoint validates that the service still exposes the expected safe runtime boundary after the source extraction, build, and restart.

## Claim

    FP-MCP-358A validates that the MCP service restarted after FP-MCP-358 and preserved the safe read-only non-execution boundary.

## Structured Evidence

    sourceBaseline:
      coreBaseCommit: d2c4098
      bridgeBranch: feature/oauth-auth0
      bridgeCommit: 67f641e
      bridgeChange: Extract second inline MCP registration block

    sourceExtractionValidatedByFPMCP358:
      movedTools:
        - forgepilot_create_opencode_run_request
        - forgepilot_record_non_executing_run_request_artifact
      oldInlineCallbackRemoved: registerInlineBetweenValidateOpencodeAndPhase3
      newModule: src/tool-groups/inline-between-validate-opencode-and-phase3-tools.ts
      toolContractCheck: PASS
      registeredToolCount: 78
      contractCount: 78
      defaultVisibleCount: 11
      chatgptSafeVisibleCount: 11
      devVisibleCount: 76
      allVisibleCount: 78
      hardcodedPacketIdLint: PASS
      typecheck: PASS
      gitDiffCheck: PASS

    runtimeDiagnostics:
      checkedAt: 2026-07-05T14:58:42.240Z
      process:
        pid: 866027
        cwd: /home/ridasaidd/forgepilot-chatgpt-mcp
        nodeExecPath: /home/ridasaidd/.nvm/versions/node/v24.4.1/bin/node
        nodeVersion: v24.4.1
        platform: linux
        arch: arm64
      configuredBinaries:
        forgepilotPnpmBin: /home/ridasaidd/.nvm/versions/node/v24.4.1/bin/pnpm
        forgepilotOpencodeBin: null
      commandChecks:
        nodeAvailable: true
        nodeVersion: v24.4.1
        pnpmLiteralAvailable: true
        pnpmLiteralVersion: 11.5.2
        pnpmConfiguredAvailable: true
        pnpmConfiguredVersion: 11.5.2
        opencodeLiteralConfigured: false
        opencodeLiteralAvailable: false
        opencodeLiteralReason: OPENCODE_CHECK_SKIPPED
      boundary:
        readOnly: true
        secretsDumped: false
        executionAuthorized: false
        approvalConsumed: false
        disableSwitchCleared: false
        runnerStartEndpointContacted: false
        opencodeStarted: false
        fp027CanaryRun: false
      reasons:
        - CONFIGURED_PNPM_BIN_USES_ENV_NODE
        - OPENCODE_CHECK_SKIPPED

    coreStatusAfterRuntimeCheck:
      branch: main
      commit: d2c4098
      workingTreeClean: true

## Caveats

- This checkpoint validates runtime boundary after build and restart.
- It does not execute OpenCode.
- It does not contact the runner start endpoint.
- It does not validate dev or all surface profiles.
- It relies on connector runtime diagnostics and operator-reported Actions refresh.
- Remaining inline registration blocks still exist in src/server.ts and should be extracted in later packets.

## Boundaries

- No tools added.
- No tools removed.
- No tools renamed.
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

    FP-MCP-358A records that the MCP service restarted after FP-MCP-358 and preserved the safe read-only non-execution runtime boundary.
