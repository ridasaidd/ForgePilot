# FP-MCP-048 Executor Result — Start Request Negative Approval Tests

## Result

PASS.

FP-MCP-048 verified that `forgepilot_start_remote_runner_request` now records rejected start approvals while preserving disable-switch precedence and non-execution guarantees.

## Bridge implementation

```text
repo: forgepilot-chatgpt-mcp
branch: feature/oauth-auth0
commit: 0b85c28
message: Record rejected start approvals before disabled start
```

## ForgePilot packet state

```text
repo: ForgePilot
branch: main
packetCommit: e33c357
packet: packets/FP-MCP-048.md
```

## Probe request

```text
packetId: FP-MCP-036
requestId: REQ-20260622T144553300Z-fbbe8d82
modelId: qwen-3.7-max
runMode: DESIGN_ONLY
```

## Observed approval cases

| Case | Approval input | approvalAccepted | startEndpointContacted | executionStarted | Required observations |
|---|---:|---:|---:|---:|---|
| valid start approval | START_REMOTE_RUNNER_REQUEST | true | false | false | START_REQUEST_BLOCKED_BY_DISABLE_SWITCH |
| wrong approval | WRONG_APPROVAL | false | false | false | START_APPROVAL_REJECTED, APPROVAL_REQUIRED |
| empty approval | empty string | false | false | false | START_APPROVAL_REJECTED, APPROVAL_REQUIRED |
| create-request approval | CREATE_REQUEST_ARTIFACT | false | false | false | START_APPROVAL_REJECTED, APPROVAL_REQUIRED |
| lowercase approval | start_remote_runner_request | false | false | false | START_APPROVAL_REJECTED, APPROVAL_REQUIRED |

## Invariants

```text
started: false
accepted: false
runnerContacted: false
startEndpointContacted: false
executionStarted: false
disableSwitchStatusEvaluated: true
disableSwitchActive: true
effectiveDisableReason: EXECUTION_DISABLED_GLOBAL
effectiveDisableScope: GLOBAL
boundaryVersion: FP-MCP-048
```

## Conclusion

FP-MCP-048 is eligible to close after committing the fixtures, aggregate result, and verification artifact.
