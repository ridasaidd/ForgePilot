# FP-MCP-162 Structured Approval Live Test 2 Result

## Result

```text
STRUCTURED_APPROVAL_VALIDATOR_ACCEPTED_GUARDED_PREFLIGHT_REJECTED
```

## Approval artifact

```text
approvalId: APPROVAL-20260702T153720820Z-1e2aece5
path: runs/FP-MCP-162/approvals/APPROVAL-20260702T153720820Z-1e2aece5.json
sha256: 154b45d5eb82ed1b829b8c0162da4ce01231dcbbf8a99683b66aaac543b0fb78
commit: d0c1b73
```

## Direct validator result

```text
approvalEvidenceValid: true
approvalValid: true
approvalUsableForExecution: true
humanApprovalRecorded: true
scopeExact: true
scopeMatchesExpected: true
artifactCommitted: true
reasons: []
```

## Guarded preflight result

```text
humanApprovalEvidence: FAILED
HUMAN_APPROVAL_EVIDENCE_TARGET_COMMIT_MISMATCH
HUMAN_APPROVAL_EVIDENCE_FIXTURE_NOT_AUTHORIZING
HUMAN_APPROVAL_EVIDENCE_NOT_USABLE_FOR_EXECUTION
```

## Interpretation

The structured approval artifact is valid according to the canonical human approval validator, but the guarded preflight report has a separate approval acceptance path that does not yet recognize the structured artifact correctly.

This is an integration gap, not an execution failure.

## Boundary

No execution was enabled.
No approval was consumed.
No runner start endpoint was contacted.
No OpenCode process started.
