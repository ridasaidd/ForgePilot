# FP-MCP-099 — Target Commit Evidence-Ledger Preflight Field Implementation

## Task

Implement non-executing guarded preflight output fields for separating target execution commit from evidence ledger commit.

## Goal

Make guarded execution preflight explicitly report whether the current repository HEAD is the approved target execution commit or an evidence-only descendant of that target commit.

This packet answers one question:

Can preflight expose targetExecutionCommit versus evidenceLedgerCommit state without changing execution behavior?

## Background

FP-MCP-096 showed that approval evidence can become self-invalidating when approval and consumption evidence are stored in the same repository.

Observed:

- approval repoCommit: 27c8a34
- preflight currentCommit: 6a77424

The approval was not expired, but preflight rejected it because the repository HEAD had advanced due to evidence commits.

FP-MCP-097 clarified the approval commit-binding model.

FP-MCP-098 defined the targetExecutionCommit versus evidenceLedgerCommit preflight contract.

The next smallest implementation step is to add explicit preflight output fields and evidence-only descendant evaluation.

## Scope

Allowed:

- Add targetExecutionCommit and evidenceLedgerCommit fields to guarded preflight output.
- Add evidence-only descendant evaluation.
- Add changed path reporting between targetExecutionCommit and evidenceLedgerCommit.
- Add nonEvidenceChangedPaths reporting.
- Add approval/evidence-ledger compatibility fields.
- Add tests or verification for the new non-executing fields.
- Update relevant schemas.
- Update documentation or run evidence for this packet.

Forbidden:

- Do not change the runner start path.
- Do not enable execution.
- Do not relax the global disable switch.
- Do not change approval consumption semantics.
- Do not change real approval creation behavior.
- Do not contact the runner start endpoint.
- Do not start OpenCode.
- Do not create a runner run id.
- Do not mutate request artifacts.
- Do not loosen approval validation to permit unsafe execution.
- Do not alter model selection, routing, or execution policy.

## Required Behavior

Guarded preflight must continue to be non-executing.

The output should add or derive:

- `targetExecutionCommit`
- `evidenceLedgerCommit`
- `evidenceLedgerDescendsFromTarget`
- `evidenceOnlyDeltaEvaluated`
- `evidenceOnlyDeltaValid`
- `evidenceOnlyChangedPaths`
- `nonEvidenceChangedPaths`
- `approvalValidatedAgainstTargetCommit`
- `approvalTargetCommitMatches`
- `approvalEvidenceLedgerCompatible`
- `consumptionEvidenceLedgerCompatible`

## Target Commit Derivation

Initial implementation may derive `targetExecutionCommit` from the approval artifact's scoped repository commit when an approval id is supplied.

If no approval id is supplied, target commit may remain null or fall back to existing request/base commit behavior, but this must be explicit in output.

## Evidence Ledger Commit Derivation

`evidenceLedgerCommit` should be the current repository HEAD at preflight evaluation time.

This should correspond to existing `currentCommit`.

## Evidence-Only Descendant Evaluation

If both targetExecutionCommit and evidenceLedgerCommit exist:

1. Verify targetExecutionCommit exists.
2. Verify evidenceLedgerCommit exists.
3. Verify evidenceLedgerCommit equals or descends from targetExecutionCommit.
4. Collect changed paths between targetExecutionCommit and evidenceLedgerCommit.
5. Classify changed paths as evidence-only or non-evidence.
6. Set `evidenceOnlyDeltaValid` true only if all changed paths are allowed evidence paths.

## Allowed Evidence Paths

Initial allowed evidence paths:

- `runs/FP-MCP-*/`
- packet-specific approval evidence artifacts
- packet-specific approval consumption artifacts
- packet-specific validation evidence artifacts
- packet-specific verification files

## Non-Evidence Changes

The following must be reported as non-evidence changes:

- source code changes
- MCP bridge code changes
- runner code changes
- OpenCode execution code changes
- request artifact mutation
- packet mutation after approval
- config changes
- dependency changes
- lockfile changes
- executable behavior changes
- approval artifact mutation
- consumption artifact mutation

## Compatibility Fields

`approvalEvidenceLedgerCompatible` should indicate whether the approval target commit can coexist with the current evidence ledger commit.

It must not by itself permit execution.

`consumptionEvidenceLedgerCompatible` should indicate whether append-only consumption evidence is compatible with the target commit and evidence ledger commit.

It must not by itself permit execution.

## Required Safety Invariants

Existing safety fields must remain closed unless already closed by the current implementation:

- `executionPermitted: false` unless all existing gates independently permit execution
- `executionStarted: false`
- `startEndpointContacted: false`
- `opencodeStarted: false`
- global disable switch remains active unless explicitly changed outside this packet
- runner execution remains disabled
- OpenCode execution remains disabled

## Required Verification

Verification must show:

- preflight still does not start execution
- start endpoint is not contacted
- OpenCode is not started
- new fields are present
- new fields are deterministic
- evidence ledger commit is reported separately from target execution commit
- non-evidence changes are reported if present
- approval validation is not loosened into execution permission

## Evidence

Record:

- `runs/FP-MCP-099/executor-result.md`
- `runs/FP-MCP-099/verification.txt`
- any relevant test output
- any relevant preflight observation output

## Success Criteria

This packet is successful if:

1. Guarded preflight exposes targetExecutionCommit and evidenceLedgerCommit separately.
2. Guarded preflight reports whether evidenceLedgerCommit descends from targetExecutionCommit.
3. Guarded preflight reports evidence-only and non-evidence changed paths.
4. Approval/evidence-ledger compatibility is observable.
5. Existing execution safety behavior is unchanged.
6. No execution is started.
7. No runner start endpoint is contacted.
8. Tests or verification pass.

## Non-goals

This packet does not authorize execution.

This packet does not consume approval.

This packet does not create approval evidence.

This packet does not relax the disable switch.

This packet does not enable runner execution.

This packet does not enable OpenCode execution.

This packet does not perform a remote runner start.

This packet does not admit model output.
