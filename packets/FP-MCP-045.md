# FP-MCP-045 — Execution Disable Switch Negative Scope Tests

## Status

DRAFT

## Type

MCP safety-gate validation packet

## Parent Context

This packet follows:

- FP-MCP-043 — Execution Disable Switch Contract
- FP-MCP-044 — Execution Disable Switch Status Tool

FP-MCP-044 added a read-only tool that observes the execution disable switch and reports that execution is blocked globally. FP-MCP-045 adds negative scope tests for the disable-switch model before any future execution enablement work proceeds.

## Purpose

Define and validate negative fixture coverage for execution-disable scopes and precedence.

The goal is to prove that disabled execution remains blocked when the disable condition is expressed at different scopes:

- Global
- Operator
- Packet
- Request
- Model
- Run mode
- Multi-scope precedence combinations

This packet must not enable execution.

## Non-Goals

This packet must not:

- Enable runner execution
- Enable OpenCode execution
- Start OpenCode
- Contact any runner start endpoint
- Create a valid human approval
- Mutate an approval record
- Create execution artifacts
- Create request artifacts for execution
- Add routing logic
- Add model-selection logic
- Add admission logic
- Add secret handling
- Add network exposure beyond existing read-only/capability checks

## Governing Principles

This packet is constrained by:

- P01 — ForgePilot records observations, not narratives
- P02 — Trust cannot be retroactively created
- P03 — ForgePilot does not optimize for favorable outcomes
- P04 — Only admitted evidence may influence observatory outputs
- P06 — Classification follows observation

## Execution Boundary

The following values must remain false in every produced observation:

```text
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
```

The tool added by this packet, if any, must be read-only and must not contact the runner start endpoint.

## Scope Model Under Test

The disable switch has these observable scope classes:

```text
GLOBAL
OPERATOR
PACKET
REQUEST
MODEL
RUN_MODE
```

The precedence order is:

```text
GLOBAL > OPERATOR > PACKET > REQUEST > MODEL > RUN_MODE
```

A higher-precedence active disable scope must determine the effective disable reason and effective disable scope.

## Required Negative Fixtures

Create fixture artifacts under:

```text
runs/FP-MCP-045/disable-scope-fixtures/
```

The minimum required fixture set is:

```text
global-disable.json
operator-disable.json
packet-disable.json
request-disable.json
model-disable.json
run-mode-disable.json
multi-scope-global-wins.json
multi-scope-operator-over-packet.json
multi-scope-packet-over-model.json
multi-scope-request-over-run-mode.json
```

Each fixture must be safe, deterministic, and non-secret-bearing.

Each fixture must include:

```json
{
  "schemaVersion": "FP-MCP-045",
  "fixtureType": "execution-disable-scope-negative-fixture",
  "fixtureId": "string",
  "description": "string",
  "input": {
    "packetId": "FP-MCP-045",
    "requestId": "nullable string",
    "modelId": "nullable string",
    "runMode": "nullable string",
    "globalDisableActive": "boolean",
    "operatorDisableActive": "boolean",
    "packetDisableActive": "boolean",
    "requestDisableActive": "boolean",
    "modelDisableActive": "boolean",
    "runModeDisableActive": "boolean"
  },
  "expected": {
    "disableSwitchActive": true,
    "executionAllowedNow": false,
    "executionStarted": false,
    "startEndpointContacted": false,
    "opencodeStarted": false,
    "runnerExecutionEnabled": false,
    "opencodeExecutionEnabled": false,
    "effectiveDisableReason": "string",
    "effectiveDisableScope": "GLOBAL | OPERATOR | PACKET | REQUEST | MODEL | RUN_MODE",
    "requiredReasons": ["string"]
  }
}
```

## Expected Reason Codes

The implementation may include additional reason codes, but the following expected effective reason codes must be supported:

```text
EXECUTION_DISABLED_GLOBAL
EXECUTION_DISABLED_BY_OPERATOR
EXECUTION_DISABLED_BY_PACKET
EXECUTION_DISABLED_BY_REQUEST
EXECUTION_DISABLED_BY_MODEL
EXECUTION_DISABLED_BY_RUN_MODE
DISABLE_SWITCH_ACTIVE
EXECUTION_NOT_ALLOWED
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
```

## Public Tool Requirement

If MCP implementation is required, add a read-only validation tool:

```text
forgepilot_validate_execution_disable_switch_scope_fixtures
```

The tool must:

- Read only fixture files under `runs/FP-MCP-045/disable-scope-fixtures/`
- Reject unsafe paths
- Reject invalid JSON
- Reject missing required fields
- Reject fixtures containing secret-like material
- Evaluate the fixture against the disable-switch precedence contract
- Confirm all expected reason codes are present
- Confirm all effective scopes match expectations
- Confirm all execution boundary fields remain false
- Never mutate fixtures
- Never create approvals
- Never start execution
- Never contact the runner start endpoint
- Never start OpenCode

The public production status tool must not accept arbitrary disable override values from clients. Fixture input may only be consumed by the fixture-validation tool from committed repository artifacts.

## Required Validator Output

The validation tool output must include at least:

```text
schemaVersion: FP-MCP-045
packetId: FP-MCP-045
disableScopeFixtureValidationEvaluated: true
fixtureCount: 10
allFixturesLoaded: true
allFixturesValid: true
allFixturesRejectedExecution: true
allExpectedReasonsPresent: true
allEffectiveScopesMatched: true
precedenceVerified: true
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
statusSource: ForgePilot execution disable switch scope fixture validation
boundaryVersion: FP-MCP-045
```

The validator must report individual fixture observations, including:

```text
fixtureId
disableSwitchActive
expectedEffectiveDisableScope
observedEffectiveDisableScope
expectedEffectiveDisableReason
observedEffectiveDisableReason
passed
reasons
```

## Acceptance Criteria

FP-MCP-045 is accepted only if:

1. The packet is committed to `packets/FP-MCP-045.md`.
2. Required negative fixtures are created under `runs/FP-MCP-045/disable-scope-fixtures/`.
3. A read-only validator validates all required fixtures.
4. All required fixtures are recognized as disabling execution.
5. All effective disable scopes match the precedence contract.
6. All required reason codes are present.
7. No execution is started.
8. No runner start endpoint is contacted.
9. OpenCode is not started.
10. Runner execution remains disabled.
11. OpenCode execution remains disabled.
12. Verification artifacts are recorded under `runs/FP-MCP-045/`.

## Required Verification Artifacts

Record:

```text
runs/FP-MCP-045/executor-result.md
runs/FP-MCP-045/verification.txt
```

If aggregate machine-readable evidence is produced, record it as:

```text
runs/FP-MCP-045/disable-scope-fixture-validation.json
```

## Expected Final State

```text
packetCommitted: true
negativeDisableScopeFixturesCreated: true
negativeDisableScopeFixturesValidated: true
fixtureCount: 10
allFixturesLoaded: true
allFixturesValid: true
allFixturesRejectedExecution: true
allExpectedReasonsPresent: true
allEffectiveScopesMatched: true
precedenceVerified: true
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
```

## Notes

This packet creates evidence that the disable-switch layer can block execution from multiple scopes and apply deterministic precedence. It does not make execution more available. It makes future execution enablement harder to reach accidentally.
