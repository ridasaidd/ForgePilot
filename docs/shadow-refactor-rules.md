# Shadow Refactor Rules

## Purpose

Shadow refactoring is a safety pattern for refactoring live, instrument-critical, or connectivity-critical systems.

It allows a refactor candidate to be prepared beside the live implementation while the current entrypoint remains operational.

## Core Definition

```text
Shadow refactoring keeps the live entrypoint intact while a candidate implementation is built, verified, and proven before any runtime switch.
```

## Required Boundary

Shadow refactoring is not a license to change behavior.

It is a behavior-preserving refactor method.

If behavior changes are required, they must be scoped in a separate packet.

## Required Live Entrypoint Rule

The live entrypoint must remain unchanged until a candidate has passed required verification.

For the MCP bridge shadow refactor:

```text
src/server.ts remains the live entrypoint.
```

The systemd service must continue to use the live entrypoint until the switch packet explicitly changes it.

## Candidate Naming Rule

Candidate implementation should be built beside the live implementation.

Recommended names:

```text
src/server-next.ts
src/server-next/
```

Other names may be used only if the packet explains why.

## Rollback Rule

The live implementation is rollback material.

Do not delete, overwrite, or permanently replace the old entrypoint until:

1. candidate build passes,
2. candidate smoke tests pass,
3. service switch succeeds,
4. direct operational proof succeeds,
5. rollback path is documented,
6. evidence is committed.

For MCP bridge work, direct operational proof means direct ChatGPT MCP invocation after the service switch.

## Phase Model

### Phase 1 — Read-only structure mapping

Allowed:

- inspect files,
- map structure,
- identify modules,
- identify risky areas,
- propose extraction seams.

Forbidden:

- code changes,
- entrypoint changes,
- tool schema changes.

### Phase 2 — Plan-only refactor design

Allowed:

- propose step-by-step extraction plan,
- define verification per step,
- define rollback per step,
- identify model executor/auditor roles.

Forbidden:

- code changes,
- runtime changes,
- broad behavior changes.

### Phase 3 — Candidate extraction

Allowed:

- create candidate files beside live implementation,
- extract pure helpers/modules,
- add or update tests when scoped,
- run build/test/smoke verification.

Forbidden:

- replacing live entrypoint,
- changing service entrypoint,
- removing old implementation,
- changing external tool contracts unless explicitly scoped.

### Phase 4 — Candidate assembly

Allowed:

- assemble `server-next.ts`,
- compare candidate behavior against live behavior,
- run local smoke tests,
- record differences.

Forbidden:

- production/service switch,
- old entrypoint removal.

### Phase 5 — Switch packet

Allowed only after prior evidence:

- switch runtime entrypoint,
- restart service,
- verify service state,
- run direct operational proof,
- record rollback path.

### Phase 6 — Cleanup packet

Allowed only after switch proof:

- remove old entrypoint or archive old compatibility layer,
- update docs,
- record final proof.

## Verification Gates Before Switch

Before switching a live entrypoint, evidence must show:

- build passes,
- tests pass where available,
- candidate startup succeeds,
- candidate exposes expected behavior,
- no unintended tool/schema contract change,
- rollback path is documented.

For MCP bridge work, also verify:

- MCP service can restart,
- ChatGPT can invoke at least one existing MCP tool after the switch,
- OpenAI Actions refresh is performed only if tool schema changed.

## Model Participation Constraints

Models may participate according to trust and task scope.

Unobserved models start with:

```text
READ_ONLY_ANALYSIS
PLANNING_ONLY
NO_CODE_CHANGES
```

A model may implement code only after a packet explicitly grants implementation scope.

Model outputs must be stored under the relevant project workspace, for example:

```text
instrument-projects/forgepilot-chatgpt-mcp/model-results/
```

## Forbidden Changes During Shadow Refactor

Unless explicitly scoped, shadow refactor packets must not:

- change external behavior,
- change MCP tool schemas,
- change OpenAI Actions schema,
- change auth/OAuth semantics,
- change approval gates,
- change telemetry semantics,
- change persistence semantics,
- change routing/model scoring,
- delete live entrypoint,
- remove rollback path.

## Evidence Requirements

Each shadow refactor packet must record:

- target live entrypoint,
- candidate path(s),
- what changed,
- what did not change,
- verification commands/results,
- rollback path,
- model executor/auditor if applicable,
- final git status.

## Boundary

Shadow refactoring is an operational safety method.

It does not admit evidence, rank models, route work, or authorize behavior changes by itself.
