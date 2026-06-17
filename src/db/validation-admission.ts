import { getDb } from "./client.js";
import { getEvidenceRecord, parseArtifactPaths, type EvidenceRecord } from "./evidence-records.js";

// --- Types ---

export interface ValidationEvent {
  id: number;
  evidence_record_id: number;
  validation_state: string;
  validation_actor_type: string;
  validation_actor_id: string;
  validation_reason: string;
  validation_details: string;
  provenance_complete: number;
  created_at: string;
}

export interface AdmissionEvent {
  id: number;
  evidence_record_id: number;
  admission_state: string;
  admission_actor_type: string;
  admission_actor_id: string;
  admission_reason: string;
  trust_tier_at_admission: string;
  provenance_complete: number;
  created_at: string;
}

export interface RecordValidationParams {
  evidence_record_id: number;
  validation_state: string;
  validation_actor_type?: string;
  validation_actor_id?: string;
  validation_reason?: string;
  validation_details?: Record<string, unknown>;
  provenance_complete?: boolean;
}

export interface RecordAdmissionParams {
  evidence_record_id: number;
  admission_state: string;
  admission_actor_type?: string;
  admission_actor_id?: string;
  admission_reason?: string;
  trust_tier_at_admission?: string;
  provenance_complete?: boolean;
}

export interface ValidationResult {
  validation_state: string;
  validation_reason: string;
  validation_details: Record<string, unknown>;
}

export interface AdmissionEvaluationResult {
  admission_state: string;
  admission_reason: string;
  admission_details: Record<string, unknown>;
}

// --- Constants ---

const VALID_VALIDATION_STATES = ["VALID", "INVALID", "INCOMPLETE", "DEFERRED"];

const VALID_ADMISSION_STATES = [
  "NOT_EVALUATED",
  "REJECTED",
  "PENDING",
  "ADMITTED",
  "QUARANTINED",
];

const VALID_ACTOR_TYPES = [
  "automated_validator",
  "human_auditor",
  "model_reviewer",
  "system",
];

const VALID_TRUST_TIERS = [
  "TIER_0_UNTRUSTED",
  "TIER_1_SELF_REPORTED",
  "TIER_2_VERIFIED_ARTIFACT",
  "TIER_3_REPRODUCIBLE",
];

function validateEnum(value: string, validValues: string[], fieldName: string): void {
  if (!validValues.includes(value)) {
    throw new Error(
      `Invalid ${fieldName}: '${value}'. Must be one of: ${validValues.join(", ")}`
    );
  }
}

// --- Validation Logic ---

export function validateEvidenceRecord(evidenceId: number): ValidationResult {
  const record = getEvidenceRecord(evidenceId);
  if (!record) {
    throw new Error(`Evidence record ${evidenceId} not found`);
  }

  const details: Record<string, unknown> = { checks: [] as string[] };
  const missing: string[] = [];
  const issues: string[] = [];

  // Parse artifact paths
  let parsedArtifacts: string[];
  let artifactJsonValid = true;
  try {
    parsedArtifacts = JSON.parse(record.artifact_paths);
    if (!Array.isArray(parsedArtifacts)) {
      artifactJsonValid = false;
      issues.push("artifact_paths is valid JSON but not an array");
      parsedArtifacts = [];
    }
  } catch {
    artifactJsonValid = false;
    issues.push("artifact_paths is malformed JSON");
    parsedArtifacts = [];
  }

  // --- INVALID checks (structural/logical contradictions) ---

  // Missing packet/run identity
  if (!record.packet_id || record.packet_id <= 0) {
    issues.push("missing packet_id");
  }
  if (!record.run_id || record.run_id.trim() === "") {
    issues.push("missing run_id");
  }

  // Malformed artifact path JSON
  if (!artifactJsonValid) {
    (details.checks as string[]).push("artifact_json_malformed");
    return {
      validation_state: "INVALID",
      validation_reason: "Record has structural or logical contradictions: " + issues.join("; "),
      validation_details: details,
    };
  }

  // Impossible state combination: VALID but missing required identity/provenance fields
  if (record.validation_state === "VALID") {
    if (!record.model_id || record.model_id.trim() === "") {
      issues.push("validation_state is VALID but model_id is empty");
    }
    if (!record.model_role || record.model_role.trim() === "") {
      issues.push("validation_state is VALID but model_role is empty");
    }
    if (!record.branch || record.branch.trim() === "") {
      issues.push("validation_state is VALID but branch is empty");
    }
    if (!record.commit_sha || record.commit_sha.trim() === "") {
      issues.push("validation_state is VALID but commit_sha is empty");
    }
    if (issues.length > 0) {
      return {
        validation_state: "INVALID",
        validation_reason: "Impossible state combination: VALID but required fields missing: " + issues.join("; "),
        validation_details: details,
      };
    }
  }

  // If INVALID due to missing packet_id or run_id (checked above)
  if (!record.packet_id || record.packet_id <= 0 || !record.run_id || record.run_id.trim() === "") {
    return {
      validation_state: "INVALID",
      validation_reason: "Record missing fundamental identity: " + issues.join("; "),
      validation_details: details,
    };
  }

  // --- INCOMPLETE checks ---
  if (!record.model_id || record.model_id.trim() === "") {
    missing.push("model_id");
  }
  if (!record.model_role || record.model_role.trim() === "") {
    missing.push("model_role");
  }
  if (!record.commit_sha || record.commit_sha.trim() === "") {
    missing.push("commit_sha");
  }
  if (!record.metrics_path || record.metrics_path.trim() === "") {
    missing.push("metrics_path");
  }
  if (parsedArtifacts.length === 0) {
    missing.push("artifact_paths");
  }

  if (missing.length > 0) {
    details.missingFields = missing;
    details.checks = ["incomplete_fields"] as string[];
    return {
      validation_state: "INCOMPLETE",
      validation_reason: "Required evidence fields missing: " + missing.join(", "),
      validation_details: details,
    };
  }

  // --- DEFERRED checks ---
  // Record references artifacts but results are not yet available
  const deferredReasons: string[] = [];
  if (record.metrics_path && record.metrics_path.trim() !== "" && (!record.executor_result || record.executor_result.trim() === "")) {
    deferredReasons.push("executor_result not available for metrics_path");
  }
  if (parsedArtifacts.length > 0 && (!record.verification_result || record.verification_result.trim() === "")) {
    deferredReasons.push("verification_result not available for artifact_paths");
  }
  if (parsedArtifacts.length > 0 && (!record.audit_result || record.audit_result.trim() === "")) {
    deferredReasons.push("audit_result not available for artifact_paths");
  }

  if (deferredReasons.length > 0) {
    details.deferredReasons = deferredReasons;
    details.checks = ["deferred_prerequisites"] as string[];
    return {
      validation_state: "DEFERRED",
      validation_reason: "Prerequisite data not yet available: " + deferredReasons.join("; "),
      validation_details: details,
    };
  }

  // --- VALID ---
  details.checks = ["identity_verified", "provenance_verified", "artifacts_valid", "states_valid", "no_contradictions"] as string[];
  return {
    validation_state: "VALID",
    validation_reason: "All required fields present, artifacts valid, no logical contradictions",
    validation_details: details,
  };
}

// --- Validation Event Recording ---

export function recordValidationEvent(params: RecordValidationParams): ValidationEvent {
  if (!params.evidence_record_id || params.evidence_record_id <= 0) {
    throw new Error("evidence_record_id is required");
  }

  if (params.validation_state === "NOT_EVALUATED") {
    throw new Error(
      "NOT_EVALUATED is not a valid validation_state. Use VALID, INVALID, INCOMPLETE, or DEFERRED."
    );
  }

  validateEnum(params.validation_state, VALID_VALIDATION_STATES, "validation_state");

  const actorType = params.validation_actor_type ?? "system";
  validateEnum(actorType, VALID_ACTOR_TYPES, "validation_actor_type");

  // Verify evidence record exists
  const record = getEvidenceRecord(params.evidence_record_id);
  if (!record) {
    throw new Error(`Evidence record ${params.evidence_record_id} not found`);
  }

  const db = getDb();
  const details = JSON.stringify(params.validation_details ?? {});

  const stmt = db.prepare(
    `INSERT INTO evidence_record_validation_events (
      evidence_record_id, validation_state, validation_actor_type,
      validation_actor_id, validation_reason, validation_details, provenance_complete
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  const result = stmt.run(
    params.evidence_record_id,
    params.validation_state,
    actorType,
    params.validation_actor_id ?? "",
    params.validation_reason ?? "",
    details,
    params.provenance_complete !== false ? 1 : 0
  );

  return db
    .prepare("SELECT * FROM evidence_record_validation_events WHERE id = ?")
    .get(result.lastInsertRowid) as ValidationEvent;
}

// --- Admission Logic ---

export function evaluateAdmissionForRecord(evidenceId: number): AdmissionEvaluationResult {
  const record = getEvidenceRecord(evidenceId);
  if (!record) {
    throw new Error(`Evidence record ${evidenceId} not found`);
  }

  // Determine current validation state from latest validation event
  const validationEvent = getCurrentValidationState(evidenceId);
  const validationState = validationEvent
    ? validationEvent.validation_state
    : record.validation_state;

  // Determine current admission state from latest admission event
  const latestAdmission = getCurrentAdmissionState(evidenceId);
  const isCurrentlyAdmitted = latestAdmission
    ? latestAdmission.admission_state === "ADMITTED"
    : record.admission_state === "ADMITTED";

  // If previously admitted but now invalidated, it's QUARANTINED
  if (isCurrentlyAdmitted && validationState !== "VALID") {
    return {
      admission_state: "QUARANTINED",
      admission_reason: "Previously admitted but current validation is " + validationState,
      admission_details: { previousAdmission: latestAdmission?.id },
    };
  }

  // REJECTED: validation is INVALID or provenance contradictory
  if (validationState === "INVALID") {
    return {
      admission_state: "REJECTED",
      admission_reason: "Validation state is INVALID",
      admission_details: {},
    };
  }

  // Check if evidence is known to be false or malformed
  const paths = parseArtifactPaths(record);
  if (paths.length === 0 && record.artifact_paths !== "[]") {
    return {
      admission_state: "REJECTED",
      admission_reason: "Evidence contains malformed artifact paths",
      admission_details: {},
    };
  }

  // PENDING: structurally valid but requires review
  if (validationState === "INCOMPLETE" || validationState === "DEFERRED") {
    return {
      admission_state: "PENDING",
      admission_reason: "Validation state is " + validationState + ", awaiting completion or prerequisites",
      admission_details: { validationState },
    };
  }

  // PENDING: trust tier insufficient
  if (record.trust_tier === "TIER_0_UNTRUSTED" || record.trust_tier === "TIER_1_SELF_REPORTED") {
    return {
      admission_state: "PENDING",
      admission_reason: "Trust tier " + record.trust_tier + " is insufficient for automatic admission; requires review",
      admission_details: { trustTier: record.trust_tier },
    };
  }

  // PENDING: no audit result
  if (!record.audit_result || record.audit_result.trim() === "") {
    return {
      admission_state: "PENDING",
      admission_reason: "Audit result not available; awaiting verification",
      admission_details: {},
    };
  }

  // ADMITTED: validation state is VALID, provenance sufficient, trust tier sufficient
  if (validationState === "VALID" && record.trust_tier !== "TIER_0_UNTRUSTED") {
    return {
      admission_state: "ADMITTED",
      admission_reason: "Validation is VALID, trust tier sufficient, audit evidence present",
      admission_details: {
        trustTier: record.trust_tier,
        validationState,
        hasAuditResult: true,
      },
    };
  }

  // Default: PENDING
  return {
    admission_state: "PENDING",
    admission_reason: "Awaiting further evaluation",
    admission_details: { validationState, trustTier: record.trust_tier },
  };
}

// --- Admission Event Recording ---

export function recordEvidenceRecordAdmission(params: RecordAdmissionParams): AdmissionEvent {
  if (!params.evidence_record_id || params.evidence_record_id <= 0) {
    throw new Error("evidence_record_id is required");
  }

  validateEnum(params.admission_state, VALID_ADMISSION_STATES, "admission_state");

  const actorType = params.admission_actor_type ?? "system";
  validateEnum(actorType, VALID_ACTOR_TYPES, "admission_actor_type");

  if (params.trust_tier_at_admission) {
    validateEnum(params.trust_tier_at_admission, VALID_TRUST_TIERS, "trust_tier_at_admission");
  }

  // Verify evidence record exists
  const record = getEvidenceRecord(params.evidence_record_id);
  if (!record) {
    throw new Error(`Evidence record ${params.evidence_record_id} not found`);
  }

  const db = getDb();

  const stmt = db.prepare(
    `INSERT INTO evidence_record_admission_events (
      evidence_record_id, admission_state, admission_actor_type,
      admission_actor_id, admission_reason, trust_tier_at_admission, provenance_complete
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  const result = stmt.run(
    params.evidence_record_id,
    params.admission_state,
    actorType,
    params.admission_actor_id ?? "",
    params.admission_reason ?? "",
    params.trust_tier_at_admission ?? "TIER_0_UNTRUSTED",
    params.provenance_complete !== false ? 1 : 0
  );

  return db
    .prepare("SELECT * FROM evidence_record_admission_events WHERE id = ?")
    .get(result.lastInsertRowid) as AdmissionEvent;
}

// --- State Derivation ---

export function getCurrentValidationState(
  evidenceRecordId: number
): ValidationEvent | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT * FROM evidence_record_validation_events
       WHERE evidence_record_id = ?
       ORDER BY created_at DESC, id DESC
       LIMIT 1`
    )
    .get(evidenceRecordId) as ValidationEvent | undefined;
  return row ?? null;
}

export function getCurrentAdmissionState(
  evidenceRecordId: number
): AdmissionEvent | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT * FROM evidence_record_admission_events
       WHERE evidence_record_id = ?
       ORDER BY created_at DESC, id DESC
       LIMIT 1`
    )
    .get(evidenceRecordId) as AdmissionEvent | undefined;
  return row ?? null;
}

export function getValidationEvents(
  evidenceRecordId: number
): ValidationEvent[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM evidence_record_validation_events
       WHERE evidence_record_id = ?
       ORDER BY created_at ASC, id ASC`
    )
    .all(evidenceRecordId) as ValidationEvent[];
}

export function getAdmissionEventsForRecord(
  evidenceRecordId: number
): AdmissionEvent[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM evidence_record_admission_events
       WHERE evidence_record_id = ?
       ORDER BY created_at ASC, id ASC`
    )
    .all(evidenceRecordId) as AdmissionEvent[];
}

export function getValidationEvent(id: number): ValidationEvent | undefined {
  const db = getDb();
  return db
    .prepare("SELECT * FROM evidence_record_validation_events WHERE id = ?")
    .get(id) as ValidationEvent | undefined;
}

export function getAdmissionEvent(id: number): AdmissionEvent | undefined {
  const db = getDb();
  return db
    .prepare("SELECT * FROM evidence_record_admission_events WHERE id = ?")
    .get(id) as AdmissionEvent | undefined;
}
