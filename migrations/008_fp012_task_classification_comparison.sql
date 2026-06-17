-- FP-012: Task Classification and Model Comparison Protocol
-- Adds append-only tables for task classification events and model comparison events.
-- These tables exist alongside FP-008 classification/outcome tables without replacing them.

-- Task classification events: records structured packet task classification observations.
-- This is distinct from FP-008's packet_classification_observations which use a different
-- vocabulary and serve a different purpose.
CREATE TABLE IF NOT EXISTS fp012_task_classification_events (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  packet_id               INTEGER NOT NULL REFERENCES packets(id),
  task_class              TEXT NOT NULL CHECK (task_class IN (
                            'DOCUMENTATION', 'PERSISTENCE', 'CLI', 'TESTING', 'REFACTOR',
                            'BUGFIX', 'ARCHITECTURE', 'EVALUATION', 'TELEMETRY', 'UNKNOWN'
                          )),
  risk_level              TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  blast_radius            TEXT NOT NULL CHECK (blast_radius IN (
                            'LOCAL', 'MODULE', 'DATABASE', 'WORKFLOW', 'REPOSITORY', 'UNKNOWN'
                          )),
  evidence_sensitivity    TEXT NOT NULL CHECK (evidence_sensitivity IN ('LOW', 'MEDIUM', 'HIGH')),
  audit_requirement       TEXT NOT NULL CHECK (audit_requirement IN ('NONE', 'STANDARD', 'STRICT')),
  comparison_requirement  TEXT NOT NULL CHECK (comparison_requirement IN ('NONE', 'OPTIONAL', 'REQUIRED')),
  classification_source   TEXT NOT NULL CHECK (classification_source IN ('HUMAN', 'MODEL', 'SYSTEM', 'DERIVED')),
  actor                   TEXT NOT NULL DEFAULT '',
  model_identity          TEXT NOT NULL DEFAULT '',
  rationale               TEXT NOT NULL DEFAULT '',
  correction_of           INTEGER REFERENCES fp012_task_classification_events(id),
  correction_reason       TEXT NOT NULL DEFAULT '',
  created_at              TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_fp012_class_events_packet
  ON fp012_task_classification_events(packet_id);

CREATE INDEX IF NOT EXISTS idx_fp012_class_events_created
  ON fp012_task_classification_events(packet_id, created_at);

-- Model comparison events: records structured comparisons of two model executions
-- for the same packet. This is distinct from FP-008's comparison_outcome field on
-- model_outcome_observations. Comparison records are append-only and do not mutate
-- evidence records, validation events, or admission events.
CREATE TABLE IF NOT EXISTS fp012_model_comparison_events (
  id                          INTEGER PRIMARY KEY AUTOINCREMENT,
  packet_id                   INTEGER NOT NULL REFERENCES packets(id),
  comparison_outcome          TEXT NOT NULL CHECK (comparison_outcome IN (
                                'MODEL_A_SELECTED', 'MODEL_B_SELECTED', 'TIE', 'BOTH_ACCEPTED',
                                'BOTH_REJECTED', 'INCONCLUSIVE', 'DEFERRED'
                              )),
  comparison_basis            TEXT NOT NULL CHECK (comparison_basis IN (
                                'CORRECTNESS', 'SCOPE_DISCIPLINE', 'TEST_PASS_RATE', 'SCHEMA_INTEGRATION',
                                'PACKET_ALIGNMENT', 'EVIDENCE_QUALITY', 'MAINTAINABILITY', 'COMPOSITE'
                              )),
  execution_a_id              INTEGER REFERENCES packet_executions(execution_id),
  execution_b_id              INTEGER REFERENCES packet_executions(execution_id),
  evidence_a_id               INTEGER REFERENCES evidence_records(evidence_id),
  evidence_b_id               INTEGER REFERENCES evidence_records(evidence_id),
  model_a_id                  TEXT NOT NULL DEFAULT '',
  model_b_id                  TEXT NOT NULL DEFAULT '',
  model_a_role                TEXT NOT NULL DEFAULT '',
  model_b_role                TEXT NOT NULL DEFAULT '',
  selected_model              TEXT NOT NULL DEFAULT '',
  selection_reason            TEXT NOT NULL DEFAULT '',
  model_a_defects             TEXT NOT NULL DEFAULT '[]',
  model_b_defects             TEXT NOT NULL DEFAULT '[]',
  model_a_verification_result TEXT NOT NULL DEFAULT '',
  model_b_verification_result TEXT NOT NULL DEFAULT '',
  model_a_audit_result        TEXT NOT NULL DEFAULT '',
  model_b_audit_result        TEXT NOT NULL DEFAULT '',
  model_a_admission_state     TEXT NOT NULL DEFAULT 'NOT_EVALUATED' CHECK (model_a_admission_state IN (
                                'ADMITTED', 'PENDING', 'REJECTED', 'QUARANTINED', 'NOT_EVALUATED'
                              )),
  model_b_admission_state     TEXT NOT NULL DEFAULT 'NOT_EVALUATED' CHECK (model_b_admission_state IN (
                                'ADMITTED', 'PENDING', 'REJECTED', 'QUARANTINED', 'NOT_EVALUATED'
                              )),
  compared_by                 TEXT NOT NULL DEFAULT '',
  correction_of               INTEGER REFERENCES fp012_model_comparison_events(id),
  correction_reason           TEXT NOT NULL DEFAULT '',
  created_at                  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_fp012_comp_events_packet
  ON fp012_model_comparison_events(packet_id);

CREATE INDEX IF NOT EXISTS idx_fp012_comp_events_created
  ON fp012_model_comparison_events(packet_id, created_at);
