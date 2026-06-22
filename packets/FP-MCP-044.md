# FP-MCP-044 — Execution Disable Switch Status Tool

## Status

DRAFT

## Type

MCP bridge implementation packet

## Scope

Add a read-only MCP tool that reports ForgePilot execution disable switch status.

This packet must not enable execution.

## Context

FP-MCP-043 defined the execution disable switch contract.

The next safe step is to expose that contract as an observable status tool so that operators, auditors, and future preflight gates can see whether execution is disabled, why it is disabled, and which scope is responsible for the block.

ForgePilot must preserve the current non-executing boundary:

```text
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

## Task

Implement a new MCP tool:

```text
forgepilot_get_execution_disable_switch_status
```

The tool must return structured status for the execution disable switch.

The tool must be read-only.

The tool must not contact the runner start endpoint.

The tool must not start OpenCode.

The tool must not mutate repository files.

The tool must not create approvals.

The tool must not consume approvals.

The tool must not change execution enablement.

## Goal

Make the execution disable switch observable before any future execution enablement work.

The tool answers one question:

```text
Is execution currently disabled, and what switch scope is responsible?
```

## Non-goals

This packet must not:

* enable runner execution
* enable OpenCode execution
* create a real approval
* accept a real approval
* start a runner request
* contact `/runner/start`
* invoke OpenCode CLI or API
* modify ForgePilot packets
* modify ForgePilot run artifacts
* implement audit admission logic
* implement execution routing
* implement model selection
* implement cost optimization
* weaken any existing execution preflight gates

## Required tool name

```text
forgepilot_get_execution_disable_switch_status
```

## Required input

The tool should accept an optional packet id and optional scope fields.

Suggested input schema:

```ts
{
  packetId?: string;
  requestId?: string;
  modelId?: string;
  runMode?: string;
}
```

All inputs are observational context only.

The tool must not treat supplied context as permission to execute.

## Required output fields

The tool output must include at minimum:

```text
schemaVersion
disableSwitchStatusEvaluated
disableSwitchDefined
disableSwitchActive
executionAllowedNow
executionStarted
startEndpointContacted
opencodeStarted
runnerExecutionEnabled
opencodeExecutionEnabled
globalDisableActive
packetDisableActive
requestDisableActive
modelDisableActive
runModeDisableActive
operatorDisableActive
effectiveDisableReason
effectiveDisableScope
precedenceApplied
checkedAt
statusSource
boundaryVersion
reasons
```

## Required safe default behavior

Until a future explicit enablement packet changes the policy, the tool must report:

```text
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
effectiveDisableReason: EXECUTION_DISABLED_GLOBAL
effectiveDisableScope: GLOBAL
```

## Required precedence

The tool must encode the FP-MCP-043 precedence rule:

```text
disable switch beats approval
disable switch beats runner capability
disable switch beats request validity
disable switch beats execution enablement status
```

The effective disable scope must be resolved in this order:

1. `GLOBAL`
2. `OPERATOR`
3. `PACKET`
4. `REQUEST`
5. `MODEL`
6. `RUN_MODE`

If multiple disable switches are active, the highest-precedence active scope must determine:

```text
effectiveDisableScope
effectiveDisableReason
```

## Required reason codes

The implementation may include additional reason codes, but must support at least:

```text
EXECUTION_DISABLED_GLOBAL
EXECUTION_DISABLED_BY_OPERATOR
EXECUTION_DISABLED_BY_PACKET
EXECUTION_DISABLED_BY_REQUEST
EXECUTION_DISABLED_BY_MODEL
EXECUTION_DISABLED_BY_RUN_MODE
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
DISABLE_SWITCH_ACTIVE
EXECUTION_NOT_ALLOWED
```

## Required invariants

The tool must always return:

```text
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

for this packet.

The tool must not call any function that can start execution.

The tool must not call any OpenCode live execution path.

The tool must not contact the runner start endpoint.

The tool may reuse static OpenCode status and runner capability status only if those paths are already read-only.

## MCP bridge implementation requirements

The bridge implementation must:

1. Add a Zod output schema for the new tool.
2. Add a pure helper function that computes disable switch status.
3. Register the new MCP tool.
4. Return structured JSON through the existing structured result helper.
5. Preserve existing tool behavior.
6. Build successfully with:

   ```bash
   pnpm run build
   ```

7. Avoid `npm run build`.

## Suggested schema version

```text
FP-MCP-044
```

## Suggested boundary version

```text
FP-MCP-044
```

## Verification requirements

Verification must confirm:

```text
toolRegistered: true
buildPassed: true
disableSwitchStatusEvaluated: true
disableSwitchDefined: true
disableSwitchActive: true
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
effectiveDisableScope: GLOBAL
effectiveDisableReason: EXECUTION_DISABLED_GLOBAL
runnerStartEndpointContacted: false
opencodeStarted: false
repositoryMutationByTool: false
```

## Acceptance criteria

This packet is accepted only if:

1. `forgepilot_get_execution_disable_switch_status` is visible through the MCP bridge.
2. The tool reports the disable switch as active.
3. The tool reports execution is not allowed.
4. The tool reports no execution started.
5. The tool reports no runner start endpoint contact.
6. The tool reports no OpenCode start.
7. The implementation builds with `pnpm run build`.
8. Existing MCP tools remain available.
9. The ForgePilot repo remains clean after verification artifacts are recorded.
10. No real execution artifacts are created.

## Expected final observable result

```text
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
effectiveDisableScope: GLOBAL
effectiveDisableReason: EXECUTION_DISABLED_GLOBAL
```

## Evidence to record

Record the following under:

```text
runs/FP-MCP-044/
```

Required artifacts:

```text
executor-result.md
verification.txt
```

Optional aggregate JSON evidence:

```text
execution-disable-switch-status.json
```

## Safety note

FP-MCP-044 is a read-only observability step.

It exists to make the disable switch explicit before future work approaches real execution enablement.
