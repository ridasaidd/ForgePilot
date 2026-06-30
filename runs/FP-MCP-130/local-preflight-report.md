# FP-MCP-130 Local Preflight Report

Result: PASSED

Ran the local guarded preflight report skeleton against the FP-MCP-126 real-shaped approval evidence artifact.

## Packet

- FP-MCP-130 — Local Guarded Preflight Real Approval Evaluation

## Packet Commit

- `824323a Add FP-MCP-130 local approval preflight evaluation packet`

## Command

```text
node ~/forgepilot-chatgpt-mcp/scripts/guarded-preflight-report.mjs \
  --packet-id FP-MCP-117 \
  --request-id REQ-20260630T160920008Z-195b9969 \
  --approval-id APPROVAL-20260630T175528922Z-806b81c3
```

## Raw Report

- `runs/FP-MCP-130/local-preflight-report.json`

## Approval Evidence Gate

```text
evaluated: true
passed: false
state: FAILED
reasons: ['HUMAN_APPROVAL_EVIDENCE_EXPIRED', 'HUMAN_APPROVAL_EVIDENCE_COMMIT_MISMATCH']
evidencePath: runs/FP-MCP-126/approvals/APPROVAL-20260630T175528922Z-806b81c3.json
evidenceSha256: 482e7c13c3fda729bab0eada110b41199dc576be8a7b4112324f1ae4220a1fdb
```

## Evidence Ledger Readiness

```text
evaluated: true
passed: false
state: DEFERRED
reasons: ['HUMANAPPROVALEVIDENCE_NOT_READY']
```

## Remaining Blocking Gates

```text
disableSwitch: FAILED
runnerCapabilityState: FAILED
opencodeReadiness: FAILED
```

## Top-Level Safety Fields

```text
eligibleForFutureGuardedStart: false
executionPermitted: false
executionStarted: false
opencodeStarted: false
runnerStartEndpointContacted: false
startEndpointContacted: false
runnerRunId: null
approvalConsumed: false
requestArtifactMutated: false
approvalArtifactMutated: false
```

## Local Invocation Metadata

```text
localInvocation: true
invocationPath: LOCAL_SCRIPT
boundaryVersion: FP-MCP-129
statusSource: ForgePilot local guarded preflight report skeleton
checkedAt: 2026-06-30T18:32:11.489Z
```

## Observation

The local guarded preflight path successfully evaluated the supplied approval evidence artifact without relying on the ChatGPT Action path.

The result of `humanApprovalEvidence` was recorded honestly above.

## Safety Conclusion

The local preflight did not enable execution, did not contact the runner start endpoint, did not start OpenCode, did not create a runner run id, did not consume approval, and did not mutate the approval or request artifacts.
