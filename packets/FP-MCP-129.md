# FP-MCP-129 — Local Guarded Preflight Invocation Path Skeleton

## Task

Implement a local read-only guarded preflight invocation skeleton.

## Goal

Add a local, non-ChatGPT invocation path that can evaluate the same guarded start preflight report without using ChatGPT Actions.

This packet answers one question:

Can ForgePilot expose a local read-only guarded preflight report path without enabling execution, contacting the runner start endpoint, consuming approval, or starting OpenCode?

## Background

FP-MCP-127 attempted to run the guarded start preflight report with a real-shaped approval evidence artifact through the ChatGPT Action path.

The call was blocked before reaching MCP by platform tool safety.

FP-MCP-128 defined the local guarded preflight invocation path contract.

FP-MCP-129 implements the first skeleton for that local path.

## Scope

Allowed:

- Add a local script or CLI entrypoint for guarded preflight report evaluation.
- Reuse the same read-only evaluation logic as the MCP bridge where practical.
- Accept packet id, request id, and optional approval id.
- Print a JSON report to stdout.
- Preserve the same top-level safety fields as the MCP guarded preflight report.
- Evaluate the existing FP-MCP-126 approval evidence artifact if supplied.
- Add minimal tests or verification commands if useful.
- Record implementation evidence under `runs/FP-MCP-129/`.

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
- Do not create approval consumption evidence.
- Do not mutate approval artifacts.
- Do not mutate request artifacts.
- Do not mutate pre-start evidence.
- Do not mutate state snapshot evidence.
- Do not implement `PRESENT_GUARDED`.
- Do not implement `CALLABLE_GUARDED`.
- Do not implement real guarded start.
- Do not relax the disable switch.

## Required Invocation

Implement at least one local invocation form.

Preferred script form:

```text
node scripts/guarded-preflight-report.mjs \
  --packet-id FP-MCP-117 \
  --request-id REQ-20260630T160920008Z-195b9969 \
  --approval-id APPROVAL-20260630T175528922Z-806b81c3
```

A CLI wrapper is optional.

## Required Inputs

The local skeleton must accept:

- `--packet-id`
- `--request-id`
- optional `--approval-id`

For the current target test:

```json
{
  "packetId": "FP-MCP-117",
  "requestId": "REQ-20260630T160920008Z-195b9969",
  "approvalId": "APPROVAL-20260630T175528922Z-806b81c3"
}
```

## Required Output

The local skeleton must emit JSON.

At minimum it must include:

```text
guardedStartPreflightEvaluated
eligibleForFutureGuardedStart
executionPermitted
executionStarted
opencodeStarted
runnerStartEndpointContacted
startEndpointContacted
runnerRunId
approvalConsumed
requestArtifactMutated
approvalArtifactMutated
packetId
requestId
approvalId
gates
repository
requestArtifact
commitBinding
modelAndRunMode
disableSwitch
runnerCapabilityState
opencodeReadiness
preStartEvidence
stateSnapshotEvidence
humanApprovalEvidence
evidenceLedgerReadiness
boundaryVersion
statusSource
checkedAt
reasons
localInvocation
invocationPath
```

## Required Safety Values

The skeleton must always preserve:

```text
executionPermitted: false
executionStarted: false
opencodeStarted: false
runnerStartEndpointContacted: false
startEndpointContacted: false
runnerRunId: null
approvalConsumed: false
requestArtifactMutated: false
approvalArtifactMutated: false
```

## Required Gate Semantics

The skeleton must classify gates using the existing gate state vocabulary:

```text
PASSED
FAILED
INCOMPLETE
DEFERRED
NOT_EVALUATED
```

At minimum:

- repository must evaluate git cleanliness
- requestArtifact must evaluate request artifact presence and parseability
- commitBinding must evaluate stored commit binding if available
- modelAndRunMode must evaluate model and run mode from the request artifact
- preStartEvidence must evaluate presence of the existing pre-start evidence
- stateSnapshotEvidence must evaluate presence of the existing state snapshot evidence
- humanApprovalEvidence must evaluate the supplied approval artifact if present
- evidenceLedgerReadiness must evaluate whether required evidence artifacts are present
- disableSwitch must remain failed while execution is disabled
- runnerCapabilityState must remain failed while start is not callable or endpoint is disabled
- opencodeReadiness must remain failed while OpenCode execution is disabled

## Approval Evidence Target

The skeleton should evaluate:

```text
runs/FP-MCP-126/approvals/APPROVAL-20260630T175528922Z-806b81c3.json
```

Expected preferred result:

```text
humanApprovalEvidence:
  evaluated: true
  passed: true
  state: PASSED
  reasons: []
  evidencePath: runs/FP-MCP-126/approvals/APPROVAL-20260630T175528922Z-806b81c3.json
  evidenceSha256: 482e7c13c3fda729bab0eada110b41199dc576be8a7b4112324f1ae4220a1fdb
```

If strict current-commit binding fails because the repo has advanced, the skeleton must report the mismatch honestly.

## Verification

Verification must show:

- implementation added
- local script or CLI exists
- implementation is read-only with respect to guarded start artifacts
- implementation does not call `/runner/start-run`
- implementation does not call `forgepilot_start_remote_runner_request`
- implementation does not start OpenCode
- implementation does not consume approval
- implementation does not mutate request artifacts
- implementation preserves required safety fields
- build or syntax check passes
- no runner code is changed unless strictly necessary
- no start capability state changes

## Evidence

Record:

- `runs/FP-MCP-129/implementation-evidence.md`
- `runs/FP-MCP-129/verification.txt`

If the skeleton is run during verification, also record:

- `runs/FP-MCP-129/local-preflight-report.json`
- `runs/FP-MCP-129/local-preflight-report.md`

## Success Criteria

This packet is successful if:

1. A local guarded preflight invocation skeleton exists.
2. The skeleton accepts packet id, request id, and optional approval id.
3. The skeleton emits JSON.
4. The skeleton preserves non-execution safety fields.
5. The skeleton does not contact the runner start endpoint.
6. The skeleton does not start OpenCode.
7. The skeleton does not consume approval.
8. The skeleton does not mutate approval artifacts.
9. The skeleton does not mutate request artifacts.
10. Verification passes.
11. Evidence is recorded.

## Non-goals

This packet does not consume approval.

This packet does not implement approval consumption.

This packet does not enable execution.

This packet does not make start callable.

This packet does not add start to supported operations.

This packet does not implement `PRESENT_GUARDED`.

This packet does not implement `CALLABLE_GUARDED`.

This packet does not perform a remote runner start.
