# Platform Tool Block Pattern

## Status

```text
OPEN_OPERATIONAL_PATTERN
```

## Summary

Across recent ForgePilot MCP work, some ChatGPT-to-MCP tool invocations were blocked before reaching the MCP bridge.

This must be distinguished from bridge behavior.

```text
platform block before bridge invocation != bridge safety gate failure
platform block before bridge invocation != bridge implementation failure
```

## Observed instances

```text
FP-017: evidence staging around verification artifact was blocked by tooling.
FP-020: trivial status/check commands were temporarily blocked after verification/backfill.
SHADOW-REF-006: one large combined staging/commit command was blocked and had to be split.
FP-026: combined evidence writing was blocked, an initial live control action was blocked, and a descriptive commit/verification command was blocked.
FP-MCP-187: primary FP-MCP-183 request-artifact creation was blocked before ForgePilot while preparing the first fresh tuple for enablement-adjacent canary work.
```

## Distinct enablement-adjacent category

FP-MCP-187 is not classified as the same standing evidence-recording tool-block pattern as FP-017, FP-020, SHADOW-REF-006, or the evidence-writing portions of FP-026.

It occurred on the first primary MCP call to create a fresh non-executing request artifact for FP-MCP-183, immediately before any real consuming-action tuple could be assembled:

```text
forgepilot_create_opencode_run_request
packetId: FP-MCP-183
modelId: deepseek-v4-pro-high
runMode: DESIGN_ONLY
approval: CREATE_REQUEST_ARTIFACT
```

The block happened before ForgePilot received the call. No request artifact was created, no approval was created or consumed, no runner start endpoint was contacted, no OpenCode process was started, and no FP-027 canary ran.

This category must preserve a separate interpretation:

```text
ENABLEMENT_ADJACENT_REQUEST_CREATION_PLATFORM_BLOCK
```

The trigger is unresolved. It may still be benign platform-tooling behavior, but it may also be content/classifier-driven because the call shape is adjacent to granting an AI execution system a fresh request tuple. That possibility must not be erased by filing it under generic evidence-recording flakiness.

Handling rule for this category:

```text
1. Do not retry by rephrasing or restructuring the same request to avoid the trigger.
2. Do not manually construct the request artifact as a bypass for a blocked primary MCP path.
3. A same-content retry may be recorded only as a later observation, not as proof that the first block was benign.
4. Treat the platform block as a safety-relevant observation until its trigger is understood.
5. Keep FP-MCP-183 enablement closed unless an explicit future packet and operator authorization clear the boundary.
```

## Current hypothesis

The trigger is unresolved.

Plausible contributors:

```text
cadence / rapid sequencing after action refresh
rapid back-to-back tool calls
multiple terminal operations combined into a single tool invocation
large combined command shape
sensitive process-control terminology in command text, rationale, path names, or action schema
interaction between action discovery and immediate invocation
intermittent platform-side policy evaluation
```

Operator observation added by FP-MCP-189: rapid tool calls or multi-operation terminal batches sometimes appear to trigger the platform safety check. This is a plausible explanation for many generic platform-tool blocks, but it does not by itself explain or downgrade FP-MCP-187 because that block happened on the enablement-adjacent request-creation path and remains separately classified until understood.

No single cause has been isolated.

## Handling rule

When this pattern appears:

```text
1. Do not treat it as evidence that the MCP bridge failed.
2. Do not silently retry and erase the observation.
3. Prefer smaller commands and neutral wording when recording evidence.
4. Add cadence spacing before sensitive live action probes.
5. Record whether the block happened before or after the bridge received the call.
6. Keep bridge-level safety findings separate from platform-tooling findings.
```

## Evidence-quality rule

One later successful call does not prove cadence was the root cause.

It only proves the block did not reproduce for that attempt.

The trigger remains:

```text
PLATFORM_TOOL_BLOCK_UNRESOLVED_TRIGGER
```

## Additional FP-027 observation

During FP-027 pre-spec work, platform-side blocks also affected read-only policy/status calls and a combined status check.

This weakens any hypothesis that the pattern is limited to large write commands.

It remains compatible with timing/cadence, content/schema sensitivity, and intermittent platform-side evaluation.
