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
  type EvidenceRecord,
} from "../src/db/evidence-records.js";

let testDir: string;

before(() => {
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), "forgepilot-fp010-"));
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
  db.exec(
    "INSERT OR IGNORE INTO phases (id, name, status) VALUES (1, 'default-phase', 'pending')"
  );
  db.exec(
    "INSERT OR IGNORE INTO steps (id, phase_id, name, status) VALUES (1, 1, 'default-step', 'pending')"
  );
  db.exec(
    "INSERT OR IGNORE INTO tasks (id, step_id, name, status) VALUES (1, 1, 'default-task', 'pending')"
  );
}

function createTestPacket(title: string = "FP-010 Test Packet") {
  return recordPacketIntent({
    title,
    packet_path: `packets/${title.replace(/\s+/g, "-")}.md`,
    packet_hash: `hash-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  });
}

describe("FP-010: SQLite Evidence Persistence", () => {
  describe("Migration", () => {
    it("should be idempotent (running migrate twice does not fail)", () => {
      const dbPath = path.join(testDir, "idempotent-fp010.db");
      closeDb();
      initDb(dbPath);
      migrate();
      migrate();

      const db = getDb();
      const rows = db
        .prepare("SELECT name FROM _migrations WHERE name = ?")
        .all("006_fp010_evidence_persistence.sql") as { name: string }[];

      assert.equal(
        rows.length,
        1,
        "Migration 006 should only be recorded once"
      );
    });

    it("should create evidence_records table with required columns", () => {
      const dbPath = path.join(testDir, "evidence-table.db");
      setupDb(dbPath);
      const db = getDb();

      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((r: unknown) => (r as { name: string }).name);
      assert.ok(
        tables.includes("evidence_records"),
        "evidence_records table should exist"
      );

      const columns = db
        .prepare("PRAGMA table_info(evidence_records)")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      const required = [
        "evidence_id",
        "packet_id",
        "run_id",
        "model_id",
        "model_role",
        "branch",
        "commit_sha",
        "executor_result",
        "verification_result",
        "audit_result",
        "comparison_result",
        "metrics_path",
        "artifact_paths",
        "trust_tier",
        "validation_state",
        "admission_state",
        "created_at",
      ];
      for (const col of required) {
        assert.ok(
          columns.includes(col),
          `evidence_records.${col} should exist`
        );
      }
    });

    it("should create indexes on evidence_records", () => {
      const dbPath = path.join(testDir, "evidence-indexes.db");
      setupDb(dbPath);
      const db = getDb();

      const indexes = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'index'")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      assert.ok(
        indexes.includes("idx_evidence_packet_id"),
        "idx_evidence_packet_id should exist"
      );
      assert.ok(
        indexes.includes("idx_evidence_run_id"),
        "idx_evidence_run_id should exist"
      );
      assert.ok(
        indexes.includes("idx_evidence_packet_run"),
        "idx_evidence_packet_run unique index should exist"
      );
    });
  });

  describe("Evidence record insertion", () => {
    it("should insert an evidence record with all fields", () => {
      const dbPath = path.join(testDir, "insert-full.db");
      setupDb(dbPath);

      const packet = createTestPacket("FP-010 Full Insert");

      const record = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-001",
        model_id: "deepseek-v4-pro",
        model_role: "executor",
        branch: "main",
        commit_sha: "abc123def456",
        executor_result: "SUCCESS",
        verification_result: "PASSED",
        audit_result: "ACCEPTED",
        comparison_result: "WIN",
        metrics_path: "runs/FP-010/metrics.json",
        artifact_paths: [
          "runs/FP-010/executor-result.md",
          "runs/FP-010/verification.txt",
        ],
        trust_tier: "TIER_2_VERIFIED_ARTIFACT",
        validation_state: "VALID",
        admission_state: "ADMITTED",
      });

      assert.ok(record.evidence_id > 0, "Should have an evidence_id");
      assert.equal(record.packet_id, packet.id);
      assert.equal(record.run_id, "run-001");
      assert.equal(record.model_id, "deepseek-v4-pro");
      assert.equal(record.model_role, "executor");
      assert.equal(record.branch, "main");
      assert.equal(record.commit_sha, "abc123def456");
      assert.equal(record.executor_result, "SUCCESS");
      assert.equal(record.verification_result, "PASSED");
      assert.equal(record.audit_result, "ACCEPTED");
      assert.equal(record.comparison_result, "WIN");
      assert.equal(record.metrics_path, "runs/FP-010/metrics.json");
      assert.equal(record.trust_tier, "TIER_2_VERIFIED_ARTIFACT");
      assert.equal(record.validation_state, "VALID");
      assert.equal(record.admission_state, "ADMITTED");
      assert.ok(record.created_at, "created_at should be set");

      const paths = parseArtifactPaths(record);
      assert.equal(paths.length, 2);
      assert.equal(paths[0], "runs/FP-010/executor-result.md");
      assert.equal(paths[1], "runs/FP-010/verification.txt");
    });

    it("should apply default values when optional fields are omitted", () => {
      const dbPath = path.join(testDir, "insert-defaults.db");
      setupDb(dbPath);

      const packet = createTestPacket("FP-010 Defaults");

      const record = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-defaults",
      });

      assert.equal(record.trust_tier, "TIER_0_UNTRUSTED");
      assert.equal(record.validation_state, "INCOMPLETE");
      assert.equal(record.admission_state, "NOT_EVALUATED");
      assert.equal(record.model_id, "");
      assert.equal(record.model_role, "");
      assert.equal(record.branch, "");
      assert.equal(record.commit_sha, "");
      assert.equal(record.executor_result, "");
      assert.equal(record.verification_result, "");
      assert.equal(record.audit_result, "");
      assert.equal(record.comparison_result, "");
      assert.equal(record.metrics_path, "");
      assert.equal(record.artifact_paths, "[]");
    });

    it("should require packet_id to be valid", () => {
      const dbPath = path.join(testDir, "insert-invalid-packet.db");
      setupDb(dbPath);

      assert.throws(
        () =>
          insertEvidenceRecord({
            packet_id: 0,
            run_id: "run-invalid",
          }),
        /packet_id must be a positive integer/
      );
    });

    it("should require run_id to be non-empty", () => {
      const dbPath = path.join(testDir, "insert-empty-run.db");
      setupDb(dbPath);

      const packet = createTestPacket("FP-010 Empty Run");

      assert.throws(
        () =>
          insertEvidenceRecord({
            packet_id: packet.id,
            run_id: "",
          }),
        /run_id is required/
      );
    });

    it("should require packet to exist in database", () => {
      const dbPath = path.join(testDir, "insert-nonexistent-packet.db");
      setupDb(dbPath);

      assert.throws(
        () =>
          insertEvidenceRecord({
            packet_id: 99999,
            run_id: "run-orphan",
          }),
        /Packet 99999 not found/
      );
    });

    it("should enforce unique packet_id + run_id combination", () => {
      const dbPath = path.join(testDir, "insert-unique-run.db");
      setupDb(dbPath);

      const packet = createTestPacket("FP-010 Unique Run");

      insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-unique",
      });

      assert.throws(
        () =>
          insertEvidenceRecord({
            packet_id: packet.id,
            run_id: "run-unique",
          }),
        /UNIQUE constraint failed/
      );
    });
  });

  describe("State axis constraints", () => {
    it("should accept all valid trust_tier values", () => {
      const dbPath = path.join(testDir, "trust-tier-values.db");
      setupDb(dbPath);

      const packet = createTestPacket("FP-010 Trust Tiers");
      const validTiers = [
        "TIER_0_UNTRUSTED",
        "TIER_1_SELF_REPORTED",
        "TIER_2_VERIFIED_ARTIFACT",
        "TIER_3_REPRODUCIBLE",
      ];

      for (let i = 0; i < validTiers.length; i++) {
        const record = insertEvidenceRecord({
          packet_id: packet.id,
          run_id: `run-tier-${i}`,
          trust_tier: validTiers[i],
        });
        assert.equal(record.trust_tier, validTiers[i]);
      }
    });

    it("should reject invalid trust_tier values", () => {
      const dbPath = path.join(testDir, "trust-tier-invalid.db");
      setupDb(dbPath);

      const packet = createTestPacket("FP-010 Invalid Trust");

      assert.throws(
        () =>
          insertEvidenceRecord({
            packet_id: packet.id,
            run_id: "run-bad-tier",
            trust_tier: "TIER_5_INVALID",
          }),
        /Invalid trust_tier/
      );
    });

    it("should reject empty string trust_tier", () => {
      const dbPath = path.join(testDir, "trust-tier-empty.db");
      setupDb(dbPath);

      const packet = createTestPacket("FP-010 Empty Trust");

      assert.throws(
        () =>
          insertEvidenceRecord({
            packet_id: packet.id,
            run_id: "run-empty-tier",
            trust_tier: "",
          }),
        /Invalid trust_tier/
      );
    });

    it("should accept all valid validation_state values", () => {
      const dbPath = path.join(testDir, "validation-state-values.db");
      setupDb(dbPath);

      const packet = createTestPacket("FP-010 Validation States");
      const validStates = ["VALID", "INVALID", "INCOMPLETE", "DEFERRED"];

      for (let i = 0; i < validStates.length; i++) {
        const record = insertEvidenceRecord({
          packet_id: packet.id,
          run_id: `run-val-${i}`,
          validation_state: validStates[i],
        });
        assert.equal(record.validation_state, validStates[i]);
      }
    });

    it("should reject invalid validation_state values", () => {
      const dbPath = path.join(testDir, "validation-state-invalid.db");
      setupDb(dbPath);

      const packet = createTestPacket("FP-010 Invalid Validation");

      assert.throws(
        () =>
          insertEvidenceRecord({
            packet_id: packet.id,
            run_id: "run-bad-val",
            validation_state: "UNKNOWN",
          }),
        /Invalid validation_state/
      );
    });

    it("should reject NOT_EVALUATED for validation_state (belongs to admission_state only)", () => {
      const dbPath = path.join(testDir, "validation-state-not-evaluated.db");
      setupDb(dbPath);

      const packet = createTestPacket("FP-010 Not Evaluated Validation");

      assert.throws(
        () =>
          insertEvidenceRecord({
            packet_id: packet.id,
            run_id: "run-not-evaluated",
            validation_state: "NOT_EVALUATED",
          }),
        /Invalid validation_state/
      );
    });

    it("should accept all valid admission_state values", () => {
      const dbPath = path.join(testDir, "admission-state-values.db");
      setupDb(dbPath);

      const packet = createTestPacket("FP-010 Admission States");
      const validStates = [
        "NOT_EVALUATED",
        "REJECTED",
        "PENDING",
        "ADMITTED",
        "QUARANTINED",
      ];

      for (let i = 0; i < validStates.length; i++) {
        const record = insertEvidenceRecord({
          packet_id: packet.id,
          run_id: `run-adm-${i}`,
          admission_state: validStates[i],
        });
        assert.equal(record.admission_state, validStates[i]);
      }
    });

    it("should reject invalid admission_state values", () => {
      const dbPath = path.join(testDir, "admission-state-invalid.db");
      setupDb(dbPath);

      const packet = createTestPacket("FP-010 Invalid Admission");

      assert.throws(
        () =>
          insertEvidenceRecord({
            packet_id: packet.id,
            run_id: "run-bad-adm",
            admission_state: "APPROVED",
          }),
        /Invalid admission_state/
      );
    });

    it("should keep trust_tier, validation_state, and admission_state as separate axes", () => {
      const dbPath = path.join(testDir, "separate-axes.db");
      setupDb(dbPath);

      const packet = createTestPacket("FP-010 Separate Axes");

      const record = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-axes",
        trust_tier: "TIER_3_REPRODUCIBLE",
        validation_state: "DEFERRED",
        admission_state: "QUARANTINED",
      });

      assert.equal(record.trust_tier, "TIER_3_REPRODUCIBLE");
      assert.equal(record.validation_state, "DEFERRED");
      assert.equal(record.admission_state, "QUARANTINED");

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
    });
  });

  describe("Evidence retrieval", () => {
    it("should retrieve evidence records by packet_id", () => {
      const dbPath = path.join(testDir, "retrieve-by-packet.db");
      setupDb(dbPath);

      const packet = createTestPacket("FP-010 Retrieve Packet");

      insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-retrieve-1",
        model_id: "model-a",
      });

      insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-retrieve-2",
        model_id: "model-b",
      });

      const records = getEvidenceByPacketId(packet.id);
      assert.equal(records.length, 2);
      assert.equal(records[0].run_id, "run-retrieve-1");
      assert.equal(records[1].run_id, "run-retrieve-2");
    });

    it("should retrieve evidence records by run_id", () => {
      const dbPath = path.join(testDir, "retrieve-by-run.db");
      setupDb(dbPath);

      const packet = createTestPacket("FP-010 Retrieve Run");

      insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-unique-id-123",
        model_id: "model-x",
      });

      const records = getEvidenceByRunId("run-unique-id-123");
      assert.equal(records.length, 1);
      assert.equal(records[0].run_id, "run-unique-id-123");
      assert.equal(records[0].model_id, "model-x");
    });

    it("should retrieve single evidence record by evidence_id", () => {
      const dbPath = path.join(testDir, "retrieve-by-id.db");
      setupDb(dbPath);

      const packet = createTestPacket("FP-010 Retrieve ID");

      const inserted = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-by-id",
        model_id: "model-z",
      });

      const record = getEvidenceRecord(inserted.evidence_id);
      assert.ok(record, "Record should be found");
      assert.equal(record!.evidence_id, inserted.evidence_id);
      assert.equal(record!.run_id, "run-by-id");
    });

    it("should return undefined for non-existent evidence_id", () => {
      const dbPath = path.join(testDir, "retrieve-nonexistent.db");
      setupDb(dbPath);

      const record = getEvidenceRecord(99999);
      assert.equal(record, undefined);
    });

    it("should return empty array for packet with no evidence", () => {
      const dbPath = path.join(testDir, "retrieve-empty-packet.db");
      setupDb(dbPath);

      const packet = createTestPacket("FP-010 No Evidence");

      const records = getEvidenceByPacketId(packet.id);
      assert.equal(records.length, 0);
    });

    it("should return empty array for non-existent run_id", () => {
      const dbPath = path.join(testDir, "retrieve-nonexistent-run.db");
      setupDb(dbPath);

      const records = getEvidenceByRunId("nonexistent-run-id");
      assert.equal(records.length, 0);
    });
  });

  describe("Artifact paths persistence", () => {
    it("should persist and retrieve artifact paths as JSON array", () => {
      const dbPath = path.join(testDir, "artifact-paths.db");
      setupDb(dbPath);

      const packet = createTestPacket("FP-010 Artifact Paths");
      const paths = [
        "runs/FP-010/executor-result.md",
        "runs/FP-010/verification.txt",
        "runs/FP-010/metrics.json",
      ];

      const record = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-artifacts",
        artifact_paths: paths,
      });

      assert.equal(record.artifact_paths, JSON.stringify(paths));

      const parsed = parseArtifactPaths(record);
      assert.equal(parsed.length, 3);
      assert.deepEqual(parsed, paths);
    });

    it("should handle empty artifact paths array", () => {
      const dbPath = path.join(testDir, "artifact-paths-empty.db");
      setupDb(dbPath);

      const packet = createTestPacket("FP-010 Empty Artifacts");

      const record = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-no-artifacts",
        artifact_paths: [],
      });

      assert.equal(record.artifact_paths, "[]");
      const parsed = parseArtifactPaths(record);
      assert.equal(parsed.length, 0);
    });

    it("should default artifact_paths to empty array when not provided", () => {
      const dbPath = path.join(testDir, "artifact-paths-default.db");
      setupDb(dbPath);

      const packet = createTestPacket("FP-010 Default Artifacts");

      const record = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-default-artifacts",
      });

      assert.equal(record.artifact_paths, "[]");
      const parsed = parseArtifactPaths(record);
      assert.equal(parsed.length, 0);
    });
  });

  describe("Provenance preservation", () => {
    it("should preserve all provenance fields for traceability", () => {
      const dbPath = path.join(testDir, "provenance.db");
      setupDb(dbPath);

      const packet = createTestPacket("FP-010 Provenance");

      const record = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-provenance",
        model_id: "deepseek-v4-pro",
        model_role: "executor",
        branch: "feature/fp-010",
        commit_sha: "abc123def456789",
        metrics_path: "runs/FP-010/metrics.json",
        artifact_paths: ["runs/FP-010/executor-result.md"],
      });

      assert.equal(record.packet_id, packet.id, "Should trace to packet");
      assert.equal(record.run_id, "run-provenance", "Should trace to run");
      assert.equal(record.model_id, "deepseek-v4-pro", "Should trace to model");
      assert.equal(record.model_role, "executor", "Should record model role");
      assert.equal(record.branch, "feature/fp-010", "Should trace to branch");
      assert.equal(
        record.commit_sha,
        "abc123def456789",
        "Should trace to commit"
      );
      assert.equal(
        record.metrics_path,
        "runs/FP-010/metrics.json",
        "Should reference metrics"
      );

      const paths = parseArtifactPaths(record);
      assert.ok(
        paths.includes("runs/FP-010/executor-result.md"),
        "Should reference artifacts"
      );
    });
  });

  describe("Existing behavior preservation", () => {
    it("should not affect existing packet operations", () => {
      const dbPath = path.join(testDir, "preserve-packets.db");
      setupDb(dbPath);

      const packet = createTestPacket("FP-010 Preserve Packets");
      assert.ok(packet.id > 0);
      assert.equal(packet.title, "FP-010 Preserve Packets");

      const db = getDb();
      const columns = db
        .prepare("PRAGMA table_info(packets)")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      assert.ok(columns.includes("id"));
      assert.ok(columns.includes("task_id"));
      assert.ok(columns.includes("packet_type"));
      assert.ok(columns.includes("status"));
      assert.ok(columns.includes("title"));
      assert.ok(columns.includes("packet_path"));
      assert.ok(columns.includes("packet_hash"));
    });

    it("should not affect existing evidence_admission_events table", () => {
      const dbPath = path.join(testDir, "preserve-admission.db");
      setupDb(dbPath);
      const db = getDb();

      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      assert.ok(
        tables.includes("evidence_admission_events"),
        "evidence_admission_events should still exist"
      );
      assert.ok(
        tables.includes("evidence_records"),
        "evidence_records should exist"
      );
    });
  });
});
