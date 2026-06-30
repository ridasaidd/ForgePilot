# FP-MCP-085 — Execution Readiness Gate Inventory

## Task

Record a read-only inventory of the current ForgePilot MCP execution readiness gates.

## Goal

Determine what still blocks the first real OpenCode execution attempt without enabling execution, consuming approval, contacting the runner start endpoint, or starting OpenCode.

This packet answers one question:

What evidence and gates are already present, and what is still missing before a controlled OpenCode start attempt can be authorized?

## Background

ForgePilot MCP can now create, read, and validate non-executing OpenCode request artifacts through ChatGPT.

Recent completed work:

- FP-MCP-083 expanded the durable OpenCode request artifact contract.
- FP-MCP-084 normalized the create response summary boundary fields.
- Remote-runner request validation accepts the expanded request artifact.
- Execution remains globally disabled.
- No OpenCode execution has been started through MCP.

Before implementing any execution-start behavior, ForgePilot must record the current gate state.

## Scope

Allowed:

- Read ForgePilot repository status.
- Read OpenCode status.
- Read remote runner capability status.
- Read execution disable switch status.
- Read execution enablement status.
- Validate an existing OpenCode request artifact.
- Validate remote-runner handoff eligibility.
- Validate remote-runner endpoint request only if the tool is explicitly non-starting.
- Validate execution preflight only if the tool is explicitly non-starting.
- Record the inventory under `runs/FP-MCP-085/`.

Forbidden:

- Do not enable execution.
- Do not relax the global disable switch.
- Do not contact the runner start endpoint.
- Do not start OpenCode.
- Do not create a runner run id.
- Do not consume approval.
- Do not create real approval evidence.
- Do not mutate approval evidence.
- Do not mutate consumption evidence.
- Do not refactor MCP bridge code.
- Do not change production bridge behavior.

## Required Observations

The inventory must record:

1. Repository state
   - branch
   - commit
   - working tree cleanliness

2. OpenCode status
   - configured or not configured
   - execution enabled or disabled
   - allowed models
   - supported run modes
   - whether live OpenCode was contacted

3. Remote runner status
   - configured or not configured
   - reachable or unreachable
   - protocol version, if available
   - supported operations, if available
   - whether only the capabilities endpoint was contacted

4. Disable switch status
   - global disable state
   - packet/request/model/run-mode/operator disable state
   - effective disable reason
   - whether execution is currently allowed

5. Execution enablement status
   - evaluated gates
   - blocking reasons
   - missing contracts
   - missing artifacts
   - dry-run evidence state
   - approval/audit path state

6. Request validation status
   - existing request artifact validity
   - model allowlist status
   - run mode allowlist status
   - base commit / artifact commit relationship
   - safe artifact directory status

7. Preflight status
   - gates passed
   - gates failed
   - gates blocked
   - approval evidence state
   - pre-start evidence state
   - runner capability state
   - disable switch state

## Suggested Existing Request

Use an existing committed non-executing request artifact if available:

- packetId: FP-MCP-084
- requestId: REQ-20260630T094727908Z-630a4f0d

If unavailable, create a new non-executing request artifact for FP-MCP-085 using `forgepilot_create_opencode_run_request`.

## Evidence

Record:

- `runs/FP-MCP-085/execution-readiness-inventory.md`
- `runs/FP-MCP-085/verification.txt`

## Success Criteria

This packet is successful if:

1. The inventory records the current state of every relevant execution readiness gate.
2. The inventory clearly distinguishes satisfied gates from blocking gates.
3. The inventory identifies the next smallest missing gate or evidence artifact.
4. No execution is started.
5. No runner start endpoint is contacted.
6. No approval is consumed.
7. No production MCP behavior is changed.

## Non-goals

This packet does not implement execution.

This packet does not authorize execution.

This packet does not refactor the MCP bridge.

This packet does not select a model for production use.

This packet does not admit any model output as trusted evidence.
