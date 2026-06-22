# FP-MCP-048 Start Request Negative Approval Fixtures

These fixtures record observed outputs from `forgepilot_start_remote_runner_request`
after FP-MCP-048 bridge enforcement.

The test intent is not to start execution. The invariant for every fixture is:

- `started: false`
- `accepted: false`
- `runnerContacted: false`
- `startEndpointContacted: false`
- `executionStarted: false`
- `disableSwitchActive: true`

The valid approval case is still blocked by the global disable switch.
The invalid approval cases additionally record rejected approval evidence:

- `approvalAccepted: false`
- `START_APPROVAL_REJECTED`
- `APPROVAL_REQUIRED`

No runner start endpoint was contacted.
No OpenCode execution was started.
