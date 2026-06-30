# FP-MCP-098 — Target Commit Versus Evidence Ledger Preflight Contract

## Task

Define the guarded execution preflight contract for separating target execution commit from evidence ledger commit.

## Goal

Specify how ForgePilot preflight should validate approval evidence when approval, consumption, and verification evidence are stored in the same repository as the target code.

This packet answers one question:

How should preflight evaluate approval validity when the repository HEAD has advanced only because evidence artifacts were recorded?

## Background

FP-MCP-096 showed that a valid approval can become invalid after approval and consumption evidence are committed.

Observed:

- approval repoCommit: 27c8a34
- preflight baseCommit/currentCommit: 6a77424

The approval was not expired, but preflight rejected it because evidence commits advanced HEAD.

FP-MCP-097 clarified the model:

- approval binds to targetExecutionCommit
- preflight may run at evidenceLedgerCommit
- evidenceLedgerCommit may be an allowed evidence-only descendant of targetExecutionCommit
- evidence recording must not silently alter the execution target

The next step is to define an explicit preflight contract for this distinction.

## Scope

Allowed:

- Define targetExecutionCommit versus evidenceLedgerCommit preflight behavior.
- Define allowed evidence-only descendant checks.
- Define required validation fields.
- Define invalidating conditions.
- Define expected preflight output fields.
- Define next implementation packet.
- Record contract evidence under `runs/FP-MCP-098/`.

Forbidden:

- Do not implement the contract.
- Do not create approval evidence.
- Do not consume approval.
- Do not enable execution.
- Do not relax the global disable switch.
- Do not contact the runner start endpoint.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create a runner run id.
- Do not mutate request artifacts.
- Do not change production MCP behavior.

## Contract Definitions

### targetExecutionCommit

The immutable repository commit authorized by human approval.

This is the commit the model is approved to act on.

### evidenceLedgerCommit

The repository commit at which preflight is evaluated.

This commit contains evidence artifacts such as approval records, consumption records, verification files, and preflight observations.

### evidenceOnlyDelta

The diff between targetExecutionCommit and evidenceLedgerCommit.

This diff must contain only approved evidence-path changes.

### allowedEvidenceOnlyDescendant

A state where:

1. evidenceLedgerCommit descends from targetExecutionCommit.
2. Every changed path between targetExecutionCommit and evidenceLedgerCommit is an approved evidence path.
3. No executable, packet, request, config, dependency, or source behavior changed.
4. Approval and consumption artifacts are append-only and not mutated.

## Required Preflight Inputs

Future preflight should accept or derive:

- request packet id
- request id
- approval id, if supplied
- approval packet id, if supplied or discoverable
- targetExecutionCommit
- evidenceLedgerCommit
- run mode
- model id
- branch

## Required Preflight Validation Phases

### Phase 1 — Request artifact validation

Validate:

- request artifact exists
- request artifact is structurally valid
- request lifecycle is compatible with preflight
- request model id matches expected model id
- request run mode matches expected run mode
- request artifact has not been mutated

### Phase 2 — Approval contract validation

Validate approval against targetExecutionCommit, not evidenceLedgerCommit.

Validate:

- approval artifact exists
- approval artifact is committed
- approval schema is valid
- approval type is real human approval evidence
- approval state is recorded
- approval scope matches request id, model id, run mode, branch, and targetExecutionCommit
- canonical approval text matches targetExecutionCommit
- approval is not expired
- approval is not revoked
- approval is not quarantined
- approval is single-use

### Phase 3 — Evidence ledger validation

Validate evidenceLedgerCommit relative to targetExecutionCommit.

Validate:

- targetExecutionCommit exists
- evidenceLedgerCommit exists
- evidenceLedgerCommit is equal to or descends from targetExecutionCommit
- diff from targetExecutionCommit to evidenceLedgerCommit contains only approved evidence paths
- no source code changed
- no MCP bridge code changed
- no runner code changed
- no request artifact changed
- no packet changed after approval unless explicitly allowed by packet policy
- no config changed
- no dependency or lockfile changed

### Phase 4 — Consumption evidence validation

Validate consumption evidence append-only.

Validate:

- consumption evidence exists if approval is claimed consumed
- consumption evidence is committed
- consumption evidence binds to approval id
- consumption evidence binds to request id
- consumption evidence binds to model id
- consumption evidence binds to run mode
- consumption evidence binds to targetExecutionCommit
- consumption evidence was not mutated
- approval artifact was not mutated
- consumption state is derived, not written back into approval artifact

### Phase 5 — Execution gate validation

Validate independent execution gates:

- global disable switch
- runner execution enabled
- OpenCode execution enabled
- runner identity
- runner capability
- OpenCode boundary
- secret boundary
- network boundary
- pre-start evidence
- artifact recording path
- audit/admission path

## Expected Output Fields

Future preflight should expose:

- targetExecutionCommit
- evidenceLedgerCommit
- evidenceLedgerDescendsFromTarget
- evidenceOnlyDeltaEvaluated
- evidenceOnlyDeltaValid
- evidenceOnlyChangedPaths
- nonEvidenceChangedPaths
- approvalValidatedAgainstTargetCommit
- approvalTargetCommitMatches
- approvalEvidenceLedgerCompatible
- approvalArtifactCommitted
- consumptionEvidenceLedgerCompatible
- approvalConsumedDerived
- approvalUsableForExecutionBeforeConsumption
- approvalUsableForExecutionAfterConsumption
- executionPermitted
- executionStarted
- startEndpointContacted
- opencodeStarted

## Invalidating Conditions

Preflight must reject if:

- targetExecutionCommit is missing
- evidenceLedgerCommit is missing
- evidenceLedgerCommit does not descend from targetExecutionCommit
- non-evidence paths changed between targetExecutionCommit and evidenceLedgerCommit
- source code changed after approval
- MCP bridge code changed after approval
- runner code changed after approval
- request artifact changed after approval
- approval artifact was mutated
- consumption artifact was mutated
- approval expired
- approval was revoked
- approval was quarantined
- approval scope does not match targetExecutionCommit
- canonical approval text does not match targetExecutionCommit
- consumption evidence does not bind to the same targetExecutionCommit
- global disable switch blocks execution
- runner execution is disabled
- OpenCode execution is disabled

## Contract Decision

Adopt the following rule:

Human approval authorizes a target execution commit, not arbitrary current HEAD.

Current HEAD may be used as evidence ledger state only if it is an allowed evidence-only descendant of the target execution commit.

Execution must operate against targetExecutionCommit, not evidenceLedgerCommit, unless evidenceLedgerCommit equals targetExecutionCommit or is explicitly promoted by a separate approved packet.

## Required Safety Result

This packet must preserve:

- no approval evidence created
- no approval consumed
- executionAllowedNow unchanged and effectively false
- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false
- global disable switch remains active
- no runner run id created

## Evidence

Record:

- `runs/FP-MCP-098/target-vs-ledger-preflight-contract.md`
- `runs/FP-MCP-098/verification.txt`

## Success Criteria

This packet is successful if:

1. The targetExecutionCommit and evidenceLedgerCommit contract is explicit.
2. Preflight validation phases are defined.
3. Required future output fields are defined.
4. Invalidating conditions are defined.
5. Same-repository evidence storage is supported without self-invalidating approval.
6. No execution is started.
7. The next implementation packet is identified.

## Non-goals

This packet does not implement the contract.

This packet does not create approval evidence.

This packet does not consume approval.

This packet does not relax the disable switch.

This packet does not enable execution.

This packet does not start OpenCode.

This packet does not perform a remote runner start.
