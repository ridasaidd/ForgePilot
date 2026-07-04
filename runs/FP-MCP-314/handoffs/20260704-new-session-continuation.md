# FP-MCP New Session Continuation Handoff — 2026-07-04

## Current project state

ForgePilot core repo:
- Path: `/home/ridasaidd/forgepilot`
- Branch before this handoff commit: `main`
- Latest admitted packet before this handoff: `FP-MCP-314`
- FP-MCP-314 commit: `1b12b0a`
- Evidence/admission: `evidenceId=192`, `admissionEventId=192`, `canonicalState=ADMITTED`

MCP bridge repo:
- Path: `/home/ridasaidd/forgepilot-chatgpt-mcp`
- Branch: `feature/oauth-auth0`
- Latest implementation commit: `0c2d3cb Narrow guarded canary action surface`

## Why this handoff exists

The original session repeatedly selected adjacent manual gate tools instead of the intended sequencer/executor tools. To remove that failure mode:

- FP-MCP-308 added `forgepilot_get_guarded_canary_next_gate` as an advisory sequencer.
- FP-MCP-312 added `forgepilot_apply_guarded_canary_next_gate` as a V1 enforced executor.
- FP-MCP-314 narrowed the default MCP action surface so adjacent manual canary tools are hidden unless `FORGEPILOT_CANARY_ACTION_SURFACE_NARROWED=0`.

The user restarted the MCP service after FP-MCP-314. A new ChatGPT session checked the surface and saw the expected narrowing:

Visible guarded continuation tools:
- `forgepilot_apply_guarded_canary_next_gate`
- `forgepilot_get_guarded_canary_next_gate` read-only sequencer

Expected adjacent manual canary tools were absent:
- `forgepilot_get_guarded_start_preflight_report`
- `forgepilot_preview_operator_local_execution_clearance_review_manifest`
- `forgepilot_create_operator_local_execution_clearance`
- `forgepilot_preview_operator_local_scoped_execution_enablement_review_manifest`
- `forgepilot_create_operator_local_scoped_execution_enablement`
- `forgepilot_get_operator_local_scoped_execution_enablement_status`
- `forgepilot_validate_execution_preflight`
- `forgepilot_start_remote_runner_request`

`forgepilot_get_operator_local_execution_clearance_status` may still be visible; it is read-only and was not one of the dangerous creation/preview tools.

## Important correction

The new session checked for request artifacts under FP-MCP-314 and found none. That is expected. FP-MCP-314 is a hardening packet, not the canary request packet.

The live canary request tuple remains the FP-MCP-295 request:

- `executionPacketId`: `FP-MCP-295`
- `requestId`: `REQ-20260704T142232816Z-a82a42b6`
- `modelId`: `deepseek-v4-pro-high`
- `runMode`: `DESIGN_ONLY`
- `executionBaseCommit`: `5c0ab8b`
- `branch`: `main`
- `targetWorkspaceId`: `forgepilot`
- `stateSnapshotAttemptId`: `ATTEMPT-20260704T143856516Z-0fb5d745`

Known evidence hashes from FP-MCP-299 / sequencer output:
- `preStartEvidenceSha256`: `51cf00f1954880744b16f19e7a1b81e6993300632cd14752090626570206ca53`
- `preStartSnapshotSha256`: `52a3d09e8eef033636f37eb2772c679c45a7839703be16ddbe9636296bd12183`
- `postStartSnapshotSha256`: `11ed1cbe6ee07f035387fbfc482b80e218e11ad2ed597e73a05fc4d37ce33320`

## Current approval/clearance status

Prior approvals are expired:
- FP-MCP-310 approval: `APPROVAL-20260704T160142146Z-6a78dc28`, expired `2026-07-04T16:11:00Z`
- FP-MCP-313 approval: `APPROVAL-20260704T162359975Z-16d7dc66`, expired `2026-07-04T16:32:30Z`

No fresh clearance exists.
No scoped enablement exists.
The guarded canary has not run.
No approval was consumed.
No runner start endpoint was contacted.
OpenCode was not started.

## Next safe workflow

Do not attempt manual clearance/enablement tools.

1. Verify current repo state.
2. Create a fresh scoped approval, likely under `FP-MCP-315`, for the FP-MCP-295 tuple above.
3. Commit the approval artifact.
4. Validate the approval record.
5. Call only:
   - `forgepilot_apply_guarded_canary_next_gate`

Use these executor arguments after fresh approval:

```json
{
  "executionPacketId": "FP-MCP-295",
  "requestId": "REQ-20260704T142232816Z-a82a42b6",
  "modelId": "deepseek-v4-pro-high",
  "runMode": "DESIGN_ONLY",
  "executionBaseCommit": "5c0ab8b",
  "branch": "main",
  "targetWorkspaceId": "forgepilot",
  "approvalPacketId": "FP-MCP-315",
  "approvalId": "<fresh approval id>",
  "stateSnapshotAttemptId": "ATTEMPT-20260704T143856516Z-0fb5d745",
  "desiredApprovalPacketId": "FP-MCP-315",
  "applyPreviewFollowOn": true,
  "clearanceExpiresInMinutes": 5,
  "approval": "APPLY_GUARDED_CANARY_NEXT_GATE"
}
```

Expected executor behavior after fresh approval:
- It should call the sequencer internally.
- It should apply the clearance preview internally.
- With `applyPreviewFollowOn=true`, it should create the operator-local clearance internally if preview passes.
- It must not start the runner, consume approval, or run OpenCode in V1.

After clearance creation, stop and inspect the executor result. Do not proceed to enablement or runner start unless a later packet explicitly extends the enforced executor to those gates.

## Boundary

This handoff is documentation only. It does not authorize execution, consume approval, create clearance, create enablement, start OpenCode, contact the runner start endpoint, or run the canary.
