import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { initDb, getDb, closeDb } from "../src/db/client.js";
import { migrate } from "../src/db/migrate.js";
import {
  recordPacketIntent,
  appendLifecycleEvent,
  createExecutionAttempt,
  markExecutionSucceeded,
  markExecutionFailed,
  getCurrentPacketState,
  getPacketLifecycleEvents,
  getPacketExecutions,
  getPacketById,
} from "../src/db/persistence.js";

let testDir: string;

before(() => {
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), "forgepilot-fp004-"));
});

after(() => {
  closeDb();
  fs.rmSync(testDir, { recursive: true, force: true });
});

function setupDb(dbPath: string) {
  closeDb();
  initDb(dbPath);
  migrate();
  ensurePrerequisiteData();
}

function ensurePrerequisiteData() {
  const db = getDb();
  db.exec("INSERT OR IGNORE INTO phases (id, name, status) VALUES (1, 'default-phase', 'pending')");
  db.exec("INSERT OR IGNORE INTO steps (id, phase_id, name, status) VALUES (1, 1, 'default-step', 'pending')");
  db.exec("INSERT OR IGNORE INTO tasks (id, step_id, name, status) VALUES (1, 1, 'default-task', 'pending')");
}

import {
  ingestOpenCodeTelemetry,
  getExecutionTelemetry,
  getPacketTelemetry,
  type IngestTelemetryParams,
} from "../src/db/telemetry.js";
import { parseOpenCodeTelemetryFile } from "../src/telemetry/opencode.js";

describe("FP-004: SQLite Metrics Persistence", () => {
  describe("Migration", () => {
    it("should be idempotent (running migrate twice does not fail)", () => {
      const dbPath = path.join(testDir, "idempotent-fp004.db");
      closeDb();
      initDb(dbPath);
      migrate();
      migrate();

      const db = getDb();
      const rows = db
        .prepare("SELECT name FROM _migrations WHERE name = ?")
        .all("002_fp004_persistence.sql") as { name: string }[];

      assert.equal(rows.length, 1, "Migration 002 should only be recorded once");
    });

    it("should create packet_lifecycle_events table with required columns", () => {
      const dbPath = path.join(testDir, "lifecycle-table.db");
      setupDb(dbPath);
      const db = getDb();

      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((r: unknown) => (r as { name: string }).name);
      assert.ok(tables.includes("packet_lifecycle_events"), "packet_lifecycle_events table should exist");

      const columns = db
        .prepare("PRAGMA table_info(packet_lifecycle_events)")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      const required = [
        "event_id", "packet_id", "event_type", "lifecycle_state",
        "source", "actor", "reason", "artifact_path", "execution_id", "created_at",
      ];
      for (const col of required) {
        assert.ok(columns.includes(col), `packet_lifecycle_events.${col} should exist`);
      }
    });

    it("should create packet_executions table with required columns", () => {
      const dbPath = path.join(testDir, "executions-table.db");
      setupDb(dbPath);
      const db = getDb();

      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((r: unknown) => (r as { name: string }).name);
      assert.ok(tables.includes("packet_executions"), "packet_executions table should exist");

      const columns = db
        .prepare("PRAGMA table_info(packet_executions)")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      const required = [
        "execution_id", "packet_id", "attempt_number", "trace_id",
        "requested_model", "executed_model", "provider", "execution_state",
        "started_at", "completed_at", "error_code", "error_message",
        "executor_result_path", "verification_path", "audit_prompt_path", "created_at",
      ];
      for (const col of required) {
        assert.ok(columns.includes(col), `packet_executions.${col} should exist`);
      }
    });

    it("should create packet_current_state view", () => {
      const dbPath = path.join(testDir, "state-view.db");
      setupDb(dbPath);
      const db = getDb();

      const views = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'view'")
        .all()
        .map((r: unknown) => (r as { name: string }).name);
      assert.ok(views.includes("packet_current_state"), "packet_current_state view should exist");
    });

    it("should add FP-004 columns to existing packets table", () => {
      const dbPath = path.join(testDir, "packets-columns.db");
      setupDb(dbPath);
      const db = getDb();

      const columns = db
        .prepare("PRAGMA table_info(packets)")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      assert.ok(columns.includes("title"), "packets.title should exist");
      assert.ok(columns.includes("packet_path"), "packets.packet_path should exist");
      assert.ok(columns.includes("packet_hash"), "packets.packet_hash should exist");
    });
  });

  describe("Packet intent", () => {
    it("should record packet intent with title, path, and hash", () => {
      const dbPath = path.join(testDir, "packet-intent.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-004 Test Packet",
        packet_path: "packets/FP-004.md",
        packet_hash: "abc123hash",
      });

      assert.ok(packet.id > 0, "Packet should have an id");
      assert.equal(packet.title, "FP-004 Test Packet");
      assert.equal(packet.packet_path, "packets/FP-004.md");
      assert.equal(packet.packet_hash, "abc123hash");

      const retrieved = getPacketById(packet.id);
      assert.ok(retrieved, "Packet should be retrievable");
      assert.equal(retrieved!.title, "FP-004 Test Packet");
    });

    it("should preserve existing packet columns when recording intent", () => {
      const dbPath = path.join(testDir, "packet-intent-legacy.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        task_id: 1,
        packet_type: "fp",
        title: "Legacy Compat",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash456",
      });

      assert.equal(packet.task_id, 1);
      assert.equal(packet.packet_type, "fp");
      assert.equal(packet.status, "pending");
    });
  });

  describe("Lifecycle events", () => {
    it("should append lifecycle events to a packet", () => {
      const dbPath = path.join(testDir, "lifecycle-append.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "Lifecycle Test",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash1",
      });

      const event1 = appendLifecycleEvent({
        packet_id: packet.id,
        event_type: "PACKET_CREATED",
        lifecycle_state: "CREATED",
        source: "forgepilot",
        actor: "cli",
        reason: "Packet registered",
      });

      assert.equal(event1.packet_id, packet.id);
      assert.equal(event1.event_type, "PACKET_CREATED");
      assert.equal(event1.lifecycle_state, "CREATED");

      const event2 = appendLifecycleEvent({
        packet_id: packet.id,
        event_type: "PACKET_VALIDATED",
        lifecycle_state: "VALIDATED",
        source: "forgepilot",
        actor: "cli",
        reason: "Packet validated",
      });

      assert.equal(event2.lifecycle_state, "VALIDATED");

      const events = getPacketLifecycleEvents(packet.id);
      assert.equal(events.length, 2, "Should have 2 lifecycle events");
      assert.equal(events[0].lifecycle_state, "CREATED");
      assert.equal(events[1].lifecycle_state, "VALIDATED");
    });

    it("should be append-only (events cannot be mutated after creation)", () => {
      const dbPath = path.join(testDir, "lifecycle-append-only.db");
      setupDb(dbPath);
      const db = getDb();

      const packet = recordPacketIntent({
        title: "Append Only Test",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash2",
      });

      const event = appendLifecycleEvent({
        packet_id: packet.id,
        event_type: "PACKET_CREATED",
        lifecycle_state: "CREATED",
        source: "forgepilot",
        actor: "cli",
        reason: "Initial creation",
      });

      assert.equal(event.lifecycle_state, "CREATED");

      const updated = appendLifecycleEvent({
        packet_id: packet.id,
        event_type: "PACKET_VALIDATED",
        lifecycle_state: "VALIDATED",
        source: "forgepilot",
        actor: "cli",
        reason: "Validated",
      });

      assert.equal(updated.lifecycle_state, "VALIDATED");

      const events = getPacketLifecycleEvents(packet.id);
      assert.equal(events.length, 2, "Should have both events in history");
      assert.equal(events[0].lifecycle_state, "CREATED", "First event still CREATED");
      assert.equal(events[1].lifecycle_state, "VALIDATED", "Second event is VALIDATED");

      const eventCount = db
        .prepare(
          "SELECT COUNT(*) as cnt FROM packet_lifecycle_events WHERE event_type = 'PACKET_CREATED'"
        )
        .get() as { cnt: number };
      assert.equal(eventCount.cnt, 1, "CREATED event still exists");
    });

    it("should reference execution attempts via execution_id", () => {
      const dbPath = path.join(testDir, "lifecycle-exec-ref.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "Exec Ref Test",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash3",
      });

      const execution = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
        trace_id: "trace-001",
      });

      const event = appendLifecycleEvent({
        packet_id: packet.id,
        event_type: "EXECUTION_STARTED",
        lifecycle_state: "CREATED",
        source: "executor",
        actor: "model",
        reason: "Execution started",
        execution_id: execution.execution_id,
      });

      assert.equal(event.execution_id, execution.execution_id);

      const events = getPacketLifecycleEvents(packet.id);
      assert.equal(events.length, 1);
      assert.equal(events[0].execution_id, execution.execution_id);
    });
  });

  describe("Execution attempts", () => {
    it("should create an execution attempt with RUNNING state by default", () => {
      const dbPath = path.join(testDir, "exec-attempt.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "Exec Attempt Test",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash4",
      });

      const execution = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
        trace_id: "trace-abc",
        requested_model: "deepseek-v4",
        executed_model: "deepseek-v4-pro",
        provider: "openrouter",
      });

      assert.equal(execution.execution_state, "RUNNING");
      assert.equal(execution.packet_id, packet.id);
      assert.equal(execution.attempt_number, 1);
      assert.equal(execution.trace_id, "trace-abc");
      assert.equal(execution.requested_model, "deepseek-v4");
      assert.equal(execution.executed_model, "deepseek-v4-pro");
      assert.equal(execution.provider, "openrouter");
      assert.ok(execution.started_at, "started_at should be set");
      assert.equal(execution.completed_at, null);
      assert.equal(execution.error_code, null);
      assert.equal(execution.error_message, null);
    });

    it("should mark execution as SUCCEEDED", () => {
      const dbPath = path.join(testDir, "exec-succeeded.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "Exec Success Test",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash5",
      });

      const execution = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
      });

      const succeeded = markExecutionSucceeded(execution.execution_id);
      assert.equal(succeeded.execution_state, "SUCCEEDED");
      assert.ok(succeeded.completed_at, "completed_at should be set");

      const retrieved = getPacketExecutions(packet.id);
      assert.equal(retrieved.length, 1);
      assert.equal(retrieved[0].execution_state, "SUCCEEDED");
    });

    it("should mark execution as FAILED with stable error_code and separate error_message", () => {
      const dbPath = path.join(testDir, "exec-failed.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "Exec Fail Test",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash6",
      });

      const execution = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
      });

      const failed = markExecutionFailed({
        execution_id: execution.execution_id,
        error_code: "PROVIDER_TIMEOUT",
        error_message: "The provider did not respond within 120 seconds",
      });

      assert.equal(failed.execution_state, "FAILED");
      assert.equal(failed.error_code, "PROVIDER_TIMEOUT");
      assert.equal(failed.error_message, "The provider did not respond within 120 seconds");
      assert.ok(failed.completed_at, "completed_at should be set");

      const retrieved = getPacketExecutions(packet.id);
      assert.equal(retrieved[0].error_code, "PROVIDER_TIMEOUT");
      assert.equal(retrieved[0].error_message, "The provider did not respond within 120 seconds");
    });

    it("should support multiple execution attempts per packet", () => {
      const dbPath = path.join(testDir, "exec-multi-attempt.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "Multi Attempt Test",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash7",
      });

      const attempt1 = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
        trace_id: "trace-1",
      });
      markExecutionFailed({
        execution_id: attempt1.execution_id,
        error_code: "EXECUTOR_FAILED",
        error_message: "First attempt failed",
      });

      const attempt2 = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 2,
        trace_id: "trace-2",
      });
      markExecutionSucceeded(attempt2.execution_id);

      const executions = getPacketExecutions(packet.id);
      assert.equal(executions.length, 2, "Should have 2 execution attempts");
      assert.equal(executions[0].attempt_number, 1);
      assert.equal(executions[0].execution_state, "FAILED");
      assert.equal(executions[1].attempt_number, 2);
      assert.equal(executions[1].execution_state, "SUCCEEDED");
    });

    it("should enforce unique attempt_number per packet", () => {
      const dbPath = path.join(testDir, "exec-unique-attempt.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "Unique Attempt Test",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash8",
      });

      createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
      });

      assert.throws(
        () =>
          createExecutionAttempt({
            packet_id: packet.id,
            attempt_number: 1,
          }),
        /UNIQUE constraint failed/
      );
    });
  });

  describe("EXECUTION_COMPLETED maps to SUCCEEDED", () => {
    it("should map EXECUTION_COMPLETED lifecycle event to SUCCEEDED execution state", () => {
      const dbPath = path.join(testDir, "exec-completed-mapping.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "Mapping Test",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash9",
      });

      const execution = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
      });

      appendLifecycleEvent({
        packet_id: packet.id,
        event_type: "EXECUTION_STARTED",
        lifecycle_state: "CREATED",
        source: "executor",
        actor: "model",
        reason: "Execution started",
        execution_id: execution.execution_id,
      });

      const succeeded = markExecutionSucceeded(execution.execution_id);

      appendLifecycleEvent({
        packet_id: packet.id,
        event_type: "EXECUTION_COMPLETED",
        lifecycle_state: "VALIDATED",
        source: "executor",
        actor: "model",
        reason: "Execution completed successfully",
        execution_id: execution.execution_id,
      });

      assert.equal(succeeded.execution_state, "SUCCEEDED", "EXECUTION_COMPLETED must produce SUCCEEDED state");

      const finalExec = getPacketExecutions(packet.id);
      assert.equal(finalExec[0].execution_state, "SUCCEEDED");
    });

    it("should not use COMPLETED as an execution state", () => {
      const dbPath = path.join(testDir, "no-completed-state.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "No Completed State",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash10",
      });

      const execution = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
      });

      assert.equal(execution.execution_state, "RUNNING");
      assert.notEqual(execution.execution_state, "COMPLETED");

      const succeeded = markExecutionSucceeded(execution.execution_id);
      assert.equal(succeeded.execution_state, "SUCCEEDED");
      assert.notEqual(succeeded.execution_state, "COMPLETED");

      const allExecutions = getDb()
        .prepare("SELECT * FROM packet_executions WHERE execution_state = 'COMPLETED'")
        .all();
      assert.equal(allExecutions.length, 0, "No execution should have COMPLETED state");
    });
  });

  describe("Error handling", () => {
    it("should keep error_code stable and queryable", () => {
      const dbPath = path.join(testDir, "error-code-queryable.db");
      setupDb(dbPath);
      const db = getDb();

      const packet = recordPacketIntent({
        title: "Error Code Test",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash11",
      });

      const exec1 = createExecutionAttempt({ packet_id: packet.id, attempt_number: 1 });
      markExecutionFailed({ execution_id: exec1.execution_id, error_code: "PROVIDER_TIMEOUT" });

      const exec2 = createExecutionAttempt({ packet_id: packet.id, attempt_number: 2 });
      markExecutionFailed({ execution_id: exec2.execution_id, error_code: "PROVIDER_RATE_LIMIT" });

      const exec3 = createExecutionAttempt({ packet_id: packet.id, attempt_number: 3 });
      markExecutionFailed({ execution_id: exec3.execution_id, error_code: "PROVIDER_TIMEOUT" });

      const timeoutCount = db
        .prepare(
          "SELECT COUNT(*) as cnt FROM packet_executions WHERE error_code = 'PROVIDER_TIMEOUT'"
        )
        .get() as { cnt: number };
      assert.equal(timeoutCount.cnt, 2, "Should find 2 PROVIDER_TIMEOUT errors");

      const rateLimitCount = db
        .prepare(
          "SELECT COUNT(*) as cnt FROM packet_executions WHERE error_code = 'PROVIDER_RATE_LIMIT'"
        )
        .get() as { cnt: number };
      assert.equal(rateLimitCount.cnt, 1, "Should find 1 PROVIDER_RATE_LIMIT error");
    });

    it("should store error_message separately from error_code", () => {
      const dbPath = path.join(testDir, "error-message-separate.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "Error Message Test",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash12",
      });

      const execution = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
      });

      const failed = markExecutionFailed({
        execution_id: execution.execution_id,
        error_code: "VERIFICATION_FAILED",
        error_message: "Expected 3 tests to pass, but only 2 passed",
      });

      assert.equal(failed.error_code, "VERIFICATION_FAILED");
      assert.equal(failed.error_message, "Expected 3 tests to pass, but only 2 passed");
      assert.notEqual(failed.error_code, failed.error_message);
    });
  });

  describe("Current packet state derivation", () => {
    it("should derive current state from lifecycle events", () => {
      const dbPath = path.join(testDir, "state-derivation.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "State Derivation Test",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash13",
      });

      appendLifecycleEvent({
        packet_id: packet.id,
        event_type: "PACKET_CREATED",
        lifecycle_state: "CREATED",
        source: "forgepilot",
        actor: "cli",
        reason: "Packet registered",
      });

      let state = getCurrentPacketState(packet.id);
      assert.ok(state, "Should have current state");
      assert.equal(state!.current_state, "CREATED");

      appendLifecycleEvent({
        packet_id: packet.id,
        event_type: "PACKET_VALIDATED",
        lifecycle_state: "VALIDATED",
        source: "forgepilot",
        actor: "cli",
        reason: "Packet validated",
      });

      state = getCurrentPacketState(packet.id);
      assert.equal(state!.current_state, "VALIDATED");

      appendLifecycleEvent({
        packet_id: packet.id,
        event_type: "PACKET_ADMITTED",
        lifecycle_state: "ADMITTED",
        source: "auditor",
        actor: "model",
        reason: "Packet admitted as evidence",
      });

      state = getCurrentPacketState(packet.id);
      assert.equal(state!.current_state, "ADMITTED");
    });

    it("should return null state for packet with no lifecycle events", () => {
      const dbPath = path.join(testDir, "no-lifecycle-state.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "No Lifecycle Test",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash14",
      });

      const state = getCurrentPacketState(packet.id);
      assert.ok(state, "Should return a row for the packet");
      assert.equal(state!.current_state, null, "Should have null state with no events");
    });

    it("should preserve full lifecycle event history", () => {
      const dbPath = path.join(testDir, "lifecycle-history.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "History Test",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash15",
      });

      const events = [
        { type: "PACKET_CREATED", state: "CREATED" },
        { type: "PACKET_VALIDATED", state: "VALIDATED" },
        { type: "PACKET_ADMITTED", state: "ADMITTED" },
        { type: "PACKET_QUARANTINED", state: "QUARANTINED" },
        { type: "PACKET_REVALIDATED", state: "VALIDATED" },
        { type: "PACKET_READMITTED", state: "ADMITTED" },
      ];

      for (const evt of events) {
        appendLifecycleEvent({
          packet_id: packet.id,
          event_type: evt.type,
          lifecycle_state: evt.state,
          source: "forgepilot",
          actor: "cli",
          reason: `Transition to ${evt.state}`,
        });
      }

      const history = getPacketLifecycleEvents(packet.id);
      assert.equal(history.length, events.length, "Should preserve all events");

      for (let i = 0; i < events.length; i++) {
        assert.equal(history[i].event_type, events[i].type);
        assert.equal(history[i].lifecycle_state, events[i].state);
      }

      const currentState = getCurrentPacketState(packet.id);
      assert.equal(currentState!.current_state, "ADMITTED", "Latest state should be ADMITTED");
    });

    it("should have packet_current_state as a view, not a source of truth table", () => {
      const dbPath = path.join(testDir, "view-not-table.db");
      setupDb(dbPath);
      const db = getDb();

      const viewInfo = db
        .prepare(
          "SELECT type FROM sqlite_master WHERE name = 'packet_current_state'"
        )
        .get() as { type: string };

      assert.equal(viewInfo.type, "view", "packet_current_state must be a view, not a table");

      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((r: unknown) => (r as { name: string }).name);
      assert.ok(
        !tables.includes("packet_current_state"),
        "packet_current_state must not be a table"
      );
    });
  });

  describe("Existing behavior preservation", () => {
    it("should preserve existing packets table columns and foreign keys", () => {
      const dbPath = path.join(testDir, "legacy-preserve.db");
      setupDb(dbPath);
      const db = getDb();

      const columns = db
        .prepare("PRAGMA table_info(packets)")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      assert.ok(columns.includes("id"), "packets.id should exist");
      assert.ok(columns.includes("task_id"), "packets.task_id should exist");
      assert.ok(columns.includes("packet_type"), "packets.packet_type should exist");
      assert.ok(columns.includes("status"), "packets.status should exist");
      assert.ok(columns.includes("created_at"), "packets.created_at should exist");
      assert.ok(columns.includes("updated_at"), "packets.updated_at should exist");

      const foreignKeys = db
        .prepare("SELECT * FROM pragma_foreign_key_list('packets')")
        .all() as { table: string; from: string; to: string }[];
      assert.ok(
        foreignKeys.some((fk) => fk.table === "tasks" && fk.from === "task_id" && fk.to === "id"),
        "packets.task_id FK to tasks.id should remain"
      );
    });

    it("should allow existing packet-metrics queries to work", () => {
      const dbPath = path.join(testDir, "legacy-metrics.db");
      setupDb(dbPath);
      const db = getDb();

      db.exec("INSERT OR REPLACE INTO phases (id, name, status) VALUES (1, 'test-phase', 'pending')");
      db.exec("INSERT OR REPLACE INTO steps (id, phase_id, name, status) VALUES (1, 1, 'test-step', 'pending')");
      db.exec("INSERT OR REPLACE INTO tasks (id, step_id, name, status) VALUES (1, 1, 'test-task', 'pending')");
      db.exec("INSERT OR REPLACE INTO packets (id, task_id, packet_type, status) VALUES (1, 1, 'eval', 'completed')");
      db.exec("INSERT OR REPLACE INTO packets (id, task_id, packet_type, status) VALUES (2, 1, 'eval', 'failed')");

      const metrics = db
        .prepare(
          `SELECT
            (SELECT COUNT(*) FROM packets) as total,
            (SELECT COUNT(*) FROM packets WHERE status = 'completed') as successful,
            (SELECT COUNT(*) FROM packets WHERE status = 'failed') as failed`
        )
        .get() as { total: number; successful: number; failed: number };

      assert.equal(metrics.total, 2);
      assert.equal(metrics.successful, 1);
      assert.equal(metrics.failed, 1);
    });
  });

  describe("Valid error_code values", () => {
    it("should accept all FP-004 valid error_code values", () => {
      const dbPath = path.join(testDir, "valid-error-codes.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "Error Code Values",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash16",
      });

      const validCodes = [
        "PROVIDER_TIMEOUT",
        "PROVIDER_RATE_LIMIT",
        "PROVIDER_AUTH_FAILED",
        "EXECUTOR_FAILED",
        "VERIFICATION_FAILED",
        "UNKNOWN_ERROR",
      ];

      for (let i = 0; i < validCodes.length; i++) {
        const execution = createExecutionAttempt({
          packet_id: packet.id,
          attempt_number: i + 1,
        });

        const failed = markExecutionFailed({
          execution_id: execution.execution_id,
          error_code: validCodes[i],
        });

        assert.equal(failed.error_code, validCodes[i]);
      }

      const db = getDb();
      const codes = db
        .prepare("SELECT DISTINCT error_code FROM packet_executions ORDER BY error_code")
        .all() as { error_code: string }[];

      assert.equal(codes.length, validCodes.length);
      for (const code of codes) {
        assert.ok(validCodes.includes(code.error_code));
      }
    });
  });
});

describe("FP-005: OpenCode Telemetry Ingestion", () => {
  describe("Telemetry artifact parsing", () => {
    it("should parse a complete OpenCode telemetry artifact file successfully", () => {
      const fixturePath = path.resolve("tests/fixtures/opencode-telemetry-complete.json");
      const result = parseOpenCodeTelemetryFile(fixturePath);

      assert.ok(result.parsed, "Parse should succeed");
      assert.ok(result.artifact, "Artifact should be returned");
      assert.equal(result.error, null);

      const a = result.artifact!;
      assert.equal(a.session_id, "session-abc123-def456");
      assert.equal(a.provider, "openrouter");
      assert.equal(a.model, "deepseek-v4-pro");
      assert.equal(a.model_variant, "high");
      assert.equal(a.input_tokens, 15000);
      assert.equal(a.output_tokens, 8000);
      assert.equal(a.reasoning_tokens, 3200);
      assert.equal(a.cache_read_tokens, 500);
      assert.equal(a.cache_write_tokens, 1200);
      assert.equal(a.cost, 0.452);
      assert.equal(a.created_at, "2026-06-15T10:00:00Z");
      assert.equal(a.updated_at, "2026-06-15T10:12:30Z");
      assert.equal(a.duration_ms, 750000);
    });

    it("should handle missing telemetry fields as null", () => {
      const fixturePath = path.resolve("tests/fixtures/opencode-telemetry-missing-fields.json");
      const result = parseOpenCodeTelemetryFile(fixturePath);

      assert.ok(result.parsed, "Parse should succeed");
      assert.ok(result.artifact, "Artifact should be returned");

      const a = result.artifact!;
      assert.equal(a.session_id, "session-partial");
      assert.equal(a.provider, "openrouter");
      assert.equal(a.model, "deepseek-v4");
      assert.equal(a.model_variant, null, "model_variant should be null when missing");
      assert.equal(a.input_tokens, 5000);
      assert.equal(a.output_tokens, null, "output_tokens should be null when missing");
      assert.equal(a.reasoning_tokens, null, "reasoning_tokens should be null when missing");
      assert.equal(a.cache_read_tokens, null, "cache_read_tokens should be null when missing");
      assert.equal(a.cache_write_tokens, null, "cache_write_tokens should be null when missing");
      assert.equal(a.cost, null, "cost should be null when missing");
      assert.equal(a.updated_at, null, "updated_at should be null when missing");
      assert.equal(a.duration_ms, null, "duration_ms should be null when missing");
    });

    it("should fail on invalid JSON artifact", () => {
      const fixturePath = path.resolve("tests/fixtures/opencode-telemetry-invalid.json");
      const result = parseOpenCodeTelemetryFile(fixturePath);

      assert.equal(result.parsed, false);
      assert.equal(result.artifact, null);
      assert.ok(result.error, "Should have an error message");
    });

    it("should parse a messages-based OpenCode export (real shape)", () => {
      const fixturePath = path.resolve("tests/fixtures/opencode-telemetry-messages.json");
      const result = parseOpenCodeTelemetryFile(fixturePath);

      assert.ok(result.parsed, "Parse should succeed");
      assert.ok(result.artifact, "Artifact should be returned");

      const a = result.artifact!;
      assert.equal(a.session_id, "session-opencode-real-abc123");
      assert.equal(a.provider, "openrouter");
      assert.equal(a.model, "deepseek-v4-pro");
      assert.equal(a.model_variant, "high");

      assert.equal(a.input_tokens, 15000, "Should aggregate input_tokens across messages");
      assert.equal(a.output_tokens, 8000, "Should aggregate output_tokens across messages");
      assert.equal(a.reasoning_tokens, 3200, "Should aggregate reasoning_tokens across messages");
      assert.equal(a.cache_read_tokens, 500, "Should aggregate cache_read_tokens across messages");
      assert.equal(a.cache_write_tokens, 1200, "Should aggregate cache_write_tokens across messages");
      assert.equal(a.cost, 0.452);
      assert.equal(a.created_at, "2026-06-15T10:00:00Z");
      assert.equal(a.updated_at, "2026-06-15T10:12:30Z");
      assert.equal(a.duration_ms, null, "duration_ms not present in messages fixture");
    });

    it("should parse a top-level summary export with alternate field names", () => {
      const fixturePath = path.resolve("tests/fixtures/opencode-telemetry-summary.json");
      const result = parseOpenCodeTelemetryFile(fixturePath);

      assert.ok(result.parsed, "Parse should succeed");
      assert.ok(result.artifact, "Artifact should be returned");

      const a = result.artifact!;
      assert.equal(a.session_id, "session-top-level-summary-xyz");
      assert.equal(a.provider, "openrouter");
      assert.equal(a.model, "deepseek-v4");
      assert.equal(a.model_variant, null, "variant not present in summary fixture");

      assert.equal(a.input_tokens, 12000, "Should extract from usage.input");
      assert.equal(a.output_tokens, 5500, "Should extract from usage.output");
      assert.equal(a.reasoning_tokens, 2100, "Should extract from usage.reasoning");
      assert.equal(a.cache_read_tokens, 400, "Should extract from usage.cache_read");
      assert.equal(a.cache_write_tokens, 900, "Should extract from usage.cache_write");

      assert.equal(a.cost, 0.315, "Should extract from cost.total_cost");
      assert.equal(a.created_at, "2026-06-14T09:30:00Z");
      assert.equal(a.updated_at, "2026-06-14T09:45:00Z");
      assert.equal(a.duration_ms, 900000, "Should extract from duration field");
    });
  });

  describe("Telemetry table migration", () => {
    it("should create packet_execution_telemetry table with required columns", () => {
      const dbPath = path.join(testDir, "telemetry-table.db");
      setupDb(dbPath);
      const db = getDb();

      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((r: unknown) => (r as { name: string }).name);
      assert.ok(tables.includes("packet_execution_telemetry"), "packet_execution_telemetry table should exist");

      const columns = db
        .prepare("PRAGMA table_info(packet_execution_telemetry)")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      const required = [
        "telemetry_id", "execution_id", "packet_id", "source",
        "telemetry_artifact_path", "opencode_session_id", "provider",
        "model", "model_variant", "input_tokens", "output_tokens",
        "reasoning_tokens", "cache_read_tokens", "cache_write_tokens",
        "cost", "session_created_at", "session_updated_at", "duration_ms",
        "ingestion_mode", "mapping_confidence", "trust_tier",
        "validation_state", "admission_state", "recorded_at",
      ];
      for (const col of required) {
        assert.ok(columns.includes(col), `packet_execution_telemetry.${col} should exist`);
      }
    });
  });

  describe("Telemetry ingestion", () => {
    it("should successfully ingest telemetry from a complete artifact", () => {
      const dbPath = path.join(testDir, "telemetry-ingest-complete.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-005 Complete Telemetry",
        packet_path: "packets/FP-005.md",
        packet_hash: "hash-telemetry-1",
      });

      const execution = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
        trace_id: "trace-telemetry-001",
      });

      const fixturePath = path.resolve("tests/fixtures/opencode-telemetry-complete.json");
      const result = ingestOpenCodeTelemetry({
        packet_id: packet.id,
        execution_id: execution.execution_id,
        telemetry_artifact_path: fixturePath,
        ingestion_mode: "DIRECT_ARTIFACT",
      });

      assert.ok(result.ingested, "Ingestion should succeed");
      assert.ok(result.telemetry, "Telemetry record should be returned");
      assert.equal(result.error, null);

      const t = result.telemetry!;
      assert.equal(t.execution_id, execution.execution_id);
      assert.equal(t.packet_id, packet.id);
      assert.equal(t.source, "OPENCODE_TELEMETRY");
      assert.equal(t.telemetry_artifact_path, fixturePath);
      assert.equal(t.opencode_session_id, "session-abc123-def456");
      assert.equal(t.provider, "openrouter");
      assert.equal(t.model, "deepseek-v4-pro");
      assert.equal(t.model_variant, "high");
      assert.equal(t.input_tokens, 15000);
      assert.equal(t.output_tokens, 8000);
      assert.equal(t.reasoning_tokens, 3200);
      assert.equal(t.cache_read_tokens, 500);
      assert.equal(t.cache_write_tokens, 1200);
      assert.equal(t.cost, 0.452);
      assert.equal(t.session_created_at, "2026-06-15T10:00:00Z");
      assert.equal(t.session_updated_at, "2026-06-15T10:12:30Z");
      assert.equal(t.duration_ms, 750000);
      assert.equal(t.ingestion_mode, "DIRECT_ARTIFACT");
      assert.equal(t.mapping_confidence, "EXPLICIT");
      assert.equal(t.trust_tier, "TIER_2_VERIFIED_ARTIFACT");
      assert.equal(t.validation_state, "VALID");
      assert.equal(t.admission_state, "PENDING");
    });

    it("should persist missing fields as null", () => {
      const dbPath = path.join(testDir, "telemetry-missing-fields.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-005 Missing Fields",
        packet_path: "packets/FP-005.md",
        packet_hash: "hash-telemetry-2",
      });

      const execution = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
      });

      const fixturePath = path.resolve("tests/fixtures/opencode-telemetry-missing-fields.json");
      const result = ingestOpenCodeTelemetry({
        packet_id: packet.id,
        execution_id: execution.execution_id,
        telemetry_artifact_path: fixturePath,
        ingestion_mode: "DIRECT_ARTIFACT",
      });

      assert.ok(result.ingested, "Ingestion should succeed");
      const t = result.telemetry!;

      assert.equal(t.model_variant, null, "model_variant should be null");
      assert.equal(t.output_tokens, null, "output_tokens should be null");
      assert.equal(t.reasoning_tokens, null, "reasoning_tokens should be null");
      assert.equal(t.cache_read_tokens, null, "cache_read_tokens should be null");
      assert.equal(t.cache_write_tokens, null, "cache_write_tokens should be null");
      assert.equal(t.cost, null, "cost should be null");
      assert.equal(t.session_updated_at, null, "updated_at should be null");
      assert.equal(t.duration_ms, null, "duration_ms should be null");
    });

    it("should require explicit packet_id and execution_id mapping", () => {
      const dbPath = path.join(testDir, "telemetry-explicit-mapping.db");
      setupDb(dbPath);

      const result = ingestOpenCodeTelemetry({
        packet_id: 0,
        execution_id: 0,
        telemetry_artifact_path: "nonexistent.json",
        ingestion_mode: "DIRECT_ARTIFACT",
      });

      assert.equal(result.ingested, false);
      assert.ok(result.error, "Should have an error message");

      const packet = recordPacketIntent({
        title: "FP-005 Mapping Test",
        packet_path: "packets/FP-005.md",
        packet_hash: "hash-telemetry-3",
      });

      const resultNoExec = ingestOpenCodeTelemetry({
        packet_id: packet.id,
        execution_id: 99999,
        telemetry_artifact_path: "nonexistent.json",
        ingestion_mode: "DIRECT_ARTIFACT",
      });

      assert.equal(resultNoExec.ingested, false);
      assert.ok(resultNoExec.error, "Should fail when execution_id does not exist");
    });

    it("should reject cross-packet mapping (execution from different packet)", () => {
      const dbPath = path.join(testDir, "telemetry-cross-packet.db");
      setupDb(dbPath);

      const packetA = recordPacketIntent({
        title: "Packet A",
        packet_path: "packets/FP-A.md",
        packet_hash: "hash-a",
      });

      const execA = createExecutionAttempt({
        packet_id: packetA.id,
        attempt_number: 1,
        trace_id: "trace-a",
      });

      const packetB = recordPacketIntent({
        title: "Packet B",
        packet_path: "packets/FP-B.md",
        packet_hash: "hash-b",
      });

      const fixturePath = path.resolve("tests/fixtures/opencode-telemetry-complete.json");
      const result = ingestOpenCodeTelemetry({
        packet_id: packetB.id,
        execution_id: execA.execution_id,
        telemetry_artifact_path: fixturePath,
        ingestion_mode: "DIRECT_ARTIFACT",
      });

      assert.equal(result.ingested, false, "Should reject cross-packet mapping");
      assert.ok(result.error, "Should have an error message");
      assert.match(
        result.error!,
        /not found for packet/,
        "Error should mention packet mismatch"
      );

      const db = getDb();
      const telemetryRows = db
        .prepare("SELECT COUNT(*) as cnt FROM packet_execution_telemetry")
        .get() as { cnt: number };
      assert.equal(telemetryRows.cnt, 0, "No telemetry row should be inserted");
    });

    it("should label retroactive ingestion correctly", () => {
      const dbPath = path.join(testDir, "telemetry-retroactive.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-005 Retroactive Test",
        packet_path: "packets/FP-005.md",
        packet_hash: "hash-telemetry-4",
      });

      const execution = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
      });

      const fixturePath = path.resolve("tests/fixtures/opencode-telemetry-complete.json");
      const result = ingestOpenCodeTelemetry({
        packet_id: packet.id,
        execution_id: execution.execution_id,
        telemetry_artifact_path: fixturePath,
        ingestion_mode: "RETROACTIVE_ARTIFACT",
      });

      assert.ok(result.ingested, "Retroactive ingestion should succeed");
      assert.equal(result.telemetry!.ingestion_mode, "RETROACTIVE_ARTIFACT");
      assert.equal(result.telemetry!.mapping_confidence, "EXPLICIT");
      assert.equal(result.telemetry!.trust_tier, "TIER_2_VERIFIED_ARTIFACT");
      assert.equal(result.telemetry!.admission_state, "PENDING", "Should not auto-admit telemetry");
    });

    it("should record source as OPENCODE_TELEMETRY", () => {
      const dbPath = path.join(testDir, "telemetry-source.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-005 Source Test",
        packet_path: "packets/FP-005.md",
        packet_hash: "hash-telemetry-5",
      });

      const execution = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
      });

      const fixturePath = path.resolve("tests/fixtures/opencode-telemetry-complete.json");
      const result = ingestOpenCodeTelemetry({
        packet_id: packet.id,
        execution_id: execution.execution_id,
        telemetry_artifact_path: fixturePath,
        ingestion_mode: "DIRECT_ARTIFACT",
      });

      assert.equal(result.telemetry!.source, "OPENCODE_TELEMETRY");
    });

    it("should not require network access (local file parsing only)", () => {
      const dbPath = path.join(testDir, "telemetry-no-network.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-005 No Network",
        packet_path: "packets/FP-005.md",
        packet_hash: "hash-telemetry-6",
      });

      const execution = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
      });

      const fixturePath = path.resolve("tests/fixtures/opencode-telemetry-complete.json");
      const result = ingestOpenCodeTelemetry({
        packet_id: packet.id,
        execution_id: execution.execution_id,
        telemetry_artifact_path: fixturePath,
        ingestion_mode: "DIRECT_ARTIFACT",
      });

      assert.ok(result.ingested, "Local file ingestion should work without network");
    });

    it("should allow retrieving telemetry by execution_id", () => {
      const dbPath = path.join(testDir, "telemetry-retrieve-by-exec.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-005 Retrieve Test",
        packet_path: "packets/FP-005.md",
        packet_hash: "hash-telemetry-7",
      });

      const execution = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
      });

      const fixturePath = path.resolve("tests/fixtures/opencode-telemetry-complete.json");
      ingestOpenCodeTelemetry({
        packet_id: packet.id,
        execution_id: execution.execution_id,
        telemetry_artifact_path: fixturePath,
        ingestion_mode: "DIRECT_ARTIFACT",
      });

      const telemetry = getExecutionTelemetry(execution.execution_id);
      assert.equal(telemetry.length, 1);
      assert.equal(telemetry[0].opencode_session_id, "session-abc123-def456");
    });

    it("should allow retrieving telemetry by packet_id", () => {
      const dbPath = path.join(testDir, "telemetry-retrieve-by-pkt.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-005 Packet Retrieve",
        packet_path: "packets/FP-005.md",
        packet_hash: "hash-telemetry-8",
      });

      const execution = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
      });

      const fixturePath = path.resolve("tests/fixtures/opencode-telemetry-complete.json");
      ingestOpenCodeTelemetry({
        packet_id: packet.id,
        execution_id: execution.execution_id,
        telemetry_artifact_path: fixturePath,
        ingestion_mode: "DIRECT_ARTIFACT",
      });

      const telemetry = getPacketTelemetry(packet.id);
      assert.equal(telemetry.length, 1);
      assert.equal(telemetry[0].source, "OPENCODE_TELEMETRY");
    });

    it("should not admit telemetry automatically", () => {
      const dbPath = path.join(testDir, "telemetry-no-auto-admit.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-005 No Auto Admit",
        packet_path: "packets/FP-005.md",
        packet_hash: "hash-telemetry-9",
      });

      const execution = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
      });

      const fixturePath = path.resolve("tests/fixtures/opencode-telemetry-complete.json");
      const result = ingestOpenCodeTelemetry({
        packet_id: packet.id,
        execution_id: execution.execution_id,
        telemetry_artifact_path: fixturePath,
        ingestion_mode: "DIRECT_ARTIFACT",
      });

      assert.equal(result.telemetry!.admission_state, "PENDING", "Telemetry must not be automatically admitted");
    });

    it("should ingest telemetry from a messages-based OpenCode export", () => {
      const dbPath = path.join(testDir, "telemetry-messages.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-005 Messages Test",
        packet_path: "packets/FP-005.md",
        packet_hash: "hash-telemetry-10",
      });

      const execution = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
        trace_id: "trace-messages-001",
      });

      const fixturePath = path.resolve("tests/fixtures/opencode-telemetry-messages.json");
      const result = ingestOpenCodeTelemetry({
        packet_id: packet.id,
        execution_id: execution.execution_id,
        telemetry_artifact_path: fixturePath,
        ingestion_mode: "DIRECT_ARTIFACT",
      });

      assert.ok(result.ingested, "Messages-based ingestion should succeed");
      const t = result.telemetry!;
      assert.equal(t.opencode_session_id, "session-opencode-real-abc123");
      assert.equal(t.provider, "openrouter");
      assert.equal(t.model, "deepseek-v4-pro");
      assert.equal(t.model_variant, "high");
      assert.equal(t.input_tokens, 15000);
      assert.equal(t.output_tokens, 8000);
      assert.equal(t.reasoning_tokens, 3200);
      assert.equal(t.cache_read_tokens, 500);
      assert.equal(t.cache_write_tokens, 1200);
      assert.equal(t.cost, 0.452);
      assert.equal(t.session_created_at, "2026-06-15T10:00:00Z");
      assert.equal(t.session_updated_at, "2026-06-15T10:12:30Z");
      assert.equal(t.duration_ms, null, "duration_ms not present in messages fixture");
      assert.equal(t.source, "OPENCODE_TELEMETRY");
      assert.equal(t.admission_state, "PENDING");
    });

    it("should resolve packet by title and packet_path for string identifiers", () => {
      const dbPath = path.join(testDir, "telemetry-packet-lookup.db");
      setupDb(dbPath);
      const db = getDb();

      recordPacketIntent({
        title: "FP-004 SQLite Persistence",
        packet_path: "packets/FP-004.md",
        packet_hash: "hash-fp004",
      });

      const byPath = db
        .prepare("SELECT id FROM packets WHERE packet_path = ?")
        .get("packets/FP-004.md") as { id: number } | undefined;
      assert.ok(byPath, "Should find packet by packet_path");
      assert.ok(byPath.id > 0);

      const byTitle = db
        .prepare("SELECT id FROM packets WHERE title LIKE ?")
        .get("%FP-004%") as { id: number } | undefined;
      assert.ok(byTitle, "Should find packet by title LIKE");
      assert.equal(byTitle.id, byPath.id);

      const byIdStr = db
        .prepare(
          "SELECT id FROM packets WHERE packet_path = ? OR packet_path LIKE ? OR title = ? OR title LIKE ?"
        )
        .get("packets/FP-004.md", "%FP-004%", "FP-004", "%FP-004%") as { id: number } | undefined;
      assert.ok(byIdStr, "Should find packet matching FP-004 string");
    });
  });

  describe("FP-004 persistence behavior preservation", () => {
    it("should still record packet intent after FP-005 migration", () => {
      const dbPath = path.join(testDir, "fp005-preserve-intent.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-005 Compat Test",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash-fp005",
      });

      assert.ok(packet.id > 0);
      assert.equal(packet.title, "FP-005 Compat Test");
    });

    it("should still append lifecycle events after FP-005 migration", () => {
      const dbPath = path.join(testDir, "fp005-preserve-lifecycle.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-005 Lifecycle Test",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash-fp005-lc",
      });

      const event = appendLifecycleEvent({
        packet_id: packet.id,
        event_type: "PACKET_CREATED",
        lifecycle_state: "CREATED",
        source: "forgepilot",
        actor: "cli",
        reason: "Packet created",
      });

      assert.equal(event.lifecycle_state, "CREATED");

      const events = getPacketLifecycleEvents(packet.id);
      assert.equal(events.length, 1);
    });

    it("should still create and manage execution attempts after FP-005 migration", () => {
      const dbPath = path.join(testDir, "fp005-preserve-exec.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-005 Exec Test",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash-fp005-exec",
      });

      const execution = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
        trace_id: "trace-fp005",
      });

      assert.equal(execution.execution_state, "RUNNING");

      const succeeded = markExecutionSucceeded(execution.execution_id);
      assert.equal(succeeded.execution_state, "SUCCEEDED");

      const executions = getPacketExecutions(packet.id);
      assert.equal(executions.length, 1);
      assert.equal(executions[0].execution_state, "SUCCEEDED");
    });

    it("should still derive current packet state from lifecycle events after FP-005 migration", () => {
      const dbPath = path.join(testDir, "fp005-preserve-state.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-005 State Test",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash-fp005-state",
      });

      appendLifecycleEvent({
        packet_id: packet.id,
        event_type: "PACKET_CREATED",
        lifecycle_state: "CREATED",
        source: "forgepilot",
        actor: "cli",
        reason: "Created",
      });

      appendLifecycleEvent({
        packet_id: packet.id,
        event_type: "PACKET_ADMITTED",
        lifecycle_state: "ADMITTED",
        source: "auditor",
        actor: "model",
        reason: "Admitted",
      });

      const state = getCurrentPacketState(packet.id);
      assert.equal(state!.current_state, "ADMITTED");
    });

    it("should still support multiple execution attempts after FP-005 migration", () => {
      const dbPath = path.join(testDir, "fp005-preserve-multi-exec.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-005 Multi Exec",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash-fp005-multi",
      });

      const attempt1 = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
      });
      markExecutionFailed({
        execution_id: attempt1.execution_id,
        error_code: "EXECUTOR_FAILED",
      });

      const attempt2 = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 2,
      });
      markExecutionSucceeded(attempt2.execution_id);

      const executions = getPacketExecutions(packet.id);
      assert.equal(executions.length, 2);
      assert.equal(executions[0].execution_state, "FAILED");
      assert.equal(executions[1].execution_state, "SUCCEEDED");
    });

    it("should still have stable and queryable error codes after FP-005 migration", () => {
      const dbPath = path.join(testDir, "fp005-preserve-errors.db");
      setupDb(dbPath);
      const db = getDb();

      const packet = recordPacketIntent({
        title: "FP-005 Error Test",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash-fp005-err",
      });

      const execution = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
      });
      markExecutionFailed({
        execution_id: execution.execution_id,
        error_code: "PROVIDER_TIMEOUT",
        error_message: "Timeout occurred",
      });

      const results = db
        .prepare("SELECT * FROM packet_executions WHERE error_code = 'PROVIDER_TIMEOUT'")
        .all() as { error_code: string }[];
      assert.equal(results.length, 1);
      assert.equal(results[0].error_code, "PROVIDER_TIMEOUT");
    });
  });

  describe("Migration idempotence", () => {
    it("should be idempotent after FP-005 migration", () => {
      const dbPath = path.join(testDir, "idempotent-fp005.db");
      closeDb();
      initDb(dbPath);
      migrate();
      migrate();
      migrate();

      const db = getDb();
      const rows = db
        .prepare("SELECT name FROM _migrations WHERE name = '003_fp005_telemetry.sql'")
        .all() as { name: string }[];
      assert.equal(rows.length, 1, "Migration 003 should only be recorded once");

      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'packet_execution_telemetry'")
        .all() as { name: string }[];
      assert.equal(tables.length, 1, "packet_execution_telemetry table should exist");
    });

    it("should not break existing FP-004 tables after FP-005 migration", () => {
      const dbPath = path.join(testDir, "idempotent-all-tables.db");
      closeDb();
      initDb(dbPath);
      migrate();
      migrate();

      const db = getDb();
      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      assert.ok(tables.includes("packets"), "packets table should exist");
      assert.ok(tables.includes("packet_lifecycle_events"), "packet_lifecycle_events table should exist");
      assert.ok(tables.includes("packet_executions"), "packet_executions table should exist");
      assert.ok(tables.includes("packet_execution_telemetry"), "packet_execution_telemetry table should exist");
    });
  });
});
