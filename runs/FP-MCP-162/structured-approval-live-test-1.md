# FP-MCP-162 Structured Approval Live Test 1

## Result

```text
STRUCTURED_APPROVAL_ARTIFACT_CREATED_VALIDATION_INCOMPLETE
```

## Approval artifact

```text
approvalId: APPROVAL-20260702T153033035Z-89fd6c5c
path: runs/FP-MCP-162/approvals/APPROVAL-20260702T153033035Z-89fd6c5c.json
sha256: 92c7d862efc816223b8e61e5cd63a4412ef2759efb7bd32420d2010ef58b9b77
```

## Positive observations

```text
structuredHumanApprovalRecorded: true
humanApprovalRecorded: true
approvalCreated: true
requestArtifactValidated: true
requestArtifactValid: true
requestModelMatches: true
requestRunModeMatches: true
requestRepoCommitMatches: true
singleUseValid: true
expiresAtValid: true
approvalLifetimeValid: true
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

## Validation blockers

```text
APPROVAL_PRECONDITIONS_MISSING
APPROVAL_EVIDENCE_ARTIFACT_UNCOMMITTED
APPROVAL_ARTIFACT_UNCOMMITTED
```

## Interpretation

The structured popup approval path is live and creates an artifact.

The artifact shape needs a compatibility fix for existing validator precondition expectations.

## Boundary

No execution was enabled.
No approval was consumed.
No runner start endpoint was contacted.
No OpenCode process started.
