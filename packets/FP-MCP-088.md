# FP-MCP-088 — Authenticated Remote Runner Validate-Request Observation

## Task

Observe the authenticated remote runner validate-request path through ForgePilot MCP without starting execution.

## Goal

Determine whether the MCP bridge can submit an existing committed OpenCode request artifact to the remote runner validate-request endpoint and receive a protocol-valid non-starting response.

This packet answers one question:

Can the authenticated runner validate-request endpoint evaluate a ForgePilot request artifact without starting OpenCode?

## Background

FP-MCP-087 verified that the MCP bridge can authenticate to and observe the remote runner capabilities endpoint.

Observed runner capabilities:

- runnerConfigured: true
- runnerReachable: true
- runnerVersion: 0.1.0-fp-mcp-024
- runnerProtocolVersion: forgepilot-runner-v1
- executionEnabled: false
- supportedOperations:
  - capabilities
  - validate-request
- supportedRunModes:
  - DESIGN_ONLY
- allowedModels:
  - deepseek-v4-pro-high
  - qwen-3.7-max

The runner advertises `validate-request`, but does not advertise execution start capability in the observed capability response.

The next smallest gate is to verify the authenticated validate-request endpoint.

## Scope

Allowed:

- Use an existing committed non-executing request artifact.
- Run local request validation.
- Contact the remote runner validate-request endpoint.
- Record whether the runner accepted or rejected the request.
- Record runner protocol metadata.
- Record verification artifacts under `runs/FP-MCP-088/`.

Forbidden:

- Do not enable execution.
- Do not relax the global disable switch.
- Do not contact the runner start endpoint.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create a runner run id.
- Do not consume approval.
- Do not create real approval evidence.
- Do not mutate approval evidence.
- Do not mutate request artifacts.
- Do not change production MCP behavior.

## Suggested Existing Request

Use the existing committed request artifact:

- packetId: FP-MCP-084
- requestId: REQ-20260630T094727908Z-630a4f0d

## Required Observation

Record:

- local validation status
- whether the runner was configured
- whether the runner was contacted
- whether the runner accepted the request
- runner protocol version
- request artifact path
- request artifact sha256
- base/current/creation/artifact commits
- whether execution was enabled
- whether execution was started
- whether OpenCode was started
- whether approval fields remain null
- reasons, if any

## Required Safety Results

Verification must show:

- executionEnabled: false
- executionStarted: false
- opencodeStarted: false
- executionAllowedNow: false
- runner start endpoint not contacted
- no approval consumed
- no runner run id created

## Evidence

Record:

- `runs/FP-MCP-088/remote-runner-validate-request-observation.md`
- `runs/FP-MCP-088/verification.txt`

## Success Criteria

This packet is successful if:

1. The authenticated validate-request endpoint returns structured content.
2. The result clearly records accepted or rejected.
3. The result preserves non-execution safety fields.
4. No execution is started.
5. No runner start endpoint is contacted.
6. No approval is consumed.

## Non-goals

This packet does not authorize execution.

This packet does not start OpenCode.

This packet does not implement the runner start path.

This packet does not consume approval.

This packet does not admit model output.
