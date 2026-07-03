# FP-MCP-189 — Platform Block Cadence / Multi-Command Trigger Hypothesis

## Task

Record an operator observation that rapid tool calls or multi-operation terminal batches can trigger platform safety checks.

## Context

FP-MCP-188 classified FP-MCP-187 separately as an enablement-adjacent request-creation platform block. The operator then noted that platform safety checks are sometimes triggered when tools are called too quickly or when multiple terminal commands are grouped together.

This observation is useful for the generic platform-tool block pattern, but it must not erase FP-MCP-187's separate enablement-adjacent classification.

## Observation

```text
Rapid back-to-back tool calls and multi-operation terminal batches may trigger platform safety checks.
```

## Interpretation

This is a plausible contributor for recurring platform-tool blocks. It remains a hypothesis, not a proven root cause.

It does not prove FP-MCP-187 was benign cadence/tooling behavior because FP-MCP-187 occurred on the first request-creation step adjacent to real enablement tuple preparation.

## Handling Rule

```text
1. Prefer serialized tool calls for enablement-adjacent work.
2. Avoid large combined terminal batches when a smaller single-purpose call is sufficient.
3. Do not rephrase blocked enablement-adjacent calls to bypass safety checks.
4. Do not manually construct artifacts to bypass a blocked primary MCP path.
5. Keep FP-MCP-187's enablement-adjacent classification intact until the trigger is understood.
```

## Expected Result

```text
FP_MCP_189_PLATFORM_BLOCK_CADENCE_MULTI_COMMAND_TRIGGER_HYPOTHESIS_DOCUMENTED
```
