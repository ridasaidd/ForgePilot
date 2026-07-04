# FP-MCP-343 — Host Block at Guarded Wrapper After Approval Validation

## Status

READY

## Type

Host Boundary Characterization

## Purpose

Record that ChatGPT-hosted MCP allowed validation of an already-committed approval but blocked the subsequent guarded next-gate wrapper call before ForgePilot returned a result.

## Observed Background

FP-MCP-341 approval was recorded and committed:

- approval packet: FP-MCP-341
- approval id: APPROVAL-20260704T215206506Z-dca4db2d
- approval artifact: runs/FP-MCP-341/approvals/APPROVAL-20260704T215206506Z-dca4db2d.json
- approval artifact sha256: 22de88e633354d7705952795b3d5b80d9506c5f05fc4fe9e664b1abede562cbe

The approval validation call was allowed by the host and returned:

- approvalEvidenceValid: true
- approvalValid: true
- approvalUsableForExecution: true
- approvalConsumed: false
- artifactCommitted: true
- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false
- reasons: []

## Trigger Observation

The next attempted ChatGPT-hosted MCP call to `forgepilot_apply_guarded_canary_next_gate` was blocked by the host before ForgePilot returned a wrapper result.

No ForgePilot result fields were available for:

- applied
- phase
- previewOnly
- followOnApplied
- nextRequiredGate
- nextToolName
- filesWritten
- approvalConsumed
- runnerStartEndpointContacted
- opencodeStarted
- guardedCanaryRun
- reasons

## Interpretation

The current host boundary appears around guarded wrapper invocation after a valid approval has been established.

Earlier evidence showed the same wrapper could be invoked for preview in a fresh/narrow context, so the block remains context-sensitive rather than a static tool ban.

## Boundary

No wrapper result was returned.

No clearance was created.

No enablement was created.

No approval was consumed.

No runner start endpoint was contacted by ForgePilot.

OpenCode was not started.

No token value was handled or printed.

## Result

The ChatGPT-hosted path is useful for evidence, status, approval recording, validation, and some wrapper preview characterization, but it is unreliable for late-gate guarded wrapper progression.

Late-gate progression should use either a very narrow fresh-session probe or the local operator/client path while preserving ForgePilot gates.
