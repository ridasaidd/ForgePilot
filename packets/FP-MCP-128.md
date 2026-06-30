# FP-MCP-128 — Local Guarded Preflight Invocation Path Contract

## Task

Define a local, non-ChatGPT invocation path for guarded start preflight evaluation.

## Goal

Specify how ForgePilot may evaluate the same guarded start preflight report locally when the ChatGPT Action path is blocked by platform tool safety.

This packet answers one question:

How can ForgePilot run the read-only guarded preflight report locally without enabling execution, contacting the runner start endpoint, consuming approval, or starting OpenCode?

## Background

FP-MCP-127 attempted to run:

```text
forgepilot_get_guarded_start_preflight_report
```

with the FP-MCP-126 real-shaped approval evidence artifact:

```text
approvalId: APPROVAL-20260630T175528922Z-806b81c3
```

The ChatGPT Action path blocked the call before it reached the MCP bridge:

```text
This tool call was blocked by OpenAI's safety checks. Please double check what you are sending.
```

A secondary read-only file read was also blocked before reaching MCP.

FP-MCP-127 was therefore recorded as:

```text
BLOCKED_BY_PLATFORM_TOOL_SAFETY
```

This was not a ForgePilot preflight failure.

It was not an MCP bridge failure.

It was not a runner failure.

It was not an OpenCode failure.

It was a platform Action boundary observation.

## Scope

Allowed:

- Define a local guarded preflight invocation path.
- Define parity requirements with the ChatGPT Action preflight report.
- Define allowed local entrypoints.
- Define required inputs.
- Define required outputs.
- Define read-only filesystem behavior.
- Define non-execution safety requirements.
- Define evidence recording requirements.
- Define how local output should be compared to Action output when both are available.
- Record contract evidence under `runs/FP-MCP-128/`.

Forbidden:

- Do not implement code.
- Do not modify the MCP bridge.
- Do not modify the runner.
- Do not modify OpenCode configuration.
- Do not run the local preflight yet.
- Do not create approval evidence.
- Do not consume approval.
- Do not create approval consumption evidence.
- Do not enable execution.
- Do not make start callable.
- Do not add start to `supportedOperations`.
- Do not contact the runner start endpoint.
- Do not call `/runner/start-run`.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create runner run id.
- Do not mutate approval artifacts.
- Do not mutate request artifacts.
- Do not mutate pre-start evidence.
- Do not mutate state snapshot evidence.
- Do not implement `PRESENT_GUARDED`.
- Do not implement `CALLABLE_GUARDED`.

## Contract

### Definition

A local guarded preflight invocation path is a read-only local execution path that evaluates the same preflight contract as:

```text
forgepilot_get_guarded_start_preflight_report
```

without using ChatGPT Actions.

It exists to distinguish:

```text
platform tool safety boundary
```

from:

```text
ForgePilot preflight behavior
```

### Required Non-Execution Boundary

The local path must preserve:

```text
executionPermitted: false
executionStarted: false
opencodeStarted: false
runnerStartEndpointContacted: false
startEndpointContacted: false
runnerRunId: null
approvalConsumed: false
approvalConsumptionCreated: false
requestArtifactMutated: false
approvalArtifactMutated: false
```

The local path must not contact:

```text
/runner/start-run
```

The local path must not invoke:

```text
forgepilot_start_remote_runner_request
```

The local path must not start OpenCode.

### Allowed Invocation Forms

A future implementation may expose one or more of these local forms:

#### CLI Form

```text
pnpm fp -- guarded-preflight-report \
  --packet-id FP-MCP-117 \
  --request-id REQ-20260630T160920008Z-195b9969 \
  --approval-id APPROVAL-20260630T175528922Z-806b81c3
```

#### Script Form

```text
node scripts/guarded-preflight-report.mjs \
  --packet-id FP-MCP-117 \
  --request-id REQ-20260630T160920008Z-195b9969 \
  --approval-id APPROVAL-20260630T175528922Z-806b81c3
```

#### MCP Bridge Internal Function Form

A local script may import or reuse the same internal preflight evaluation logic as the MCP bridge, provided it does not start the server or call the runner start endpoint.

### Required Inputs

The local path must accept:

- packet id
- request id
- optional approval id

For the current target test:

```json
{
  "packetId": "FP-MCP-117",
  "requestId": "REQ-20260630T160920008Z-195b9969",
  "approvalId": "APPROVAL-20260630T175528922Z-806b81c3"
}
```

### Required Output Shape

The local path must produce the same top-level report shape as the Action tool:

- `guardedStartPreflightEvaluated`
- `eligibleForFutureGuardedStart`
- `executionPermitted`
- `executionStarted`
- `opencodeStarted`
- `runnerStartEndpointContacted`
- `startEndpointContacted`
- `runnerRunId`
- `approvalConsumed`
- `requestArtifactMutated`
- `packetId`
- `requestId`
- `approvalId`
- `runnerConfigured`
- `runnerReachable`
- `runnerStateObserved`
- `startEndpointPresent`
- `startEndpointState`
- `startCapabilityCallable`
- `executionEnabled`
- `supportedOperations`
- `gates`
- `repository`
- `requestArtifact`
- `modelAndRunMode`
- `disableSwitch`
- `opencodeReadiness`
- `boundaryVersion`
- `statusSource`
- `checkedAt`
- `reasons`

The exact implementation may add local-only metadata if clearly namespaced, for example:

```text
localInvocation: true
invocationPath: LOCAL_CLI
```

### Required Gates

The local report must include the same gate names:

- `repository`
- `requestArtifact`
- `commitBinding`
- `modelAndRunMode`
- `disableSwitch`
- `runnerCapabilityState`
- `opencodeReadiness`
- `preStartEvidence`
- `stateSnapshotEvidence`
- `humanApprovalEvidence`
- `evidenceLedgerReadiness`

### Required Read-Only Sources

The local path may read:

- request artifact
- pre-start evidence
- state snapshot evidence
- approval evidence artifact
- git repository state
- execution disable switch state
- runner capabilities endpoint, if and only if it uses the read-only capabilities endpoint
- OpenCode readiness state, if and only if it is read-only and does not start OpenCode

The local path must not write anything except optional explicitly requested report output under the active packet run directory.

### Runner Capability Boundary

The local path may contact:

```text
/runner/capabilities
```

if needed for parity.

The local path must not contact:

```text
/runner/start-run
```

The report must explicitly record:

```text
runnerStartEndpointContacted: false
startEndpointContacted: false
```

### Approval Evidence Boundary

The local path may read the approval artifact.

It must not:

- create approval
- consume approval
- mark approval used
- update `consumedAt`
- create approval consumption evidence
- mutate approval artifact

### Expected Current Test Result

When evaluated against the FP-MCP-126 artifact, the preferred result is:

```text
humanApprovalEvidence:
  evaluated: true
  passed: true
  state: PASSED
  reasons: []
  evidencePath: runs/FP-MCP-126/approvals/APPROVAL-20260630T175528922Z-806b81c3.json
  evidenceSha256: 482e7c13c3fda729bab0eada110b41199dc576be8a7b4112324f1ae4220a1fdb
```

If strict current-commit matching causes a mismatch because the repository advanced after the approval artifact was created, the local path must report:

```text
humanApprovalEvidence:
  evaluated: true
  passed: false
  state: FAILED
  reasons:
    - HUMAN_APPROVAL_EVIDENCE_COMMIT_MISMATCH
```

Such a result must be recorded honestly and may motivate a future contract clarification:

```text
Should approval bind to request artifact commit, approval creation commit, or current evaluation commit?
```

### Expected Overall Safety State

Regardless of `humanApprovalEvidence`, the local report must still refuse execution while these blockers remain:

```text
disableSwitch: FAILED
runnerCapabilityState: FAILED
opencodeReadiness: FAILED
```

Expected top-level safety:

```text
eligibleForFutureGuardedStart: false
executionPermitted: false
executionStarted: false
opencodeStarted: false
runnerStartEndpointContacted: false
startEndpointContacted: false
runnerRunId: null
approvalConsumed: false
requestArtifactMutated: false
```

### Action Parity

When the ChatGPT Action path is available, local and Action reports should match on:

- request artifact gate
- commit binding gate
- model and run mode gate
- pre-start evidence gate
- state snapshot evidence gate
- evidence ledger readiness gate
- human approval evidence gate
- disable switch gate
- runner capability gate
- OpenCode readiness gate
- top-level safety fields

Differences are allowed only for invocation metadata and platform-boundary fields.

### Evidence Recording

A future local invocation packet must record:

- command used
- input arguments
- raw report output
- parsed gate summary
- safety fields
- proof that no start endpoint was contacted
- proof that OpenCode was not started
- proof that approval was not consumed
- proof that request artifact was not mutated

## Verification

Verification must show:

- packet committed
- contract evidence recorded under `runs/FP-MCP-128/`
- no implementation changes
- no bridge changes
- no runner changes
- no local preflight run yet
- no approval created
- no approval consumed
- no approval artifact mutated
- no request artifact mutated
- no execution enabled
- no runner start endpoint contact
- no OpenCode start

## Evidence

Record:

- `runs/FP-MCP-128/contract-evidence.md`
- `runs/FP-MCP-128/verification.txt`

## Success Criteria

This packet is successful if:

1. The local guarded preflight invocation path contract is explicit.
2. Allowed invocation forms are defined.
3. Required inputs are defined.
4. Required output shape is defined.
5. Required gates are defined.
6. Read-only source boundaries are defined.
7. Runner capability boundary is defined.
8. Approval evidence boundary is defined.
9. Action parity is defined.
10. Non-execution safety requirements are defined.
11. No code is changed.
12. No local preflight is run.
13. Verification passes.

## Non-goals

This packet does not implement the local preflight path.

This packet does not run the local preflight path.

This packet does not create approval evidence.

This packet does not consume approval.

This packet does not implement approval consumption.

This packet does not enable execution.

This packet does not make start callable.

This packet does not add start to supported operations.

This packet does not implement `PRESENT_GUARDED`.

This packet does not implement `CALLABLE_GUARDED`.

This packet does not perform a remote runner start.
