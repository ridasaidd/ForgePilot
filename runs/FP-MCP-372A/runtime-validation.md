# FP-MCP-372A Runtime Validation

## Result

PASS.

## Purpose

Validate the running MCP bridge after FP-MCP-372.

FP-MCP-372 added a non-executing sandbox preview artifact writer on the dev surface.

This validation confirms that runtime restart succeeded and the preview writer is not visible in ChatGPT-safe/public Actions.

## Restart

Correct service:

    systemctl --user restart forgepilot-chatgpt-mcp.service

Incorrect service attempt:

    sudo systemctl restart forgepilot-chatgpt-mcp.service

Result of incorrect attempt:

    Unit forgepilot-chatgpt-mcp.service not found.

Resolution:

    The active MCP bridge is a user service.

## Runtime PID

Before restart:

    878792

After restart:

    884582

Conclusion:

    Runtime restart confirmed.

## Runtime Diagnostics

    cwd: /home/ridasaidd/forgepilot-chatgpt-mcp
    node: v24.4.1
    platform: linux arm64

## Safe Boundary

    readOnly: true
    secretsDumped: false
    executionAuthorized: false
    approvalConsumed: false
    disableSwitchCleared: false
    runnerStartEndpointContacted: false
    opencodeStarted: false
    fp027CanaryRun: false

## OpenCode Status

    opencodeExecutionEnabled: false
    liveOpenCodeChecked: false
    executionDisabledReason: Executor start tools are not implemented.

## ChatGPT Actions UI Observation

The refreshed ChatGPT app Actions UI listed the following public tools:

- forgepilot_get_mcp_runtime_diagnostics
- forgepilot_get_opencode_capabilities
- forgepilot_get_opencode_status
- forgepilot_list_opencode_run_requests
- forgepilot_list_packets
- forgepilot_list_runs
- forgepilot_observe_next_gate
- forgepilot_read_file
- forgepilot_read_opencode_run_request
- forgepilot_status
- forgepilot_validate_opencode_run_request
- forgepilot_validate_remote_runner_request

The new FP-MCP-372 tool was not visible:

    forgepilot_create_sandboxed_command_preview: not visible

## Count Observation

The user-visible UI text appeared to describe 11 public entries, while the copied action-name list contains 12 action names.

The safety-relevant claim is independent of the count ambiguity:

    forgepilot_create_sandboxed_command_preview is not exposed to ChatGPT-safe/public Actions.

## Non-Execution Statement

No command execution occurred.

No bubblewrap execution occurred.

No shell execution occurred.

No command execution MCP tool was exposed to ChatGPT-safe.

No runner start endpoint was contacted.

No OpenCode start occurred.

No approval was consumed.

No disable switch was cleared.

No FP-027 canary run occurred.

## Classification

    RUNTIME_VALIDATION_PASS_WITH_COUNT_OBSERVATION

## Next Candidate Packet

    FP-MCP-373 — Sandbox preview artifact writer smoke test by direct dev/internal path

Important:

The next packet must still be non-executing.

It may create a preview artifact only if invoked through the appropriate non-ChatGPT-safe/dev/internal path.

It must not execute the proposed command.
