# Execution Pre-Start Evidence Contract

Packet: FP-MCP-050  
Status: Contract only  
Execution impact: None  
Boundary: No runner start endpoint contact, no OpenCode start, no model execution

## Purpose

This document defines the evidence that must exist immediately before any future ForgePilot remote runner start request can be considered eligible.

The pre-start evidence record is not permission to execute. It is an observation artifact proving that the bridge evaluated the required gates before a start attempt could occur.

## Governing Principles

This contract preserves the following ForgePilot principles:

- P01 — ForgePilot records observations, not narratives.
- P02 — Trust cannot be retroactively created.
- P03 — ForgePilot does not optimize for favorable outcomes.
- P04 — Only admitted evidence may influence observatory outputs.
- P06 — Classification follows observation.

## Scope

This contract defines only the pre-start evidence artifact shape, required observations, validation expectations, and rejection semantics.

It does not enable execution, create human approvals, contact the runner start endpoint, invoke OpenCode, call model providers, admit evidence, rank models, or alter execution policy.

## Artifact Location

A future pre-start evidence artifact must be repository-relative and packet scoped:

```text
runs/<packetId>/pre-start-evidence/<requestId>.json
```

The path must be safe, normalized, and confined under the matching packet run directory.

## Artifact Identity

A pre-start evidence artifact must include:

```json
{
  "schemaVersion": "FP-MCP-050",
  "artifactType": "pre-start-evidence",
  "packetId": "FP-MCP-036",
  "requestId": "REQ-YYYYMMDDTHHMMSSmmmZ-xxxxxxxx",
  "createdAt": "ISO-8601 timestamp",
  "boundaryVersion": "FP-MCP-050",
  "statusSource": "ForgePilot pre-start evidence policy"
}
```

The `packetId` and `requestId` must exactly match the request being evaluated.

## Required Observations

A valid pre-start evidence artifact must record all of the following observations before a future start attempt could be considered:

```json
{
  "requestArtifactPath": "runs/<packetId>/opencode-requests/<requestId>.json",
  "requestArtifactSha256": "sha256 hex string or null",
  "baseCommit": "short git commit or null",
  "currentCommit": "short git commit or null",
  "artifactDir": "runs/<packetId>/<modelId>-<runMode>/ or null",
  "modelId": "model id or null",
  "runMode": "run mode or null",
  "approvalAccepted": false,
  "localValidationPassed": false,
  "remoteValidationPassed": false,
  "preflightEligible": false,
  "disableSwitchStatusEvaluated": true,
  "disableSwitchActive": true,
  "effectiveDisableReason": "EXECUTION_DISABLED_GLOBAL",
  "effectiveDisableScope": "GLOBAL",
  "runnerConfigured": true,
  "runnerContacted": false,
  "startEndpointContacted": false,
  "opencodeStarted": false,
  "executionStarted": false,
  "preStartStateRecorded": true,
  "postStartStateRecorded": false,
  "reasons": []
}
```

Values may differ depending on the request, but the fields must be present. Start-related booleans must remain false in the current non-executing phase.

## Required Safety Invariants

A pre-start evidence artifact is invalid if any of the following are true:

```text
startEndpointContacted: true
opencodeStarted: true
executionStarted: true
runnerRunId is non-null
postStartStateRecorded: true
```

During the current gated phase, the artifact must show:

```text
disableSwitchStatusEvaluated: true
disableSwitchActive: true
preflightEligible: false
startEndpointContacted: false
executionStarted: false
```

## Gate Relationship

Pre-start evidence must be downstream of these observations:

```text
request artifact validation
approval validation
remote runner validation policy
execution preflight validation
disable switch status
```

The evidence artifact records the state of those gates. It must not mutate the request artifact, approval artifact, or execution policy.

## Disable Switch Precedence

The disable switch has absolute precedence over start eligibility.

If the disable switch is active, the pre-start evidence artifact must include:

```text
START_REQUEST_BLOCKED_BY_DISABLE_SWITCH
DISABLE_SWITCH_ACTIVE
EXECUTION_NOT_ALLOWED
```

The start endpoint must not be contacted even if the request artifact, approval string, runner capability, and preflight inputs are otherwise valid.

## Rejection Reason Requirements

The artifact must preserve observed rejection reasons without collapsing them into a single status.

Examples:

```text
START_REQUEST_BLOCKED_BY_DISABLE_SWITCH
START_APPROVAL_REJECTED
APPROVAL_REQUIRED
START_REQUEST_ARTIFACT_REJECTED
START_REQUEST_ARTIFACT_MISSING
START_REQUEST_LIFECYCLE_INVALID
INVALID_REQUEST_ID
UNKNOWN_REQUEST
```

Multiple reasons may be present simultaneously. Disable-switch blocking must not erase artifact or approval rejection observations.

## Non-Retroactivity

A pre-start evidence artifact must be created before a future start attempt. It cannot be generated after execution and then used to claim that the start was properly gated.

If pre-start evidence is missing, malformed, or created after start contact, the run must be treated as non-compliant for this contract.

## Validation Rules

A validator for this contract should check:

1. The path is safe and packet scoped.
2. The JSON is parseable.
3. `schemaVersion` equals `FP-MCP-050`.
4. `artifactType` equals `pre-start-evidence`.
5. `packetId` and `requestId` match the evaluated request.
6. Required observation fields are present.
7. Start-related booleans remain false in the current gated phase.
8. Disable-switch fields are present and active.
9. Rejection reasons are preserved.
10. No post-start evidence is claimed.

## Current Expected Output

For the current ForgePilot MCP phase, any pre-start evidence check should preserve this shape:

```json
{
  "preStartEvidenceContractDefined": true,
  "preStartEvidenceRequired": true,
  "preStartEvidenceRecorded": false,
  "executionAllowedNow": false,
  "startEndpointContacted": false,
  "opencodeStarted": false,
  "executionStarted": false
}
```

## Out of Scope

This contract does not define:

- real execution enablement,
- approval creation,
- approval consumption,
- runner start contact,
- OpenCode invocation,
- model provider calls,
- post-start artifact recording,
- admission into evidence,
- routing or model selection.

## Closure Criteria

FP-MCP-050 is complete when:

1. this contract exists under `docs/pre-start-evidence-contract.md`,
2. the repository remains clean after commit,
3. execution remains disabled,
4. no start endpoint contact occurs,
5. verification artifacts record the expected non-executing state.
