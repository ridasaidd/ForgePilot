# FP-MCP-342 — Host Block Recurs After Late-Gate Progression

## Status

READY

## Type

Host Boundary Characterization

## Purpose

Record that ChatGPT-hosted MCP blocking recurred after a fresh session progressed through multiple late-stage guarded wrapper probes.

## Observed Background

Earlier in the fresh session, the following were allowed by the host:

- ForgePilot status
- OpenCode read-only status
- disable-switch observer
- execution enablement observer
- checkpoint recording
- read-only sequencer with the real FP-MCP-295 tuple
- approval recording
- approval validation
- guarded wrapper invocation at clearance preview
- guarded wrapper invocation with expired approval
- guarded wrapper preview with fresh approval
- implementation inspection and contract clarification

## Trigger Observation

During FP-MCP-341, a fresh approval was recorded and committed:

- approval packet: FP-MCP-341
- approval id: APPROVAL-20260704T215206506Z-dca4db2d
- approval artifact: runs/FP-MCP-341/approvals/APPROVAL-20260704T215206506Z-dca4db2d.json
- approval artifact sha256: 22de88e633354d7705952795b3d5b80d9506c5f05fc4fe9e664b1abede562cbe
- commit: 7e4f574

The next attempted ChatGPT-hosted MCP call to validate that approval was blocked by the host before ForgePilot returned a validation result.

## Interpretation

The block is not tied to the validation tool alone, because the same validation tool succeeded earlier.

The likely factor is accumulated session context and late-gate progression toward clearance creation.

This supports the model that ChatGPT-hosted MCP calls may become blocked after repeated execution-adjacent gate progression, even when individual tools are non-final and previously allowed.

## Boundary

No validation result was returned for FP-MCP-341.

No clearance was created.

No enablement was created.

No approval was consumed.

No runner start endpoint was contacted.

OpenCode was not started.

No token value was handled or printed.

## Result

The operational boundary for ChatGPT-hosted MCP is dynamic and context-sensitive.

For final or late-gate execution-path tests, use either:

- a newly fresh ChatGPT session for each narrow probe, or
- the local operator/client path while preserving ForgePilot gates.
