# FP-MCP-049 Executor Result — Start Request Invalid Artifact Tests

## Result

PASS

## Summary

FP-MCP-049 validated that the remote runner start-request path rejects invalid request artifacts before any runner start endpoint contact.

The MCP bridge implementation was committed as:

```text
repo: forgepilot-chatgpt-mcp
branch: feature/oauth-auth0
commit: 9b9ad5c
message: Record rejected start request artifacts
```

## Observed behavior

A valid FP-MCP-036 request artifact remained valid input but was still blocked by the global disable switch:

```text
boundaryVersion: FP-MCP-049
localValidationPassed: true
runnerContacted: false
startEndpointContacted: false
executionStarted: false
reasons:
  START_REQUEST_BLOCKED_BY_DISABLE_SWITCH
```

A missing FP-MCP-049 request artifact was rejected observably:

```text
boundaryVersion: FP-MCP-049
localValidationPassed: false
runnerContacted: false
startEndpointContacted: false
executionStarted: false
reasons:
  START_REQUEST_BLOCKED_BY_DISABLE_SWITCH
  UNKNOWN_REQUEST
  START_REQUEST_ARTIFACT_REJECTED
  START_REQUEST_ARTIFACT_MISSING
```

A malformed request id was rejected observably:

```text
boundaryVersion: FP-MCP-049
localValidationPassed: false
runnerContacted: false
startEndpointContacted: false
executionStarted: false
reasons:
  INVALID_REQUEST_ID
  START_REQUEST_ARTIFACT_REJECTED
  START_REQUEST_ARTIFACT_MISSING
```

## Execution boundary

```text
started: false
runnerContacted: false
startEndpointContacted: false
executionStarted: false
disableSwitchActive: true
effectiveDisableReason: EXECUTION_DISABLED_GLOBAL
effectiveDisableScope: GLOBAL
```

No OpenCode execution was started. No runner start endpoint was contacted.
