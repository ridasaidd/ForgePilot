# FP-OPS-006 — First V1 Operational Observation

## Task

Record the first operational observation after ForgePilot V1.0 completion.

## Goal

Use the V1 observation protocol to capture a real post-release friction point before deciding whether work belongs in V1.x or V2.

FP-OPS-006 answers one question:

> What does the first real V1 use reveal about the next work surface?

## Observation

The MCP bridge `src/server.ts` is large enough to create refactor pressure.

The user proposed a shadow refactor approach: keep the live `server.ts` intact so ChatGPT does not lose MCP connectivity while a refactored candidate is prepared beside it.

## Scope

Update:

```text
runs/V1-OBSERVATION/log.md
```

Add:

```text
runs/FP-OPS-006/verification.txt
```

## Required Classification

This observation must classify:

- whether the issue is V1.x or V2,
- why shadow refactoring is operationally safer than direct replacement,
- what evidence supports the observation,
- what follow-up packet(s) are recommended.

## Required Boundary

This packet records an observation only.

It does not start the refactor, alter the bridge, add models, or define V2.

## Safety Requirements

This packet must not implement code, create SQLite schema, add MCP tools, change bridge runtime behavior, change admission logic, rank models, route work, rename historical packets, move packet files, or delete packet files.

## Acceptance Criteria

1. Observation is recorded in `runs/V1-OBSERVATION/log.md`.
2. Observation references the V1 release state.
3. Observation references the bridge `server.ts` size evidence.
4. Observation classifies shadow refactor as V1.x candidate, not V2.
5. Follow-up packet recommendations are recorded.
6. No implementation code changes are made.
7. Final git status is clean after evidence is recorded.
