# FP-MCP-104 — Runner Start Capability Contract Definition

## Task

Define the ForgePilot remote runner start capability contract before implementing or enabling any start operation.

## Goal

Specify what the remote runner must advertise, validate, record, and guarantee before ForgePilot may safely expose or call a runner start capability.

This packet answers one question:

What must be true before a validated request artifact can become a controlled remote runner start attempt?

## Background

FP-MCP-103 observed the current remote runner capability gap.

Observed runner status:

- runnerConfigured: true
- runnerReachable: true
- runnerVersion: 0.1.0-fp-mcp-024
- runnerProtocolVersion: forgepilot-runner-v1
- executionEnabled: false
- supportedOperations:
  - capabilities
  - validate-request

The runner is reachable and accepts validation-only request checks.

The runner does not currently advertise a start operation.

Execution remains blocked by policy and capability gates:

- RUNNER_EXECUTION_CAPABILITY_NOT_PRESENT
- OPENCODE_BOUNDARY_UNSATISFIED
- SECRET_BOUNDARY_UNSATISFIED
- NETWORK_BOUNDARY_UNSATISFIED
- HUMAN_APPROVAL_NOT_RECORDED
- RUNNER_EXECUTION_DISABLED
- OPENCODE_EXECUTION_DISABLED

FP-MCP-104 defines the contract that must exist before runner start capability is implemented or advertised.

## Scope

Allowed:

- Define the runner start capability contract.
- Define required capability advertisement fields.
- Define required start request input fields.
- Define required pre-start validation gates.
- Define required request artifact verification.
- Define required approval evidence verification.
- Define required targetExecutionCommit and evidenceLedgerCommit handling.
- Define required pre/post state evidence.
- Define required failure behavior.
- Define required output fields.
- Define safety invariants.
- Record evidence under `runs/FP-MCP-104/`.

Forbidden:

- Do not implement runner start capability.
- Do not expose a start operation.
- Do not enable execution.
- Do not relax the global disable switch.
- Do not create approval evidence.
- Do not consume approval.
- Do not contact the runner start endpoint.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create a runner run id.
- Do not mutate request artifacts.
- Do not change production MCP behavior.

## Required Capability Advertisement

A runner that supports controlled start must explicitly advertise a start operation.

The capabilities response must include:

- runnerVersion
- runnerProtocolVersion
- executionEnabled
- supportedOperations
- supportedRunModes
- allowedModels
- startCapability
- startCapabilityVersion
- startRequiresApprovalEvidence
- startRequiresPreflight
- startRequiresDisableSwitchClear
- startRequiresRequestArtifactHash
- startRequiresTargetExecutionCommit
- startRequiresEvidenceLedgerValidation
- startRecordsPreStartState
- startRecordsPostStartState
- startReturnsRunnerRunId

A runner must not imply start support through validate-request support.

Validation support and start support are separate capabilities.

## Required Supported Operation

The start operation must have an explicit operation name.

Allowed candidate names:

- start-request
- guarded-start
- start-opencode-run

The exact name may be chosen later, but it must be explicit and versioned.

The operation must not be inferred from:

- capabilities
- validate-request

## Required Start Request Inputs

A start request must include:

- packetId
- requestId
- requestArtifactPath or request artifact identity
- requestArtifactSha256
- approvalId
- approvalPacketId or approval path
- modelId
- runMode
- targetExecutionCommit
- evidenceLedgerCommit
- branch
- operator intent token or exact approval string
- preflight artifact identity, if required by policy

## Required Request Artifact Validation

Before start, the runner must verify:

- request artifact exists
- request artifact JSON parses
- request artifact schema is valid
- request artifact hash matches supplied hash
- request packet id matches
- request id matches
- model id matches
- run mode matches
- request lifecycle allows handoff
- request artifact directory is safe
- request artifact was not mutated after validation
- artifact commit is reachable
- creation commit exists
- artifact commit exists
- creation commit is ancestor of artifact commit

## Required Approval Evidence Validation

Before start, the runner or preflight authority must verify:

- approval artifact exists
- approval artifact is committed
- approval artifact schema is valid
- approval type is real human approval evidence
- approval state is recorded
- approval scope matches request id
- approval scope matches model id
- approval scope matches run mode
- approval scope matches branch
- approval scope matches targetExecutionCommit
- approval canonical text matches targetExecutionCommit
- approval is not expired
- approval is not revoked
- approval is not quarantined
- approval is single-use
- approval has not already been consumed if consumption-before-start is forbidden by policy
- approval artifact has not been mutated

## Required Commit Handling

Runner start must distinguish:

- targetExecutionCommit
- evidenceLedgerCommit

### targetExecutionCommit

The code state authorized for model execution.

OpenCode must run against this commit or a verified equivalent checkout.

### evidenceLedgerCommit

The repository state containing request, approval, validation, and pre-start evidence.

The evidence ledger commit must not silently become the execution target.

### Evidence-only descendant rule

If evidenceLedgerCommit differs from targetExecutionCommit, start may proceed only if:

1. evidenceLedgerCommit descends from targetExecutionCommit.
2. every changed path is an allowed evidence path.
3. no executable/project behavior changed.
4. request artifacts were not mutated.
5. approval artifacts were not mutated.
6. consumption artifacts were not mutated.

If any non-evidence path changed, start must fail closed.

## Required Preflight Gate

Runner start must require a successful guarded preflight result.

Preflight must confirm:

- request artifact valid
- approval evidence valid
- approval usable for execution
- targetExecutionCommit valid
- evidenceLedgerCommit compatible
- disable switch clear
- runner execution enabled
- OpenCode execution enabled
- OpenCode boundary satisfied
- secret boundary satisfied
- network boundary satisfied
- artifact recording path ready
- audit/admission path defined

Start must not perform its own optimistic interpretation if preflight is missing or stale.

## Required Disable Switch Behavior

Start must fail closed if any disable switch blocks execution.

Start must record:

- globalDisableActive
- packetDisableActive
- requestDisableActive
- modelDisableActive
- runModeDisableActive
- operatorDisableActive
- effectiveDisableReason
- effectiveDisableScope
- precedenceApplied

Start must not override disable switch state.

## Required Pre-Start Evidence

Before launching OpenCode, runner start must record or verify:

- request artifact identity
- approval artifact identity
- preflight artifact identity
- repo status
- targetExecutionCommit
- evidenceLedgerCommit
- working tree state
- intended model id
- intended run mode
- intended artifact output directory
- disable switch state
- OpenCode process absence or baseline status
- runner process identity
- timestamp

## Required Post-Start Evidence

After a successful start, runner start must record:

- runnerRunId
- process id or safe process handle if allowed
- startedAt
- modelId
- runMode
- targetExecutionCommit
- artifact output directory
- command envelope or redacted command identity
- environment boundary summary
- executionStarted: true
- startEndpointContacted: true
- opencodeStarted: true only if OpenCode process actually started

If start fails before launching OpenCode, runnerRunId must be null unless a durable failed-run id is explicitly defined by contract.

## Required Output Fields

Start response must include:

- schemaVersion
- runnerProtocolVersion
- startCapabilityVersion
- packetId
- requestId
- approvalId
- requestArtifactSha256
- targetExecutionCommit
- evidenceLedgerCommit
- executionAllowedNow
- executionPermitted
- executionStarted
- startEndpointContacted
- opencodeStarted
- runnerRunId
- preflightArtifactPath
- preStartEvidencePath
- postStartEvidencePath
- artifactDir
- gates
- reasons
- checkedAt
- startedAt, if started

## Failure Behavior

Start must fail closed if:

- capability is not advertised
- executionEnabled is false
- global disable switch active
- runner execution disabled
- OpenCode execution disabled
- approval missing
- approval invalid
- approval expired
- approval consumed when policy requires unused approval
- request artifact invalid
- request artifact hash mismatch
- targetExecutionCommit missing
- evidenceLedgerCommit incompatible
- non-evidence changes present
- preflight missing
- preflight stale
- OpenCode boundary unsatisfied
- secret boundary unsatisfied
- network boundary unsatisfied
- artifact directory unsafe
- audit/admission path missing

Failure must not start OpenCode.

Failure must not create a successful runnerRunId.

Failure must return structured reasons.

## Safety Invariants

The start capability must preserve these invariants:

- validate-request never starts execution
- capabilities never starts execution
- preflight never starts execution
- start operation is the only operation allowed to launch OpenCode
- start operation requires explicit approval evidence
- start operation requires all gates to pass
- start operation fails closed
- request artifacts are immutable evidence
- approval artifacts are immutable evidence
- consumption is append-only evidence
- runnerRunId is created only according to contract
- execution state is observed, not assumed

## Required Evidence for This Packet

Record:

- `runs/FP-MCP-104/runner-start-capability-contract.md`
- `runs/FP-MCP-104/verification.txt`

## Success Criteria

This packet is successful if:

1. The runner start capability contract is defined.
2. Capability advertisement requirements are explicit.
3. Start request input requirements are explicit.
4. Request artifact validation requirements are explicit.
5. Approval evidence validation requirements are explicit.
6. targetExecutionCommit and evidenceLedgerCommit behavior is explicit.
7. Pre-start and post-start evidence requirements are explicit.
8. Failure behavior is fail-closed.
9. No start capability is implemented.
10. No execution is started.
11. No runner start endpoint is contacted.
12. OpenCode is not started.

## Non-goals

This packet does not implement runner start capability.

This packet does not advertise start support.

This packet does not authorize execution.

This packet does not create approval evidence.

This packet does not consume approval.

This packet does not relax the disable switch.

This packet does not enable runner execution.

This packet does not enable OpenCode execution.

This packet does not perform a remote runner start.

This packet does not implement FP-MCP-102.
