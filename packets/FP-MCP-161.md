# FP-MCP-161 — Structured Scoped Approval Tool Contract

## Task

Define the contract for a structured scoped human approval MCP tool.

## Goal

Replace brittle exact-text approval with a structured create-only approval action whose confirmation popup shows the exact execution scope being approved.

FP-MCP-161 answers one question:

> What must a structured approval tool guarantee before ForgePilot can migrate away from manual exact approval text?

## Background

FP-MCP-160 proved the structured popup UX pattern is promising but the existing dry-run fixture is not migration-ready.

The existing fixture remained safe, but it hardcoded the execution scope packet to `FP-MCP-036` instead of preserving the intended target packet `FP-MCP-159`.

FP-MCP-161 therefore requires explicit separation between:

```text
approval recorder packet
execution target packet
request id
model id
run mode
repository commit
branch
expiration
single-use flag
```

## Proposed Tool Name

```text
forgepilot_record_structured_human_approval
```

## Tool Purpose

Create a real but non-consuming human approval evidence artifact from structured fields shown in the MCP confirmation popup.

The tool must not require the user to paste canonical approval text.

The human approval gesture is the approval of this exact scoped MCP tool call.

## Required Inputs

```text
approvalPacketId: string
executionPacketId: string
requestId: string
modelId: string
runMode: string
repoCommit: string
branch: string
expiresAt: ISO-8601 UTC timestamp
operatorId: non-secret string
singleUse: true
approval: RECORD_STRUCTURED_HUMAN_APPROVAL
```

Optional non-secret fields:

```text
operatorHandle
operatorEmailHash
notes
```

## Required Validation

The tool must fail closed unless all of the following hold:

1. `approvalPacketId` is a valid packet id and packet exists.
2. `executionPacketId` is a valid packet id and packet exists.
3. `requestId` exists under `runs/<executionPacketId>/opencode-requests/`.
4. Request artifact `packetId` exactly equals `executionPacketId`.
5. Request artifact `requestId` exactly equals `requestId`.
6. Request artifact model id exactly equals `modelId`.
7. Request artifact run mode exactly equals `runMode`.
8. Request artifact commit lineage is valid and artifact is committed.
9. `repoCommit` is a reachable committed repository commit.
10. Current repository tree is clean.
11. `expiresAt` is in the future and within a bounded maximum lifetime.
12. `singleUse` is exactly true.
13. No existing unexpired approval for the same exact scope is already recorded unless duplicate handling is explicitly append-only and non-authorizing.

## Artifact Location

The approval artifact must be written under the approval recorder packet:

```text
runs/<approvalPacketId>/approvals/<approvalId>.json
```

It must contain the execution target scope separately:

```json
{
  "approvalPacketId": "FP-MCP-161",
  "executionScope": {
    "packetId": "FP-MCP-159",
    "requestId": "REQ-...",
    "modelId": "deepseek-v4-pro-high",
    "runMode": "DESIGN_ONLY",
    "repoCommit": "...",
    "branch": "main"
  }
}
```

## Required Artifact Semantics

The artifact must state:

```text
humanApprovalRecorded: true
approvalState: RECORDED
approvalUsableForExecution: false until independently validated
approvalConsumed: false
singleUse: true
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

## Required Non-Behavior

The tool must not:

```text
enable execution
consume approval
contact runner start endpoint
start OpenCode
mutate request artifacts
override global disable switch
override scoped enablement policy
change bridge source
change runner source
```

## Canonical Text Handling

The tool may generate canonical approval text internally for compatibility with existing validators.

However, the user must not be required to type or paste that text.

Any generated text must be derived from the same structured fields displayed in the popup.

## Popup UX Requirement

The confirmation prompt must show enough structure for the human to understand the exact approval scope:

```text
approval recorder packet
execution packet
request id
model id
run mode
repository commit
branch
expiration
single-use true
non-overrides: disable switch, scoped enablement, runner safety gates
```

## Validation Compatibility

Existing `forgepilot_validate_human_approval_record` must be able to validate the artifact against the expected execution scope.

If the existing validator cannot support this artifact shape, FP-MCP-161 implementation must include validator updates and tests.

## Tests Required For Implementation

1. Correct structured approval creates artifact with exact target scope.
2. Artifact validates against the intended execution scope.
3. Artifact does not validate against a different packet id.
4. Artifact does not validate against a different request id.
5. Artifact does not validate against a different commit.
6. Artifact does not validate if expired.
7. Artifact does not validate if singleUse is false or missing.
8. Tool refuses dirty tree.
9. Tool refuses uncommitted request artifact.
10. Tool refuses missing execution packet.
11. Tool refuses missing approval packet.
12. Tool does not enable execution.
13. Tool does not consume approval.
14. Tool does not contact runner start endpoint.
15. Tool does not start OpenCode.
16. Guarded preflight still blocks on global disable after approval recording.
17. Approval consumption remains append-only and separate.

## Admission Rule

Admit implementation only if the structured approval tool creates exact-scope real approval evidence without starting or enabling execution, and validation proves the artifact is usable only for the exact intended scope.

## Non-Goals

FP-MCP-161 does not implement execution enablement.

FP-MCP-161 does not start FP-MCP-159.

FP-MCP-161 does not replace approval consumption.

FP-MCP-161 does not change the global disable switch.
