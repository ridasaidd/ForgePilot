import { getDb } from "./client.js";

export interface ModelComparisonEvent {
  id: number;
  packet_id: number;
  comparison_outcome: string;
  comparison_basis: string;
  execution_a_id: number | null;
  execution_b_id: number | null;
  evidence_a_id: number | null;
  evidence_b_id: number | null;
  model_a_id: string;
  model_b_id: string;
  model_a_role: string;
  model_b_role: string;
  selected_model: string;
  selection_reason: string;
  model_a_defects: string;
  model_b_defects: string;
  model_a_verification_result: string;
  model_b_verification_result: string;
  model_a_audit_result: string;
  model_b_audit_result: string;
  model_a_admission_state: string;
  model_b_admission_state: string;
  compared_by: string;
  correction_of: number | null;
  correction_reason: string;
  created_at: string;
}

export interface RecordModelComparisonParams {
  packet_id: number;
  comparison_outcome: string;
  comparison_basis: string;
  execution_a_id?: number | null;
  execution_b_id?: number | null;
  evidence_a_id?: number | null;
  evidence_b_id?: number | null;
  model_a_id?: string;
  model_b_id?: string;
  model_a_role?: string;
  model_b_role?: string;
  selected_model?: string;
  selection_reason?: string;
  model_a_defects?: string[];
  model_b_defects?: string[];
  model_a_verification_result?: string;
  model_b_verification_result?: string;
  model_a_audit_result?: string;
  model_b_audit_result?: string;
  model_a_admission_state?: string;
  model_b_admission_state?: string;
  compared_by?: string;
}

export interface RecordModelComparisonCorrectionParams {
  previous_comparison_id: number;
  packet_id: number;
  comparison_outcome?: string;
  comparison_basis?: string;
  selected_model?: string;
  selection_reason?: string;
  model_a_defects?: string[];
  model_b_defects?: string[];
  model_a_verification_result?: string;
  model_b_verification_result?: string;
  model_a_audit_result?: string;
  model_b_audit_result?: string;
  model_a_admission_state?: string;
  model_b_admission_state?: string;
  correction_reason: string;
  corrected_by: string;
}

const VALID_COMPARISON_OUTCOMES = [
  "MODEL_A_SELECTED", "MODEL_B_SELECTED", "TIE", "BOTH_ACCEPTED",
  "BOTH_REJECTED", "INCONCLUSIVE", "DEFERRED",
];

const VALID_COMPARISON_BASES = [
  "CORRECTNESS", "SCOPE_DISCIPLINE", "TEST_PASS_RATE", "SCHEMA_INTEGRATION",
  "PACKET_ALIGNMENT", "EVIDENCE_QUALITY", "MAINTAINABILITY", "COMPOSITE",
];

const VALID_ADMISSION_STATES = [
  "ADMITTED", "PENDING", "REJECTED", "QUARANTINED", "NOT_EVALUATED",
];

function validateEnum(value: string, validValues: string[], fieldName: string): void {
  if (!validValues.includes(value)) {
    throw new Error(`Invalid ${fieldName}: '${value}'. Must be one of: ${validValues.join(", ")}`);
  }
}

export function recordModelComparison(
  params: RecordModelComparisonParams
): ModelComparisonEvent {
  validateEnum(params.comparison_outcome, VALID_COMPARISON_OUTCOMES, "comparison_outcome");
  validateEnum(params.comparison_basis, VALID_COMPARISON_BASES, "comparison_basis");

  if (params.model_a_admission_state) {
    validateEnum(params.model_a_admission_state, VALID_ADMISSION_STATES, "model_a_admission_state");
  }
  if (params.model_b_admission_state) {
    validateEnum(params.model_b_admission_state, VALID_ADMISSION_STATES, "model_b_admission_state");
  }

  const db = getDb();

  const packet = db
    .prepare("SELECT id FROM packets WHERE id = ?")
    .get(params.packet_id) as { id: number } | undefined;

  if (!packet) {
    throw new Error(`Packet ${params.packet_id} not found`);
  }

  if (params.execution_a_id !== undefined && params.execution_a_id !== null) {
    const exec = db
      .prepare("SELECT execution_id, packet_id FROM packet_executions WHERE execution_id = ?")
      .get(params.execution_a_id) as { execution_id: number; packet_id: number } | undefined;

    if (!exec) {
      throw new Error(`Referenced execution_a_id ${params.execution_a_id} not found`);
    }
    if (exec.packet_id !== params.packet_id) {
      throw new Error(
        `Cross-packet reference rejected: execution_a_id ${params.execution_a_id} ` +
        `belongs to packet ${exec.packet_id}, not packet ${params.packet_id}`
      );
    }
  }

  if (params.execution_b_id !== undefined && params.execution_b_id !== null) {
    const exec = db
      .prepare("SELECT execution_id, packet_id FROM packet_executions WHERE execution_id = ?")
      .get(params.execution_b_id) as { execution_id: number; packet_id: number } | undefined;

    if (!exec) {
      throw new Error(`Referenced execution_b_id ${params.execution_b_id} not found`);
    }
    if (exec.packet_id !== params.packet_id) {
      throw new Error(
        `Cross-packet reference rejected: execution_b_id ${params.execution_b_id} ` +
        `belongs to packet ${exec.packet_id}, not packet ${params.packet_id}`
      );
    }
  }

  if (params.evidence_a_id !== undefined && params.evidence_a_id !== null) {
    const ev = db
      .prepare("SELECT evidence_id, packet_id FROM evidence_records WHERE evidence_id = ?")
      .get(params.evidence_a_id) as { evidence_id: number; packet_id: number } | undefined;

    if (!ev) {
      throw new Error(`Referenced evidence_a_id ${params.evidence_a_id} not found`);
    }
    if (ev.packet_id !== params.packet_id) {
      throw new Error(
        `Cross-packet reference rejected: evidence_a_id ${params.evidence_a_id} ` +
        `belongs to packet ${ev.packet_id}, not packet ${params.packet_id}`
      );
    }
  }

  if (params.evidence_b_id !== undefined && params.evidence_b_id !== null) {
    const ev = db
      .prepare("SELECT evidence_id, packet_id FROM evidence_records WHERE evidence_id = ?")
      .get(params.evidence_b_id) as { evidence_id: number; packet_id: number } | undefined;

    if (!ev) {
      throw new Error(`Referenced evidence_b_id ${params.evidence_b_id} not found`);
    }
    if (ev.packet_id !== params.packet_id) {
      throw new Error(
        `Cross-packet reference rejected: evidence_b_id ${params.evidence_b_id} ` +
        `belongs to packet ${ev.packet_id}, not packet ${params.packet_id}`
      );
    }
  }

  const stmt = db.prepare(
    `INSERT INTO fp012_model_comparison_events (
      packet_id, comparison_outcome, comparison_basis,
      execution_a_id, execution_b_id, evidence_a_id, evidence_b_id,
      model_a_id, model_b_id, model_a_role, model_b_role,
      selected_model, selection_reason,
      model_a_defects, model_b_defects,
      model_a_verification_result, model_b_verification_result,
      model_a_audit_result, model_b_audit_result,
      model_a_admission_state, model_b_admission_state,
      compared_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const result = stmt.run(
    params.packet_id,
    params.comparison_outcome,
    params.comparison_basis,
    params.execution_a_id ?? null,
    params.execution_b_id ?? null,
    params.evidence_a_id ?? null,
    params.evidence_b_id ?? null,
    params.model_a_id ?? "",
    params.model_b_id ?? "",
    params.model_a_role ?? "",
    params.model_b_role ?? "",
    params.selected_model ?? "",
    params.selection_reason ?? "",
    JSON.stringify(params.model_a_defects ?? []),
    JSON.stringify(params.model_b_defects ?? []),
    params.model_a_verification_result ?? "",
    params.model_b_verification_result ?? "",
    params.model_a_audit_result ?? "",
    params.model_b_audit_result ?? "",
    params.model_a_admission_state ?? "NOT_EVALUATED",
    params.model_b_admission_state ?? "NOT_EVALUATED",
    params.compared_by ?? ""
  );

  return db
    .prepare("SELECT * FROM fp012_model_comparison_events WHERE id = ?")
    .get(result.lastInsertRowid) as ModelComparisonEvent;
}

export function recordModelComparisonCorrection(
  params: RecordModelComparisonCorrectionParams
): ModelComparisonEvent {
  const db = getDb();

  const prevEvent = db
    .prepare(
      "SELECT * FROM fp012_model_comparison_events WHERE id = ?"
    )
    .get(params.previous_comparison_id) as
      | ModelComparisonEvent
      | undefined;

  if (!prevEvent) {
    throw new Error(
      `Previous comparison event ${params.previous_comparison_id} not found`
    );
  }

  if (prevEvent.packet_id !== params.packet_id) {
    throw new Error(
      `Cross-packet reference rejected: previous_comparison_id ${params.previous_comparison_id} ` +
      `belongs to packet ${prevEvent.packet_id}, not packet ${params.packet_id}`
    );
  }

  // Carry forward original values for fields with CHECK constraints that aren't being corrected
  const outcome = params.comparison_outcome ?? prevEvent.comparison_outcome;
  const basis = params.comparison_basis ?? prevEvent.comparison_basis;
  const admA = params.model_a_admission_state ?? prevEvent.model_a_admission_state;
  const admB = params.model_b_admission_state ?? prevEvent.model_b_admission_state;

  if (params.comparison_outcome) validateEnum(params.comparison_outcome, VALID_COMPARISON_OUTCOMES, "comparison_outcome");
  if (params.comparison_basis) validateEnum(params.comparison_basis, VALID_COMPARISON_BASES, "comparison_basis");
  if (params.model_a_admission_state) validateEnum(params.model_a_admission_state, VALID_ADMISSION_STATES, "model_a_admission_state");
  if (params.model_b_admission_state) validateEnum(params.model_b_admission_state, VALID_ADMISSION_STATES, "model_b_admission_state");

  const stmt = db.prepare(
    `INSERT INTO fp012_model_comparison_events (
      packet_id, comparison_outcome, comparison_basis,
      execution_a_id, execution_b_id, evidence_a_id, evidence_b_id,
      model_a_id, model_b_id, model_a_role, model_b_role,
      selected_model, selection_reason,
      model_a_defects, model_b_defects,
      model_a_verification_result, model_b_verification_result,
      model_a_audit_result, model_b_audit_result,
      model_a_admission_state, model_b_admission_state,
      compared_by, correction_of, correction_reason
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const result = stmt.run(
    params.packet_id,
    outcome,
    basis,
    prevEvent.execution_a_id,
    prevEvent.execution_b_id,
    prevEvent.evidence_a_id,
    prevEvent.evidence_b_id,
    prevEvent.model_a_id,
    prevEvent.model_b_id,
    prevEvent.model_a_role,
    prevEvent.model_b_role,
    params.selected_model ?? prevEvent.selected_model,
    params.selection_reason ?? prevEvent.selection_reason,
    JSON.stringify(params.model_a_defects ?? []),
    JSON.stringify(params.model_b_defects ?? []),
    params.model_a_verification_result ?? prevEvent.model_a_verification_result,
    params.model_b_verification_result ?? prevEvent.model_b_verification_result,
    params.model_a_audit_result ?? prevEvent.model_a_audit_result,
    params.model_b_audit_result ?? prevEvent.model_b_audit_result,
    admA,
    admB,
    params.corrected_by,
    params.previous_comparison_id,
    params.correction_reason
  );

  return db
    .prepare("SELECT * FROM fp012_model_comparison_events WHERE id = ?")
    .get(result.lastInsertRowid) as ModelComparisonEvent;
}

export function getComparisonHistory(
  packet_id: number
): ModelComparisonEvent[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM fp012_model_comparison_events WHERE packet_id = ? ORDER BY created_at ASC, id ASC"
    )
    .all(packet_id) as ModelComparisonEvent[];
}

export function getLatestComparison(
  packet_id: number
): ModelComparisonEvent | undefined {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM fp012_model_comparison_events WHERE packet_id = ? ORDER BY created_at DESC, id DESC LIMIT 1"
    )
    .get(packet_id) as ModelComparisonEvent | undefined;
}

export function getComparisonEvent(
  id: number
): ModelComparisonEvent | undefined {
  const db = getDb();
  return db
    .prepare("SELECT * FROM fp012_model_comparison_events WHERE id = ?")
    .get(id) as ModelComparisonEvent | undefined;
}

export function parseComparisonDefects(
  event: ModelComparisonEvent,
  model: "a" | "b"
): string[] {
  try {
    const jsonStr = model === "a" ? event.model_a_defects : event.model_b_defects;
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
