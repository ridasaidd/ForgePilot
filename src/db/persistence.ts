import { getDb } from "./client.js";

export interface PacketRecord {
  id: number;
  title: string;
  packet_path: string;
  packet_hash: string;
  task_id: number;
  packet_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LifecycleEvent {
  event_id: number;
  packet_id: number;
  event_type: string;
  lifecycle_state: string;
  source: string;
  actor: string;
  reason: string;
  artifact_path: string;
  execution_id: number | null;
  created_at: string;
}

export interface ExecutionAttempt {
  execution_id: number;
  packet_id: number;
  attempt_number: number;
  trace_id: string;
  requested_model: string;
  executed_model: string;
  provider: string;
  execution_state: string;
  started_at: string;
  completed_at: string | null;
  error_code: string | null;
  error_message: string | null;
  executor_result_path: string;
  verification_path: string;
  audit_prompt_path: string;
  created_at: string;
}

export interface CurrentPacketState {
  packet_id: number;
  title: string;
  packet_path: string;
  packet_hash: string;
  current_state: string | null;
  last_event_type: string | null;
  last_event_at: string | null;
}

export function recordPacketIntent(params: {
  task_id?: number;
  packet_type?: string;
  title?: string;
  packet_path?: string;
  packet_hash?: string;
}): PacketRecord {
  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO packets (task_id, packet_type, title, packet_path, packet_hash)
     VALUES (?, ?, ?, ?, ?)`
  );
  const result = stmt.run(
    params.task_id ?? 1,
    params.packet_type ?? "fp",
    params.title ?? "",
    params.packet_path ?? "",
    params.packet_hash ?? ""
  );
  return db
    .prepare("SELECT * FROM packets WHERE id = ?")
    .get(result.lastInsertRowid) as PacketRecord;
}

export function appendLifecycleEvent(params: {
  packet_id: number;
  event_type: string;
  lifecycle_state: string;
  source?: string;
  actor?: string;
  reason?: string;
  artifact_path?: string;
  execution_id?: number | null;
}): LifecycleEvent {
  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO packet_lifecycle_events (packet_id, event_type, lifecycle_state, source, actor, reason, artifact_path, execution_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const result = stmt.run(
    params.packet_id,
    params.event_type,
    params.lifecycle_state,
    params.source ?? "",
    params.actor ?? "",
    params.reason ?? "",
    params.artifact_path ?? "",
    params.execution_id ?? null
  );
  return db
    .prepare("SELECT * FROM packet_lifecycle_events WHERE event_id = ?")
    .get(result.lastInsertRowid) as LifecycleEvent;
}

export function createExecutionAttempt(params: {
  packet_id: number;
  attempt_number: number;
  trace_id?: string;
  requested_model?: string;
  executed_model?: string;
  provider?: string;
}): ExecutionAttempt {
  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO packet_executions (packet_id, attempt_number, trace_id, requested_model, executed_model, provider)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const result = stmt.run(
    params.packet_id,
    params.attempt_number,
    params.trace_id ?? "",
    params.requested_model ?? "",
    params.executed_model ?? "",
    params.provider ?? ""
  );
  return db
    .prepare("SELECT * FROM packet_executions WHERE execution_id = ?")
    .get(result.lastInsertRowid) as ExecutionAttempt;
}

export function markExecutionSucceeded(execution_id: number): ExecutionAttempt {
  const db = getDb();
  db.prepare(
    `UPDATE packet_executions
     SET execution_state = 'SUCCEEDED', completed_at = datetime('now')
     WHERE execution_id = ?`
  ).run(execution_id);
  return db
    .prepare("SELECT * FROM packet_executions WHERE execution_id = ?")
    .get(execution_id) as ExecutionAttempt;
}

export function markExecutionFailed(params: {
  execution_id: number;
  error_code: string;
  error_message?: string;
}): ExecutionAttempt {
  const db = getDb();
  db.prepare(
    `UPDATE packet_executions
     SET execution_state = 'FAILED', completed_at = datetime('now'),
         error_code = ?, error_message = ?
     WHERE execution_id = ?`
  ).run(params.error_code, params.error_message ?? null, params.execution_id);
  return db
    .prepare("SELECT * FROM packet_executions WHERE execution_id = ?")
    .get(params.execution_id) as ExecutionAttempt;
}

export function getCurrentPacketState(packet_id: number): CurrentPacketState | undefined {
  const db = getDb();
  return db
    .prepare("SELECT * FROM packet_current_state WHERE packet_id = ?")
    .get(packet_id) as CurrentPacketState | undefined;
}

export function getPacketLifecycleEvents(packet_id: number): LifecycleEvent[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM packet_lifecycle_events WHERE packet_id = ? ORDER BY created_at ASC, event_id ASC"
    )
    .all(packet_id) as LifecycleEvent[];
}

export function getPacketExecutions(packet_id: number): ExecutionAttempt[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM packet_executions WHERE packet_id = ? ORDER BY attempt_number ASC"
    )
    .all(packet_id) as ExecutionAttempt[];
}

export function getPacketById(id: number): PacketRecord | undefined {
  const db = getDb();
  return db
    .prepare("SELECT * FROM packets WHERE id = ?")
    .get(id) as PacketRecord | undefined;
}
