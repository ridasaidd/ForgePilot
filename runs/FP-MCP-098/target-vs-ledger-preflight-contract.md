# FP-MCP-098 Target Commit Versus Evidence Ledger Preflight Contract

Result: PASSED

Defined the guarded execution preflight contract for separating target execution commit from evidence ledger commit.

No approval evidence was created.

No approval was consumed.

No execution was enabled.

The global disable switch was not relaxed.

The runner start endpoint was not contacted.

OpenCode was not started.

## Problem

FP-MCP-096 showed that same-repository evidence storage can self-invalidate approval evidence.

The approval was valid when validated directly against its target commit.

After approval and consumption evidence were committed, guarded preflight evaluated at the later repository HEAD and rejected the approval due to commit/scope mismatch.

Observed in FP-MCP-096:

- approval repoCommit: 27c8a34
- post-evidence preflight baseCommit: 6a77424
- post-evidence preflight currentCommit: 6a77424

Observed blockers:

- APPROVAL_SCOPE_MISMATCH
- APPROVAL_BASE_COMMIT_BINDING_INVALID
- APPROVAL_COMMIT_BINDING_INVALID
- APPROVAL_REQUEST_BINDING_INVALID
- APPROVAL_TEXT_INVALID

APPROVAL_EXPIRED was not observed in FP-MCP-096.

Therefore the blocker was not timing. The blocker was commit-binding semantics.

## Contract decision

Human approval authorizes a target execution commit.

Human approval does not authorize arbitrary current HEAD.

Preflight may run at a later evidence ledger commit if, and only if, that commit is an allowed evidence-only descendant of the target execution commit.

Execution must operate against targetExecutionCommit unless a separate approved packet explicitly promotes a later commit as the new target.

## Definitions

### targetExecutionCommit

The immutable repository commit authorized by human approval.

This is the code state the model is approved to act on.

Approval text binds to this commit.

Execution must use this commit or a verified equivalent checkout.

### evidenceLedgerCommit

The repository commit at which preflight is evaluated.

This commit may contain evidence artifacts recorded after the target approval was created.

Evidence ledger state must not silently become execution scope.

### evidenceOnlyDelta

The diff from targetExecutionCommit to evidenceLedgerCommit.

This delta is valid only if every changed path is an approved evidence path.

### allowedEvidenceOnlyDescendant

A valid evidence ledger commit satisfying all of the following:

1. evidenceLedgerCommit exists.
2. targetExecutionCommit exists.
3. evidenceLedgerCommit equals targetExecutionCommit or descends from targetExecutionCommit.
4. changed paths between targetExecutionCommit and evidenceLedgerCommit are evidence-only.
5. no executable/project behavior changed.
6. approval artifacts were not mutated after creation.
7. consumption artifacts were not mutated after creation.
8. request artifacts were not mutated after approval.

## Allowed evidence-only paths

Allowed evidence paths include:

- runs/FP-MCP-*/
- packet-specific approval evidence artifacts
- packet-specific approval consumption artifacts
- packet-specific validation evidence artifacts
- packet-specific verification files

Potentially allowed if explicitly authorized by packet policy:

- metrics records under packet-specific paths
- comparison evidence under packet-specific paths
- audit evidence under packet-specific paths

## Forbidden paths or changes after target approval

The following must invalidate evidenceLedgerCommit compatibility:

- source code changes
- MCP bridge code changes
- runner code changes
- OpenCode execution code changes
- request artifact mutation
- packet mutation after approval unless explicitly packet-authorized
- config changes
- dependency changes
- lockfile changes
- executable behavior changes
- approval artifact mutation
- consumption artifact mutation

## Required preflight phases

### Phase 1 — Request artifact validation

Preflight must validate:

- request artifact exists
- request artifact is structurally valid
- request lifecycle is compatible with preflight
- request model id matches expected model id
- request run mode matches expected run mode
- request artifact has not been mutated

### Phase 2 — Approval contract validation

Preflight must validate approval against targetExecutionCommit, not evidenceLedgerCommit.

Preflight must validate:

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

Preflight must validate evidenceLedgerCommit relative to targetExecutionCommit.

Preflight must validate:

- targetExecutionCommit exists
- evidenceLedgerCommit exists
- evidenceLedgerCommit equals or descends from targetExecutionCommit
- diff from targetExecutionCommit to evidenceLedgerCommit contains only approved evidence paths
- no source code changed
- no MCP bridge code changed
- no runner code changed
- no request artifact changed
- no config changed
- no dependency or lockfile changed
- no executable behavior changed

### Phase 4 — Consumption evidence validation

Preflight must validate consumption evidence as append-only evidence.

Preflight must validate:

- consumption evidence exists if approval is claimed consumed
- consumption evidence is committed
- consumption evidence binds to approval id
- consumption evidence binds to request id
- consumption evidence binds to model id
- consumption evidence binds to run mode
- consumption evidence binds to targetExecutionCommit
- consumption evidence was not mutated
- approval artifact was not mutated
- consumption state is derived and not written back into the approval artifact

### Phase 5 — Execution gate validation

Preflight must validate independent execution gates:

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

## Required future preflight output fields

Future guarded preflight should expose:

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

## Invalidating conditions

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

## Same-repository evidence rule

Same-repository evidence storage is valid only if preflight can prove that evidenceLedgerCommit is an allowed evidence-only descendant of targetExecutionCommit.

The evidence ledger commit may contain evidence.

It must not change the target execution scope.

## Execution target rule

Execution must operate against targetExecutionCommit.

If evidenceLedgerCommit differs from targetExecutionCommit, the runner must not silently execute evidenceLedgerCommit.

A separate approved packet is required to promote evidenceLedgerCommit or any later commit into a new target execution commit.

## Safety result

Observed and preserved:

- no approval evidence created
- no approval consumed
- executionAllowedNow unchanged and effectively false
- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false
- global disable switch remains active
- no runner run id created

## Conclusion

FP-MCP-098 converts the FP-MCP-097 clarification into an explicit preflight contract.

The next smallest packet should be an implementation packet that adds targetExecutionCommit versus evidenceLedgerCommit fields and evidence-only descendant validation to guarded preflight output.

The implementation must remain non-executing.
