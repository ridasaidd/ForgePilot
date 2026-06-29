# FP-MCP-083 — OpenCode Request Artifact Contract Upgrade

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
- FP-MCP-082 — OpenCode start request artifact creation

## Current Observed State

FP-MCP-082 created a durable non-executing request artifact, but the request artifact did not satisfy the expanded FP-MCP-082 contract.

Observed FP-MCP-082 result:

```text
result: BLOCKED_CONTRACT_MISMATCH
requestId: REQ-20260629T131053102Z-5f58e3e3
requestArtifactPath: runs/FP-MCP-082/opencode-requests/REQ-20260629T131053102Z-5f58e3e3.json
observedSchemaVersion: FP-MCP-007
expectedSchemaVersion: FP-MCP-082
observedBoundaryVersion: FP-MCP-007
expectedBoundaryVersion: FP-MCP-081
executionStarted: false
```

Current repository status:

```text
repo: ForgePilot
branch: main
commit: dbcea45
workingTreeClean: true
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
effectiveDisableReason: EXECUTION_DISABLED_GLOBAL
```

---

## Task

Upgrade the non-executing OpenCode request artifact creation implementation so the create-request tool emits the expanded request artifact contract required by FP-MCP-082.

FP-MCP-083 answers one question:

> Can the existing create-request tool write the FP-MCP-082 request artifact shape while preserving all current non-execution guarantees?

FP-MCP-083 is an implementation packet.

FP-MCP-083 must modify only the request artifact creation layer.

FP-MCP-083 must not implement start preflight.

FP-MCP-083 must not implement controlled start attempt.

FP-MCP-083 must not enable execution.

---

## Goal

After FP-MCP-083, invoking the create-request tool for a new packet must produce a durable request artifact with the expanded FP-MCP-082-compatible contract.

Expected request artifact fields include:

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

Expected fixed values for newly created request artifacts:

```text
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
```

This is still non-executing request creation only.

---

## Scope

FP-MCP-083 may change code that constructs or writes OpenCode request artifacts.

Allowed code changes:

```text
update create-request artifact JSON shape
preserve existing packetId validation
preserve existing model allowlist validation
preserve existing run mode allowlist validation
preserve DESIGN_ONLY-only behavior
preserve CREATE_REQUEST_ARTIFACT authorization requirement
add explicit non-execution fields to the artifact
add explicit approval-required placeholders
add explicit consumption-required placeholders
add explicit status source fields
add explicit branch and commit fields if missing
add or update tests for the new artifact shape
```

Allowed documentation and artifact changes:

```text
docs/opencode-request-artifact-contract-upgrade.md
runs/FP-MCP-083/implementation-result.json
runs/FP-MCP-083/executor-result.md
runs/FP-MCP-083/verification.txt
```

Code changes should be delivered as a git patch.

Non-code artifacts may be created as normal files.

---

## Required Backward Compatibility

The implementation must not break existing read or validation tools for older request artifacts.

Existing FP-MCP-007-shaped artifacts must remain readable.

A validator may classify old artifacts as legacy or contract-incomplete, but it must not crash while reading them.

If the implementation adds a new schema version, old artifacts must remain parseable.

---

## Required Non-Execution Guarantees

FP-MCP-083 must preserve these claims:

```text
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
```

No successful FP-MCP-083 result may depend on execution being enabled.

No successful FP-MCP-083 result may depend on contacting the runner start endpoint.

No successful FP-MCP-083 result may depend on live OpenCode.

---

## Required Request Artifact Contract

For a newly created request artifact, the implementation must emit JSON satisfying this contract:

```text
schemaVersion: FP-MCP-083
artifactType: opencode-start-request
packetId: <packet id>
requestId: <generated request id>
requestedModelId: <allowlisted model id>
requestedRunMode: DESIGN_ONLY
requestState: CREATED_NOT_STARTED
createdAt: <ISO-8601 UTC timestamp>
createdByTool: forgepilot_create_opencode_run_request
repoBranch: <current branch>
repoCommit: <current commit>
expectedArtifacts: <declared expected artifacts>
requiredVerification: <declared verification checks>
forbiddenActions: <declared forbidden actions>
allowedActions: <declared allowed actions>
approvalRequired: true
approvalId: null
approvalPath: null
consumptionRequired: true
consumptionId: null
runnerStartEndpointContactAuthorized: false
executionEnablementAuthorized: false
executionAllowedNow: false
globalDisableActive: true
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
startEndpointContacted: false
opencodeStarted: false
runnerRunId: null
globalDisableReason: EXECUTION_DISABLED_GLOBAL
statusSources: <structured status-source object or list>
boundaryVersion: FP-MCP-081
```

The implementation may include additional fields if they are observational and non-authorizing.

Additional fields must not imply execution permission.

Additional fields must not hide execution state.

---

## Required Input Rejection

The create-request path must continue to reject:

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

## Required Tests

Verification should include tests or scripted checks proving:

```text
new request artifact is valid JSON
new request artifact uses schemaVersion FP-MCP-083
new request artifact has artifactType opencode-start-request
new request artifact has requestState CREATED_NOT_STARTED
new request artifact records requestedModelId
new request artifact records requestedRunMode DESIGN_ONLY
new request artifact records createdByTool forgepilot_create_opencode_run_request
new request artifact records repoBranch
new request artifact records repoCommit
new request artifact records approvalRequired true
new request artifact records approvalId null
new request artifact records approvalPath null
new request artifact records consumptionRequired true
new request artifact records consumptionId null
new request artifact records runnerStartEndpointContactAuthorized false
new request artifact records executionEnablementAuthorized false
new request artifact records executionAllowedNow false
new request artifact records globalDisableActive true
new request artifact records runnerExecutionEnabled false
new request artifact records opencodeExecutionEnabled false
new request artifact records startEndpointContacted false
new request artifact records opencodeStarted false
new request artifact records runnerRunId null
old FP-MCP-007-shaped request artifact remains readable
invalid model id is rejected
invalid run mode is rejected
invalid approval text is rejected
```

Project verification must use pnpm where applicable.

---

## Verification Requirements

Verification must include:

1. Repository status before implementation.
2. Code patch review.
3. `pnpm typecheck`.
4. `pnpm test` or the narrowest available pnpm test command that covers the MCP request artifact implementation.
5. Creation of a new non-executing request artifact after the patch.
6. Read-back of the created request artifact.
7. Confirmation that the new artifact satisfies the FP-MCP-083 contract.
8. Confirmation that the created artifact remains non-executing.
9. OpenCode status after implementation.
10. Remote runner status after implementation.
11. Execution disable switch status after implementation.
12. Confirmation that the runner start endpoint was not contacted.
13. Confirmation that OpenCode was not started.
14. Confirmation that no runnerRunId was created.
15. Confirmation that no approval was consumed.
16. Confirmation that no approval evidence was created.
17. Confirmation that no consumption evidence was created.
18. Confirmation that existing approval and consumption evidence were not mutated.
19. Confirmation that `server.ts` was not broadly refactored beyond the request artifact creation path.

Expected verification result:

```text
requestArtifactContractUpgraded: true
newRequestArtifactCreated: true
newRequestArtifactValid: true
schemaVersion: FP-MCP-083
artifactType: opencode-start-request
requestState: CREATED_NOT_STARTED
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
serverTsBroadlyRefactored: false
```

---

## Expected Artifacts

FP-MCP-083 should record:

```text
packets/FP-MCP-083.md
docs/opencode-request-artifact-contract-upgrade.md
runs/FP-MCP-083/implementation-result.json
runs/FP-MCP-083/executor-result.md
runs/FP-MCP-083/verification.txt
```

If a new request artifact is created as verification evidence, it should be recorded under:

```text
runs/FP-MCP-083/opencode-requests/<requestId>.json
```

---

## Non-Goals

FP-MCP-083 must not:

```text
enable execution
relax the global disable switch
contact runner start endpoint
start OpenCode
create runnerRunId
run OpenCode
run model providers
consume approval
create real approval evidence
create consumption evidence
mutate approval evidence
mutate consumption evidence
implement full start preflight
implement controlled start attempt
implement telemetry persistence
change remote runner protocol
change runner configuration
change OpenCode configuration
change model allowlist
change supported run modes
implement packet registry
implement prior-art discovery
implement flash model routing
broadly refactor server.ts
```

---

## Non-Authorization Statement

FP-MCP-083 does not authorize execution.

FP-MCP-083 does not authorize runner start endpoint contact.

FP-MCP-083 does not authorize OpenCode start.

FP-MCP-083 does not authorize approval consumption.

FP-MCP-083 does not authorize approval or consumption evidence mutation.

FP-MCP-083 authorizes only a narrow non-executing request artifact contract upgrade.

