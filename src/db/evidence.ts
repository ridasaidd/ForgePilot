import { getDb } from "./client.js";

export interface EvidenceAdmissionEvent {
  id: number;
  target_observation_type: string;
  target_observation_id: number;
  admission_decision: string;
  admission_actor_type: string;
  admission_actor_id: string;
  admission_trust_tier: string;
  validation_state: string;
  provenance_complete: number;
  admission_basis: string;
  created_at: string;
}

export interface AdmissionReviewRequest {
  id: number;
  target_admission_event_id: number;
  review_trigger_type: string;
  requested_by_actor_type: string;
  requested_by_actor_id: string;
  review_reason: string;
  validation_state: string;
  provenance_complete: number;
  created_at: string;
}

export interface AdmissionInvalidationEvent {
  id: number;
  target_admission_event_id: number;
  review_request_id: number;
  invalidation_decision: string;
  invalidated_by_actor_type: string;
  invalidated_by_actor_id: string;
  invalidation_reason: string;
  validation_state: string;
  provenance_complete: number;
  created_at: string;
}

export interface RecordAdmissionParams {
  target_observation_type: string;
  target_observation_id: number;
  admission_decision: string;
  admission_actor_type: string;
  admission_actor_id?: string;
  admission_trust_tier?: string;
  validation_state?: string;
  provenance_complete?: boolean;
  admission_basis?: string;
}

export interface RecordReviewRequestParams {
  target_admission_event_id: number;
  review_trigger_type: string;
  requested_by_actor_type: string;
  requested_by_actor_id?: string;
  review_reason?: string;
  validation_state?: string;
  provenance_complete?: boolean;
}

export interface RecordInvalidationParams {
  target_admission_event_id: number;
  review_request_id: number;
  invalidation_decision: string;
  invalidated_by_actor_type: string;
  invalidated_by_actor_id?: string;
  invalidation_reason?: string;
  validation_state?: string;
  provenance_complete?: boolean;
}

export interface EvidenceEligibilityResult {
  eligible: boolean;
  admission_event: EvidenceAdmissionEvent | null;
  defeating_invalidation: AdmissionInvalidationEvent | null;
}

const VALID_OBSERVATION_TYPES = [
  "classification_observation",
  "outcome_observation",
];

const VALID_ADMISSION_DECISIONS = ["ADMITTED", "REJECTED", "PENDING"];

const VALID_ACTOR_TYPES = [
  "human_auditor",
  "automated_validator",
  "model_reviewer",
  "cross_model_consensus",
  "system",
];

const VALID_TRUST_TIERS = ["TIER_0", "TIER_1", "TIER_2", "TIER_3"];

const VALID_VALIDATION_STATES = ["VALID", "INVALID", "INCOMPLETE", "DEFERRED"];

const VALID_REVIEW_TRIGGER_TYPES = [
  "MANUAL_AUDITOR_FLAG",
  "PROVENANCE_GAP_DISCOVERED",
  "ACTOR_MISMATCH",
  "VALIDATION_RULE_CHANGED",
  "SOURCE_OBSERVATION_QUARANTINED",
  "CONFLICTING_ADMISSION_EVENT",
  "ROUTING_OUTPUT_ANOMALY",
  "SYSTEM_INTEGRITY_CHECK",
];

const VALID_INVALIDATION_DECISIONS = [
  "INVALIDATED",
  "QUARANTINED",
  "NO_ACTION",
  "DEFERRED",
];

function validateEnum(value: string, validValues: string[], fieldName: string): void {
  if (!validValues.includes(value)) {
    throw new Error(
      `Invalid ${fieldName}: '${value}'. Must be one of: ${validValues.join(", ")}`
    );
  }
}

function validateObservationExists(
  targetType: string,
  targetId: number
): void {
  const db = getDb();
  let row: unknown;
  if (targetType === "classification_observation") {
    row = db
      .prepare(
        "SELECT classification_id FROM packet_classification_observations WHERE classification_id = ?"
      )
      .get(targetId);
    if (!row) {
      throw new Error(
        `Target classification_observation ${targetId} not found`
      );
    }
  } else if (targetType === "outcome_observation") {
    row = db
      .prepare(
        "SELECT outcome_id FROM model_outcome_observations WHERE outcome_id = ?"
      )
      .get(targetId);
    if (!row) {
      throw new Error(
        `Target outcome_observation ${targetId} not found`
      );
    }
  }
}

export function recordEvidenceAdmission(
  params: RecordAdmissionParams
): EvidenceAdmissionEvent {
  validateEnum(
    params.target_observation_type,
    VALID_OBSERVATION_TYPES,
    "target_observation_type"
  );
  validateEnum(
    params.admission_decision,
    VALID_ADMISSION_DECISIONS,
    "admission_decision"
  );
  validateEnum(
    params.admission_actor_type,
    VALID_ACTOR_TYPES,
    "admission_actor_type"
  );

  if (params.admission_trust_tier) {
    validateEnum(
      params.admission_trust_tier,
      VALID_TRUST_TIERS,
      "admission_trust_tier"
    );
  }
  if (params.validation_state) {
    validateEnum(
      params.validation_state,
      VALID_VALIDATION_STATES,
      "validation_state"
    );
  }

  validateObservationExists(
    params.target_observation_type,
    params.target_observation_id
  );

  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO evidence_admission_events (
      target_observation_type, target_observation_id, admission_decision,
      admission_actor_type, admission_actor_id, admission_trust_tier,
      validation_state, provenance_complete, admission_basis
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const result = stmt.run(
    params.target_observation_type,
    params.target_observation_id,
    params.admission_decision,
    params.admission_actor_type,
    params.admission_actor_id ?? "",
    params.admission_trust_tier ?? "TIER_0",
    params.validation_state ?? "VALID",
    params.provenance_complete ? 1 : 0,
    params.admission_basis ?? ""
  );

  return db
    .prepare("SELECT * FROM evidence_admission_events WHERE id = ?")
    .get(result.lastInsertRowid) as EvidenceAdmissionEvent;
}

export function recordAdmissionReviewRequest(
  params: RecordReviewRequestParams
): AdmissionReviewRequest {
  validateEnum(
    params.review_trigger_type,
    VALID_REVIEW_TRIGGER_TYPES,
    "review_trigger_type"
  );
  validateEnum(
    params.requested_by_actor_type,
    VALID_ACTOR_TYPES,
    "requested_by_actor_type"
  );

  if (params.validation_state) {
    validateEnum(
      params.validation_state,
      VALID_VALIDATION_STATES,
      "validation_state"
    );
  }

  const db = getDb();

  const admission = db
    .prepare("SELECT id FROM evidence_admission_events WHERE id = ?")
    .get(params.target_admission_event_id) as { id: number } | undefined;

  if (!admission) {
    throw new Error(
      `Target admission event ${params.target_admission_event_id} not found`
    );
  }

  const stmt = db.prepare(
    `INSERT INTO admission_review_requests (
      target_admission_event_id, review_trigger_type,
      requested_by_actor_type, requested_by_actor_id,
      review_reason, validation_state, provenance_complete
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  const result = stmt.run(
    params.target_admission_event_id,
    params.review_trigger_type,
    params.requested_by_actor_type,
    params.requested_by_actor_id ?? "",
    params.review_reason ?? "",
    params.validation_state ?? "VALID",
    params.provenance_complete ? 1 : 0
  );

  return db
    .prepare("SELECT * FROM admission_review_requests WHERE id = ?")
    .get(result.lastInsertRowid) as AdmissionReviewRequest;
}

export function recordAdmissionInvalidation(
  params: RecordInvalidationParams
): AdmissionInvalidationEvent {
  validateEnum(
    params.invalidation_decision,
    VALID_INVALIDATION_DECISIONS,
    "invalidation_decision"
  );
  validateEnum(
    params.invalidated_by_actor_type,
    VALID_ACTOR_TYPES,
    "invalidated_by_actor_type"
  );

  if (params.validation_state) {
    validateEnum(
      params.validation_state,
      VALID_VALIDATION_STATES,
      "validation_state"
    );
  }

  const db = getDb();

  const admission = db
    .prepare("SELECT id FROM evidence_admission_events WHERE id = ?")
    .get(params.target_admission_event_id) as { id: number } | undefined;

  if (!admission) {
    throw new Error(
      `Target admission event ${params.target_admission_event_id} not found`
    );
  }

  const reviewRequest = db
    .prepare("SELECT id, target_admission_event_id FROM admission_review_requests WHERE id = ?")
    .get(params.review_request_id) as
      | { id: number; target_admission_event_id: number }
      | undefined;

  if (!reviewRequest) {
    throw new Error(
      `Review request ${params.review_request_id} not found`
    );
  }

  if (reviewRequest.target_admission_event_id !== params.target_admission_event_id) {
    throw new Error(
      `Review request ${params.review_request_id} targets admission event ` +
      `${reviewRequest.target_admission_event_id}, not ${params.target_admission_event_id}`
    );
  }

  const stmt = db.prepare(
    `INSERT INTO admission_invalidation_events (
      target_admission_event_id, review_request_id, invalidation_decision,
      invalidated_by_actor_type, invalidated_by_actor_id,
      invalidation_reason, validation_state, provenance_complete
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const result = stmt.run(
    params.target_admission_event_id,
    params.review_request_id,
    params.invalidation_decision,
    params.invalidated_by_actor_type,
    params.invalidated_by_actor_id ?? "",
    params.invalidation_reason ?? "",
    params.validation_state ?? "VALID",
    params.provenance_complete ? 1 : 0
  );

  return db
    .prepare("SELECT * FROM admission_invalidation_events WHERE id = ?")
    .get(result.lastInsertRowid) as AdmissionInvalidationEvent;
}

function isAdmissionEffective(event: EvidenceAdmissionEvent): boolean {
  return (
    event.admission_decision === "ADMITTED" &&
    event.validation_state === "VALID" &&
    event.provenance_complete === 1
  );
}

function isInvalidationDefeating(event: AdmissionInvalidationEvent): boolean {
  return (
    event.validation_state === "VALID" &&
    event.provenance_complete === 1 &&
    (event.invalidation_decision === "INVALIDATED" ||
      event.invalidation_decision === "QUARANTINED")
  );
}

export function deriveEvidenceEligibility(
  targetObservationType: string,
  targetObservationId: number
): EvidenceEligibilityResult {
  const db = getDb();

  const admissions = db
    .prepare(
      `SELECT * FROM evidence_admission_events
       WHERE target_observation_type = ? AND target_observation_id = ?
       ORDER BY created_at ASC, id ASC`
    )
    .all(targetObservationType, targetObservationId) as EvidenceAdmissionEvent[];

  let lastEffectiveAdmission: EvidenceAdmissionEvent | null = null;
  let lastDefeatingInvalidation: AdmissionInvalidationEvent | null = null;

  for (const admission of admissions) {
    if (!isAdmissionEffective(admission)) {
      continue;
    }

    lastEffectiveAdmission = admission;
    lastDefeatingInvalidation = null;

    const invalidations = db
      .prepare(
        `SELECT * FROM admission_invalidation_events
         WHERE target_admission_event_id = ?
         ORDER BY created_at ASC, id ASC`
      )
      .all(admission.id) as AdmissionInvalidationEvent[];

    let defeated = false;
    for (const invalidation of invalidations) {
      if (isInvalidationDefeating(invalidation)) {
        defeated = true;
        lastDefeatingInvalidation = invalidation;
        break;
      }
    }

    if (!defeated) {
      return {
        eligible: true,
        admission_event: admission,
        defeating_invalidation: null,
      };
    }
  }

  return {
    eligible: false,
    admission_event: lastEffectiveAdmission,
    defeating_invalidation: lastDefeatingInvalidation,
  };
}

export function getAdmissionEvents(
  targetObservationType: string,
  targetObservationId: number
): EvidenceAdmissionEvent[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM evidence_admission_events
       WHERE target_observation_type = ? AND target_observation_id = ?
       ORDER BY created_at ASC, id ASC`
    )
    .all(targetObservationType, targetObservationId) as EvidenceAdmissionEvent[];
}

export function getAdmissionEvent(
  id: number
): EvidenceAdmissionEvent | undefined {
  const db = getDb();
  return db
    .prepare("SELECT * FROM evidence_admission_events WHERE id = ?")
    .get(id) as EvidenceAdmissionEvent | undefined;
}

export function getReviewRequests(
  targetAdmissionEventId: number
): AdmissionReviewRequest[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM admission_review_requests
       WHERE target_admission_event_id = ?
       ORDER BY created_at ASC, id ASC`
    )
    .all(targetAdmissionEventId) as AdmissionReviewRequest[];
}

export function getInvalidationEvents(
  targetAdmissionEventId: number
): AdmissionInvalidationEvent[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM admission_invalidation_events
       WHERE target_admission_event_id = ?
       ORDER BY created_at ASC, id ASC`
    )
    .all(targetAdmissionEventId) as AdmissionInvalidationEvent[];
}
