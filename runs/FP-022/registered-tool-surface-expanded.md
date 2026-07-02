# FP-022 Expanded Registered Tool Surface

Includes direct `src/server.ts` registrations and delegated `src/tool-registrations/recent-tools.ts` registrations.

Total tools found: `38`

- `forgepilot_status` — `src/server.ts:9286` — UNCLASSIFIED_REVIEW_REQUIRED
- `forgepilot_get_opencode_status` — `src/server.ts:9329` — READ_OR_VALIDATION_ONLY_BY_NAME
- `forgepilot_get_opencode_capabilities` — `src/server.ts:9350` — READ_OR_VALIDATION_ONLY_BY_NAME
- `forgepilot_get_remote_runner_status` — `src/server.ts:9372` — READ_OR_VALIDATION_ONLY_BY_NAME
- `forgepilot_list_packets` — `src/server.ts:9394` — READ_OR_VALIDATION_ONLY_BY_NAME
- `forgepilot_list_runs` — `src/server.ts:9428` — READ_OR_VALIDATION_ONLY_BY_NAME
- `forgepilot_validate_opencode_run_request` — `src/server.ts:9461` — READ_OR_VALIDATION_ONLY_BY_NAME
- `forgepilot_create_opencode_run_request` — `src/server.ts:9487` — ARTIFACT_OR_SQLITE_WRITE_CAPABLE
- `forgepilot_list_opencode_run_requests` — `src/server.ts:9519` — READ_OR_VALIDATION_ONLY_BY_NAME
- `forgepilot_read_opencode_run_request` — `src/server.ts:9544` — READ_OR_VALIDATION_ONLY_BY_NAME
- `forgepilot_validate_remote_runner_request` — `src/server.ts:9569` — READ_OR_VALIDATION_ONLY_BY_NAME
- `forgepilot_validate_remote_runner_endpoint_request` — `src/server.ts:9594` — READ_OR_VALIDATION_ONLY_BY_NAME
- `forgepilot_validate_execution_preflight` — `src/server.ts:9625` — READ_OR_VALIDATION_ONLY_BY_NAME
- `forgepilot_record_execution_artifact_dry_run` — `src/server.ts:9655` — ARTIFACT_OR_SQLITE_WRITE_CAPABLE
- `forgepilot_verify_execution_artifact_dry_run` — `src/server.ts:9683` — READ_OR_VALIDATION_ONLY_BY_NAME
- `forgepilot_get_execution_enablement_status` — `src/server.ts:9718` — READ_OR_VALIDATION_ONLY_BY_NAME
- `forgepilot_get_execution_disable_switch_status` — `src/server.ts:9746` — READ_OR_VALIDATION_ONLY_BY_NAME
- `forgepilot_record_real_human_approval_evidence` — `src/server.ts:9783` — ARTIFACT_OR_SQLITE_WRITE_CAPABLE
- `forgepilot_record_human_approval_consumption` — `src/server.ts:9852` — ARTIFACT_OR_SQLITE_WRITE_CAPABLE
- `forgepilot_record_human_approval_evidence_dry_run_fixture` — `src/server.ts:9912` — ARTIFACT_OR_SQLITE_WRITE_CAPABLE
- `forgepilot_validate_human_approval_record` — `src/server.ts:9954` — READ_OR_VALIDATION_ONLY_BY_NAME
- `forgepilot_record_pre_start_evidence_dry_run` — `src/server.ts:9996` — ARTIFACT_OR_SQLITE_WRITE_CAPABLE
- `forgepilot_validate_pre_start_evidence` — `src/server.ts:10031` — READ_OR_VALIDATION_ONLY_BY_NAME
- `forgepilot_validate_start_request_state_snapshot` — `src/server.ts:10059` — READ_OR_VALIDATION_ONLY_BY_NAME
- `forgepilot_record_start_state_snapshot_dry_run` — `src/server.ts:10088` — ARTIFACT_OR_SQLITE_WRITE_CAPABLE
- `forgepilot_get_guarded_start_preflight_report` — `src/server.ts:10122` — READ_OR_VALIDATION_ONLY_BY_NAME
- `forgepilot_start_remote_runner_request` — `src/server.ts:10152` — REMOTE_RUNNER_START_CAPABLE, NETWORK_EXECUTION_GATE_REQUIRED
- `forgepilot_read_file` — `src/server.ts:10186` — READ_OR_VALIDATION_ONLY_BY_NAME
- `forgepilot_execute_terminal_command` — `src/server.ts:10227` — TERMINAL_COMMAND_EXECUTION_CAPABLE, HUMAN_APPROVAL_REQUIRED, SEPARATE_TERMINAL_SAFETY_GATE
- `forgepilot_persist_opencode_worker_telemetry` — `src/tool-registrations/recent-tools.ts:186` — ARTIFACT_OR_SQLITE_WRITE_CAPABLE
- `forgepilot_query_persisted_opencode_worker_telemetry` — `src/tool-registrations/recent-tools.ts:212` — UNCLASSIFIED_REVIEW_REQUIRED
- `forgepilot_read_persisted_opencode_worker_telemetry` — `src/tool-registrations/recent-tools.ts:246` — READ_OR_VALIDATION_ONLY_BY_NAME
- `forgepilot_capture_opencode_worker_telemetry` — `src/tool-registrations/recent-tools.ts:269` — ARTIFACT_OR_SQLITE_WRITE_CAPABLE
- `forgepilot_read_opencode_worker_telemetry` — `src/tool-registrations/recent-tools.ts:293` — READ_OR_VALIDATION_ONLY_BY_NAME
- `forgepilot_start_opencode_worker` — `src/tool-registrations/recent-tools.ts:316` — PROCESS_SPAWN, OPENCODE_EXECUTION_CAPABLE, SAFETY_GATE_REQUIRED
- `forgepilot_get_opencode_worker_status` — `src/tool-registrations/recent-tools.ts:345` — READ_OR_VALIDATION_ONLY_BY_NAME
- `forgepilot_read_opencode_worker_result` — `src/tool-registrations/recent-tools.ts:368` — READ_OR_VALIDATION_ONLY_BY_NAME
- `forgepilot_capture_workspace_snapshot` — `src/tool-registrations/recent-tools.ts:392` — ARTIFACT_OR_SQLITE_WRITE_CAPABLE
