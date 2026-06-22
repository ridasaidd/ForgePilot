# FP-MCP-053 — Start Request Evidence Gate Enforcement

## Status

DRAFT

## Type

MCP bridge safety / guarded start-path enforcement

## Summary

Require valid pre-start evidence before a start request can approach any future runner start boundary.

This packet does not enable execution.

The start request path must remain blocked by the global execution disable switch, must not contact the runner start endpoint, and must not start OpenCode. FP-MCP-053 only adds an additional evidence gate to the already-disabled start path.

This packet follows FP-MCP-050, FP-MCP-051, and FP-MCP-052.

FP-MCP-050 defined the pre-start evidence contract.
FP-MCP-051 added a read-only validator for pre-start evidence.
FP-MCP-052 added a non-executing dry-run recorder that can create a pre-start evidence artifact.
FP-MCP-053 makes the start request path observe and enforce that evidence gate.

## Goal

Make the start request path refuse to proceed unless pre-start evidence is present, valid, and consistent.

The purpose is to prevent a future implementation from accidentally treating a valid request artifact alone as sufficient to approach the runner start boundary.

After this packet, a start request must require both:

```text
requestArtifactValid: true
preStartEvidenceValid: true
```

Even when those are true, the current system must still report:

```text
executionPermitted: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerContactedForStart: false
disableSwitchActive: true
```

## Non-Goals

This packet must not:

* enable runner execution
* enable OpenCode execution
* contact the runner start endpoint
* start OpenCode
* execute a model
* create request artifacts
* create pre-start evidence artifacts
* mutate pre-start evidence artifacts
* create approval records
* weaken the global disable switch
* bypass FP-MCP-047, FP-MCP-048, FP-MCP-049, FP-MCP-051, or FP-MCP-052
* admit evidence into observatory outputs

## Required Change

Update the existing start request path:

```text
forgepilot_start_remote_runner_request
```

The tool must evaluate pre-start evidence before any possible future runner start contact.

The implementation may reuse the FP-MCP-051 validation logic, but it must not call the runner start endpoint while execution is disabled.

## Required Start-Path Behavior

For every start request, the start path must now evaluate:

1. approval string
2. request artifact validity
3. pre-start evidence validity
4. disable-switch status
5. execution permission

The start path must return structured observations for each gate.

The start path must not treat pre-start evidence validation as approval to execute.

The global disable switch remains authoritative. In the current system, even with valid pre-start evidence, start remains blocked.

## Required Output Fields

The start request output must include at least:

```text
schemaVersion
packetId
requestId
started
accepted
runnerContacted
startEndpointContacted
executionStarted
opencodeStarted
executionPermitted
approvalAccepted
localValidationPassed
requestArtifactValid
preStartEvidenceEvaluated
preStartEvidenceComplete
preStartEvidenceValid
preStartEvidencePath
preStartEvidenceArtifactPresent
preStartEvidenceMissing
preStartEvidenceInconsistent
artifactHashesPresent
artifactHashesConsistent
disableSwitchStatusEvaluated
disableSwitchActive
effectiveDisableReason
effectiveDisableScope
modelId
runMode
baseCommit
currentCommit
boundaryVersion
statusSource
checkedAt
reasons
```

The exact legacy field names may remain for backward compatibility, but the evidence-gate fields above must be present.

## Required Valid Evidence Case

Using the existing FP-MCP-036 request artifact and the FP-MCP-052 dry-run pre-start evidence artifact:

```text
packetId: FP-MCP-036
requestId: REQ-20260622T144553300Z-fbbe8d82
approval: START_REMOTE_RUNNER_REQUEST
```

Expected result:

```text
started: false
accepted: false
runnerContacted: false
startEndpointContacted: false
executionStarted: false
opencodeStarted: false
executionPermitted: false
approvalAccepted: true
requestArtifactValid: true
preStartEvidenceEvaluated: true
preStartEvidenceComplete: true
preStartEvidenceValid: true
preStartEvidenceArtifactPresent: true
artifactHashesPresent: true
artifactHashesConsistent: true
disableSwitchActive: true
```

Expected reasons must include:

```text
START_REQUEST_BLOCKED_BY_DISABLE_SWITCH
EXECUTION_DISABLED_GLOBAL
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
DISABLE_SWITCH_ACTIVE
EXECUTION_NOT_ALLOWED
```

The result must not include a pre-start evidence failure reason in this valid evidence case.

## Required Missing Evidence Case

Using an existing or synthetic request id without pre-start evidence:

```text
preStartEvidenceEvaluated: true
preStartEvidenceComplete: false
preStartEvidenceValid: false
preStartEvidenceArtifactPresent: false
started: false
startEndpointContacted: false
executionStarted: false
opencodeStarted: false
```

Expected reasons must include at least one of:

```text
PRE_START_EVIDENCE_MISSING
PRE_START_EVIDENCE_INCOMPLETE
PRE_START_EVIDENCE_INVALID
START_PRE_START_EVIDENCE_GATE_FAILED
```

If the request artifact is also invalid or missing, the output must preserve existing request-artifact rejection reasons from FP-MCP-049.

## Required Invalid Approval Case

With an invalid approval string, the output must still remain non-executing and must report approval rejection.

Expected fields:

```text
approvalAccepted: false
started: false
startEndpointContacted: false
executionStarted: false
opencodeStarted: false
```

Expected reasons must include:

```text
START_APPROVAL_REJECTED
APPROVAL_REQUIRED
```

If pre-start evidence is valid, invalid approval must not corrupt or mutate that evidence.

## Safety Requirements

The tool must preserve all of these invariants:

```text
executionPermitted: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerContactedForStart: false
```

It must not call:

```text
/runner/start
```

It must not start OpenCode.

It must not create or overwrite pre-start evidence.

It must not change runner execution enablement.

It must not change OpenCode execution enablement.

## Verification Requirements

Verification must show:

1. TypeScript build passes.
2. MCP service restarts successfully.
3. `forgepilot_start_remote_runner_request` exposes FP-MCP-053 evidence-gate fields.
4. Valid evidence case reports `preStartEvidenceValid: true` but still does not start.
5. Missing evidence case reports pre-start evidence failure and does not start.
6. Invalid approval case reports approval rejection and does not start.
7. The runner start endpoint is not contacted in any case.
8. OpenCode is not started in any case.
9. Execution remains disabled.
10. Existing pre-start evidence artifacts are not mutated.

## Evidence Artifacts

Expected run artifacts:

```text
runs/FP-MCP-053/executor-result.md
runs/FP-MCP-053/verification.txt
```

Additional evidence may include captured JSON outputs for:

```text
runs/FP-MCP-053/start-valid-evidence-result.json
runs/FP-MCP-053/start-missing-evidence-result.json
runs/FP-MCP-053/start-invalid-approval-result.json
```

## Acceptance Criteria

FP-MCP-053 is accepted only if:

* the packet is committed
* the MCP bridge implementation is committed
* start requests evaluate pre-start evidence
* valid pre-start evidence is recognized
* missing or invalid pre-start evidence blocks the start path
* invalid approval remains rejected
* execution remains disabled
* `startEndpointContacted` remains false
* `opencodeStarted` remains false
* `executionStarted` remains false
* verification artifacts are committed
