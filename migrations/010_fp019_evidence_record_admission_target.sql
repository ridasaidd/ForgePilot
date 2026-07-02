-- FP-019: Allow evidence_admission_events to target evidence_records.
-- SQLite cannot ALTER CHECK constraints, so rebuild the table preserving rows.

PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS evidence_admission_events_fp019_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_observation_type TEXT NOT NULL CHECK (target_observation_type IN (
    'classification_observation',
    'outcome_observation',
    'evidence_record'
  )),
  target_observation_id INTEGER NOT NULL,
  admission_decision TEXT NOT NULL CHECK (admission_decision IN (
    'ADMITTED', 'REJECTED', 'PENDING'
  )),
  admission_actor_type TEXT NOT NULL CHECK (admission_actor_type IN (
    'human_auditor', 'automated_validator', 'model_reviewer', 'cross_model_consensus', 'system'
  )),
  admission_actor_id TEXT NOT NULL DEFAULT '',
  admission_trust_tier TEXT NOT NULL DEFAULT 'TIER_0' CHECK (admission_trust_tier IN (
    'TIER_0', 'TIER_1', 'TIER_2', 'TIER_3'
  )),
  validation_state TEXT NOT NULL DEFAULT 'VALID' CHECK (validation_state IN (
    'VALID', 'INVALID', 'INCOMPLETE', 'DEFERRED'
  )),
  provenance_complete INTEGER NOT NULL DEFAULT 0 CHECK (provenance_complete IN (0, 1)),
  admission_basis TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO evidence_admission_events_fp019_new (
  id, target_observation_type, target_observation_id, admission_decision,
  admission_actor_type, admission_actor_id, admission_trust_tier,
  validation_state, provenance_complete, admission_basis, created_at
)
SELECT
  id, target_observation_type, target_observation_id, admission_decision,
  admission_actor_type, admission_actor_id, admission_trust_tier,
  validation_state, provenance_complete, admission_basis, created_at
FROM evidence_admission_events;

DROP TABLE evidence_admission_events;
ALTER TABLE evidence_admission_events_fp019_new RENAME TO evidence_admission_events;

CREATE INDEX IF NOT EXISTS idx_admission_obs_target
  ON evidence_admission_events(target_observation_type, target_observation_id);
CREATE INDEX IF NOT EXISTS idx_admission_decision
  ON evidence_admission_events(admission_decision);

PRAGMA foreign_keys = ON;
