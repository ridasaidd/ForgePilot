# Project Summary Reporting Rules

## Purpose

ForgePilot project reports must make project/V1 state inspectable without turning many partial facts into a completion narrative.

A project report is an index over committed evidence, checklist entries, and supported read-only query outputs.

It is not evidence by itself.

## Governing Question

```text
What may a ForgePilot project summary report claim across multiple packets?
```

## Project-Wide Reportable Facts

A project report may summarize:

| Fact type | Report may say | Required source |
|---|---|---|
| Current baseline | current branch, commit, and cleanliness if observed | git status/log output |
| Checklist status | capability statuses listed in the progress checklist | `docs/forgepilot-progress-checklist.md` |
| Packet inventory | packet files present under `packets/` | filesystem/git tree |
| Recent commits | recent committed changes | git log |
| Evidence artifacts | run artifacts present under `runs/<packet>/` | filesystem/git tree |
| Reporting rules | which reporting rules govern output | docs under `docs/` |
| Manual caveats | recorded manual action requirements | `docs/manual-action-ledger.md` and evidence artifacts |
| Next candidate work | advisory next namespaces/work items | checklist guidance and taxonomy |

## Aggregation Boundary

Aggregation must not strengthen claims.

Allowed:

```text
Five capabilities are marked COMPLETE in the checklist.
Three capabilities are marked PARTIAL.
One capability is NOT_STARTED.
```

Not allowed:

```text
ForgePilot is basically complete.
```

unless V1 completion criteria are explicitly satisfied and supported by committed evidence.

## Status Source Precedence

When summarizing project state, use this precedence:

1. Explicit committed evidence artifact.
2. Progress checklist status that points to evidence.
3. Packet file existence.
4. Advisory recommendation.

Lower-precedence sources must not override higher-precedence evidence.

A checklist entry is useful as an index, but it is not evidence by itself.

## Checklist Usage Rules

The progress checklist may be used to summarize capability status only if the report labels it as checklist-derived.

Reports must preserve checklist uncertainty such as:

- `PARTIAL`,
- `NOT_STARTED`,
- `DEFERRED`,
- `BLOCKED`.

Reports must not collapse these into simple done/not-done percentages unless a future packet defines percentage semantics.

## Packet Inventory Rules

A project report may count packet files by namespace.

Packet inventory does not imply:

- packets executed,
- packets succeeded,
- packets are current,
- packets are V1-relevant,
- packets are correctly named under the newer taxonomy.

Historical packet IDs remain valid historical evidence.

## Incomplete / Deferred / Blocked Reporting Rules

Reports must preserve incomplete states.

Required wording examples:

```text
PARTIAL: evidence exists, but V1 criteria remain incomplete.
NOT_STARTED: no committed implementation evidence exists yet.
DEFERRED: intentionally postponed, not failed.
BLOCKED: waiting on external/manual/system condition.
```

## V1 Completion Claim Constraint

A report may claim ForgePilot V1 is complete only if:

- the V1 completion definition is present,
- all required V1 capability entries are `COMPLETE`,
- supporting committed evidence exists for each completion claim,
- no required caveat remains `BLOCKED` or unresolved,
- the report identifies the sources used.

If any required capability is `PARTIAL`, `NOT_STARTED`, `BLOCKED`, or unresolved, the report must say V1 is not complete.

## Next-Step Recommendation Constraint

A project report may recommend next work only as advisory guidance.

Recommendations must include:

- recommended namespace family,
- reason,
- source of recommendation.

Reports must not pre-assign exact future packet numbers unless the packet already exists.

## Manual Action Reporting Constraint

Manual actions may be summarized only when paired with observable proof.

Example:

```text
Manual OpenAI Actions refresh is required for new MCP tools.
Observed proof for FP-MCP-157 exists at runs/FP-MCP-157/direct-mcp-query-result.md.
```

## Prohibited Project-Wide Claims

Project reports must not claim:

- V1 is complete while any required V1 capability is incomplete,
- checklist status is proof by itself,
- packet count equals progress,
- all historical packets are current,
- old packet namespace choices should be renamed,
- telemetry observations imply model quality,
- comparison artifacts imply global model ranking,
- reporting output admits evidence,
- manual action succeeded without observable proof,
- deferred work is failure.

## Required Project Report Boundary

Every project report must include:

```text
This project report is an index over committed evidence and checklist state. It is not evidence by itself.
```

If non-admitted observations are included, the report must also include:

```text
Observation only. Not admitted evidence. Not routing input.
```
