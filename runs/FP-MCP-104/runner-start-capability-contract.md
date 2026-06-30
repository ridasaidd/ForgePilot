# FP-MCP-104 Runner Start Capability Contract

Result: PASSED

Defined the remote runner start capability contract before implementing or enabling any start operation.

No start capability was implemented.

No execution was enabled.

The runner start endpoint was not contacted.

OpenCode was not started.

No approval evidence was created.

No approval was consumed.

## Background

FP-MCP-103 observed that the remote runner is reachable and supports validation-only operations.

Observed runner operations:

- capabilities
- validate-request

Not observed:

- start
- start-request
- guarded-start
- start-opencode-run

FP-MCP-104 defines the contract that must exist before a runner start capability may be implemented, advertised, enabled, or called.

## Contract decision

Validation support and start support are separate capabilities.

A runner must not imply start capability through validate-request support.

A runner may be considered start-capable only when it explicitly advertises a versioned start operation and the start operation satisfies the gates defined by this contract.

## Required capability advertisement

A start-capable runner must advertise:

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

The supported operations list must include an explicit start operation.

Acceptable candidate operation names:

- start-request
- guarded-start
- start-opencode-run

The exact operation name may be selected later, but it must be explicit, versioned, and separately advertised.

## Required start request inputs

A guarded start request must include:

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

## Required request artifact validation

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

Start must fail closed on request artifact mismatch.

## Required approval evidence validation

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

Start must fail closed on approval mismatch.

## Required commit handling

Start must distinguish:

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

## Required preflight gate

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

Start must not perform optimistic interpretation if preflight is missing or stale.

## Required disable switch behavior

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

## Required pre-start evidence

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

## Required post-start evidence

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

If start fails before launching OpenCode, runnerRunId must be null unless a durable failed-run id is explicitly defined by a later contract.

## Required output fields

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

## Failure behavior

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

## Safety invariants

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

## Implementation sequencing

The start capability should be implemented in separate future packets.

Recommended sequence:

1. start capability advertisement only, still disabled
2. start request schema validation, no execution
3. pre-start evidence dry-run, no execution
4. failed-start contract tests, no execution
5. guarded start implementation behind global disable switch
6. explicit enablement packet, if ever appropriate

## Safety result

Observed and preserved by this packet:

- no start capability implemented
- no start operation advertised
- no approval evidence created
- no approval consumed
- no execution enabled
- no global disable switch relaxed
- no runner start endpoint contacted
- no OpenCode process started
- no runner run id created
- no production behavior changed

## Conclusion

FP-MCP-104 defines the contract required before any remote runner start capability may be implemented or enabled.

The next smallest packet should implement start capability advertisement only, with execution still disabled and no start endpoint behavior.
