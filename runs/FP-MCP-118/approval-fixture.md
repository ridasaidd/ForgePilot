# FP-MCP-118 Approval Fixture Evidence

Result: PASSED

Created and committed a non-authorizing human approval evidence dry-run fixture.

## Packet

- FP-MCP-118 — Guarded Preflight Report With Approval Evidence Fixture

## Related Request Artifact

The fixture was scoped to the existing real FP-MCP-117 request artifact:

- requestId: `REQ-20260630T160920008Z-195b9969`
- modelId: `deepseek-v4-pro-high`
- runMode: `DESIGN_ONLY`
- repoCommit: `8d20e85`
- branch: `main`

## Fixture Creation

Tool:

- `forgepilot_record_human_approval_evidence_dry_run_fixture`

Input:

```json
{
  "packetId": "FP-MCP-118",
  "requestId": "REQ-20260630T160920008Z-195b9969",
  "modelId": "deepseek-v4-pro-high",
  "runMode": "DESIGN_ONLY",
  "repoCommit": "8d20e85",
  "branch": "main",
  "approval": "RECORD_HUMAN_APPROVAL_EVIDENCE_DRY_RUN_FIXTURE"
}
```

Observed before committing fixture artifact:

```json
{
  "schemaVersion": "FP-MCP-063",
  "packetId": "FP-MCP-118",
  "requestId": "REQ-20260630T160920008Z-195b9969",
  "modelId": "deepseek-v4-pro-high",
  "runMode": "DESIGN_ONLY",
  "repoCommit": "8d20e85",
  "branch": "main",
  "fixtureRecorderEvaluated": true,
  "dryRunFixtureRecorded": true,
  "dryRunFixturePath": "runs/FP-MCP-118/approvals/APPROVAL-20260630T162204620Z-f3b278ed.json",
  "dryRunFixtureApprovalId": "APPROVAL-20260630T162204620Z-f3b278ed",
  "dryRunFixtureSha256": "00c814b46a507bdbf1fb9d45d37dd0329e524eccc13d45a20f48d7f50224ae7f",
  "dryRunFixtureAlreadyExists": false,
  "dryRunFixtureValidated": true,
  "approvalValidationEvaluated": true,
  "approvalEvidenceValid": false,
  "approvalValid": false,
  "approvalUsableForExecution": false,
  "approvalCreated": false,
  "approvalMutated": false,
  "humanApprovalRecorded": false,
  "executionAllowedNow": false,
  "executionStarted": false,
  "startEndpointContacted": false,
  "opencodeStarted": false,
  "disableSwitchStatusEvaluated": true,
  "disableSwitchActive": true,
  "runnerExecutionEnabled": false,
  "opencodeExecutionEnabled": false,
  "effectiveDisableReason": "EXECUTION_DISABLED_GLOBAL",
  "effectiveDisableScope": "GLOBAL",
  "validationReasons": [
    "APPROVAL_EVIDENCE_TYPE_INVALID",
    "APPROVAL_ARTIFACT_TYPE_INVALID",
    "APPROVAL_STATE_NOT_RECORDED",
    "APPROVAL_QUARANTINED",
    "APPROVAL_EVIDENCE_ARTIFACT_UNCOMMITTED",
    "APPROVAL_ARTIFACT_UNCOMMITTED"
  ],
  "boundaryVersion": "FP-MCP-063",
  "statusSource": "ForgePilot human approval evidence dry-run fixture recorder",
  "checkedAt": "2026-06-30T16:22:04.599Z",
  "reasons": [
    "EXECUTION_DISABLED_GLOBAL",
    "RUNNER_EXECUTION_DISABLED",
    "OPENCODE_EXECUTION_DISABLED",
    "DISABLE_SWITCH_ACTIVE",
    "EXECUTION_NOT_ALLOWED",
    "APPROVAL_EVIDENCE_TYPE_INVALID",
    "APPROVAL_ARTIFACT_TYPE_INVALID",
    "APPROVAL_STATE_NOT_RECORDED",
    "APPROVAL_QUARANTINED",
    "APPROVAL_EVIDENCE_ARTIFACT_UNCOMMITTED",
    "APPROVAL_ARTIFACT_UNCOMMITTED"
  ]
}
```

## Fixture Artifact

Created fixture:

- approvalId: `APPROVAL-20260630T162204620Z-f3b278ed`
- path: `runs/FP-MCP-118/approvals/APPROVAL-20260630T162204620Z-f3b278ed.json`
- sha256: `00c814b46a507bdbf1fb9d45d37dd0329e524eccc13d45a20f48d7f50224ae7f`

The fixture artifact was committed.

Commit:

- `84e9380 Record FP-MCP-118 approval fixture`

## Non-Authorizing Result

The fixture correctly remained non-authorizing:

- `approvalEvidenceValid: false`
- `approvalValid: false`
- `approvalUsableForExecution: false`
- `approvalCreated: false`
- `approvalMutated: false`
- `humanApprovalRecorded: false`
- `executionAllowedNow: false`
- `executionStarted: false`
- `startEndpointContacted: false`
- `opencodeStarted: false`

## Safety Result

No real approval was created.

No approval was consumed.

No approval artifact was mutated after creation.

No execution was enabled.

No OpenCode process was started.

No runner start endpoint was contacted.

No runner run id was created.
