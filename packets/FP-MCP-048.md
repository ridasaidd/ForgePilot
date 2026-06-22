# FP-MCP-048 — Start Request Negative Approval Tests

## Status

DRAFT

## Packet Type

Test / evidence packet

## Objective

Verify that `forgepilot_start_remote_runner_request` rejects malformed, wrong, missing-equivalent, or non-start approval inputs without contacting the remote runner start endpoint, starting OpenCode, or mutating approval state.

This packet extends the guarded start-request path after FP-MCP-047.

## Context

FP-MCP-047 added disable-switch enforcement to the actual start-request tool. A valid start request is currently blocked before runner start contact because the global disable switch is active.

FP-MCP-048 tests a separate input-safety property:

> A start request with an unusable approval input must be rejected as an invalid approval observation, and it must still not contact the runner start endpoint.

This must remain true even while the global disable switch is active.

## Non-Goals

This packet must not:

- enable execution
- disable the global kill switch
- contact the runner start endpoint
- start OpenCode
- create real approval records
- mutate approval records
- create runner run IDs
- create execution artifacts
- add model routing
- add provider calls
- weaken FP-MCP-047 disable-switch enforcement

## Required Start Approval

The only accepted start approval string remains:

```text
START_REMOTE_RUNNER_REQUEST
```

Any other approval input is unusable for start execution.

## Required Negative Approval Cases

The implementation or test evidence must cover at least these cases:

1. Empty approval string
2. Whitespace-only approval string
3. Wrong approval kind
4. Request-artifact approval used for start
5. Lowercase start approval
6. Approval string with extra suffix
7. Approval string with extra prefix
8. Human-readable sentence instead of approval constant
9. Approval-like JSON string instead of approval constant
10. Valid start approval control case

The valid control case must remain blocked by the disable switch.

## Expected Negative Output Invariants

For every invalid approval case:

```text
started: false
accepted: false
approvalAccepted: false
runnerContacted: false
startEndpointContacted: false
executionStarted: false
disableSwitchStatusEvaluated: true
disableSwitchActive: true
```

Each invalid case must include an approval-specific reason code:

```text
INVALID_START_APPROVAL
```

The output may also include disable-switch reason codes, because the disable switch remains globally active.

## Expected Control Output Invariants

For the valid control case:

```text
started: false
accepted: false
approvalAccepted: true
runnerContacted: false
startEndpointContacted: false
executionStarted: false
disableSwitchStatusEvaluated: true
disableSwitchActive: true
effectiveDisableReason: EXECUTION_DISABLED_GLOBAL
effectiveDisableScope: GLOBAL
```

The valid control case must include:

```text
START_REQUEST_BLOCKED_BY_DISABLE_SWITCH
```

The valid control case must not include:

```text
INVALID_START_APPROVAL
```

## Precedence Rule

FP-MCP-043 defined that the disable switch beats approval.

FP-MCP-048 does not reverse that rule.

The correct behavior is:

- invalid approval input is recorded as invalid input
- the disable switch remains active
- execution remains disallowed
- the start endpoint remains uncontacted
- no approval artifact is created or mutated

## Required Evidence

The packet is complete only when evidence exists under:

```text
runs/FP-MCP-048/
```

Required files:

```text
runs/FP-MCP-048/start-negative-approval-fixtures/README.md
runs/FP-MCP-048/start-negative-approval-fixtures/*.json
runs/FP-MCP-048/start-negative-approval-test-aggregate.json
runs/FP-MCP-048/executor-result.md
runs/FP-MCP-048/verification.txt
```

## Aggregate Evidence Requirements

The aggregate JSON must record:

```text
negativeStartApprovalFixturesCreated: true
negativeStartApprovalFixturesValidated: true
fixtureCount: 10
invalidApprovalCasesRejected: true
controlCaseBlockedByDisableSwitch: true
allStartEndpointContactsFalse: true
allExecutionStartedFalse: true
approvalArtifactsCreated: false
approvalArtifactsMutated: false
executionAllowedNow: false
```

## Verification Requirements

Verification must confirm:

- repository is clean after evidence commit
- invalid approval cases return `approvalAccepted: false`
- invalid approval cases include `INVALID_START_APPROVAL`
- valid control case returns `approvalAccepted: true`
- valid control case includes `START_REQUEST_BLOCKED_BY_DISABLE_SWITCH`
- every case returns `started: false`
- every case returns `startEndpointContacted: false`
- every case returns `executionStarted: false`
- OpenCode is not contacted
- no runner start endpoint is contacted

## Acceptance Criteria

FP-MCP-048 is accepted only if all of the following are true:

```text
negativeStartApprovalFixturesCreated: true
negativeStartApprovalFixturesValidated: true
invalidApprovalCasesRejected: true
controlCaseBlockedByDisableSwitch: true
allStartEndpointContactsFalse: true
allExecutionStartedFalse: true
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

## Failure Conditions

This packet fails if any case:

- starts execution
- contacts the runner start endpoint
- starts OpenCode
- creates a runner run ID
- marks an invalid approval as accepted
- omits `INVALID_START_APPROVAL` for invalid approval input
- allows a valid approval to bypass the disable switch
- mutates approval records

## Boundary Statement

FP-MCP-048 is still pre-execution infrastructure.

It tests rejection behavior only.

It does not authorize real execution.
