# FP-MCP-355 — Runtime safe surface validation

## Checkpoint Type

    RUNTIME_SURFACE_VALIDATION

## Summary

After FP-MCP-354, runtime/action refresh validated that the default ChatGPT-safe MCP surface exposed exactly the expected 11 safe tools. A safe-surface runtime diagnostics call confirmed the restarted bridge process, read-only boundary, no OpenCode start, and no runner-start contact.

A temporary dev profile was later enabled only to expose checkpoint-recording functionality. After explicit systemd override, daemon reload, service restart, and Actions refresh, the broader dev surface became visible. The ChatGPT approval popup for the checkpoint recorder flagged risk categories including ConfigOverride, consistent with the platform recognizing the FORGEPILOT_MCP_SURFACE override as risk-relevant.

Attempts to record this checkpoint through forgepilot_record_packet_checkpoint failed with “Error in message stream”, and packets/FP-MCP-355.md was verified absent before manual recording. The service was then returned to the ChatGPT-safe surface.

## Claim

    After FP-MCP-354, runtime/action refresh validated that the default ChatGPT-safe MCP surface exposed exactly the expected 11 safe tools. A temporary dev profile later exposed the broader surface only after explicit systemd override, service restart, Actions refresh, and per-call user approval boundary.

## Structured Evidence

    sourceBaseline:
      coreCommit: 93c835a
      bridgeCommit: 533b590

    safeSurface:
      expectedVisibleToolCount: 11
      observedVisibleToolCount: 11
      broadToolsVisibleByDefault: false
      defaultProfile: chatgpt-safe via unset/default behavior
      restoredServiceEnvironment: FORGEPILOT_MCP_SURFACE=chatgpt-safe

    safeRuntimeDiagnostic:
      checkedAt: 2026-07-05T12:41:19.680Z
      pid: 859211
      cwd: /home/ridasaidd/forgepilot-chatgpt-mcp
      nodeVersion: v24.4.1
      readOnly: true
      opencodeStarted: false
      runnerStartEndpointContacted: false

    postRestoreRuntimeDiagnostic:
      checkedAt: 2026-07-05T13:19:53.899Z
      pid: 860402
      cwd: /home/ridasaidd/forgepilot-chatgpt-mcp
      nodeVersion: v24.4.1
      readOnly: true
      opencodeStarted: false
      runnerStartEndpointContacted: false
      executionAuthorized: false
      approvalConsumed: false
      disableSwitchCleared: false

    devProfile:
      serverEnvironment: FORGEPILOT_MCP_SURFACE=dev
      servicePidAfterDevRestart: 859932
      checkpointToolVisible: true
      configOverrideRiskFlaggedByChatGPTApprovalPopup: true
      purpose: temporary checkpoint recording only

    recordingProblem:
      checkpointRecorderAttempts: failed with Error in message stream
      packets/FP-MCP-355.md: absent during previous verification

## Caveats

- The journal did not show the expected surface-profile startup line during earlier validation.
- The default-safe Actions surface was the decisive runtime evidence.
- The dev profile was enabled only temporarily to expose checkpoint-recording access.
- Previous checkpoint recorder attempts failed with “Error in message stream”.
- This checkpoint records runtime/action-surface validation only, not model execution.

## Boundaries

- No model execution authorized.
- No OpenCode start intended.
- No runner start endpoint contacted.
- No approval consumed for execution.
- No disable switch cleared.
- No canary run.
- Dev profile was used only for checkpoint-recording access and must not remain enabled.

## Non-Execution Boundary

    execution authorized: false
    approval consumed: false
    disable switch cleared: false
    runner start endpoint contacted: false
    OpenCode started: false
    FP-027 canary run: false

## Expected Result

    FP-MCP-355 records that the FP-MCP-354 default ChatGPT-safe runtime surface was validated after service restart/action refresh, with exactly 11 safe tools visible by default and broader dev tools visible only after explicit override plus user approval boundary.
