# FP-MCP-366A — Runtime validation for sanitized observer safe-surface exposure

## Checkpoint Type

    MCP_RUNTIME_VALIDATION

## Summary

This checkpoint validates that FP-MCP-366 is live in the ChatGPT MCP Actions surface.

Bridge commit 32f49e6 was built and the forgepilot-chatgpt-mcp user service was restarted. The live Actions manifest exposed forgepilot_observe_next_gate as a public ChatGPT-safe tool with the sanitized observer description.

Runtime diagnostics confirmed the MCP bridge remained read-only and did not start OpenCode, contact the runner start endpoint, consume approval, clear the disable switch, dump secrets, or run FP-027 canary.

## Claim

    FP-MCP-366A confirms that the sanitized read-only guarded sequencer observer is visible in the live ChatGPT-safe MCP Actions surface while preserving the non-execution runtime boundary.

## Structured Evidence

    sourceBaseline:
      coreBaseCommit: 01ea9fd
      bridgeBranch: feature/oauth-auth0
      bridgeCommit: 32f49e6
      bridgeCommitMessage: Expose sanitized guarded sequencer observer to safe surface

    buildAndRestart:
      pnpmBuild: PASS
      serviceName: forgepilot-chatgpt-mcp
      serviceRestarted: true
      runtimePidAfterRestart: 878792
      workingDirectory: /home/ridasaidd/forgepilot-chatgpt-mcp
      nodeVersion: v24.4.1
      platform: linux
      arch: arm64
      configuredSurface: chatgpt-safe

    liveActionsManifest:
      observerVisible: true
      observerToolName: forgepilot_observe_next_gate
      visibility: public
      sanitizedDescriptionVisible: true
      safeDescription: Read-only observation of the guarded canary state. Returns exactly one next required gate, reason codes, and a truthful boundary. It does not expose follow-on tool arguments in the safe observer response, performs no gate action, writes no files, and has no side effects.

    observerInputSchema:
      requiredFields:
        - executionPacketId
        - requestId
        - modelId
        - runMode
        - executionBaseCommit
        - branch
        - targetWorkspaceId
      optionalFields:
        - approvalPacketId
        - approvalId
        - clearanceId
        - enablementId
        - runnerCapabilityCheckedAt
        - stateSnapshotAttemptId
        - desiredApprovalPacketId

    toolDiscovery:
      apiToolQueryObserveResult: FOUND_ONE_TOOL
      chatgptActionsUiObserverVisible: true

    runtimeDiagnostics:
      checkedAt: 2026-07-05T22:05:08.770Z
      pid: 878792
      cwd: /home/ridasaidd/forgepilot-chatgpt-mcp
      nodeExecPath: /home/ridasaidd/.nvm/versions/node/v24.4.1/bin/node
      nodeVersion: v24.4.1
      platform: linux
      arch: arm64
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

    boundary:
      noOpenCodeStart: true
      noRunnerStartEndpointContact: true
      noApprovalConsumed: true
      noDisableSwitchCleared: true
      noSecretsDumped: true
      noCanaryRun: true
      noExecutionAuthorized: true

## Caveats

- The observer was discovered and made visible, but no guarded next-gate observation was executed in this checkpoint because no current valid request tuple was supplied.
- This checkpoint validates live visibility, runtime process identity, and non-execution boundary only.
- Functional observer output should be validated later against a specific request tuple when such a tuple is intentionally available.

## Non-Execution Boundary

    execution authorized: false
    approval consumed: false
    disable switch cleared: false
    runner start endpoint contacted: false
    OpenCode started: false
    FP-027 canary run: false

## Expected Result

    FP-MCP-366A records that FP-MCP-366 is live in the ChatGPT-safe Actions surface and that the MCP runtime boundary remained intact after build, restart, and manifest refresh.
