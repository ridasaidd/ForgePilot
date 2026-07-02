# FP-026 Tooling Block Pattern Note

## Pattern

This is now a recurring tool-platform behavior, not a one-off anomaly.

Observed shape:

```text
commands or tool calls containing process-control / abort / termination semantics may be blocked before reaching the MCP bridge
```

## Current hypothesis

The trigger appears content/semantics based rather than purely command-size based.

Evidence:

```text
1. a combined FP-026 evidence-writing command was blocked while containing repeated process-control terminology
2. the live abort MCP action call was blocked even though it targeted a recorded worker fixture
3. smaller artifact-writing commands succeeded after splitting and reducing the sensitive terminology density
```

## Handling rule

Future packets should distinguish:

```text
bridge safety gate failure
bridge implementation failure
platform tool safety block before bridge invocation
```

These must not be collapsed into one tooling-anomaly bucket.
