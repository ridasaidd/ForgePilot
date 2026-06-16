import { getDb } from "./client.js";
import { parseOpenCodeTelemetryFile } from "../telemetry/opencode.js";

export interface PacketExecutionTelemetry {
  telemetry_id: number;
  execution_id: number;
  packet_id: number;
  source: string;
  telemetry_artifact_path: string;
  opencode_session_id: string | null;
  provider: string | null;
  model: string | null;
  model_variant: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  reasoning_tokens: number | null;
  cache_read_tokens: number | null;
  cache_write_tokens: number | null;
  cost: number | null;
  session_created_at: string | null;
  session_updated_at: string | null;
  duration_ms: number | null;
  ingestion_mode: string;
  mapping_confidence: string;
  trust_tier: string;
  validation_state: string;
  admission_state: string;
  recorded_at: string;
}

export interface IngestTelemetryParams {
  packet_id: number;
  execution_id: number;
  telemetry_artifact_path: string;
  ingestion_mode: "DIRECT_ARTIFACT" | "RETROACTIVE_ARTIFACT";
}

export interface IngestTelemetryResult {
  ingested: boolean;
  telemetry: PacketExecutionTelemetry | null;
  error: string | null;
}

export function ingestOpenCodeTelemetry(
  params: IngestTelemetryParams
): IngestTelemetryResult {
  const db = getDb();

  if (!params.packet_id || !params.execution_id) {
    return {
      ingested: false,
      telemetry: null,
      error: "packet_id and execution_id are required",
    };
  }

  const execution = db
    .prepare(
      "SELECT execution_id, packet_id FROM packet_executions WHERE execution_id = ? AND packet_id = ?"
    )
    .get(params.execution_id, params.packet_id) as
      | { execution_id: number; packet_id: number }
      | undefined;

  if (!execution) {
    return {
      ingested: false,
      telemetry: null,
      error: `Execution ${params.execution_id} not found for packet ${params.packet_id}`,
    };
  }

  const parseResult = parseOpenCodeTelemetryFile(params.telemetry_artifact_path);

  if (!parseResult.parsed || !parseResult.artifact) {
    return {
      ingested: false,
      telemetry: null,
      error: parseResult.error ?? "Failed to parse telemetry artifact",
    };
  }

  const artifact = parseResult.artifact;

  const requiredFieldsPresent = artifact.session_id !== null;
  const validationState = requiredFieldsPresent ? "VALID" : "INCOMPLETE";

  const stmt = db.prepare(
    `INSERT INTO packet_execution_telemetry (
      execution_id, packet_id, source, telemetry_artifact_path,
      opencode_session_id, provider, model, model_variant,
      input_tokens, output_tokens, reasoning_tokens,
      cache_read_tokens, cache_write_tokens, cost,
      session_created_at, session_updated_at, duration_ms,
      ingestion_mode, mapping_confidence, trust_tier,
      validation_state, admission_state
    ) VALUES (
      ?, ?, 'OPENCODE_TELEMETRY', ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, 'EXPLICIT', 'TIER_2_VERIFIED_ARTIFACT',
      ?, 'PENDING'
    )`
  );

  const result = stmt.run(
    params.execution_id,
    params.packet_id,
    params.telemetry_artifact_path,
    artifact.session_id,
    artifact.provider,
    artifact.model,
    artifact.model_variant,
    artifact.input_tokens,
    artifact.output_tokens,
    artifact.reasoning_tokens,
    artifact.cache_read_tokens,
    artifact.cache_write_tokens,
    artifact.cost,
    artifact.created_at,
    artifact.updated_at,
    artifact.duration_ms,
    params.ingestion_mode,
    validationState
  );

  return {
    ingested: true,
    telemetry: db
      .prepare("SELECT * FROM packet_execution_telemetry WHERE telemetry_id = ?")
      .get(result.lastInsertRowid) as PacketExecutionTelemetry,
    error: null,
  };
}

export function getExecutionTelemetry(
  execution_id: number
): PacketExecutionTelemetry[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM packet_execution_telemetry WHERE execution_id = ? ORDER BY recorded_at DESC"
    )
    .all(execution_id) as PacketExecutionTelemetry[];
}

export function getPacketTelemetry(
  packet_id: number
): PacketExecutionTelemetry[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM packet_execution_telemetry WHERE packet_id = ? ORDER BY recorded_at DESC"
    )
    .all(packet_id) as PacketExecutionTelemetry[];
}
