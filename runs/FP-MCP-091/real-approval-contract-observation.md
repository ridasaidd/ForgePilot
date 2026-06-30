# FP-MCP-091 Real Approval Evidence Contract Observation

Result: PASSED

Observed and defined the real human approval evidence contract without creating real approval, consuming approval, enabling execution, relaxing the disable switch, contacting the runner start endpoint, or starting OpenCode.

## Reference evidence

Read and observed:

- runs/FP-MCP-090/approval-gate-observation.md
- runs/FP-MCP-090/approvals/APPROVAL-20260630T111656360Z-1eafb0e9.json

Reference dry-run approval fixture:

- approvalId: APPROVAL-20260630T111656360Z-1eafb0e9
- schemaVersion: FP-MCP-063
- boundaryVersion: FP-MCP-066
- artifactType: human-approval-evidence-dry-run-fixture
- artifactVersion: human-approval-evidence-dry-run-fixture-v1
- fixture: true
- dryRun: true
- expectedValid: false
- expectedUsableForExecution: false
- approvalState: INVALID
- approvalKind: EXECUTION_ENABLEMENT
- approvedAction: ALLOW_ONE_GUARDED_REMOTE_RUNNER_EXECUTION_ATTEMPT
- humanApprovalRecorded: false
- approvalUsableForExecution: false
- executionAllowedNow: false
- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false
- runnerExecutionEnabled: false
- opencodeExecutionEnabled: false
- quarantinedAt: 2026-06-30T11:16:56.340Z

The dry-run fixture was intentionally invalid and unusable for execution.

## Real approval evidence contract

A real human approval evidence artifact must satisfy all of the following conditions before it can be considered valid by the approval validator.

### Schema and boundary

Required:

- schemaVersion must match the real approval evidence schema expected by the validator.
- approvalEvidenceContractVersion must be compatible with FP-MCP-066.
- validatorBoundaryVersion must be compatible with FP-MCP-072.
- artifactType must be the real approval evidence artifact type, not `human-approval-evidence-dry-run-fixture`.
- fixture must be absent or false.
- dryRun must be absent or false.

Invalidating conditions:

- artifactType is dry-run fixture.
- artifactType is missing or incompatible.
- schemaVersion is incompatible.
- fixture is true.
- dryRun is true.

### Approval identity

Required:

- approvalId must be present.
- approvalId must match the expected approval id format.
- approvalPath must be safe and under the allowed approval artifact directory.
- artifact must exist.
- artifact must be valid JSON.
- artifact must be committed before it is usable for execution.

Invalidating conditions:

- malformed approval id.
- unsafe approval path.
- missing artifact.
- invalid JSON.
- uncommitted approval artifact.

### Approval state

Required:

- approvalState must represent a recorded real approval state.
- humanApprovalRecorded must be true.
- approvalCreated must be true only for the real approval creation observation path.
- approvalMutated must remain false after creation.
- approvalUsableForExecution must be true only while all gates remain valid.
- quarantinedAt must be null.
- revokedAt must be null.
- consumedAt must be null before use.
- approval must not be expired.

Invalidating conditions:

- approvalState is INVALID.
- approvalState is not RECORDED.
- humanApprovalRecorded is false.
- approvalCreated is false for real approval creation evidence.
- approvalMutated is true.
- approvalUsableForExecution is false.
- quarantinedAt is non-null.
- revokedAt is non-null.
- consumedAt is non-null before execution.
- approval expired.

### Approval kind and action

Required:

- approvalKind must be EXECUTION_ENABLEMENT.
- approvedAction must be ALLOW_ONE_GUARDED_REMOTE_RUNNER_EXECUTION_ATTEMPT.
- approval must be single-use.

Invalidating conditions:

- wrong approval kind.
- wrong approved action.
- singleUse is false.
- approval attempts to authorize more than one execution attempt.

### Scope binding

A real approval must bind exactly to the intended execution scope.

Required scope fields:

- packetId
- requestId
- modelId
- runMode
- repoCommit
- branch

Required exact scope for the current reference request:

- packetId: FP-MCP-084
- requestId: REQ-20260630T094727908Z-630a4f0d
- modelId: deepseek-v4-pro-high
- runMode: DESIGN_ONLY
- branch: main

The repoCommit must match the intended committed repository state for the future real approval packet.

Invalidating conditions:

- scope missing.
- scope includes unexpected packet id.
- requestId mismatch.
- modelId mismatch.
- runMode mismatch.
- repoCommit mismatch.
- branch mismatch.
- scope is broader than the intended request.
- scope is narrower or malformed in a way that prevents exact validation.

### Canonical approval text

Required:

- canonical approval text must be present.
- approval text must exactly encode the approved packet, request id, model id, run mode, and commit.
- approval text must match the validator's required canonical format.
- approval text must not be approximate, paraphrased, or inferred.

Invalidating conditions:

- approval text missing.
- canonical approval text missing.
- approval text uses the wrong packet id.
- approval text uses the wrong request id.
- approval text uses the wrong model id.
- approval text uses the wrong run mode.
- approval text uses the wrong commit.
- approval text does not match the required canonical string.

### Preconditions

A real approval artifact must record the preconditions observed at approval creation time.

Required preconditions include:

- execution enablement status evaluated.
- execution was not already allowed before approval.
- contract completeness evaluated.
- dry-run evidence present.
- dry-run evidence verified.
- repository clean.
- runner execution capability present or explicitly evaluated.
- OpenCode boundary satisfied.
- secret boundary satisfied.
- network boundary satisfied.
- disable path defined.
- audit admission path defined or explicitly evaluated according to the active policy.

Invalidating conditions:

- preconditions missing.
- preconditions incomplete.
- preconditions contradict execution safety.
- preconditions claim execution was already allowed before approval.
- required safety boundary not evaluated.

### Expiration, revocation, quarantine, and consumption

Required:

- createdAt must be valid.
- expiresAt must be valid.
- approval lifetime must be bounded.
- approval must not be expired.
- revokedAt must be null.
- quarantinedAt must be null.
- consumedAt must be null before execution.
- approval must be single-use.
- approval consumption must be recorded append-only before or during execution admission according to the guarded execution contract.

Invalidating conditions:

- missing createdAt.
- missing expiresAt.
- invalid expiration.
- expired approval.
- revoked approval.
- quarantined approval.
- already-consumed approval.
- multi-use approval.
- missing consumption evidence when consumption is required.

### Execution safety fields

Required before execution is permitted:

- executionAllowedNow must remain false until all independent gates pass.
- executionStarted must be false at approval creation.
- startEndpointContacted must be false at approval creation.
- opencodeStarted must be false at approval creation.
- runnerExecutionEnabled must reflect actual runner execution enablement.
- opencodeExecutionEnabled must reflect actual OpenCode execution enablement.
- global disable switch state must be explicitly evaluated.

Invalidating conditions:

- approval artifact claims execution already started.
- approval artifact claims start endpoint was already contacted.
- approval artifact claims OpenCode already started.
- approval artifact bypasses disable switch state.
- approval artifact implies execution without preflight.

## Difference from dry-run fixture

The FP-MCP-090 dry-run fixture intentionally violated the real approval contract in these ways:

- artifactType was `human-approval-evidence-dry-run-fixture`.
- fixture was true.
- dryRun was true.
- expectedValid was false.
- expectedUsableForExecution was false.
- approvalState was INVALID.
- scope packetId was FP-MCP-036 instead of the expected FP-MCP-090 validation scope.
- canonical approval text did not satisfy the validator for the expected scope.
- humanApprovalRecorded was false.
- approvalUsableForExecution was false.
- quarantinedAt was non-null.
- artifact was initially uncommitted at validation time.

These violations are desired for dry-run evidence.

They prove the validator can distinguish approval-shaped artifacts from real approval evidence.

## Future real approval creation preconditions

Before any future packet creates real approval evidence, the packet must explicitly bind:

- request packet id
- request artifact id
- model id
- run mode
- branch
- exact repository commit
- canonical approval text
- operator identity boundary
- expiration timestamp
- single-use behavior
- revocation/quarantine behavior
- consumption behavior
- disable switch state
- runner execution enablement state
- OpenCode execution enablement state

Future real approval creation must remain create-only.

Future approval consumption must be a separate append-only observation.

## Safety result

Observed and preserved:

- no real approval evidence created
- approvalCreated: false for this packet
- approvalConsumed: false
- executionAllowedNow: false
- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false
- global disable switch remains active
- no runner run id created
- no production MCP behavior changed

## Interpretation

The real approval evidence contract is now explicit.

The next smallest gate is not execution.

The next smallest gate is to create one scoped real approval evidence artifact in a dedicated packet, while still not consuming it, not relaxing the disable switch, and not contacting the runner start endpoint.
