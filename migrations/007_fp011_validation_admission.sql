-- FP-011: Append-only validation and admission evaluation events for evidence records
-- These tables record evaluation events against evidence_records (FP-010) without
-- mutating the original record. Current state is derived from event history.

-- Validation evaluation events: records each validation evaluation against an evidence record.
-- NOT_EVALUATED is NOT a valid validation_state (validation must produce a concrete result).
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

CREATE INDEX IF NOT EXISTS idx_val_events_evidence_record
  ON evidence_record_validation_events(evidence_record_id);

CREATE INDEX IF NOT EXISTS idx_val_events_created
  ON evidence_record_validation_events(evidence_record_id, created_at);

-- Admission evaluation events: records each admission evaluation against an evidence record.
-- NOT_EVALUATED IS a valid admission_state (record may not yet have been evaluated for admission).
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

CREATE INDEX IF NOT EXISTS idx_adm_events_evidence_record
  ON evidence_record_admission_events(evidence_record_id);

CREATE INDEX IF NOT EXISTS idx_adm_events_created
  ON evidence_record_admission_events(evidence_record_id, created_at);
