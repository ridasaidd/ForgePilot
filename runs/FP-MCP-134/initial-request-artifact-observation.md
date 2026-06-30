# FP-MCP-134 Initial Request Artifact Observation

Result: NEGATIVE_OBSERVATION_RECORDED

## Context

After the first FP-MCP-134 bridge patch, a verification request artifact was created.

The request was safe and non-executing, but it did not include the required target commit fields.

## Request Artifact

```text
requestId: REQ-20260630T201607512Z-b14f6109
path: runs/FP-MCP-134/opencode-requests/REQ-20260630T201607512Z-b14f6109.json
packetId: FP-MCP-134
modelId: deepseek-v4-pro-high
runMode: DESIGN_ONLY
baseCommit: 74ed46d
repoCommit: 74ed46d
executionStarted: False
opencodeStarted: False
startEndpointContacted: False
runnerRunId: None
```

## Target Field Check

```text
targetExecutionCommit present: False
approvedTargetExecutionCommit present: False
```

## Interpretation

This artifact is preserved as evidence that the first implementation patch did not hit the actual request artifact construction object.

The bridge was then repaired separately with commit:

```text
0a4236e Bind request artifacts to target execution commit
```

## Safety

The artifact remained non-executing:

```text
executionEnabled: False
executionStarted: False
opencodeStarted: False
startEndpointContacted: False
runnerRunId: None
approvalConsumed: false
```

## Conclusion

The initial request artifact is useful negative evidence and is committed before creating the second verification artifact.
