# FP-MCP-362 Plan Record Evidence

## Result

Recorded the guarded sequencer refactor and MCP conformance plan.

## Plan Path

- docs/mcp/guarded-sequencer-refactor-plan.md

## Purpose

The plan governs future guarded sequencer work after the inline MCP registration extraction series.

## Required Future Order

1. Diagnose guarded sequencer false-positive next-gate behavior.
2. Implement the minimal correction based on diagnostic evidence.
3. Build, restart, and runtime-validate the MCP bridge.
4. Preserve MCP/OpenAI conformance standards throughout.

## Governing Invariant

A next gate may be reported only if all prerequisite evidence for that exact tuple is present, current, unexpired, and positively valid.

Absence, mismatch, expiry, stale state, or fallback defaults must produce a blocked or needs-evidence state, not an actionable next gate.

## MCP/OpenAI Conformance Principle

Tool descriptors guide the model. Runtime guards constrain the server. Artifacts record what happened. Contract checks prove surface stability. Runtime diagnostics prove safe-boundary preservation.

Annotations and descriptions are not authorization.

## Boundary

No bridge source changes, OpenCode start, runner start contact, approval consumption, disable-switch clearing, or canary run occurred.
