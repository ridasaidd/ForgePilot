# FP-MCP-160 — Structured Human Approval UX Dry-Run Test

## Task

Test whether a structured MCP tool confirmation can serve as the user experience model for ForgePilot human approval.

## Goal

Evaluate the UX pattern before migrating from exact-text approval to structured approval.

FP-MCP-160 answers one question:

> Can the approval flow be represented as a fixed structured tool call that the human approves in the popup, without requiring manual exact-text copy/paste?

## Test Method

Use the existing non-authorizing dry-run fixture tool:

```text
forgepilot_record_human_approval_evidence_dry_run_fixture
```

This tests the structured popup shape without creating real execution approval.

## Target Scope

```text
approval packet: FP-MCP-160
execution packet under test: FP-MCP-159
requestId: REQ-20260702T143631238Z-4e3b750e
modelId: deepseek-v4-pro-high
runMode: DESIGN_ONLY
repoCommit: daed3e6
branch: main
```

## Safety Boundary

The test must not:

```text
enable execution
start OpenCode
contact the runner start endpoint
consume approval
mutate FP-MCP-159 request artifact
change bridge source
change runner source
```

The result must be classified as UX evidence only.

## Success Criteria

1. The tool confirmation presents enough structured scope for a human to understand what is being approved.
2. The created artifact is explicitly non-authorizing.
3. The artifact cannot be used as real approval for execution.
4. Preflight remains blocked after the dry-run fixture.
5. The result is recorded through V1-O.

## Non-Goals

FP-MCP-160 does not implement the final structured approval tool.

It only tests whether the structured-approval popup interaction is viable before migration.
