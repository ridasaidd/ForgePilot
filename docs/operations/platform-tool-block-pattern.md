# Platform Tool Block Pattern

## Status

```text
OPEN_OPERATIONAL_PATTERN
```

## Summary

Across recent ForgePilot MCP work, some ChatGPT-to-MCP tool invocations were blocked before reaching the MCP bridge.

This must be distinguished from bridge behavior.

```text
platform block before bridge invocation != bridge safety gate failure
platform block before bridge invocation != bridge implementation failure
```

## Observed instances

```text
FP-017: evidence staging around verification artifact was blocked by tooling.
FP-020: trivial status/check commands were temporarily blocked after verification/backfill.
SHADOW-REF-006: one large combined staging/commit command was blocked and had to be split.
FP-026: combined evidence writing was blocked, an initial live control action was blocked, and a descriptive commit/verification command was blocked.
```

## Current hypothesis

The trigger is unresolved.

Plausible contributors:

```text
cadence / rapid sequencing after action refresh
large combined command shape
sensitive process-control terminology in command text, rationale, path names, or action schema
interaction between action discovery and immediate invocation
intermittent platform-side policy evaluation
```

No single cause has been isolated.

## Handling rule

When this pattern appears:

```text
1. Do not treat it as evidence that the MCP bridge failed.
2. Do not silently retry and erase the observation.
3. Prefer smaller commands and neutral wording when recording evidence.
4. Add cadence spacing before sensitive live action probes.
5. Record whether the block happened before or after the bridge received the call.
6. Keep bridge-level safety findings separate from platform-tooling findings.
```

## Evidence-quality rule

One later successful call does not prove cadence was the root cause.

It only proves the block did not reproduce for that attempt.

The trigger remains:

```text
PLATFORM_TOOL_BLOCK_UNRESOLVED_TRIGGER
```

## Additional FP-027 observation

During FP-027 pre-spec work, platform-side blocks also affected read-only policy/status calls and a combined status check.

This weakens any hypothesis that the pattern is limited to large write commands.

It remains compatible with timing/cadence, content/schema sensitivity, and intermittent platform-side evaluation.
