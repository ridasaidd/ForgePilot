# ForgePilot V1 Observation Log

## Purpose

Record operational observations from using ForgePilot V1.0.

This log is used to decide whether future work belongs in V1.x or requires V2.

## Entry Template

```text
## OBS-YYYYMMDD-NN — <short title>

Date:
Packet / work context:
Commands or reports used:

Observation:

Category:

Evidence path(s):

Impact:

Suggested classification:
- V1.x refinement
- V2 trigger candidate
- No action

Notes:
```

## Initial State

ForgePilot V1.0 is complete according to:

```text
runs/FP-META-025/final-v1-project-report.json
```

No V1 operational observations have been recorded yet after the release marker.

## OBS-20260702-01 — MCP bridge server shadow refactor pressure

Date: 2026-07-02
Packet / work context: FP-OPS-006 after ForgePilot V1.0 completion
Commands or reports used:

```text
node -e <read runs/FP-META-025/final-v1-project-report.json>
wc -l /home/ridasaidd/forgepilot-chatgpt-mcp/src/server.ts
```

Observation:

ForgePilot V1.0 is complete and ready for operational use. The first real post-V1 work surface is the MCP bridge `src/server.ts`, which is large enough to create refactor pressure.

The bridge `src/server.ts` currently has 10,364 lines.

Because the running MCP service depends on this file, direct replacement could risk losing ChatGPT-to-MCP connectivity during refactoring.

The safer pattern is shadow refactoring:

```text
Keep the live server.ts entrypoint intact.
Build a refactor candidate beside it.
Verify the candidate before switching runtime entrypoint.
Keep rollback path until direct ChatGPT MCP proof succeeds.
```

Category:

```text
MANUAL_SEARCH_REQUIRED
REFACTOR_PRESSURE
MCP_EXPOSURE_NEEDED
```

Evidence path(s):

```text
runs/FP-META-025/final-v1-project-report.json
runs/FP-OPS-006/verification.txt
```

Impact:

This is a V1.x refinement candidate. It tests whether V1 can govern a real operational refactor safely without starting V2.

Suggested classification:

- V1.x refinement candidate

Not V2, because the observed need is safer refactor workflow and model profiling, not a new ForgePilot contract.

Recommended follow-up packets:

```text
FP-META-026 — Shadow Refactor Rules
FP-META-027 — Allowed Model Roster and Profiling Rules
FP-MCP-159 — server.ts Shadow Refactor Planning Benchmark
```

Notes:

The allowed-model roster should be introduced as a controlled observation/profiling surface, not as a quality claim. New models should begin with read-only analysis and planning tasks before any implementation authority.
