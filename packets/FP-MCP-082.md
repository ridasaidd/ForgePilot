# FP-MCP-082 — OpenCode Start Request Artifact Creation

## Status

DRAFT

## Type

Implementation packet, non-executing

## Depends On

- FP-MCP-001 — OpenCode executor boundary
- FP-MCP-002 — Read-only OpenCode discovery boundary
- FP-MCP-044 — Execution disable switch status policy
- FP-MCP-070 — Single-use approval consumption contract
- FP-MCP-071 — Append-only consumption recorder
- FP-MCP-072 — Validator rejects consumed approval
- FP-MCP-073 — Preflight rejects consumed approval
- FP-MCP-074 — Start path rejects consumed approval
- FP-MCP-075 — Human approval consumption readiness checkpoint
- FP-MCP-076 — Post-consumption blocked-attempt classification
- FP-MCP-077 — Successful-start consumption handoff contract
- FP-MCP-078 — Execution enablement readiness review
- FP-MCP-079 — Ambiguous start-state classification contract
- FP-MCP-080 — Execution recovery and quarantine contract
- FP-MCP-081 — OpenCode start tool implementation boundary

## Current Observed State

At the time this packet is defined, the MCP bridge is not execution-capable.

Repository status:

```text
repo: ForgePilot
repoPath: /home/ridasaidd/forgepilot
branch: main
commit: fd897f4
workingTreeClean: true
FP-MCP-081 present: true
```

OpenCode status:

```text
opencodeDiscoveryConfigured: true
opencodeExecutionEnabled: false
liveOpenCodeChecked: false
supportedRunModes:
- DESIGN_ONLY
allowedModels:
- deepseek-v4-pro-high
- qwen-3.7-max
executionDisabledReason:
FP-MCP-002 is read-only discovery only. Executor start tools are not implemented.
```

Remote runner status:

```text
runnerConfigured: true
runnerReachable: true
executionEnabled: false
supportedOperations:
- capabilities
- validate-request
supportedRunModes:
- DESIGN_ONLY
allowedModels:
- deepseek-v4-pro-high
- qwen-3.7-max
```

Execution disable switch status:

```text
globalDisableActive: true
executionAllowedNow: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
startEndpointContacted: false
opencodeStarted: false
runnerRunIdCreated: false
effectiveDisableReason: EXECUTION_DISABLED_GLOBAL
```

---

## Task

Implement the first non-executing layer of MCP-side OpenCode start tooling:

durable OpenCode start-request artifact creation.

FP-MCP-082 answers one question:

> Can ForgePilot create a durable, scoped, non-executing OpenCode start-request artifact without enabling execution or contacting any start endpoint?

FP-MCP-082 is implementation work, but only for Layer 1 from FP-MCP-081.

FP-MCP-082 must not implement validation beyond the minimum required to safely create the request artifact.

FP-MCP-082 must not implement start preflight.

FP-MCP-082 must not implement controlled start attempt.

FP-MCP-082 must not enable execution.

---

## Goal

Create a durable request artifact under:

```text
runs/<packetId>/opencode-requests/<requestId>.json
```

The request artifact must record that the request was created but not started.

Expected result:

```text
opencodeStartRequestArtifactCreated: true
requestState: CREATED_NOT_STARTED
executionEnablementAuthorized: false
runnerStartEndpointContactAuthorized: false
executionAllowedNow: false
globalDisableActive: true
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
startEndpointContacted: false
opencodeStarted: false
runnerRunIdCreated: false
approvalConsumed: false
approvalEvidenceCreated: false
consumptionEvidenceCreated: false
```

This is a successful result.

---

## Scope

FP-MCP-082 may implement or complete only a non-executing request artifact creation path.

Allowed implementation work:

```text
add or complete a create-request MCP tool
create a durable JSON request artifact
create the packet run directory if missing
create runs/<packetId>/opencode-requests/ if missing
generate a requestId
record current repository branch
record current repository commit
record current OpenCode non-execution status
record current runner non-execution status
record current execution disable switch status
record allowed requested model and run mode
record expected artifacts declared by this packet
record required verification declared by this packet
record allowed and forbidden action classes
return the request artifact path and non-executing state
```

The implementation may reuse existing utility code if present.

The implementation must preserve the current supported run mode:

```text
DESIGN_ONLY
```

The implementation must preserve the current model allowlist:

```text
deepseek-v4-pro-high
qwen-3.7-max
```

---

## Required Request Artifact Contract

A created request artifact must be JSON.

The artifact path must be:

```text
runs/<packetId>/opencode-requests/<requestId>.json
```

The request id must be unique enough for repeated request creation.

Recommended format:

```text
REQ-<UTC timestamp>-<opaque suffix>
```

The artifact must include at least:

```text
schemaVersion
artifactType
packetId
requestId
requestedModelId
requestedRunMode
requestState
createdAt
createdByTool
repoBranch
repoCommit
expectedArtifacts
requiredVerification
forbiddenActions
allowedActions
approvalRequired
approvalId
approvalPath
consumptionRequired
consumptionId
runnerStartEndpointContactAuthorized
executionEnablementAuthorized
executionAllowedNow
globalDisableActive
runnerExecutionEnabled
opencodeExecutionEnabled
startEndpointContacted
opencodeStarted
runnerRunId
globalDisableReason
statusSources
boundaryVersion
```

Required fixed values for this packet:

```text
schemaVersion: FP-MCP-082
artifactType: opencode-start-request
requestState: CREATED_NOT_STARTED
createdByTool: forgepilot_create_opencode_run_request
runnerStartEndpointContactAuthorized: false
executionEnablementAuthorized: false
executionAllowedNow: false
startEndpointContacted: false
opencodeStarted: false
runnerRunId: null
approvalRequired: true
approvalId: null
approvalPath: null
consumptionRequired: true
consumptionId: null
globalDisableActive: true
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
boundaryVersion: FP-MCP-081
```

---

## Required Expected Artifacts Field

The request artifact must declare the expected artifacts for an eventual FP-MCP-082 execution report.

Required value:

```text
expectedArtifacts:
- packets/FP-MCP-082.md
- docs/opencode-start-request-artifact-creation.md
- runs/FP-MCP-082/implementation-result.json
- runs/FP-MCP-082/executor-result.md
- runs/FP-MCP-082/verification.txt
```

The request artifact itself is additional evidence and must be written under:

```text
runs/FP-MCP-082/opencode-requests/<requestId>.json
```

---

## Required Verification Field

The request artifact must declare the verification requirements that apply before FP-MCP-082 may be considered complete.

Required verification entries:

```text
repository status was checked
FP-MCP-081 packet exists
OpenCode status was checked without starting OpenCode
remote runner status was checked without contacting start endpoint
execution disable switch status was checked
request artifact exists
request artifact is valid JSON
request artifact packetId equals FP-MCP-082
request artifact requestedRunMode equals DESIGN_ONLY
request artifact requestedModelId is allowlisted
request artifact requestState equals CREATED_NOT_STARTED
request artifact executionAllowedNow equals false
request artifact globalDisableActive equals true
request artifact runnerExecutionEnabled equals false
request artifact opencodeExecutionEnabled equals false
request artifact startEndpointContacted equals false
request artifact opencodeStarted equals false
request artifact runnerRunId equals null
approval was not consumed
approval evidence was not created
consumption evidence was not created
existing approval evidence was not mutated
existing consumption evidence was not mutated
```

---

## Allowed Actions

FP-MCP-082 permits only:

```text
read repository status
read packet list
read OpenCode status without starting OpenCode
read remote runner capabilities without contacting start endpoint
read execution disable switch status
create a non-executing request artifact
create parent directories for the request artifact
write implementation result artifact
write executor result artifact
write verification artifact
commit packet artifact
commit run artifacts after verification
```

---

## Forbidden Actions

FP-MCP-082 must not:

```text
enable execution
relax the global disable switch
contact runner start endpoint
start OpenCode
create runnerRunId
run model providers
consume approval
create real approval evidence
create consumption evidence
mutate approval evidence
mutate consumption evidence
mark execution as started
implement full start preflight
implement controlled start attempt
implement telemetry persistence
change runner configuration
change OpenCode configuration
change allowed model list
change supported run mode list
refactor server.ts
```

Any tool or code path that attempts one of these actions must fail closed.

---

## Required Tool Behavior

The create-request tool must require explicit non-executing authorization text.

Required authorization argument:

```text
approval: CREATE_REQUEST_ARTIFACT
```

The tool must reject creation if the authorization argument is missing or different.

This authorization text is not approval to execute.

This authorization text is only permission to create a durable non-executing request artifact.

---

## Required Input Rejection

The create-request path must reject:

```text
missing packetId
missing modelId
missing runMode
modelId not in allowlist
runMode other than DESIGN_ONLY
packetId path traversal
request path traversal
approval text other than CREATE_REQUEST_ARTIFACT
```

Rejected requests must not create request artifacts.

Rejected requests must not contact runner start endpoint.

Rejected requests must not start OpenCode.

Rejected requests must not mutate approval or consumption evidence.

---

## Required Non-Execution Claims

FP-MCP-082 completion artifacts must explicitly claim:

```text
opencodeStartRequestArtifactCreated: true
requestState: CREATED_NOT_STARTED
requestArtifactPath: <path>
requestedRunMode: DESIGN_ONLY
requestedModelIdAllowlisted: true
runnerStartEndpointContactAuthorized: false
executionEnablementAuthorized: false
executionAllowedNow: false
globalDisableActive: true
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
startEndpointContacted: false
opencodeStarted: false
runnerRunIdCreated: false
approvalConsumed: false
approvalEvidenceCreated: false
consumptionEvidenceCreated: false
approvalArtifactMutated: false
consumptionArtifactMutated: false
serverTsRefactored: false
```

---

## Verification Requirements

Verification must include:

1. Repository status.
2. Packet list confirmation that FP-MCP-081 and FP-MCP-082 exist.
3. OpenCode status.
4. Remote runner capability status.
5. Execution disable switch status.
6. Creation of exactly one non-executing request artifact for FP-MCP-082.
7. Confirmation that the request artifact exists at the required path.
8. Confirmation that the request artifact is valid JSON.
9. Confirmation that the request artifact records `CREATED_NOT_STARTED`.
10. Confirmation that requested run mode is `DESIGN_ONLY`.
11. Confirmation that requested model is allowlisted.
12. Confirmation that execution remains disabled.
13. Confirmation that the global disable switch remains active.
14. Confirmation that the runner start endpoint was not contacted.
15. Confirmation that OpenCode was not started.
16. Confirmation that no runnerRunId was created.
17. Confirmation that no approval was consumed.
18. Confirmation that no approval evidence was created.
19. Confirmation that no consumption evidence was created.
20. Confirmation that existing approval and consumption evidence were not mutated.
21. Confirmation that `server.ts` was not refactored.

Expected verification result:

```text
opencodeStartRequestArtifactCreated: true
requestArtifactValid: true
requestState: CREATED_NOT_STARTED
requestedRunMode: DESIGN_ONLY
executionAllowedNow: false
globalDisableActive: true
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
startEndpointContacted: false
opencodeStarted: false
runnerRunIdCreated: false
approvalConsumed: false
approvalEvidenceCreated: false
consumptionEvidenceCreated: false
approvalArtifactMutated: false
consumptionArtifactMutated: false
serverTsRefactored: false
```

---

## Expected Artifacts

FP-MCP-082 should record:

```text
packets/FP-MCP-082.md
docs/opencode-start-request-artifact-creation.md
runs/FP-MCP-082/opencode-requests/<requestId>.json
runs/FP-MCP-082/implementation-result.json
runs/FP-MCP-082/executor-result.md
runs/FP-MCP-082/verification.txt
```

Packet creation should be committed first by itself.

Implementation and run artifacts should be committed in a later step.

---

## Non-Goals

FP-MCP-082 must not:

```text
enable execution
relax the global disable switch
contact runner start endpoint
start OpenCode
create a runnerRunId
run OpenCode
run any model provider
consume approval
create real approval evidence
create consumption evidence
mutate approval evidence
mutate consumption evidence
implement start preflight
implement controlled start attempt
implement execution telemetry persistence
implement packet registry
implement prior-art discovery
implement flash model routing
refactor server.ts
```

---

## Non-Authorization Statement

FP-MCP-082 does not authorize execution.

FP-MCP-082 does not authorize runner start endpoint contact.

FP-MCP-082 does not authorize OpenCode start.

FP-MCP-082 does not authorize approval consumption.

FP-MCP-082 does not authorize approval or consumption evidence mutation.

FP-MCP-082 authorizes only durable non-executing OpenCode start-request artifact creation.

