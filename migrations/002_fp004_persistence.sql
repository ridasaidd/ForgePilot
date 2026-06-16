-- FP-004: SQLite Metrics Persistence Implementation
-- Adds packet intent columns to existing packets table.
-- Creates append-only lifecycle events, execution attempts, and derived state view.

-- Extend existing packets table with immutable intent fields
ALTER TABLE packets ADD COLUMN title TEXT NOT NULL DEFAULT '';
ALTER TABLE packets ADD COLUMN packet_path TEXT NOT NULL DEFAULT '';
ALTER TABLE packets ADD COLUMN packet_hash TEXT NOT NULL DEFAULT '';

-- Append-only lifecycle event observations
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

CREATE INDEX IF NOT EXISTS idx_lifecycle_packet_id ON packet_lifecycle_events(packet_id, created_at);
CREATE INDEX IF NOT EXISTS idx_lifecycle_execution_id ON packet_lifecycle_events(execution_id);

-- Append-only compute attempt records
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_executions_packet_attempt ON packet_executions(packet_id, attempt_number);
CREATE INDEX IF NOT EXISTS idx_executions_state ON packet_executions(execution_state);
CREATE INDEX IF NOT EXISTS idx_executions_error_code ON packet_executions(error_code);

-- Derived view: current packet state from latest lifecycle event
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
