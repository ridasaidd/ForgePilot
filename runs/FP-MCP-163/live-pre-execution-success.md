# FP-MCP-163 Live Pre-Execution Evidence Success

## Result

```text
STRUCTURED_APPROVAL_PRE_EXECUTION_EVIDENCE_ACCEPTED_EXECUTION_STILL_BLOCKED
```

## Approval artifact

```text
approvalId: APPROVAL-20260702T165836932Z-e4191e1a
path: runs/FP-MCP-163/approvals/APPROVAL-20260702T165836932Z-e4191e1a.json
sha256: 4f4b74a075d97589f576e9dbf62508b11c97dddf928114131bdf860067c36a0d
commit: b588585
```

## Pre-start evidence

```text
path: runs/FP-MCP-159/pre-start-evidence/REQ-20260702T143631238Z-4e3b750e.json
sha256: 7e85dc2b30529019391c56634d70c9614ec2eb8f68e3887782fcca2502b68297
commit: c6fbfe8
preStartEvidenceComplete: true
preStartEvidenceValid: true
approvalObserved: true
approvalAccepted: true
artifactHashesPresent: true
artifactHashesConsistent: true
```

## State snapshots

```text
attemptId: ATTEMPT-20260702T165943947Z-5af33331
preStartSnapshotSha256: 2ff76844ad617e5174970627aeca720f1673ad35be71abfa407563a3134267b9
postStartSnapshotSha256: 968fb2c73845496e313db80700b4f02def6b28c3e88f290648339a29539b8457
commit: 39de9ba
stateSnapshotComplete: true
stateSnapshotValid: true
```

## Guarded preflight passed gates

```text
repository: PASSED
requestArtifact: PASSED
commitBinding: PASSED
modelAndRunMode: PASSED
preStartEvidence: PASSED
stateSnapshotEvidence: PASSED
humanApprovalEvidence: PASSED
evidenceLedgerReadiness: PASSED
```

## Remaining blockers

```text
disableSwitch: FAILED
runnerCapabilityState: FAILED
opencodeReadiness: FAILED
```

Top-level reasons:

```text
EXECUTION_DISABLED_GLOBAL
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
DISABLE_SWITCH_ACTIVE
EXECUTION_NOT_ALLOWED
```

## Boundary

```text
executionPermitted: false
executionStarted: false
opencodeStarted: false
runnerStartEndpointContacted: false
startEndpointContacted: false
runnerRunId: null
approvalConsumed: false
requestArtifactMutated: false
```

## Note

The guarded report still includes legacy blocker reason strings inside the passed preStartEvidence and stateSnapshotEvidence gate objects, but the gate booleans and top-level reasons are correct. This is a reporting cleanup candidate, not an execution blocker.
