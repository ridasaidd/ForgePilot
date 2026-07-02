# Task-Class-Scoped Model Trust

## Purpose

Define how ForgePilot scopes model trust so a model is never treated as globally trusted merely because it has prior successful evidence.

## Core Rule

```text
Model trust is scoped, provisional, append-only, and evidence-bound.
```

A model trust label must answer:

```text
Trusted for what task class?
In what project or context?
During what observed date range?
Based on what evidence?
Assigned by whom or what?
Using what assignment method?
```

## Trust Is Not Global

A model may be trusted for one task class and unobserved, restricted, or demoted for another.

Examples:

- safe for read-only structure mapping does not imply safe for implementation,
- safe for small mechanical extraction does not imply safe near auth or approval logic,
- useful as auditor does not imply useful as executor,
- useful in ForgePilot core does not imply useful in an instrument-project refactor.

## Required Trust Assignment Fields

A model trust assignment should record:

| Field | Meaning |
|---|---|
| `model_id` | Stable model identifier used in ForgePilot artifacts. |
| `provider_or_source` | Provider/tool/source through which the model was accessed. |
| `observed_name` | Provider-visible model name at observation time. |
| `provider_version_or_snapshot` | Provider version, snapshot, API version, or `UNKNOWN` if unavailable. |
| `observed_from` | First date/time covered by the evidence. |
| `observed_until` | Last date/time covered by the evidence. |
| `task_class` | Task class for which the trust assignment applies. |
| `role` | Allowed role, such as planner, auditor, or implementation candidate. |
| `project_context` | Core, instrument-project, observed-project, or specific project id. |
| `risk_boundary` | Risk level or protected zones excluded from the assignment. |
| `trust_state` | Scoped trust state. |
| `evidence_refs` | Committed evidence supporting the assignment. |
| `assigned_by` | Actor assigning the trust label. |
| `assignment_method` | How the assignment was derived. |
| `assigned_at` | Time the assignment was recorded. |
| `supersedes` | Prior assignment superseded, if any. |
| `notes` | Non-authoritative notes or caveats. |

## Assignment Actors

Allowed `assigned_by` values should distinguish source of judgment:

| Actor | Meaning |
|---|---|
| `human_operator` | Human reviewed evidence and assigned the state. |
| `chatgpt_assistant` | ChatGPT proposed or recorded the assignment. |
| `model_auditor` | Another model produced an audit influencing assignment. |
| `automated_policy` | Deterministic policy assigned the state. |
| `tool_captured_result` | Tool-generated result directly established the state. |

## Assignment Methods

Allowed `assignment_method` values should include:

| Method | Meaning |
|---|---|
| `manual_review` | Human or assistant review of evidence. |
| `audit_result` | Assignment derives from an audit artifact. |
| `comparison_result` | Assignment derives from a comparison artifact. |
| `verification_result` | Assignment derives from verification output. |
| `policy_rule` | Assignment follows a deterministic policy. |
| `tool_captured_result` | Assignment follows tool-captured measurements. |

## Provider Update Rule

Provider-visible model names are not stable proof of identical behavior.

If a provider changes a model under the same name, or if the version/snapshot is unknown, trust assignments must be treated as date-range-bound.

A known upstream provider update requires re-observation before old trust assignments are applied to new work.

If no provider version is available, the assignment must record:

```text
provider_version_or_snapshot: UNKNOWN
```

and must not be interpreted beyond the observed date range.

## Promotion and Demotion Are Append-Only

A model trust state must not be silently overwritten.

Promotion and demotion are new observations that supersede earlier trust assignments.

Each transition must record:

- prior trust assignment,
- new trust assignment,
- reason,
- evidence references,
- assigned_by or corrected_by actor,
- assignment method,
- affected task class,
- affected project/context,
- observed date range.

## Invalidation Interaction

Model trust assignments are downstream artifacts.

If evidence supporting a trust assignment is later invalidated, the trust assignment must be treated as:

```text
UNKNOWN_DEPENDENCY_STATUS
```

until reconstructed, unless explicit dependency analysis proves it is not affected.

A demotion caused by invalidated evidence must carry the same provenance fields as the original promotion.

## Correction to FP-META-029 Initial Roster

FP-META-029 recorded initial states such as:

```text
Qwen3.7 Max = OBSERVED_AUDIT_USEFUL
DeepSeek V4 Pro High = OBSERVED_SAFE_SMALL_CHANGE
```

FP-META-032 narrows those labels.

They must be read as shorthand for scoped observations, not global authority.

Corrected interpretation:

| Model | Corrected interpretation |
|---|---|
| `Qwen3.7 Max` | Observed as audit-useful for prior ForgePilot packet audit contexts evidenced before FP-META-032. Not globally trusted as auditor, executor, or reviewer. |
| `DeepSeek V4 Pro High` | Observed as safe for prior scoped ForgePilot implementation packets evidenced before FP-META-032. Not globally trusted for all small changes, critical zones, or project contexts. |

## MCP Bridge Shadow-Refactor Implication

For the MCP bridge shadow refactor:

- no model has blanket implementation authority,
- `DeepSeek V4 Pro High` may only be considered for a future small mechanical implementation packet after baseline verification and explicit packet authorization,
- `Qwen3.7 Max` may only be considered for audit roles under explicit packet scope,
- unobserved models remain limited to read-only mapping, risk analysis, or critique unless future evidence changes that state,
- critical zones remain protected regardless of model trust.

## Required Trust Status for Unversioned Models

When provider version/snapshot is unknown, all model trust must include:

```text
VERSION_UNPINNED
```

or equivalent caveat.

A version-unpinned assignment may still be useful, but it must not be treated as durable across provider-side model updates.

## Current Implementation Status

```text
TASK_CLASS_SCOPED_TRUST_RULE_DEFINED_IMPLEMENTATION_NOT_PRESENT
```

FP-META-032 defines rules only.

It does not implement a trust database, routing logic, model selector, or automated promotion/demotion engine.

## Evidence Quality

This packet is supported by source/docs search in:

```text
runs/FP-META-032/model-trust-source-search.txt
```

Trust classification:

```text
TIER_1_STATIC_SOURCE_INSPECTION
```

The search confirms existing docs already require task-class interpretation for model outcomes, but FP-META-029's roster language needed explicit scoping to prevent global trust overread.

## Boundary

A model trust assignment is permission evidence, not execution authorization.

Only a scoped packet can authorize a model to act.
