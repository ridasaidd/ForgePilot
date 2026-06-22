# FP-MCP-058 — Execution Safety Boundary Checkpoint

## Status

DRAFT

## Type

Checkpoint / boundary review packet

## Goal

Record the current execution-safety boundary for the ForgePilot MCP start path after the completed gate sequence from FP-MCP-043 through FP-MCP-057.

This packet does not add runtime behavior. It exists to consolidate what has been built, what evidence now exists, what remains blocked, and what must be true before any future controlled execution path may be considered.

## Purpose

ForgePilot has reached a natural checkpoint in the MCP execution-safety track.

The system now has layered non-execution gates around request creation, request validation, runner validation, preflight validation, disable-switch enforcement, pre-start evidence, and pre/post state snapshot evidence.

FP-MCP-058 answers one question:

> What is the current execution safety boundary, and what remains unresolved before real execution can be considered?

## Scope

This packet may add:

- A checkpoint document under `docs/`.
- A run artifact under `runs/FP-MCP-058/`.
- A summary of completed execution-safety gates.
- A summary of admitted or observed evidence.
- A list of remaining blockers.
- A recommendation for the next phase.

This packet must not add:

- Runner start behavior.
- OpenCode start behavior.
- Execution enablement.
- Approval mutation.
- New network behavior.
- Secret handling behavior.
- Model routing behavior.
- Background execution.
- Automatic execution admission.
- Runtime state mutation beyond recording checkpoint artifacts.

## Completed Boundary Sequence

The checkpoint must account for the following completed packets:

- FP-MCP-043 — Execution Disable Switch Contract
- FP-MCP-044 — Execution Disable Switch Status Tool
- FP-MCP-045 — Execution Disable Switch Negative Scope Tests
- FP-MCP-046 — Execution Disable Switch Bridge Enforcement Preflight
- FP-MCP-047 — Start Request Disable Switch Enforcement
- FP-MCP-048 — Start Request Negative Approval Tests
- FP-MCP-049 — Start Request Invalid Artifact Tests
- FP-MCP-050 — Start Request Pre-Start Evidence Contract
- FP-MCP-051 — Pre-Start Evidence Validation Tool
- FP-MCP-052 — Pre-Start Evidence Dry-Run Recorder
- FP-MCP-053 — Start Request Evidence Gate Enforcement
- FP-MCP-054 — Start Request Pre/Post State Snapshot Contract
- FP-MCP-055 — Start Request State Snapshot Validation Tool
- FP-MCP-056 — Start State Snapshot Dry-Run Recorder
- FP-MCP-057 — Start Request State Snapshot Gate Enforcement

## Required Checkpoint Claims

The checkpoint must explicitly state whether the following claims are currently true:

1. Request artifacts can be created without starting OpenCode.
2. Request artifacts can be validated without starting OpenCode.
3. Runner validation can occur without contacting the runner start endpoint.
4. Execution preflight can be evaluated without starting OpenCode.
5. A global disable switch is defined.
6. The global disable switch is observable through a read-only tool.
7. The global disable switch blocks preflight.
8. The global disable switch blocks start requests.
9. Invalid approvals are rejected before execution.
10. Missing or invalid request artifacts are rejected before execution.
11. Pre-start evidence can be validated without execution.
12. Pre-start evidence can be recorded in dry-run form without execution.
13. Start requests require valid pre-start evidence.
14. Pre/post state snapshots can be validated without execution.
15. Pre/post state snapshots can be recorded in dry-run form without execution.
16. Start requests require valid pre/post state snapshot evidence.
17. The runner start endpoint remains uncontacted.
18. OpenCode remains unstarted.
19. Execution remains disabled.

## Current Known Execution Blockers

The checkpoint must preserve the known unresolved blockers, including:

- Runner execution capability is not enabled.
- OpenCode execution boundary remains unsatisfied.
- Secret boundary remains unsatisfied.
- Network boundary remains unsatisfied.
- Human approval evidence is not yet fully modeled as an independent gate.
- Runner execution remains disabled.
- OpenCode execution remains disabled.
- Global disable switch remains active.

## Evidence Requirements

The checkpoint must identify the evidence that currently exists for the canonical dry-run request:

- Request artifact
- Request artifact hash
- Preflight result
- Runner acceptance dry-run evidence
- Pre-start evidence artifact
- Pre-start evidence hash
- Pre-start state snapshot
- Post-start state snapshot
- State snapshot hashes
- Start-path tool output showing no start endpoint contact
- Start-path tool output showing no execution start

## Non-Goals

FP-MCP-058 must not decide that execution is ready.

FP-MCP-058 must not reduce or remove any blocking gate.

FP-MCP-058 must not convert dry-run evidence into real execution evidence.

FP-MCP-058 must not treat absence of failure as success.

FP-MCP-058 must not admit any future execution result.

## Acceptance Criteria

FP-MCP-058 is accepted only if:

1. A checkpoint document is added.
2. The checkpoint document lists completed gates from FP-MCP-043 through FP-MCP-057.
3. The checkpoint document identifies remaining blockers.
4. The checkpoint document states that execution remains disabled.
5. The checkpoint document states that the runner start endpoint remains uncontacted.
6. The checkpoint document states that OpenCode remains unstarted.
7. The checkpoint document does not enable execution.
8. The repository is clean after artifacts are recorded.

## Verification

Verification should include:

- Repository status.
- Execution enablement status if available.
- OpenCode status if enablement status is unavailable.
- Start-path status evidence showing:
  - `started: false`
  - `accepted: false`
  - `runnerContacted: false`
  - `startEndpointContacted: false`
  - `executionStarted: false`
- Snapshot validation status showing:
  - `stateSnapshotComplete: true`
  - `stateSnapshotValid: true`
- Pre-start evidence status showing:
  - `preStartEvidenceComplete: true`
  - `preStartEvidenceValid: true`

## Expected Outcome

After FP-MCP-058, ForgePilot should have a clear checkpoint stating that the start boundary has accumulated sufficient non-execution evidence to justify moving toward the next planning phase, while execution itself remains disabled.

Possible next phase packets may address:

- Human approval evidence contract.
- Secret boundary contract.
- Network boundary contract.
- Runner execution capability contract.
- Final execution readiness summary.
- Controlled execution enablement proposal.

## Safety Boundary

FP-MCP-058 is documentation and evidence consolidation only.

It must not start OpenCode.

It must not contact the runner start endpoint.

It must not enable execution.

It must not modify approval state.

It must not perform remote execution.
