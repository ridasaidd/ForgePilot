# FP-MCP-045 Executor Result — Execution Disable Switch Negative Scope Tests

## Packet

FP-MCP-045 — Execution Disable Switch Negative Scope Tests

## Result

PASS

## Summary

FP-MCP-045 recorded a negative disable-scope fixture set and aggregate evidence for the read-only execution disable switch status tool.

The fixture set verifies that packet, request, model, and run-mode context does not weaken or override the global execution disable switch. The observed effective disable scope remains GLOBAL.

## Repository State Observed

```text
repo: ForgePilot
branch: main
commit: 1c071f9
workingTreeClean: true
```

## Evidence Recorded

```text
runs/FP-MCP-045/disable-scope-fixtures/01-packet-context-global-precedence.json
runs/FP-MCP-045/disable-scope-fixtures/02-request-context-global-precedence.json
runs/FP-MCP-045/disable-scope-fixtures/03-model-context-disallowed-name-global-precedence.json
runs/FP-MCP-045/disable-scope-fixtures/04-run-mode-context-disallowed-name-global-precedence.json
runs/FP-MCP-045/disable-scope-fixtures/05-packet-only-context-global-precedence.json
runs/FP-MCP-045/disable-scope-fixtures/README.md
runs/FP-MCP-045/disable-scope-test-aggregate.json
```

## Final Probe

```text
schemaVersion: FP-MCP-044
packetId: FP-MCP-045
requestId: REQ-20260622T171210000Z-00000001
modelId: deepseek-v4-pro-high
runMode: DESIGN_ONLY
disableSwitchStatusEvaluated: true
disableSwitchDefined: true
disableSwitchActive: true
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
globalDisableActive: true
packetDisableActive: false
requestDisableActive: false
modelDisableActive: false
runModeDisableActive: false
operatorDisableActive: false
effectiveDisableReason: EXECUTION_DISABLED_GLOBAL
effectiveDisableScope: GLOBAL
precedenceApplied: GLOBAL, OPERATOR, PACKET, REQUEST, MODEL, RUN_MODE
```

## Boundary Confirmation

No execution was enabled.
No runner start endpoint was contacted.
No OpenCode process was started.
No approvals were created or mutated.
No model provider calls were made.

## Decision

FP-MCP-045 is accepted as an observational negative-scope test packet.
