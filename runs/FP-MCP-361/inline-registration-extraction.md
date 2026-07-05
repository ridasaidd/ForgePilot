# FP-MCP-361 Inline Registration Extraction Evidence

## Result

Bridge commit 3ba467a extracted the final inline MCP registration block from src/server.ts into src/tool-groups/inline-after-diagnostics-tools.ts.

## Files Changed

- scripts/check-tool-contracts.mjs
- scripts/hardcoded-packet-id-allowlist.json
- src/server.ts
- src/tool-groups/inline-after-diagnostics-tools.ts
- src/tool-registry/register-tools.ts

## Diff Summary

- 5 files changed
- 986 insertions
- 795 deletions
- new file: src/tool-groups/inline-after-diagnostics-tools.ts

## Moved Tools

- forgepilot_get_execution_gate_orientation
- forgepilot_get_workspace_change_inspection
- forgepilot_record_operator_workflow_trace
- forgepilot_summarize_operator_workflow_traces
- forgepilot_preview_operator_local_execution_clearance_review_manifest
- forgepilot_create_operator_local_execution_clearance
- forgepilot_get_operator_local_execution_clearance_status
- forgepilot_record_packet_checkpoint
- forgepilot_execute_terminal_command
- forgepilot_preview_operator_local_scoped_execution_enablement_review_manifest
- forgepilot_create_operator_local_scoped_execution_enablement
- forgepilot_get_operator_local_scoped_execution_enablement_status
- forgepilot_apply_guarded_canary_next_gate
- forgepilot_get_guarded_canary_next_gate
- forgepilot_observe_next_gate
- forgepilot_preview_clearance_creation
- forgepilot_record_clearance_intent

## Inline Callback Ownership Removed

- registerInlineAfterDiagnostics callback body removed from src/server.ts
- no const registerInline declarations remain in src/server.ts
- RegisterInlineTools callback type removed from src/tool-registry/register-tools.ts
- no registerInline callback option fields remain in src/tool-registry/register-tools.ts
- register-tools.ts calls registerInlineAfterDiagnosticsTools directly

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
- inline callback declarations remaining in server.ts: 0
- RegisterInlineTools callback plumbing remaining in register-tools.ts: 0

## Allowlist Update

The hardcoded packet-id allowlist was updated because existing example references moved from src/server.ts to src/tool-groups/inline-after-diagnostics-tools.ts with the extracted block.

No new hardcoded packet IDs were introduced.

## Caveat

The extracted module uses broad dependency typing for moved output schemas and helper functions. This did not change runtime behavior, but it remains a possible later type-hardening target.

## Boundary

No OpenCode start, runner start, execution approval, disable-switch change, or canary run occurred.
