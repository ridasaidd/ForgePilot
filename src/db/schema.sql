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
