# Invalidation Propagation Rules

## Purpose

Define how ForgePilot treats downstream artifacts when admitted evidence is later invalidated, quarantined, or otherwise defeated.

## Core Rule

```text
Invalidation must not only revoke evidence authority.
It must also identify downstream artifacts whose claims may now be stale.
```

A revocation mechanism that only logs invalidation but leaves dependent reports unmarked is incomplete.

## Relationship to Evidence Root Boundary

FP-META-030 defines evidence-root and workspace boundaries.

Invalidation propagation follows those boundaries:

- core evidence invalidation affects core downstream artifacts that explicitly depended on that evidence,
- project workspace invalidation affects project workspace downstream artifacts that explicitly depended on that evidence,
- cross-workspace propagation occurs only through explicit dependency edges,
- artifacts are not rewritten silently across boundaries.

## Terms

| Term | Meaning |
|---|---|
| Invalidation source | The evidence record, admission event, validation result, review request, or invalidation event that revokes or defeats prior authority. |
| Dependency edge | An explicit recorded relationship showing that one artifact relied on another artifact or evidence record. |
| Downstream artifact | Any report, summary, comparison, admission decision, checklist update, model trust assignment, or derived record that depends on earlier evidence. |
| Stale report | A report whose input evidence changed or was invalidated after the report was produced. |
| Affected artifact | A downstream artifact that may have depended on invalidated evidence. |
| Requires reconstruction | A derived artifact whose current claims must be regenerated or re-evaluated before use. |

## Required Downstream States

Future propagation-capable reports or ledgers should be able to express:

| State | Meaning |
|---|---|
| `NOT_AFFECTED` | No explicit dependency on invalidated evidence is known. |
| `AFFECTED_BY_INVALIDATION` | Artifact has an explicit dependency on invalidated/quarantined evidence. |
| `STALE_REPORT` | Report was generated before an invalidation that affects one or more inputs. |
| `REQUIRES_RECONSTRUCTION` | Artifact must be regenerated or re-evaluated before it can be used as current evidence. |
| `SUPERSEDED_BY_RECONSTRUCTION` | Artifact has been replaced by a later reconstruction that accounts for invalidation. |
| `UNKNOWN_DEPENDENCY_STATUS` | Dependency edges are insufficient to determine impact. |

## Propagation Semantics

When evidence is invalidated or quarantined:

1. The invalidation event defeats the authority of the targeted admission where current admission logic says it does.
2. ForgePilot must identify artifacts with explicit dependency edges to the invalidated evidence.
3. Dependent reports should be marked `STALE_REPORT` or `AFFECTED_BY_INVALIDATION`.
4. Derived artifacts that may be reused for future decisions should be marked `REQUIRES_RECONSTRUCTION`.
5. New reports must account for the invalidation before claiming current status.
6. Historical reports must not be edited in place; later artifacts must record that they were affected or superseded.

## Cross-Workspace Propagation

Invalidation does not cross workspace boundaries by default.

Propagation from core to project workspace, project workspace to core, or project workspace to project workspace requires explicit dependency edges.

Examples:

| Scenario | Propagation |
|---|---|
| Core report depends only on core packets/runs | Core invalidation may affect it. |
| Instrument-project report depends only on instrument workspace evidence | Instrument invalidation may affect it. |
| Core V1 report explicitly includes instrument workspace evidence | Relevant instrument invalidation may affect the core report. |
| Instrument workspace file merely exists under bootstrap internal path | No propagation unless explicitly referenced. |

## Non-Propagation Cases

Invalidation must not automatically affect:

- artifacts with no explicit dependency edge,
- reports produced from a different evidence root,
- project workspaces not selected as inputs,
- historical artifacts that merely coexist in the repository,
- checklist rows that do not cite the invalidated evidence.

If dependency status is unclear, the correct state is:

```text
UNKNOWN_DEPENDENCY_STATUS
```

not `NOT_AFFECTED`.

## Append-Only Requirement

Propagation must be append-only.

ForgePilot must not rewrite old reports to erase prior claims.

Instead, it should append or generate later artifacts that say:

```text
This artifact was affected by invalidation event X.
This artifact requires reconstruction.
This artifact was superseded by reconstruction Y.
```

## Model Trust Assignments

Model trust assignments are downstream artifacts when they rely on prior model performance evidence.

A model promotion or demotion must be append-only and provenance-bearing.

If a trust assignment is later shown to be wrong, the correction should record:

- prior assignment,
- invalidating evidence,
- assigned_by or corrected_by actor,
- assignment method,
- affected task class,
- affected project/context,
- new trust state,
- evidence references.

A trust label must not be silently overwritten.

## Current Implementation Status

```text
PROPAGATION_RULE_DEFINED_IMPLEMENTATION_NOT_PRESENT
```

Current code records admission invalidation events and derives eligibility using defeating invalidation events.

Current source search did not find implemented downstream states such as:

```text
AFFECTED_BY_INVALIDATION
STALE_REPORT
REQUIRES_RECONSTRUCTION
SUPERSEDED_BY_RECONSTRUCTION
UNKNOWN_DEPENDENCY_STATUS
```

Therefore FP-META-031 defines the required semantics but does not claim current implementation conformance.

## Evidence Quality

The current implementation status is based on command-captured source/docs search in:

```text
runs/FP-META-031/invalidation-source-search.txt
```

Trust classification:

```text
TIER_1_STATIC_SOURCE_INSPECTION
```

This is stronger than narrative self-report because search output and source excerpts are preserved. It is weaker than runtime tracing or tests proving propagation behavior.

## Future Implementation Requirements

A future implementation packet should define or implement:

- dependency edge capture,
- stale report markers,
- affected artifact markers,
- reconstruction requirement markers,
- supersession markers,
- report generation that checks invalidation events,
- tests proving invalidation affects downstream report status.

## Boundary

FP-META-031 defines invalidation propagation semantics only.

It does not implement propagation, change schema, mutate historical reports, or mark existing artifacts stale.

## Default Marker Interpretation

Absence of a propagation marker must be interpreted as:

```text
UNKNOWN_DEPENDENCY_STATUS
```

It must never be interpreted as:

```text
NOT_AFFECTED
```

until propagation markers are implemented and explicit dependency checks have run.

This rule applies to existing reports, future reports, checklist rows, model trust assignments, and derived summaries.

## Existing Invalidation Event Check

FP-META-031 records the current database check in:

```text
runs/FP-META-031/existing-invalidation-events.txt
```

Result at the time of this packet:

```text
admission_invalidation_events count: 0
```

Therefore there are no known pre-existing admission invalidation events requiring retroactive downstream `UNKNOWN_DEPENDENCY_STATUS` marking at this time.

If later checks find historical invalidation events that predate propagation markers, their downstream dependency status must be treated as `UNKNOWN_DEPENDENCY_STATUS` until reconstructed.
