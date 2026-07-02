# FP-MCP-162 Guarded Report Live Success

## Result

```text
STRUCTURED_APPROVAL_ACCEPTED_BY_GUARDED_PREFLIGHT_EXECUTION_STILL_BLOCKED
```

## Approval artifact

```text
approvalId: APPROVAL-20260702T161559974Z-9702bac5
path: runs/FP-MCP-162/approvals/APPROVAL-20260702T161559974Z-9702bac5.json
sha256: 840321dd8f227ea10c24b26d6049a9b613bb4df48aec53cc3f87fc7b0079c7e4
commit: 69dd260
```

## Direct validation

```text
approvalEvidenceValid: true
approvalValid: true
approvalUsableForExecution: true
humanApprovalRecorded: true
scopeExact: true
scopeMatchesExpected: true
artifactCommitted: true
reasons: []
```

## Guarded preflight human approval gate

```text
humanApprovalEvidence.evaluated: true
humanApprovalEvidence.passed: true
humanApprovalEvidence.state: PASSED
humanApprovalEvidence.reasons: []
```

## Other passed gates

```text
repository: PASSED
requestArtifact: PASSED
commitBinding: PASSED
modelAndRunMode: PASSED
```

## Remaining blockers

```text
disableSwitch: FAILED
runnerCapabilityState: FAILED
opencodeReadiness: FAILED
preStartEvidence: INCOMPLETE
stateSnapshotEvidence: INCOMPLETE
evidenceLedgerReadiness: INCOMPLETE
```

Top-level reasons:

```text
EXECUTION_DISABLED_GLOBAL
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
DISABLE_SWITCH_ACTIVE
EXECUTION_NOT_ALLOWED
PRE_START_EVIDENCE_LEDGER_ENTRY_MISSING
STATE_SNAPSHOT_LEDGER_ENTRY_MISSING
```

## Boundary

```text
executionPermitted: false
executionStarted: false
opencodeStarted: false
runnerStartEndpointContacted: false
approvalConsumed: false
requestArtifactMutated: false
runnerRunId: null
```

## Interpretation

The structured popup approval path is now accepted by both the canonical validator and the guarded preflight report.

Human approval is no longer the blocker for FP-MCP-159.

The next blockers are execution disable, runner/OpenCode readiness, pre-start evidence, state snapshots, and evidence ledger readiness.
