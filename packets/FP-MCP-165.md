# FP-MCP-165 — Scoped Execution Bootstrap Exception and Retry Friction Decision

## Task

Resolve the bootstrap problem left open by FP-MCP-164 before any scoped execution enablement implementation begins.

This packet is a governance and boundary-addendum packet.

It does not implement scoped execution enablement.
It does not enable execution.
It does not consume approval.
It does not contact the runner start endpoint.
It does not start OpenCode.

## Goal

Decide explicitly how the first implementation of FP-MCP-164 may be performed when executor access is itself blocked by the execution boundary that FP-MCP-164 is meant to implement.

FP-MCP-165 answers two questions:

```text
1. How may the first scoped execution clearance implementation be bootstrapped?
2. Is approval burn-on-start-failure intentional, even for transient infrastructure failures?
```

## Context

FP-MCP-164 requires future implementation to be executor-driven after admission.

However, current executor access remains blocked by:

```text
EXECUTION_DISABLED_GLOBAL
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
DISABLE_SWITCH_ACTIVE
EXECUTION_NOT_ALLOWED
```

Therefore a purely executor-driven implementation of FP-MCP-164 cannot start yet without either:

1. a narrower already-permitted execution path, or
2. an explicitly logged one-time direct implementation exception.

No narrower already-permitted OpenCode execution path currently exists.

## Decision 1 — Bootstrap implementation exception

FP-MCP-165 authorizes a one-time, explicitly logged ChatGPT direct-source implementation exception for the first FP-MCP-164 scoped clearance primitive.

This is a named departure from the normal executor-boundary rule.

It is justified only because the executor path is gated behind the very primitive being implemented.

The exception is limited to:

```text
implementing the scoped execution clearance/check/consumption boundary required by FP-MCP-164
adding tests for that boundary
recording verification and evidence artifacts
```

The exception does not authorize:

```text
global execution enablement
unbounded runner execution
unbounded OpenCode execution
model routing
autonomous retries
parallel workers
first real execution attempt
contacting the runner start endpoint during implementation
starting OpenCode during implementation
```

## Decision 2 — Exception termination

The exception terminates when the following source-verified and artifact-recorded condition exists:

```text
SCOPED_CLEARANCE_IMPLEMENTATION_SOURCE_VERIFIED_EXECUTION_STILL_DISABLED
```

After that point, future implementation work must return to executor-driven execution once the scoped path can safely run a canary.

If additional direct source edits are required after that point, they must be admitted as separate named exceptions.

## Decision 3 — Approval burn on start failure is intentional

FP-MCP-164's rule is confirmed:

```text
If scoped clearance succeeds and approval consumption is recorded, the approval is burned even if runner start fails before worker id.
```

This includes transient infrastructure failures such as:

```text
runner temporarily unavailable after consumption
network failure after consumption
runner returns malformed response after consumption
worker id absent after runner contact
```

A fresh human approval is required for retry.

This is accepted friction for the first implementation.

The safety reason is:

```text
No consumed approval may become reusable due to ambiguous post-consumption failure state.
```

## Decision 4 — First real execution remains the FP-027 canary

FP-MCP-165 does not change FP-MCP-164's canary decision.

The first real scoped execution attempt remains:

```text
single-worker
DESIGN_ONLY
bounded prompt
FP-027 process-tree canary
no autonomous retry
no model routing
no parallel workers
no execution fan-out
```

## Required implementation constraints for the next packet

The next implementation packet must:

1. Name FP-MCP-165 as the bootstrap exception authority.
2. Record that ChatGPT direct source edits are being used only because executor access is gated.
3. Keep execution disabled after implementation.
4. Add tests that prove expired approvals cannot clear.
5. Add tests that prove consumed approvals cannot clear again.
6. Add tests that prove no runner contact occurs before consumption evidence exists.
7. Add tests that prove consumption remains terminal if start fails before worker id.
8. Preserve abort availability once worker id exists.
9. Preserve all existing FP-MCP-163 pre-execution evidence gates.

## Acceptance Criteria

FP-MCP-165 is accepted if it produces durable artifacts that:

1. Explicitly state that no narrower executor path currently exists.
2. Authorize a one-time ChatGPT direct-source bootstrap exception for FP-MCP-164 implementation only.
3. Define termination of the exception.
4. Confirm approval burn-on-start-failure as an intentional safety/friction tradeoff.
5. Preserve the FP-027 canary decision.
6. Preserve all execution-disabled boundaries.
7. Record the packet result through V1-O if admitted.

## Expected Result

```text
SCOPED_EXECUTION_BOOTSTRAP_EXCEPTION_AND_RETRY_FRICTION_DECISION_RECORDED
```
