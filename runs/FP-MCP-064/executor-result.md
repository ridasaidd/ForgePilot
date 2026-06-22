# FP-MCP-064 Executor Result

Packet: FP-MCP-064 — Start Request Human Approval Evidence Gate Enforcement

## Summary

FP-MCP-064 was implemented in the MCP bridge start path and verified through live MCP probes.

The guarded start request path now evaluates human approval evidence before a request can approach the runner start boundary.

## Bridge Commit

Repository: forgepilot-chatgpt-mcp
Branch: feature/oauth-auth0
Commit: 44592b0
Message: Enforce human approval evidence gate on start requests

## ForgePilot Packet Commit

Repository: ForgePilot
Branch: main
Commit: 3512a64
Packet: packets/FP-MCP-064.md

## Implemented Behavior

The guarded start tool now exposes an optional approval evidence id input:

```text
approvalId?: string
```

The start path reports FP-MCP-064 approval evidence gate fields:

```text
humanApprovalEvidenceEvaluated
humanApprovalEvidenceGatePassed
humanApprovalEvidenceId
humanApprovalEvidencePath
humanApprovalEvidenceValid
humanApprovalEvidenceUsableForExecution
humanApprovalEvidenceReasons
approvalValidationEvaluated
approvalEvidenceValid
approvalValid
approvalUsableForExecution
approvalCreated
approvalMutated
humanApprovalRecorded
```

## Probe 1 — Missing Approval Evidence

Input:

```json
{
  "packetId": "FP-MCP-036",
  "requestId": "REQ-20260622T144553300Z-fbbe8d82",
  "approval": "START_REMOTE_RUNNER_REQUEST"
}
```

Observed result:

```text
boundaryVersion: FP-MCP-064
humanApprovalEvidenceEvaluated: true
humanApprovalEvidenceGatePassed: false
humanApprovalEvidenceId: null
humanApprovalEvidencePath: null
humanApprovalEvidenceValid: false
humanApprovalEvidenceUsableForExecution: false
approvalValidationEvaluated: false
approvalEvidenceValid: false
approvalValid: false
approvalUsableForExecution: false
approvalCreated: false
approvalMutated: false
humanApprovalRecorded: false
started: false
accepted: false
runnerContacted: false
startEndpointContacted: false
executionStarted: false
opencodeStarted: false
```

Observed blocking reasons:

```text
HUMAN_APPROVAL_EVIDENCE_MISSING
START_REQUEST_HUMAN_APPROVAL_EVIDENCE_GATE_BLOCKED
START_REQUEST_BLOCKED_BY_DISABLE_SWITCH
EXECUTION_DISABLED_GLOBAL
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
DISABLE_SWITCH_ACTIVE
EXECUTION_NOT_ALLOWED
EXECUTION_DISABLED
START_ENDPOINT_NOT_CONTACTED
OPENCODE_NOT_STARTED
```

## Probe 2 — Invalid/Missing Approval Evidence Id

Input:

```json
{
  "packetId": "FP-MCP-036",
  "requestId": "REQ-20260622T144553300Z-fbbe8d82",
  "approvalId": "APPROVAL-20260622T225539362Z-cb42d99f",
  "approval": "START_REMOTE_RUNNER_REQUEST"
}
```

Observed result:

```text
boundaryVersion: FP-MCP-064
humanApprovalEvidenceEvaluated: true
humanApprovalEvidenceGatePassed: false
humanApprovalEvidenceId: APPROVAL-20260622T225539362Z-cb42d99f
humanApprovalEvidencePath: runs/FP-MCP-036/approvals/APPROVAL-20260622T225539362Z-cb42d99f.json
humanApprovalEvidenceValid: false
humanApprovalEvidenceUsableForExecution: false
humanApprovalEvidenceReasons:
  - APPROVAL_EVIDENCE_ARTIFACT_MISSING
  - APPROVAL_ARTIFACT_MISSING
approvalValidationEvaluated: true
approvalEvidenceValid: false
approvalValid: false
approvalUsableForExecution: false
approvalCreated: false
approvalMutated: false
humanApprovalRecorded: false
started: false
accepted: false
runnerContacted: false
startEndpointContacted: false
executionStarted: false
opencodeStarted: false
```

Observed blocking reasons:

```text
START_REQUEST_HUMAN_APPROVAL_EVIDENCE_GATE_BLOCKED
HUMAN_APPROVAL_EVIDENCE_INVALID
HUMAN_APPROVAL_EVIDENCE_NOT_USABLE_FOR_EXECUTION
APPROVAL_EVIDENCE_ARTIFACT_MISSING
APPROVAL_ARTIFACT_MISSING
START_REQUEST_BLOCKED_BY_DISABLE_SWITCH
EXECUTION_DISABLED_GLOBAL
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
DISABLE_SWITCH_ACTIVE
EXECUTION_NOT_ALLOWED
EXECUTION_DISABLED
START_ENDPOINT_NOT_CONTACTED
OPENCODE_NOT_STARTED
```

## Preserved Valid Gates

The canonical request still had valid non-approval evidence:

```text
localValidationPassed: true
preStartEvidenceEvaluated: true
preStartEvidenceComplete: true
preStartEvidenceValid: true
stateSnapshotEvaluated: true
stateSnapshotComplete: true
stateSnapshotValid: true
```

## Safety Result

```text
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerContacted: false
humanApprovalRecorded: false
approvalUsableForExecution: false
```

## Result

PASS.

FP-MCP-064 successfully wires human approval evidence validation into the guarded start path and blocks start requests when valid human approval evidence is missing or unusable.
