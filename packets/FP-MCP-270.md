# FP-MCP-270 — Popup Approval Surface Feasibility and Verification Fork

## Checkpoint Type

```text
FEASIBILITY_VERIFICATION_RESULT
```

## Summary

Record the fork requested after FP-MCP-269. The currently exposed forgepilot_create_operator_local_execution_clearance tool schema includes exact scoped arguments such as executionPacketId, requestId, approvalPacketId, approvalId, modelId, runMode, targetExecutionCommit, executionBaseCommit, requestArtifactCommit, branch, targetWorkspaceId, expiresInMinutes, and an explicit approval literal. However, this only proves that the data exists in the MCP tool contract. It does not prove that the ChatGPT/MCP approval popup renders these fields visibly, legibly on mobile, or with the behavioral friction required by FP-MCP-269. No clearance creation was attempted, and the assistant has no in-band way to observe the user's actual approval popup UI. Therefore the true current path is neither fully implemented compliance nor safe silent assumption: before FP-027 canary planning, either implement/verify a compliant pre-approval display path, or record an explicit risk exception/platform limitation if the approval UI cannot be customized.

## Claim

```text
FP-MCP-270 confirms that FP-MCP-269's popup human-attention requirements are not yet proven satisfied by the current ChatGPT/MCP approval surface: the clearance tool contract exposes many required fields, but the assistant/MCP server cannot directly verify the actual popup rendering or friction, so FP-027 planning must not assume compliance without a later implementation/verification or explicit risk exception.
```

## Caveats

- This packet does not create or test a real clearance approval popup, because doing so would require a clearance-creating action and may write local clearance state.
- This packet does not prove the platform popup is deficient; it proves only that compliance is unverified from the available MCP/tool evidence.
- The clearance tool argument schema contains many required FP-MCP-269 fields, but schema availability is not equivalent to popup visibility or mobile legibility.
- The assistant/MCP server cannot directly see the operator's ChatGPT approval popup rendering, so human-observed UI evidence or a separate pre-approval preview/control mechanism is required for positive verification.
- FP-027 guarded-runner-start canary planning must not assume FP-MCP-269 is satisfied until this gap is resolved or explicitly accepted as risk.

## Boundaries

- execution authorized: false
- approval created: false
- approval consumed: false
- local clearance created: false
- runner start endpoint contacted: false
- OpenCode started: false
- OpenCode HTTP session created: false
- prompt submitted: false
- wait endpoint called: false
- disable switch cleared: false
- FP-027 canary run: false
- popup UI modified: false
- clearance popup invoked: false

## Non-Execution Boundary

```text
execution authorized: false
approval consumed: false
disable switch cleared: false
runner start endpoint contacted: false
OpenCode started: false
FP-027 canary run: false
```

## Expected Result

```text
FP-MCP-270 confirms that FP-MCP-269's popup human-attention requirements are not yet proven satisfied by the current ChatGPT/MCP approval surface: the clearance tool contract exposes many required fields, but the assistant/MCP server cannot directly verify the actual popup rendering or friction, so FP-027 planning must not assume compliance without a later implementation/verification or explicit risk exception.
```
