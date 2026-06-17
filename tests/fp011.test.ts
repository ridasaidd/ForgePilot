import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { initDb, getDb, closeDb } from "../src/db/client.js";
import { migrate } from "../src/db/migrate.js";
import { recordPacketIntent } from "../src/db/persistence.js";
import {
  insertEvidenceRecord,
  getEvidenceByPacketId,
  getEvidenceByRunId,
  getEvidenceRecord,
  parseArtifactPaths,
} from "../src/db/evidence-records.js";
import {
  validateEvidenceRecord,
  recordValidationEvent,
  evaluateAdmissionForRecord,
  recordEvidenceRecordAdmission,
  getCurrentValidationState,
  getCurrentAdmissionState,
  getValidationEvents,
  getAdmissionEventsForRecord,
  getValidationEvent,
  getAdmissionEvent,
} from "../src/db/validation-admission.js";

let testDir: string;

before(() => {
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), "forgepilot-fp011-"));
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

function createTestPacket(title: string = "FP-011 Test Packet") {
  return recordPacketIntent({
    title,
    packet_path: `packets/${title.replace(/\s+/g, "-")}.md`,
    packet_hash: `hash-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  });
}

function createValidEvidence(packetId: number, runId: string) {
  return insertEvidenceRecord({
    packet_id: packetId,
    run_id: runId,
    model_id: "deepseek-v4-pro",
    model_role: "executor",
    branch: "main",
    commit_sha: "abc123def456",
    executor_result: "SUCCESS",
    verification_result: "PASSED",
    audit_result: "ACCEPTED",
    comparison_result: "WIN",
    metrics_path: "runs/FP-011/metrics.json",
    artifact_paths: [
      "runs/FP-011/executor-result.md",
      "runs/FP-011/verification.txt",
    ],
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "NOT_EVALUATED",
  });
}

function createMinimalEvidence(packetId: number, runId: string) {
  return insertEvidenceRecord({
    packet_id: packetId,
    run_id: runId,
  });
}

describe("FP-011: Metrics Validation and Admission Integration", () => {
  describe("Migration", () => {
    it("should be idempotent", () => {
      const dbPath = path.join(testDir, "idempotent-fp011.db");
      closeDb();
      initDb(dbPath);
      migrate();
      migrate();

      const db = getDb();
      const rows = db
        .prepare("SELECT name FROM _migrations WHERE name = ?")
        .all("007_fp011_validation_admission.sql") as { name: string }[];

      assert.equal(rows.length, 1, "Migration 007 should only be recorded once");
    });

    it("should create evidence_record_validation_events table", () => {
      const dbPath = path.join(testDir, "val-table.db");
      setupDb(dbPath);
      const db = getDb();

      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      assert.ok(
        tables.includes("evidence_record_validation_events"),
        "validation events table should exist"
      );

      const columns = db
        .prepare("PRAGMA table_info(evidence_record_validation_events)")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      const required = [
        "id", "evidence_record_id", "validation_state",
        "validation_actor_type", "validation_actor_id", "validation_reason",
        "validation_details", "provenance_complete", "created_at",
      ];
      for (const col of required) {
        assert.ok(columns.includes(col), `validation events table should have ${col}`);
      }
    });

    it("should create evidence_record_admission_events table", () => {
      const dbPath = path.join(testDir, "adm-table.db");
      setupDb(dbPath);
      const db = getDb();

      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      assert.ok(
        tables.includes("evidence_record_admission_events"),
        "admission events table should exist"
      );

      const columns = db
        .prepare("PRAGMA table_info(evidence_record_admission_events)")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      const required = [
        "id", "evidence_record_id", "admission_state",
        "admission_actor_type", "admission_actor_id", "admission_reason",
        "trust_tier_at_admission", "provenance_complete", "created_at",
      ];
      for (const col of required) {
        assert.ok(columns.includes(col), `admission events table should have ${col}`);
      }
    });

    it("should create indexes on both tables", () => {
      const dbPath = path.join(testDir, "indexes.db");
      setupDb(dbPath);
      const db = getDb();

      const indexes = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'index'")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      assert.ok(indexes.includes("idx_val_events_evidence_record"));
      assert.ok(indexes.includes("idx_val_events_created"));
      assert.ok(indexes.includes("idx_adm_events_evidence_record"));
      assert.ok(indexes.includes("idx_adm_events_created"));
    });
  });

  describe("Validation — VALID", () => {
    it("should classify a fully populated evidence record as VALID", () => {
      const dbPath = path.join(testDir, "valid.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Valid");
      const record = createValidEvidence(packet.id, "run-valid-1");

      const result = validateEvidenceRecord(record.evidence_id);
      assert.equal(result.validation_state, "VALID");
      assert.ok(result.validation_reason.includes("All required fields present"));
    });

    it("should record VALID validation event without mutating original record", () => {
      const dbPath = path.join(testDir, "valid-event.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Valid Event");
      const record = createValidEvidence(packet.id, "run-valid-event");

      const originalValidation = record.validation_state;

      const event = recordValidationEvent({
        evidence_record_id: record.evidence_id,
        validation_state: "VALID",
        validation_actor_type: "automated_validator",
        validation_actor_id: "test-suite",
        validation_reason: "All checks passed",
      });

      assert.equal(event.validation_state, "VALID");
      assert.equal(event.evidence_record_id, record.evidence_id);
      assert.ok(event.id > 0);

      // Verify original record is unchanged
      const fresh = getEvidenceRecord(record.evidence_id)!;
      assert.equal(fresh.validation_state, originalValidation);
    });
  });

  describe("Validation — INCOMPLETE", () => {
    it("should classify minimal evidence as INCOMPLETE", () => {
      const dbPath = path.join(testDir, "incomplete.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Incomplete");
      const record = createMinimalEvidence(packet.id, "run-incomplete");

      const result = validateEvidenceRecord(record.evidence_id);
      assert.equal(result.validation_state, "INCOMPLETE");
      assert.ok(result.validation_reason.includes("missing"));
    });

    it("should identify specific missing fields", () => {
      const dbPath = path.join(testDir, "incomplete-details.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Incomplete Details");
      const record = createMinimalEvidence(packet.id, "run-incomplete-details");

      const result = validateEvidenceRecord(record.evidence_id);
      const details = result.validation_details;
      const missingFields = details.missingFields as string[];

      assert.ok(missingFields.includes("model_id"));
      assert.ok(missingFields.includes("model_role"));
      assert.ok(missingFields.includes("commit_sha"));
      assert.ok(missingFields.includes("metrics_path"));
      assert.ok(missingFields.includes("artifact_paths"));
    });

    it("should record INCOMPLETE validation event", () => {
      const dbPath = path.join(testDir, "incomplete-event.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Incomplete Event");
      const record = createMinimalEvidence(packet.id, "run-incomplete-event");

      const event = recordValidationEvent({
        evidence_record_id: record.evidence_id,
        validation_state: "INCOMPLETE",
        validation_actor_type: "automated_validator",
        validation_actor_id: "test-suite",
        validation_reason: "Missing required provenance fields",
        validation_details: { missingFields: ["model_id", "commit_sha"] },
      });

      assert.equal(event.validation_state, "INCOMPLETE");
      assert.equal(event.evidence_record_id, record.evidence_id);
    });
  });

  describe("Validation — INVALID", () => {
    it("should classify evidence with malformed artifact paths as INVALID", () => {
      const dbPath = path.join(testDir, "invalid-artifact.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Invalid Artifact");

      // Insert directly with malformed JSON
      const db = getDb();
      const stmt = db.prepare(
        `INSERT INTO evidence_records (packet_id, run_id, artifact_paths)
         VALUES (?, ?, ?)`
      );
      const result = stmt.run(packet.id, "run-malformed", "{not valid json");

      const res = validateEvidenceRecord(result.lastInsertRowid as number);
      assert.equal(res.validation_state, "INVALID");
      assert.ok(res.validation_reason.includes("malformed JSON"));
    });

    it("should classify evidence with non-array artifact_paths as INVALID", () => {
      const dbPath = path.join(testDir, "invalid-nonarray.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Invalid NonArray");

      const db = getDb();
      const stmt = db.prepare(
        `INSERT INTO evidence_records (packet_id, run_id, artifact_paths)
         VALUES (?, ?, ?)`
      );
      const result = stmt.run(packet.id, "run-nonarray", JSON.stringify({ foo: "bar" }));

      const res = validateEvidenceRecord(result.lastInsertRowid as number);
      assert.equal(res.validation_state, "INVALID");
      assert.ok(res.validation_reason.includes("not an array"));
    });

    it("should classify evidence with VALID but empty required fields as INVALID", () => {
      const dbPath = path.join(testDir, "invalid-contradiction.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Invalid Contradiction");

      const record = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-contradiction",
        validation_state: "VALID",
        model_id: "",  // empty but claims VALID
      });

      const res = validateEvidenceRecord(record.evidence_id);
      assert.equal(res.validation_state, "INVALID");
      assert.ok(res.validation_reason.includes("Impossible state combination"));
    });

    it("should record INVALID validation event", () => {
      const dbPath = path.join(testDir, "invalid-event.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Invalid Event");

      // Insert malformed record
      const db = getDb();
      const stmt = db.prepare(
        `INSERT INTO evidence_records (packet_id, run_id, artifact_paths)
         VALUES (?, ?, ?)`
      );
      const result = stmt.run(packet.id, "run-invalid-event", "{bad");

      const event = recordValidationEvent({
        evidence_record_id: result.lastInsertRowid as number,
        validation_state: "INVALID",
        validation_actor_type: "automated_validator",
        validation_actor_id: "test-suite",
        validation_reason: "Malformed artifact paths",
      });

      assert.equal(event.validation_state, "INVALID");
      assert.equal(event.evidence_record_id, result.lastInsertRowid as number);
    });
  });

  describe("Validation — DEFERRED", () => {
    it("should classify evidence with paths but no results as DEFERRED", () => {
      const dbPath = path.join(testDir, "deferred.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Deferred");

      const record = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-deferred",
        model_id: "deepseek-v4-pro",
        model_role: "executor",
        branch: "main",
        commit_sha: "abc123def456",
        metrics_path: "runs/FP-011/metrics.json",
        artifact_paths: ["runs/FP-011/executor-result.md"],
        executor_result: "",  // not yet available
        verification_result: "",  // not yet available
        audit_result: "",  // not yet available
      });

      const res = validateEvidenceRecord(record.evidence_id);
      assert.equal(res.validation_state, "DEFERRED");
      assert.ok(res.validation_reason.includes("not yet available"));
    });

    it("should show which prerequisites are deferred", () => {
      const dbPath = path.join(testDir, "deferred-details.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Deferred Details");

      const record = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-deferred-details",
        model_id: "deepseek-v4-pro",
        model_role: "executor",
        branch: "main",
        commit_sha: "abc123def456",
        metrics_path: "runs/FP-011/metrics.json",
        artifact_paths: ["runs/FP-011/executor-result.md"],
        executor_result: "",
        verification_result: "",
        audit_result: "",
      });

      const res = validateEvidenceRecord(record.evidence_id);
      const deferredReasons = res.validation_details.deferredReasons as string[];
      assert.ok(deferredReasons.length > 0);
      assert.ok(deferredReasons.some((r) => r.includes("executor_result")));
      assert.ok(deferredReasons.some((r) => r.includes("verification_result")));
    });

    it("should record DEFERRED validation event", () => {
      const dbPath = path.join(testDir, "deferred-event.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Deferred Event");

      const record = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-deferred-event",
        model_id: "deepseek-v4-pro",
        model_role: "executor",
        branch: "main",
        commit_sha: "abc123def456",
        metrics_path: "runs/FP-011/metrics.json",
        artifact_paths: ["runs/FP-011/executor-result.md"],
        executor_result: "",
      });

      const event = recordValidationEvent({
        evidence_record_id: record.evidence_id,
        validation_state: "DEFERRED",
        validation_actor_type: "automated_validator",
        validation_actor_id: "test-suite",
        validation_reason: "Awaiting executor result",
        validation_details: { pendingArtifacts: ["executor-result.md"] },
      });

      assert.equal(event.validation_state, "DEFERRED");
      assert.equal(event.evidence_record_id, record.evidence_id);
    });
  });

  describe("Validation — NOT_EVALUATED rejected", () => {
    it("should reject NOT_EVALUATED as a validation_state in events", () => {
      const dbPath = path.join(testDir, "not-evaluated-val.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 NotEvaluated Val");
      const record = createMinimalEvidence(packet.id, "run-ne-val");

      assert.throws(
        () =>
          recordValidationEvent({
            evidence_record_id: record.evidence_id,
            validation_state: "NOT_EVALUATED",
          }),
        /NOT_EVALUATED is not a valid validation_state/
      );
    });

    it("should reject NOT_EVALUATED in validation via CHECK constraint", () => {
      const dbPath = path.join(testDir, "not-evaluated-check.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 NE Check");
      const record = createMinimalEvidence(packet.id, "run-ne-check");
      const db = getDb();

      assert.throws(
        () =>
          db.prepare(
            `INSERT INTO evidence_record_validation_events (evidence_record_id, validation_state)
             VALUES (?, ?)`
          ).run(record.evidence_id, "NOT_EVALUATED"),
        /CHECK constraint failed/
      );
    });
  });

  describe("Admission — ADMITTED", () => {
    it("should evaluate fully valid evidence as ADMITTED", () => {
      const dbPath = path.join(testDir, "admitted.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Admitted");
      const record = createValidEvidence(packet.id, "run-admitted");

      const result = evaluateAdmissionForRecord(record.evidence_id);
      assert.equal(result.admission_state, "ADMITTED");
      assert.ok(result.admission_reason.includes("Validation is VALID"));
    });

    it("should record ADMITTED admission event", () => {
      const dbPath = path.join(testDir, "admitted-event.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Admitted Event");
      const record = createValidEvidence(packet.id, "run-admitted-event");

      const event = recordEvidenceRecordAdmission({
        evidence_record_id: record.evidence_id,
        admission_state: "ADMITTED",
        admission_actor_type: "automated_validator",
        admission_actor_id: "test-suite",
        admission_reason: "All admission criteria met",
        trust_tier_at_admission: "TIER_2_VERIFIED_ARTIFACT",
      });

      assert.equal(event.admission_state, "ADMITTED");
      assert.equal(event.evidence_record_id, record.evidence_id);
      assert.equal(event.trust_tier_at_admission, "TIER_2_VERIFIED_ARTIFACT");
    });

    it("should not admit evidence with TIER_0_UNTRUSTED trust", () => {
      const dbPath = path.join(testDir, "admitted-tier0.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Admitted Tier0");

      const record = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-tier0",
        model_id: "deepseek-v4-pro",
        model_role: "executor",
        branch: "main",
        commit_sha: "abc123def456",
        executor_result: "SUCCESS",
        verification_result: "PASSED",
        audit_result: "ACCEPTED",
        metrics_path: "runs/FP-011/metrics.json",
        artifact_paths: ["runs/FP-011/executor-result.md"],
        trust_tier: "TIER_0_UNTRUSTED",
        validation_state: "VALID",
      });

      const result = evaluateAdmissionForRecord(record.evidence_id);
      assert.equal(result.admission_state, "PENDING");
      assert.ok(result.admission_reason.includes("insufficient"));
    });
  });

  describe("Admission — REJECTED", () => {
    it("should evaluate INVALID evidence as REJECTED", () => {
      const dbPath = path.join(testDir, "rejected.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Rejected");

      const record = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-rejected",
        validation_state: "INVALID",
      });

      const result = evaluateAdmissionForRecord(record.evidence_id);
      assert.equal(result.admission_state, "REJECTED");
    });

    it("should record REJECTED admission event", () => {
      const dbPath = path.join(testDir, "rejected-event.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Rejected Event");

      const record = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-rejected-event",
      });

      // Record a validation event as INVALID first
      recordValidationEvent({
        evidence_record_id: record.evidence_id,
        validation_state: "INVALID",
        validation_actor_type: "automated_validator",
        validation_actor_id: "test-suite",
        validation_reason: "Structural issues found",
      });

      const event = recordEvidenceRecordAdmission({
        evidence_record_id: record.evidence_id,
        admission_state: "REJECTED",
        admission_actor_type: "automated_validator",
        admission_actor_id: "test-suite",
        admission_reason: "Validation is INVALID",
      });

      assert.equal(event.admission_state, "REJECTED");
    });
  });

  describe("Admission — PENDING", () => {
    it("should evaluate INCOMPLETE evidence as PENDING", () => {
      const dbPath = path.join(testDir, "pending-incomplete.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Pending Incomplete");
      const record = createMinimalEvidence(packet.id, "run-pending-inc");

      const result = evaluateAdmissionForRecord(record.evidence_id);
      assert.equal(result.admission_state, "PENDING");
    });

    it("should evaluate DEFERRED evidence as PENDING", () => {
      const dbPath = path.join(testDir, "pending-deferred.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Pending Deferred");

      const record = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-pending-def",
        model_id: "deepseek-v4-pro",
        model_role: "executor",
        branch: "main",
        commit_sha: "abc123def456",
        metrics_path: "runs/FP-011/metrics.json",
        artifact_paths: ["runs/FP-011/executor-result.md"],
        executor_result: "",
      });

      const result = evaluateAdmissionForRecord(record.evidence_id);
      assert.equal(result.admission_state, "PENDING");
    });

    it("should record PENDING admission event", () => {
      const dbPath = path.join(testDir, "pending-event.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Pending Event");
      const record = createMinimalEvidence(packet.id, "run-pending-event");

      const event = recordEvidenceRecordAdmission({
        evidence_record_id: record.evidence_id,
        admission_state: "PENDING",
        admission_actor_type: "human_auditor",
        admission_actor_id: "auditor-1",
        admission_reason: "Awaiting human review",
      });

      assert.equal(event.admission_state, "PENDING");
      assert.equal(event.admission_actor_type, "human_auditor");
    });
  });

  describe("Admission — QUARANTINED", () => {
    it("should evaluate previously admitted evidence with invalidated validation as QUARANTINED", () => {
      const dbPath = path.join(testDir, "quarantined.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Quarantined");
      const record = createValidEvidence(packet.id, "run-quarantined");

      // First admit
      recordEvidenceRecordAdmission({
        evidence_record_id: record.evidence_id,
        admission_state: "ADMITTED",
        admission_actor_type: "automated_validator",
        admission_actor_id: "test-suite",
        admission_reason: "Initial admission",
      });

      // Then invalidate the validation
      recordValidationEvent({
        evidence_record_id: record.evidence_id,
        validation_state: "INVALID",
        validation_actor_type: "human_auditor",
        validation_actor_id: "auditor-1",
        validation_reason: "Provenance compromised",
      });

      const result = evaluateAdmissionForRecord(record.evidence_id);
      assert.equal(result.admission_state, "QUARANTINED");
      assert.ok(result.admission_reason.includes("Previously admitted"));
    });

    it("should record QUARANTINED admission event", () => {
      const dbPath = path.join(testDir, "quarantined-event.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Quarantined Event");
      const record = createValidEvidence(packet.id, "run-quarantined-event");

      const event = recordEvidenceRecordAdmission({
        evidence_record_id: record.evidence_id,
        admission_state: "QUARANTINED",
        admission_actor_type: "human_auditor",
        admission_actor_id: "auditor-1",
        admission_reason: "Artifact integrity later contradicted",
      });

      assert.equal(event.admission_state, "QUARANTINED");
      assert.equal(event.evidence_record_id, record.evidence_id);
    });

    it("should support full lifecycle: admit → invalidate → quarantine without deleting prior events", () => {
      const dbPath = path.join(testDir, "lifecycle.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Lifecycle");
      const record = createValidEvidence(packet.id, "run-lifecycle");

      // Step 1: Validate as VALID
      const valEvent1 = recordValidationEvent({
        evidence_record_id: record.evidence_id,
        validation_state: "VALID",
        validation_actor_type: "automated_validator",
        validation_actor_id: "test-suite",
        validation_reason: "Initial validation passed",
      });

      // Step 2: Admit
      const admEvent1 = recordEvidenceRecordAdmission({
        evidence_record_id: record.evidence_id,
        admission_state: "ADMITTED",
        admission_actor_type: "automated_validator",
        admission_actor_id: "test-suite",
        admission_reason: "All criteria met",
      });

      // Step 3: Invalidate validation
      const valEvent2 = recordValidationEvent({
        evidence_record_id: record.evidence_id,
        validation_state: "INVALID",
        validation_actor_type: "human_auditor",
        validation_actor_id: "auditor-1",
        validation_reason: "Provenance compromised",
      });

      // Step 4: Quarantine
      const admEvent2 = recordEvidenceRecordAdmission({
        evidence_record_id: record.evidence_id,
        admission_state: "QUARANTINED",
        admission_actor_type: "human_auditor",
        admission_actor_id: "auditor-1",
        admission_reason: "Previously admitted but now invalidated",
      });

      // All 4 events should exist
      const valEvents = getValidationEvents(record.evidence_id);
      assert.equal(valEvents.length, 2);
      assert.equal(valEvents[0].validation_state, "VALID");
      assert.equal(valEvents[1].validation_state, "INVALID");

      const admEvents = getAdmissionEventsForRecord(record.evidence_id);
      assert.equal(admEvents.length, 2);
      assert.equal(admEvents[0].admission_state, "ADMITTED");
      assert.equal(admEvents[1].admission_state, "QUARANTINED");

      // Current states should reflect latest
      const currentVal = getCurrentValidationState(record.evidence_id)!;
      assert.equal(currentVal.validation_state, "INVALID");

      const currentAdm = getCurrentAdmissionState(record.evidence_id)!;
      assert.equal(currentAdm.admission_state, "QUARANTINED");

      // Original record is unchanged
      const fresh = getEvidenceRecord(record.evidence_id)!;
      assert.equal(fresh.validation_state, "VALID");
      assert.equal(fresh.admission_state, "NOT_EVALUATED");
    });
  });

  describe("Admission — NOT_EVALUATED accepted", () => {
    it("should accept NOT_EVALUATED as a valid admission_state in events", () => {
      const dbPath = path.join(testDir, "not-evaluated-adm.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 NE Adm");
      const record = createMinimalEvidence(packet.id, "run-ne-adm");

      const event = recordEvidenceRecordAdmission({
        evidence_record_id: record.evidence_id,
        admission_state: "NOT_EVALUATED",
        admission_actor_type: "system",
        admission_actor_id: "init",
        admission_reason: "No evaluation has been performed yet",
      });

      assert.equal(event.admission_state, "NOT_EVALUATED");
      assert.equal(event.evidence_record_id, record.evidence_id);
    });

    it("should default admission state to NOT_EVALUATED in evidence records", () => {
      const dbPath = path.join(testDir, "not-evaluated-default.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 NE Default");
      const record = createMinimalEvidence(packet.id, "run-ne-default");

      assert.equal(record.admission_state, "NOT_EVALUATED");
    });
  });

  describe("Append-Only Behavior", () => {
    it("should not mutate original evidence record when recording validation events", () => {
      const dbPath = path.join(testDir, "append-val.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Append Val");
      const record = createValidEvidence(packet.id, "run-append-val");

      const originalJson = JSON.stringify(record);

      // Record multiple validation events
      recordValidationEvent({
        evidence_record_id: record.evidence_id,
        validation_state: "VALID",
        validation_actor_type: "automated_validator",
        validation_actor_id: "test-suite",
        validation_reason: "First validation",
      });

      recordValidationEvent({
        evidence_record_id: record.evidence_id,
        validation_state: "INCOMPLETE",
        validation_actor_type: "human_auditor",
        validation_actor_id: "auditor-1",
        validation_reason: "Missing some data on review",
      });

      recordValidationEvent({
        evidence_record_id: record.evidence_id,
        validation_state: "INVALID",
        validation_actor_type: "model_reviewer",
        validation_actor_id: "model-x",
        validation_reason: "Provenance issue found",
      });

      // Original record should be completely unchanged
      const fresh = getEvidenceRecord(record.evidence_id)!;
      const freshJson = JSON.stringify(fresh);
      assert.equal(freshJson, originalJson, "Original evidence record must not be mutated");
    });

    it("should not mutate original evidence record when recording admission events", () => {
      const dbPath = path.join(testDir, "append-adm.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Append Adm");
      const record = createValidEvidence(packet.id, "run-append-adm");

      const originalJson = JSON.stringify(record);

      // Record multiple admission events
      recordEvidenceRecordAdmission({
        evidence_record_id: record.evidence_id,
        admission_state: "PENDING",
        admission_actor_type: "system",
        admission_actor_id: "auto",
        admission_reason: "First evaluation",
      });

      recordEvidenceRecordAdmission({
        evidence_record_id: record.evidence_id,
        admission_state: "ADMITTED",
        admission_actor_type: "human_auditor",
        admission_actor_id: "auditor-1",
        admission_reason: "Approved after review",
      });

      recordEvidenceRecordAdmission({
        evidence_record_id: record.evidence_id,
        admission_state: "QUARANTINED",
        admission_actor_type: "human_auditor",
        admission_actor_id: "auditor-2",
        admission_reason: "Later found issues",
      });

      // Original record unchanged
      const fresh = getEvidenceRecord(record.evidence_id)!;
      const freshJson = JSON.stringify(fresh);
      assert.equal(freshJson, originalJson, "Original evidence record must not be mutated");
    });

    it("should accumulate multiple validation events in order", () => {
      const dbPath = path.join(testDir, "append-order.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Append Order");
      const record = createMinimalEvidence(packet.id, "run-order");

      const states = ["INCOMPLETE", "DEFERRED", "VALID", "INVALID"];
      for (const state of states) {
        recordValidationEvent({
          evidence_record_id: record.evidence_id,
          validation_state: state,
          validation_actor_type: "system",
          validation_actor_id: "test-suite",
          validation_reason: `State: ${state}`,
        });
      }

      const events = getValidationEvents(record.evidence_id);
      assert.equal(events.length, 4);
      assert.equal(events[0].validation_state, "INCOMPLETE");
      assert.equal(events[1].validation_state, "DEFERRED");
      assert.equal(events[2].validation_state, "VALID");
      assert.equal(events[3].validation_state, "INVALID");

      // Current state is the last one
      const current = getCurrentValidationState(record.evidence_id)!;
      assert.equal(current.validation_state, "INVALID");
    });

    it("should derive current state from latest event, not from original record", () => {
      const dbPath = path.join(testDir, "derive-state.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Derive State");

      // Create with INCOMPLETE validation
      const record = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-derive",
        validation_state: "INCOMPLETE",
      });

      // Record a VALID validation event
      recordValidationEvent({
        evidence_record_id: record.evidence_id,
        validation_state: "VALID",
        validation_actor_type: "automated_validator",
        validation_actor_id: "test-suite",
        validation_reason: "Validated after data completion",
      });

      // Current validation comes from event, not original record
      const current = getCurrentValidationState(record.evidence_id)!;
      assert.equal(current.validation_state, "VALID");

      // Original record still says INCOMPLETE
      const fresh = getEvidenceRecord(record.evidence_id)!;
      assert.equal(fresh.validation_state, "INCOMPLETE");
    });
  });

  describe("State Axes Independence", () => {
    it("should keep trust_tier, validation_state, and admission_state as independent axes", () => {
      const dbPath = path.join(testDir, "axes-independence.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Axes");

      // Create record with all three axes set to very different states
      const record = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-axes-1",
        trust_tier: "TIER_3_REPRODUCIBLE",
        validation_state: "DEFERRED",
        admission_state: "QUARANTINED",
      });

      assert.equal(record.trust_tier, "TIER_3_REPRODUCIBLE");
      assert.equal(record.validation_state, "DEFERRED");
      assert.equal(record.admission_state, "QUARANTINED");

      // Different combination
      const record2 = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-axes-2",
        trust_tier: "TIER_1_SELF_REPORTED",
        validation_state: "VALID",
        admission_state: "ADMITTED",
      });

      assert.equal(record2.trust_tier, "TIER_1_SELF_REPORTED");
      assert.equal(record2.validation_state, "VALID");
      assert.equal(record2.admission_state, "ADMITTED");

      // Third combination
      const record3 = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-axes-3",
        trust_tier: "TIER_0_UNTRUSTED",
        validation_state: "INCOMPLETE",
        admission_state: "NOT_EVALUATED",
      });

      assert.equal(record3.trust_tier, "TIER_0_UNTRUSTED");
      assert.equal(record3.validation_state, "INCOMPLETE");
      assert.equal(record3.admission_state, "NOT_EVALUATED");
    });

    it("should allow any combination of valid axes states", () => {
      const dbPath = path.join(testDir, "axes-combos.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Axes Combos");

      const trustTiers = ["TIER_0_UNTRUSTED", "TIER_1_SELF_REPORTED", "TIER_2_VERIFIED_ARTIFACT", "TIER_3_REPRODUCIBLE"];
      const validationStates = ["VALID", "INVALID", "INCOMPLETE", "DEFERRED"];
      const admissionStates = ["NOT_EVALUATED", "REJECTED", "PENDING", "ADMITTED", "QUARANTINED"];

      let count = 0;
      for (let t = 0; t < trustTiers.length; t++) {
        for (let v = 0; v < validationStates.length; v++) {
          for (let a = 0; a < admissionStates.length; a++) {
            insertEvidenceRecord({
              packet_id: packet.id,
              run_id: `run-combo-${count}`,
              trust_tier: trustTiers[t],
              validation_state: validationStates[v],
              admission_state: admissionStates[a],
            });
            count++;
          }
        }
      }

      // 4 * 4 * 5 = 80 combinations, all should succeed
      const records = getEvidenceByPacketId(packet.id);
      assert.equal(records.length, 80);
    });
  });

  describe("Provenance in Validation/Admission Events", () => {
    it("should track provenance in validation events", () => {
      const dbPath = path.join(testDir, "prov-val.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Prov Val");
      const record = createMinimalEvidence(packet.id, "run-prov-val");

      const event = recordValidationEvent({
        evidence_record_id: record.evidence_id,
        validation_state: "VALID",
        validation_actor_type: "automated_validator",
        validation_actor_id: "ci-pipeline-42",
        validation_reason: "Automated validation at commit abc123",
        validation_details: {
          validatorVersion: "1.2.3",
          rulesApplied: ["identity_check", "artifact_check", "state_check"],
          timestamp: new Date().toISOString(),
        },
        provenance_complete: true,
      });

      assert.equal(event.validation_actor_type, "automated_validator");
      assert.equal(event.validation_actor_id, "ci-pipeline-42");
      assert.equal(event.provenance_complete, 1);

      // Verify details stored correctly
      const details = JSON.parse(event.validation_details);
      assert.equal(details.validatorVersion, "1.2.3");
      assert.ok(Array.isArray(details.rulesApplied));
    });

    it("should track provenance in admission events", () => {
      const dbPath = path.join(testDir, "prov-adm.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Prov Adm");
      const record = createMinimalEvidence(packet.id, "run-prov-adm");

      const event = recordEvidenceRecordAdmission({
        evidence_record_id: record.evidence_id,
        admission_state: "ADMITTED",
        admission_actor_type: "human_auditor",
        admission_actor_id: "auditor-alice",
        admission_reason: "Manual review completed - all checks passed",
        trust_tier_at_admission: "TIER_2_VERIFIED_ARTIFACT",
        provenance_complete: true,
      });

      assert.equal(event.admission_actor_type, "human_auditor");
      assert.equal(event.admission_actor_id, "auditor-alice");
      assert.equal(event.trust_tier_at_admission, "TIER_2_VERIFIED_ARTIFACT");
      assert.equal(event.provenance_complete, 1);
      assert.ok(event.created_at, "Should have creation timestamp");
    });
  });

  describe("Retrieval Functions", () => {
    it("should retrieve validation events by evidence_record_id", () => {
      const dbPath = path.join(testDir, "retrieve-val.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Retrieve Val");
      const record = createMinimalEvidence(packet.id, "run-retrieve-val");

      recordValidationEvent({
        evidence_record_id: record.evidence_id,
        validation_state: "VALID",
        validation_actor_type: "automated_validator",
        validation_actor_id: "test-1",
        validation_reason: "First",
      });
      recordValidationEvent({
        evidence_record_id: record.evidence_id,
        validation_state: "INCOMPLETE",
        validation_actor_type: "automated_validator",
        validation_actor_id: "test-2",
        validation_reason: "Second",
      });

      const events = getValidationEvents(record.evidence_id);
      assert.equal(events.length, 2);
      assert.equal(events[0].validation_actor_id, "test-1");
      assert.equal(events[1].validation_actor_id, "test-2");
    });

    it("should retrieve admission events by evidence_record_id", () => {
      const dbPath = path.join(testDir, "retrieve-adm.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Retrieve Adm");
      const record = createMinimalEvidence(packet.id, "run-retrieve-adm");

      recordEvidenceRecordAdmission({
        evidence_record_id: record.evidence_id,
        admission_state: "PENDING",
        admission_actor_type: "system",
        admission_actor_id: "auto",
        admission_reason: "Pending review",
      });
      recordEvidenceRecordAdmission({
        evidence_record_id: record.evidence_id,
        admission_state: "ADMITTED",
        admission_actor_type: "human_auditor",
        admission_actor_id: "auditor-1",
        admission_reason: "Approved",
      });

      const events = getAdmissionEventsForRecord(record.evidence_id);
      assert.equal(events.length, 2);
      assert.equal(events[0].admission_state, "PENDING");
      assert.equal(events[1].admission_state, "ADMITTED");
    });

    it("should retrieve single events by id", () => {
      const dbPath = path.join(testDir, "retrieve-single.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Retrieve Single");

      const record = createMinimalEvidence(packet.id, "run-single-val");
      const valEvent = recordValidationEvent({
        evidence_record_id: record.evidence_id,
        validation_state: "VALID",
        validation_actor_type: "system",
        validation_actor_id: "test",
        validation_reason: "Test",
      });

      const found = getValidationEvent(valEvent.id);
      assert.ok(found);
      assert.equal(found!.id, valEvent.id);

      const missing = getValidationEvent(99999);
      assert.equal(missing, undefined);
    });

    it("should retrieve single admission events by id", () => {
      const dbPath = path.join(testDir, "retrieve-single-adm.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Retrieve Single Adm");

      const record = createMinimalEvidence(packet.id, "run-single-adm");
      const admEvent = recordEvidenceRecordAdmission({
        evidence_record_id: record.evidence_id,
        admission_state: "PENDING",
        admission_actor_type: "system",
        admission_actor_id: "test",
        admission_reason: "Test",
      });

      const found = getAdmissionEvent(admEvent.id);
      assert.ok(found);
      assert.equal(found!.id, admEvent.id);
    });

    it("should return null for non-existent evidence record in state queries", () => {
      const dbPath = path.join(testDir, "nonexistent-state.db");
      setupDb(dbPath);

      const valState = getCurrentValidationState(99999);
      assert.equal(valState, null);

      const admState = getCurrentAdmissionState(99999);
      assert.equal(admState, null);
    });

    it("should return empty arrays for evidence with no events", () => {
      const dbPath = path.join(testDir, "empty-events.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Empty Events");
      const record = createMinimalEvidence(packet.id, "run-no-events");

      assert.equal(getValidationEvents(record.evidence_id).length, 0);
      assert.equal(getAdmissionEventsForRecord(record.evidence_id).length, 0);
      assert.equal(getCurrentValidationState(record.evidence_id), null);
      assert.equal(getCurrentAdmissionState(record.evidence_id), null);
    });
  });

  describe("Validation Event Record Constraints", () => {
    it("should require evidence_record_id", () => {
      const dbPath = path.join(testDir, "require-id.db");
      setupDb(dbPath);

      assert.throws(
        () =>
          recordValidationEvent({
            evidence_record_id: 0,
            validation_state: "VALID",
          }),
        /evidence_record_id is required/
      );
    });

    it("should require evidence record to exist", () => {
      const dbPath = path.join(testDir, "record-exists.db");
      setupDb(dbPath);

      assert.throws(
        () =>
          recordValidationEvent({
            evidence_record_id: 99999,
            validation_state: "VALID",
          }),
        /Evidence record 99999 not found/
      );
    });

    it("should require valid validation_state", () => {
      const dbPath = path.join(testDir, "valid-state.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Valid State");
      const record = createMinimalEvidence(packet.id, "run-state");

      assert.throws(
        () =>
          recordValidationEvent({
            evidence_record_id: record.evidence_id,
            validation_state: "UNKNOWN",
          }),
        /Invalid validation_state/
      );
    });

    it("should require valid actor type", () => {
      const dbPath = path.join(testDir, "valid-actor.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Valid Actor");
      const record = createMinimalEvidence(packet.id, "run-actor");

      assert.throws(
        () =>
          recordValidationEvent({
            evidence_record_id: record.evidence_id,
            validation_state: "VALID",
            validation_actor_type: "invalid_actor",
          }),
        /Invalid validation_actor_type/
      );
    });
  });

  describe("Admission Event Record Constraints", () => {
    it("should require evidence_record_id", () => {
      const dbPath = path.join(testDir, "adm-req-id.db");
      setupDb(dbPath);

      assert.throws(
        () =>
          recordEvidenceRecordAdmission({
            evidence_record_id: 0,
            admission_state: "PENDING",
          }),
        /evidence_record_id is required/
      );
    });

    it("should require evidence record to exist", () => {
      const dbPath = path.join(testDir, "adm-record-exists.db");
      setupDb(dbPath);

      assert.throws(
        () =>
          recordEvidenceRecordAdmission({
            evidence_record_id: 99999,
            admission_state: "PENDING",
          }),
        /Evidence record 99999 not found/
      );
    });

    it("should require valid admission_state", () => {
      const dbPath = path.join(testDir, "adm-valid-state.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Adm Valid State");
      const record = createMinimalEvidence(packet.id, "run-adm-state");

      assert.throws(
        () =>
          recordEvidenceRecordAdmission({
            evidence_record_id: record.evidence_id,
            admission_state: "INVALID_STATE",
          }),
        /Invalid admission_state/
      );
    });

    it("should require valid trust_tier_at_admission when provided", () => {
      const dbPath = path.join(testDir, "adm-valid-tier.db");
      setupDb(dbPath);
      const packet = createTestPacket("FP-011 Adm Tier");
      const record = createMinimalEvidence(packet.id, "run-adm-tier");

      assert.throws(
        () =>
          recordEvidenceRecordAdmission({
            evidence_record_id: record.evidence_id,
            admission_state: "PENDING",
            trust_tier_at_admission: "INVALID_TIER",
          }),
        /Invalid trust_tier_at_admission/
      );
    });
  });

  describe("validateEvidenceRecord Error Cases", () => {
    it("should throw for non-existent evidence record", () => {
      const dbPath = path.join(testDir, "val-missing.db");
      setupDb(dbPath);

      assert.throws(
        () => validateEvidenceRecord(99999),
        /Evidence record 99999 not found/
      );
    });
  });

  describe("evaluateAdmissionForRecord Error Cases", () => {
    it("should throw for non-existent evidence record", () => {
      const dbPath = path.join(testDir, "eval-missing.db");
      setupDb(dbPath);

      assert.throws(
        () => evaluateAdmissionForRecord(99999),
        /Evidence record 99999 not found/
      );
    });
  });

  describe("Existing Behavior Preservation (FP-004, FP-005, FP-008, FP-009, FP-010)", () => {
    it("should not affect FP-004 packet persistence", () => {
      const dbPath = path.join(testDir, "preserve-fp004.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-011 Preserve FP-004",
        packet_path: "packets/test.md",
        packet_hash: "hash-123",
      });

      assert.ok(packet.id > 0);
      assert.equal(packet.title, "FP-011 Preserve FP-004");
    });

    it("should not affect FP-010 evidence_records table", () => {
      const dbPath = path.join(testDir, "preserve-fp010.db");
      setupDb(dbPath);

      const packet = createTestPacket("FP-011 Preserve FP-010");
      const record = createValidEvidence(packet.id, "run-preserve-010");

      assert.ok(record.evidence_id > 0);
      assert.equal(record.model_id, "deepseek-v4-pro");

      const retrieved = getEvidenceByPacketId(packet.id);
      assert.equal(retrieved.length, 1);
      assert.equal(retrieved[0].run_id, "run-preserve-010");
    });

    it("should have FP-009 and FP-010 tables alongside FP-011 tables", () => {
      const dbPath = path.join(testDir, "preserve-all.db");
      setupDb(dbPath);
      const db = getDb();

      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      assert.ok(tables.includes("evidence_admission_events"), "FP-009 table should exist");
      assert.ok(tables.includes("admission_review_requests"), "FP-009 table should exist");
      assert.ok(tables.includes("admission_invalidation_events"), "FP-009 table should exist");
      assert.ok(tables.includes("evidence_records"), "FP-010 table should exist");
      assert.ok(tables.includes("evidence_record_validation_events"), "FP-011 table should exist");
      assert.ok(tables.includes("evidence_record_admission_events"), "FP-011 table should exist");
      assert.ok(tables.includes("packets"), "FP-004 table should exist");
      assert.ok(tables.includes("packet_lifecycle_events"), "FP-004 table should exist");
      assert.ok(tables.includes("packet_execution_telemetry"), "FP-005 table should exist");
      assert.ok(tables.includes("packet_classification_observations"), "FP-008 table should exist");
      assert.ok(tables.includes("model_outcome_observations"), "FP-008 table should exist");
    });

    it("should not add routing, ranking, or leaderboard functionality", () => {
      const dbPath = path.join(testDir, "no-routing.db");
      setupDb(dbPath);
      const db = getDb();

      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      // Verify none of the out-of-scope tables exist
      const excluded = [
        "model_routing_decisions",
        "model_rankings",
        "leaderboards",
        "task_classifications",
        "cost_optimization",
        "model_recommendations",
        "model_comparison_matrices",
        "dashboards",
        "observatory_reports",
      ];
      for (const name of excluded) {
        assert.ok(!tables.includes(name), `Should not have ${name} table`);
      }
    });
  });

  describe("Acceptance Criteria Verification", () => {
    it("AC1: Validation logic exists for FP-010 evidence records", () => {
      const dbPath = path.join(testDir, "ac1.db");
      setupDb(dbPath);
      const packet = createTestPacket("AC1");
      const record = createValidEvidence(packet.id, "ac1-run");

      const result = validateEvidenceRecord(record.evidence_id);
      assert.equal(result.validation_state, "VALID");
    });

    it("AC2: Admission integration exists for FP-010 evidence records", () => {
      const dbPath = path.join(testDir, "ac2.db");
      setupDb(dbPath);
      const packet = createTestPacket("AC2");
      const record = createValidEvidence(packet.id, "ac2-run");

      const result = evaluateAdmissionForRecord(record.evidence_id);
      assert.ok(
        ["ADMITTED", "REJECTED", "PENDING", "QUARANTINED"].includes(result.admission_state)
      );
    });

    it("AC3: Validation and admission do not mutate original evidence records", () => {
      const dbPath = path.join(testDir, "ac3.db");
      setupDb(dbPath);
      const packet = createTestPacket("AC3");
      const record = createValidEvidence(packet.id, "ac3-run");
      const original = JSON.stringify(record);

      validateEvidenceRecord(record.evidence_id);
      recordValidationEvent({
        evidence_record_id: record.evidence_id,
        validation_state: "INCOMPLETE",
        validation_actor_type: "system",
        validation_reason: "Changed",
      });
      evaluateAdmissionForRecord(record.evidence_id);
      recordEvidenceRecordAdmission({
        evidence_record_id: record.evidence_id,
        admission_state: "REJECTED",
        admission_reason: "Rejected",
      });

      const fresh = JSON.stringify(getEvidenceRecord(record.evidence_id)!);
      assert.equal(fresh, original);
    });

    it("AC4: Trust tier, validation state, and admission state remain independent axes", () => {
      const dbPath = path.join(testDir, "ac4.db");
      setupDb(dbPath);
      const packet = createTestPacket("AC4");

      const record = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "ac4-run",
        trust_tier: "TIER_3_REPRODUCIBLE",
        validation_state: "DEFERRED",
        admission_state: "QUARANTINED",
      });

      assert.equal(record.trust_tier, "TIER_3_REPRODUCIBLE");
      assert.equal(record.validation_state, "DEFERRED");
      assert.equal(record.admission_state, "QUARANTINED");
    });

    it("AC5: NOT_EVALUATED is not accepted as a validation state", () => {
      const dbPath = path.join(testDir, "ac5.db");
      setupDb(dbPath);
      const packet = createTestPacket("AC5");
      const record = createMinimalEvidence(packet.id, "ac5-run");

      assert.throws(
        () =>
          recordValidationEvent({
            evidence_record_id: record.evidence_id,
            validation_state: "NOT_EVALUATED",
          }),
        /NOT_EVALUATED is not a valid validation_state/
      );
    });

    it("AC6: NOT_EVALUATED remains valid as an admission state", () => {
      const dbPath = path.join(testDir, "ac6.db");
      setupDb(dbPath);
      const packet = createTestPacket("AC6");
      const record = createMinimalEvidence(packet.id, "ac6-run");

      const event = recordEvidenceRecordAdmission({
        evidence_record_id: record.evidence_id,
        admission_state: "NOT_EVALUATED",
        admission_reason: "Not yet evaluated",
      });

      assert.equal(event.admission_state, "NOT_EVALUATED");
    });

    it("AC7-10: All four validation states detectable", () => {
      const dbPath = path.join(testDir, "ac7-10.db");
      setupDb(dbPath);
      const packet = createTestPacket("AC7-10");

      // VALID
      const validRecord = createValidEvidence(packet.id, "ac7-run");
      assert.equal(validateEvidenceRecord(validRecord.evidence_id).validation_state, "VALID");

      // INCOMPLETE
      const incompleteRecord = createMinimalEvidence(packet.id, "ac8-run");
      assert.equal(validateEvidenceRecord(incompleteRecord.evidence_id).validation_state, "INCOMPLETE");

      // INVALID
      const db = getDb();
      const stmt = db.prepare(
        "INSERT INTO evidence_records (packet_id, run_id, artifact_paths) VALUES (?, ?, ?)"
      );
      const invalidRes = stmt.run(packet.id, "ac9-run", "{bad json");
      assert.equal(validateEvidenceRecord(invalidRes.lastInsertRowid as number).validation_state, "INVALID");

      // DEFERRED
      const deferredRecord = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "ac10-run",
        model_id: "test-model",
        model_role: "executor",
        branch: "main",
        commit_sha: "abc123",
        metrics_path: "runs/test/metrics.json",
        artifact_paths: ["runs/test/output.md"],
        executor_result: "",
        verification_result: "",
        audit_result: "",
      });
      assert.equal(validateEvidenceRecord(deferredRecord.evidence_id).validation_state, "DEFERRED");
    });

    it("AC11-13: All five admission states detectable", () => {
      const dbPath = path.join(testDir, "ac11-13.db");
      setupDb(dbPath);
      const packet = createTestPacket("AC11-13");

      // ADMITTED
      const admittedRecord = createValidEvidence(packet.id, "ac11-run");
      assert.equal(evaluateAdmissionForRecord(admittedRecord.evidence_id).admission_state, "ADMITTED");

      // REJECTED
      const rejectedRecord = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "ac12-run",
        validation_state: "INVALID",
      });
      assert.equal(evaluateAdmissionForRecord(rejectedRecord.evidence_id).admission_state, "REJECTED");

      // PENDING
      const pendingRecord = createMinimalEvidence(packet.id, "ac13-pending");
      assert.equal(evaluateAdmissionForRecord(pendingRecord.evidence_id).admission_state, "PENDING");

      // QUARANTINED
      const quarantinedRecord = createValidEvidence(packet.id, "ac13-quar");
      recordEvidenceRecordAdmission({
        evidence_record_id: quarantinedRecord.evidence_id,
        admission_state: "ADMITTED",
        admission_reason: "Was admitted",
      });
      recordValidationEvent({
        evidence_record_id: quarantinedRecord.evidence_id,
        validation_state: "INVALID",
        validation_reason: "Invalidated",
      });
      assert.equal(evaluateAdmissionForRecord(quarantinedRecord.evidence_id).admission_state, "QUARANTINED");

      // NOT_EVALUATED (via event)
      const neRecord = createMinimalEvidence(packet.id, "ac13-ne");
      const neEvent = recordEvidenceRecordAdmission({
        evidence_record_id: neRecord.evidence_id,
        admission_state: "NOT_EVALUATED",
        admission_reason: "Not yet",
      });
      assert.equal(neEvent.admission_state, "NOT_EVALUATED");
    });

    it("AC14: Append-only behavior verified", () => {
      const dbPath = path.join(testDir, "ac14.db");
      setupDb(dbPath);
      const packet = createTestPacket("AC14");
      const record = createValidEvidence(packet.id, "ac14-run");
      const original = JSON.stringify(record);

      recordValidationEvent({
        evidence_record_id: record.evidence_id,
        validation_state: "INVALID",
        validation_actor_type: "system",
        validation_reason: "Test",
      });
      recordEvidenceRecordAdmission({
        evidence_record_id: record.evidence_id,
        admission_state: "REJECTED",
        admission_reason: "Test",
      });

      const fresh = JSON.stringify(getEvidenceRecord(record.evidence_id)!);
      assert.equal(fresh, original, "Original record must remain unmodified");
    });

    it("AC15: Existing FP-004, 5, 8, 9, 10 behavior preserved", () => {
      const dbPath = path.join(testDir, "ac15.db");
      setupDb(dbPath);
      const db = getDb();

      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      assert.ok(tables.includes("packet_lifecycle_events"));
      assert.ok(tables.includes("packet_executions"));
      assert.ok(tables.includes("packet_execution_telemetry"));
      assert.ok(tables.includes("packet_classification_observations"));
      assert.ok(tables.includes("model_outcome_observations"));
      assert.ok(tables.includes("evidence_admission_events"));
      assert.ok(tables.includes("evidence_records"));
    });
  });
});
