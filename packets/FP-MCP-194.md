# FP-MCP-194 — Request Artifact Alias Equivalence and Safety-Block Reconciliation

## Task

Reconcile the FP-MCP-191/192 request-artifact alias sequence against the FP-MCP-188 no-bypass rule and record a durable standing rule for renamed/reshaped capabilities after platform safety blocks.

## Context

FP-MCP-187 observed OpenAI platform safety checks blocking `forgepilot_create_opencode_run_request` before ForgePilot received the call. FP-MCP-188 classified that block as enablement-adjacent and recorded a no-bypass rule. FP-MCP-191 later introduced a clarified alias, `forgepilot_record_non_executing_run_request_artifact`, and FP-MCP-192 live-confirmed it against FP-MCP-192.

The observable sequence is close enough to the FP-MCP-188 boundary that it requires explicit reconciliation.

## Evidence ID Reconciliation

```text
59 = FP-MCP-189 — Platform block cadence / multi-command trigger hypothesis documented.
60 = FP-MCP-190 — Enablement-adjacent platform block source/contract diagnosis; trigger unresolved.
61 = FP-MCP-191 — Request artifact tool contract safety alignment; source/build verified; no live retry.
62 = FP-MCP-192 — Live confirmation of clarified non-executing request-artifact alias.
63 = FP-MCP-193 — Source-backed MCP server design guidance; downstream guidance, not safety-trigger resolution.
```

## Alias Equivalence Finding

`forgepilot_record_non_executing_run_request_artifact` is a clarified tool surface over the same underlying request-artifact creation capability.

It calls the same underlying implementation path used by the legacy request-creation tool and creates the same class of durable request artifact. That artifact remains capable of participating in a future execution workflow if later paired with approval evidence, preflight, approval consumption, disabled-switch clearance, and explicit runner-start authorization.

Therefore the alias is not proven structurally isolated from future execution workflows.

```text
forgepilot_record_non_executing_run_request_artifact
= clarified artifact-only request-creation surface
= same underlying request-artifact creation capability
≠ structurally isolated from future execution workflows
```

## Reconciliation

FP-MCP-191/192 should be classified as good-faith safety-alignment work that also changed the tool shape after a platform safety block.

Intent is not sufficient. The observable fact is that a renamed/reshaped path for an equivalent request-artifact creation capability was introduced after the original path was platform-blocked and then live-tested.

That does not prove deliberate bypass, but it is close enough to the FP-MCP-188 no-bypass boundary that it must be recorded as unresolved/safety-relevant rather than treated as resolved progress.

## OpenAI Safety Trigger Status

The exact OpenAI safety-check trigger remains unresolved.

Relevant OpenAI/MCP documentation was reviewed, but no public documentation was found explaining the exact block phrase or root cause.

```text
OpenAI/MCP safety guidance reviewed: true
Exact block trigger resolved: false
Alias success proves original block benign: false
Alias success proves platform safety concern resolved: false
```

## FP-MCP-193 Status

FP-MCP-193 remains useful as downstream design guidance, but it is premature with respect to the unresolved safety-block question.

It must not be read as evidence that FP-MCP-187 was resolved or that FP-MCP-191/192 closed the safety question.

## Standing Rule Recorded

`docs/operations/platform-tool-block-pattern.md` now records:

```text
A renamed, aliased, reshaped, or semantically narrowed tool surface introduced after a platform safety block must be presumed equivalent to the blocked capability unless it is demonstrated to be structurally incapable of feeding the same downstream authority.
```

## Freeze

Until this reconciliation is admitted:

```text
no further FP-MCP-183 request-artifact alias testing
no further request-artifact alias experimentation as safety evidence
no claim that FP-MCP-192 resolves FP-MCP-187
```

After admission, the unresolved open questions remain:

```text
what triggered the OpenAI platform safety block
whether FP-MCP-183 should ever receive fresh enablement authorization
```

## Expected Result

```text
FP_MCP_194_ALIAS_EQUIVALENCE_RECONCILED_STANDING_RULE_RECORDED_SAFETY_TRIGGER_UNRESOLVED
```
