# FP-MCP-134 — Target Execution Commit Request Artifact Implementation

## Task

Update request artifact creation so future ForgePilot request artifacts explicitly include `targetExecutionCommit`.

## Goal

Implement the FP-MCP-133 request target execution commit contract for newly created OpenCode request artifacts.

This packet answers one question:

Can ForgePilot create future request artifacts with an explicit execution target commit without mutating existing request artifacts or enabling execution?

## Background

FP-MCP-131 selected approval commit binding Option D:

```text
approval evidence binds to approvedTargetExecutionCommit
```

FP-MCP-132 implemented target commit comparison in the local guarded preflight evaluator.

FP-MCP-133 defined explicit request target semantics:

```text
request.targetExecutionCommit
```

FP-MCP-134 updates the request artifact creation path so new request artifacts carry that field directly.

## Scope

Allowed:

- Modify the MCP bridge request artifact creation path.
- Add `targetExecutionCommit` to newly created request artifacts.
- Set `targetExecutionCommit` to the repository commit intended for execution.
- For current non-executing request artifacts, this should equal the current ForgePilot repository commit at request creation time unless a future caller explicitly supplies a target.
- Preserve existing provenance fields such as `baseCommit`.
- Add compatibility fields if useful, such as `approvedTargetExecutionCommit`.
- Update validation or local preflight helpers if needed to recognize `targetExecutionCommit`.
- Run build or syntax checks.
- Create one new non-executing request artifact to verify the new field.
- Commit that new request artifact.
- Record evidence under `runs/FP-MCP-134/`.

Forbidden:

- Do not mutate FP-MCP-117 request artifacts.
- Do not mutate FP-MCP-126 approval artifacts.
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
- Do not mutate existing approval artifacts.
- Do not mutate pre-start evidence.
- Do not mutate state snapshot evidence.
- Do not implement `PRESENT_GUARDED`.
- Do not implement `CALLABLE_GUARDED`.
- Do not implement real guarded start.
- Do not relax the disable switch.

## Required Request Artifact Semantics

New request artifacts must include:

```json
{
  "targetExecutionCommit": "<commit sha>"
}
```

The value must be the intended execution target commit.

For the current MCP bridge request artifact creation path, unless a future explicit target is supplied:

```text
targetExecutionCommit == current ForgePilot HEAD at request creation time
```

The artifact may still include:

```text
baseCommit
creationCommit
artifactCommit
```

but these are provenance fields unless explicitly used as target fields.

## Backward Compatibility

Existing request artifacts must not be modified.

Evaluators may continue to support legacy fallback:

```text
baseCommit
creationCommit
```

but new artifacts should not require fallback.

## Verification Request Artifact

Create one new non-executing request artifact for this packet using:

```json
{
  "packetId": "FP-MCP-134",
  "modelId": "deepseek-v4-pro-high",
  "runMode": "DESIGN_ONLY",
  "approval": "CREATE_REQUEST_ARTIFACT"
}
```

The artifact must show:

```text
executionStarted: false
targetExecutionCommit: <current ForgePilot commit at creation>
```

The artifact must not start OpenCode or contact the runner start endpoint.

## Expected Follow-Up

After FP-MCP-134, a future packet can create approval evidence bound to this new request artifact's `targetExecutionCommit` and run local preflight to verify target binding can pass.

## Verification

Verification must show:

- bridge implementation changed
- build or syntax check passed
- a new request artifact was created
- new request artifact contains `targetExecutionCommit`
- `targetExecutionCommit` is concrete
- old request artifacts were not mutated
- execution remains disabled
- runner start endpoint was not contacted
- OpenCode was not started
- approval was not consumed
- no approval artifacts were mutated
- ForgePilot evidence recorded

## Evidence

Record:

- `runs/FP-MCP-134/implementation-evidence.md`
- `runs/FP-MCP-134/request-artifact.md`
- `runs/FP-MCP-134/verification.txt`

## Success Criteria

This packet is successful if:

1. New request artifact creation includes `targetExecutionCommit`.
2. Existing request artifacts are not mutated.
3. A new FP-MCP-134 request artifact is created and committed.
4. The request artifact has `executionStarted: false`.
5. The request artifact has a concrete `targetExecutionCommit`.
6. Build or syntax check passes.
7. Runner start endpoint is not contacted.
8. OpenCode is not started.
9. Approval is not consumed.
10. Verification passes.

## Non-goals

This packet does not update old request artifacts.

This packet does not create matching approval evidence.

This packet does not run a passing approval preflight.

This packet does not consume approval.

This packet does not implement approval consumption.

This packet does not enable execution.

This packet does not make start callable.

This packet does not add start to supported operations.

This packet does not implement `PRESENT_GUARDED`.

This packet does not implement `CALLABLE_GUARDED`.

This packet does not perform a remote runner start.
