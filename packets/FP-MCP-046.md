# FP-MCP-046 — Execution Disable Switch Bridge Enforcement Preflight

## Status

DRAFT

## Type

MCP bridge safety gate / preflight enforcement

## Objective

Integrate the execution disable switch into the guarded execution preflight path so that preflight explicitly observes and records disable-switch blocking before any future execution path could be considered.

This packet does **not** enable execution.

This packet does **not** start OpenCode.

This packet does **not** contact the runner start endpoint.

This packet does **not** create or accept human approval records.

This packet only makes the disable-switch state visible as a first-class preflight gate.

## Background

FP-MCP-043 defined the execution disable switch contract.

FP-MCP-044 implemented a read-only MCP tool:

```text
forgepilot_get_execution_disable_switch_status
```

FP-MCP-045 recorded negative scope tests showing that the global disable switch takes precedence over packet, request, model, and run-mode context.

The next required step is to make the guarded execution preflight path explicitly include this disable-switch result. Without this, the disable switch exists as a separate observable tool, but preflight does not yet record it as a gate.

## Governing Principles

This packet is constrained by:

* P01 — ForgePilot records observations, not narratives
* P02 — Trust cannot be retroactively created
* P03 — ForgePilot does not optimize for favorable outcomes
* P04 — Only admitted evidence may influence observatory outputs
* P06 — Classification follows observation

## Scope

### In Scope

* Add a disable-switch gate to guarded execution preflight output.
* Ensure disable-switch status is evaluated during preflight.
* Ensure disable-switch active state blocks preflight eligibility.
* Preserve all existing non-execution output fields.
* Preserve existing runner/OpenCode disabled behavior.
* Preserve existing request, lifecycle, packet, model, run-mode, runner, boundary, artifact, secret, and network gates.
* Add deterministic reason codes for disable-switch blocking.
* Record verification artifacts proving no execution occurred.

### Out of Scope

* Enabling runner execution.
* Enabling OpenCode execution.
* Starting OpenCode.
* Contacting the runner start endpoint.
* Creating approval records.
* Mutating approval records.
* Accepting approvals.
* Adding real execution mode.
* Changing allowed model list.
* Changing allowed run-mode list.
* Adding routing, ranking, or model selection behavior.
* Changing evidence admission policy.

## Required MCP Bridge Behavior

The existing guarded preflight tool must evaluate the execution disable switch before returning its result.

The preflight output must include a new gate:

```text
disableSwitch
```

Allowed gate states are the same as the existing preflight gate states:

```text
PASSED
FAILED
BLOCKED
NOT_EVALUATED
```

When the disable switch is active, the gate must be:

```text
disableSwitch: BLOCKED
```

The following fields must remain false:

```text
preflightEligible: false
executionPermitted: false
executionStarted: false
opencodeContacted: false
```

The tool must not contact the runner start endpoint.

If the existing preflight tool contacts the runner capabilities endpoint or validate-request endpoint, that behavior may remain unchanged. This packet only forbids start execution behavior.

## Required Output Additions

The guarded preflight result must include:

```text
disableSwitchActive
disableSwitchReason
disableSwitchScope
```

Expected current values while the global disable switch is active:

```text
disableSwitchActive: true
disableSwitchReason: EXECUTION_DISABLED_GLOBAL
disableSwitchScope: GLOBAL
```

## Required Reason Codes

When the disable switch is active, preflight must include:

```text
DISABLE_SWITCH_ACTIVE
EXECUTION_DISABLED_GLOBAL
```

The existing execution-disabled reason code may remain:

```text
EXECUTION_DISABLED
```

Existing runner/OpenCode disabled reasons may remain.

## Required Precedence

The disable switch must defeat every otherwise-successful preflight condition.

The disable switch must defeat:

```text
approval validity
runner capability
request validity
model validity
run-mode validity
artifact validity
repo cleanliness
execution enablement status
```

This packet does not require constructing a fully valid request artifact. It only requires that the preflight gate output has a first-class disable-switch observation and that an active disable switch blocks eligibility.

## Required Safety Invariants

All FP-MCP-046 verification must show:

```text
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
executionPermitted: false
preflightEligible: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
disableSwitchActive: true
```

If any execution-start indicator is true, FP-MCP-046 must fail.

## Expected Verification Method

Verification should use the MCP bridge preflight validation tool with an existing non-executing request context, if available.

If a suitable request artifact is not available, verification may use a deliberately missing request context, provided that the disable-switch gate is still evaluated and recorded as `BLOCKED`.

The verification must record:

* preflight result observed
* disable-switch gate state
* execution-start indicators
* runner/OpenCode enablement booleans
* reason codes
* whether any start endpoint was contacted

## Acceptance Criteria

FP-MCP-046 is accepted only if all are true:

```text
packetCreated: true
bridgePreflightPatched: true
bridgeBuildPassed: true
serviceRestarted: true
disableSwitchGatePresent: true
disableSwitchGateBlocked: true
disableSwitchActiveObserved: true
disableSwitchReasonObserved: true
disableSwitchScopeObserved: true
preflightEligible: false
executionPermitted: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
```

## Rejection Criteria

FP-MCP-046 must be rejected if any are true:

```text
executionStarted: true
startEndpointContacted: true
opencodeStarted: true
executionPermitted: true
preflightEligible: true
disableSwitchGateMissing: true
disableSwitchActiveNotObserved: true
disableSwitchBypassed: true
approvalCreated: true
approvalMutated: true
```

## Expected Final Artifact Paths

```text
runs/FP-MCP-046/executor-result.md
runs/FP-MCP-046/verification.txt
```

Optional aggregate JSON may be recorded at:

```text
runs/FP-MCP-046/preflight-disable-switch-result.json
```

## Implementation Notes

The implementation should reuse the FP-MCP-044 disable-switch status policy rather than duplicating divergent logic.

The preflight tool should remain read-only with respect to execution.

The bridge may internally call or share logic with the disable-switch status function, but the result must be represented in preflight output so that callers cannot ignore the disable switch by only inspecting preflight eligibility.

## Non-Execution Declaration

FP-MCP-046 is a safety-gate integration packet only.

It must not make execution possible.

It must make execution harder to accidentally enable by requiring the preflight layer to observe and honor the disable-switch state.
