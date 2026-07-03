# FP-MCP-195 — Conservative MCP Invocation Cadence Policy

## Task

Record a standing operational policy that MCP calls should be serialized, sparse, and single-purpose to reduce false-positive platform safety checks and preserve evidence clarity.

## Context

The operator observed a recurring pattern: rapid MCP tool calls and multi-command terminal invocations appear more likely to trigger OpenAI platform safety checks. This observation aligns with prior FP-MCP-189 cadence/multi-command hypothesis and the FP-MCP-190/194 treatment of platform blocks as unresolved but safety-relevant.

## Finding

The pattern is not proven as root cause, but it is operationally important.

```text
rapid MCP tool cadence -> possible false-positive platform safety check
multi-command terminal invocation -> possible false-positive platform safety check
```

Because the exact OpenAI trigger remains unresolved, ForgePilot should avoid creating avoidable false positives.

## Policy

```text
1. Prefer one MCP tool call at a time.
2. Prefer one logical operation per terminal invocation.
3. Avoid chaining multiple terminal commands when a single-purpose call is sufficient.
4. Avoid rapid back-to-back calls around enablement-adjacent tools.
5. Insert an operator-visible pause/update between sensitive tool calls when practical.
6. Treat platform blocks as observations, not as noise to retry away.
7. Do not rephrase or restructure enablement-adjacent calls solely to get past a platform block.
```

## Boundary

This packet does not resolve the OpenAI safety-check trigger. It does not downgrade FP-MCP-187. It does not alter FP-MCP-194's equivalent-capability rule. It does not authorize FP-MCP-183, create a request artifact, create approval evidence, consume approval evidence, contact the runner start endpoint, start OpenCode, or run the FP-027 canary.

## Expected Result

```text
FP_MCP_195_CONSERVATIVE_MCP_INVOCATION_CADENCE_POLICY_RECORDED
```
