# FP-MCP-062 — Executor Result

## Result

PASS

## Summary

FP-MCP-062 revalidated intentionally invalid human approval evidence fixtures against the hardened FP-MCP-061 validator and FP-MCP-059 approval evidence contract.

The packet did not create usable approval evidence, did not add a human approval recorder, did not satisfy the human approval gate, did not enable execution, did not contact the runner start endpoint, and did not start OpenCode.

## Repository State

```text
ForgePilot commit: 63e9dc4
ForgePilot working tree: clean
MCP bridge commit: f92d76d
```

## Artifacts Observed

```text
runs/FP-MCP-062/approval-negative-fixture-manifest.json
runs/FP-MCP-062/approvals/*.json
```

## Validation Tool

```text
tool: forgepilot_validate_human_approval_record
schemaVersion: FP-MCP-061
validatorBoundaryVersion: FP-MCP-061
approvalEvidenceContractVersion: FP-MCP-059
legacyApprovalRecordBoundaryRecognized: FP-MCP-041
```

## Aggregate Result

```text
negativeApprovalEvidenceFixturesCreated: true
negativeApprovalEvidenceFixturesValidated: true
allNegativeApprovalEvidenceFixturesRejected: true
approvalEvidenceValid: false
approvalUsableForExecution: false
approvalCreated: false
approvalMutated: false
humanApprovalRecorded: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

## Fixture Results

| Fixture | Rejected | Primary reasons |
|---|---:|---|
| `missing-required-fields` | yes | `APPROVAL_EVIDENCE_SCHEMA_INVALID, APPROVAL_SCHEMA_VERSION_INVALID, APPROVAL_EVIDENCE_TYPE_INVALID` |
| `invalid-approval-state` | yes | `APPROVAL_STATE_INVALID` |
| `expired-approval` | yes | `APPROVAL_EXPIRED` |
| `revoked-approval` | yes | `APPROVAL_STATE_NOT_RECORDED, APPROVAL_REVOKED` |
| `consumed-approval` | yes | `APPROVAL_STATE_NOT_RECORDED, APPROVAL_CONSUMED` |
| `wrong-request-scope` | yes | `APPROVAL_SCOPE_MISMATCH, APPROVAL_REQUEST_BINDING_INVALID` |
| `scope-too-broad` | yes | `APPROVAL_SCOPE_TOO_BROAD, APPROVAL_SCOPE_MISMATCH, APPROVAL_BASE_COMMIT_BINDING_INVALID` |
| `wrong-model` | yes | `APPROVAL_SCOPE_MISMATCH, APPROVAL_MODEL_BINDING_INVALID` |
| `wrong-run-mode` | yes | `APPROVAL_SCOPE_MISMATCH, APPROVAL_RUN_MODE_BINDING_INVALID` |
| `wrong-commit` | yes | `APPROVAL_SCOPE_MISMATCH, APPROVAL_BASE_COMMIT_BINDING_INVALID, APPROVAL_COMMIT_BINDING_INVALID` |
| `secret-boundary-violation` | yes | `APPROVAL_SECRET_BOUNDARY_VIOLATION` |
| `lifetime-exceeds-limit` | yes | `APPROVAL_LIFETIME_TOO_LONG` |
| `missing-canonical-approval-text` | yes | `APPROVAL_TEXT_MISSING` |
| `quarantined-approval-evidence` | yes | `APPROVAL_STATE_NOT_RECORDED, APPROVAL_QUARANTINED` |

## Safety Boundary

```text
disableSwitchActive: true
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
effectiveDisableReason: EXECUTION_DISABLED_GLOBAL
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

## Conclusion

FP-MCP-062 is accepted. The hardened approval evidence validator rejected all negative fixtures while preserving the execution-disabled boundary.
