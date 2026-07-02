# Model Roster and Profiling Rules

## Purpose

Define how ForgePilot records model availability, allowed roles, task classes, trust states, promotion, and demotion.

ForgePilot must not treat a model as trusted merely because it is available through OpenCode Go or any other provider.

## Core Boundary

```text
Model availability is not trust.

Permission to plan is not permission to implement.

No model may modify project code unless a scoped packet explicitly grants implementation authority.
```

## Model Identity Fields

A model roster entry should include:

| Field | Meaning |
|---|---|
| Model ID | Stable model name used in packets and artifacts. |
| Provider/source | Where the model is accessed. |
| Availability state | Whether the model is available to the operator. |
| Allowed roles | Roles the model may currently perform. |
| Allowed task classes | Task classes the model may currently attempt. |
| Trust state | Current ForgePilot trust classification for this model. |
| Evidence basis | Committed evidence justifying the trust state. |
| Promotion criteria | What evidence would allow broader use. |
| Demotion criteria | What evidence would restrict or remove use. |
| Notes | Operational notes, caveats, cost/limit context if relevant. |

## Allowed Model Roles

| Role | Meaning | Code modification allowed? |
|---|---|---|
| `STRUCTURE_MAPPER` | Read code/artifacts and describe structure. | No |
| `RISK_ANALYST` | Identify risk zones, boundaries, and failure modes. | No |
| `PLANNER` | Propose scoped plans and packet sequences. | No |
| `PLAN_AUDITOR` | Audit plans for scope, safety, and evidence gaps. | No |
| `FIXTURE_DESIGNER` | Propose baseline fixtures or comparison checks. | No |
| `IMPLEMENTATION_CANDIDATE` | Modify code within a scoped packet. | Yes, only if explicitly granted |
| `IMPLEMENTATION_AUDITOR` | Audit code changes and evidence. | No |
| `COMPARATOR` | Compare model outputs or implementation candidates. | No |

## Allowed Task Classes

| Task class | Meaning | Default permission |
|---|---|---|
| `READ_ONLY_STRUCTURE_MAP` | Map files, modules, and responsibilities. | Allowed for unobserved models in bounded packets |
| `RISK_IDENTIFICATION` | Identify risk zones and guardrails. | Allowed for unobserved models in bounded packets |
| `REFACTOR_PLAN` | Propose a plan without edits. | Allowed for observed planning models |
| `PLAN_AUDIT` | Audit a plan without edits. | Allowed for observed planning/audit models |
| `FIXTURE_SUGGESTION` | Suggest tests/snapshots/fixtures. | Allowed for observed planning/audit models |
| `SMALL_MECHANICAL_CHANGE` | Make one scoped mechanical code change. | Requires promotion |
| `IMPLEMENTATION_AUDIT` | Audit a code change. | Requires observed audit usefulness |
| `COMPARISON` | Compare outputs/candidates. | Requires observed comparison usefulness |

## Trust States

| Trust state | Meaning | Default permissions |
|---|---|---|
| `UNOBSERVED` | No ForgePilot evidence yet. | Read-only structure/risk tasks only. |
| `OBSERVED_PLANNING_ONLY` | Has produced useful planning/analysis evidence. | Planning and read-only analysis. |
| `OBSERVED_AUDIT_USEFUL` | Has produced useful audits. | Plan/code audit, no code edits. |
| `OBSERVED_SAFE_SMALL_CHANGE` | Has successfully completed small scoped implementation with evidence. | May be considered for small mechanical changes. |
| `PROMOTED_FOR_EXECUTION` | Sufficient evidence supports implementation use in scoped packets. | Scoped implementation allowed. |
| `DEMOTED` | Evidence shows unreliable, unsafe, or unsuitable behavior. | Restricted or disallowed. |

## Promotion Criteria

A model may be promoted only through committed evidence.

Promotion may consider:

- completed packet outputs,
- verification results,
- audit acceptance,
- adherence to scope,
- absence of forbidden edits,
- quality of reasoning artifacts,
- ability to preserve boundaries,
- consistency across multiple tasks.

Promotion must not be based only on reputation, benchmark marketing, or one successful informal conversation.

## Demotion Criteria

A model should be demoted if evidence shows:

- unauthorized file edits,
- scope expansion,
- invented evidence,
- tool contract changes outside scope,
- unsafe recommendations,
- repeated hallucinated paths or commands,
- poor audit quality,
- failure to preserve explicit boundaries,
- implementation that passes superficially but violates packet intent.

## Evidence Requirements

Every model trust change must cite committed evidence.

Evidence may include:

- model output artifacts,
- verification artifacts,
- audit artifacts,
- comparison artifacts,
- checklist updates that point to evidence,
- packet completion records.

A checklist entry alone is not evidence unless it points to committed artifacts.

## Initial Known OpenCode Go Model Roster

The following models are recorded as known available candidates from the user's OpenCode Go context.

Availability does not imply trust.

| Model ID | Initial trust state | Initial allowed roles | Notes |
|---|---|---|---|
| `GLM-5` | `UNOBSERVED` | `STRUCTURE_MAPPER`, `RISK_ANALYST` | Read-only only. |
| `GLM-5.1` | `UNOBSERVED` | `STRUCTURE_MAPPER`, `RISK_ANALYST` | Read-only only. |
| `Kimi K2.5` | `UNOBSERVED` | `STRUCTURE_MAPPER`, `RISK_ANALYST` | Read-only only. |
| `Kimi K2.6` | `UNOBSERVED` | `STRUCTURE_MAPPER`, `RISK_ANALYST` | Read-only only. |
| `MiMo-V2.5` | `UNOBSERVED` | `STRUCTURE_MAPPER`, `RISK_ANALYST` | Read-only only. |
| `MiMo-V2.5-Pro` | `UNOBSERVED` | `STRUCTURE_MAPPER`, `RISK_ANALYST` | Read-only only. |
| `MiniMax M2.5` | `UNOBSERVED` | `STRUCTURE_MAPPER`, `RISK_ANALYST` | Read-only only. |
| `MiniMax M2.7` | `UNOBSERVED` | `STRUCTURE_MAPPER`, `RISK_ANALYST` | Read-only only. |
| `MiniMax M3` | `UNOBSERVED` | `STRUCTURE_MAPPER`, `RISK_ANALYST` | Read-only only. |
| `Qwen3.6 Plus` | `UNOBSERVED` | `STRUCTURE_MAPPER`, `RISK_ANALYST` | Read-only only until observed. |
| `Qwen3.7 Plus` | `UNOBSERVED` | `STRUCTURE_MAPPER`, `RISK_ANALYST` | Read-only only until observed. |
| `Qwen3.7 Max` | `OBSERVED_AUDIT_USEFUL` | `PLAN_AUDITOR`, `IMPLEMENTATION_AUDITOR`, `STRUCTURE_MAPPER`, `RISK_ANALYST` | Prior ForgePilot audit evidence exists, but not blanket implementation authority. |
| `DeepSeek V4 Pro` | `UNOBSERVED` | `STRUCTURE_MAPPER`, `RISK_ANALYST` | Distinct from high variant unless evidence says otherwise. |
| `DeepSeek V4 Pro High` | `OBSERVED_SAFE_SMALL_CHANGE` | `PLANNER`, `STRUCTURE_MAPPER`, `RISK_ANALYST`, `IMPLEMENTATION_CANDIDATE` | Prior ForgePilot implementation evidence exists, but only scoped packet authority may permit edits. |

## Default Restrictions for Unobserved Models

Unobserved models may only perform:

- structure mapping,
- risk identification,
- read-only summarization,
- plan critique without authority.

Unobserved models must not:

- edit code,
- generate patches intended for direct application,
- change tool contracts,
- make admission/routing decisions,
- be treated as authoritative auditors,
- receive broad refactor tasks.

## MCP Bridge Shadow-Refactor Boundary

For the MCP bridge shadow refactor:

- models may participate in read-only planning and audit packets first,
- no model may edit `/home/ridasaidd/forgepilot-chatgpt-mcp` until a project-specific packet grants implementation authority,
- CRITICAL zones remain protected regardless of model trust state,
- DeepSeek V4 Pro High may be considered for the first small mechanical implementation only after baseline verification and packet authorization,
- Qwen3.7 Max may be considered for audit roles,
- unobserved models may be used for independent read-only structure or risk analysis tasks.

## Non-Goals

These rules do not implement routing, scoring, global ranking, model automation, OpenCode plugins, or model execution.

## Boundary

This document defines model participation rules.

It does not run models, select a winner, authorize implementation, or change any project source code.

## FP-META-032 Scoping Amendment

FP-META-032 narrows all trust labels in this document.

A trust state such as `OBSERVED_AUDIT_USEFUL`, `OBSERVED_SAFE_SMALL_CHANGE`, or `PROMOTED_FOR_EXECUTION` is not global.

It must be interpreted through:

- model id,
- provider/source,
- observed name,
- provider version or `UNKNOWN`,
- observed date range,
- task class,
- role,
- project/context,
- protected risk boundaries,
- evidence references,
- assigned_by,
- assignment_method.

The initial roster entries for `Qwen3.7 Max` and `DeepSeek V4 Pro High` are historical scoped observations, not blanket authority.

If provider version/snapshot is unknown, the trust assignment is version-unpinned and must be re-observed after any known upstream provider model update.

No model trust state authorizes code modification without a scoped packet.
