import { getDb } from "./client.js";

export interface TaskClassificationEvent {
  id: number;
  packet_id: number;
  task_class: string;
  risk_level: string;
  blast_radius: string;
  evidence_sensitivity: string;
  audit_requirement: string;
  comparison_requirement: string;
  classification_source: string;
  actor: string;
  model_identity: string;
  rationale: string;
  correction_of: number | null;
  correction_reason: string;
  created_at: string;
}

export interface RecordTaskClassificationParams {
  packet_id: number;
  task_class: string;
  risk_level: string;
  blast_radius: string;
  evidence_sensitivity: string;
  audit_requirement: string;
  comparison_requirement: string;
  classification_source: string;
  actor?: string;
  model_identity?: string;
  rationale?: string;
}

export interface RecordTaskClassificationCorrectionParams {
  previous_classification_id: number;
  packet_id: number;
  task_class?: string;
  risk_level?: string;
  blast_radius?: string;
  evidence_sensitivity?: string;
  audit_requirement?: string;
  comparison_requirement?: string;
  classification_source?: string;
  actor?: string;
  model_identity?: string;
  rationale?: string;
  correction_reason: string;
  corrected_by: string;
}

const VALID_TASK_CLASSES = [
  "DOCUMENTATION", "PERSISTENCE", "CLI", "TESTING", "REFACTOR",
  "BUGFIX", "ARCHITECTURE", "EVALUATION", "TELEMETRY", "UNKNOWN",
];

const VALID_RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const VALID_BLAST_RADIUS = [
  "LOCAL", "MODULE", "DATABASE", "WORKFLOW", "REPOSITORY", "UNKNOWN",
];

const VALID_EVIDENCE_SENSITIVITY = ["LOW", "MEDIUM", "HIGH"];

const VALID_AUDIT_REQUIREMENT = ["NONE", "STANDARD", "STRICT"];

const VALID_COMPARISON_REQUIREMENT = ["NONE", "OPTIONAL", "REQUIRED"];

const VALID_CLASSIFICATION_SOURCE = ["HUMAN", "MODEL", "SYSTEM", "DERIVED"];

function validateEnum(value: string, validValues: string[], fieldName: string): void {
  if (!validValues.includes(value)) {
    throw new Error(`Invalid ${fieldName}: '${value}'. Must be one of: ${validValues.join(", ")}`);
  }
}

export function recordTaskClassification(
  params: RecordTaskClassificationParams
): TaskClassificationEvent {
  validateEnum(params.task_class, VALID_TASK_CLASSES, "task_class");
  validateEnum(params.risk_level, VALID_RISK_LEVELS, "risk_level");
  validateEnum(params.blast_radius, VALID_BLAST_RADIUS, "blast_radius");
  validateEnum(params.evidence_sensitivity, VALID_EVIDENCE_SENSITIVITY, "evidence_sensitivity");
  validateEnum(params.audit_requirement, VALID_AUDIT_REQUIREMENT, "audit_requirement");
  validateEnum(params.comparison_requirement, VALID_COMPARISON_REQUIREMENT, "comparison_requirement");
  validateEnum(params.classification_source, VALID_CLASSIFICATION_SOURCE, "classification_source");

  const db = getDb();

  const packet = db
    .prepare("SELECT id FROM packets WHERE id = ?")
    .get(params.packet_id) as { id: number } | undefined;

  if (!packet) {
    throw new Error(`Packet ${params.packet_id} not found`);
  }

  const stmt = db.prepare(
    `INSERT INTO fp012_task_classification_events (
      packet_id, task_class, risk_level, blast_radius, evidence_sensitivity,
      audit_requirement, comparison_requirement, classification_source,
      actor, model_identity, rationale
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const result = stmt.run(
    params.packet_id,
    params.task_class,
    params.risk_level,
    params.blast_radius,
    params.evidence_sensitivity,
    params.audit_requirement,
    params.comparison_requirement,
    params.classification_source,
    params.actor ?? "",
    params.model_identity ?? "",
    params.rationale ?? ""
  );

  return db
    .prepare("SELECT * FROM fp012_task_classification_events WHERE id = ?")
    .get(result.lastInsertRowid) as TaskClassificationEvent;
}

export function recordTaskClassificationCorrection(
  params: RecordTaskClassificationCorrectionParams
): TaskClassificationEvent {
  const db = getDb();

  const prevEvent = db
    .prepare(
      "SELECT * FROM fp012_task_classification_events WHERE id = ?"
    )
    .get(params.previous_classification_id) as
      | TaskClassificationEvent
      | undefined;

  if (!prevEvent) {
    throw new Error(
      `Previous classification event ${params.previous_classification_id} not found`
    );
  }

  if (prevEvent.packet_id !== params.packet_id) {
    throw new Error(
      `Cross-packet reference rejected: previous_classification_id ${params.previous_classification_id} ` +
      `belongs to packet ${prevEvent.packet_id}, not packet ${params.packet_id}`
    );
  }

  // Carry forward original values for fields not being corrected, so CHECK constraints pass
  const taskClass = params.task_class ?? prevEvent.task_class;
  const riskLevel = params.risk_level ?? prevEvent.risk_level;
  const blastRadius = params.blast_radius ?? prevEvent.blast_radius;
  const evidenceSens = params.evidence_sensitivity ?? prevEvent.evidence_sensitivity;
  const auditReq = params.audit_requirement ?? prevEvent.audit_requirement;
  const compReq = params.comparison_requirement ?? prevEvent.comparison_requirement;
  const classSource = params.classification_source ?? prevEvent.classification_source;

  if (params.task_class) validateEnum(params.task_class, VALID_TASK_CLASSES, "task_class");
  if (params.risk_level) validateEnum(params.risk_level, VALID_RISK_LEVELS, "risk_level");
  if (params.blast_radius) validateEnum(params.blast_radius, VALID_BLAST_RADIUS, "blast_radius");
  if (params.evidence_sensitivity) validateEnum(params.evidence_sensitivity, VALID_EVIDENCE_SENSITIVITY, "evidence_sensitivity");
  if (params.audit_requirement) validateEnum(params.audit_requirement, VALID_AUDIT_REQUIREMENT, "audit_requirement");
  if (params.comparison_requirement) validateEnum(params.comparison_requirement, VALID_COMPARISON_REQUIREMENT, "comparison_requirement");
  if (params.classification_source) validateEnum(params.classification_source, VALID_CLASSIFICATION_SOURCE, "classification_source");

  const stmt = db.prepare(
    `INSERT INTO fp012_task_classification_events (
      packet_id, task_class, risk_level, blast_radius, evidence_sensitivity,
      audit_requirement, comparison_requirement, classification_source,
      actor, model_identity, rationale, correction_of, correction_reason
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const result = stmt.run(
    params.packet_id,
    taskClass,
    riskLevel,
    blastRadius,
    evidenceSens,
    auditReq,
    compReq,
    classSource,
    params.actor ?? params.corrected_by,
    params.model_identity ?? prevEvent.model_identity,
    params.rationale ?? prevEvent.rationale,
    params.previous_classification_id,
    params.correction_reason
  );

  return db
    .prepare("SELECT * FROM fp012_task_classification_events WHERE id = ?")
    .get(result.lastInsertRowid) as TaskClassificationEvent;
}

export function getTaskClassificationHistory(
  packet_id: number
): TaskClassificationEvent[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM fp012_task_classification_events WHERE packet_id = ? ORDER BY created_at ASC, id ASC"
    )
    .all(packet_id) as TaskClassificationEvent[];
}

export function getLatestTaskClassification(
  packet_id: number
): TaskClassificationEvent | undefined {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM fp012_task_classification_events WHERE packet_id = ? ORDER BY created_at DESC, id DESC LIMIT 1"
    )
    .get(packet_id) as TaskClassificationEvent | undefined;
}

export function getTaskClassificationEvent(
  id: number
): TaskClassificationEvent | undefined {
  const db = getDb();
  return db
    .prepare("SELECT * FROM fp012_task_classification_events WHERE id = ?")
    .get(id) as TaskClassificationEvent | undefined;
}
