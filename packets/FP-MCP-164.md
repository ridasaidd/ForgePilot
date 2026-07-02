# FP-MCP-164 — Scoped Execution Enablement Boundary

## Task

Define the scoped execution enablement boundary for the first real guarded OpenCode execution attempt.

This packet is a boundary contract and design packet.

It must not enable execution, consume approval, contact the runner start endpoint, start OpenCode, or mutate existing request artifacts.

## Goal

Turn the current pre-execution-ready state into a precise, auditable final gate design before any real execution is allowed.

FP-MCP-164 answers one question:

```text
What exact conditions must be true, and what exact evidence must be appended, before one scoped execution attempt may be permitted?
```

## Context

FP-MCP-163 established and admitted the pre-execution pipeline:

```text
request artifact: live-confirmed
commit binding: live-confirmed
structured approval: live-confirmed
pre-start evidence: live-confirmed
state snapshots: live-confirmed
evidence ledger readiness: live-confirmed
hashes: mechanically verified
approval-id propagation fix: source-verified and live-confirmed
```

The remaining blockers are intentionally execution-boundary blockers:

```text
EXECUTION_DISABLED_GLOBAL
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
DISABLE_SWITCH_ACTIVE
EXECUTION_NOT_ALLOWED
```

## Non-goals

FP-MCP-164 must not:

- enable global execution
- add a reusable enablement switch
- start OpenCode
- contact the runner start endpoint
- consume an approval
- mutate an approval artifact
- mutate a request artifact
- create a runnerRunId
- perform the first real execution attempt
- implement model routing
- implement autonomous retries
- implement general-purpose execution policy

## Required Decisions

### 1. One-time consumption is mandatory

Scoped execution clearance is not a re-openable switch.

A clearance may apply only to the exact tuple:

```text
packetId
requestId
approvalId
modelId
runMode
repoCommit
branch
attemptId
```

The approval must be consumed by an append-only event before the runner start endpoint is contacted.

The consumption event must include:

```text
approvalId
requestId
packetId
modelId
runMode
repoCommit
branch
attemptId
createdAt
consumedForAction
approvalArtifactSha256
requestArtifactSha256
preStartEvidenceSha256
stateSnapshotPreSha256
stateSnapshotPostSha256
```

Once the consumption event exists, the same approval/request pair must not clear the gate again.

A consumed approval remains consumed even if the runner start attempt later fails, times out, or produces no worker id.

### 2. Expiry must be enforced at clearance time

Approval expiry is not checked only at approval-recording time.

The final clearance path must re-read and re-validate the approval immediately before consumption.

The following must be true at the moment of clearance:

```text
now < approval.expiresAt
approval.singleUse == true
approval.notRevoked == true
approval.notConsumed == true
approval.notQuarantined == true
approval.scope == expectedScope
approval.artifactCommitted == true
approval.usableForExecution == true
```

If the approval is expired at clearance time, no consumption event may be created and no runner start endpoint may be contacted.

### 3. Clearance and runner contact must be atomic from the policy layer

The intended sequence is:

```text
1. Validate request artifact.
2. Validate structured approval.
3. Validate pre-start evidence.
4. Validate state snapshots.
5. Validate scoped execution policy.
6. Create append-only approval consumption evidence.
7. Re-read consumption evidence and verify it binds the exact tuple.
8. Contact runner start endpoint once.
9. Record start-attempt outcome.
```

If steps 1-5 fail, there must be no consumption and no runner contact.

If step 6 succeeds but step 8 fails, the approval remains consumed and the failed start attempt is recorded as a terminal observation for that attempt.

### 4. Failure and hang behavior must be defined before first use

If runner start fails before returning a worker id:

```text
startAttemptState: START_FAILED_NO_WORKER_ID
approvalConsumed: true
runnerStartEndpointContacted: true
opencodeStarted: false or unknown, based on observed response
retryAllowedWithSameApproval: false
```

If runner start returns a worker id:

```text
startAttemptState: WORKER_STARTED_OBSERVED
workerId: required
abortAvailableImmediately: true
```

If the worker hangs:

```text
abort path: forgepilot_abort_opencode_worker
abort eligibility: immediately after workerId is recorded
approvalConsumed: true
retryAllowedWithSameApproval: false
```

The abort primitive from FP-026 must be considered part of the safety boundary for first real execution.

### 5. First real execution attempt is the FP-027 canary

FP-MCP-164 chooses deliberately:

```text
The first real scoped execution attempt will also serve as the FP-027 process-tree canary.
```

There will not be a separate smaller canary before the first scoped execution attempt.

The first cleared execution must be:

```text
single-worker
DESIGN_ONLY
bounded prompt
no repository mutation requirement
no autonomous retry
no parallel workers
no model routing
no execution fan-out
```

The first run must be boring on purpose.

The expected target remains the FP-MCP-159 canary request unless superseded by a newer explicitly scoped canary packet.

### 6. Scope must remain narrower than global execution enablement

FP-MCP-164 must not clear:

```text
global execution disable
all runner execution
all OpenCode execution
all models
all run modes
all requests in a packet
```

It must define only a scoped clearance primitive for one exact request/approval/attempt tuple.

### 7. Observable output required before implementation

Before any source implementation starts, FP-MCP-164 must produce a contract artifact that includes:

```text
clearance tuple schema
required validation inputs
consumption event schema
start attempt outcome schema
failure/hang state table
first-run canary declaration
non-goals and forbidden actions
```

## Acceptance Criteria

FP-MCP-164 is accepted if it produces durable artifacts that:

1. Define one-time append-only approval consumption before runner contact.
2. Define expiry enforcement at clearance time.
3. Define exact behavior for runner start failure before worker id.
4. Define exact behavior for worker started and worker hang cases.
5. Declare the first real scoped execution attempt as the FP-027 process-tree canary.
6. Preserve global disable safety and forbid general execution enablement.
7. Require implementation work to be executor-driven after this boundary contract is admitted.
8. Record the packet result through V1-O if admitted.

## Implementation Boundary

Implementation must be performed by an OpenCode executor after this packet is admitted.

ChatGPT may create this packet, record evidence, verify artifacts, and admit the boundary contract.

ChatGPT must not directly implement the scoped execution clearance source code in this packet.

## Expected Result

```text
SCOPED_EXECUTION_ENABLEMENT_BOUNDARY_CONTRACT_DEFINED
```
