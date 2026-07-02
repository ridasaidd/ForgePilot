# FP-MCP-170 — Real Consuming Action No-Contact Implementation

## Task

Implement the real consuming-action gate logic in no-contact mode.

This packet must source-verify and later live-confirm that the real consuming action can evaluate one scoped tuple and explicit contact confirmation without consuming real approval, contacting the runner, starting OpenCode, or mutating request artifacts.

## Goal

Add the last non-contact implementation rung before the FP-027 canary.

Expected result:

```text
REAL_CONSUMING_ACTION_NO_CONTACT_SOURCE_VERIFIED_RUNNER_UNREACHABLE
```

## Bootstrap Exception

FP-MCP-170 authorizes one narrow ChatGPT direct-source implementation exception limited to:

```text
implementing no-contact real consuming-action gate logic
adding build/source verification
recording evidence and V1-O artifacts
```

It does not authorize:

```text
real approval consumption
runner start endpoint contact
OpenCode start
first FP-027 canary execution
reusable execution enablement
autonomous retry
parallel workers
model routing
```

The exception terminates when:

```text
REAL_CONSUMING_ACTION_NO_CONTACT_SOURCE_VERIFIED_RUNNER_UNREACHABLE
```

is recorded.

## Required Behavior

The implementation must add a no-contact consuming-action tool that:

1. Re-runs scoped clearance validation at call time.
2. Requires exact `contactConfirmation: CONTACT_RUNNER_START_ENDPOINT_ONCE`.
3. Refuses to proceed when contact confirmation is missing or wrong.
4. Proves whether real consumption would be allowed.
5. Proves whether runner contact would be the next phase after consumption.
6. Makes runner contact unreachable by construction.
7. Records only non-authorizing no-contact readiness evidence.
8. Does not create real consumption evidence.
9. Does not contact the runner start endpoint.
10. Does not start OpenCode.
11. Does not mutate request artifacts.

## No-Contact Boundary

The tool must expose these fields:

```text
contactConfirmationAccepted
scopedClearanceEligible
consumptionWouldBeAllowed
realConsumptionRecorded: false
runnerContactReachable: false
runnerStartEndpointContacted: false
opencodeStarted: false
executionPermitted: false
requestArtifactMutated: false
```

## Acceptance Criteria

FP-MCP-170 is accepted if:

1. The bridge source implements the no-contact consuming-action gate tool.
2. Build/tests pass.
3. ForgePilot records source implementation artifacts.
4. V1-O records the source implementation claim.
5. Runtime confirmation is explicitly separate and pending until service/action refresh.

## Safety Boundary

Throughout FP-MCP-170 source implementation:

```text
real_approval_consumed: false
runner_start_endpoint_contacted: false
opencode_started: false
execution_permitted: false
runner_run_id_created: false
request_artifact_mutated: false
```
