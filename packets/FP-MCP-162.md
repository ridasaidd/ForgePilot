# FP-MCP-162 — Structured Scoped Approval Tool Implementation

## Task

Implement the structured scoped human approval MCP tool defined by FP-MCP-161.

## Goal

Add a create-only MCP tool that records real human approval evidence from structured popup-confirmed fields without requiring manual exact-text paste.

## Tool Name

```text
forgepilot_record_structured_human_approval
```

## Scope

Bridge implementation only.

Allowed source changes are limited to the minimum files required to expose the tool and support validation-compatible structured approval evidence.

## Safety Boundary

The implementation must not:

```text
enable execution
consume approval
contact runner start endpoint
start OpenCode
mutate request artifacts
override global disable switch
override scoped enablement policy
change runner behavior
change OAuth/Auth0 behavior
```

## Required Behavior

The tool must accept structured fields:

```text
approvalPacketId
executionPacketId
requestId
modelId
runMode
repoCommit
branch
expiresAt
operatorId
singleUse: true
approval: RECORD_STRUCTURED_HUMAN_APPROVAL
```

It must create a real but non-consuming approval artifact under:

```text
runs/<approvalPacketId>/approvals/<approvalId>.json
```

The artifact must bind to the execution target scope exactly and remain separate from approval consumption.

## Required Verification

1. Tool is exposed in source.
2. Typecheck passes.
3. Tests pass if available.
4. Tool creates exact-scope approval evidence without starting execution.
5. Existing human approval validator accepts the artifact for the exact intended scope.
6. Guarded preflight remains blocked by global disable/scoped execution gates after approval recording.
7. No OpenCode process starts.

## Admission Boundary

Admit only if the implementation proves create-only exact-scope approval recording and no execution side effects.
