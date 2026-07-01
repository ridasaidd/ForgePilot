# FP-MCP-142 — Real MCP Preflight Blocker Report

## Outcome

A fresh FP-MCP-142 approval artifact was created by the MCP recorder, but the first real MCP guarded preflight did not allow start.

No runner start occurred.

No OpenCode process was started.

No approval was consumed.

## Fresh Approval Artifact

```text
path: runs/FP-MCP-142/approvals/APPROVAL-20260701T100810315Z-31a8bcfb.json
sha256: 503237eb59872707448aa6d58b05a84b913d75a5002b97f50189f0243cb7824d
approvalId: APPROVAL-20260701T100810315Z-31a8bcfb
createdBy: forgepilot_record_real_human_approval_evidence
approvalConsumed: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

## First Preflight Attempt

The first preflight was called with:

```text
packetId: FP-MCP-142
requestId: REQ-20260630T202005438Z-86d20df4
approvalId: APPROVAL-20260701T100810315Z-31a8bcfb
```

That was the wrong packet id for request lookup. The existing request artifact lives under FP-MCP-134, not FP-MCP-142.

Observed blockers included:

```text
REQUEST_ARTIFACT_MISSING
REQUEST_ARTIFACT_INVALID
UNSAFE_ARTIFACT_DIR
BASE_COMMIT_MISMATCH
MODEL_ID_MISSING
RUN_MODE_MISSING
EXECUTION_DISABLED_GLOBAL
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
DISABLE_SWITCH_ACTIVE
START_ENDPOINT_DISABLED
START_NOT_CALLABLE
```

## Corrected Preflight Attempt

The second preflight was called with:

```text
packetId: FP-MCP-134
requestId: REQ-20260630T202005438Z-86d20df4
approvalId: APPROVAL-20260701T100810315Z-31a8bcfb
```

This corrected the request artifact lookup.

Passing gates:

```text
requestArtifact: PASSED
commitBinding: PASSED
modelAndRunMode: PASSED
preStartEvidence: PASSED
```

Remaining blockers:

```text
repository: FAILED
reason: REPO_DIRTY

disableSwitch: FAILED
reasons:
- EXECUTION_DISABLED_GLOBAL
- RUNNER_EXECUTION_DISABLED
- OPENCODE_EXECUTION_DISABLED
- DISABLE_SWITCH_ACTIVE
- EXECUTION_NOT_ALLOWED
- START_REQUEST_BLOCKED_BY_DISABLE_SWITCH

runnerCapabilityState: FAILED
reasons:
- START_ENDPOINT_DISABLED
- START_NOT_CALLABLE

opencodeReadiness: FAILED
reasons:
- OPENCODE_NOT_CONFIGURED
- OPENCODE_EXECUTION_DISABLED

stateSnapshotEvidence: INCOMPLETE
reasons included:
- STATE_SNAPSHOT_SCHEMA_INVALID
- STATE_SNAPSHOT_ARTIFACT_TYPE_INVALID
- STATE_SNAPSHOT_RUNNERCONTACTEDFORSTART_INVALID
- STATE_SNAPSHOT_DISABLE_SWITCH_INVALID
- STATE_SNAPSHOT_PRE_STATE_REFERENCE_MISMATCH
- STATE_SNAPSHOT_PRE_STATE_HASH_MISMATCH
- STATE_SNAPSHOT_INVALID

humanApprovalEvidence: FAILED
reasons:
- HUMAN_APPROVAL_EVIDENCE_TARGET_COMMIT_MISMATCH
- HUMAN_APPROVAL_EVIDENCE_FIXTURE_NOT_AUTHORIZING
- HUMAN_APPROVAL_EVIDENCE_NOT_USABLE_FOR_EXECUTION

evidenceLedgerReadiness: INCOMPLETE
reason:
- STATE_SNAPSHOT_LEDGER_ENTRY_MISSING
```

## Interpretation

This packet has now reached the real implementation boundary.

The local preflight script and the server-side MCP preflight do not fully agree.

The next work should patch the bridge/server execution path, not add more abstract evidence packets.

Concrete implementation issues to fix next:

1. Use the existing FP-MCP-134 request artifact when FP-MCP-142 is the recorder/execution packet.
2. Normalize server-side state snapshot validation to accept the already-recorded FP-MCP-140 snapshot evidence or record a fresh server-compatible state snapshot.
3. Normalize server-side human approval validation so fresh target-bound approval evidence can authorize the guarded start path.
4. Narrow the global execution disable switch for this exact request only.
5. Make runner start callable only as guarded DESIGN_ONLY execution.
6. Configure OpenCode readiness for DESIGN_ONLY execution only.

## Safety Result

```text
executionStarted: false
opencodeStarted: false
runnerStartEndpointContacted: false
startEndpointContacted: false
runnerRunId: null
approvalConsumed: false
requestArtifactMutated: false
```
