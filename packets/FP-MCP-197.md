# FP-MCP-197 — Accept Platform Safety Trigger as Operationally Understood but Internally Unconfirmed

## Task

Record the explicit wait-or-proceed decision after FP-MCP-196: do not wait for OpenAI support clarification before considering FP-MCP-183, because the operator observation is sufficient for local operational policy, while OpenAI's internal classifier cause remains unconfirmed.

## Context

FP-MCP-187 observed a platform-side safety block before ForgePilot received an enablement-adjacent request-artifact creation call.

FP-MCP-194 reconciled the later alias-equivalence issue and recorded a standing rule that renamed or reshaped capabilities after a platform safety block must be presumed equivalent unless structurally incapable of feeding the same downstream authority.

FP-MCP-195 recorded a conservative MCP invocation cadence policy after operator observation and a later platform block on a single-purpose `git diff --check` command.

FP-MCP-196 assembled, but did not submit, an OpenAI feedback report package.

The operator then provided an external AI/search response that corroborates the broad mitigation direction: avoid rapid tool-calling loops, avoid chained terminal commands, preserve human-in-the-loop approval, and prefer higher-level typed tools over raw shell strings. The response is useful corroboration but not treated as authoritative OpenAI root-cause proof.

## Decision

ForgePilot accepts the platform safety trigger as operationally understood enough to proceed with compensating caution.

ForgePilot does not claim that OpenAI's internal classifier/root cause is confirmed.

```text
submit OpenAI support ticket before proceeding: false
wait for OpenAI response before considering FP-MCP-183: false
operator observation accepted as local operational guidance: true
external AI/search response treated as corroboration: true
external AI/search response treated as authoritative proof: false
OpenAI internal classifier cause confirmed: false
```

## Operational Basis

The accepted local observations are:

```text
rapid MCP tool calls can trigger platform safety checks
chained terminal commands can trigger platform safety checks
single-purpose terminal commands may still be blocked after high MCP-call cadence
```

The accepted mitigations are:

```text
one MCP tool call at a time
one logical terminal command at a time
no chained shell commands when avoidable
operator-visible pause/update between sensitive calls
platform blocks treated as observations, not noise to retry away
no rephrasing or restructuring enablement-adjacent calls solely to get past a block
typed tools preferred over raw terminal strings
human approval preserved
server-side gates preserved
abort primitive preserved
```

## Remaining Unresolved Fact

```text
OpenAI internal platform safety classifier trigger remains unconfirmed.
```

This unresolved fact is acknowledged and consciously accepted as a residual risk for future decision-making. It is not silently dropped as a blocker.

## Effect on FP-MCP-183 / FP-027

This packet does not authorize FP-MCP-183 and does not start FP-027.

It only clears the decision-structure gap that previously required either an OpenAI report/wait path or a conscious decision to proceed with the trigger unresolved.

FP-MCP-183 may now be considered as a fresh, explicit enablement decision under all existing safeguards:

```text
fresh request artifact required
fresh scoped approval required
single-use consumption required
clean repository state required
execution disable switch clearance required
preflight required
single worker
DESIGN_ONLY
bounded prompt
abort primitive available
no hidden bypass
no alias-equivalence relaxation
no rapid tool cadence
no chained terminal commands
```

## Boundary

```text
OpenAI report submitted: false
blocked call retried: false
request artifact created: false
approval created: false
approval consumed: false
runner start endpoint contacted: false
OpenCode started: false
FP-027 canary run: false
FP-MCP-183 authorized: false
```

## Expected Result

```text
FP_MCP_197_PROCEED_WITH_PLATFORM_TRIGGER_OPERATIONALLY_UNDERSTOOD_INTERNAL_CAUSE_UNCONFIRMED
```
