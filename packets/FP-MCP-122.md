# FP-MCP-122 — Guarded Preflight Evidence Ledger Readiness Skeleton

## Task

Implement a read-only evidence ledger readiness skeleton in the MCP bridge guarded start preflight report.

## Goal

Upgrade `evidenceLedgerReadiness` from unconditional `DEFERRED` to a structural, read-only evaluation of committed request/pre-start/state-snapshot evidence.

This packet answers one question:

Can the guarded start preflight report determine that the current evidence ledger is structurally ready without authorizing execution?

## Background

FP-MCP-121 defined the evidence ledger readiness contract.

The contract states that `evidenceLedgerReadiness` answers:

```text
Are all evidence artifacts required by the current guarded-start preflight contract present, committed, immutable for the current evaluation, and cross-referenced well enough to support a future guarded-start decision?
```

It does not answer:

```text
Should execution start?
```

After FP-MCP-120, the current request chain has committed evidence for:

- request artifact
- commit binding
- model/run mode
- pre-start evidence
- state snapshot evidence

The remaining blockers are intentionally:

- `disableSwitch: FAILED`
- `runnerCapabilityState: FAILED`
- `opencodeReadiness: FAILED`
- `humanApprovalEvidence: DEFERRED`
- `evidenceLedgerReadiness: DEFERRED`

FP-MCP-122 may make `evidenceLedgerReadiness` structurally pass only if it can observe the required committed evidence. It must not affect execution eligibility while other gates remain blocked.

## Current Request Chain Under Test

Request artifact:

- packetId: `FP-MCP-117`
- requestId: `REQ-20260630T160920008Z-195b9969`
- modelId: `deepseek-v4-pro-high`
- runMode: `DESIGN_ONLY`
- path: `runs/FP-MCP-117/opencode-requests/REQ-20260630T160920008Z-195b9969.json`

Approval fixture:

- packetId: `FP-MCP-118`
- approvalId: `APPROVAL-20260630T162204620Z-f3b278ed`

Pre-start evidence:

- path: `runs/FP-MCP-117/pre-start-evidence/REQ-20260630T160920008Z-195b9969.json`

State snapshot evidence:

- path root: `runs/FP-MCP-117/start-state-snapshots/REQ-20260630T160920008Z-195b9969`
- attempt id: `ATTEMPT-20260630T163626827Z-a422b20c`

## Scope

Allowed:

- Modify MCP bridge source.
- Add a read-only evidence ledger readiness helper.
- Read existing allowed ForgePilot evidence paths.
- Check artifact existence.
- Check artifact readability.
- Check artifact sha256.
- Check committed artifact status using repository state.
- Check request id consistency where available.
- Check model id and run mode consistency where available.
- Add structured ledger-readiness details to the guarded start preflight report if useful.
- Preserve all existing non-execution safety fields.
- Build and restart the MCP bridge.
- Run `forgepilot_get_guarded_start_preflight_report` against the current request chain.
- Record evidence under `runs/FP-MCP-122/`.

Forbidden:

- Do not enable execution.
- Do not make start callable.
- Do not add start to `supportedOperations`.
- Do not contact the runner start endpoint.
- Do not call `/runner/start-run`.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create runner run id.
- Do not consume approval.
- Do not create real approval evidence.
- Do not mutate request artifacts.
- Do not mutate approval artifacts.
- Do not mutate pre-start evidence.
- Do not mutate state snapshot evidence.
- Do not implement `PRESENT_GUARDED`.
- Do not implement `CALLABLE_GUARDED`.
- Do not implement real guarded start.
- Do not relax the disable switch.

## Required Implementation

Implement a read-only ledger-readiness skeleton inside the MCP bridge.

The implementation must evaluate only existing committed evidence.

At minimum it must evaluate:

1. Request artifact ledger dependency
2. Pre-start evidence ledger dependency
3. State snapshot evidence ledger dependency
4. Cross-packet/source-path clarity
5. Hashability/readability
6. Committed repository state

The skeleton may defer approval readiness because FP-MCP-118 only created a non-authorizing approval fixture.

The skeleton must not treat approval fixture evidence as execution authorization.

## Expected Report Behavior

When run against:

```json
{
  "packetId": "FP-MCP-117",
  "requestId": "REQ-20260630T160920008Z-195b9969",
  "approvalId": "APPROVAL-20260630T162204620Z-f3b278ed"
}
```

the guarded preflight report should continue to return:

- `guardedStartPreflightEvaluated: true`
- `eligibleForFutureGuardedStart: false`
- `executionPermitted: false`
- `executionStarted: false`
- `opencodeStarted: false`
- `runnerStartEndpointContacted: false`
- `startEndpointContacted: false`
- `runnerRunId: null`
- `approvalConsumed: false`
- `requestArtifactMutated: false`
- `startEndpointState: PRESENT_DISABLED`
- `startCapabilityCallable: false`
- `executionEnabled: false`

Good gates should remain:

- `repository: PASSED`
- `requestArtifact: PASSED`
- `commitBinding: PASSED`
- `modelAndRunMode: PASSED`
- `preStartEvidence: PASSED`
- `stateSnapshotEvidence: PASSED`

Ledger readiness should become one of:

### Preferred

```text
evidenceLedgerReadiness: PASSED
```

if the skeleton can prove committed structural readiness for the current non-executing evidence chain.

### Acceptable

```text
evidenceLedgerReadiness: DEFERRED
```

only if the implementation explicitly explains which readiness part remains undeclared, for example approval readiness or invalidation ledger lookup.

The implementation must not silently keep unconditional `EVIDENCE_LEDGER_NOT_READY`.

## Required Reason Semantics

If ledger readiness passes, reasons should be empty or informational only.

If ledger readiness defers, reason should be more specific than bare `EVIDENCE_LEDGER_NOT_READY`, such as:

- `APPROVAL_READINESS_STANDARD_MISSING`
- `INVALIDATION_LEDGER_NOT_QUERYABLE`
- `CROSS_PACKET_EVIDENCE_INDEX_MISSING`

If ledger readiness fails or is incomplete, use specific reasons defined in FP-MCP-121.

## Verification

Verification must show:

- packet committed
- bridge implementation commit recorded
- build passed
- bridge restarted
- guarded preflight report evaluated
- evidence ledger readiness no longer uses a purely unconditional placeholder
- request/pre-start/snapshot evidence chain observed structurally
- report remained not eligible
- no runner start endpoint contact occurred
- no OpenCode process was started
- no runner run id was created
- no approval was consumed
- no request artifact was mutated

## Evidence

Record:

- `runs/FP-MCP-122/implementation-evidence.md`
- `runs/FP-MCP-122/preflight-report.md`
- `runs/FP-MCP-122/verification.txt`

## Success Criteria

This packet is successful if:

1. A read-only evidence ledger readiness skeleton is implemented.
2. The implementation builds.
3. The guarded preflight report evaluates ledger readiness using existing evidence.
4. The report preserves all non-execution safety fields.
5. Execution remains disabled.
6. Runner start remains not callable.
7. Runner start endpoint is not contacted.
8. OpenCode is not started.
9. No runner run id is created.
10. No approval is consumed.
11. No request artifact is mutated.
12. Verification passes.

## Non-goals

This packet does not implement real approval readiness.

This packet does not implement approval consumption.

This packet does not implement invalidation/quarantine ledger lookup unless already available read-only.

This packet does not enable execution.

This packet does not make start callable.

This packet does not add start to supported operations.

This packet does not implement `PRESENT_GUARDED`.

This packet does not implement `CALLABLE_GUARDED`.

This packet does not perform a remote runner start.
