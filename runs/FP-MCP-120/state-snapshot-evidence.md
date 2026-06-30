# FP-MCP-120 State Snapshot Fixture

Result: PASSED

Recorded and committed non-executing pre/post start state snapshot dry-run artifacts for the existing FP-MCP-117 request artifact.

## Packet

- FP-MCP-120 — Guarded Preflight Report With State Snapshot Fixture

## Request Under Test

- packetId: `FP-MCP-117`
- requestId: `REQ-20260630T160920008Z-195b9969`
- modelId: `deepseek-v4-pro-high`
- runMode: `DESIGN_ONLY`
- request artifact path: `runs/FP-MCP-117/opencode-requests/REQ-20260630T160920008Z-195b9969.json`
- request artifact sha256: `512a8c2c48e69b22d0e48206c9e9af65aff26d44eefded9b8ca9e6b0b064a454`

## Prior Evidence

Approval fixture:

- approvalId: `APPROVAL-20260630T162204620Z-f3b278ed`

Pre-start evidence fixture:

- path: `runs/FP-MCP-117/pre-start-evidence/REQ-20260630T160920008Z-195b9969.json`
- sha256: `c4e46ed8e91c6e55b7193be32a32965fb74d6f750e135b451eb44a93b0590fdf`

## State Snapshot Recording

Tool:

- `forgepilot_record_start_state_snapshot_dry_run`

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
  "schemaVersion": "FP-MCP-056",
  "packetId": "FP-MCP-117",
  "requestId": "REQ-20260630T160920008Z-195b9969",
  "dryRunRecorded": true,
  "stateSnapshotAttemptId": "ATTEMPT-20260630T163626827Z-a422b20c",
  "preStartSnapshotRecorded": true,
  "postStartSnapshotRecorded": true,
  "preStartSnapshotPath": "runs/FP-MCP-117/start-state-snapshots/REQ-20260630T160920008Z-195b9969/ATTEMPT-20260630T163626827Z-a422b20c/pre-start-state.json",
  "postStartSnapshotPath": "runs/FP-MCP-117/start-state-snapshots/REQ-20260630T160920008Z-195b9969/ATTEMPT-20260630T163626827Z-a422b20c/post-start-state.json",
  "preStartSnapshotSha256": "f6d7b0f4d18f522e102cdf8506637d931f7ce715ead4fab79f043cd9f23fc7af",
  "postStartSnapshotSha256": "3286643db713e048658aa4e8aaace032bbd70f31c2d0faf64153c7ebfbd8f51f",
  "requestArtifactValid": true,
  "preStartEvidenceEvaluated": true,
  "preStartEvidenceValid": true,
  "disableSwitchEvaluated": true,
  "disableSwitchActive": true,
  "approvalAccepted": true,
  "executionPermitted": false,
  "executionStarted": false,
  "startEndpointContacted": false,
  "opencodeStarted": false,
  "runnerContactedForStart": false,
  "requestArtifactPath": "runs/FP-MCP-117/opencode-requests/REQ-20260630T160920008Z-195b9969.json",
  "requestArtifactSha256": "512a8c2c48e69b22d0e48206c9e9af65aff26d44eefded9b8ca9e6b0b064a454",
  "preStartEvidencePath": "runs/FP-MCP-117/pre-start-evidence/REQ-20260630T160920008Z-195b9969.json",
  "preStartEvidenceSha256": "c4e46ed8e91c6e55b7193be32a32965fb74d6f750e135b451eb44a93b0590fdf",
  "effectiveDisableReason": "EXECUTION_DISABLED_GLOBAL",
  "effectiveDisableScope": "GLOBAL",
  "boundaryVersion": "FP-MCP-056",
  "statusSource": "ForgePilot non-executing start state snapshot dry-run recorder",
  "checkedAt": "2026-06-30T16:36:26.827Z",
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
  ]
}
```

## Created Artifacts

Attempt id:

- `ATTEMPT-20260630T163626827Z-a422b20c`

Pre-start snapshot:

- path: `runs/FP-MCP-117/start-state-snapshots/REQ-20260630T160920008Z-195b9969/ATTEMPT-20260630T163626827Z-a422b20c/pre-start-state.json`
- sha256: `f6d7b0f4d18f522e102cdf8506637d931f7ce715ead4fab79f043cd9f23fc7af`

Post-start snapshot:

- path: `runs/FP-MCP-117/start-state-snapshots/REQ-20260630T160920008Z-195b9969/ATTEMPT-20260630T163626827Z-a422b20c/post-start-state.json`
- sha256: `3286643db713e048658aa4e8aaace032bbd70f31c2d0faf64153c7ebfbd8f51f`

The state snapshot artifacts were committed.

Commit:

- `3de49f8 Record FP-MCP-120 state snapshot fixture`

## Safety Result

Preserved:

- `dryRunRecorded: true`
- `preStartSnapshotRecorded: true`
- `postStartSnapshotRecorded: true`
- `requestArtifactValid: true`
- `preStartEvidenceValid: true`
- `disableSwitchActive: true`
- `executionPermitted: false`
- `executionStarted: false`
- `startEndpointContacted: false`
- `opencodeStarted: false`
- `runnerContactedForStart: false`

No execution was enabled.

No OpenCode process was started.

No runner start endpoint was contacted.

No runner run id was created.

No approval was consumed.

No request artifact was mutated.
