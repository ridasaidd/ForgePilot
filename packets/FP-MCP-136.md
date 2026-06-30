# FP-MCP-136 — Generalize Local Preflight Report Gate Shape

## Task

Define and implement a stable local guarded preflight report gate shape.

## Goal

Ensure local guarded preflight reports expose gates in a predictable object form so downstream evidence parsers do not need to guess whether `gates` is a list or object.

This packet answers one question:

Can the local guarded preflight report preserve raw gate evidence while also exposing a normalized gate map?

## Background

FP-MCP-135 completed a matching request + approval target binding test.

During evidence recording, the parser failed because the local preflight report returned:

```text
gates: list
```

Earlier FP-MCP evidence scripts assumed:

```text
gates: object
```

The report data was still useful, and the repair script handled both shapes. But the tool contract should be explicit.

## Decision

The local guarded preflight report should expose:

```text
gates
```

as a normalized object keyed by stable gate names.

It may also expose:

```text
rawGates
```

or equivalent raw evidence if preserving original list form is useful.

## Required Normalized Gate Keys

The normalized report should include stable keys where applicable:

```text
repository
requestArtifact
commitBinding
modelAndRunMode
preStartEvidence
stateSnapshotEvidence
humanApprovalEvidence
evidenceLedgerReadiness
disableSwitch
runnerCapabilityState
opencodeReadiness
```

A missing gate may be omitted, but emitted gates must be object-valued.

## Gate Object Contract

Each normalized gate should use a stable shape when possible:

```json
{
  "evaluated": true,
  "passed": false,
  "state": "FAILED",
  "reasons": [],
  "observations": []
}
```

Additional gate-specific fields are allowed.

## Backward Compatibility

If existing internal code naturally builds a list of gate observations, the report may preserve it under:

```text
rawGates
```

But top-level:

```text
gates
```

must be object-shaped after FP-MCP-136.

## Scope

Allowed:

- Modify `scripts/guarded-preflight-report.mjs` in the MCP bridge repository.
- Add a gate normalization helper.
- Ensure top-level `gates` is object-shaped.
- Preserve previous gate details.
- Preserve all existing safety fields.
- Run local preflight against the FP-MCP-134 request + FP-MCP-135 approval pair.
- Record a fresh report under `runs/FP-MCP-136/`.
- Verify normalized gate keys are object-valued.
- Commit bridge implementation and ForgePilot evidence.

Forbidden:

- Do not enable execution.
- Do not make start callable.
- Do not add start to `supportedOperations`.
- Do not contact the runner start endpoint.
- Do not call `/runner/start-run`.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create runner run id.
- Do not consume approval.
- Do not create approval consumption evidence.
- Do not mutate request artifacts.
- Do not mutate approval artifacts.
- Do not mutate pre-start evidence.
- Do not mutate state snapshot evidence.
- Do not implement `PRESENT_GUARDED`.
- Do not implement `CALLABLE_GUARDED`.
- Do not implement real guarded start.
- Do not relax the disable switch.

## Verification Pair

Use the known matching pair from FP-MCP-134 and FP-MCP-135:

```text
request packet id: FP-MCP-134
request id: REQ-20260630T202005438Z-86d20df4
approval id: APPROVAL-20260630T202924964Z-65d76e90
targetExecutionCommit: bbf930a
approvedTargetExecutionCommit: bbf930a
```

## Verification Requirements

The fresh local preflight report must show:

```text
typeof gates == object
gates is not an array
humanApprovalEvidence is object-valued
approvalTargetExecutionCommit == bbf930a
requestTargetExecutionCommit == bbf930a
```

Safety fields must remain:

```text
eligibleForFutureGuardedStart: false
executionPermitted: false
executionStarted: false
opencodeStarted: false
runnerStartEndpointContacted: false
startEndpointContacted: false
runnerRunId: null
approvalConsumed: false
requestArtifactMutated: false
approvalArtifactMutated: false
```

## Evidence

Record:

- `runs/FP-MCP-136/implementation-evidence.md`
- `runs/FP-MCP-136/local-preflight-report.json`
- `runs/FP-MCP-136/local-preflight-report.md`
- `runs/FP-MCP-136/verification.txt`

## Success Criteria

This packet is successful if:

1. Local preflight report `gates` is normalized to object form.
2. Human approval gate remains available as `gates.humanApprovalEvidence`.
3. Target commit binding remains visible and matched.
4. Safety fields remain non-executing.
5. Bridge implementation is committed.
6. ForgePilot evidence is committed.
7. Verification passes.

## Non-goals

This packet does not consume approval.

This packet does not implement approval consumption.

This packet does not enable execution.

This packet does not make start callable.

This packet does not add start to supported operations.

This packet does not implement `PRESENT_GUARDED`.

This packet does not implement `CALLABLE_GUARDED`.

This packet does not perform a remote runner start.
