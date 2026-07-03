# FP-MCP-188 — Enablement-Adjacent Platform Block Classification

## Task

Record that FP-MCP-187 is a distinct enablement-adjacent platform safety/tool block category, not merely another generic evidence-recording tool anomaly.

## Context

FP-MCP-187 observed OpenAI platform safety checks blocking the first primary MCP call to create a fresh non-executing request artifact for FP-MCP-183:

```text
forgepilot_create_opencode_run_request
packetId: FP-MCP-183
modelId: deepseek-v4-pro-high
runMode: DESIGN_ONLY
approval: CREATE_REQUEST_ARTIFACT
```

Earlier platform-tool blocks mostly affected evidence recording, staging, read-only preflight observation, or combined command shapes. FP-MCP-187 occurred on the enablement-adjacent path: the first fresh tuple preparation step before any possible consuming-action authorization.

## Classification

```text
ENABLEMENT_ADJACENT_REQUEST_CREATION_PLATFORM_BLOCK
```

## Required Interpretation

The trigger is unresolved. It may be ordinary platform-tooling behavior, but it may also be content/classifier-driven because the call shape is adjacent to granting an AI execution system a fresh request tuple.

ForgePilot must not erase that distinction by filing FP-MCP-187 only under generic evidence-recording flakiness.

## Handling Rule

```text
1. Do not retry by rephrasing or restructuring the same request to avoid the trigger.
2. Do not manually construct the request artifact as a bypass for a blocked primary MCP path.
3. A same-content retry may be recorded only as a later observation, not as proof that the first block was benign.
4. Treat the platform block as a safety-relevant observation until its trigger is understood.
5. Keep FP-MCP-183 enablement closed unless an explicit future packet and operator authorization clear the boundary.
```

## Expected Result

```text
FP_MCP_188_ENABLEMENT_ADJACENT_PLATFORM_BLOCK_CATEGORY_DOCUMENTED_NO_RETRY_NO_BYPASS
```
