# FP-MCP-097 Approval Commit Binding Model Clarification

Result: PASSED

Clarified the approval commit-binding ambiguity discovered by FP-MCP-096.

No approval evidence was created.

No approval was consumed.

No execution was enabled.

The global disable switch was not relaxed.

The runner start endpoint was not contacted.

OpenCode was not started.

## Finding from FP-MCP-096

FP-MCP-096 attempted to isolate the consumed-approval preflight gate.

Sequence:

1. Created a fresh real approval artifact.
2. Committed the approval artifact.
3. Validated the committed approval artifact.
4. Recorded append-only consumption evidence.
5. Committed the consumption artifact.
6. Ran guarded preflight before approval expiration.

The approval was not expired.

Observed:

- approval expiresAt: 2026-06-30T11:40:00.000Z
- preflight checkedAt: 2026-06-30T11:33:57.752Z
- APPROVAL_EXPIRED was not present

However, preflight rejected the approval before consumption validity could be isolated.

Observed:

- approval repoCommit: 27c8a34
- preflight baseCommit: 6a77424
- preflight currentCommit: 6a77424

Observed approval blockers:

- APPROVAL_SCOPE_MISMATCH
- APPROVAL_BASE_COMMIT_BINDING_INVALID
- APPROVAL_COMMIT_BINDING_INVALID
- APPROVAL_REQUEST_BINDING_INVALID
- APPROVAL_TEXT_INVALID

## Ambiguity

The approval evidence was valid when validated directly against its bound commit.

It became invalid inside preflight after evidence artifacts were committed.

This reveals an ambiguity:

- Is approval bound to the commit being approved for execution?
- Or is approval bound to the repository HEAD at the moment preflight runs?

If approval is bound directly to current HEAD, then storing approval and consumption evidence in the same repository can make valid approval self-invalidating.

The act of recording the evidence changes HEAD.

## Commit-binding terms

### targetExecutionCommit

The immutable repository commit that human approval authorizes for execution.

This is the code state the model is approved to act on.

Approval text must bind to this commit.

Model execution must operate against this commit or a verified equivalent checkout.

### evidenceLedgerCommit

The later repository commit that records approval, validation, consumption, preflight, and verification evidence.

This commit may differ from the target execution commit when evidence is stored in the same repository.

The evidence ledger commit must not silently become the execution target.

### allowedEvidenceOnlyDescendant

A descendant of targetExecutionCommit that records only approved evidence artifacts and does not change executable or project behavior.

Allowed evidence paths:

- runs/FP-MCP-*/
- packet-specific approval evidence artifacts
- packet-specific approval consumption artifacts
- packet-specific validation evidence artifacts
- packet-specific verification files

Potentially allowed if packet-authorized:

- metrics records under packet-specific paths
- comparison/audit evidence under packet-specific paths

Forbidden changes in an allowed evidence-only descendant:

- source code changes
- MCP bridge code changes
- runner code changes
- OpenCode execution code changes
- request artifact mutation
- packet mutation after packet commit
- configuration changes
- dependency changes
- lockfile changes
- executable behavior changes
- approval artifact mutation
- consumption artifact mutation

## Clarified model

Approval must bind to targetExecutionCommit.

Preflight may run at evidenceLedgerCommit.

Preflight must distinguish:

- the commit being approved for execution
- the commit containing evidence used to evaluate execution readiness

A valid approval should remain valid when evidenceLedgerCommit is an allowed evidence-only descendant of targetExecutionCommit.

A valid approval should become invalid if evidenceLedgerCommit contains non-evidence changes after targetExecutionCommit.

## Required future preflight behavior

Future guarded preflight should evaluate these separately:

1. Approval contract validation

   Validate approval fields, scope, canonical text, expiration, revocation, quarantine, and single-use state against targetExecutionCommit.

2. Evidence ledger validation

   Validate that current HEAD is either targetExecutionCommit or an allowed evidence-only descendant of targetExecutionCommit.

3. Request artifact validation

   Validate that the request artifact is the same artifact approved by the human approval evidence.

4. Consumption evidence validation

   Validate append-only consumption evidence without requiring the approval artifact itself to mutate.

5. Execution readiness validation

   Validate disable switch, runner execution enablement, OpenCode execution enablement, pre-start evidence, and artifact recording gates independently.

## Invalidating conditions

Approval must be invalid if any of the following are true:

- targetExecutionCommit does not exist.
- approval text does not bind to targetExecutionCommit.
- request artifact does not match the approved request.
- model id differs from approval.
- run mode differs from approval.
- branch differs from approval.
- approval expired.
- approval revoked.
- approval quarantined.
- approval was already consumed when single-use execution requires unconsumed approval.
- evidenceLedgerCommit is not a descendant of targetExecutionCommit.
- evidenceLedgerCommit includes non-evidence changes after targetExecutionCommit.
- approval artifact was mutated after creation.
- consumption evidence was mutated after creation.
- request artifact was mutated after approval.

## Why current HEAD binding is unsafe

Binding approval directly to current HEAD creates a self-invalidating evidence loop:

1. Approval is created for commit A.
2. Approval artifact is committed, producing commit B.
3. Consumption evidence is committed, producing commit C.
4. Preflight runs at C.
5. If preflight expects approval to bind to C, approval for A fails.
6. The system cannot both require committed evidence and require approval to bind to current HEAD.

This collapses two different concepts:

- targetExecutionCommit
- evidenceLedgerCommit

They must remain separate.

## Recommended model

Adopt:

- targetExecutionCommit binding for approval authority
- evidenceLedgerCommit validation for evidence integrity
- allowedEvidenceOnlyDescendant rules for same-repository evidence storage

This preserves deterministic evidence while preventing evidence recording from invalidating approval.

## Implementation implication

Future MCP/preflight behavior likely needs an explicit target commit field.

Possible future fields:

- targetExecutionCommit
- evidenceLedgerCommit
- evidenceOnlyDescendantAllowed
- evidenceOnlyChangedPaths
- evidenceLedgerDescendsFromTarget
- nonEvidenceChangesPresent

Preflight should not infer targetExecutionCommit solely from current HEAD.

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

FP-MCP-096 did not fail because of operator speed.

It exposed a real commit-binding model issue.

The next smallest packet should implement or observe targetExecutionCommit versus evidenceLedgerCommit separation in preflight validation.
