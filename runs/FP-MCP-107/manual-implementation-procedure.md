# FP-MCP-107 Manual Implementation Procedure

Result: PASSED

Defined the manual/local implementation procedure for FP-MCP-106 disabled start capability metadata.

No implementation was performed by this evidence record.

No execution was enabled.

The runner start endpoint was not contacted.

OpenCode was not started.

No approval evidence was created.

No approval was consumed.

## Purpose

FP-MCP-107 defines the safe manual procedure for implementing FP-MCP-106.

The intended implementation is metadata-only:

- add disabled start capability metadata to the runner capabilities response
- keep start not callable
- keep execution disabled
- keep supported operations validation-safe
- do not implement a start endpoint
- do not start OpenCode
- do not create a runner run id

## Packet chain

Relevant packet sequence:

- FP-MCP-103 observed that runner start capability is absent.
- FP-MCP-104 defined the full runner start capability contract.
- FP-MCP-105 defined advertisement-only start capability behavior.
- FP-MCP-106 narrowed the implementation to disabled metadata only.
- FP-MCP-107 defines a manual/local implementation procedure.

## Target implementation

The implementation should update the remote runner capabilities response to include disabled start metadata.

Required metadata fields:

- startCapabilityAdvertised
- startCapabilityCallable
- startCapabilityVersion
- startOperationName
- startRequiresApprovalEvidence
- startRequiresPreflight
- startRequiresDisableSwitchClear
- startRequiresRequestArtifactHash
- startRequiresTargetExecutionCommit
- startRequiresEvidenceLedgerValidation
- startRecordsPreStartState
- startRecordsPostStartState
- startReturnsRunnerRunId
- startDisabledReason
- startBlockingReasons

Expected values:

- startCapabilityAdvertised: true
- startCapabilityCallable: false
- startCapabilityVersion: guarded-start-capability-v0
- startOperationName: null
- startRequiresApprovalEvidence: true
- startRequiresPreflight: true
- startRequiresDisableSwitchClear: true
- startRequiresRequestArtifactHash: true
- startRequiresTargetExecutionCommit: true
- startRequiresEvidenceLedgerValidation: true
- startRecordsPreStartState: true
- startRecordsPostStartState: true
- startReturnsRunnerRunId: false
- startDisabledReason: START_CAPABILITY_ADVERTISEMENT_ONLY
- startBlockingReasons:
  - START_NOT_CALLABLE
  - RUNNER_EXECUTION_DISABLED
  - OPENCODE_EXECUTION_DISABLED

## Supported operations requirement

Preferred behavior:

- supportedOperations remains:
  - capabilities
  - validate-request

Start metadata must be exposed separately.

Start must not be listed as a supported operation while it is not callable.

## Manual procedure

### Step 1 — Confirm repository state

Run:

- git status --short
- git rev-parse --short HEAD

Expected:

- clean working tree

### Step 2 — Locate runner capability implementation

Inspect likely files:

- runner/server.mjs
- runner/

Identify where the capabilities response is constructed.

### Step 3 — Patch metadata only

Add disabled start metadata fields to the capabilities response.

Do not add:

- a start route
- start request handling
- OpenCode process launch behavior
- runnerRunId creation
- approval mutation
- approval consumption

### Step 4 — Run verification

Run available checks.

Possible checks:

- node --check runner/server.mjs
- pnpm test, if relevant and available
- pnpm typecheck, if relevant and available

Only run commands appropriate for the repository.

### Step 5 — Restart runner if required

If the capabilities endpoint is served by a long-running process, restart only the runner service needed to observe capabilities.

Do not enable execution.

Do not start OpenCode.

### Step 6 — Observe capabilities

Use read-only capability observation.

Expected after implementation:

- runner reachable
- capability metadata fields present
- startCapabilityAdvertised: true
- startCapabilityCallable: false
- startReturnsRunnerRunId: false
- executionEnabled: false
- supportedOperations remain validation-safe
- no start endpoint contacted
- OpenCode not started

### Step 7 — Record implementation evidence

Record:

- files changed
- command output
- syntax/type/test output
- capability observation
- safety result
- commit hash

## Safety invariants

The implementation must preserve:

- capabilities must not start execution
- validate-request must not start execution
- start must not be callable
- executionEnabled must remain false
- runnerExecutionEnabled must remain false or absent
- opencodeExecutionEnabled must remain false or absent
- executionStarted must remain false
- startEndpointContacted must remain false or not applicable
- opencodeStarted must remain false
- runnerRunId must remain null or absent
- no approval evidence created
- no approval consumed

## Safety result

Observed and preserved by this procedure record:

- no implementation performed
- no start endpoint implemented
- no start operation made callable
- no approval evidence created
- no approval consumed
- no execution enabled
- no global disable switch relaxed
- no runner start endpoint contacted
- no OpenCode process started
- no runner run id created
- no production behavior changed

## Next action

Proceed to the smallest implementation step:

- inspect runner/server.mjs
- patch capabilities metadata only
- verify syntax
- restart runner if needed
- observe capabilities
- record implementation evidence
