CREATE TABLE IF NOT EXISTS opencode_worker_telemetry (
  packet_id TEXT NOT NULL,
  worker_id TEXT NOT NULL,
  schema_version TEXT NOT NULL,
  captured_at TEXT NOT NULL,
  persisted_at TEXT NOT NULL DEFAULT (datetime('now')),
  worker_status TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  duration_ms INTEGER,
  target_workspace_id TEXT NOT NULL,
  workspace_path TEXT NOT NULL,
  prompt_file TEXT NOT NULL,
  prompt_file_sha256 TEXT NOT NULL,
  model_id TEXT,
  command_executable TEXT NOT NULL,
  command_args_json TEXT NOT NULL,
  status_path TEXT NOT NULL,
  status_sha256 TEXT,
  start_request_path TEXT NOT NULL,
  start_request_sha256 TEXT,
  stdout_path TEXT NOT NULL,
  stdout_byte_count INTEGER,
  stdout_sha256 TEXT,
  stderr_path TEXT NOT NULL,
  stderr_byte_count INTEGER,
  stderr_sha256 TEXT,
  terminal_state TEXT NOT NULL,
  provenance_completeness TEXT NOT NULL,
  trust_tier TEXT NOT NULL,
  validation_state TEXT NOT NULL,
  admission_state TEXT NOT NULL,
  telemetry_path TEXT NOT NULL,
  observation_semantics TEXT NOT NULL,
  reasons_json TEXT NOT NULL,
  PRIMARY KEY (packet_id, worker_id)
);

CREATE INDEX IF NOT EXISTS idx_opencode_worker_telemetry_packet_id
  ON opencode_worker_telemetry(packet_id);

CREATE INDEX IF NOT EXISTS idx_opencode_worker_telemetry_worker_status
  ON opencode_worker_telemetry(worker_status);

CREATE INDEX IF NOT EXISTS idx_opencode_worker_telemetry_validation_state
  ON opencode_worker_telemetry(validation_state);

CREATE INDEX IF NOT EXISTS idx_opencode_worker_telemetry_admission_state
  ON opencode_worker_telemetry(admission_state);
