# FP-MCP-360 Inline Registration Extraction Evidence

## Result

Bridge commit 9b2e35b extracted the fourth inline MCP registration block from src/server.ts into src/tool-groups/inline-between-scoped-validation-and-read-file-tools.ts.

## Files Changed

- scripts/check-tool-contracts.mjs
- scripts/hardcoded-packet-id-allowlist.json
- src/server.ts
- src/tool-groups/inline-between-scoped-validation-and-read-file-tools.ts
- src/tool-registry/register-tools.ts

## Diff Summary

- 5 files changed
- 938 insertions
- 699 deletions
- new file: src/tool-groups/inline-between-scoped-validation-and-read-file-tools.ts

## Moved Tools

- forgepilot_record_execution_artifact_dry_run
- forgepilot_verify_execution_artifact_dry_run
- forgepilot_get_execution_enablement_status
- forgepilot_get_execution_disable_switch_status
- forgepilot_record_real_human_approval_evidence
- forgepilot_record_structured_human_approval
- forgepilot_record_human_approval_consumption
- forgepilot_record_human_approval_evidence_dry_run_fixture
- forgepilot_validate_human_approval_record
- forgepilot_record_approved_pre_start_evidence_artifact
- forgepilot_record_pre_start_evidence_dry_run
- forgepilot_validate_pre_start_evidence
- forgepilot_validate_start_request_state_snapshot
- forgepilot_record_start_state_snapshot_dry_run
- forgepilot_get_guarded_start_preflight_report
- forgepilot_start_remote_runner_request

## Preserved Conditional Registrations

- forgepilot_get_guarded_start_preflight_report
- forgepilot_start_remote_runner_request

## Preserved Surface Counts

- expectedToolCount: 78
- registeredToolCount: 78
- contractCount: 78
- expectedChatgptSafeCount: 11
- defaultVisibleCount: 11
- chatgptSafeVisibleCount: 11
- devVisibleCount: 76
- allVisibleCount: 78
- chatgptSafeExactMatch: true
- duplicateRegisteredTools: []
- duplicateContracts: []
- missingContracts: []
- extraContracts: []

## Verification

- node scripts/check-tool-contracts.mjs: PASS
- node ./node_modules/typescript/bin/tsc --noEmit: PASS
- node scripts/check-hardcoded-packet-ids.mjs: PASS
- git diff --check: PASS
- registerTool count: 78

## Allowlist Update

The hardcoded packet-id allowlist was updated because existing example references moved from src/server.ts to src/tool-groups/inline-between-scoped-validation-and-read-file-tools.ts with the extracted block.

No new hardcoded packet IDs were introduced. The FP-MCP-242 allowlist rationale was preserved and extended with FP-MCP-360 move context.

## Remaining Inline Registration

- registerInlineAfterDiagnostics remains in src/server.ts.

## Caveat

The extracted module uses broad dependency typing for moved output schemas. This did not change runtime behavior, but it remains a possible later type-hardening target.

## Boundary

No OpenCode start, runner start, execution approval, disable-switch change, or canary run occurred.
