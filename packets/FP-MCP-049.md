# FP-MCP-049 — Start Request Invalid Artifact Tests

## Status

DRAFT

## Classification

MCP bridge safety / start request negative tests / non-executing evidence

## Purpose

Define negative tests proving that `forgepilot_start_remote_runner_request` rejects missing, malformed, or invalid request artifacts before any runner start endpoint can be contacted.

This packet extends the start-request safety chain after FP-MCP-047 and FP-MCP-048.

FP-MCP-049 must preserve the current execution boundary:

```text
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

## Background

FP-MCP-047 made the start path explicitly consult the execution disable switch and return a blocked result before contacting the runner start endpoint.

FP-MCP-048 made invalid start approvals observable while preserving disable-switch precedence.

The next remaining unsafe edge is request-artifact integrity. A future start path must never contact the runner start endpoint when the request artifact is missing, malformed, inconsistent, unsafe, or otherwise invalid.

FP-MCP-049 defines tests for those cases.

## Governing Principles

This packet is constrained by:

* P01 — ForgePilot records observations, not narratives.
* P02 — Trust cannot be retroactively created.
* P03 — ForgePilot does not optimize for favorable outcomes.
* P04 — Only admitted evidence may influence observatory outputs.
* P06 — Classification follows observation.

## Scope

### In scope

* Start-request negative artifact test definitions.
* Missing request artifact behavior.
* Invalid request id behavior.
* Unknown packet behavior.
* Malformed request artifact behavior where representable through current tooling.
* Request artifact validation failure propagation.
* Structured blocked output from the start path.
* Verification that the runner start endpoint is not contacted.
* Verification that OpenCode is not started.
* Verification that disable-switch blocking remains present.

### Out of scope

* Enabling execution.
* Creating a real successful start request.
* Contacting the runner start endpoint.
* Starting OpenCode.
* Creating or accepting human approval records.
* Disabling the global disable switch.
* Changing allowed models or run modes.
* Modifying runner behavior.
* Adding model-provider calls.

## Required start-path behavior

The start-request tool must reject invalid request-artifact inputs before any start handoff can occur.

For invalid request artifact cases, the output must preserve:

```text
started: false
accepted: false
runnerContacted: false
startEndpointContacted: false
executionStarted: false
runnerRunId: null
```

The result must also preserve disable-switch observations:

```text
disableSwitchStatusEvaluated: true
disableSwitchActive: true
effectiveDisableReason: EXECUTION_DISABLED_GLOBAL
effectiveDisableScope: GLOBAL
```

## Required observable rejection reasons

The start path must return specific evidence-bearing reason codes for invalid artifact cases.

Expected reason categories include:

```text
START_REQUEST_BLOCKED_BY_DISABLE_SWITCH
REQUEST_ARTIFACT_INVALID
REQUEST_ARTIFACT_MISSING
INVALID_REQUEST_ID
UNKNOWN_REQUEST
UNKNOWN_PACKET
```

Not every invalid case must contain every reason. Each case must contain the reason that matches the observed failure.

## Negative artifact cases

FP-MCP-049 should produce evidence for at least these cases:

| Case | Packet | Request id | Expected artifact result | Expected start result |
|---|---|---|---|---|
| valid-control-disabled | FP-MCP-036 | known valid request | request valid | blocked by disable switch |
| unknown-request | FP-MCP-036 | syntactically valid but absent request id | request missing | no start contact |
| invalid-request-id | FP-MCP-036 | malformed request id | request id invalid | no start contact |
| unknown-packet | FP-MCP-999 | syntactically valid request id | packet missing | no start contact |
| packet-request-mismatch | mismatched packet/request context if available | existing request under another packet | request invalid or missing | no start contact |

## Required aggregate result

The packet must produce an aggregate artifact under:

```text
runs/FP-MCP-049/start-invalid-artifact-test-aggregate.json
```

The aggregate must include:

```json
{
  "packetId": "FP-MCP-049",
  "invalidArtifactTestsEvaluated": true,
  "testCount": 0,
  "allInvalidArtifactsRejected": true,
  "allStartEndpointContactsPrevented": true,
  "allExecutionStartsPrevented": true,
  "disableSwitchObserved": true,
  "validControlBlockedByDisableSwitch": true,
  "startEndpointContacted": false,
  "executionStarted": false,
  "opencodeStarted": false
}
```

The `testCount` must be set to the actual number of recorded test cases.

## Required fixture output

The packet should record per-case fixture outputs under:

```text
runs/FP-MCP-049/start-invalid-artifact-fixtures/
```

Each fixture should be a JSON observation from the live tool result or a faithful recorded projection of the live tool result.

Fixtures must not be interpreted as approvals. They must not cause execution.

## Acceptance criteria

FP-MCP-049 is accepted only if all of the following are true:

1. The packet is committed to `packets/FP-MCP-049.md`.
2. Negative request-artifact cases are evaluated.
3. Invalid artifact cases are rejected.
4. No invalid artifact case contacts the runner start endpoint.
5. No invalid artifact case starts execution.
6. No invalid artifact case starts OpenCode.
7. Disable-switch blocking remains observable.
8. Specific rejection reasons are recorded.
9. Aggregate evidence is committed under `runs/FP-MCP-049/`.
10. Final verification artifacts are committed under `runs/FP-MCP-049/`.

## Expected final evidence

```text
runs/FP-MCP-049/start-invalid-artifact-fixtures/*.json
runs/FP-MCP-049/start-invalid-artifact-test-aggregate.json
runs/FP-MCP-049/executor-result.md
runs/FP-MCP-049/verification.txt
```

## Non-execution invariant

FP-MCP-049 must end with:

```text
started: false
accepted: false
runnerContacted: false
startEndpointContacted: false
executionStarted: false
opencodeStarted: false
```

## Success summary

A successful FP-MCP-049 result means:

* The start path rejects missing and invalid request artifacts.
* The rejection is observable through structured reason codes.
* The disable switch remains active and takes precedence.
* The runner start endpoint is not contacted.
* OpenCode is not started.
