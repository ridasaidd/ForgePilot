-- FP-005: OpenCode Telemetry Ingestion
-- Adds packet_execution_telemetry table for storing OpenCode-exported telemetry
-- linked to execution attempts via execution_id.

CREATE TABLE IF NOT EXISTS packet_execution_telemetry (
  telemetry_id INTEGER PRIMARY KEY AUTOINCREMENT,
  execution_id INTEGER NOT NULL REFERENCES packet_executions(execution_id),
  packet_id INTEGER NOT NULL REFERENCES packets(id),
  source TEXT NOT NULL DEFAULT 'OPENCODE_TELEMETRY',
  telemetry_artifact_path TEXT NOT NULL DEFAULT '',
  opencode_session_id TEXT,
  provider TEXT,
  model TEXT,
  model_variant TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  reasoning_tokens INTEGER,
  cache_read_tokens INTEGER,
  cache_write_tokens INTEGER,
  cost REAL,
  session_created_at TEXT,
  session_updated_at TEXT,
  duration_ms INTEGER,
  ingestion_mode TEXT NOT NULL DEFAULT 'DIRECT_ARTIFACT',
  mapping_confidence TEXT NOT NULL DEFAULT 'EXPLICIT',
  trust_tier TEXT NOT NULL DEFAULT 'TIER_2_VERIFIED_ARTIFACT',
  validation_state TEXT NOT NULL DEFAULT 'VALID',
  admission_state TEXT NOT NULL DEFAULT 'PENDING',
  recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_telemetry_execution_id ON packet_execution_telemetry(execution_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_packet_id ON packet_execution_telemetry(packet_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_source ON packet_execution_telemetry(source);
CREATE INDEX IF NOT EXISTS idx_telemetry_ingestion_mode ON packet_execution_telemetry(ingestion_mode);
CREATE UNIQUE INDEX IF NOT EXISTS idx_telemetry_execution_artifact ON packet_execution_telemetry(execution_id, telemetry_artifact_path);
