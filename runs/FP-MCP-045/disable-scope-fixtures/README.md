# FP-MCP-045 disable switch negative scope fixtures

These artifacts record read-only observations from `forgepilot_get_execution_disable_switch_status`.

They intentionally do not enable execution, create approvals, contact the runner start endpoint, or start OpenCode.

The current implementation reports the global disable switch as active. These fixtures verify that supplying packet, request, model, or run-mode context does not override that global disable state.
