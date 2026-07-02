# SHADOW-REF-008 — First Executor-Driven Shadow Extraction Attempt

## Task

Attempt the first small MCP bridge shadow extraction through the OpenCode executor path rather than direct ChatGPT source editing.

## Goal

Prove whether the executor handoff path is ready for bridge code movement under the SHADOW-REF acceptance template.

SHADOW-REF-008 answers one question:

> Can the first bridge extraction be started through OpenCode under the SHADOW-REF-007 acceptance rules?

## Baseline Required

This attempt is bound to the SHADOW-REF-006 baseline:

```text
bridge commit: 3a16d68
src/server.ts sha256: 8412f3a74973a4ca6740a89581e0ea9476f5d01d35f5207f3193ebfee825ba1e
registered MCP tools: 29
baseline evidence tier: TIER_2_VERIFIED_ARTIFACT_STATIC_SOURCE_PARSE
```

## Executor Boundary

Implementation must be performed by OpenCode.

ChatGPT must not directly edit bridge source files.

## Intended Extraction Scope

No source extraction is authorized until OpenCode executor preflight succeeds.

If preflight succeeds, the first extraction must be small, shadow-only, and behavior-preserving.

## Failure Disposition

If executor preflight fails before implementation starts, record:

```text
EXECUTOR_HANDOFF_BLOCKED_NO_EXTRACTION
```

This is valid evidence of a blocked handoff, not evidence of successful extraction.

## Acceptance Criteria

Either:

```text
EXECUTOR_EXTRACTION_COMPLETED_AND_VERIFIED
```

or:

```text
EXECUTOR_HANDOFF_BLOCKED_NO_EXTRACTION
```

must be recorded with artifacts.

No bridge source files may be modified unless a valid executor starts under the SHADOW-REF-007 acceptance template.
