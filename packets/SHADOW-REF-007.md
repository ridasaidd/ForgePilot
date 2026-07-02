# SHADOW-REF-007 — Tool-Contract Acceptance Template

## Task

Define the acceptance template for future MCP bridge shadow-extraction packets.

## Goal

Ensure that every future code-moving shadow-refactor packet proves tool-contract preservation against the SHADOW-REF-006 baseline before evidence may be admitted.

SHADOW-REF-007 answers one question:

> What must an executor-driven bridge extraction prove before ForgePilot can accept it as behavior-preserving shadow refactor evidence?

## Baseline Required

All future extraction packets must reference the SHADOW-REF-006 baseline:

```text
bridge commit: 3a16d68
src/server.ts sha256: 8412f3a74973a4ca6740a89581e0ea9476f5d01d35f5207f3193ebfee825ba1e
src/server.ts lines: 10364
src/server.ts bytes: 328906
registered MCP tools: 29
baseline evidence tier: TIER_2_VERIFIED_ARTIFACT_STATIC_SOURCE_PARSE
```

Future packets must not silently replace this baseline by deriving a fresh pre-extraction hash.

## Executor Boundary

Future code-moving extraction packets must be executor-driven.

```text
ChatGPT: packet writer, scope controller, reviewer, admission controller
OpenCode executor: implementation worker
ForgePilot: evidence ledger and observatory
```

ChatGPT must not directly edit bridge source files for implementation packets except to record packets, prompts, verification artifacts, audits, or admission results.

## Required Acceptance Sections

Every future extraction packet must include these sections:

1. Baseline reference
2. Extraction scope
3. Forbidden changes
4. Executor instruction artifact
5. Expected file movement
6. Tool-contract preservation checks
7. Verification commands
8. Diff review requirements
9. Evidence artifact list
10. Admission decision rule

## Required Tool-Contract Checks

At minimum, each extraction packet must prove:

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

Because SHADOW-REF-006 used static parsing, the default comparison tier for tool registration checks is:

```text
TIER_2_VERIFIED_ARTIFACT_STATIC_SOURCE_PARSE
```

A future live enumeration may be added, but it must be separately labeled and must not be confused with static parsing.

## Required Baseline Comparison Artifacts

Future extraction packets must produce:

```text
pre-extraction bridge state
post-extraction bridge state
baseline hash reference
post-extraction source hash snapshot
registered tool diff
source-surface diff
build output
test output
executor result
review/admission summary
```

## Admission Rule

A future extraction packet may be admitted only if:

```text
1. The packet explicitly references SHADOW-REF-006 baseline hash.
2. The executor instruction is committed as an artifact.
3. The implementation is performed by an executor, not direct manual source editing by ChatGPT.
4. Tool-contract diff is unchanged, or every change is explicitly in scope.
5. Build and test pass.
6. The bridge source diff matches the declared extraction scope.
7. No live entrypoint switch occurs.
8. No service restart occurs unless explicitly scoped and separately approved.
9. Evidence is recorded through the V1-O canonical evidence_record admission path.
```

## Rejection Rule

A future extraction packet must be rejected or quarantined if:

```text
baseline hash is omitted
baseline hash is silently replaced
registered tool names change without scope approval
schemas/descriptions/result shapes drift without scope approval
build or test fails
executor modifies files outside declared scope
ChatGPT directly performs implementation edits
live bridge behavior changes without explicit scope
verification artifacts are missing or non-reproducible
```

## Non-Goals

This packet does not move bridge code, create an OpenCode worker, run model execution, alter MCP behavior, or perform the first extraction.

## Acceptance Criteria

1. Template requires SHADOW-REF-006 baseline hash reference.
2. Template requires executor-driven implementation for code-moving packets.
3. Template defines required tool-contract checks.
4. Template defines static-parse evidence tier correctly.
5. Template defines admission and rejection rules.
6. No bridge source files are modified.
7. Final ForgePilot and bridge statuses are clean.
