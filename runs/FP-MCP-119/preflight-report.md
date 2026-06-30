# FP-MCP-119 Guarded Preflight Report Evidence

Result: PASSED

Ran the guarded start preflight report after committing the pre-start evidence dry-run artifact.

## Tool

- `forgepilot_get_guarded_start_preflight_report`

## Input

```json
{
  "packetId": "FP-MCP-117",
  "requestId": "REQ-20260630T160920008Z-195b9969",
  "approvalId": "APPROVAL-20260630T162204620Z-f3b278ed"
}
```

## Observed Report

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
      "reasons": [
        "EXECUTION_DISABLED",
        "START_ENDPOINT_NOT_CONTACTED",
        "OPENCODE_NOT_STARTED",
        "EXECUTION_DISABLED_GLOBAL",
        "HUMAN_APPROVAL_EVIDENCE_MISSING",
        "EXECUTION_PREFLIGHT_HUMAN_APPROVAL_EVIDENCE_GATE_BLOCKED",
        "HUMAN_APPROVAL_EVIDENCE_NOT_USABLE_FOR_EXECUTION",
        "RUNNER_EXECUTION_DISABLED",
        "OPENCODE_EXECUTION_DISABLED",
        "DISABLE_SWITCH_ACTIVE",
        "EXECUTION_NOT_ALLOWED"
      ],
      "evidencePath": "runs/FP-MCP-117/pre-start-evidence/REQ-20260630T160920008Z-195b9969.json",
      "evidenceSha256": null
    },
    "stateSnapshotEvidence": {
      "evaluated": true,
      "passed": false,
      "state": "INCOMPLETE",
      "reasons": [
        "EXECUTION_DISABLED",
        "START_ENDPOINT_NOT_CONTACTED",
        "OPENCODE_NOT_STARTED",
        "EXECUTION_DISABLED_GLOBAL",
        "HUMAN_APPROVAL_EVIDENCE_MISSING",
        "EXECUTION_PREFLIGHT_HUMAN_APPROVAL_EVIDENCE_GATE_BLOCKED",
        "HUMAN_APPROVAL_EVIDENCE_NOT_USABLE_FOR_EXECUTION",
        "RUNNER_EXECUTION_DISABLED",
        "OPENCODE_EXECUTION_DISABLED",
        "DISABLE_SWITCH_ACTIVE",
        "EXECUTION_NOT_ALLOWED",
        "PRE_START_STATE_SNAPSHOT_MISSING",
        "POST_START_STATE_SNAPSHOT_MISSING",
        "STATE_SNAPSHOT_INCOMPLETE",
        "STATE_SNAPSHOT_INVALID"
      ],
      "evidencePath": "runs/FP-MCP-117/start-state-snapshots/REQ-20260630T160920008Z-195b9969",
      "evidenceSha256": null
    },
    "humanApprovalEvidence": {
      "evaluated": true,
      "passed": false,
      "state": "DEFERRED",
      "reasons": [
        "HUMAN_APPROVAL_EVIDENCE_NOT_EVALUATED"
      ],
      "evidencePath": null,
      "evidenceSha256": null
    },
    "evidenceLedgerReadiness": {
      "evaluated": true,
      "passed": false,
      "state": "DEFERRED",
      "reasons": [
        "EVIDENCE_LEDGER_NOT_READY"
      ],
      "evidencePath": null,
      "evidenceSha256": null
    }
  },
  "repository": {
    "repoClean": true,
    "currentCommit": "435a739",
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
  "checkedAt": "2026-06-30T16:30:03.664Z",
  "reasons": [
    "EXECUTION_DISABLED_GLOBAL",
    "RUNNER_EXECUTION_DISABLED",
    "OPENCODE_EXECUTION_DISABLED",
    "DISABLE_SWITCH_ACTIVE",
    "EXECUTION_NOT_ALLOWED",
    "START_ENDPOINT_DISABLED",
    "START_NOT_CALLABLE",
    "EVIDENCE_LEDGER_NOT_READY"
  ]
}
```

## Pre-Start Gate Improvement

FP-MCP-118 observed:

```text
preStartEvidence: INCOMPLETE
```

FP-MCP-119 observed:

```text
preStartEvidence:
  evaluated: true
  passed: true
  state: PASSED
  evidencePath: runs/FP-MCP-117/pre-start-evidence/REQ-20260630T160920008Z-195b9969.json
```

This proves the guarded start preflight report can observe committed pre-start evidence.

## Passing Gates

The following gates are now passing:

- `repository`
- `requestArtifact`
- `commitBinding`
- `modelAndRunMode`
- `preStartEvidence`

## Expected Remaining Non-Eligibility

The report still returned:

```text
eligibleForFutureGuardedStart: false
```

because the system remains intentionally disabled:

- `startEndpointState: PRESENT_DISABLED`
- `startCapabilityCallable: false`
- `disableSwitchActive: true`
- `executionEnabled: false`
- `opencodeExecutionEnabled: false`

Remaining expected blockers:

- `disableSwitch: FAILED`
- `runnerCapabilityState: FAILED`
- `opencodeReadiness: FAILED`
- `stateSnapshotEvidence: INCOMPLETE`
- `humanApprovalEvidence: DEFERRED`
- `evidenceLedgerReadiness: DEFERRED`

## Safety Result

Preserved:

- `executionPermitted: false`
- `executionStarted: false`
- `opencodeStarted: false`
- `runnerStartEndpointContacted: false`
- `startEndpointContacted: false`
- `runnerRunId: null`
- `approvalConsumed: false`
- `requestArtifactMutated: false`

No runner start endpoint contact occurred.

No OpenCode process was started.

No runner run id was created.

No approval was consumed.

No request artifact was mutated.

## Conclusion

FP-MCP-119 passed.

The guarded start preflight report improved the pre-start evidence gate after committed non-executing pre-start evidence was recorded, while preserving all non-execution safety invariants.
