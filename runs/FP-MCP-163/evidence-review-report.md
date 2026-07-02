# FP-MCP-163 Evidence Review Report

## Scope

This report covers the milestone currently described as:

```text
STRUCTURED_APPROVAL_PRE_EXECUTION_EVIDENCE_ACCEPTED_EXECUTION_STILL_BLOCKED
```

This is the live FP-MCP-163 result showing that structured approval, pre-start evidence, state snapshots, and evidence-ledger readiness are accepted by guarded preflight while execution remains blocked.

## 1. V1-O recording status

### V1-O recording currently present

FP-MCP-163 has a V1-O record for the **source implementation milestone**, not for the later **live guarded-preflight success milestone**.

Current DB proof:

```text
total_evidence_records: 25
total_generic_evidence_record_admission_events: 25
```

Existing FP-MCP-163 V1-O record:

```text
evidence_id: 25
run_id: FP-MCP-163-STRUCTURED-APPROVAL-PRE-EXECUTION-INTEGRATION
canonical_status: GENERIC_EVENT_CANONICAL
canonical_surface: evidence_admission_events
canonical_state: ADMITTED
admitted_claim: STRUCTURED_APPROVAL_PRE_EXECUTION_INTEGRATION_SOURCE_VERIFIED_REFRESH_PENDING
```

Evidence DB row:

```text
model_id: none
model_role: safety_integration_implementation
branch: feature/oauth-auth0
commit_sha: c996ce2
executor_result: STRUCTURED_APPROVAL_PRE_EXECUTION_INTEGRATION_SOURCE_VERIFIED_REFRESH_PENDING
verification_result: BRIDGE_PNPM_BUILD_PASS;BRIDGE_PNPM_TEST_PASS;ACTION_REFRESH_PENDING;NO_EXECUTION_STARTED
admission_state: ADMITTED
validation_state: VALID
trust_tier: TIER_2_VERIFIED_ARTIFACT
```

Generic admission event:

```text
generic_admission_event_id: 25
target_observation_type: evidence_record
target_observation_id: 25
admission_decision: ADMITTED
admission_trust_tier: TIER_2
validation_state: VALID
provenance_complete: true
admission_basis: FP-MCP-163 admits structured approval pre-execution integration source implementation
```

### V1-O recording not yet present

The later live milestone:

```text
STRUCTURED_APPROVAL_PRE_EXECUTION_EVIDENCE_ACCEPTED_EXECUTION_STILL_BLOCKED
```

is committed as file evidence, but it is **not yet recorded as a separate V1-O evidence_record** in SQLite.

So the current status is:

```text
FP-MCP-163 implementation: V1-O RECORDED
FP-MCP-163 live guarded-preflight success: FILE-ARTIFACT RECORDED, V1-O NOT YET RECORDED
```

## 2. Where `FP-MCP-*` sits relative to `FP-0XX`

`FP-MCP-*` is a bridge-side packet namespace for ForgePilot MCP tooling/runner/bridge integration work, while `FP-0XX` is the root ForgePilot core/evidence/governance implementation track; both are packet series under ForgePilot, but they govern different durable artifact domains.

## 3. Evidentiary status of the eight PASSED gates

The eight PASSED gate claims come from a live call to the running bridge action:

```text
forgepilot_get_guarded_start_preflight_report(packetId=FP-MCP-159, requestId=REQ-20260702T143631238Z-4e3b750e, approvalId=APPROVAL-20260702T165836932Z-e4191e1a)
```

The live result was recorded in summary artifacts:

```text
runs/FP-MCP-163/live-pre-execution-success.md
runs/FP-MCP-163/live-pre-execution-success.json
```

Gate classifications:

| Gate | Status | Evidentiary class | Basis |
|---|---:|---|---|
| repository | PASSED | live-runtime-confirmed | Guarded report returned `repository: PASSED` from the running bridge, with `repoClean: true`, `currentCommit: 39de9ba`, `currentBranch: main` at check time. |
| requestArtifact | PASSED | live-runtime-confirmed + artifact-backed | Guarded report returned `requestArtifact: PASSED` and referenced `runs/FP-MCP-159/opencode-requests/REQ-20260702T143631238Z-4e3b750e.json` with sha256 `bf251b29b2294963e54e6c075656d32cc0142c92a10a49cb80a4d7c2391ed3e9`. |
| commitBinding | PASSED | live-runtime-confirmed | Guarded report returned `commitBinding: PASSED`; request artifact is bound to `baseCommit/targetExecutionCommit/approvedTargetExecutionCommit: f71d8b7`. |
| modelAndRunMode | PASSED | live-runtime-confirmed | Guarded report returned `modelAndRunMode: PASSED`; model was `deepseek-v4-pro-high`, run mode `DESIGN_ONLY`. |
| humanApprovalEvidence | PASSED | live-runtime-confirmed + artifact-backed | Guarded report returned `humanApprovalEvidence: PASSED`, referencing `runs/FP-MCP-163/approvals/APPROVAL-20260702T165836932Z-e4191e1a.json` with sha256 `4f4b74a075d97589f576e9dbf62508b11c97dddf928114131bdf860067c36a0d`. Direct approval validator also returned `approvalEvidenceValid: true`, `approvalValid: true`, `approvalUsableForExecution: true`, `artifactCommitted: true`, `reasons: []`. |
| preStartEvidence | PASSED | live-runtime-confirmed + artifact-backed | Pre-start recorder returned `dryRunRecorded: true`, `approvalEvidenceValid: true`, `approvalUsableForExecution: true`, `approvalAccepted: true`, and no start contact. Validator returned `preStartEvidenceComplete: true`, `preStartEvidenceValid: true`, `approvalObserved: true`, `approvalAccepted: true`, `artifactHashesPresent: true`, `artifactHashesConsistent: true`. Artifact path: `runs/FP-MCP-159/pre-start-evidence/REQ-20260702T143631238Z-4e3b750e.json`, sha256 `7e85dc2b30529019391c56634d70c9614ec2eb8f68e3887782fcca2502b68297`. |
| stateSnapshotEvidence | PASSED | live-runtime-confirmed + artifact-backed | State snapshot recorder returned `dryRunRecorded: true`, `preStartSnapshotRecorded: true`, `postStartSnapshotRecorded: true`, and no start contact. Validator returned `stateSnapshotComplete: true`, `stateSnapshotValid: true`, `preStartSnapshotValid: true`, `postStartSnapshotValid: true`. Paths under `runs/FP-MCP-159/start-state-snapshots/.../ATTEMPT-20260702T165943947Z-5af33331/`. |
| evidenceLedgerReadiness | PASSED | live-runtime-confirmed | Guarded report returned `evidenceLedgerReadiness: PASSED` after the pre-start evidence and state snapshot artifacts were present and valid. This is a runtime gate result, not a separate SQLite V1-O record for the live milestone. |

Important caveat:

```text
preStartEvidence and stateSnapshotEvidence passed at the boolean gate level, but their gate objects still included legacy blocker reason strings. The top-level guarded-preflight reasons were limited to execution disable/OpenCode/runner blockers. This is recorded as a reporting cleanup candidate, not as an execution blocker.
```

## 4. Commit hashes and artifact paths

### ForgePilot commits

```text
62482cf fpmcp163-packet
6b6c99e fpmcp163-implementation
0796f75 fpmcp163-v1o
b588585 fpmcp163-fresh-approval
c6fbfe8 fpmcp163-prestart-evidence
39de9ba fpmcp163-state-snapshots
c41e0a1 fpmcp163-live-success
```

Current latest ForgePilot commit at report time:

```text
c41e0a1 fpmcp163-live-success
```

### Bridge commits

```text
c996ce2 Integrate structured approval with pre-start evidence
71a09a2 Use canonical approval validation in guarded report
cd99571 Fix structured approval preconditions
25c47f1 Add structured human approval tool
```

Current latest bridge commit relevant to this milestone:

```text
c996ce2 Integrate structured approval with pre-start evidence
```

### Packet and implementation artifacts

```text
packets/FP-MCP-163.md
runs/FP-MCP-163/result-summary.md
runs/FP-MCP-163/implementation-result.md
runs/FP-MCP-163/implementation-result.json
runs/FP-MCP-163/record-v1o-evidence.ts
runs/FP-MCP-163/v1o-evidence-recording-result.json
```

### Live milestone artifacts

```text
runs/FP-MCP-163/approvals/APPROVAL-20260702T165836932Z-e4191e1a.json
runs/FP-MCP-159/pre-start-evidence/REQ-20260702T143631238Z-4e3b750e.json
runs/FP-MCP-159/start-state-snapshots/REQ-20260702T143631238Z-4e3b750e/ATTEMPT-20260702T165943947Z-5af33331/pre-start-state.json
runs/FP-MCP-159/start-state-snapshots/REQ-20260702T143631238Z-4e3b750e/ATTEMPT-20260702T165943947Z-5af33331/post-start-state.json
runs/FP-MCP-163/live-pre-execution-success.md
runs/FP-MCP-163/live-pre-execution-success.json
```

### Key hashes

```text
approval artifact sha256: 4f4b74a075d97589f576e9dbf62508b11c97dddf928114131bdf860067c36a0d
request artifact sha256: bf251b29b2294963e54e6c075656d32cc0142c92a10a49cb80a4d7c2391ed3e9
pre-start evidence sha256: 7e85dc2b30529019391c56634d70c9614ec2eb8f68e3887782fcca2502b68297
pre-start snapshot sha256: 2ff76844ad617e5174970627aeca720f1673ad35be71abfa407563a3134267b9
post-start snapshot sha256: 968fb2c73845496e313db80700b4f02def6b28c3e88f290648339a29539b8457
```

## Execution boundary

The live milestone did **not** clear execution enablement.

Remaining failed gates:

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

Safety boundary observed:

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

## Report conclusion

The milestone is supported as a live-runtime-confirmed, artifact-backed pre-execution readiness result, but only the FP-MCP-163 implementation milestone is currently V1-O-recorded.

The live success should be recorded as a separate V1-O evidence record before treating it as admitted observatory evidence equivalent to the implementation record.
