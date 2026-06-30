# FP-MCP-119 Pre-Start Evidence Fixture

Result: PASSED

Recorded and committed a non-executing pre-start evidence dry-run artifact for the existing FP-MCP-117 request artifact.

## Packet

- FP-MCP-119 — Guarded Preflight Report With Pre-Start Evidence Fixture

## Request Under Test

- packetId: `FP-MCP-117`
- requestId: `REQ-20260630T160920008Z-195b9969`
- modelId: `deepseek-v4-pro-high`
- runMode: `DESIGN_ONLY`
- request artifact path: `runs/FP-MCP-117/opencode-requests/REQ-20260630T160920008Z-195b9969.json`
- request artifact sha256: `512a8c2c48e69b22d0e48206c9e9af65aff26d44eefded9b8ca9e6b0b064a454`

## Pre-Start Evidence Recording

Tool:

- `forgepilot_record_pre_start_evidence_dry_run`

Input:

```json
{
  "packetId": "FP-MCP-117",
  "requestId": "REQ-20260630T160920008Z-195b9969",
  "approval": "START_REMOTE_RUNNER_REQUEST"
}
```

Observed:

```json
{
  "schemaVersion": "FP-MCP-052",
  "packetId": "FP-MCP-117",
  "requestId": "REQ-20260630T160920008Z-195b9969",
  "dryRunRecorded": true,
  "executionPermitted": false,
  "executionStarted": false,
  "startEndpointContacted": false,
  "opencodeStarted": false,
  "runnerContactedForStart": false,
  "approvalAccepted": true,
  "requestArtifactValid": true,
  "preflightEvaluated": true,
  "disableSwitchStatusEvaluated": true,
  "disableSwitchActive": true,
  "preStartEvidencePath": "runs/FP-MCP-117/pre-start-evidence/REQ-20260630T160920008Z-195b9969.json",
  "preStartEvidenceArtifactPresentBefore": false,
  "preStartEvidenceArtifactPresentAfter": true,
  "requestArtifactPath": "runs/FP-MCP-117/opencode-requests/REQ-20260630T160920008Z-195b9969.json",
  "requestArtifactSha256": "512a8c2c48e69b22d0e48206c9e9af65aff26d44eefded9b8ca9e6b0b064a454",
  "preStartEvidenceSha256": "c4e46ed8e91c6e55b7193be32a32965fb74d6f750e135b451eb44a93b0590fdf",
  "modelId": "deepseek-v4-pro-high",
  "runMode": "DESIGN_ONLY",
  "baseCommit": "034cfdb",
  "currentCommit": "ab58788",
  "effectiveDisableReason": "EXECUTION_DISABLED_GLOBAL",
  "effectiveDisableScope": "GLOBAL",
  "boundaryVersion": "FP-MCP-052",
  "statusSource": "ForgePilot non-executing pre-start evidence dry-run recorder",
  "checkedAt": "2026-06-30T16:29:20.879Z",
  "reasons": [
    "EXECUTION_DISABLED",
    "START_ENDPOINT_NOT_CONTACTED",
    "OPENCODE_NOT_STARTED",
    "PRE_START_EVIDENCE_DRY_RUN",
    "EXECUTION_DISABLED_GLOBAL",
    "HUMAN_APPROVAL_EVIDENCE_MISSING",
    "EXECUTION_PREFLIGHT_HUMAN_APPROVAL_EVIDENCE_GATE_BLOCKED",
    "HUMAN_APPROVAL_EVIDENCE_NOT_USABLE_FOR_EXECUTION",
    "RUNNER_EXECUTION_DISABLED",
    "OPENCODE_EXECUTION_DISABLED",
    "DISABLE_SWITCH_ACTIVE",
    "EXECUTION_NOT_ALLOWED"
  ]
}
```

## Created Artifact

- path: `runs/FP-MCP-117/pre-start-evidence/REQ-20260630T160920008Z-195b9969.json`
- sha256: `c4e46ed8e91c6e55b7193be32a32965fb74d6f750e135b451eb44a93b0590fdf`

The pre-start evidence artifact was committed.

Commit:

- `435a739 Record FP-MCP-119 pre-start evidence fixture`

## Safety Result

Preserved:

- `dryRunRecorded: true`
- `executionPermitted: false`
- `executionStarted: false`
- `startEndpointContacted: false`
- `opencodeStarted: false`
- `runnerContactedForStart: false`
- `requestArtifactValid: true`
- `disableSwitchActive: true`

No execution was enabled.

No OpenCode process was started.

No runner start endpoint was contacted.

No runner run id was created.

No approval was consumed.

No request artifact was mutated.
