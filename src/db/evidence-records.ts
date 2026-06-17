import { getDb } from "./client.js";

export interface EvidenceRecord {
  evidence_id: number;
  packet_id: number;
  run_id: string;
  model_id: string;
  model_role: string;
  branch: string;
  commit_sha: string;
  executor_result: string;
  verification_result: string;
  audit_result: string;
  comparison_result: string;
  metrics_path: string;
  artifact_paths: string;
  trust_tier: string;
  validation_state: string;
  admission_state: string;
  created_at: string;
}

export interface InsertEvidenceParams {
  packet_id: number;
  run_id: string;
  model_id?: string;
  model_role?: string;
  branch?: string;
  commit_sha?: string;
  executor_result?: string;
  verification_result?: string;
  audit_result?: string;
  comparison_result?: string;
  metrics_path?: string;
  artifact_paths?: string[];
  trust_tier?: string;
  validation_state?: string;
  admission_state?: string;
}

const VALID_TRUST_TIERS = [
  "TIER_0_UNTRUSTED",
  "TIER_1_SELF_REPORTED",
  "TIER_2_VERIFIED_ARTIFACT",
  "TIER_3_REPRODUCIBLE",
];

const VALID_VALIDATION_STATES = ["VALID", "INVALID", "INCOMPLETE", "DEFERRED"];

const VALID_ADMISSION_STATES = [
  "NOT_EVALUATED",
  "REJECTED",
  "PENDING",
  "ADMITTED",
  "QUARANTINED",
];

function validateEnum(
  value: string,
  validValues: string[],
  fieldName: string
): void {
  if (!validValues.includes(value)) {
    throw new Error(
      `Invalid ${fieldName}: '${value}'. Must be one of: ${validValues.join(", ")}`
    );
  }
}

export function insertEvidenceRecord(
  params: InsertEvidenceParams
): EvidenceRecord {
  if (!params.packet_id || params.packet_id <= 0) {
    throw new Error("packet_id must be a positive integer");
  }
  if (!params.run_id || params.run_id.trim() === "") {
    throw new Error("run_id is required");
  }

  if (params.trust_tier !== undefined) {
    validateEnum(params.trust_tier, VALID_TRUST_TIERS, "trust_tier");
  }
  if (params.validation_state !== undefined) {
    validateEnum(
      params.validation_state,
      VALID_VALIDATION_STATES,
      "validation_state"
    );
  }
  if (params.admission_state !== undefined) {
    validateEnum(
      params.admission_state,
      VALID_ADMISSION_STATES,
      "admission_state"
    );
  }

  const db = getDb();

  const packet = db
    .prepare("SELECT id FROM packets WHERE id = ?")
    .get(params.packet_id) as { id: number } | undefined;

  if (!packet) {
    throw new Error(`Packet ${params.packet_id} not found`);
  }

  const artifactPathsJson = JSON.stringify(params.artifact_paths ?? []);

  const stmt = db.prepare(
    `INSERT INTO evidence_records (
      packet_id, run_id, model_id, model_role, branch, commit_sha,
      executor_result, verification_result, audit_result, comparison_result,
      metrics_path, artifact_paths, trust_tier, validation_state, admission_state
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const result = stmt.run(
    params.packet_id,
    params.run_id,
    params.model_id ?? "",
    params.model_role ?? "",
    params.branch ?? "",
    params.commit_sha ?? "",
    params.executor_result ?? "",
    params.verification_result ?? "",
    params.audit_result ?? "",
    params.comparison_result ?? "",
    params.metrics_path ?? "",
    artifactPathsJson,
    params.trust_tier ?? "TIER_0_UNTRUSTED",
    params.validation_state ?? "INCOMPLETE",
    params.admission_state ?? "NOT_EVALUATED"
  );

  return db
    .prepare("SELECT * FROM evidence_records WHERE evidence_id = ?")
    .get(result.lastInsertRowid) as EvidenceRecord;
}

export function getEvidenceByPacketId(packetId: number): EvidenceRecord[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM evidence_records WHERE packet_id = ? ORDER BY created_at ASC, evidence_id ASC"
    )
    .all(packetId) as EvidenceRecord[];
}

export function getEvidenceByRunId(runId: string): EvidenceRecord[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM evidence_records WHERE run_id = ? ORDER BY created_at ASC, evidence_id ASC"
    )
    .all(runId) as EvidenceRecord[];
}

export function getEvidenceRecord(
  evidenceId: number
): EvidenceRecord | undefined {
  const db = getDb();
  return db
    .prepare("SELECT * FROM evidence_records WHERE evidence_id = ?")
    .get(evidenceId) as EvidenceRecord | undefined;
}

export function parseArtifactPaths(record: EvidenceRecord): string[] {
  try {
    return JSON.parse(record.artifact_paths) as string[];
  } catch {
    return [];
  }
}
