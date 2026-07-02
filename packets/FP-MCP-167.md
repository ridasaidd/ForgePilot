# FP-MCP-167 — Consuming Clearance Mechanism Contract

## Task

Define the consuming scoped clearance mechanism that will eventually burn one approval and permit one runner start contact.

This packet is a design and boundary-contract packet only.

It must not implement the consuming action.
It must not consume approval.
It must not contact the runner start endpoint.
It must not start OpenCode.
It must not mutate request artifacts.

## Goal

Convert the FP-MCP-166 validation-only result into a safe contract for the next side-effecting step.

FP-MCP-167 answers three questions:

```text
1. What exactly happens between approval consumption and runner contact?
2. How is a crash or timeout between those steps represented and detected?
3. What additional confirmation is required before the first real runner contact?
```

## Context

FP-MCP-166 live-confirmed:

```text
scopedClearanceEligible: true
consumptionWouldBeAllowed: true
executionPermitted: false
approvalConsumed: false
runnerStartEndpointContacted: false
opencodeStarted: false
```

That means the complete pre-execution chain is live-confirmed for one exact request tuple, but no side-effecting execution boundary has been crossed.

FP-MCP-167 defines the next boundary before implementing it.

## Non-goals

FP-MCP-167 must not:

- implement approval consumption
- consume an approval
- contact the runner start endpoint
- start OpenCode
- create a runner run id
- perform the FP-027 canary
- enable global execution
- enable reusable runner execution
- add retries
- add model routing
- add parallel workers

## Core Decision 1 — Consumption plus runner contact is a two-phase transition with explicit intermediate state

The consuming mechanism must not pretend that consumption and runner contact are magically atomic.

The transition is explicitly two-phase:

```text
PHASE_1: append approval-consumption evidence
PHASE_2: contact runner start endpoint once
```

Because a process can crash or time out between phases, the intermediate state is a first-class observable state:

```text
CONSUMED_PENDING_RUNNER_CONTACT
```

This state is not an error by itself, but it is incomplete until resolved.

## Core Decision 2 — Every consumption event must create a resolvable attempt record

The consumption event must include a durable `attemptId` and `consumptionId` before runner contact.

Minimum consumption event fields:

```text
schemaVersion
artifactType: approval-consumption-evidence
consumptionId
attemptId
packetId
requestId
approvalId
modelId
runMode
repoCommit
branch
approvalArtifactSha256
requestArtifactSha256
preStartEvidenceSha256
stateSnapshotPreSha256
stateSnapshotPostSha256
consumedAt
consumedByTool
consumedForAction
state: CONSUMED_PENDING_RUNNER_CONTACT
runnerStartContactRequired: true
runnerStartContactDeadlineAt
runnerStartEndpointContacted: false
runnerRunId: null
opencodeStarted: false
```

Once written, this event burns the approval.

The same approval/request pair must never clear again.

## Core Decision 3 — Runner contact outcome must be appended, not inferred

After consumption, exactly one runner-contact outcome artifact must be appended.

Allowed outcome states:

```text
RUNNER_CONTACT_SUCCEEDED_WORKER_OBSERVED
RUNNER_CONTACT_FAILED_NO_WORKER_ID
RUNNER_CONTACT_FAILED_TRANSPORT
RUNNER_CONTACT_FAILED_MALFORMED_RESPONSE
RUNNER_CONTACT_NOT_OBSERVED_TIMEOUT
RUNNER_CONTACT_NOT_OBSERVED_PROCESS_INTERRUPTED
```

The outcome artifact must include:

```text
consumptionId
attemptId
approvalId
requestId
packetId
runnerStartEndpointContacted
contactAttemptedAt
contactCompletedAt
workerId
runnerRunId
opencodeStarted
abortAvailableImmediately
rawResponseHash or responseSummary
terminalForApproval: true
retryAllowedWithSameApproval: false
```

If no outcome exists after the deadline, reconstruction must classify the attempt as:

```text
CONSUMED_PENDING_RUNNER_CONTACT_STALE
```

This stale state is detectable from evidence and is not silently treated as success, failure, or reusable approval.

## Core Decision 4 — A second explicit contact confirmation is required

A valid scoped approval proves the human approved one guarded execution attempt.

But the first runner contact requires an additional explicit operator confirmation at the consuming-action level.

The consuming action must require:

```text
contactConfirmation: CONTACT_RUNNER_START_ENDPOINT_ONCE
```

This confirmation is separate from the structured approval artifact.

It is not a reusable policy switch.
It is not stored as approval authority.
It is a same-call operator confirmation that this action may cross the runner-contact boundary once.

Without this exact confirmation:

```text
no consumption event may be created
no runner start endpoint may be contacted
```

## Core Decision 5 — Contact confirmation does not override gates

The contact confirmation is necessary but never sufficient.

It cannot override:

```text
expired approval
already consumed approval
invalid request artifact
failed commit binding
missing pre-start evidence
missing state snapshot evidence
failed evidence ledger readiness
global disable switch unless scoped policy explicitly allows this exact tuple
OpenCode readiness failure
runner capability failure
```

The contact confirmation only prevents accidental chaining from validation-ready to runner-contacting action.

## Core Decision 6 — First real consuming run is the FP-027 canary

FP-MCP-167 preserves FP-MCP-164 and FP-MCP-165:

```text
The first real consuming runner contact is also the FP-027 process-tree canary.
```

The first real consuming run must be:

```text
single worker
DESIGN_ONLY
bounded prompt
boring objective
no repository mutation requirement
no autonomous retry
no model routing
no fan-out
process-tree snapshot before runner contact
process-tree snapshot after worker observation or failure
abort-readiness checked immediately once worker id exists
```

## Core Decision 7 — Abort readiness is part of the consuming contract

If runner contact returns a worker id, the outcome may not be considered complete until abort readiness is evaluated.

Required fields:

```text
workerId
abortToolAvailable
abortEligibilityEvaluatedAt
abortAvailableImmediately
abortNotInvokedUnlessNeeded
```

The first canary should confirm abort readiness without aborting unless the worker hangs or violates boundaries.

## Core Decision 8 — Failure burns approval by design

If consumption succeeds, every later state is terminal for that approval.

This includes:

```text
transport failure
runner timeout
malformed response
process interruption
worker id missing
stale pending-contact state
```

Retry requires a fresh approval and a fresh attempt id.

This is accepted friction for the first implementation.

## Required implementation constraints for the next packet

The implementation packet must:

1. Implement a consuming action separately from the validation-only FP-MCP-166 tool.
2. Require exact `contactConfirmation: CONTACT_RUNNER_START_ENDPOINT_ONCE`.
3. Re-run scoped clearance validation at call time.
4. Re-check approval expiry at call time.
5. Create append-only consumption evidence before runner contact.
6. Record a contact outcome artifact for success, failure, malformed response, no worker id, timeout, or process interruption.
7. Make stale consumed-pending-contact state reconstructable.
8. Prevent reuse of the consumed approval/request pair.
9. Preserve FP-027 canary requirements for the first real run.
10. Keep a dry-run/source-verified path before any live runner contact.

## Acceptance Criteria

FP-MCP-167 is accepted if it produces durable artifacts that:

1. Define the two-phase consumption/contact transition.
2. Define `CONSUMED_PENDING_RUNNER_CONTACT` and stale reconstruction behavior.
3. Require a second exact contact confirmation before runner contact.
4. Define contact outcome states and required artifact fields.
5. Preserve approval burn-on-failure.
6. Preserve the FP-027 canary obligations.
7. Preserve the no-contact/no-consumption boundary for this packet.
8. Record the packet result through V1-O if admitted.

## Expected Result

```text
CONSUMING_CLEARANCE_MECHANISM_CONTRACT_DEFINED
```
