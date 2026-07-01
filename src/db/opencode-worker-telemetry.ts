import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getDb } from "./client.js";

export interface ArtifactTelemetry {
  path: string;
  exists: boolean;
  byteCount: number | null;
  sha256: string | null;
}

export interface OpenCodeWorkerTelemetryArtifact {
  schemaVersion: string;
  packetId: string;
  workerId: string;
  capturedAt: string;
  workerStatus: string;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  targetWorkspaceId: string;
  workspacePath: string;
  promptFile: string;
  promptFileSha256: string;
  modelId: string | null;
  command: {
    executable: string;
    args: string[];
    argsCount: number;
  };
  artifacts: {
    status: ArtifactTelemetry;
    startRequest: ArtifactTelemetry;
    stdout: ArtifactTelemetry;
    stderr: ArtifactTelemetry;
  };
  classifications: {
    terminalState: string;
    provenanceCompleteness: string;
    trustTier: string;
    validationState: string;
    admissionState: string;
  };
  telemetryPath: string;
  observationSemantics: string;
  reasons: string[];
}

export interface PersistedOpenCodeWorkerTelemetryRow {
  packet_id: string;
  worker_id: string;
  schema_version: string;
  captured_at: string;
  persisted_at: string;
  worker_status: string;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  target_workspace_id: string;
  workspace_path: string;
  prompt_file: string;
  prompt_file_sha256: string;
  model_id: string | null;
  command_executable: string;
  command_args_json: string;
  status_path: string;
  status_sha256: string | null;
  start_request_path: string;
  start_request_sha256: string | null;
  stdout_path: string;
  stdout_byte_count: number | null;
  stdout_sha256: string | null;
  stderr_path: string;
  stderr_byte_count: number | null;
  stderr_sha256: string | null;
  terminal_state: string;
  provenance_completeness: string;
  trust_tier: string;
  validation_state: string;
  admission_state: string;
  telemetry_path: string;
  observation_semantics: string;
  reasons_json: string;
}

export interface PersistWorkerTelemetryResult {
  persisted: boolean;
  insertedOrUpdated: "inserted" | "updated";
  row: PersistedOpenCodeWorkerTelemetryRow;
}

function requireString(value: unknown, name: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function readTelemetryArtifact(telemetryPath: string): OpenCodeWorkerTelemetryArtifact {
  const resolved = resolve(telemetryPath);
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(resolved, "utf8"));
  } catch (error) {
    throw new Error(`Telemetry artifact does not exist or is invalid JSON: ${resolved}`);
  }

  const artifact = parsed as OpenCodeWorkerTelemetryArtifact;
  requireString(artifact.packetId, "packetId");
  requireString(artifact.workerId, "workerId");
  requireString(artifact.schemaVersion, "schemaVersion");
  requireString(artifact.capturedAt, "capturedAt");
  requireString(artifact.workerStatus, "workerStatus");
  requireString(artifact.startedAt, "startedAt");
  requireString(artifact.targetWorkspaceId, "targetWorkspaceId");
  requireString(artifact.workspacePath, "workspacePath");
  requireString(artifact.promptFile, "promptFile");
  requireString(artifact.promptFileSha256, "promptFileSha256");
  requireString(artifact.command?.executable, "command.executable");
  requireString(artifact.artifacts?.status?.path, "artifacts.status.path");
  requireString(artifact.artifacts?.startRequest?.path, "artifacts.startRequest.path");
  requireString(artifact.artifacts?.stdout?.path, "artifacts.stdout.path");
  requireString(artifact.artifacts?.stderr?.path, "artifacts.stderr.path");
  requireString(artifact.classifications?.terminalState, "classifications.terminalState");
  requireString(artifact.classifications?.provenanceCompleteness, "classifications.provenanceCompleteness");
  requireString(artifact.classifications?.trustTier, "classifications.trustTier");
  requireString(artifact.classifications?.validationState, "classifications.validationState");
  requireString(artifact.classifications?.admissionState, "classifications.admissionState");
  requireString(artifact.telemetryPath, "telemetryPath");
  requireString(artifact.observationSemantics, "observationSemantics");

  if (artifact.classifications.admissionState !== "NOT_EVALUATED") {
    throw new Error(`telemetry admissionState must be NOT_EVALUATED, got ${artifact.classifications.admissionState}`);
  }

  return artifact;
}

function selectRow(packetId: string, workerId: string): PersistedOpenCodeWorkerTelemetryRow | undefined {
  return getDb()
    .prepare("SELECT * FROM opencode_worker_telemetry WHERE packet_id = ? AND worker_id = ?")
    .get(packetId, workerId) as PersistedOpenCodeWorkerTelemetryRow | undefined;
}

export function persistOpenCodeWorkerTelemetry(telemetryPath: string): PersistWorkerTelemetryResult {
  const db = getDb();
  const artifact = readTelemetryArtifact(telemetryPath);
  const existing = selectRow(artifact.packetId, artifact.workerId);

  db.prepare(`
    INSERT INTO opencode_worker_telemetry (
      packet_id, worker_id, schema_version, captured_at, persisted_at,
      worker_status, started_at, completed_at, duration_ms,
      target_workspace_id, workspace_path, prompt_file, prompt_file_sha256, model_id,
      command_executable, command_args_json,
      status_path, status_sha256,
      start_request_path, start_request_sha256,
      stdout_path, stdout_byte_count, stdout_sha256,
      stderr_path, stderr_byte_count, stderr_sha256,
      terminal_state, provenance_completeness, trust_tier, validation_state, admission_state,
      telemetry_path, observation_semantics, reasons_json
    ) VALUES (
      @packet_id, @worker_id, @schema_version, @captured_at, datetime('now'),
      @worker_status, @started_at, @completed_at, @duration_ms,
      @target_workspace_id, @workspace_path, @prompt_file, @prompt_file_sha256, @model_id,
      @command_executable, @command_args_json,
      @status_path, @status_sha256,
      @start_request_path, @start_request_sha256,
      @stdout_path, @stdout_byte_count, @stdout_sha256,
      @stderr_path, @stderr_byte_count, @stderr_sha256,
      @terminal_state, @provenance_completeness, @trust_tier, @validation_state, @admission_state,
      @telemetry_path, @observation_semantics, @reasons_json
    )
    ON CONFLICT(packet_id, worker_id) DO UPDATE SET
      schema_version = excluded.schema_version,
      captured_at = excluded.captured_at,
      persisted_at = datetime('now'),
      worker_status = excluded.worker_status,
      started_at = excluded.started_at,
      completed_at = excluded.completed_at,
      duration_ms = excluded.duration_ms,
      target_workspace_id = excluded.target_workspace_id,
      workspace_path = excluded.workspace_path,
      prompt_file = excluded.prompt_file,
      prompt_file_sha256 = excluded.prompt_file_sha256,
      model_id = excluded.model_id,
      command_executable = excluded.command_executable,
      command_args_json = excluded.command_args_json,
      status_path = excluded.status_path,
      status_sha256 = excluded.status_sha256,
      start_request_path = excluded.start_request_path,
      start_request_sha256 = excluded.start_request_sha256,
      stdout_path = excluded.stdout_path,
      stdout_byte_count = excluded.stdout_byte_count,
      stdout_sha256 = excluded.stdout_sha256,
      stderr_path = excluded.stderr_path,
      stderr_byte_count = excluded.stderr_byte_count,
      stderr_sha256 = excluded.stderr_sha256,
      terminal_state = excluded.terminal_state,
      provenance_completeness = excluded.provenance_completeness,
      trust_tier = excluded.trust_tier,
      validation_state = excluded.validation_state,
      admission_state = excluded.admission_state,
      telemetry_path = excluded.telemetry_path,
      observation_semantics = excluded.observation_semantics,
      reasons_json = excluded.reasons_json
  `).run({
    packet_id: artifact.packetId,
    worker_id: artifact.workerId,
    schema_version: artifact.schemaVersion,
    captured_at: artifact.capturedAt,
    worker_status: artifact.workerStatus,
    started_at: artifact.startedAt,
    completed_at: artifact.completedAt,
    duration_ms: artifact.durationMs,
    target_workspace_id: artifact.targetWorkspaceId,
    workspace_path: artifact.workspacePath,
    prompt_file: artifact.promptFile,
    prompt_file_sha256: artifact.promptFileSha256,
    model_id: artifact.modelId,
    command_executable: artifact.command.executable,
    command_args_json: JSON.stringify(artifact.command.args),
    status_path: artifact.artifacts.status.path,
    status_sha256: artifact.artifacts.status.sha256,
    start_request_path: artifact.artifacts.startRequest.path,
    start_request_sha256: artifact.artifacts.startRequest.sha256,
    stdout_path: artifact.artifacts.stdout.path,
    stdout_byte_count: artifact.artifacts.stdout.byteCount,
    stdout_sha256: artifact.artifacts.stdout.sha256,
    stderr_path: artifact.artifacts.stderr.path,
    stderr_byte_count: artifact.artifacts.stderr.byteCount,
    stderr_sha256: artifact.artifacts.stderr.sha256,
    terminal_state: artifact.classifications.terminalState,
    provenance_completeness: artifact.classifications.provenanceCompleteness,
    trust_tier: artifact.classifications.trustTier,
    validation_state: artifact.classifications.validationState,
    admission_state: artifact.classifications.admissionState,
    telemetry_path: artifact.telemetryPath,
    observation_semantics: artifact.observationSemantics,
    reasons_json: JSON.stringify(artifact.reasons ?? []),
  });

  const row = selectRow(artifact.packetId, artifact.workerId);
  if (!row) throw new Error("persisted telemetry row not found after write");

  return {
    persisted: true,
    insertedOrUpdated: existing ? "updated" : "inserted",
    row,
  };
}

export function getPersistedOpenCodeWorkerTelemetry(packetId: string, workerId: string): PersistedOpenCodeWorkerTelemetryRow {
  const row = selectRow(packetId, workerId);
  if (!row) {
    throw new Error(`Persisted telemetry row does not exist for ${packetId}/${workerId}`);
  }
  return row;
}
