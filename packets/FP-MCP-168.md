# FP-MCP-168 — Consuming Clearance Dry-Run Fault Injection Implementation

## Task

Implement a dry-run consuming-clearance state-machine tool that proves approval-consumption/contact artifact behavior without contacting the runner start endpoint.

This packet includes a narrow direct-source bootstrap exception because executor access remains gated and FP-MCP-165's prior exception terminated at FP-MCP-166.

## Goal

Prove the two-phase consuming mechanism from FP-MCP-167 before any real side-effecting runner contact exists.

Expected result:

```text
CONSUMING_CLEARANCE_DRY_RUN_FAULT_INJECTION_SOURCE_VERIFIED_NO_RUNNER_CONTACT
```

## Bootstrap Exception

FP-MCP-168 authorizes one narrow ChatGPT direct-source implementation exception limited to:

```text
implementing a dry-run consuming-clearance state-machine tool
adding source/build verification
recording artifacts and V1-O evidence
```

It does not authorize:

```text
real approval consumption
runner start endpoint contact
OpenCode start
first real FP-027 canary
reusable execution enablement
model routing
parallel workers
autonomous retries
```

The exception terminates when:

```text
CONSUMING_CLEARANCE_DRY_RUN_FAULT_INJECTION_SOURCE_VERIFIED_NO_RUNNER_CONTACT
```

is recorded.

## Required Dry-Run Behavior

The tool must be separate from the FP-MCP-166 validation-only tool.

It must:

1. Re-run scoped clearance validation for the exact tuple.
2. If clearance is not eligible, write no dry-run consumption artifact.
3. If clearance is eligible, write a dry-run consumption artifact marked non-authorizing.
4. Never mark the real approval consumed.
5. Never contact the runner start endpoint.
6. Never start OpenCode.
7. Never mutate request artifacts.
8. Support a deliberate fault-injection mode that writes dry-run consumption evidence but suppresses the stubbed contact outcome.
9. Reconstruct the simulated stale state as `CONSUMED_PENDING_RUNNER_CONTACT_STALE`.

## Fault Injection Decision

A dry-run with Phase 2 fully stubbed cannot prove stale-state reconstruction unless it can deliberately suppress the stubbed outcome.

Therefore FP-MCP-168 requires:

```text
faultInjectionMode: SIMULATE_INTERRUPTION_BEFORE_STUBBED_CONTACT_RESULT
```

This mode must:

```text
write dry-run consumption evidence
not write a contact outcome artifact
not contact the runner
not start OpenCode
simulate reconstruction after the contact deadline
classify the attempt as CONSUMED_PENDING_RUNNER_CONTACT_STALE
```

## Accepted Dry-Run Modes

```text
NORMAL_STUBBED_CONTACT_OUTCOME
SIMULATE_INTERRUPTION_BEFORE_STUBBED_CONTACT_RESULT
```

## Acceptance Criteria

FP-MCP-168 is accepted if:

1. A dry-run consuming-clearance tool is implemented in the bridge.
2. The tool has a non-authorizing dry-run consumption artifact path.
3. The fault-injection mode proves stale-state classification without runner contact.
4. Build/tests pass.
5. ForgePilot records implementation evidence.
6. The result is recorded through V1-O if admitted.

## Safety Boundary

Throughout FP-MCP-168:

```text
real_approval_consumed: false
runner_start_endpoint_contacted: false
opencode_started: false
execution_permitted: false
runner_run_id_created: false
request_artifact_mutated: false
```
