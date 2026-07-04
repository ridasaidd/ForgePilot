# FP-MCP-325 — ChatGPT Tool Boundary Characterization

## Status

READY

## Type

Debug / Boundary Characterization

## Purpose

Characterize ChatGPT-hosted MCP tool blocking behavior observed during guarded ForgePilot execution-path work.

This packet does not attempt to bypass host safety controls. It records observed platform behavior so ForgePilot can distinguish between:

- ForgePilot gate failures
- MCP bridge failures
- host-platform tool-call blocks
- local operator authentication failures

## Observed Background

The following behavior was observed before this packet:

1. `forgepilot_status` succeeded through ChatGPT MCP.
2. A read-only execution-context observer call was blocked before reaching MCP.
3. A packet checkpoint recording call with execution-boundary wording was blocked before reaching MCP.
4. A minimized packet checkpoint recording call was also blocked before reaching MCP.

## Hypothesis

The block may be triggered by one or more of:

- MCP tool capability class
- recent conversation context
- execution-boundary semantics
- argument content
- repeated progression toward a sensitive action
- session-level accumulated risk

## Debug Plan

Run only non-executing characterization tests.

Stop immediately after any platform safety block.

Do not call final runner-start tools.

Do not consume approvals.

Do not clear execution controls.

Do not handle or print tokens.

## Test Matrix

| Test | Description | Expected Safety |
|---|---|---|
| A | General `forgepilot_status` | Allowed |
| B | Minimal non-mutating observer with empty arguments | Unknown |
| C | Same observer with packet id only | Unknown |
| D | Same observer with request/model/run-mode tuple | Likely blocked |
| E | Mutating packet checkpoint with neutral wording | Observed blocked |
| F | Mutating packet checkpoint with execution-boundary wording | Observed blocked |

## Scope Boundary

This packet records host-platform behavior only.

It does not modify the MCP bridge.

It does not modify ForgePilot execution policy.

It does not authorize local execution.

It does not weaken any gate.

## Success Criteria

This packet succeeds if it preserves a clear evidence record of the observed ChatGPT tool-boundary behavior and defines a safe characterization matrix for future sessions.
