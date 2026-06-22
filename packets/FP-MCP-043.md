# FP-MCP-043 — Execution Disable Switch Contract

## Status

DRAFT

## Type

MCP safety contract / documentation-only packet

## Summary

Define ForgePilot MCP execution disable switch semantics before any real execution enablement work proceeds.

This packet creates a contract for emergency-stop and policy-disable behavior. It does not enable execution, create approvals, start the runner, start OpenCode, contact an execution start endpoint, or invoke any model provider.

The expected result is an observable, auditable disable-switch contract that makes execution denial explicit even when other gates would otherwise pass.

## Motivation

ForgePilot MCP is approaching the boundary where future packets may validate approval records, runner capability, request scope, model allowance, and run-mode allowance.

Before any execution path can be made live, the system needs a higher-priority safety mechanism:

> A disable switch must be able to stop execution regardless of approval validity, request validity, runner capability, or execution enablement status.

This prevents approval artifacts or capability signals from becoming sufficient to execute when an operator, packet, request, model, or run mode has been explicitly disabled.

## Governing principles

This packet is constrained by the ForgePilot principles already governing MCP development:

* P01 — ForgePilot records observations, not narratives.
* P02 — Trust cannot be retroactively created.
* P03 — ForgePilot does not optimize for favorable outcomes.
* P04 — Only admitted evidence may influence observatory outputs.
* P06 — Classification follows observation.

## Current execution boundary

At the time this packet is authored, ForgePilot MCP remains non-executing:

```text
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
allowedRunMode: DESIGN_ONLY
```

This packet must preserve that state.

## Task

Create a documentation contract defining execution disable switch semantics for ForgePilot MCP.

The contract must define:

1. What an execution disable switch is.
2. Which disable scopes exist.
3. How disable state is represented as observations.
4. How disable switch precedence works.
5. Which observable outputs are required.
6. Which execution-adjacent behaviors remain forbidden.
7. How future validator or preflight tools must treat disable switch results.

## Non-goals

This packet must not:

* Enable runner execution.
* Enable OpenCode execution.
* Add a start-run path.
* Contact the runner start endpoint.
* Invoke OpenCode.
* Invoke any model provider.
* Create a valid human approval artifact.
* Mutate an approval record.
* Add routing or model-selection behavior.
* Add dashboard behavior.
* Add cost optimization behavior.
* Convert a disabled request into a queued execution request.
* Treat absence of a disable artifact as approval to execute.

## Required contract document

Create:

```text
docs/execution-disable-switch-contract.md
```

The document must be contract-focused and must not describe execution implementation steps beyond validation semantics.

## Disable switch definition

An execution disable switch is an explicit observed blocker that prevents execution from being allowed.

It may be global or scoped.

A disable switch is not an approval state, not a runner capability state, not a request validity state, and not a model-readiness state. It is an independent safety observation.

## Disable switch precedence

The contract must define the following precedence rule:

```text
disable switch beats approval
disable switch beats runner capability
disable switch beats request validity
disable switch beats execution enablement status
disable switch beats model allowance
disable switch beats run-mode allowance
```

If any applicable disable switch is active, then the final execution decision must be denial.

## Required disable reason vocabulary

The contract must define at least these reason codes:

```text
EXECUTION_DISABLED_GLOBAL
EXECUTION_DISABLED_BY_PACKET
EXECUTION_DISABLED_BY_REQUEST
EXECUTION_DISABLED_BY_MODEL
EXECUTION_DISABLED_BY_RUN_MODE
EXECUTION_DISABLED_BY_OPERATOR
```

The contract may define additional reason codes only if they remain explicit observations and do not collapse into generic failure.

## Required disable scopes

The contract must define at least these scopes:

### Global scope

Disables all execution attempts.

Required reason:

```text
EXECUTION_DISABLED_GLOBAL
```

### Packet scope

Disables execution for a specific packet id.

Required reason:

```text
EXECUTION_DISABLED_BY_PACKET
```

### Request scope

Disables execution for a specific run request id or request artifact.

Required reason:

```text
EXECUTION_DISABLED_BY_REQUEST
```

### Model scope

Disables execution for a specific model id.

Required reason:

```text
EXECUTION_DISABLED_BY_MODEL
```

### Run-mode scope

Disables execution for a specific run mode.

Required reason:

```text
EXECUTION_DISABLED_BY_RUN_MODE
```

### Operator scope

Disables execution because a human operator or policy authority explicitly stopped execution.

Required reason:

```text
EXECUTION_DISABLED_BY_OPERATOR
```

## Required observable output shape

The contract must require future tools that evaluate disable state to expose safe observable outputs similar to:

```json
{
  "executionDisableSwitchDefined": true,
  "disableSwitchEvaluated": true,
  "disableSwitchActive": true,
  "disableReasons": [
    "EXECUTION_DISABLED_GLOBAL"
  ],
  "executionAllowedNow": false,
  "runnerExecutionEnabled": false,
  "opencodeExecutionEnabled": false,
  "executionStarted": false
}
```

The contract must require that these outputs are observations only. They must not start execution, create approvals, or mutate run artifacts.

## Required default stance

The contract must state that ForgePilot MCP remains deny-by-default.

A missing disable switch artifact must not imply execution approval.

A disabled result must explicitly produce `executionAllowedNow: false`.

An enabled result must not by itself produce `executionAllowedNow: true`; all other gates still have to pass.

## Interaction with human approval records

The contract must define that human approval records are necessary but never sufficient for execution.

If a valid human approval record exists but an applicable disable switch is active, execution remains denied.

Required output relationship:

```text
approvalValid: true
disableSwitchActive: true
executionAllowedNow: false
```

## Interaction with runner capability

The contract must define that runner capability is necessary but never sufficient for execution.

If the runner reports execution capability in a future stage but an applicable disable switch is active, execution remains denied.

Required output relationship:

```text
runnerExecutionCapable: true
disableSwitchActive: true
executionAllowedNow: false
```

## Interaction with request validation

The contract must define that request validity is necessary but never sufficient for execution.

If a request is structurally valid but an applicable disable switch is active, execution remains denied.

Required output relationship:

```text
requestValid: true
disableSwitchActive: true
executionAllowedNow: false
```

## Interaction with model and run mode

The contract must define that allowed model and allowed run mode are necessary but never sufficient for execution.

If a model and run mode are allowed but either is disabled by switch, execution remains denied.

Required output relationship:

```text
modelAllowed: true
runModeAllowed: true
disableSwitchActive: true
executionAllowedNow: false
```

## Required validation behavior

Future validators must treat applicable active disable switches as hard blockers.

A validator may report multiple disable reasons at once.

A validator must not discard lower-priority observations simply because a higher-priority disable switch exists. It may conclude with denial while still recording all observed gate states.

## Required audit language

The contract must avoid narrative judgment such as:

```text
safe
good
approved enough
probably okay
ready to execute
```

Preferred language:

```text
observed
not observed
valid
invalid
active
inactive
blocked
denied
not evaluated
```

## Acceptance criteria

This packet is accepted only if all of the following hold:

1. `docs/execution-disable-switch-contract.md` exists.
2. The document defines disable switch semantics.
3. The document defines global and scoped disable behavior.
4. The document defines the required reason vocabulary.
5. The document defines precedence over approval, runner capability, request validity, model allowance, run-mode allowance, and execution enablement status.
6. The document defines deny-by-default behavior.
7. The document states that an inactive or missing disable switch is not sufficient to allow execution.
8. The document defines safe observable outputs.
9. The document states that no execution is enabled by this packet.
10. Verification records confirm that execution remains disabled.

## Verification requirements

Record verification under:

```text
runs/FP-MCP-043/verification.txt
```

Verification must include:

```text
executionDisableSwitchContractDefined: true
disableSwitchActive: true
executionAllowedNow: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

If MCP status tools are available, verification should include observed current values from:

```text
forgepilot_status
forgepilot_get_remote_runner_status
forgepilot_get_opencode_status
```

## Executor result requirements

Record executor result under:

```text
runs/FP-MCP-043/executor-result.md
```

The executor result must state:

```text
result: SUCCESS
executionEnabled: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
executionStarted: false
```

## Safety invariants

This packet preserves the following invariants:

```text
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
humanApprovalRecorded: false
executionAllowedNow: false
```

## Expected outcome

ForgePilot MCP gains a clear execution disable switch contract.

The project remains in gated, non-executing mode.

Future packets may implement disable switch validation tools against this contract, but this packet only defines the contract.
