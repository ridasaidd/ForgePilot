# FP-MCP-128 Contract Evidence

Result: PASSED

Defined the local guarded preflight invocation path contract.

## Packet

- FP-MCP-128 — Local Guarded Preflight Invocation Path Contract

## Packet Commit

- `5cdad37 Add FP-MCP-128 local preflight invocation contract packet`

## Contract Status

This packet is contract-only.

No implementation was changed.

No MCP bridge code was changed.

No runner code was changed.

No OpenCode configuration was changed.

No local preflight was run.

No approval was consumed.

## Background Boundary

FP-MCP-127 attempted to run the read-only guarded preflight report with:

```json
{
  "packetId": "FP-MCP-117",
  "requestId": "REQ-20260630T160920008Z-195b9969",
  "approvalId": "APPROVAL-20260630T175528922Z-806b81c3"
}
```

The ChatGPT Action path blocked the call before it reached MCP:

```text
This tool call was blocked by OpenAI's safety checks. Please double check what you are sending.
```

FP-MCP-128 defines a local invocation path to distinguish platform Action safety boundaries from ForgePilot preflight behavior.

## Contract Definition

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

## Required Non-Execution Boundary

The contract requires the local path to preserve:

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

## Allowed Invocation Forms

The contract defines possible future invocation forms.

CLI form:

```text
pnpm fp -- guarded-preflight-report \
  --packet-id FP-MCP-117 \
  --request-id REQ-20260630T160920008Z-195b9969 \
  --approval-id APPROVAL-20260630T175528922Z-806b81c3
```

Script form:

```text
node scripts/guarded-preflight-report.mjs \
  --packet-id FP-MCP-117 \
  --request-id REQ-20260630T160920008Z-195b9969 \
  --approval-id APPROVAL-20260630T175528922Z-806b81c3
```

MCP bridge internal function form:

```text
A local script may import or reuse the same internal preflight evaluation logic as the MCP bridge,
provided it does not start the server or call the runner start endpoint.
```

## Required Inputs

The local path must accept:

- packet id
- request id
- optional approval id

Current target input:

```json
{
  "packetId": "FP-MCP-117",
  "requestId": "REQ-20260630T160920008Z-195b9969",
  "approvalId": "APPROVAL-20260630T175528922Z-806b81c3"
}
```

## Required Output Shape

The contract requires the local path to produce the same top-level report shape as the Action tool, including:

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

Local-only metadata is allowed only if clearly namespaced.

## Required Gates

The contract requires the same gate names:

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

## Required Read-Only Sources

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

## Runner Capability Boundary

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

## Approval Evidence Boundary

The local path may read the approval artifact.

It must not:

- create approval
- consume approval
- mark approval used
- update `consumedAt`
- create approval consumption evidence
- mutate approval artifact

## Expected Current Test Result

Preferred result for the FP-MCP-126 approval artifact:

```text
humanApprovalEvidence:
  evaluated: true
  passed: true
  state: PASSED
  reasons: []
  evidencePath: runs/FP-MCP-126/approvals/APPROVAL-20260630T175528922Z-806b81c3.json
  evidenceSha256: 482e7c13c3fda729bab0eada110b41199dc576be8a7b4112324f1ae4220a1fdb
```

If strict current-commit matching causes a mismatch because the repository advanced after approval artifact creation, the local path must report:

```text
humanApprovalEvidence:
  evaluated: true
  passed: false
  state: FAILED
  reasons:
    - HUMAN_APPROVAL_EVIDENCE_COMMIT_MISMATCH
```

Such a result should be recorded honestly and may motivate a future contract clarification about whether approval binds to request artifact commit, approval creation commit, or current evaluation commit.

## Expected Overall Safety State

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

## Action Parity

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

## Evidence Recording Requirements

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

## Conclusion

FP-MCP-128 successfully defines a local read-only invocation path contract for guarded preflight evaluation without relying on ChatGPT Actions.
