# FP-MCP-163 Follow-Up Verification

## Result

```text
LIVE_SUCCESS_V1O_RECORDED_HASHES_VALID_LEGACY_REASON_STRINGS_NOT_INERT_SOURCE_FIXED_REFRESH_PENDING
```

## 1. Live success V1-O recording

The live success milestone is now separately recorded through V1-O.

```text
result: FP_MCP_163_LIVE_PRE_EXECUTION_SUCCESS_RECORDED_THROUGH_V1O_PATH
evidence_id: 26
run_id: FP-MCP-163-LIVE-PRE-EXECUTION-EVIDENCE-SUCCESS
generic_admission_event_id: 26
canonical_status: GENERIC_EVENT_CANONICAL
canonical_surface: evidence_admission_events
canonical_state: ADMITTED
admitted_claim: STRUCTURED_APPROVAL_PRE_EXECUTION_EVIDENCE_ACCEPTED_EXECUTION_STILL_BLOCKED
total_evidence_records: 26
total_generic_evidence_record_admission_events: 26
```

Artifact:

```text
runs/FP-MCP-163/v1o-live-success-recording-result.json
```

## 2. Legacy reason strings source confirmation

The earlier report classified legacy reason strings in passed `preStartEvidence` and `stateSnapshotEvidence` gates as a reporting cleanup candidate.

Source inspection showed this was not clean enough to call inert.

Findings:

1. The guarded report gate booleans are computed from explicit boolean fields:

```text
preStartEvidenceComplete && preStartEvidenceValid
stateSnapshotComplete && stateSnapshotValid
```

2. The start path blocks execution using booleans, not reason strings:

```text
!preStartEvidenceValid || !stateSnapshotValid || !humanApprovalEvidenceGatePassed
```

3. However, source inspection found approval-id propagation gaps:

```text
validatePreStartEvidence(packetId, requestId)
validateStartRequestStateSnapshot(packetId, requestId)
```

were still present in guarded/start paths instead of consistently passing the approval id.

Therefore the caveat is classified as:

```text
NOT_A_BYPASS_IN_CURRENT_BOOLEAN_GATE_PATH_BUT_NOT_INERT_ENOUGH_TO_IGNORE
```

Source fix applied in bridge:

```text
1c42e6c Propagate approval id into pre-execution validation
```

Verification:

```text
pnpm test: PASS
pnpm build: PASS
tsc: PASS
```

Runtime status:

```text
ACTION_REFRESH_PENDING
```

The MCP service/actions should be refreshed before using this fixed behavior as live-runtime evidence.

## 3. Hash sanity check

All reported hashes were mechanically checked for:

```text
file exists
expected hash length = 64
expected hash matches lowercase hex format
actual sha256 length = 64
actual sha256 matches lowercase hex format
actual sha256 equals reported hash
```

Result:

```text
HASH_SANITY_CHECK_PASSED_ALL_REPORTED_ARTIFACT_HASHES_VALID
```

Checked hashes:

```text
approval artifact: PASS
request artifact: PASS
pre-start evidence: PASS
pre-start snapshot: PASS
post-start snapshot: PASS
```

## Boundary

No execution was enabled.
No OpenCode process started.
No runner start endpoint was contacted.
No approval was consumed.
No request artifact was mutated.
