# FP-MCP-183 — Deliberate FP-027 Canary Enablement Decision / Fresh Tuple

## Task

Record the deliberate FP-027 canary enablement decision boundary and define the requirements for any fresh tuple that may be used for exactly one scoped canary attempt.

This packet does not enable execution by itself.

## Context

FP-MCP-180 is live-confirmed through the FP-MCP-182 composite confirmation.

All pre-canary evidence and preparation gates are clean when checked through the approval-aware validation path. The remaining blockers are deliberate disable and policy blockers:

```text
EXECUTION_DISABLED_GLOBAL
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
DISABLE_SWITCH_ACTIVE
EXECUTION_NOT_ALLOWED
START_REQUEST_BLOCKED_BY_DISABLE_SWITCH
```

The FP-MCP-182 approval tuple must not be reused. Any canary attempt under this packet requires a fresh request artifact and fresh single-use approval bound to this packet, its request id, model, run mode, branch, and repository commit.

## Decision Boundary

Before any consuming action is allowed, the operator must explicitly authorize the real mechanism to clear exactly one scoped FP-027 canary tuple.

Packet creation is not authorization.

A valid authorization must preserve all of the following constraints:

```text
fresh packet/request/approval
single worker
DESIGN_ONLY
bounded boring prompt
process/workspace snapshot immediately before contact
explicit contact confirmation: CONTACT_RUNNER_START_ENDPOINT_ONCE
watch worker; abort if unsafe/stuck/out-of-scope
process/workspace snapshot after, confirming no orphaned processes
no retry
no fan-out
no chained follow-up action
```

## Initial Decision

```text
CONSUMING_ACTION_AUTHORIZATION: NOT_GRANTED_BY_PACKET_CREATION
RUNNER_START_ENDPOINT_CONTACT: NOT_AUTHORIZED
OPENCODE_WORKER_START: NOT_AUTHORIZED
APPROVAL_REUSE: FORBIDDEN
FRESH_TUPLE_REQUIRED: TRUE
```

## Expected Result

```text
FP_MCP_183_DECISION_BOUNDARY_RECORDED_NO_ENABLEMENT_NO_CONTACT
```
