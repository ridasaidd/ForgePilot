# Execution Disable Switch Contract

Packet: FP-MCP-043  
Status: Contract defined  
Scope: ForgePilot MCP execution safety boundary  
Execution impact: None — this contract does not enable execution

## Purpose

ForgePilot must define an explicit execution disable switch before any future execution enablement can be considered.

The disable switch is a safety gate that can prevent execution even when other gates appear satisfied.
It is not an approval mechanism, not a runner capability declaration, not a request validator, and not an execution launcher.

FP-MCP-043 defines the observable contract for disable-switch evaluation only.

## Governing principles

This contract preserves the ForgePilot principles:

* P01 — ForgePilot records observations, not narratives.
* P02 — Trust cannot be retroactively created.
* P03 — ForgePilot does not optimize for favorable outcomes.
* P04 — Only admitted evidence may influence observatory outputs.
* P06 — Classification follows observation.

The disable switch records observed blocking conditions. It must not rewrite packet intent, mutate approvals, or infer safety from missing evidence.

## Core rule

The disable switch has absolute precedence over execution.

If any applicable disable switch is active, execution is not allowed.

This remains true even if all of the following are also true:

* the packet exists,
* the request artifact is valid,
* the model is allowed,
* the run mode is allowed,
* the runner is reachable,
* the runner reports capability,
* the working tree is clean,
* human approval is recorded,
* dry-run evidence exists,
* preflight validation passes.

Disable beats approval.
Disable beats runner capability.
Disable beats request validity.
Disable beats execution enablement status.
Disable beats model allowance.
Disable beats run-mode allowance.

## Non-execution boundary

This contract must not:

* start OpenCode,
* call an OpenCode model provider,
* call a runner start endpoint,
* create a usable human approval,
* consume a human approval,
* mutate an approval artifact,
* mark execution as permitted,
* mark execution as started,
* write execution output artifacts,
* infer approval from the absence of a disable switch.

Safe evaluation may read only policy/configuration state and committed ForgePilot artifacts needed to classify disable status.

## Disable switch levels

A disable switch may apply at one or more independent levels.

### Global disable

Reason code:

```text
EXECUTION_DISABLED_GLOBAL
```

Meaning:
All execution is disabled regardless of packet, request, model, run mode, runner state, or approval state.

### Packet disable

Reason code:

```text
EXECUTION_DISABLED_BY_PACKET
```

Meaning:
Execution is disabled for a specific packet id.

### Request disable

Reason code:

```text
EXECUTION_DISABLED_BY_REQUEST
```

Meaning:
Execution is disabled for a specific request id or request artifact.

### Model disable

Reason code:

```text
EXECUTION_DISABLED_BY_MODEL
```

Meaning:
Execution is disabled for a specific model id, even if the model is normally allowed by static policy.

### Run-mode disable

Reason code:

```text
EXECUTION_DISABLED_BY_RUN_MODE
```

Meaning:
Execution is disabled for a specific run mode, even if the run mode is normally allowed by static policy.

### Operator disable

Reason code:

```text
EXECUTION_DISABLED_BY_OPERATOR
```

Meaning:
Execution is disabled by an explicit operator safety action.

This reason is distinct from global disable because it records the observed source as operator action rather than static policy.

### Unknown disable state

Reason code:

```text
EXECUTION_DISABLE_STATE_UNKNOWN
```

Meaning:
Disable state could not be evaluated safely.

Unknown disable state must be treated as active disable for execution purposes.

## Disable switch precedence order

Evaluation should preserve all observed active disable reasons, but execution eligibility is false as soon as any applicable disable is active.

Recommended reporting order:

1. `EXECUTION_DISABLED_GLOBAL`
2. `EXECUTION_DISABLED_BY_OPERATOR`
3. `EXECUTION_DISABLED_BY_PACKET`
4. `EXECUTION_DISABLED_BY_REQUEST`
5. `EXECUTION_DISABLED_BY_MODEL`
6. `EXECUTION_DISABLED_BY_RUN_MODE`
7. `EXECUTION_DISABLE_STATE_UNKNOWN`

The order is for stable reporting only. It must not imply that later reasons are weaker.

## Expected safe observable output

A disable-switch evaluation result must expose explicit booleans.

Minimum output shape:

```json
{
  "schemaVersion": "FP-MCP-043",
  "packetId": "FP-MCP-043",
  "disableSwitchEvaluated": true,
  "executionDisableSwitchDefined": true,
  "disableSwitchActive": true,
  "executionAllowedNow": false,
  "executionStarted": false,
  "startEndpointContacted": false,
  "opencodeStarted": false,
  "runnerExecutionEnabled": false,
  "opencodeExecutionEnabled": false,
  "activeDisableReasons": [
    "EXECUTION_DISABLED_GLOBAL"
  ],
  "checkedAt": "<iso-8601-timestamp>",
  "statusSource": "ForgePilot execution disable switch contract",
  "boundaryVersion": "FP-MCP-043"
}
```

## Required invariants

The following invariants are mandatory:

* `executionDisableSwitchDefined` must be `true` when this contract is present and readable.
* `executionAllowedNow` must be `false` when `disableSwitchActive` is `true`.
* `executionStarted` must remain `false` during disable-switch evaluation.
* `startEndpointContacted` must remain `false` during disable-switch evaluation.
* `opencodeStarted` must remain `false` during disable-switch evaluation.
* `runnerExecutionEnabled` must not be changed by disable-switch evaluation.
* `opencodeExecutionEnabled` must not be changed by disable-switch evaluation.
* A missing, unreadable, or malformed disable-switch state must not be interpreted as permission to execute.
* Disable-switch evaluation must be repeatable without consuming, creating, or mutating approval artifacts.

## Interaction with human approval

Human approval is necessary for any future execution path, but it is not sufficient.

If a valid approval exists and any disable switch is active, the result must remain:

```json
{
  "humanApprovalRecorded": true,
  "disableSwitchActive": true,
  "executionAllowedNow": false,
  "approvalConsumed": false,
  "executionStarted": false
}
```

A disable-switch block must not consume the approval. Approval consumption is only allowed in a future explicitly approved execution protocol.

## Interaction with execution enablement status

Execution enablement status must include disable-switch state as a required gate.

The enablement status must not report `executionAllowedNow: true` unless disable-switch evaluation reports:

```json
{
  "disableSwitchEvaluated": true,
  "executionDisableSwitchDefined": true,
  "disableSwitchActive": false,
  "activeDisableReasons": []
}
```

If disable-switch evaluation is unavailable, the enablement status must include:

```text
EXECUTION_DISABLE_STATE_UNKNOWN
```

and execution must remain disallowed.

## Interaction with runner capability

Runner capability is observational only.

A runner may report that it supports execution-related operations, but disable-switch state still takes precedence.

If runner capability is present and disable is active, the result must remain:

```json
{
  "runnerExecutionCapabilityPresent": true,
  "disableSwitchActive": true,
  "executionAllowedNow": false,
  "executionStarted": false
}
```

## Interaction with request validity

A valid request artifact is not sufficient for execution.

If request validation passes and disable is active, the result must remain:

```json
{
  "requestValid": true,
  "disableSwitchActive": true,
  "executionAllowedNow": false,
  "executionStarted": false
}
```

## Audit requirements

A future implementation of this contract must be auditable with negative tests proving that execution remains blocked when each disable reason is active.

Required negative cases:

* global disable active,
* packet disable active,
* request disable active,
* model disable active,
* run-mode disable active,
* operator disable active,
* disable state unreadable,
* disable state malformed,
* valid approval plus active disable,
* runner capability plus active disable,
* valid request plus active disable.

Each negative case must prove:

```json
{
  "executionAllowedNow": false,
  "executionStarted": false,
  "startEndpointContacted": false,
  "opencodeStarted": false
}
```

## Admission boundary

This contract is not itself admitted execution evidence.

It defines the shape and precedence of disable-switch observations. Future implementation evidence must still be validated, audited, and admitted before it may influence observatory outputs.

## FP-MCP-043 completion criteria

FP-MCP-043 is complete when:

* this contract document exists under `docs/`,
* the contract defines disable-switch precedence,
* the contract defines global and scoped disable reasons,
* the contract defines safe observable outputs,
* the contract explicitly preserves non-execution behavior,
* verification confirms no execution was enabled or started.
