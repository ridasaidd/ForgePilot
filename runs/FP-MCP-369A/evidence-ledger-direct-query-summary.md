# Evidence Ledger Direct Query Summary

## Database Discovery

- Candidate database files: 1
  - data/forgepilot.db

## Opened Databases

- data/forgepilot.db: opened=True
  - evidence-like table: admission_invalidation_events count=0 cols=id, target_admission_event_id, review_request_id, invalidation_decision, invalidated_by_actor_type, invalidated_by_actor_id, invalidation_reason, validation_state, provenance_complete, created_at
  - evidence-like table: admission_review_requests count=0 cols=id, target_admission_event_id, review_trigger_type, requested_by_actor_type, requested_by_actor_id, review_reason, validation_state, provenance_complete, created_at
  - evidence-like table: clarifications count=0 cols=id, packet_id, question, answer, status, created_at, resolved_at
  - evidence-like table: evidence_admission_events count=228 cols=id, target_observation_type, target_observation_id, admission_decision, admission_actor_type, admission_actor_id, admission_trust_tier, validation_state, provenance_complete, admission_basis, created_at
  - evidence-like table: evidence_record_admission_events count=0 cols=id, evidence_record_id, admission_state, admission_actor_type, admission_actor_id, admission_reason, trust_tier_at_admission, provenance_complete, created_at
  - evidence-like table: evidence_record_validation_events count=0 cols=id, evidence_record_id, validation_state, validation_actor_type, validation_actor_id, validation_reason, validation_details, provenance_complete, created_at
  - evidence-like table: evidence_records count=228 cols=evidence_id, packet_id, run_id, model_id, model_role, branch, commit_sha, executor_result, verification_result, audit_result, comparison_result, metrics_path, artifact_paths, trust_tier, validation_state, admission_state, created_at
  - evidence-like table: executions count=0 cols=id, packet_id, executor_model, result, created_at, completed_at
  - evidence-like table: fp012_model_comparison_events count=0 cols=id, packet_id, comparison_outcome, comparison_basis, execution_a_id, execution_b_id, evidence_a_id, evidence_b_id, model_a_id, model_b_id, model_a_role, model_b_role, selected_model, selection_reason, model_a_defects, model_b_defects, model_a_verification_result, model_b_verification_result, model_a_audit_result, model_b_audit_result, model_a_admission_state, model_b_admission_state, compared_by, correction_of, correction_reason, created_at
  - evidence-like table: fp012_task_classification_events count=0 cols=id, packet_id, task_class, risk_level, blast_radius, evidence_sensitivity, audit_requirement, comparison_requirement, classification_source, actor, model_identity, rationale, correction_of, correction_reason, created_at
  - evidence-like table: packets count=196 cols=id, task_id, packet_type, status, created_at, updated_at, title, packet_path, packet_hash
  - evidence-like table: routing_decisions count=0 cols=id, packet_id, chosen_model, reason, created_at

## Range 175 To Current

- Source used: sqlite
- Start: 175
- Current max evidence id: 228
- Observed count: 54
- Continuous: True
- Missing ids: none

## Classification

DIRECT_OR_EXTRACTED_EVIDENCE_ID_SEQUENCE_CONTINUOUS_FROM_175_TO_CURRENT
