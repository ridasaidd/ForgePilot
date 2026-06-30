# FP-MCP-124 — Human Approval Evidence Preflight Evaluation Skeleton

## Task

Implement a read-only human approval evidence evaluation skeleton in the MCP bridge guarded start preflight report.

## Goal

Upgrade `humanApprovalEvidence` from generic `DEFERRED / HUMAN_APPROVAL_EVIDENCE_NOT_EVALUATED` to explicit read-only classification of supplied approval evidence.

This packet answers one question:

Can the guarded start preflight report distinguish non-authorizing approval fixtures from real scoped approval evidence without authorizing execution?

## Background

FP-MCP-123 defined the human approval evidence preflight evaluation contract.

The contract states that `humanApprovalEvidence` answers:

```text
Does a supplied approval evidence artifact exist, match the current request scope, remain valid for preflight evaluation, and satisfy the human approval evidence standard?
```

It does not answer:

```text
Has approval been consumed?
```

It does not answer:

```text
Should execution start?
```

The current guarded preflight report still returns:

```text
humanApprovalEvidence:
  evaluated: true
  passed: false
  state: DEFERRED
  reasons:
    - HUMAN_APPROVAL_EVIDENCE_NOT_EVALUATED
```

FP-MCP-124 should improve this by explicitly classifying the current FP-MCP-118 dry-run approval fixture as non-authorizing.

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
- path: `runs/FP-MCP-118/approvals/APPROVAL-20260630T162204620Z-f3b278ed.json`
- sha256: `00c814b46a507bdbf1fb9d45d37dd0329e524eccc13d45a20f48d7f50224ae7f`
- non-authorizing
- not usable for execution

Pre-start evidence:

- path: `runs/FP-MCP-117/pre-start-evidence/REQ-20260630T160920008Z-195b9969.json`

State snapshot evidence:

- path root: `runs/FP-MCP-117/start-state-snapshots/REQ-20260630T160920008Z-195b9969`

## Scope

Allowed:

- Modify MCP bridge source.
- Add a read-only human approval evidence evaluation helper.
- Read existing allowed ForgePilot approval evidence paths.
- Check approval artifact existence.
- Check approval artifact readability.
- Check approval artifact sha256.
- Check approval id consistency.
- Check request id consistency.
- Check model id consistency.
- Check run mode consistency.
- Check repository commit and branch consistency where available.
- Detect non-authorizing dry-run fixture shape.
- Return explicit gate state/reasons for missing, fixture, invalid, or real approval evidence.
- Preserve all existing non-execution safety fields.
- Build and restart the MCP bridge.
- Run `forgepilot_get_guarded_start_preflight_report` against the current request chain.
- Record evidence under `runs/FP-MCP-124/`.

Forbidden:

- Do not enable execution.
- Do not make start callable.
- Do not add start to `supportedOperations`.
- Do not contact the runner start endpoint.
- Do not call `/runner/start-run`.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create runner run id.
- Do not create real approval evidence.
- Do not consume approval.
- Do not create approval consumption evidence.
- Do not mutate approval artifacts.
- Do not mutate request artifacts.
- Do not mutate pre-start evidence.
- Do not mutate state snapshot evidence.
- Do not upgrade dry-run fixtures into real approval.
- Do not implement `PRESENT_GUARDED`.
- Do not implement `CALLABLE_GUARDED`.
- Do not implement real guarded start.
- Do not relax the disable switch.

## Required Implementation

Implement a read-only human approval evidence evaluator inside the MCP bridge.

At minimum it must distinguish:

1. No approval id supplied
2. Approval id supplied but artifact missing
3. Approval id supplied and artifact exists but is a dry-run fixture
4. Approval id supplied and artifact is malformed or scope-mismatched
5. Future real approval evidence shape, if already available

For FP-MCP-124, the current FP-MCP-118 fixture should be classified as non-authorizing.

Expected current fixture classification:

```text
humanApprovalEvidence:
  evaluated: true
  passed: false
  state: DEFERRED or FAILED
  reasons:
    - HUMAN_APPROVAL_EVIDENCE_FIXTURE_NOT_AUTHORIZING
```

or:

```text
humanApprovalEvidence:
  evaluated: true
  passed: false
  state: FAILED
  reasons:
    - HUMAN_APPROVAL_EVIDENCE_NOT_USABLE_FOR_EXECUTION
```

`HUMAN_APPROVAL_EVIDENCE_NOT_EVALUATED` should no longer be used when an approval id is supplied and the artifact can be classified.

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
- `evidenceLedgerReadiness: PASSED`

The approval fixture should be explicitly classified as non-authorizing.

## Required Reason Semantics

If no approval id is supplied:

```text
HUMAN_APPROVAL_EVIDENCE_MISSING
```

If an approval id is supplied but no artifact exists:

```text
HUMAN_APPROVAL_EVIDENCE_ARTIFACT_MISSING
```

If the supplied artifact is a dry-run fixture:

```text
HUMAN_APPROVAL_EVIDENCE_FIXTURE_NOT_AUTHORIZING
```

If the supplied artifact is not usable for execution:

```text
HUMAN_APPROVAL_EVIDENCE_NOT_USABLE_FOR_EXECUTION
```

If a scope mismatch is found, use the specific mismatch reason from FP-MCP-123.

## Verification

Verification must show:

- packet committed
- bridge implementation commit recorded
- build passed
- bridge restarted
- guarded preflight report evaluated
- supplied FP-MCP-118 approval fixture classified explicitly
- generic `HUMAN_APPROVAL_EVIDENCE_NOT_EVALUATED` removed for supplied fixture
- report remained not eligible
- no runner start endpoint contact occurred
- no OpenCode process was started
- no runner run id was created
- no approval was consumed
- no approval artifact was mutated
- no request artifact was mutated

## Evidence

Record:

- `runs/FP-MCP-124/implementation-evidence.md`
- `runs/FP-MCP-124/preflight-report.md`
- `runs/FP-MCP-124/verification.txt`

## Success Criteria

This packet is successful if:

1. A read-only human approval evidence evaluator skeleton is implemented.
2. The implementation builds.
3. The guarded preflight report classifies the FP-MCP-118 fixture as non-authorizing.
4. The report no longer uses generic `HUMAN_APPROVAL_EVIDENCE_NOT_EVALUATED` for a supplied, classifiable fixture.
5. The report preserves all non-execution safety fields.
6. Execution remains disabled.
7. Runner start remains not callable.
8. Runner start endpoint is not contacted.
9. OpenCode is not started.
10. No runner run id is created.
11. No approval is consumed.
12. No approval artifact is mutated.
13. No request artifact is mutated.
14. Verification passes.

## Non-goals

This packet does not implement real approval evidence creation.

This packet does not implement approval consumption.

This packet does not implement approval invalidation or quarantine lookup unless already available read-only.

This packet does not enable execution.

This packet does not make start callable.

This packet does not add start to supported operations.

This packet does not implement `PRESENT_GUARDED`.

This packet does not implement `CALLABLE_GUARDED`.

This packet does not perform a remote runner start.
