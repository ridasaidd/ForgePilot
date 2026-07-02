# FP-MCP-163 Post-Refresh Approval Propagation Check

## Result

```text
APPROVAL_ID_PROPAGATION_FIX_LIVE_RUNTIME_CONFIRMED
```

## Runtime check

Called running bridge action after operator refresh:

```text
forgepilot_get_guarded_start_preflight_report(
  packetId=FP-MCP-159,
  requestId=REQ-20260702T143631238Z-4e3b750e,
  approvalId=APPROVAL-20260702T165836932Z-e4191e1a
)
```

Checked at:

```text
2026-07-02T17:23:38.449Z
```

## Source fix under test

```text
bridge commit: 1c42e6c Propagate approval id into pre-execution validation
```

## Confirmed passed gates

```text
repository: PASSED
requestArtifact: PASSED
commitBinding: PASSED
modelAndRunMode: PASSED
humanApprovalEvidence: PASSED
preStartEvidence: PASSED
stateSnapshotEvidence: PASSED
evidenceLedgerReadiness: PASSED
```

## Legacy human-approval blocker strings removed from pre-execution evidence gates

The prior problematic reason strings were absent from both `preStartEvidence.reasons` and `stateSnapshotEvidence.reasons`:

```text
HUMAN_APPROVAL_EVIDENCE_MISSING: ABSENT
EXECUTION_PREFLIGHT_HUMAN_APPROVAL_EVIDENCE_GATE_BLOCKED: ABSENT
HUMAN_APPROVAL_EVIDENCE_NOT_USABLE_FOR_EXECUTION: ABSENT
```

Remaining reasons inside the passed pre-execution gates were execution-disable observations only:

```text
EXECUTION_DISABLED
START_ENDPOINT_NOT_CONTACTED
OPENCODE_NOT_STARTED
EXECUTION_DISABLED_GLOBAL
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
DISABLE_SWITCH_ACTIVE
EXECUTION_NOT_ALLOWED
```

Top-level guarded report reasons were also limited to execution-disable/OpenCode/runner blockers:

```text
EXECUTION_DISABLED_GLOBAL
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
DISABLE_SWITCH_ACTIVE
EXECUTION_NOT_ALLOWED
```

## Execution boundary preserved

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

## Interpretation

The FP-MCP-163 approval-id propagation fix is live-runtime-confirmed.

The original caveat is narrowed:

```text
legacy human-approval blocker reason strings are no longer present in passed pre-execution evidence gates after refresh
```

Remaining reason strings are execution-disable observations and do not clear execution.
