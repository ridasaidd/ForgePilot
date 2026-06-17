-- ForgePilot Schema
-- Current state representation as of FP-004
-- Includes FP-001 (events) + FP-002-V3 core schema tables + FP-004 persistence

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS phases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phase_id INTEGER NOT NULL REFERENCES phases(id),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  step_id INTEGER NOT NULL REFERENCES steps(id),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS packets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL REFERENCES tasks(id),
  packet_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  title TEXT NOT NULL DEFAULT '',
  packet_path TEXT NOT NULL DEFAULT '',
  packet_hash TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS clarifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  packet_id INTEGER NOT NULL REFERENCES packets(id),
  question TEXT NOT NULL,
  answer TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT
);

CREATE TABLE IF NOT EXISTS executions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  packet_id INTEGER NOT NULL REFERENCES packets(id),
  executor_model TEXT NOT NULL,
  result TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS audits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  execution_id INTEGER NOT NULL REFERENCES executions(id),
  auditor_model TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  root_cause_level TEXT,
  root_cause_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS leases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL REFERENCES tasks(id),
  worker_id TEXT NOT NULL,
  leased_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS routing_decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  packet_id INTEGER NOT NULL REFERENCES packets(id),
  chosen_model TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS model_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_name TEXT NOT NULL,
  task_type TEXT NOT NULL,
  success_rate REAL NOT NULL DEFAULT 0.0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- FP-004: Append-only lifecycle event observations
CREATE TABLE IF NOT EXISTS packet_lifecycle_events (
  event_id INTEGER PRIMARY KEY AUTOINCREMENT,
  packet_id INTEGER NOT NULL REFERENCES packets(id),
  event_type TEXT NOT NULL,
  lifecycle_state TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT '',
  actor TEXT NOT NULL DEFAULT '',
  reason TEXT NOT NULL DEFAULT '',
  artifact_path TEXT NOT NULL DEFAULT '',
  execution_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- FP-004: Append-only compute attempt records
CREATE TABLE IF NOT EXISTS packet_executions (
  execution_id INTEGER PRIMARY KEY AUTOINCREMENT,
  packet_id INTEGER NOT NULL REFERENCES packets(id),
  attempt_number INTEGER NOT NULL DEFAULT 1,
  trace_id TEXT NOT NULL DEFAULT '',
  requested_model TEXT NOT NULL DEFAULT '',
  executed_model TEXT NOT NULL DEFAULT '',
  provider TEXT NOT NULL DEFAULT '',
  execution_state TEXT NOT NULL DEFAULT 'RUNNING',
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  error_code TEXT,
  error_message TEXT,
  executor_result_path TEXT NOT NULL DEFAULT '',
  verification_path TEXT NOT NULL DEFAULT '',
  audit_prompt_path TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- FP-004: Derived view - current packet state from latest lifecycle event
CREATE VIEW IF NOT EXISTS packet_current_state AS
SELECT
  p.id AS packet_id,
  p.title,
  p.packet_path,
  p.packet_hash,
  le.lifecycle_state AS current_state,
  le.event_type AS last_event_type,
  le.created_at AS last_event_at
FROM packets p
LEFT JOIN (
  SELECT
    packet_id,
    lifecycle_state,
    event_type,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY packet_id ORDER BY created_at DESC, event_id DESC) AS rn
  FROM packet_lifecycle_events
) le ON p.id = le.packet_id AND le.rn = 1;

-- FP-011: Append-only validation evaluation events
CREATE TABLE IF NOT EXISTS evidence_record_validation_events (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  evidence_record_id     INTEGER NOT NULL REFERENCES evidence_records(evidence_id),
  validation_state       TEXT NOT NULL
                         CHECK (validation_state IN ('VALID', 'INVALID', 'INCOMPLETE', 'DEFERRED')),
  validation_actor_type  TEXT NOT NULL DEFAULT 'system'
                         CHECK (validation_actor_type IN ('automated_validator', 'human_auditor', 'model_reviewer', 'system')),
  validation_actor_id    TEXT NOT NULL DEFAULT '',
  validation_reason      TEXT NOT NULL DEFAULT '',
  validation_details     TEXT NOT NULL DEFAULT '{}',
  provenance_complete    INTEGER NOT NULL DEFAULT 1,
  created_at             TEXT NOT NULL DEFAULT (datetime('now'))
);

-- FP-011: Append-only admission evaluation events
CREATE TABLE IF NOT EXISTS evidence_record_admission_events (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  evidence_record_id     INTEGER NOT NULL REFERENCES evidence_records(evidence_id),
  admission_state        TEXT NOT NULL
                         CHECK (admission_state IN ('NOT_EVALUATED', 'REJECTED', 'PENDING', 'ADMITTED', 'QUARANTINED')),
  admission_actor_type   TEXT NOT NULL DEFAULT 'system'
                         CHECK (admission_actor_type IN ('automated_validator', 'human_auditor', 'model_reviewer', 'system')),
  admission_actor_id     TEXT NOT NULL DEFAULT '',
  admission_reason       TEXT NOT NULL DEFAULT '',
  trust_tier_at_admission TEXT NOT NULL DEFAULT 'TIER_0_UNTRUSTED'
                          CHECK (trust_tier_at_admission IN ('TIER_0_UNTRUSTED', 'TIER_1_SELF_REPORTED',
                                'TIER_2_VERIFIED_ARTIFACT', 'TIER_3_REPRODUCIBLE')),
  provenance_complete    INTEGER NOT NULL DEFAULT 1,
  created_at             TEXT NOT NULL DEFAULT (datetime('now'))
);

-- FP-012: Append-only task classification events
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

-- FP-012: Append-only model comparison events
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
