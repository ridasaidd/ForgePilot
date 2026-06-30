# FP-MCP-126 Approval Artifact Evidence

Result: PASSED

Created one real-shaped, scoped, non-consumed human approval evidence artifact.

## Packet

- FP-MCP-126 — Record Real-Shaped Human Approval Evidence Fixture

## Packet Commit

- d8684b1 Add FP-MCP-126 real approval evidence fixture packet

## Approval Artifact

```text
approvalId: APPROVAL-20260630T175528922Z-806b81c3
path: runs/FP-MCP-126/approvals/APPROVAL-20260630T175528922Z-806b81c3.json
sha256: 482e7c13c3fda729bab0eada110b41199dc576be8a7b4112324f1ae4220a1fdb
schemaVersion: FP-MCP-125
artifactType: human-approval-evidence
artifactVersion: human-approval-evidence-v1
approvalState: VALID
approvalKind: GUARDED_START_PREFLIGHT_APPROVAL
approvalUsableForExecution: true
humanApprovalRecorded: true
singleUse: true
consumedAt: null
```

## Scope

```text
packetId: FP-MCP-117
requestId: REQ-20260630T160920008Z-195b9969
modelId: deepseek-v4-pro-high
runMode: DESIGN_ONLY
branch: main
repoCommit: d8684b1
```

## Timing

```text
createdAt: 2026-06-30T17:55:28Z
expiresAt: 2026-06-30T18:25:28Z
```

## Canonical Approval Text

```text
I approve this ForgePilot guarded start request.
```

## Operator

```text
operatorId: local-operator-rida
operatorHandle: rida
```

No raw email, password, API key, OAuth token, session token, private key, or other secret-bearing operator identity was recorded.

## Non-Execution Boundary

The artifact preserves:

```text
executionAllowedNow: false
executionStarted: false
opencodeStarted: false
startEndpointContacted: false
runnerStartEndpointContacted: false
runnerRunId: null
approvalConsumed: false
approvalConsumptionCreated: false
requestArtifactMutated: false
```

## Fixture Exclusion

The artifact is not a dry-run fixture shape.

It does not contain:

```text
fixture: true
dryRun: true
artifactType: human-approval-evidence-dry-run-fixture
approvalState: INVALID
approvalUsableForExecution: false
humanApprovalRecorded: false
```

## Conclusion

The approval evidence artifact was created as a real-shaped, scoped, non-consumed approval evidence observation only.

It does not authorize execution by itself.

It does not consume approval.

It does not contact the runner start endpoint.

It does not start OpenCode.
