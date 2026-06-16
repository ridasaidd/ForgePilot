import { getDb } from "./client.js";

export interface ModelOutcomeObservation {
  outcome_id: number;
  packet_id: number;
  packet_classification_id: number | null;
  execution_id: number | null;
  executor_model: string;
  executor_provider: string;
  execution_result: string;
  verification_result: string;
  audit_result: string;
  first_pass_success: string;
  correction_count: number;
  correction_types: string;
  scope_discipline: string;
  semantic_correctness: string;
  invariant_compliance: string;
  human_intervention: string;
  comparison_outcome: string;
  compared_execution_references: string;
  non_blocking_ambiguity: string;
  root_cause_level: string;
  routing_signal_eligibility: string;
  telemetry_id: number | null;
  audit_reference: string;
  trust_tier: string;
  validation_state: string;
  admission_state: string;
  created_at: string;
}

export interface ModelOutcomeCorrection {
  correction_id: number;
  previous_outcome_id: number;
  packet_id: number;
  execution_id: number | null;
  corrected_fields: string;
  new_values: string;
  reason: string;
  actor: string;
  created_at: string;
}

export interface RecordOutcomeParams {
  packet_id: number;
  packet_classification_id?: number | null;
  execution_id?: number | null;
  executor_model?: string;
  executor_provider?: string;
  execution_result?: string;
  verification_result?: string;
  audit_result?: string;
  first_pass_success?: string;
  correction_count?: number;
  correction_types?: string[];
  scope_discipline?: string;
  semantic_correctness?: string;
  invariant_compliance?: string;
  human_intervention?: string;
  comparison_outcome?: string;
  compared_execution_references?: number[];
  non_blocking_ambiguity?: string;
  root_cause_level?: string[];
  routing_signal_eligibility?: string;
  telemetry_id?: number | null;
  audit_reference?: string;
  trust_tier?: string;
  validation_state?: string;
  admission_state?: string;
}

export interface RecordOutcomeCorrectionParams {
  previous_outcome_id: number;
  packet_id: number;
  execution_id?: number | null;
  corrected_fields: string[];
  new_values: Record<string, string>;
  reason: string;
  actor: string;
}

const VALID_EXECUTION_RESULT = ["NOT_STARTED", "RUNNING", "COMPLETED", "FAILED", "ABORTED"];
const VALID_VERIFICATION_RESULT = ["NOT_RUN", "PASSED", "FAILED", "PARTIAL", "BLOCKED"];
const VALID_AUDIT_RESULT = ["NOT_AUDITED", "ACCEPTED", "REJECTED", "ACCEPTED_WITH_NOTES", "BLOCKED"];
const VALID_FIRST_PASS_SUCCESS = ["TRUE", "FALSE", "UNKNOWN", "NOT_APPLICABLE"];
const VALID_CORRECTION_TYPE = [
  "NONE", "SCOPE_CORRECTION", "SEMANTIC_CORRECTION", "MECHANICAL_CORRECTION",
  "TEST_CORRECTION", "ARTIFACT_CORRECTION", "PACKET_CORRECTION", "PROCESS_CORRECTION",
  "HUMAN_OVERRIDE", "UNKNOWN",
];
const VALID_SCOPE_DISCIPLINE = ["WITHIN_SCOPE", "MINOR_SCOPE_DRIFT", "MAJOR_SCOPE_DRIFT", "SCOPE_VIOLATION", "UNKNOWN"];
const VALID_SEMANTIC_CORRECTNESS = ["CORRECT", "PARTIALLY_CORRECT", "INCORRECT", "NOT_EVALUATED", "UNKNOWN"];
const VALID_INVARIANT_COMPLIANCE = ["COMPLIANT", "VIOLATED", "NOT_CHECKED", "NOT_APPLICABLE", "UNKNOWN"];
const VALID_HUMAN_INTERVENTION = ["NONE", "REVIEW_ONLY", "CLARIFICATION", "CORRECTION_REQUEST", "MANUAL_FIX", "OVERRIDE", "UNKNOWN"];
const VALID_COMPARISON_OUTCOME = ["NOT_COMPARED", "WIN", "LOSS", "TIE", "ACCEPTED_NOT_SELECTED", "REJECTED", "INCONCLUSIVE"];
const VALID_NON_BLOCKING_AMBIGUITY = ["NONE", "PRESENT", "UNKNOWN"];
const VALID_ROOT_CAUSE_LEVEL = ["NONE", "PACKET", "EXECUTOR", "AUDITOR", "PROCESS", "ENVIRONMENT", "TOOLING", "UNKNOWN"];
const VALID_ROUTING_SIGNAL_ELIGIBILITY = ["NOT_ELIGIBLE", "ELIGIBLE_AS_SIGNAL", "ELIGIBLE_AS_EVIDENCE", "QUARANTINED"];
const VALID_TRUST_TIERS = ["TIER_0_UNTRUSTED", "TIER_1_SELF_REPORTED", "TIER_2_VERIFIED_ARTIFACT", "TIER_3_REPRODUCIBLE"];
const VALID_VALIDATION_STATES = ["VALID", "INVALID", "INCOMPLETE", "DEFERRED"];

function validateEnum(value: string, validValues: string[], fieldName: string): void {
  if (!validValues.includes(value)) {
    throw new Error(`Invalid ${fieldName}: '${value}'. Must be one of: ${validValues.join(", ")}`);
  }
}

export function recordOutcomeObservation(
  params: RecordOutcomeParams
): ModelOutcomeObservation {
  if (params.execution_result) {
    validateEnum(params.execution_result, VALID_EXECUTION_RESULT, "execution_result");
  }
  if (params.verification_result) {
    validateEnum(params.verification_result, VALID_VERIFICATION_RESULT, "verification_result");
  }
  if (params.audit_result) {
    validateEnum(params.audit_result, VALID_AUDIT_RESULT, "audit_result");
  }
  if (params.first_pass_success) {
    validateEnum(params.first_pass_success, VALID_FIRST_PASS_SUCCESS, "first_pass_success");
  }
  if (params.scope_discipline) {
    validateEnum(params.scope_discipline, VALID_SCOPE_DISCIPLINE, "scope_discipline");
  }
  if (params.semantic_correctness) {
    validateEnum(params.semantic_correctness, VALID_SEMANTIC_CORRECTNESS, "semantic_correctness");
  }
  if (params.invariant_compliance) {
    validateEnum(params.invariant_compliance, VALID_INVARIANT_COMPLIANCE, "invariant_compliance");
  }
  if (params.human_intervention) {
    validateEnum(params.human_intervention, VALID_HUMAN_INTERVENTION, "human_intervention");
  }
  if (params.comparison_outcome) {
    validateEnum(params.comparison_outcome, VALID_COMPARISON_OUTCOME, "comparison_outcome");
  }
  if (params.non_blocking_ambiguity) {
    validateEnum(params.non_blocking_ambiguity, VALID_NON_BLOCKING_AMBIGUITY, "non_blocking_ambiguity");
  }
  if (params.routing_signal_eligibility) {
    validateEnum(params.routing_signal_eligibility, VALID_ROUTING_SIGNAL_ELIGIBILITY, "routing_signal_eligibility");
  }
  if (params.trust_tier) {
    validateEnum(params.trust_tier, VALID_TRUST_TIERS, "trust_tier");
  }
  if (params.validation_state) {
    validateEnum(params.validation_state, VALID_VALIDATION_STATES, "validation_state");
  }
  if (params.correction_types) {
    for (const ct of params.correction_types) {
      validateEnum(ct, VALID_CORRECTION_TYPE, "correction_type");
    }
  }
  if (params.root_cause_level) {
    for (const rcl of params.root_cause_level) {
      validateEnum(rcl, VALID_ROOT_CAUSE_LEVEL, "root_cause_level");
    }
  }

  if (params.admission_state === "ADMITTED") {
    throw new Error("FP-008 does not implement an authorized admission process. ADMITTED is not allowed for outcome observations.");
  }

  const db = getDb();

  if (params.packet_classification_id !== undefined && params.packet_classification_id !== null) {
    const classification = db
      .prepare(
        "SELECT classification_id, packet_id FROM packet_classification_observations WHERE classification_id = ?"
      )
      .get(params.packet_classification_id) as
        | { classification_id: number; packet_id: number }
        | undefined;

    if (!classification) {
      throw new Error(
        `Referenced packet_classification_id ${params.packet_classification_id} not found`
      );
    }

    if (classification.packet_id !== params.packet_id) {
      throw new Error(
        `Cross-packet reference rejected: packet_classification_id ${params.packet_classification_id} ` +
        `belongs to packet ${classification.packet_id}, not packet ${params.packet_id}`
      );
    }
  }

  if (params.execution_id !== undefined && params.execution_id !== null) {
    const execution = db
      .prepare(
        "SELECT execution_id, packet_id FROM packet_executions WHERE execution_id = ?"
      )
      .get(params.execution_id) as
        | { execution_id: number; packet_id: number }
        | undefined;

    if (!execution) {
      throw new Error(
        `Referenced execution_id ${params.execution_id} not found`
      );
    }

    if (execution.packet_id !== params.packet_id) {
      throw new Error(
        `Cross-packet reference rejected: execution_id ${params.execution_id} ` +
        `belongs to packet ${execution.packet_id}, not packet ${params.packet_id}`
      );
    }
  }

  if (params.telemetry_id !== undefined && params.telemetry_id !== null) {
    const telemetry = db
      .prepare(
        "SELECT telemetry_id, packet_id FROM packet_execution_telemetry WHERE telemetry_id = ?"
      )
      .get(params.telemetry_id) as
        | { telemetry_id: number; packet_id: number }
        | undefined;

    if (!telemetry) {
      throw new Error(
        `Referenced telemetry_id ${params.telemetry_id} not found`
      );
    }

    if (telemetry.packet_id !== params.packet_id) {
      throw new Error(
        `Cross-packet reference rejected: telemetry_id ${params.telemetry_id} ` +
        `belongs to packet ${telemetry.packet_id}, not packet ${params.packet_id}`
      );
    }
  }

  const stmt = db.prepare(
    `INSERT INTO model_outcome_observations (
      packet_id, packet_classification_id, execution_id,
      executor_model, executor_provider,
      execution_result, verification_result, audit_result,
      first_pass_success, correction_count, correction_types,
      scope_discipline, semantic_correctness, invariant_compliance,
      human_intervention, comparison_outcome, compared_execution_references,
      non_blocking_ambiguity, root_cause_level, routing_signal_eligibility,
      telemetry_id, audit_reference,
      trust_tier, validation_state, admission_state
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`
  );

  const result = stmt.run(
    params.packet_id,
    params.packet_classification_id ?? null,
    params.execution_id ?? null,
    params.executor_model ?? "",
    params.executor_provider ?? "",
    params.execution_result ?? "NOT_STARTED",
    params.verification_result ?? "NOT_RUN",
    params.audit_result ?? "NOT_AUDITED",
    params.first_pass_success ?? "UNKNOWN",
    params.correction_count ?? 0,
    JSON.stringify(params.correction_types ?? []),
    params.scope_discipline ?? "UNKNOWN",
    params.semantic_correctness ?? "NOT_EVALUATED",
    params.invariant_compliance ?? "NOT_CHECKED",
    params.human_intervention ?? "UNKNOWN",
    params.comparison_outcome ?? "NOT_COMPARED",
    JSON.stringify(params.compared_execution_references ?? []),
    params.non_blocking_ambiguity ?? "NONE",
    JSON.stringify(params.root_cause_level ?? ["NONE"]),
    params.routing_signal_eligibility ?? "NOT_ELIGIBLE",
    params.telemetry_id ?? null,
    params.audit_reference ?? "",
    params.trust_tier ?? "TIER_0_UNTRUSTED",
    params.validation_state ?? "VALID"
  );

  return db
    .prepare("SELECT * FROM model_outcome_observations WHERE outcome_id = ?")
    .get(result.lastInsertRowid) as ModelOutcomeObservation;
}

export function recordOutcomeCorrection(
  params: RecordOutcomeCorrectionParams
): ModelOutcomeCorrection {
  const db = getDb();

  const prevOutcome = db
    .prepare(
      "SELECT outcome_id, packet_id FROM model_outcome_observations WHERE outcome_id = ?"
    )
    .get(params.previous_outcome_id) as
      | { outcome_id: number; packet_id: number }
      | undefined;

  if (!prevOutcome) {
    throw new Error(
      `Previous outcome ${params.previous_outcome_id} not found`
    );
  }

  if (prevOutcome.packet_id !== params.packet_id) {
    throw new Error(
      `Cross-packet reference rejected: previous_outcome_id ${params.previous_outcome_id} ` +
      `belongs to packet ${prevOutcome.packet_id}, not packet ${params.packet_id}`
    );
  }

  if (params.execution_id !== undefined && params.execution_id !== null) {
    const execution = db
      .prepare(
        "SELECT execution_id, packet_id FROM packet_executions WHERE execution_id = ?"
      )
      .get(params.execution_id) as
        | { execution_id: number; packet_id: number }
        | undefined;

    if (execution && execution.packet_id !== params.packet_id) {
      throw new Error(
        `Cross-packet reference rejected: execution_id ${params.execution_id} ` +
        `belongs to packet ${execution.packet_id}, not packet ${params.packet_id}`
      );
    }
  }

  const stmt = db.prepare(
    `INSERT INTO model_outcome_corrections (
      previous_outcome_id, packet_id, execution_id,
      corrected_fields, new_values, reason, actor
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  const result = stmt.run(
    params.previous_outcome_id,
    params.packet_id,
    params.execution_id ?? null,
    JSON.stringify(params.corrected_fields),
    JSON.stringify(params.new_values),
    params.reason,
    params.actor
  );

  return db
    .prepare("SELECT * FROM model_outcome_corrections WHERE correction_id = ?")
    .get(result.lastInsertRowid) as ModelOutcomeCorrection;
}

export function getOutcomeObservations(
  packet_id: number
): ModelOutcomeObservation[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM model_outcome_observations WHERE packet_id = ? ORDER BY created_at ASC, outcome_id ASC"
    )
    .all(packet_id) as ModelOutcomeObservation[];
}

export function getOutcomeObservation(
  outcome_id: number
): ModelOutcomeObservation | undefined {
  const db = getDb();
  return db
    .prepare("SELECT * FROM model_outcome_observations WHERE outcome_id = ?")
    .get(outcome_id) as ModelOutcomeObservation | undefined;
}

export function getOutcomeCorrections(
  previous_outcome_id: number
): ModelOutcomeCorrection[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM model_outcome_corrections WHERE previous_outcome_id = ? ORDER BY created_at ASC, correction_id ASC"
    )
    .all(previous_outcome_id) as ModelOutcomeCorrection[];
}
