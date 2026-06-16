-- FP-009: Evidence Admission Persistence
-- Adds append-only tables for evidence admission events, admission review requests,
-- and admission invalidation events.

CREATE TABLE IF NOT EXISTS evidence_admission_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_observation_type TEXT NOT NULL CHECK (target_observation_type IN (
    'classification_observation',
    'outcome_observation'
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

CREATE INDEX IF NOT EXISTS idx_admission_obs_target ON evidence_admission_events(target_observation_type, target_observation_id);
CREATE INDEX IF NOT EXISTS idx_admission_decision ON evidence_admission_events(admission_decision);

CREATE TABLE IF NOT EXISTS admission_review_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_admission_event_id INTEGER NOT NULL REFERENCES evidence_admission_events(id),
  review_trigger_type TEXT NOT NULL CHECK (review_trigger_type IN (
    'MANUAL_AUDITOR_FLAG',
    'PROVENANCE_GAP_DISCOVERED',
    'ACTOR_MISMATCH',
    'VALIDATION_RULE_CHANGED',
    'SOURCE_OBSERVATION_QUARANTINED',
    'CONFLICTING_ADMISSION_EVENT',
    'ROUTING_OUTPUT_ANOMALY',
    'SYSTEM_INTEGRITY_CHECK'
  )),
  requested_by_actor_type TEXT NOT NULL CHECK (requested_by_actor_type IN (
    'human_auditor', 'automated_validator', 'model_reviewer', 'cross_model_consensus', 'system'
  )),
  requested_by_actor_id TEXT NOT NULL DEFAULT '',
  review_reason TEXT NOT NULL DEFAULT '',
  validation_state TEXT NOT NULL DEFAULT 'VALID' CHECK (validation_state IN (
    'VALID', 'INVALID', 'INCOMPLETE', 'DEFERRED'
  )),
  provenance_complete INTEGER NOT NULL DEFAULT 1 CHECK (provenance_complete IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_review_request_admission ON admission_review_requests(target_admission_event_id);

CREATE TABLE IF NOT EXISTS admission_invalidation_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_admission_event_id INTEGER NOT NULL REFERENCES evidence_admission_events(id),
  review_request_id INTEGER NOT NULL REFERENCES admission_review_requests(id),
  invalidation_decision TEXT NOT NULL CHECK (invalidation_decision IN (
    'INVALIDATED', 'QUARANTINED', 'NO_ACTION', 'DEFERRED'
  )),
  invalidated_by_actor_type TEXT NOT NULL CHECK (invalidated_by_actor_type IN (
    'human_auditor', 'automated_validator', 'model_reviewer', 'cross_model_consensus', 'system'
  )),
  invalidated_by_actor_id TEXT NOT NULL DEFAULT '',
  invalidation_reason TEXT NOT NULL DEFAULT '',
  validation_state TEXT NOT NULL DEFAULT 'VALID' CHECK (validation_state IN (
    'VALID', 'INVALID', 'INCOMPLETE', 'DEFERRED'
  )),
  provenance_complete INTEGER NOT NULL DEFAULT 1 CHECK (provenance_complete IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_invalidation_admission ON admission_invalidation_events(target_admission_event_id);
CREATE INDEX IF NOT EXISTS idx_invalidation_review ON admission_invalidation_events(review_request_id);
