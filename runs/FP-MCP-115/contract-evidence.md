# FP-MCP-115 Contract Evidence

Result: PASSED

Created the guarded start preflight report contract.

## Packet

- FP-MCP-115 — Guarded Start Preflight Report Contract

## Artifact Created

- `docs/guarded-start-preflight-report-contract.md`

## Contract Scope

The contract defines a future read-only MCP report that answers:

```text
Would this request be eligible for guarded start if start were callable?
```

The report is observational only.

It is not a start request.

It is not execution authorization.

It is not a transition decision.

It does not consume approval.

It does not contact the runner start endpoint.

## Required Inputs Defined

- `packetId`
- `requestId`

Optional:

- `approvalId`

## Required Safety Values Defined

Every report must return:

```text
executionPermitted: false
executionStarted: false
opencodeStarted: false
runnerStartEndpointContacted: false
startEndpointContacted: false
runnerRunId: null
approvalConsumed: false
requestArtifactMutated: false
```

Side effect violation reason:

```text
PREFLIGHT_SIDE_EFFECT_VIOLATION
```

## Gate Model Defined

Each gate must report:

- `evaluated`
- `passed`
- `state`
- `reasons`
- `evidencePath` where applicable
- `evidenceSha256` where applicable

Allowed states:

- `PASSED`
- `FAILED`
- `INCOMPLETE`
- `DEFERRED`
- `NOT_EVALUATED`

## Required Gates Defined

The contract defines these gates:

1. Repository State
2. Request Artifact
3. Commit Binding
4. Model And Run Mode
5. Disable Switch
6. Runner Capability State
7. OpenCode Readiness
8. Pre-Start Evidence
9. State Snapshot Evidence
10. Human Approval Evidence
11. Evidence Ledger Readiness

## Eligibility Rule Defined

`eligibleForFutureGuardedStart` may be true only when the report evaluates successfully, the request and evidence gates pass, the disable switch is clear, the runner state is `PRESENT_GUARDED`, start is still not callable, `start-run` is not in `supportedOperations`, and no execution side effects occurred.

The report must return false when the runner state is `PRESENT_DISABLED`, unknown, prematurely callable, or exposes start operations before `CALLABLE_GUARDED`.

## Unknown State Rule Defined

Unknown start endpoint states fail closed with:

```text
START_ENDPOINT_STATE_UNKNOWN
START_NOT_CALLABLE
EXECUTION_NOT_ALLOWED
```

## Supported Operations Rule Defined

Before `CALLABLE_GUARDED`, `supportedOperations` must not include:

- `start-run`
- `execute`
- `execution`

Violation reason:

```text
UNEXPECTED_SUPPORTED_OPERATION
```

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

FP-MCP-115 succeeded.

The guarded start preflight report contract is now recorded as durable project documentation.
