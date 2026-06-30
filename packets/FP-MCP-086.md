# FP-MCP-086 — Remote Runner Endpoint Validator Failed-Path Output Completion

## Task

Fix the MCP output completeness bug in `forgepilot_validate_remote_runner_endpoint_request`.

## Goal

Ensure every return path of the remote-runner endpoint validator returns structured content matching its declared MCP output schema, including failed paths where the runner is unconfigured, local validation fails, or request digesting is unavailable.

This packet answers one question:

Can `forgepilot_validate_remote_runner_endpoint_request` always return a valid non-starting observation, even when validation fails?

## Background

FP-MCP-085 recorded a read-only execution readiness inventory.

During that inventory, calling `forgepilot_validate_remote_runner_endpoint_request` for:

- packetId: FP-MCP-084
- requestId: REQ-20260630T094727908Z-630a4f0d

failed MCP output validation because at least one failed path omitted required fields.

Observed missing fields:

- `opencodeStarted`
- `executionAllowedNow`
- `approvalId`
- `approvalPacketId`
- `approvalPath`

The tool did not start execution, but the failed-path response was not schema-complete.

## Scope

Allowed:

- Update `forgepilot_validate_remote_runner_endpoint_request` return objects.
- Add missing required fields to all return paths.
- Add small helper/default object if it reduces duplication.
- Add or update tests if available.
- Verify the tool returns structured output when the runner is unconfigured.
- Record verification artifacts under `runs/FP-MCP-086/`.

Forbidden:

- Do not configure the remote runner.
- Do not enable execution.
- Do not relax the global disable switch.
- Do not contact the runner start endpoint.
- Do not start OpenCode.
- Do not create a runner run id.
- Do not consume approval.
- Do not create real approval evidence.
- Do not mutate approval evidence.
- Do not change request artifact contracts.
- Do not refactor unrelated MCP bridge code.

## Required Behavior

After this packet, `forgepilot_validate_remote_runner_endpoint_request` must return valid structured content on failed paths.

At minimum, every return path must include:

- `opencodeStarted`
- `executionAllowedNow`
- `approvalId`
- `approvalPacketId`
- `approvalPath`

Expected safe failed-path defaults:

- `opencodeStarted: false`
- `executionAllowedNow: false`
- `approvalId: null`
- `approvalPacketId: null`
- `approvalPath: null`

Existing non-execution safety fields must remain false:

- `runnerContacted` must remain false when the runner is unconfigured.
- `executionStarted` must remain false.
- The runner start endpoint must not be contacted.
- OpenCode must not be started.

## Verification

Verification must show:

1. Build/typecheck passes using this repo's available scripts.
2. Test script passes if defined.
3. Calling `forgepilot_validate_remote_runner_endpoint_request` with the FP-MCP-084 request returns structured content instead of an MCP output validation error.
4. The returned content records:
   - `valid: false`
   - `runnerConfigured: false`
   - `runnerContacted: false`
   - `executionStarted: false`
   - `opencodeStarted: false`
   - `executionAllowedNow: false`
   - `approvalId: null`
   - `approvalPacketId: null`
   - `approvalPath: null`
5. No execution is started.
6. No runner start endpoint is contacted.
7. No approval is consumed.

## Evidence

Record:

- `runs/FP-MCP-086/executor-result.md`
- `runs/FP-MCP-086/verification.txt`

## Success Criteria

This packet is successful only if:

1. The endpoint validator returns schema-valid structured output for the runner-unconfigured path.
2. The failed-path output preserves non-execution safety fields.
3. The FP-MCP-084 request artifact remains unchanged.
4. No execution is started.
5. No runner start endpoint is contacted.
