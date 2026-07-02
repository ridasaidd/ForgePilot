# SHADOW-REF-006 — Capture Baseline Bridge Verification

## Task

Capture the current ForgePilot ChatGPT MCP bridge baseline before any shadow refactor code movement resumes.

## Goal

Create committed baseline evidence for the bridge source state, build/test result, and tool-contract surface so future shadow refactor packets can prove behavior did not drift.

SHADOW-REF-006 answers one question:

> What is the current verified baseline of the MCP bridge before shadow refactor resumes?

## Scope

Capture:

```text
bridge branch
bridge commit
bridge clean status
package scripts
source layout
server.ts size/hash
source file hashes
build/test output
exported source surface snapshot
MCP tool registration snapshot where statically inspectable
```

## Evidence Tier Boundary

Baseline artifacts captured by terminal commands and deterministic scripts are treated as:

```text
TIER_2_VERIFIED_ARTIFACT
```

when they are generated from the bridge repository at the recorded commit.

Human summaries in this packet are only indexes over the generated artifacts and must not override generated output.

## Safety Requirements

This packet must not move bridge code, edit bridge source files, change live MCP behavior, restart services, alter OAuth/Auth0 settings, execute OpenCode workers, or perform a live entrypoint switch.

## Non-Goals

This packet does not refactor `server.ts`, extract modules, change tool contracts, modify transport/auth behavior, or admit model-quality evidence.

## Acceptance Criteria

1. Bridge branch and commit are recorded.
2. Bridge working tree cleanliness is recorded.
3. Bridge package scripts are recorded.
4. Bridge source layout and file hashes are recorded.
5. `src/server.ts` size/hash is recorded.
6. Build/test output is captured.
7. Tool-contract/source-surface snapshot is captured where statically inspectable.
8. No bridge source files are modified.
9. Final ForgePilot and bridge git statuses are clean.
