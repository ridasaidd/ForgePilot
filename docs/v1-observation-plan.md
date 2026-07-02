# ForgePilot V1 Observation Plan

## Purpose

Use ForgePilot V1.0 in real work before deciding whether V1.x or V2 is justified.

V2 must be evidence-triggered, not ambition-triggered.

## Observation Rule

Do not propose V2 from imagination.

Use V1, record friction, and decide from evidence.

## Observation Log

Operational observations should be recorded in:

```text
runs/V1-OBSERVATION/log.md
```

## Observation Questions

For each real ForgePilot work session, record whether:

1. `project-report` was enough to know current project state.
2. `project-report` was enough to choose next work.
3. `packet-report` was enough to inspect packet evidence.
4. `reconstruction-report` was enough to inspect verification/audit/admission/comparison state.
5. The packet status index helped with historical packet navigation.
6. The safety boundary index prevented overclaiming.
7. The lifecycle index clarified packet state.
8. Private chat memory was still needed.
9. Manual grep/find was still needed.
10. The checklist felt trustworthy as an index.
11. Any report overclaimed.
12. Any report under-reported useful evidence.
13. Any step was confusing or repetitive.
14. Any deferred capability became repeatedly necessary.

## Friction Categories

Use these categories in observations:

| Category | Meaning |
|---|---|
| `REPORT_FORMATTING` | Information exists but is hard to read. |
| `REPORT_MISSING_FIELD` | Report lacks a useful field. |
| `REPORT_OVERCLAIM` | Report states more than evidence supports. |
| `REPORT_UNDERCLAIM` | Report hides useful evidence that exists. |
| `MANUAL_SEARCH_REQUIRED` | Operator needed grep/find/manual inspection. |
| `PRIVATE_MEMORY_REQUIRED` | Operator needed chat memory not in repo evidence. |
| `MCP_EXPOSURE_NEEDED` | Existing behavior needs MCP access. |
| `PERSISTENCE_NEEDED` | File/checklist state should move to structured persistence. |
| `ADMISSION_FIRST_REPORTING_NEEDED` | Reports need admitted-evidence-first views. |
| `ROUTING_PRESSURE` | User/operator needed routing/model choice from evidence. |
| `SCORING_PRESSURE` | User/operator needed model scoring/ranking. |
| `UI_PRESSURE` | CLI/docs reports became insufficient. |

## V1.x Triggers

Use V1.x for improvements that preserve the V1 contract.

Examples:

- better report formatting,
- more report fields,
- clearer docs,
- more packet status index entries,
- command aliases,
- MCP exposure for existing read-only reports,
- additional smoke tests,
- better operator guide.

## V2 Triggers

V2 may be proposed only after repeated observations show that V1 cannot support the next required class of work without changing the contract.

Valid V2 triggers include repeated need for:

- persisted checklist/query state,
- admitted-evidence-first reporting,
- routing decisions from admitted evidence,
- model scoring/ranking,
- dashboard/UI because CLI/docs reports are insufficient,
- multi-run statistical observatory behavior,
- architectural changes that cannot be handled as V1.x refinements.

## Non-Triggers for V2

The following do not justify V2 by themselves:

- report formatting improvements,
- doc cleanup,
- command aliases,
- missing convenience fields,
- incomplete packet status index coverage,
- convenient MCP exposure for existing behavior,
- one-off operator confusion.

## Review Condition

Review the observation log after enough real V1 usage exists to show a pattern.

A pattern means repeated observations, not a single inconvenience.

## Boundary

The observation plan collects evidence for future planning.

It does not start V2, define V2 architecture, or authorize routing/model scoring/dashboard work.
