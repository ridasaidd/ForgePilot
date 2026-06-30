# FP-MCP-124 Guarded Preflight Report

Input:

```json
{
  "packetId": "FP-MCP-117",
  "requestId": "REQ-20260630T160920008Z-195b9969",
  "approvalId": "APPROVAL-20260630T162204620Z-f3b278ed"
}
```

Observed result:

```json
{
  "guardedStartPreflightEvaluated": true,
  "eligibleForFutureGuardedStart": false,
  "executionPermitted": false,
  "executionStarted": false,
  "opencodeStarted": false,
  "runnerStartEndpointContacted": false,
  "startEndpointContacted": false,
  "runnerRunId": null,
  "approvalConsumed": false,
  "requestArtifactMutated": false,
  "packetId": "FP-MCP-117",
  "requestId": "REQ-20260630T160920008Z-195b9969",
  "approvalId": "APPROVAL-20260630T162204620Z-f3b278ed",
  "runnerConfigured": true,
  "runnerReachable": true,
  "runnerStateObserved": true,
  "startEndpointPresent": true,
  "startEndpointState": "PRESENT_DISABLED",
  "startCapabilityCallable": false,
  "executionEnabled": false,
  "supportedOperations": [
    "capabilities",
    "validate-request"
  ],
  "gates": {
    "repository": {
      "evaluated": true,
      "passed": true,
      "state": "PASSED",
      "reasons": [],
      "evidencePath": null,
      "evidenceSha256": null
    },
    "requestArtifact": {
      "evaluated": true,
      "passed": true,
      "state": "PASSED",
      "reasons": [],
      "evidencePath": "runs/FP-MCP-117/opencode-requests/REQ-20260630T160920008Z-195b9969.json",
      "evidenceSha256": "512a8c2c48e69b22d0e48206c9e9af65aff26d44eefded9b8ca9e6b0b064a454"
    },
    "commitBinding": {
      "evaluated": true,
      "passed": true,
      "state": "PASSED",
      "reasons": [],
      "evidencePath": null,
      "evidenceSha256": null
    },
    "modelAndRunMode": {
      "evaluated": true,
      "passed": true,
      "state": "PASSED",
      "reasons": [],
      "evidencePath": null,
      "evidenceSha256": null
    },
    "disableSwitch": {
      "evaluated": true,
      "passed": false,
      "state": "FAILED",
      "reasons": [
        "EXECUTION_DISABLED_GLOBAL",
        "RUNNER_EXECUTION_DISABLED",
        "OPENCODE_EXECUTION_DISABLED",
        "DISABLE_SWITCH_ACTIVE",
        "EXECUTION_NOT_ALLOWED",
        "START_REQUEST_BLOCKED_BY_DISABLE_SWITCH"
      ],
      "evidencePath": null,
      "evidenceSha256": null
    },
    "runnerCapabilityState": {
      "evaluated": true,
      "passed": false,
      "state": "FAILED",
      "reasons": [
        "START_ENDPOINT_DISABLED",
        "START_NOT_CALLABLE"
      ],
      "evidencePath": null,
      "evidenceSha256": null
    },
    "opencodeReadiness": {
      "evaluated": true,
      "passed": false,
      "state": "FAILED",
      "reasons": [
        "OPENCODE_NOT_CONFIGURED",
        "OPENCODE_EXECUTION_DISABLED"
      ],
      "evidencePath": null,
      "evidenceSha256": null
    },
    "preStartEvidence": {
      "evaluated": true,
      "passed": true,
      "state": "PASSED",
      "evidencePath": "runs/FP-MCP-117/pre-start-evidence/REQ-20260630T160920008Z-195b9969.json"
    },
    "stateSnapshotEvidence": {
      "evaluated": true,
      "passed": true,
      "state": "PASSED",
      "evidencePath": "runs/FP-MCP-117/start-state-snapshots/REQ-20260630T160920008Z-195b9969"
    },
    "humanApprovalEvidence": {
      "evaluated": true,
      "passed": false,
      "state": "FAILED",
      "reasons": [
        "HUMAN_APPROVAL_EVIDENCE_COMMIT_MISMATCH",
        "HUMAN_APPROVAL_EVIDENCE_FIXTURE_NOT_AUTHORIZING",
        "HUMAN_APPROVAL_EVIDENCE_NOT_USABLE_FOR_EXECUTION"
      ],
      "evidencePath": "runs/FP-MCP-118/approvals/APPROVAL-20260630T162204620Z-f3b278ed.json",
      "evidenceSha256": "00c814b46a507bdbf1fb9d45d37dd0329e524eccc13d45a20f48d7f50224ae7f"
    },
    "evidenceLedgerReadiness": {
      "evaluated": true,
      "passed": true,
      "state": "PASSED",
      "reasons": [],
      "evidencePath": null,
      "evidenceSha256": null
    }
  },
  "repository": {
    "repoClean": true,
    "currentCommit": "0e0bec2",
    "currentBranch": "main"
  },
  "requestArtifact": {
    "packetExists": true,
    "requestExists": true,
    "requestArtifactValid": true,
    "requestArtifactPath": "runs/FP-MCP-117/opencode-requests/REQ-20260630T160920008Z-195b9969.json",
    "requestArtifactSha256": "512a8c2c48e69b22d0e48206c9e9af65aff26d44eefded9b8ca9e6b0b064a454",
    "safeArtifactDir": true,
    "artifactDir": "runs/FP-MCP-117/deepseek-v4-pro-high-DESIGN_ONLY/"
  },
  "modelAndRunMode": {
    "modelId": "deepseek-v4-pro-high",
    "modelAllowed": true,
    "runMode": "DESIGN_ONLY",
    "runModeAllowed": true
  },
  "disableSwitch": {
    "disableSwitchStatusEvaluated": true,
    "disableSwitchActive": true,
    "effectiveDisableReason": "EXECUTION_DISABLED_GLOBAL",
    "effectiveDisableScope": "GLOBAL",
    "disableSwitchClear": false
  },
  "opencodeReadiness": {
    "opencodeStatusEvaluated": true,
    "opencodeConfigured": false,
    "opencodeExecutionEnabled": false,
    "opencodeReadyForFutureGuardedStart": false
  },
  "boundaryVersion": "FP-MCP-116",
  "statusSource": "ForgePilot guarded start preflight report skeleton",
  "checkedAt": "2026-06-30T17:39:08.237Z",
  "reasons": [
    "EXECUTION_DISABLED_GLOBAL",
    "RUNNER_EXECUTION_DISABLED",
    "OPENCODE_EXECUTION_DISABLED",
    "DISABLE_SWITCH_ACTIVE",
    "EXECUTION_NOT_ALLOWED",
    "START_ENDPOINT_DISABLED",
    "START_NOT_CALLABLE"
  ]
}
```

Verification notes:

- `humanApprovalEvidence` is explicitly classified as `FAILED`.
- The FP-MCP-118 fixture is classified as non-authorizing.
- `HUMAN_APPROVAL_EVIDENCE_NOT_EVALUATED` is no longer used for the supplied fixture.
- Execution remains refused.
- The runner start endpoint was not contacted.
- OpenCode was not started.
- No runner run id was created.
- Approval was not consumed.
- The approval artifact was not mutated.
- The request artifact was not mutated.
