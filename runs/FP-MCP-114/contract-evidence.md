# FP-MCP-114 Contract Evidence

Result: PASSED

Created the start capability transition contract.

## Packet

- FP-MCP-114 — Start Capability Transition Contract

## Artifact Created

- `docs/start-capability-transition-contract.md`

## Contract Scope

The contract defines the evidence required to transition between ForgePilot MCP start capability states.

Defined states:

- `NOT_PRESENT`
- `PRESENT_DISABLED`
- `PRESENT_GUARDED`
- `CALLABLE_GUARDED`

Defined valid transition path:

```text
NOT_PRESENT
→ PRESENT_DISABLED
→ PRESENT_GUARDED
→ CALLABLE_GUARDED
```

Defined rollback paths:

```text
CALLABLE_GUARDED → PRESENT_GUARDED
CALLABLE_GUARDED → PRESENT_DISABLED
PRESENT_GUARDED → PRESENT_DISABLED
PRESENT_DISABLED → NOT_PRESENT
```

## Key Contract Rules

- State is explicit.
- Capability is not execution.
- Transitions are evidence-gated.
- Rollback is append-only.
- A start endpoint existing does not imply start is callable.
- A green dry-run does not imply execution is authorized.
- A transition approval is not a start approval.
- A start approval is not a transition approval.

## Required Evidence Defined For PRESENT_GUARDED

The contract requires:

1. Disabled state baseline.
2. Guarded start contract.
3. Runner guarded dry-run semantics.
4. Bridge guarded readiness semantics.
5. Regression tests.
6. Explicit transition decision.

Required transition text:

```text
AUTHORIZE_TRANSITION_TO_PRESENT_GUARDED
```

This text authorizes only `PRESENT_GUARDED`.

It does not authorize `CALLABLE_GUARDED`.

It does not authorize execution.

## Required Evidence Defined For CALLABLE_GUARDED

The contract defines the future burden of proof only.

It requires:

1. `PRESENT_GUARDED` baseline.
2. End-to-end guarded dry-run.
3. Failure matrix.
4. Runtime isolation evidence.
5. Rollback path.
6. Explicit transition decision.

Required transition text:

```text
AUTHORIZE_TRANSITION_TO_CALLABLE_GUARDED
```

This text is execution-relevant.

It must not be reused.

It must be scoped to one exact repository commit and one exact bridge/runner version.

## State Reporting Requirements Defined

Every status surface must report:

- `startEndpointPresent`
- `startEndpointState`
- `startCapabilityCallable`
- `startGuardContractVersion` when applicable
- `startDisabledReason` when applicable
- `startBlockingReasons`
- `executionEnabled`
- `supportedOperations`
- `checkedAt`
- `statusSource`

Unknown states must fail closed with:

```text
START_ENDPOINT_STATE_UNKNOWN
START_NOT_CALLABLE
EXECUTION_NOT_ALLOWED
```

## Supported Operations Rule Defined

`start-run` may not appear in `supportedOperations` while state is:

- `NOT_PRESENT`
- `PRESENT_DISABLED`
- `PRESENT_GUARDED`

`start-run` may appear in `supportedOperations` only when state is:

- `CALLABLE_GUARDED`

Presence in `supportedOperations` does not itself authorize execution.

Execution still requires all guarded gates.

## Safety Result

This packet is documentation and contract only.

No runner behavior changed.

No MCP bridge behavior changed.

No execution was enabled.

No start was made callable.

No start was added to `supportedOperations`.

No approval was created.

No approval was consumed.

No request artifact was mutated.

No OpenCode process was started.

No runner run id was created.

No runner start endpoint was contacted.

## Conclusion

FP-MCP-114 succeeded.

The start capability transition contract is now recorded as durable project documentation.
