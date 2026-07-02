# FP-030 Executor Prompt — Canonical Scoped Enablement Decision

You are implementing FP-030 in the ForgePilot MCP bridge repository.

Read:

```text
packets/FP-030.md
runs/FP-028/source-inspection-report.md
runs/FP-029/call-graph-trace.md
runs/FP-029/canonical-contract.md
```

Implement one canonical scoped enablement decision surface.

Do not enable execution.
Do not start OpenCode.
Do not run FP-027.
Do not change OAuth/Auth0 behavior.
Do not weaken the FP-023 hard fail-closed worker-start gate.

The evaluator must be read-only and fail closed.

Each decision field must include provenance class.

Approval consumption must be derived from append-only consumption evidence, not a mutable approval boolean alone.

Status and preflight must consume the same canonical decision object or serialized artifact.

Direct worker start must remain blocked unless an exact-scope canonical decision allows the attempt.

Provide tests for failure cases and surface mismatches described in the packet.

Run bridge build and tests.

Record executor result and verification artifacts under runs/FP-030/.
