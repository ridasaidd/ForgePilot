# FP-MCP-255 — HTTP Lifecycle Request Artifact Adapter

## Checkpoint Type

```text
HTTP_LIFECYCLE_REQUEST_ADAPTER_RESULT
```

## Summary

The FP-MCP-255 read-only HTTP lifecycle request adapter was implemented, exposed, and verified. A fresh non-executing request artifact was recorded for FP-MCP-254 with modelId=deepseek-v4-pro-high and runMode=DESIGN_ONLY, producing requestId REQ-20260703T231957999Z-32fcb25f. The request artifact was committed as supporting evidence at ForgePilot commit 7b9ba35. The adapter then read that request artifact, validated request identity, requested model, requested run mode, CREATED_NOT_STARTED state, and bounded prompt policy, and returned lifecyclePlanReady=true. The adapter bound promptText=Return exactly: OPENCODE_HTTP_CANARY_OK and expectedText=OPENCODE_HTTP_CANARY_OK by SHA-256, returned lifecycleToolName=forgepilot_run_opencode_http_lifecycle_orchestrator, lifecycleApprovalRequired=RUN_OPENCODE_HTTP_LIFECYCLE_ORCHESTRATOR, lifecycleCleanupDefault=true, and confirmed executionAuthorized=false, approvalConsumed=false, runnerStartEndpointContacted=false, opencodeStarted=false, and lifecycleInvoked=false.

## Claim

```text
FP_MCP_255_HTTP_LIFECYCLE_REQUEST_ADAPTER_PLANNED_VALID_REQUEST_WITHOUT_LIFECYCLE_INVOCATION
```

## Caveats

- The adapter is plan-only and does not invoke the lifecycle orchestrator.
- The request artifact used for verification was intentionally created as non-executing evidence for this adapter test.
- The adapter binds prompt and expected text by hash but does not persist a separate lifecycle plan artifact yet.
- The current request artifact schema does not carry prompt text itself, so bounded promptText and expectedText are adapter inputs.

## Boundaries

- No OpenCode session was created by the adapter.
- No prompt was submitted by the adapter.
- No wait endpoint was called by the adapter.
- No session was deleted by the adapter.
- No OpenCode process was started by the adapter.
- No runner start endpoint was contacted by the adapter.
- No approval was consumed by the adapter.
- No lifecycle was invoked by the adapter.

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
FP_MCP_255_HTTP_LIFECYCLE_REQUEST_ADAPTER_PLANNED_VALID_REQUEST_WITHOUT_LIFECYCLE_INVOCATION
```
