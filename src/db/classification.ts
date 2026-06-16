import { getDb } from "./client.js";

export interface ClassificationObservation {
  classification_id: number;
  packet_id: number;
  task_class: string;
  secondary_task_classes: string;
  risk_level: string;
  constraint_strictness: string;
  evidence_sensitivity: string;
  expected_blast_radius: string;
  primary_skill_required: string;
  audit_requirement: string;
  challenger_requirement: string;
  routing_eligibility: string;
  classified_by: string;
  classification_source: string;
  rationale: string;
  trust_tier: string;
  validation_state: string;
  admission_state: string;
  created_at: string;
}

export interface ClassificationCorrection {
  correction_id: number;
  previous_classification_id: number;
  packet_id: number;
  corrected_fields: string;
  new_values: string;
  reason: string;
  actor: string;
  created_at: string;
}

export interface RecordClassificationParams {
  packet_id: number;
  task_class: string;
  secondary_task_classes?: string[];
  risk_level: string;
  constraint_strictness: string;
  evidence_sensitivity: string;
  expected_blast_radius: string;
  primary_skill_required: string;
  audit_requirement: string;
  challenger_requirement: string;
  routing_eligibility: string;
  classified_by?: string;
  classification_source: string;
  rationale?: string;
  trust_tier?: string;
  validation_state?: string;
  admission_state?: string;
}

export interface RecordClassificationCorrectionParams {
  previous_classification_id: number;
  packet_id: number;
  corrected_fields: string[];
  new_values: Record<string, string>;
  reason: string;
  actor: string;
}

const VALID_TASK_CLASSES = [
  "STANDARDS", "DOCUMENTATION", "PERSISTENCE", "SCHEMA", "VALIDATION",
  "TELEMETRY", "CLI", "TESTING", "REFACTOR", "BUG_FIX", "AUDIT",
  "ROUTING", "RESEARCH", "WORKFLOW", "UNKNOWN",
];

const VALID_RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const VALID_CONSTRAINT_STRICTNESS = ["LOOSE", "NORMAL", "STRICT", "FROZEN"];
const VALID_EVIDENCE_SENSITIVITY = ["NONE", "LOW", "MEDIUM", "HIGH"];
const VALID_EXPECTED_BLAST_RADIUS = [
  "SINGLE_FILE", "MULTI_FILE_LOCAL", "CROSS_MODULE", "DATABASE", "WORKFLOW", "SYSTEMIC",
];
const VALID_PRIMARY_SKILL_REQUIRED = [
  "SPECIFICATION_WRITING", "DATABASE_DESIGN", "MIGRATION_DESIGN", "TELEMETRY_PARSING",
  "VALIDATION_LOGIC", "CLI_IMPLEMENTATION", "TEST_DESIGN", "AUDIT_REASONING",
  "REFACTORING", "DOCUMENTATION_STRUCTURE", "ROUTING_POLICY", "UNKNOWN",
];
const VALID_AUDIT_REQUIREMENT = ["NONE", "LIGHT", "STANDARD", "STRICT", "ADVERSARIAL"];
const VALID_CHALLENGER_REQUIREMENT = ["NOT_REQUIRED", "OPTIONAL", "REQUIRED", "REQUIRED_DIVERSE"];
const VALID_ROUTING_ELIGIBILITY = [
  "NOT_ELIGIBLE", "ELIGIBLE_WITH_HUMAN_REVIEW", "ELIGIBLE_FOR_RECOMMENDATION",
  "ELIGIBLE_FOR_AUTOMATED_SELECTION",
];
const VALID_CLASSIFICATION_SOURCE = ["HUMAN", "MODEL_ASSISTED", "AUTOMATED"];
const VALID_TRUST_TIERS = [
  "TIER_0_UNTRUSTED", "TIER_1_SELF_REPORTED", "TIER_2_VERIFIED_ARTIFACT", "TIER_3_REPRODUCIBLE",
];
const VALID_VALIDATION_STATES = ["VALID", "INVALID", "INCOMPLETE", "DEFERRED"];

function validateEnum(value: string, validValues: string[], fieldName: string): void {
  if (!validValues.includes(value)) {
    throw new Error(`Invalid ${fieldName}: '${value}'. Must be one of: ${validValues.join(", ")}`);
  }
}

export function recordClassificationObservation(
  params: RecordClassificationParams
): ClassificationObservation {
  validateEnum(params.task_class, VALID_TASK_CLASSES, "task_class");
  validateEnum(params.risk_level, VALID_RISK_LEVELS, "risk_level");
  validateEnum(params.constraint_strictness, VALID_CONSTRAINT_STRICTNESS, "constraint_strictness");
  validateEnum(params.evidence_sensitivity, VALID_EVIDENCE_SENSITIVITY, "evidence_sensitivity");
  validateEnum(params.expected_blast_radius, VALID_EXPECTED_BLAST_RADIUS, "expected_blast_radius");
  validateEnum(params.primary_skill_required, VALID_PRIMARY_SKILL_REQUIRED, "primary_skill_required");
  validateEnum(params.audit_requirement, VALID_AUDIT_REQUIREMENT, "audit_requirement");
  validateEnum(params.challenger_requirement, VALID_CHALLENGER_REQUIREMENT, "challenger_requirement");
  validateEnum(params.routing_eligibility, VALID_ROUTING_ELIGIBILITY, "routing_eligibility");
  validateEnum(params.classification_source, VALID_CLASSIFICATION_SOURCE, "classification_source");

  if (params.trust_tier) {
    validateEnum(params.trust_tier, VALID_TRUST_TIERS, "trust_tier");
  }
  if (params.validation_state) {
    validateEnum(params.validation_state, VALID_VALIDATION_STATES, "validation_state");
  }

  if (params.secondary_task_classes) {
    for (const tc of params.secondary_task_classes) {
      validateEnum(tc, VALID_TASK_CLASSES, "secondary_task_class");
    }
  }

  if (params.admission_state === "ADMITTED") {
    throw new Error("FP-008 does not implement an authorized admission process. ADMITTED is not allowed for classification observations.");
  }

  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO packet_classification_observations (
      packet_id, task_class, secondary_task_classes, risk_level, constraint_strictness,
      evidence_sensitivity, expected_blast_radius, primary_skill_required,
      audit_requirement, challenger_requirement, routing_eligibility,
      classified_by, classification_source, rationale,
      trust_tier, validation_state, admission_state
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`
  );

  const result = stmt.run(
    params.packet_id,
    params.task_class,
    JSON.stringify(params.secondary_task_classes ?? []),
    params.risk_level,
    params.constraint_strictness,
    params.evidence_sensitivity,
    params.expected_blast_radius,
    params.primary_skill_required,
    params.audit_requirement,
    params.challenger_requirement,
    params.routing_eligibility,
    params.classified_by ?? "",
    params.classification_source,
    params.rationale ?? "",
    params.trust_tier ?? "TIER_0_UNTRUSTED",
    params.validation_state ?? "VALID"
  );

  return db
    .prepare("SELECT * FROM packet_classification_observations WHERE classification_id = ?")
    .get(result.lastInsertRowid) as ClassificationObservation;
}

export function recordClassificationCorrection(
  params: RecordClassificationCorrectionParams
): ClassificationCorrection {
  const db = getDb();

  const prevClassification = db
    .prepare(
      "SELECT classification_id, packet_id FROM packet_classification_observations WHERE classification_id = ?"
    )
    .get(params.previous_classification_id) as
      | { classification_id: number; packet_id: number }
      | undefined;

  if (!prevClassification) {
    throw new Error(
      `Previous classification ${params.previous_classification_id} not found`
    );
  }

  if (prevClassification.packet_id !== params.packet_id) {
    throw new Error(
      `Cross-packet reference rejected: previous_classification_id ${params.previous_classification_id} ` +
      `belongs to packet ${prevClassification.packet_id}, not packet ${params.packet_id}`
    );
  }

  const stmt = db.prepare(
    `INSERT INTO packet_classification_corrections (
      previous_classification_id, packet_id, corrected_fields, new_values, reason, actor
    ) VALUES (?, ?, ?, ?, ?, ?)`
  );

  const result = stmt.run(
    params.previous_classification_id,
    params.packet_id,
    JSON.stringify(params.corrected_fields),
    JSON.stringify(params.new_values),
    params.reason,
    params.actor
  );

  return db
    .prepare("SELECT * FROM packet_classification_corrections WHERE correction_id = ?")
    .get(result.lastInsertRowid) as ClassificationCorrection;
}

export function getClassificationObservations(
  packet_id: number
): ClassificationObservation[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM packet_classification_observations WHERE packet_id = ? ORDER BY created_at ASC, classification_id ASC"
    )
    .all(packet_id) as ClassificationObservation[];
}

export function getClassificationObservation(
  classification_id: number
): ClassificationObservation | undefined {
  const db = getDb();
  return db
    .prepare("SELECT * FROM packet_classification_observations WHERE classification_id = ?")
    .get(classification_id) as ClassificationObservation | undefined;
}

export function getClassificationCorrections(
  previous_classification_id: number
): ClassificationCorrection[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM packet_classification_corrections WHERE previous_classification_id = ? ORDER BY created_at ASC, correction_id ASC"
    )
    .all(previous_classification_id) as ClassificationCorrection[];
}
