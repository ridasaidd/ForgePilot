# FP-MCP-372A — Runtime validation for sandbox preview writer exposure

## Checkpoint Type

    MCP_SANDBOX_PREVIEW_WRITER_RUNTIME_VALIDATION

## Summary

This packet records runtime validation after restarting the ForgePilot ChatGPT MCP bridge following FP-MCP-372.

FP-MCP-372 implemented a non-executing sandbox preview artifact writer on the bridge dev surface.

FP-MCP-372A verifies that the running MCP service restarted successfully, preserved the safe boundary, and did not expose the preview writer to ChatGPT-safe/public Actions.

## Claim

    The MCP runtime restarted successfully after FP-MCP-372, preserved the non-execution boundary, and did not expose forgepilot_create_sandboxed_command_preview to ChatGPT-safe/public Actions.

## Runtime Restart

The MCP bridge was restarted using the user service:

    systemctl --user restart forgepilot-chatgpt-mcp.service

The system service name with sudo was not used because that unit did not exist.

The correct active service was:

    forgepilot-chatgpt-mcp.service

The runner service was not restarted:

    forgepilot-runner.service

## Runtime Diagnostics

Runtime diagnostics after restart:

    oldPid: 878792
    newPid: 884582
    cwd: /home/ridasaidd/forgepilot-chatgpt-mcp
    nodeVersion: v24.4.1
    platform: linux
    arch: arm64

The PID changed, confirming the runtime restarted.

## Runtime Boundary

Runtime boundary after restart:

    readOnly: true
    secretsDumped: false
    executionAuthorized: false
    approvalConsumed: false
    disableSwitchCleared: false
    runnerStartEndpointContacted: false
    opencodeStarted: false
    fp027CanaryRun: false

## OpenCode Status

OpenCode status after restart:

    opencodeExecutionEnabled: false
    liveOpenCodeChecked: false
    executionDisabledReason: Executor start tools are not implemented.

This confirms that no OpenCode execution path was enabled or started.

## ChatGPT Actions Surface

The ChatGPT app Actions UI was refreshed after the MCP bridge restart.

Observed visible public Actions:

1. forgepilot_get_mcp_runtime_diagnostics
2. forgepilot_get_opencode_capabilities
3. forgepilot_get_opencode_status
4. forgepilot_list_opencode_run_requests
5. forgepilot_list_packets
6. forgepilot_list_runs
7. forgepilot_observe_next_gate
8. forgepilot_read_file
9. forgepilot_read_opencode_run_request
10. forgepilot_status
11. forgepilot_validate_opencode_run_request
12. forgepilot_validate_remote_runner_request

## Action Surface Observation

The user-visible UI showed 11 numbered public Action entries in the copied text, but the listed action names contain 12 actions.

The safety-relevant observation is unchanged:

    forgepilot_create_sandboxed_command_preview is not present.

## Contract Count vs Runtime UI Observation

FP-MCP-372 bridge contract tests reported:

    chatgpt-safe: 12
    gated: 30
    dev: 32
    legacy: 5
    total: 79

The refreshed ChatGPT app UI showed the expected public read-only/validation surface and did not show the new preview writer.

Therefore the runtime validation records:

    contractExpectedChatgptSafeCount: 12
    observedPublicActionNames: 12
    previewWriterVisibleInChatgptSafe: false

## Preview Writer Visibility

The FP-MCP-372 tool:

    forgepilot_create_sandboxed_command_preview

was not visible in ChatGPT-safe/public Actions.

Expected surface:

    dev

Expected ChatGPT-safe visibility:

    false

Observed ChatGPT-safe/public visibility:

    false

## Non-Execution Boundary

No sandbox execution occurred.

No bubblewrap execution occurred.

No shell execution occurred.

No command execution MCP tool was exposed to ChatGPT-safe.

No approval was consumed.

No disable switch was cleared.

No runner start endpoint was contacted.

No OpenCode start occurred.

No FP-027 canary run occurred.

## Result

    PASS

with observation:

    Runtime restarted successfully.
    Safe boundary remained intact.
    Preview writer was not exposed to ChatGPT-safe/public Actions.
    ChatGPT-safe/public surface remained read-only/validation-only.
