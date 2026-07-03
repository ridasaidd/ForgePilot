# FP-MCP-184 — Validate Execution Preflight Disabled-Reason Provenance

## Task

Resolve the legacy `EXECUTION_DISABLED` provenance question before FP-MCP-183 can move from decision boundary to actual enablement authorization.

## Context

FP-MCP-182 composite live confirmation showed the expected precise deliberate disable/OpenCode-execution blockers, but the older `validate_execution_preflight` surface also emitted a legacy aggregate reason:

```text
EXECUTION_DISABLED
```

FP-MCP-173 and earlier gate work showed that separate policy surfaces can drift. This packet therefore classifies whether the legacy reason is merely another rendering of the canonical disable-switch state or an independently synthesized reason that could diverge during enablement.

## Finding

Source inspection found that `validateExecutionPreflight` calls `getExecutionDisableSwitchStatus`, but it also independently emitted legacy `EXECUTION_DISABLED` whenever either runner execution or OpenCode execution was disabled.

That means the legacy reason was not purely canonical disable-switch provenance. It was an aggregate runner/OpenCode execution-enabled predicate and could diverge from the canonical disable-switch surface.

## Change

Normalize `validateExecutionPreflight` to emit the precise reason codes instead of the ambiguous aggregate reason:

```text
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
```

## Boundary

This packet is source normalization only. It does not authorize FP-MCP-183 enablement, create or consume approval evidence, clear a tuple, contact the runner start endpoint, or start OpenCode.

## Expected Result

```text
VALIDATE_EXECUTION_PREFLIGHT_DISABLED_REASON_PROVENANCE_NORMALIZED_SOURCE_VERIFIED_ENABLEMENT_STILL_NOT_AUTHORIZED
```
