# SHADOW-REF-007 Result Summary

## Result

```text
TOOL_CONTRACT_ACCEPTANCE_TEMPLATE_DEFINED
```

## Purpose

SHADOW-REF-007 defines the acceptance template for future executor-driven MCP bridge shadow-extraction packets.

## Baseline requirement

Future extraction packets must reference the SHADOW-REF-006 baseline:

```text
bridge commit: 3a16d68
src/server.ts sha256: 8412f3a74973a4ca6740a89581e0ea9476f5d01d35f5207f3193ebfee825ba1e
registered MCP tools: 29
baseline evidence tier: TIER_2_VERIFIED_ARTIFACT_STATIC_SOURCE_PARSE
```

Future packets must not silently re-baseline.

## Executor boundary

```text
ChatGPT: packet writer, scope controller, reviewer, admission controller
OpenCode executor: implementation worker
ForgePilot: evidence ledger and observatory
```

Future code-moving extraction packets must be executor-driven. ChatGPT must not directly edit bridge source files for implementation packets except to record packets, prompts, verification artifacts, audits, or admission results.

## Required checks

Future extraction packets must prove:

```text
registered MCP tool count unchanged unless explicitly scoped
registered MCP tool names unchanged unless explicitly scoped
tool descriptions unchanged unless explicitly scoped
tool input schemas unchanged unless explicitly scoped
tool output/result shape unchanged unless explicitly scoped
build passes
test passes
bridge working tree clean before executor starts
bridge working tree clean after final commit/evidence capture
```

## Admission rule

A future extraction packet may be admitted only if it references the SHADOW-REF-006 baseline hash, includes a committed executor instruction, is executor-implemented, passes build/test, preserves or explicitly scopes tool-contract changes, matches declared file-movement scope, avoids live entrypoint/service changes, and records evidence through the V1-O canonical evidence path.

## Boundary

No bridge source files were modified. No OpenCode worker was started. No MCP behavior changed.
