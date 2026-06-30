# FP-MCP-084 — Create Response Summary Boundary Normalization

## Task

Normalize the response summary returned by `forgepilot_create_opencode_run_request` so it does not disagree with the durable FP-MCP-083 request artifact boundary fields.

## Goal

Ensure the MCP tool response summary preserves the same boundary distinction as the durable evidence artifact:

- `boundaryVersion` records the governing execution-safety/request boundary.
- `implementationBoundaryVersion` records the implementation packet that introduced the expanded artifact contract.

## Background

FP-MCP-083 verified that the durable OpenCode request artifact now emits the expanded contract correctly.

The durable artifact records:

- `schemaVersion: FP-MCP-083`
- `artifactType: opencode-start-request`
- `requestState: CREATED_NOT_STARTED`
- `boundaryVersion: FP-MCP-081`
- `implementationBoundaryVersion: FP-MCP-083`

A non-blocking observation remains:

- The create response summary returned `boundaryVersion: FP-MCP-083`.
- The durable artifact correctly returned `boundaryVersion: FP-MCP-081` and `implementationBoundaryVersion: FP-MCP-083`.

The durable artifact is the evidence-bearing object and already passed validation. This packet only normalizes the response summary.

## Scope

Allowed:

- Update the `forgepilot_create_opencode_run_request` response summary shape.
- Ensure response summary includes:
  - `boundaryVersion`
  - `implementationBoundaryVersion`
- Make `boundaryVersion` in the response summary match the durable artifact governing boundary.
- Add or update tests for response summary boundary fields.
- Record verification artifacts under `runs/FP-MCP-084/`.

Forbidden:

- Do not change the FP-MCP-083 durable artifact contract.
- Do not remove FP-MCP-007 legacy compatibility.
- Do not enable execution.
- Do not relax the global disable switch.
- Do not contact the runner start endpoint.
- Do not start OpenCode.
- Do not create a runner run id.
- Do not consume approval.
- Do not create real approval evidence.
- Do not mutate approval evidence.
- Do not broaden architecture.

## Required Behavior

After this packet, `forgepilot_create_opencode_run_request` should return a response summary with:

- `boundaryVersion: FP-MCP-081`
- `implementationBoundaryVersion: FP-MCP-083`

The durable artifact should continue to contain:

- `schemaVersion: FP-MCP-083`
- `artifactType: opencode-start-request`
- `requestState: CREATED_NOT_STARTED`
- `boundaryVersion: FP-MCP-081`
- `implementationBoundaryVersion: FP-MCP-083`
- `legacyCompatibility.schemaVersion: FP-MCP-007`

## Verification

Verification must show:

- Typecheck passes.
- Tests pass.
- Creating a non-executing OpenCode request artifact still works.
- Reading the created artifact still returns the FP-MCP-083 durable artifact contract.
- The create response summary now matches the durable boundary distinction.
- Execution remains disabled.
- No runner start endpoint is contacted.
- OpenCode is not started.

## Evidence

Record:

- `runs/FP-MCP-084/executor-result.md`
- `runs/FP-MCP-084/verification.txt`
- Any request artifact created during verification, if applicable.

## Success Criteria

This packet is successful only if:

1. The create response summary reports `boundaryVersion: FP-MCP-081`.
2. The create response summary reports `implementationBoundaryVersion: FP-MCP-083`.
3. The durable artifact remains FP-MCP-083 compliant.
4. FP-MCP-007 legacy compatibility remains present.
5. No execution is started.
6. No runner start endpoint is contacted.
