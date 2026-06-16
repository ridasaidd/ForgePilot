-- FP-008: Classification and Outcome Persistence Implementation
-- Adds append-only tables for packet classification observations, classification corrections,
-- model outcome observations, and model outcome corrections.

CREATE TABLE IF NOT EXISTS packet_classification_observations (
  classification_id INTEGER PRIMARY KEY AUTOINCREMENT,
  packet_id INTEGER NOT NULL REFERENCES packets(id),
  task_class TEXT NOT NULL CHECK (task_class IN (
    'STANDARDS', 'DOCUMENTATION', 'PERSISTENCE', 'SCHEMA', 'VALIDATION',
    'TELEMETRY', 'CLI', 'TESTING', 'REFACTOR', 'BUG_FIX', 'AUDIT',
    'ROUTING', 'RESEARCH', 'WORKFLOW', 'UNKNOWN'
  )),
  secondary_task_classes TEXT NOT NULL DEFAULT '[]',
  risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  constraint_strictness TEXT NOT NULL CHECK (constraint_strictness IN ('LOOSE', 'NORMAL', 'STRICT', 'FROZEN')),
  evidence_sensitivity TEXT NOT NULL CHECK (evidence_sensitivity IN ('NONE', 'LOW', 'MEDIUM', 'HIGH')),
  expected_blast_radius TEXT NOT NULL CHECK (expected_blast_radius IN (
    'SINGLE_FILE', 'MULTI_FILE_LOCAL', 'CROSS_MODULE', 'DATABASE', 'WORKFLOW', 'SYSTEMIC'
  )),
  primary_skill_required TEXT NOT NULL CHECK (primary_skill_required IN (
    'SPECIFICATION_WRITING', 'DATABASE_DESIGN', 'MIGRATION_DESIGN', 'TELEMETRY_PARSING',
    'VALIDATION_LOGIC', 'CLI_IMPLEMENTATION', 'TEST_DESIGN', 'AUDIT_REASONING',
    'REFACTORING', 'DOCUMENTATION_STRUCTURE', 'ROUTING_POLICY', 'UNKNOWN'
  )),
  audit_requirement TEXT NOT NULL CHECK (audit_requirement IN ('NONE', 'LIGHT', 'STANDARD', 'STRICT', 'ADVERSARIAL')),
  challenger_requirement TEXT NOT NULL CHECK (challenger_requirement IN ('NOT_REQUIRED', 'OPTIONAL', 'REQUIRED', 'REQUIRED_DIVERSE')),
  routing_eligibility TEXT NOT NULL CHECK (routing_eligibility IN (
    'NOT_ELIGIBLE', 'ELIGIBLE_WITH_HUMAN_REVIEW', 'ELIGIBLE_FOR_RECOMMENDATION', 'ELIGIBLE_FOR_AUTOMATED_SELECTION'
  )),
  classified_by TEXT NOT NULL DEFAULT '',
  classification_source TEXT NOT NULL CHECK (classification_source IN ('HUMAN', 'MODEL_ASSISTED', 'AUTOMATED')),
  rationale TEXT NOT NULL DEFAULT '',
  trust_tier TEXT NOT NULL DEFAULT 'TIER_0_UNTRUSTED' CHECK (trust_tier IN (
    'TIER_0_UNTRUSTED', 'TIER_1_SELF_REPORTED', 'TIER_2_VERIFIED_ARTIFACT', 'TIER_3_REPRODUCIBLE'
  )),
  validation_state TEXT NOT NULL DEFAULT 'VALID' CHECK (validation_state IN ('VALID', 'INVALID', 'INCOMPLETE', 'DEFERRED')),
  admission_state TEXT NOT NULL DEFAULT 'PENDING' CHECK (admission_state IN (
    'NOT_EVALUATED', 'REJECTED', 'PENDING', 'ADMITTED', 'QUARANTINED'
  )),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_classification_obs_packet_id ON packet_classification_observations(packet_id);
CREATE INDEX IF NOT EXISTS idx_classification_obs_task_class ON packet_classification_observations(task_class);
CREATE INDEX IF NOT EXISTS idx_classification_obs_admission ON packet_classification_observations(admission_state);

CREATE TABLE IF NOT EXISTS packet_classification_corrections (
  correction_id INTEGER PRIMARY KEY AUTOINCREMENT,
  previous_classification_id INTEGER NOT NULL REFERENCES packet_classification_observations(classification_id),
  packet_id INTEGER NOT NULL REFERENCES packets(id),
  corrected_fields TEXT NOT NULL DEFAULT '[]',
  new_values TEXT NOT NULL DEFAULT '{}',
  reason TEXT NOT NULL DEFAULT '',
  actor TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_classification_corr_prev ON packet_classification_corrections(previous_classification_id);
CREATE INDEX IF NOT EXISTS idx_classification_corr_packet ON packet_classification_corrections(packet_id);

CREATE TABLE IF NOT EXISTS model_outcome_observations (
  outcome_id INTEGER PRIMARY KEY AUTOINCREMENT,
  packet_id INTEGER NOT NULL REFERENCES packets(id),
  packet_classification_id INTEGER REFERENCES packet_classification_observations(classification_id),
  execution_id INTEGER REFERENCES packet_executions(execution_id),
  executor_model TEXT NOT NULL DEFAULT '',
  executor_provider TEXT NOT NULL DEFAULT '',
  execution_result TEXT NOT NULL DEFAULT 'NOT_STARTED' CHECK (execution_result IN (
    'NOT_STARTED', 'RUNNING', 'COMPLETED', 'FAILED', 'ABORTED'
  )),
  verification_result TEXT NOT NULL DEFAULT 'NOT_RUN' CHECK (verification_result IN (
    'NOT_RUN', 'PASSED', 'FAILED', 'PARTIAL', 'BLOCKED'
  )),
  audit_result TEXT NOT NULL DEFAULT 'NOT_AUDITED' CHECK (audit_result IN (
    'NOT_AUDITED', 'ACCEPTED', 'REJECTED', 'ACCEPTED_WITH_NOTES', 'BLOCKED'
  )),
  first_pass_success TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK (first_pass_success IN (
    'TRUE', 'FALSE', 'UNKNOWN', 'NOT_APPLICABLE'
  )),
  correction_count INTEGER NOT NULL DEFAULT 0,
  correction_types TEXT NOT NULL DEFAULT '[]',
  scope_discipline TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK (scope_discipline IN (
    'WITHIN_SCOPE', 'MINOR_SCOPE_DRIFT', 'MAJOR_SCOPE_DRIFT', 'SCOPE_VIOLATION', 'UNKNOWN'
  )),
  semantic_correctness TEXT NOT NULL DEFAULT 'NOT_EVALUATED' CHECK (semantic_correctness IN (
    'CORRECT', 'PARTIALLY_CORRECT', 'INCORRECT', 'NOT_EVALUATED', 'UNKNOWN'
  )),
  invariant_compliance TEXT NOT NULL DEFAULT 'NOT_CHECKED' CHECK (invariant_compliance IN (
    'COMPLIANT', 'VIOLATED', 'NOT_CHECKED', 'NOT_APPLICABLE', 'UNKNOWN'
  )),
  human_intervention TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK (human_intervention IN (
    'NONE', 'REVIEW_ONLY', 'CLARIFICATION', 'CORRECTION_REQUEST', 'MANUAL_FIX', 'OVERRIDE', 'UNKNOWN'
  )),
  comparison_outcome TEXT NOT NULL DEFAULT 'NOT_COMPARED' CHECK (comparison_outcome IN (
    'NOT_COMPARED', 'WIN', 'LOSS', 'TIE', 'ACCEPTED_NOT_SELECTED', 'REJECTED', 'INCONCLUSIVE'
  )),
  compared_execution_references TEXT NOT NULL DEFAULT '[]',
  non_blocking_ambiguity TEXT NOT NULL DEFAULT 'NONE' CHECK (non_blocking_ambiguity IN ('NONE', 'PRESENT', 'UNKNOWN')),
  root_cause_level TEXT NOT NULL DEFAULT '["NONE"]',
  routing_signal_eligibility TEXT NOT NULL DEFAULT 'NOT_ELIGIBLE' CHECK (routing_signal_eligibility IN (
    'NOT_ELIGIBLE', 'ELIGIBLE_AS_SIGNAL', 'ELIGIBLE_AS_EVIDENCE', 'QUARANTINED'
  )),
  telemetry_id INTEGER REFERENCES packet_execution_telemetry(telemetry_id),
  audit_reference TEXT NOT NULL DEFAULT '',
  trust_tier TEXT NOT NULL DEFAULT 'TIER_0_UNTRUSTED' CHECK (trust_tier IN (
    'TIER_0_UNTRUSTED', 'TIER_1_SELF_REPORTED', 'TIER_2_VERIFIED_ARTIFACT', 'TIER_3_REPRODUCIBLE'
  )),
  validation_state TEXT NOT NULL DEFAULT 'VALID' CHECK (validation_state IN ('VALID', 'INVALID', 'INCOMPLETE', 'DEFERRED')),
  admission_state TEXT NOT NULL DEFAULT 'PENDING' CHECK (admission_state IN (
    'NOT_EVALUATED', 'REJECTED', 'PENDING', 'ADMITTED', 'QUARANTINED'
  )),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_outcome_obs_packet_id ON model_outcome_observations(packet_id);
CREATE INDEX IF NOT EXISTS idx_outcome_obs_classification ON model_outcome_observations(packet_classification_id);
CREATE INDEX IF NOT EXISTS idx_outcome_obs_execution ON model_outcome_observations(execution_id);
CREATE INDEX IF NOT EXISTS idx_outcome_obs_admission ON model_outcome_observations(admission_state);

CREATE TABLE IF NOT EXISTS model_outcome_corrections (
  correction_id INTEGER PRIMARY KEY AUTOINCREMENT,
  previous_outcome_id INTEGER NOT NULL REFERENCES model_outcome_observations(outcome_id),
  packet_id INTEGER NOT NULL REFERENCES packets(id),
  execution_id INTEGER REFERENCES packet_executions(execution_id),
  corrected_fields TEXT NOT NULL DEFAULT '[]',
  new_values TEXT NOT NULL DEFAULT '{}',
  reason TEXT NOT NULL DEFAULT '',
  actor TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_outcome_corr_prev ON model_outcome_corrections(previous_outcome_id);
CREATE INDEX IF NOT EXISTS idx_outcome_corr_packet ON model_outcome_corrections(packet_id);
