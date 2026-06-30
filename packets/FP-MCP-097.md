# FP-MCP-097 — Approval Commit Binding Model Clarification

## Task

Clarify the ForgePilot approval commit-binding model after FP-MCP-096 showed that approval evidence can become self-invalidating when evidence commits advance repository HEAD.

## Goal

Define how guarded execution preflight must distinguish the commit approved for execution from later commits that only record evidence.

This packet answers one question:

What commit should human approval evidence bind to when approval, consumption, validation, and preflight evidence are stored in the same repository?

## Background

FP-MCP-096 attempted to isolate the consumed-approval preflight gate.

The sequence was:

1. Create a fresh real approval artifact.
2. Commit the approval artifact.
3. Validate the committed approval artifact.
4. Record append-only consumption evidence.
5. Commit the consumption artifact.
6. Run guarded preflight before expiration.

The approval was not expired.

However, preflight still rejected the approval because the approval was bound to an earlier repository commit than the current post-evidence HEAD.

Observed:

- approval repoCommit: 27c8a34
- preflight baseCommit/currentCommit: 6a77424

Observed blockers:

- APPROVAL_SCOPE_MISMATCH
- APPROVAL_BASE_COMMIT_BINDING_INVALID
- APPROVAL_COMMIT_BINDING_INVALID
- APPROVAL_REQUEST_BINDING_INVALID
- APPROVAL_TEXT_INVALID

This exposed a commit-binding ambiguity.

If approval binds directly to current HEAD, then committing approval and consumption evidence into the same repository can invalidate the approval before preflight can evaluate it.

## Scope

Allowed:

- Analyze FP-MCP-096 evidence.
- Define commit-binding terms.
- Define allowed evidence-only descendant behavior.
- Define expected future preflight behavior.
- Identify required implementation changes or observations.
- Record clarification under `runs/FP-MCP-097/`.

Forbidden:

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

## Definitions To Clarify

### targetExecutionCommit

The immutable repository commit that the human approval authorizes for execution.

This is the code state the model is allowed to act on.

### evidenceLedgerCommit

The later repository commit that records approval, consumption, validation, and preflight evidence.

This commit may be different from the target execution commit if evidence is stored in the same repository.

### allowedEvidenceOnlyDescendant

A descendant commit of the target execution commit that only records approved evidence artifacts.

Allowed evidence-only paths may include:

- `runs/FP-MCP-*/`
- packet-specific approval evidence artifacts
- packet-specific consumption evidence artifacts
- packet-specific validation evidence artifacts
- packet-specific verification files

Forbidden changes in an evidence-only descendant include:

- source code changes
- runner code changes
- MCP bridge code changes
- request artifact mutation
- packet mutation after packet commit
- config changes
- dependency changes
- executable behavior changes

## Required Clarification

Record whether approval should bind to:

1. current HEAD
2. request artifact commit
3. target execution commit
4. target execution commit plus allowed evidence-only descendants

## Expected Model

The expected model is:

- Approval binds to `targetExecutionCommit`.
- Preflight runs at `evidenceLedgerCommit`.
- Preflight validates that `evidenceLedgerCommit` is an allowed evidence-only descendant of `targetExecutionCommit`.
- Approval remains valid if all executable/project state is unchanged and only approved evidence artifacts were added.
- Approval becomes invalid if any non-evidence project state changed after `targetExecutionCommit`.

## Required Observation

Record:

- the ambiguity found by FP-MCP-096
- why current HEAD binding is self-invalidating
- the proposed target/evidence commit separation
- allowed evidence-only descendant rules
- preflight expectations
- invalidating conditions
- next implementation or observation packet

## Required Safety Results

Verification must show:

- no approval evidence created
- no approval consumed
- executionAllowedNow remains false or is not changed
- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false
- global disable switch remains active
- no runner run id created

## Evidence

Record:

- `runs/FP-MCP-097/approval-commit-binding-model.md`
- `runs/FP-MCP-097/verification.txt`

## Success Criteria

This packet is successful if:

1. The approval commit-binding ambiguity is documented.
2. The distinction between target execution commit and evidence ledger commit is explicit.
3. Allowed evidence-only descendant behavior is defined.
4. Invalidating non-evidence changes are defined.
5. No execution is started.
6. No approval is created or consumed.
7. The next smallest implementation or observation packet is identified.

## Non-goals

This packet does not implement commit-binding behavior.

This packet does not create approval evidence.

This packet does not consume approval.

This packet does not relax the disable switch.

This packet does not enable execution.

This packet does not start OpenCode.

This packet does not perform a remote runner start.
