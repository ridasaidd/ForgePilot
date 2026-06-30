# FP-MCP-126 — Record Real-Shaped Human Approval Evidence Fixture

## Task

Record one real-shaped, scoped, non-consumed human approval evidence artifact for guarded start preflight testing.

## Goal

Create a committed approval evidence artifact that can be evaluated by the guarded start preflight report as real-shaped approval evidence while preserving all non-execution boundaries.

This packet answers one question:

Can ForgePilot record a real-shaped human approval evidence artifact without consuming approval or starting execution?

## Background

FP-MCP-125 defined the real-shaped human approval evidence artifact contract.

A real-shaped approval evidence artifact is an append-only observation that says:

```text
A human operator approved this specific ForgePilot guarded start request scope.
```

It is not approval consumption.

It is not execution authorization.

It is only evidence that the `humanApprovalEvidence` gate may evaluate.

FP-MCP-124 already classified the old FP-MCP-118 dry-run fixture as invalid and non-authorizing.

FP-MCP-126 creates a different artifact type:

```text
human-approval-evidence
```

This artifact must be scoped to the current request and current repository state.

## Current Request Chain Under Test

Request artifact:

- packetId: `FP-MCP-117`
- requestId: `REQ-20260630T160920008Z-195b9969`
- modelId: `deepseek-v4-pro-high`
- runMode: `DESIGN_ONLY`
- request artifact path: `runs/FP-MCP-117/opencode-requests/REQ-20260630T160920008Z-195b9969.json`
- request artifact sha256: `512a8c2c48e69b22d0e48206c9e9af65aff26d44eefded9b8ca9e6b0b064a454`

Current repo state at packet creation:

- branch: `main`
- prior commit: `d6cde2d`

## Scope

Allowed:

- Create one real-shaped human approval evidence artifact.
- Write it under `runs/FP-MCP-126/approvals/`.
- Bind it to the current request id.
- Bind it to model id `deepseek-v4-pro-high`.
- Bind it to run mode `DESIGN_ONLY`.
- Bind it to branch `main`.
- Bind it to the current repository commit at artifact creation time.
- Use canonical approval text.
- Use non-secret operator identity.
- Set expiration timestamp.
- Mark it single-use but unconsumed.
- Record artifact sha256.
- Commit the artifact.
- Record evidence under `runs/FP-MCP-126/`.

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
- Do not mutate existing approval artifacts.
- Do not mutate request artifacts.
- Do not mutate pre-start evidence.
- Do not mutate state snapshot evidence.
- Do not implement `PRESENT_GUARDED`.
- Do not implement `CALLABLE_GUARDED`.
- Do not implement real guarded start.
- Do not relax the disable switch.

## Required Artifact

Create exactly one artifact:

```text
runs/FP-MCP-126/approvals/<APPROVAL_ID>.json
```

Recommended approval id format:

```text
APPROVAL-<UTC timestamp>-<suffix>
```

The artifact must contain:

```json
{
  "schemaVersion": "FP-MCP-125",
  "artifactType": "human-approval-evidence",
  "artifactVersion": "human-approval-evidence-v1",
  "approvalId": "<APPROVAL_ID>",
  "approvalState": "VALID",
  "approvalKind": "GUARDED_START_PREFLIGHT_APPROVAL",
  "approvalText": "I approve this ForgePilot guarded start request.",
  "canonicalApprovalText": "I approve this ForgePilot guarded start request.",
  "approvedAction": "ALLOW_ONE_GUARDED_REMOTE_RUNNER_EXECUTION_ATTEMPT",
  "scope": {
    "packetId": "FP-MCP-117",
    "requestId": "REQ-20260630T160920008Z-195b9969",
    "modelId": "deepseek-v4-pro-high",
    "runMode": "DESIGN_ONLY",
    "branch": "main",
    "repoCommit": "<current-commit-at-artifact-creation>"
  },
  "operator": {
    "operatorId": "local-operator-rida",
    "operatorHandle": "rida"
  },
  "createdAt": "<ISO-8601 UTC>",
  "expiresAt": "<ISO-8601 UTC>",
  "singleUse": true,
  "consumedAt": null,
  "revokedAt": null,
  "quarantinedAt": null,
  "approvalUsableForExecution": true,
  "humanApprovalRecorded": true,
  "executionAllowedNow": false,
  "executionStarted": false,
  "opencodeStarted": false,
  "startEndpointContacted": false,
  "runnerStartEndpointContacted": false,
  "runnerRunId": null,
  "approvalConsumed": false,
  "approvalConsumptionCreated": false,
  "requestArtifactMutated": false,
  "reasons": []
}
```

## Canonical Approval Text

The artifact must contain the exact canonical text:

```text
I approve this ForgePilot guarded start request.
```

No paraphrase may be used.

## Expiration

The artifact must include an ISO-8601 UTC expiration timestamp.

For this fixture, the expiration may be set far enough in the future to allow preflight testing during this session.

Recommended:

```text
expiresAt: createdAt + 30 minutes
```

If the artifact expires before the preflight test is run, the preflight must fail.

## Non-Execution Boundary

The artifact must preserve:

```text
executionAllowedNow: false
executionStarted: false
opencodeStarted: false
startEndpointContacted: false
runnerStartEndpointContacted: false
runnerRunId: null
approvalConsumed: false
approvalConsumptionCreated: false
requestArtifactMutated: false
```

## Verification

Verification must show:

- packet committed
- one approval artifact created under `runs/FP-MCP-126/approvals/`
- artifact sha256 recorded
- artifact committed
- artifact is real-shaped, not dry-run fixture-shaped
- artifact is scoped to the current request
- artifact is scoped to the current model and run mode
- artifact is scoped to branch `main`
- artifact is scoped to the current commit at creation time
- artifact is unexpired at creation time
- approval is not consumed
- approval consumption evidence is not created
- execution remains disabled
- runner start endpoint is not contacted
- OpenCode is not started
- request artifact is not mutated

## Evidence

Record:

- `runs/FP-MCP-126/approval-artifact.md`
- `runs/FP-MCP-126/verification.txt`

## Success Criteria

This packet is successful if:

1. Exactly one real-shaped human approval evidence artifact is created.
2. The artifact follows the FP-MCP-125 contract.
3. The artifact is committed.
4. The artifact hash is recorded.
5. The artifact is scoped to the current request.
6. The artifact is not a dry-run fixture.
7. Approval remains unconsumed.
8. Approval consumption evidence is not created.
9. Execution remains disabled.
10. Runner start endpoint is not contacted.
11. OpenCode is not started.
12. Request artifact is not mutated.
13. Verification passes.

## Non-goals

This packet does not evaluate the preflight report with the new approval artifact.

That is reserved for FP-MCP-127.

This packet does not consume approval.

This packet does not implement approval consumption.

This packet does not enable execution.

This packet does not make start callable.

This packet does not add start to supported operations.

This packet does not implement `PRESENT_GUARDED`.

This packet does not implement `CALLABLE_GUARDED`.

This packet does not perform a remote runner start.
