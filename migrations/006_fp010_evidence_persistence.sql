-- FP-010: SQLite Evidence Persistence
-- Adds evidence_records table for persisting model run evidence structurally.
-- Stores provenance, results, artifact paths, and separate state axes.

CREATE TABLE IF NOT EXISTS evidence_records (
  evidence_id INTEGER PRIMARY KEY AUTOINCREMENT,
  packet_id INTEGER NOT NULL REFERENCES packets(id),
  run_id TEXT NOT NULL,
  model_id TEXT NOT NULL DEFAULT '',
  model_role TEXT NOT NULL DEFAULT '',
  branch TEXT NOT NULL DEFAULT '',
  commit_sha TEXT NOT NULL DEFAULT '',
  executor_result TEXT NOT NULL DEFAULT '',
  verification_result TEXT NOT NULL DEFAULT '',
  audit_result TEXT NOT NULL DEFAULT '',
  comparison_result TEXT NOT NULL DEFAULT '',
  metrics_path TEXT NOT NULL DEFAULT '',
  artifact_paths TEXT NOT NULL DEFAULT '[]',
  trust_tier TEXT NOT NULL DEFAULT 'TIER_0_UNTRUSTED' CHECK (trust_tier IN (
    'TIER_0_UNTRUSTED', 'TIER_1_SELF_REPORTED', 'TIER_2_VERIFIED_ARTIFACT', 'TIER_3_REPRODUCIBLE'
  )),
  validation_state TEXT NOT NULL DEFAULT 'INCOMPLETE' CHECK (validation_state IN (
    'VALID', 'INVALID', 'INCOMPLETE', 'DEFERRED'
  )),
  admission_state TEXT NOT NULL DEFAULT 'NOT_EVALUATED' CHECK (admission_state IN (
    'NOT_EVALUATED', 'REJECTED', 'PENDING', 'ADMITTED', 'QUARANTINED'
  )),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_evidence_packet_id ON evidence_records(packet_id);
CREATE INDEX IF NOT EXISTS idx_evidence_run_id ON evidence_records(run_id);
CREATE INDEX IF NOT EXISTS idx_evidence_model_id ON evidence_records(model_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_evidence_packet_run ON evidence_records(packet_id, run_id);
