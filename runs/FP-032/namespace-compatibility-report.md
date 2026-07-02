# FP-032 Namespace Compatibility Report

## Result

```text
REMOTE_RUNNER_ACCEPTS_FP_MCP_REJECTS_FP_NAMESPACE
```

## FP-031 local validation

Local ForgePilot request validation accepted FP-031:

```text
valid: true
packetExists: true
modelAllowed: true
runModeAllowed: true
workingTreeClean: true
executionEnabled: false
```

Local remote-runner validation-only policy accepted FP-031:

```text
eligible: true
runnerContacted: false
reasons: []
```

## FP-031 remote endpoint validation

The remote runner validate-request endpoint rejected FP-031:

```text
valid: false
runnerContacted: true
runnerAccepted: false
reasons: INVALID_PACKET_ID, RUNNER_REJECTED_REQUEST
```

## FP-MCP-036 comparison probe

The same non-starting remote endpoint accepted an existing FP-MCP request:

```text
packetId: FP-MCP-036
requestId: REQ-20260622T144553300Z-fbbe8d82
valid: true
runnerContacted: true
runnerAccepted: true
reasons: []
```

## Source inspection

Local bridge packet id validator accepts `FP-*` style packet ids:

```text
/^FP-[A-Z0-9]+(?:-[A-Z0-9]+)*$/
```

That regex accepts both:

```text
FP-031
FP-MCP-036
```

The remote runner source is not present in the bridge repository. The endpoint behavior is therefore a black-box observation.

## Classification

```text
REMOTE_RUNNER_NAMESPACE_POLICY_DIVERGES_FROM_LOCAL_FORGEPILOT_POLICY
```

## Interpretation

This is not an executor failure and not an OpenCode failure.

It is a protocol compatibility blocker between the local bridge policy and the remote runner endpoint policy.

## Boundary

No worker started.
No OpenCode process started.
No remote start endpoint was contacted.
No bridge source changed.
No runner source changed.
