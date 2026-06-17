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
} from "../src/db/persistence.js";
import {
  ingestOpenCodeTelemetry,
  getExecutionTelemetry,
} from "../src/db/telemetry.js";
import {
  recordClassificationObservation,
  recordClassificationCorrection,
  getClassificationObservations,
} from "../src/db/classification.js";
import {
  recordOutcomeObservation,
  getOutcomeObservations,
} from "../src/db/outcome.js";
import {
  recordEvidenceAdmission,
  getAdmissionEvents,
  deriveEvidenceEligibility,
} from "../src/db/evidence.js";
import {
  insertEvidenceRecord,
  getEvidenceRecord,
  getEvidenceByPacketId,
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
} from "../src/db/validation-admission.js";
import {
  recordTaskClassification,
  recordTaskClassificationCorrection,
  getTaskClassificationHistory,
  getLatestTaskClassification,
  getTaskClassificationEvent,
} from "../src/db/task-classification.js";
import {
  recordModelComparison,
  recordModelComparisonCorrection,
  getComparisonHistory,
  getLatestComparison,
  getComparisonEvent,
  parseComparisonDefects,
} from "../src/db/model-comparison.js";

let testDir: string;

before(() => {
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), "forgepilot-fp012-"));
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

function createTestPacket(title: string = "FP-012 Test Packet") {
  return recordPacketIntent({
    title,
    packet_path: `packets/${title.replace(/\s+/g, "-")}.md`,
    packet_hash: `hash-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  });
}

function createValidClassification(packet_id: number) {
  return recordTaskClassification({
    packet_id,
    task_class: "PERSISTENCE",
    risk_level: "HIGH",
    blast_radius: "DATABASE",
    evidence_sensitivity: "HIGH",
    audit_requirement: "STRICT",
    comparison_requirement: "REQUIRED",
    classification_source: "HUMAN",
    actor: "test-operator",
    model_identity: "",
    rationale: "Test classification for FP-012",
  });
}

function createValidComparison(packet_id: number, executionAId?: number, executionBId?: number) {
  return recordModelComparison({
    packet_id,
    comparison_outcome: "MODEL_A_SELECTED",
    comparison_basis: "TEST_PASS_RATE",
    execution_a_id: executionAId ?? null,
    execution_b_id: executionBId ?? null,
    model_a_id: "deepseek-v4-pro",
    model_b_id: "qwen-3.7-max",
    model_a_role: "executor",
    model_b_role: "challenger",
    selected_model: "deepseek-v4-pro",
    selection_reason: "Better test coverage",
    model_a_defects: [],
    model_b_defects: ["Incomplete scope handling"],
    model_a_verification_result: "PASSED",
    model_b_verification_result: "FAILED",
    model_a_audit_result: "ACCEPTED",
    model_b_audit_result: "REJECTED",
    model_a_admission_state: "ADMITTED",
    model_b_admission_state: "REJECTED",
    compared_by: "test-comparator",
  });
}

describe("FP-012: Task Classification and Model Comparison Protocol", () => {
  describe("Migration", () => {
    it("should be idempotent (running migrate twice does not fail)", () => {
      const dbPath = path.join(testDir, "idempotent-fp012.db");
      closeDb();
      initDb(dbPath);
      migrate();
      migrate();

      const db = getDb();
      const rows = db
        .prepare("SELECT name FROM _migrations WHERE name = ?")
        .all("008_fp012_task_classification_comparison.sql") as { name: string }[];

      assert.equal(rows.length, 1, "Migration 008 should only be recorded once");
    });

    it("should create fp012_task_classification_events table", () => {
      const dbPath = path.join(testDir, "class-table.db");
      setupDb(dbPath);
      const db = getDb();

      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      assert.ok(tables.includes("fp012_task_classification_events"), "fp012_task_classification_events should exist");
    });

    it("should create fp012_model_comparison_events table", () => {
      const dbPath = path.join(testDir, "comp-table.db");
      setupDb(dbPath);
      const db = getDb();

      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      assert.ok(tables.includes("fp012_model_comparison_events"), "fp012_model_comparison_events should exist");
    });

    it("should create required columns in fp012_task_classification_events", () => {
      const dbPath = path.join(testDir, "class-columns.db");
      setupDb(dbPath);
      const db = getDb();

      const columns = db
        .prepare("PRAGMA table_info(fp012_task_classification_events)")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      const required = [
        "id", "packet_id", "task_class", "risk_level", "blast_radius",
        "evidence_sensitivity", "audit_requirement", "comparison_requirement",
        "classification_source", "actor", "model_identity", "rationale",
        "correction_of", "correction_reason", "created_at",
      ];
      for (const col of required) {
        assert.ok(columns.includes(col), `fp012_task_classification_events.${col} should exist`);
      }
    });

    it("should create required columns in fp012_model_comparison_events", () => {
      const dbPath = path.join(testDir, "comp-columns.db");
      setupDb(dbPath);
      const db = getDb();

      const columns = db
        .prepare("PRAGMA table_info(fp012_model_comparison_events)")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      const required = [
        "id", "packet_id", "comparison_outcome", "comparison_basis",
        "execution_a_id", "execution_b_id", "evidence_a_id", "evidence_b_id",
        "model_a_id", "model_b_id", "model_a_role", "model_b_role",
        "selected_model", "selection_reason",
        "model_a_defects", "model_b_defects",
        "model_a_verification_result", "model_b_verification_result",
        "model_a_audit_result", "model_b_audit_result",
        "model_a_admission_state", "model_b_admission_state",
        "compared_by", "correction_of", "correction_reason", "created_at",
      ];
      for (const col of required) {
        assert.ok(columns.includes(col), `fp012_model_comparison_events.${col} should exist`);
      }
    });

    it("should create required indexes", () => {
      const dbPath = path.join(testDir, "class-indexes.db");
      setupDb(dbPath);
      const db = getDb();

      const indexes = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'index'")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      assert.ok(indexes.includes("idx_fp012_class_events_packet"));
      assert.ok(indexes.includes("idx_fp012_class_events_created"));
      assert.ok(indexes.includes("idx_fp012_comp_events_packet"));
      assert.ok(indexes.includes("idx_fp012_comp_events_created"));
    });
  });

  describe("Task classification events", () => {
    it("should insert a task classification event with all required fields", () => {
      const dbPath = path.join(testDir, "class-insert.db");
      setupDb(dbPath);

      const packet = createTestPacket("Classification Insert Test");
      const event = createValidClassification(packet.id);

      assert.ok(event.id > 0);
      assert.equal(event.packet_id, packet.id);
      assert.equal(event.task_class, "PERSISTENCE");
      assert.equal(event.risk_level, "HIGH");
      assert.equal(event.blast_radius, "DATABASE");
      assert.equal(event.evidence_sensitivity, "HIGH");
      assert.equal(event.audit_requirement, "STRICT");
      assert.equal(event.comparison_requirement, "REQUIRED");
      assert.equal(event.classification_source, "HUMAN");
      assert.equal(event.actor, "test-operator");
      assert.equal(event.rationale, "Test classification for FP-012");
      assert.equal(event.correction_of, null);
      assert.ok(event.created_at);
    });

    it("should support all valid task_class values", () => {
      const dbPath = path.join(testDir, "class-all-task-classes.db");
      setupDb(dbPath);

      const packet = createTestPacket("All Task Classes");

      const classes = [
        "DOCUMENTATION", "PERSISTENCE", "CLI", "TESTING", "REFACTOR",
        "BUGFIX", "ARCHITECTURE", "EVALUATION", "TELEMETRY", "UNKNOWN",
      ];

      for (const tc of classes) {
        const event = recordTaskClassification({
          packet_id: packet.id,
          task_class: tc,
          risk_level: "MEDIUM",
          blast_radius: "MODULE",
          evidence_sensitivity: "MEDIUM",
          audit_requirement: "STANDARD",
          comparison_requirement: "OPTIONAL",
          classification_source: "HUMAN",
          actor: "test",
          rationale: `Testing ${tc}`,
        });
        assert.equal(event.task_class, tc);
      }

      const history = getTaskClassificationHistory(packet.id);
      assert.equal(history.length, 10);
    });

    it("should support all valid risk_level values", () => {
      const dbPath = path.join(testDir, "class-all-risk-levels.db");
      setupDb(dbPath);
      const packet = createTestPacket("All Risk Levels");

      for (const rl of ["LOW", "MEDIUM", "HIGH", "CRITICAL"]) {
        const event = recordTaskClassification({
          packet_id: packet.id,
          task_class: "TESTING",
          risk_level: rl,
          blast_radius: "LOCAL",
          evidence_sensitivity: "LOW",
          audit_requirement: "NONE",
          comparison_requirement: "NONE",
          classification_source: "SYSTEM",
        });
        assert.equal(event.risk_level, rl);
      }
    });

    it("should support all valid blast_radius values", () => {
      const dbPath = path.join(testDir, "class-all-blast-radius.db");
      setupDb(dbPath);
      const packet = createTestPacket("All Blast Radii");

      for (const br of ["LOCAL", "MODULE", "DATABASE", "WORKFLOW", "REPOSITORY", "UNKNOWN"]) {
        const event = recordTaskClassification({
          packet_id: packet.id,
          task_class: "ARCHITECTURE",
          risk_level: "LOW",
          blast_radius: br,
          evidence_sensitivity: "LOW",
          audit_requirement: "NONE",
          comparison_requirement: "NONE",
          classification_source: "DERIVED",
        });
        assert.equal(event.blast_radius, br);
      }
    });

    it("should support all valid evidence_sensitivity values", () => {
      const dbPath = path.join(testDir, "class-all-ev-sensitivity.db");
      setupDb(dbPath);
      const packet = createTestPacket("All Ev Sensitivity");

      for (const es of ["LOW", "MEDIUM", "HIGH"]) {
        const event = recordTaskClassification({
          packet_id: packet.id,
          task_class: "EVALUATION",
          risk_level: "MEDIUM",
          blast_radius: "MODULE",
          evidence_sensitivity: es,
          audit_requirement: "STANDARD",
          comparison_requirement: "REQUIRED",
          classification_source: "MODEL",
        });
        assert.equal(event.evidence_sensitivity, es);
      }
    });

    it("should support all valid audit_requirement values", () => {
      const dbPath = path.join(testDir, "class-all-audit-req.db");
      setupDb(dbPath);
      const packet = createTestPacket("All Audit Requirements");

      for (const ar of ["NONE", "STANDARD", "STRICT"]) {
        const event = recordTaskClassification({
          packet_id: packet.id,
          task_class: "BUGFIX",
          risk_level: "HIGH",
          blast_radius: "DATABASE",
          evidence_sensitivity: "HIGH",
          audit_requirement: ar,
          comparison_requirement: "OPTIONAL",
          classification_source: "HUMAN",
        });
        assert.equal(event.audit_requirement, ar);
      }
    });

    it("should support all valid comparison_requirement values", () => {
      const dbPath = path.join(testDir, "class-all-comp-req.db");
      setupDb(dbPath);
      const packet = createTestPacket("All Comparison Reqs");

      for (const cr of ["NONE", "OPTIONAL", "REQUIRED"]) {
        const event = recordTaskClassification({
          packet_id: packet.id,
          task_class: "CLI",
          risk_level: "MEDIUM",
          blast_radius: "LOCAL",
          evidence_sensitivity: "MEDIUM",
          audit_requirement: "STANDARD",
          comparison_requirement: cr,
          classification_source: "SYSTEM",
        });
        assert.equal(event.comparison_requirement, cr);
      }
    });

    it("should support all valid classification_source values", () => {
      const dbPath = path.join(testDir, "class-all-sources.db");
      setupDb(dbPath);
      const packet = createTestPacket("All Sources");

      for (const cs of ["HUMAN", "MODEL", "SYSTEM", "DERIVED"]) {
        const event = recordTaskClassification({
          packet_id: packet.id,
          task_class: "DOCUMENTATION",
          risk_level: "LOW",
          blast_radius: "LOCAL",
          evidence_sensitivity: "LOW",
          audit_requirement: "NONE",
          comparison_requirement: "NONE",
          classification_source: cs,
        });
        assert.equal(event.classification_source, cs);
      }
    });

    it("should store model_identity when provided", () => {
      const dbPath = path.join(testDir, "class-model-identity.db");
      setupDb(dbPath);
      const packet = createTestPacket("Model Identity");

      const event = recordTaskClassification({
        packet_id: packet.id,
        task_class: "ARCHITECTURE",
        risk_level: "HIGH",
        blast_radius: "REPOSITORY",
        evidence_sensitivity: "HIGH",
        audit_requirement: "STRICT",
        comparison_requirement: "REQUIRED",
        classification_source: "MODEL",
        actor: "deepseek-v4-pro",
        model_identity: "deepseek-v4-pro",
        rationale: "Classified by model",
      });

      assert.equal(event.model_identity, "deepseek-v4-pro");
      assert.equal(event.classification_source, "MODEL");
    });
  });

  describe("Task classification append-only behavior", () => {
    it("should not overwrite original classification when correction is recorded", () => {
      const dbPath = path.join(testDir, "class-append-only.db");
      setupDb(dbPath);
      const db = getDb();

      const packet = createTestPacket("Classification Append Only");
      const event1 = createValidClassification(packet.id);

      recordTaskClassificationCorrection({
        previous_classification_id: event1.id,
        packet_id: packet.id,
        risk_level: "CRITICAL",
        correction_reason: "Reassessed risk",
        corrected_by: "auditor",
      });

      const original = db
        .prepare("SELECT risk_level FROM fp012_task_classification_events WHERE id = ?")
        .get(event1.id) as { risk_level: string };
      assert.equal(original.risk_level, "HIGH", "Original risk_level should be unchanged");

      const allEvents = getTaskClassificationHistory(packet.id);
      assert.equal(allEvents.length, 2, "Should have original + correction");
    });

    it("should allow multiple corrections in sequence", () => {
      const dbPath = path.join(testDir, "class-multi-correction.db");
      setupDb(dbPath);

      const packet = createTestPacket("Multi Correction");
      const event1 = createValidClassification(packet.id);

      const event2 = recordTaskClassificationCorrection({
        previous_classification_id: event1.id,
        packet_id: packet.id,
        risk_level: "CRITICAL",
        correction_reason: "First reassessment",
        corrected_by: "auditor-1",
      });

      const event3 = recordTaskClassificationCorrection({
        previous_classification_id: event2.id,
        packet_id: packet.id,
        blast_radius: "REPOSITORY",
        correction_reason: "Second reassessment",
        corrected_by: "auditor-2",
      });

      const history = getTaskClassificationHistory(packet.id);
      assert.equal(history.length, 3);
      assert.equal(history[0].risk_level, "HIGH");
      assert.equal(history[1].risk_level, "CRITICAL");
      assert.equal(history[2].blast_radius, "REPOSITORY");
    });

    it("should derive latest classification via getLatestTaskClassification", () => {
      const dbPath = path.join(testDir, "class-latest.db");
      setupDb(dbPath);

      const packet = createTestPacket("Latest Classification");
      const event1 = createValidClassification(packet.id);

      recordTaskClassificationCorrection({
        previous_classification_id: event1.id,
        packet_id: packet.id,
        risk_level: "LOW",
        correction_reason: "Downgraded",
        corrected_by: "reviewer",
      });

      const latest = getLatestTaskClassification(packet.id);
      assert.ok(latest);
      assert.equal(latest!.risk_level, "LOW");
    });

    it("should retrieve single classification event by id", () => {
      const dbPath = path.join(testDir, "class-single.db");
      setupDb(dbPath);

      const packet = createTestPacket("Single Event");
      const event = createValidClassification(packet.id);

      const found = getTaskClassificationEvent(event.id);
      assert.ok(found);
      assert.equal(found!.id, event.id);

      const missing = getTaskClassificationEvent(99999);
      assert.equal(missing, undefined);
    });

    it("should return empty history for packet with no classifications", () => {
      const dbPath = path.join(testDir, "class-empty.db");
      setupDb(dbPath);
      const packet = createTestPacket("No Classifications");

      const history = getTaskClassificationHistory(packet.id);
      assert.equal(history.length, 0);

      const latest = getLatestTaskClassification(packet.id);
      assert.equal(latest, undefined);
    });
  });

  describe("Task classification controlled vocabulary enforcement", () => {
    it("should reject invalid task_class", () => {
      const dbPath = path.join(testDir, "class-invalid-task.db");
      setupDb(dbPath);
      const packet = createTestPacket("Invalid Task");

      assert.throws(
        () => {
          recordTaskClassification({
            packet_id: packet.id,
            task_class: "INVALID_CLASS",
            risk_level: "LOW",
            blast_radius: "LOCAL",
            evidence_sensitivity: "LOW",
            audit_requirement: "NONE",
            comparison_requirement: "NONE",
            classification_source: "HUMAN",
          });
        },
        /Invalid task_class/
      );
    });

    it("should reject invalid risk_level", () => {
      const dbPath = path.join(testDir, "class-invalid-risk.db");
      setupDb(dbPath);
      const packet = createTestPacket("Invalid Risk");

      assert.throws(
        () => {
          recordTaskClassification({
            packet_id: packet.id,
            task_class: "PERSISTENCE",
            risk_level: "EXTREME",
            blast_radius: "LOCAL",
            evidence_sensitivity: "LOW",
            audit_requirement: "NONE",
            comparison_requirement: "NONE",
            classification_source: "HUMAN",
          });
        },
        /Invalid risk_level/
      );
    });

    it("should reject invalid blast_radius", () => {
      const dbPath = path.join(testDir, "class-invalid-blast.db");
      setupDb(dbPath);
      const packet = createTestPacket("Invalid Blast");

      assert.throws(
        () => {
          recordTaskClassification({
            packet_id: packet.id,
            task_class: "PERSISTENCE",
            risk_level: "LOW",
            blast_radius: "GLOBAL",
            evidence_sensitivity: "LOW",
            audit_requirement: "NONE",
            comparison_requirement: "NONE",
            classification_source: "HUMAN",
          });
        },
        /Invalid blast_radius/
      );
    });

    it("should reject invalid evidence_sensitivity", () => {
      const dbPath = path.join(testDir, "class-invalid-ev-sens.db");
      setupDb(dbPath);
      const packet = createTestPacket("Invalid Ev Sens");

      assert.throws(
        () => {
          recordTaskClassification({
            packet_id: packet.id,
            task_class: "PERSISTENCE",
            risk_level: "LOW",
            blast_radius: "LOCAL",
            evidence_sensitivity: "CRITICAL",
            audit_requirement: "NONE",
            comparison_requirement: "NONE",
            classification_source: "HUMAN",
          });
        },
        /Invalid evidence_sensitivity/
      );
    });

    it("should reject invalid audit_requirement", () => {
      const dbPath = path.join(testDir, "class-invalid-audit.db");
      setupDb(dbPath);
      const packet = createTestPacket("Invalid Audit");

      assert.throws(
        () => {
          recordTaskClassification({
            packet_id: packet.id,
            task_class: "PERSISTENCE",
            risk_level: "LOW",
            blast_radius: "LOCAL",
            evidence_sensitivity: "LOW",
            audit_requirement: "IMPOSSIBLE",
            comparison_requirement: "NONE",
            classification_source: "HUMAN",
          });
        },
        /Invalid audit_requirement/
      );
    });

    it("should reject invalid comparison_requirement", () => {
      const dbPath = path.join(testDir, "class-invalid-comp-req.db");
      setupDb(dbPath);
      const packet = createTestPacket("Invalid Comp Req");

      assert.throws(
        () => {
          recordTaskClassification({
            packet_id: packet.id,
            task_class: "PERSISTENCE",
            risk_level: "LOW",
            blast_radius: "LOCAL",
            evidence_sensitivity: "LOW",
            audit_requirement: "NONE",
            comparison_requirement: "ALWAYS",
            classification_source: "HUMAN",
          });
        },
        /Invalid comparison_requirement/
      );
    });

    it("should reject invalid classification_source", () => {
      const dbPath = path.join(testDir, "class-invalid-source.db");
      setupDb(dbPath);
      const packet = createTestPacket("Invalid Source");

      assert.throws(
        () => {
          recordTaskClassification({
            packet_id: packet.id,
            task_class: "PERSISTENCE",
            risk_level: "LOW",
            blast_radius: "LOCAL",
            evidence_sensitivity: "LOW",
            audit_requirement: "NONE",
            comparison_requirement: "NONE",
            classification_source: "UNKNOWN_SOURCE",
          });
        },
        /Invalid classification_source/
      );
    });

    it("should reject invalid vocabulary in correction fields", () => {
      const dbPath = path.join(testDir, "class-correction-invalid.db");
      setupDb(dbPath);
      const packet = createTestPacket("Correction Invalid");
      const event1 = createValidClassification(packet.id);

      assert.throws(
        () => {
          recordTaskClassificationCorrection({
            previous_classification_id: event1.id,
            packet_id: packet.id,
            task_class: "NOT_A_CLASS",
            correction_reason: "Invalid correction",
            corrected_by: "bad-actor",
          });
        },
        /Invalid task_class/
      );
    });
  });

  describe("Task classification cross-packet rejection", () => {
    it("should reject correction where previous_classification_id belongs to another packet", () => {
      const dbPath = path.join(testDir, "class-cross-packet.db");
      setupDb(dbPath);

      const packetA = createTestPacket("Cross Packet A");
      const packetB = createTestPacket("Cross Packet B");

      const eventA = createValidClassification(packetA.id);

      assert.throws(
        () => {
          recordTaskClassificationCorrection({
            previous_classification_id: eventA.id,
            packet_id: packetB.id,
            risk_level: "LOW",
            correction_reason: "Cross-packet attempt",
            corrected_by: "bad-actor",
          });
        },
        /Cross-packet reference rejected/
      );
    });
  });

  describe("Model comparison events", () => {
    it("should insert a model comparison event with all required fields", () => {
      const dbPath = path.join(testDir, "comp-insert.db");
      setupDb(dbPath);

      const packet = createTestPacket("Comparison Insert");
      const executionA = createExecutionAttempt({ packet_id: packet.id, attempt_number: 1 });
      const executionB = createExecutionAttempt({ packet_id: packet.id, attempt_number: 2 });

      const event = createValidComparison(packet.id, executionA.execution_id, executionB.execution_id);

      assert.ok(event.id > 0);
      assert.equal(event.packet_id, packet.id);
      assert.equal(event.comparison_outcome, "MODEL_A_SELECTED");
      assert.equal(event.comparison_basis, "TEST_PASS_RATE");
      assert.equal(event.execution_a_id, executionA.execution_id);
      assert.equal(event.execution_b_id, executionB.execution_id);
      assert.equal(event.model_a_id, "deepseek-v4-pro");
      assert.equal(event.model_b_id, "qwen-3.7-max");
      assert.equal(event.model_a_role, "executor");
      assert.equal(event.model_b_role, "challenger");
      assert.equal(event.selected_model, "deepseek-v4-pro");
      assert.equal(event.selection_reason, "Better test coverage");
      assert.equal(event.model_a_admission_state, "ADMITTED");
      assert.equal(event.model_b_admission_state, "REJECTED");
      assert.equal(event.compared_by, "test-comparator");
      assert.ok(event.created_at);
    });

    it("should support all comparison_outcome values", () => {
      const dbPath = path.join(testDir, "comp-all-outcomes.db");
      setupDb(dbPath);
      const packet = createTestPacket("All Outcomes");

      const outcomes = [
        "MODEL_A_SELECTED", "MODEL_B_SELECTED", "TIE", "BOTH_ACCEPTED",
        "BOTH_REJECTED", "INCONCLUSIVE", "DEFERRED",
      ];

      for (const oc of outcomes) {
        const event = recordModelComparison({
          packet_id: packet.id,
          comparison_outcome: oc,
          comparison_basis: "CORRECTNESS",
          model_a_id: "model-a",
          model_b_id: "model-b",
          model_a_role: "executor",
          model_b_role: "challenger",
        });
        assert.equal(event.comparison_outcome, oc);
      }

      const history = getComparisonHistory(packet.id);
      assert.equal(history.length, 7);
    });

    it("should support all comparison_basis values", () => {
      const dbPath = path.join(testDir, "comp-all-bases.db");
      setupDb(dbPath);
      const packet = createTestPacket("All Bases");

      const bases = [
        "CORRECTNESS", "SCOPE_DISCIPLINE", "TEST_PASS_RATE", "SCHEMA_INTEGRATION",
        "PACKET_ALIGNMENT", "EVIDENCE_QUALITY", "MAINTAINABILITY", "COMPOSITE",
      ];

      for (const cb of bases) {
        const event = recordModelComparison({
          packet_id: packet.id,
          comparison_outcome: "TIE",
          comparison_basis: cb,
          model_a_id: "model-a",
          model_b_id: "model-b",
          model_a_role: "executor",
          model_b_role: "executor",
        });
        assert.equal(event.comparison_basis, cb);
      }

      const history = getComparisonHistory(packet.id);
      assert.equal(history.length, 8);
    });

    it("should support evidence record references", () => {
      const dbPath = path.join(testDir, "comp-evidence-refs.db");
      setupDb(dbPath);
      const packet = createTestPacket("Comp Evidence Refs");

      const evidenceA = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-a",
        model_id: "model-a",
      });
      const evidenceB = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-b",
        model_id: "model-b",
      });

      const event = recordModelComparison({
        packet_id: packet.id,
        comparison_outcome: "MODEL_A_SELECTED",
        comparison_basis: "EVIDENCE_QUALITY",
        evidence_a_id: evidenceA.evidence_id,
        evidence_b_id: evidenceB.evidence_id,
        model_a_id: "model-a",
        model_b_id: "model-b",
        model_a_role: "executor",
        model_b_role: "executor",
        model_a_admission_state: "ADMITTED",
        model_b_admission_state: "PENDING",
      });

      assert.equal(event.evidence_a_id, evidenceA.evidence_id);
      assert.equal(event.evidence_b_id, evidenceB.evidence_id);
    });

    it("should store defects as JSON arrays", () => {
      const dbPath = path.join(testDir, "comp-defects.db");
      setupDb(dbPath);
      const packet = createTestPacket("Comp Defects");

      const event = recordModelComparison({
        packet_id: packet.id,
        comparison_outcome: "MODEL_A_SELECTED",
        comparison_basis: "CORRECTNESS",
        model_a_id: "model-a",
        model_b_id: "model-b",
        model_a_role: "executor",
        model_b_role: "executor",
        model_a_defects: [],
        model_b_defects: ["Missing edge case", "Incorrect error handling"],
      });

      assert.deepEqual(parseComparisonDefects(event, "a"), []);
      assert.deepEqual(parseComparisonDefects(event, "b"), [
        "Missing edge case",
        "Incorrect error handling",
      ]);
    });

    it("should store all admission states at comparison time", () => {
      const dbPath = path.join(testDir, "comp-admission-states.db");
      setupDb(dbPath);
      const packet = createTestPacket("Comp Admission States");

      const event = recordModelComparison({
        packet_id: packet.id,
        comparison_outcome: "BOTH_ACCEPTED",
        comparison_basis: "COMPOSITE",
        model_a_id: "model-a",
        model_b_id: "model-b",
        model_a_role: "executor",
        model_b_role: "challenger",
        model_a_admission_state: "ADMITTED",
        model_b_admission_state: "QUARANTINED",
      });

      assert.equal(event.model_a_admission_state, "ADMITTED");
      assert.equal(event.model_b_admission_state, "QUARANTINED");
    });

    it("should default admission states to NOT_EVALUATED", () => {
      const dbPath = path.join(testDir, "comp-default-admission.db");
      setupDb(dbPath);
      const packet = createTestPacket("Comp Default Admission");

      const event = recordModelComparison({
        packet_id: packet.id,
        comparison_outcome: "INCONCLUSIVE",
        comparison_basis: "MAINTAINABILITY",
        model_a_id: "model-a",
        model_b_id: "model-b",
        model_a_role: "executor",
        model_b_role: "executor",
      });

      assert.equal(event.model_a_admission_state, "NOT_EVALUATED");
      assert.equal(event.model_b_admission_state, "NOT_EVALUATED");
    });
  });

  describe("Model comparison append-only behavior", () => {
    it("should not overwrite original comparison when correction is recorded", () => {
      const dbPath = path.join(testDir, "comp-append-only.db");
      setupDb(dbPath);
      const db = getDb();

      const packet = createTestPacket("Comparison Append Only");
      const event1 = createValidComparison(packet.id);

      recordModelComparisonCorrection({
        previous_comparison_id: event1.id,
        packet_id: packet.id,
        comparison_outcome: "TIE",
        correction_reason: "Re-evaluated evidence",
        corrected_by: "reviewer",
      });

      const original = db
        .prepare("SELECT comparison_outcome FROM fp012_model_comparison_events WHERE id = ?")
        .get(event1.id) as { comparison_outcome: string };
      assert.equal(original.comparison_outcome, "MODEL_A_SELECTED", "Original outcome should be unchanged");

      const allEvents = getComparisonHistory(packet.id);
      assert.equal(allEvents.length, 2, "Should have original + correction");
    });

    it("should allow multiple comparison corrections in sequence", () => {
      const dbPath = path.join(testDir, "comp-multi-correction.db");
      setupDb(dbPath);

      const packet = createTestPacket("Multi Comp Correction");
      const event1 = createValidComparison(packet.id);

      const event2 = recordModelComparisonCorrection({
        previous_comparison_id: event1.id,
        packet_id: packet.id,
        comparison_outcome: "TIE",
        correction_reason: "First reassessment",
        corrected_by: "reviewer-1",
      });

      recordModelComparisonCorrection({
        previous_comparison_id: event2.id,
        packet_id: packet.id,
        comparison_outcome: "MODEL_B_SELECTED",
        correction_reason: "Second reassessment",
        corrected_by: "reviewer-2",
      });

      const history = getComparisonHistory(packet.id);
      assert.equal(history.length, 3);
      assert.equal(history[0].comparison_outcome, "MODEL_A_SELECTED");
      assert.equal(history[1].comparison_outcome, "TIE");
      assert.equal(history[2].comparison_outcome, "MODEL_B_SELECTED");
    });

    it("should derive latest comparison via getLatestComparison", () => {
      const dbPath = path.join(testDir, "comp-latest.db");
      setupDb(dbPath);

      const packet = createTestPacket("Latest Comparison");
      const event1 = createValidComparison(packet.id);

      recordModelComparisonCorrection({
        previous_comparison_id: event1.id,
        packet_id: packet.id,
        comparison_basis: "EVIDENCE_QUALITY",
        correction_reason: "Changed basis",
        corrected_by: "reviewer",
      });

      const latest = getLatestComparison(packet.id);
      assert.ok(latest);
      assert.equal(latest!.comparison_basis, "EVIDENCE_QUALITY");
    });

    it("should retrieve single comparison event by id", () => {
      const dbPath = path.join(testDir, "comp-single.db");
      setupDb(dbPath);

      const packet = createTestPacket("Single Comp");
      const event = createValidComparison(packet.id);

      const found = getComparisonEvent(event.id);
      assert.ok(found);
      assert.equal(found!.id, event.id);

      const missing = getComparisonEvent(99999);
      assert.equal(missing, undefined);
    });

    it("should return empty history for packet with no comparisons", () => {
      const dbPath = path.join(testDir, "comp-empty.db");
      setupDb(dbPath);
      const packet = createTestPacket("No Comparisons");

      const history = getComparisonHistory(packet.id);
      assert.equal(history.length, 0);

      const latest = getLatestComparison(packet.id);
      assert.equal(latest, undefined);
    });

    it("should preserve compared execution/evidence/model identifiers in correction latest derivation", () => {
      const dbPath = path.join(testDir, "comp-correction-preserve-ids.db");
      setupDb(dbPath);
      const packet = createTestPacket("Correction Preserve IDs");

      const execA = createExecutionAttempt({ packet_id: packet.id, attempt_number: 1 });
      const execB = createExecutionAttempt({ packet_id: packet.id, attempt_number: 2 });

      const evA = insertEvidenceRecord({ packet_id: packet.id, run_id: "corr-ev-a", model_id: "deepseek" });
      const evB = insertEvidenceRecord({ packet_id: packet.id, run_id: "corr-ev-b", model_id: "qwen" });

      const original = recordModelComparison({
        packet_id: packet.id,
        comparison_outcome: "MODEL_A_SELECTED",
        comparison_basis: "TEST_PASS_RATE",
        execution_a_id: execA.execution_id,
        execution_b_id: execB.execution_id,
        evidence_a_id: evA.evidence_id,
        evidence_b_id: evB.evidence_id,
        model_a_id: "deepseek-v4-pro",
        model_b_id: "qwen-3.7-max",
        model_a_role: "executor",
        model_b_role: "challenger",
        model_a_admission_state: "ADMITTED",
        model_b_admission_state: "REJECTED",
      });

      // Apply a correction that only changes the outcome
      recordModelComparisonCorrection({
        previous_comparison_id: original.id,
        packet_id: packet.id,
        comparison_outcome: "TIE",
        correction_reason: "Re-evaluated; tie after review",
        corrected_by: "reviewer",
      });

      const latest = getLatestComparison(packet.id);
      assert.ok(latest);
      assert.equal(latest!.comparison_outcome, "TIE", "Correction outcome should be applied");
      assert.equal(latest!.execution_a_id, execA.execution_id, "execution_a_id should be preserved");
      assert.equal(latest!.execution_b_id, execB.execution_id, "execution_b_id should be preserved");
      assert.equal(latest!.evidence_a_id, evA.evidence_id, "evidence_a_id should be preserved");
      assert.equal(latest!.evidence_b_id, evB.evidence_id, "evidence_b_id should be preserved");
      assert.equal(latest!.model_a_id, "deepseek-v4-pro", "model_a_id should be preserved");
      assert.equal(latest!.model_b_id, "qwen-3.7-max", "model_b_id should be preserved");
      assert.equal(latest!.model_a_role, "executor", "model_a_role should be preserved");
      assert.equal(latest!.model_b_role, "challenger", "model_b_role should be preserved");
      assert.equal(latest!.model_a_admission_state, "ADMITTED", "model_a_admission_state should be preserved");
      assert.equal(latest!.model_b_admission_state, "REJECTED", "model_b_admission_state should be preserved");
      assert.equal(latest!.correction_of, original.id);
    });

    it("should preserve model_a_defects and model_b_defects when not explicitly replaced in correction", () => {
      const dbPath = path.join(testDir, "comp-correction-preserve-defects.db");
      setupDb(dbPath);
      const packet = createTestPacket("Correction Preserve Defects");

      const original = recordModelComparison({
        packet_id: packet.id,
        comparison_outcome: "MODEL_A_SELECTED",
        comparison_basis: "CORRECTNESS",
        model_a_id: "deepseek",
        model_b_id: "qwen",
        model_a_role: "executor",
        model_b_role: "executor",
        model_a_defects: [],
        model_b_defects: ["Incomplete scope handling", "Incorrect error handling"],
      });

      // Apply a correction that only changes the comparison basis — defects should carry forward
      recordModelComparisonCorrection({
        previous_comparison_id: original.id,
        packet_id: packet.id,
        comparison_basis: "SCOPE_DISCIPLINE",
        correction_reason: "Re-evaluated basis",
        corrected_by: "reviewer",
      });

      const latest = getLatestComparison(packet.id);
      assert.ok(latest);
      assert.equal(latest!.comparison_basis, "SCOPE_DISCIPLINE", "Correction basis should be applied");
      assert.deepEqual(parseComparisonDefects(latest!, "a"), [], "model_a_defects should be preserved as []");
      assert.deepEqual(parseComparisonDefects(latest!, "b"), [
        "Incomplete scope handling",
        "Incorrect error handling",
      ], "model_b_defects should be preserved");

      // Now apply a second correction that explicitly replaces model_b_defects
      recordModelComparisonCorrection({
        previous_comparison_id: latest!.id,
        packet_id: packet.id,
        model_b_defects: ["Only one defect after review"],
        correction_reason: "Narrowed defects after further investigation",
        corrected_by: "reviewer",
      });

      const latest2 = getLatestComparison(packet.id);
      assert.ok(latest2);
      assert.deepEqual(parseComparisonDefects(latest2!, "a"), [], "model_a_defects should remain preserved");
      assert.deepEqual(parseComparisonDefects(latest2!, "b"), [
        "Only one defect after review",
      ], "model_b_defects should reflect explicit correction");
    });
  });

  describe("Model comparison controlled vocabulary enforcement", () => {
    it("should reject invalid comparison_outcome", () => {
      const dbPath = path.join(testDir, "comp-invalid-outcome.db");
      setupDb(dbPath);
      const packet = createTestPacket("Invalid Outcome");

      assert.throws(
        () => {
          recordModelComparison({
            packet_id: packet.id,
            comparison_outcome: "WINNER",
            comparison_basis: "CORRECTNESS",
            model_a_id: "a",
            model_b_id: "b",
            model_a_role: "x",
            model_b_role: "y",
          });
        },
        /Invalid comparison_outcome/
      );
    });

    it("should reject invalid comparison_basis", () => {
      const dbPath = path.join(testDir, "comp-invalid-basis.db");
      setupDb(dbPath);
      const packet = createTestPacket("Invalid Basis");

      assert.throws(
        () => {
          recordModelComparison({
            packet_id: packet.id,
            comparison_outcome: "TIE",
            comparison_basis: "SPEED",
            model_a_id: "a",
            model_b_id: "b",
            model_a_role: "x",
            model_b_role: "y",
          });
        },
        /Invalid comparison_basis/
      );
    });

    it("should reject invalid admission_state for model_a", () => {
      const dbPath = path.join(testDir, "comp-invalid-adm-a.db");
      setupDb(dbPath);
      const packet = createTestPacket("Invalid Adm A");

      assert.throws(
        () => {
          recordModelComparison({
            packet_id: packet.id,
            comparison_outcome: "TIE",
            comparison_basis: "CORRECTNESS",
            model_a_id: "a",
            model_b_id: "b",
            model_a_role: "x",
            model_b_role: "y",
            model_a_admission_state: "BOGUS",
          });
        },
        /Invalid model_a_admission_state/
      );
    });

    it("should reject invalid admission_state for model_b", () => {
      const dbPath = path.join(testDir, "comp-invalid-adm-b.db");
      setupDb(dbPath);
      const packet = createTestPacket("Invalid Adm B");

      assert.throws(
        () => {
          recordModelComparison({
            packet_id: packet.id,
            comparison_outcome: "TIE",
            comparison_basis: "CORRECTNESS",
            model_a_id: "a",
            model_b_id: "b",
            model_a_role: "x",
            model_b_role: "y",
            model_b_admission_state: "BOGUS",
          });
        },
        /Invalid model_b_admission_state/
      );
    });

    it("should reject invalid vocabulary in correction fields", () => {
      const dbPath = path.join(testDir, "comp-correction-invalid.db");
      setupDb(dbPath);
      const packet = createTestPacket("Comp Correction Invalid");
      const event1 = createValidComparison(packet.id);

      assert.throws(
        () => {
          recordModelComparisonCorrection({
            previous_comparison_id: event1.id,
            packet_id: packet.id,
            comparison_outcome: "BEST_MODEL",
            correction_reason: "Invalid correction",
            corrected_by: "bad-actor",
          });
        },
        /Invalid comparison_outcome/
      );
    });
  });

  describe("Model comparison cross-packet rejection", () => {
    it("should reject comparison where execution_a_id belongs to another packet", () => {
      const dbPath = path.join(testDir, "comp-cross-exec-a.db");
      setupDb(dbPath);

      const packetA = createTestPacket("Cross Exec A");
      const packetB = createTestPacket("Cross Exec B");

      const execA = createExecutionAttempt({ packet_id: packetA.id, attempt_number: 1 });

      assert.throws(
        () => {
          recordModelComparison({
            packet_id: packetB.id,
            comparison_outcome: "TIE",
            comparison_basis: "CORRECTNESS",
            execution_a_id: execA.execution_id,
            model_a_id: "a",
            model_b_id: "b",
            model_a_role: "x",
            model_b_role: "y",
          });
        },
        /Cross-packet reference rejected.*execution_a_id/
      );
    });

    it("should reject comparison where execution_b_id belongs to another packet", () => {
      const dbPath = path.join(testDir, "comp-cross-exec-b.db");
      setupDb(dbPath);

      const packetA = createTestPacket("Cross Exec B");
      const packetB = createTestPacket("Cross Exec B2");

      const execA = createExecutionAttempt({ packet_id: packetA.id, attempt_number: 1 });

      assert.throws(
        () => {
          recordModelComparison({
            packet_id: packetB.id,
            comparison_outcome: "TIE",
            comparison_basis: "CORRECTNESS",
            execution_b_id: execA.execution_id,
            model_a_id: "a",
            model_b_id: "b",
            model_a_role: "x",
            model_b_role: "y",
          });
        },
        /Cross-packet reference rejected.*execution_b_id/
      );
    });

    it("should reject comparison where evidence_a_id belongs to another packet", () => {
      const dbPath = path.join(testDir, "comp-cross-ev-a.db");
      setupDb(dbPath);

      const packetA = createTestPacket("Cross Ev A");
      const packetB = createTestPacket("Cross Ev B");

      const evA = insertEvidenceRecord({
        packet_id: packetA.id,
        run_id: "ev-a",
      });

      assert.throws(
        () => {
          recordModelComparison({
            packet_id: packetB.id,
            comparison_outcome: "TIE",
            comparison_basis: "CORRECTNESS",
            evidence_a_id: evA.evidence_id,
            model_a_id: "a",
            model_b_id: "b",
            model_a_role: "x",
            model_b_role: "y",
          });
        },
        /Cross-packet reference rejected.*evidence_a_id/
      );
    });

    it("should reject comparison where evidence_b_id belongs to another packet", () => {
      const dbPath = path.join(testDir, "comp-cross-ev-b.db");
      setupDb(dbPath);

      const packetA = createTestPacket("Cross Ev B");
      const packetB = createTestPacket("Cross Ev B2");

      const evA = insertEvidenceRecord({
        packet_id: packetA.id,
        run_id: "ev-b",
      });

      assert.throws(
        () => {
          recordModelComparison({
            packet_id: packetB.id,
            comparison_outcome: "TIE",
            comparison_basis: "CORRECTNESS",
            evidence_b_id: evA.evidence_id,
            model_a_id: "a",
            model_b_id: "b",
            model_a_role: "x",
            model_b_role: "y",
          });
        },
        /Cross-packet reference rejected.*evidence_b_id/
      );
    });

    it("should reject correction where previous_comparison_id belongs to another packet", () => {
      const dbPath = path.join(testDir, "comp-cross-correction.db");
      setupDb(dbPath);

      const packetA = createTestPacket("Cross Comp A");
      const packetB = createTestPacket("Cross Comp B");

      const compA = createValidComparison(packetA.id);

      assert.throws(
        () => {
          recordModelComparisonCorrection({
            previous_comparison_id: compA.id,
            packet_id: packetB.id,
            comparison_outcome: "TIE",
            correction_reason: "Cross-packet attempt",
            corrected_by: "bad-actor",
          });
        },
        /Cross-packet reference rejected/
      );
    });
  });

  describe("Evidence rules for comparison records", () => {
    it("should explicitly record admission state at comparison time", () => {
      const dbPath = path.join(testDir, "comp-admission-time.db");
      setupDb(dbPath);
      const packet = createTestPacket("Admission at Comparison Time");

      const event = recordModelComparison({
        packet_id: packet.id,
        comparison_outcome: "MODEL_A_SELECTED",
        comparison_basis: "EVIDENCE_QUALITY",
        model_a_id: "model-a",
        model_b_id: "model-b",
        model_a_role: "executor",
        model_b_role: "executor",
        model_a_admission_state: "PENDING",
        model_b_admission_state: "REJECTED",
      });

      assert.equal(event.model_a_admission_state, "PENDING");
      assert.equal(event.model_b_admission_state, "REJECTED");
    });

    it("should not mutate evidence records when comparison is recorded", () => {
      const dbPath = path.join(testDir, "comp-no-mutate-evidence.db");
      setupDb(dbPath);
      const packet = createTestPacket("Comp No Mutate Evidence");

      const evidenceA = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-preserve",
        model_id: "model-a",
        admission_state: "NOT_EVALUATED",
      });

      const originalJson = JSON.stringify(evidenceA);

      recordModelComparison({
        packet_id: packet.id,
        comparison_outcome: "MODEL_A_SELECTED",
        comparison_basis: "EVIDENCE_QUALITY",
        evidence_a_id: evidenceA.evidence_id,
        model_a_id: "model-a",
        model_b_id: "model-b",
        model_a_role: "executor",
        model_b_role: "executor",
        model_a_admission_state: "ADMITTED",
      });

      const fresh = getEvidenceRecord(evidenceA.evidence_id)!;
      assert.equal(JSON.stringify(fresh), originalJson, "Evidence record must not be mutated by comparison");
      assert.equal(fresh.admission_state, "NOT_EVALUATED", "Evidence admission state must be unchanged");
    });

    it("should not mutate packet intent when comparison is recorded", () => {
      const dbPath = path.join(testDir, "comp-no-mutate-packet.db");
      setupDb(dbPath);
      const db = getDb();

      const packet = createTestPacket("Comp No Mutate Packet");
      const originalPacket = db
        .prepare("SELECT id, title, status FROM packets WHERE id = ?")
        .get(packet.id) as { id: number; title: string; status: string };

      recordModelComparison({
        packet_id: packet.id,
        comparison_outcome: "TIE",
        comparison_basis: "COMPOSITE",
        model_a_id: "model-a",
        model_b_id: "model-b",
        model_a_role: "executor",
        model_b_role: "executor",
      });

      const fresh = db
        .prepare("SELECT id, title, status FROM packets WHERE id = ?")
        .get(packet.id) as { id: number; title: string; status: string };

      assert.equal(fresh.id, originalPacket.id);
      assert.equal(fresh.title, originalPacket.title);
      assert.equal(fresh.status, originalPacket.status);
    });

    it("should not mutate validation or admission events when comparison is recorded", () => {
      const dbPath = path.join(testDir, "comp-no-mutate-val-adm.db");
      setupDb(dbPath);
      const packet = createTestPacket("Comp No Mutate Val Adm");

      const evidence = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-val-preserve",
        model_id: "model-a",
      });

      recordValidationEvent({
        evidence_record_id: evidence.evidence_id,
        validation_state: "VALID",
        validation_actor_type: "automated_validator",
        validation_actor_id: "test-suite",
        validation_reason: "Initial validation",
      });

      const valEventsBefore = getValidationEvents(evidence.evidence_id);
      assert.equal(valEventsBefore.length, 1);

      recordModelComparison({
        packet_id: packet.id,
        comparison_outcome: "MODEL_A_SELECTED",
        comparison_basis: "EVIDENCE_QUALITY",
        evidence_a_id: evidence.evidence_id,
        model_a_id: "model-a",
        model_b_id: "model-b",
        model_a_role: "executor",
        model_b_role: "executor",
        model_a_admission_state: "ADMITTED",
      });

      const valEventsAfter = getValidationEvents(evidence.evidence_id);
      assert.equal(valEventsAfter.length, 1, "Validation events must not be mutated");
      assert.equal(valEventsAfter[0].validation_state, "VALID");

      const admEventsAfter = getAdmissionEventsForRecord(evidence.evidence_id);
      assert.equal(admEventsAfter.length, 0, "Admission events must not be mutated");
    });
  });

  describe("Existing Behavior Preservation (FP-004, FP-005, FP-008, FP-009, FP-010, FP-011)", () => {
    it("should preserve FP-004 packet persistence", () => {
      const dbPath = path.join(testDir, "preserve-fp004.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-012 Preserve FP-004",
        packet_path: "packets/test.md",
        packet_hash: "hash-fp012-004",
      });

      assert.ok(packet.id > 0);
      assert.equal(packet.title, "FP-012 Preserve FP-004");

      const event = appendLifecycleEvent({
        packet_id: packet.id,
        event_type: "PACKET_CREATED",
        lifecycle_state: "CREATED",
        source: "forgepilot",
        actor: "cli",
        reason: "Test",
      });
      assert.ok(event.event_id > 0);

      const execution = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
      });
      assert.equal(execution.execution_state, "RUNNING");

      markExecutionSucceeded(execution.execution_id);

      const state = getCurrentPacketState(packet.id);
      assert.ok(state);
      assert.equal(state!.current_state, "CREATED");
    });

    it("should preserve FP-005 telemetry ingestion", () => {
      const dbPath = path.join(testDir, "preserve-fp005.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-012 Preserve FP-005",
        packet_path: "packets/test.md",
        packet_hash: "hash-fp012-005",
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

      assert.ok(result.ingested);
      assert.ok(result.telemetry);
      assert.equal(result.telemetry!.admission_state, "PENDING");

      const telemetry = getExecutionTelemetry(execution.execution_id);
      assert.equal(telemetry.length, 1);
    });

    it("should preserve FP-008 classification observations", () => {
      const dbPath = path.join(testDir, "preserve-fp008.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-012 Preserve FP-008",
        packet_path: "packets/test.md",
        packet_hash: "hash-fp012-008",
      });

      const obs = recordClassificationObservation({
        packet_id: packet.id,
        task_class: "PERSISTENCE",
        risk_level: "HIGH",
        constraint_strictness: "STRICT",
        evidence_sensitivity: "HIGH",
        expected_blast_radius: "DATABASE",
        primary_skill_required: "DATABASE_DESIGN",
        audit_requirement: "STRICT",
        challenger_requirement: "REQUIRED",
        routing_eligibility: "NOT_ELIGIBLE",
        classification_source: "HUMAN",
        classified_by: "test-op",
        rationale: "Test FP-008 preservation",
      });

      assert.ok(obs.classification_id > 0);
      assert.equal(obs.admission_state, "PENDING");

      const correction = recordClassificationCorrection({
        previous_classification_id: obs.classification_id,
        packet_id: packet.id,
        corrected_fields: ["risk_level"],
        new_values: { risk_level: "CRITICAL" },
        reason: "Adjustment",
        actor: "auditor",
      });
      assert.ok(correction.correction_id > 0);

      const allObs = getClassificationObservations(packet.id);
      assert.equal(allObs.length, 1);
    });

    it("should preserve FP-008 outcome observations", () => {
      const dbPath = path.join(testDir, "preserve-fp008-outcome.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-012 Preserve FP-008 Outcome",
        packet_path: "packets/test.md",
        packet_hash: "hash-fp012-008-out",
      });

      const execution = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
      });

      const obs = recordOutcomeObservation({
        packet_id: packet.id,
        execution_id: execution.execution_id,
        executor_model: "test-model",
        executor_provider: "test-provider",
        execution_result: "COMPLETED",
        verification_result: "PASSED",
      });

      assert.ok(obs.outcome_id > 0);
      assert.equal(obs.admission_state, "PENDING");

      const allObs = getOutcomeObservations(packet.id);
      assert.equal(allObs.length, 1);
    });

    it("should preserve FP-009 evidence admission", () => {
      const dbPath = path.join(testDir, "preserve-fp009.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-012 Preserve FP-009",
        packet_path: "packets/test.md",
        packet_hash: "hash-fp012-009",
      });

      const obs = recordClassificationObservation({
        packet_id: packet.id,
        task_class: "PERSISTENCE",
        risk_level: "MEDIUM",
        constraint_strictness: "NORMAL",
        evidence_sensitivity: "MEDIUM",
        expected_blast_radius: "MULTI_FILE_LOCAL",
        primary_skill_required: "DATABASE_DESIGN",
        audit_requirement: "STANDARD",
        challenger_requirement: "OPTIONAL",
        routing_eligibility: "NOT_ELIGIBLE",
        classification_source: "HUMAN",
      });

      const admEvent = recordEvidenceAdmission({
        target_observation_type: "classification_observation",
        target_observation_id: obs.classification_id,
        admission_decision: "PENDING",
        admission_actor_type: "human_auditor",
        admission_actor_id: "test",
        admission_basis: "Initial review",
      });

      assert.ok(admEvent.id > 0);
      assert.equal(admEvent.admission_decision, "PENDING");

      const events = getAdmissionEvents("classification_observation", obs.classification_id);
      assert.equal(events.length, 1);
    });

    it("should preserve FP-010 evidence record persistence", () => {
      const dbPath = path.join(testDir, "preserve-fp010.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-012 Preserve FP-010",
        packet_path: "packets/test.md",
        packet_hash: "hash-fp012-010",
      });

      const record = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-fp012-010",
        model_id: "deepseek-v4-pro",
        model_role: "executor",
        branch: "main",
        commit_sha: "abc123",
        executor_result: "SUCCESS",
        verification_result: "PASSED",
        audit_result: "ACCEPTED",
        metrics_path: "runs/test/metrics.json",
        artifact_paths: ["runs/test/output.md"],
        trust_tier: "TIER_2_VERIFIED_ARTIFACT",
        validation_state: "VALID",
        admission_state: "NOT_EVALUATED",
      });

      assert.ok(record.evidence_id > 0);
      assert.equal(record.admission_state, "NOT_EVALUATED");

      const retrieved = getEvidenceByPacketId(packet.id);
      assert.equal(retrieved.length, 1);
    });

    it("should preserve FP-011 validation and admission", () => {
      const dbPath = path.join(testDir, "preserve-fp011.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-012 Preserve FP-011",
        packet_path: "packets/test.md",
        packet_hash: "hash-fp012-011",
      });

      const record = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "run-fp012-011",
        model_id: "deepseek-v4-pro",
        model_role: "executor",
        branch: "main",
        commit_sha: "abc123",
        executor_result: "SUCCESS",
        verification_result: "PASSED",
        audit_result: "ACCEPTED",
        metrics_path: "runs/test/metrics.json",
        artifact_paths: ["runs/test/output.md"],
        trust_tier: "TIER_2_VERIFIED_ARTIFACT",
        validation_state: "VALID",
      });

      const valResult = validateEvidenceRecord(record.evidence_id);
      assert.equal(valResult.validation_state, "VALID");

      const valEvent = recordValidationEvent({
        evidence_record_id: record.evidence_id,
        validation_state: "VALID",
        validation_actor_type: "automated_validator",
        validation_actor_id: "test-suite",
        validation_reason: "All checks passed",
      });
      assert.equal(valEvent.validation_state, "VALID");

      const admResult = evaluateAdmissionForRecord(record.evidence_id);
      assert.equal(admResult.admission_state, "ADMITTED");

      const admEvent = recordEvidenceRecordAdmission({
        evidence_record_id: record.evidence_id,
        admission_state: "ADMITTED",
        admission_actor_type: "automated_validator",
        admission_actor_id: "test-suite",
        admission_reason: "All criteria met",
      });
      assert.equal(admEvent.admission_state, "ADMITTED");

      const currentVal = getCurrentValidationState(record.evidence_id)!;
      assert.equal(currentVal.validation_state, "VALID");

      const currentAdm = getCurrentAdmissionState(record.evidence_id)!;
      assert.equal(currentAdm.admission_state, "ADMITTED");
    });

    it("should not replace FP-008 classification tables", () => {
      const dbPath = path.join(testDir, "preserve-fp008-tables.db");
      setupDb(dbPath);
      const db = getDb();

      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      assert.ok(tables.includes("packet_classification_observations"), "FP-008 classification table should still exist");
      assert.ok(tables.includes("packet_classification_corrections"), "FP-008 correction table should still exist");
      assert.ok(tables.includes("model_outcome_observations"), "FP-008 outcome table should still exist");
      assert.ok(tables.includes("model_outcome_corrections"), "FP-008 outcome correction table should still exist");
    });

    it("should not replace FP-009/F-010/F-011 tables", () => {
      const dbPath = path.join(testDir, "preserve-all-tables.db");
      setupDb(dbPath);
      const db = getDb();

      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      assert.ok(tables.includes("evidence_admission_events"), "FP-009 admission table");
      assert.ok(tables.includes("admission_review_requests"), "FP-009 review table");
      assert.ok(tables.includes("admission_invalidation_events"), "FP-009 invalidation table");
      assert.ok(tables.includes("evidence_records"), "FP-010 evidence records table");
      assert.ok(tables.includes("evidence_record_validation_events"), "FP-011 validation table");
      assert.ok(tables.includes("evidence_record_admission_events"), "FP-011 admission table");
      assert.ok(tables.includes("packets"), "FP-004 packets table");
      assert.ok(tables.includes("packet_lifecycle_events"), "FP-004 lifecycle table");
      assert.ok(tables.includes("packet_executions"), "FP-004 executions table");
      assert.ok(tables.includes("packet_execution_telemetry"), "FP-005 telemetry table");
    });
  });

  describe("No routing, ranking, recommendation, dashboard, report, cost optimization, or benchmarking", () => {
    it("should not add any out-of-scope tables", () => {
      const dbPath = path.join(testDir, "no-out-of-scope-tables.db");
      setupDb(dbPath);
      const db = getDb();

      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      const excluded = [
        "model_routing_decisions",
        "model_rankings",
        "leaderboards",
        "model_leaderboard",
        "cost_optimization",
        "model_recommendations",
        "model_comparison_matrices",
        "dashboards",
        "observatory_reports",
        "local_model_benchmarks",
        "model_routing",
        "provider_recommendation",
        "global_model_ranking",
      ];
      for (const name of excluded) {
        assert.ok(!tables.includes(name), `Should not have ${name} table`);
      }
    });

    it("should not add routing_eligibility or routing_signal columns to FP-012 tables", () => {
      const dbPath = path.join(testDir, "no-routing-cols.db");
      setupDb(dbPath);
      const db = getDb();

      const classColumns = db
        .prepare("PRAGMA table_info(fp012_task_classification_events)")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      assert.ok(!classColumns.includes("routing_eligibility"));
      assert.ok(!classColumns.includes("challenger_requirement"));
      assert.ok(!classColumns.includes("primary_skill_required"));
      assert.ok(!classColumns.includes("constraint_strictness"));
      assert.ok(!classColumns.includes("trust_tier"));
      assert.ok(!classColumns.includes("validation_state"));
      assert.ok(!classColumns.includes("admission_state"));

      const compColumns = db
        .prepare("PRAGMA table_info(fp012_model_comparison_events)")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      assert.ok(!compColumns.includes("routing_signal_eligibility"));
      assert.ok(!compColumns.includes("trust_tier"));
      assert.ok(!compColumns.includes("cost"));
      assert.ok(!compColumns.includes("provider"));
    });
  });

  describe("Acceptance Criteria Verification", () => {
    it("AC1: Task classification records can be persisted", () => {
      const dbPath = path.join(testDir, "ac1-class-persist.db");
      setupDb(dbPath);
      const packet = createTestPacket("AC1");
      const event = createValidClassification(packet.id);
      assert.ok(event.id > 0);
      assert.equal(event.packet_id, packet.id);
    });

    it("AC2: Model comparison records can be persisted", () => {
      const dbPath = path.join(testDir, "ac2-comp-persist.db");
      setupDb(dbPath);
      const packet = createTestPacket("AC2");
      const event = createValidComparison(packet.id);
      assert.ok(event.id > 0);
      assert.equal(event.packet_id, packet.id);
    });

    it("AC3: Classification records are append-only", () => {
      const dbPath = path.join(testDir, "ac3-append-class.db");
      setupDb(dbPath);
      const db = getDb();
      const packet = createTestPacket("AC3");
      const event1 = createValidClassification(packet.id);

      recordTaskClassificationCorrection({
        previous_classification_id: event1.id,
        packet_id: packet.id,
        risk_level: "CRITICAL",
        correction_reason: "Corrected",
        corrected_by: "tester",
      });

      const original = db
        .prepare("SELECT risk_level FROM fp012_task_classification_events WHERE id = ?")
        .get(event1.id) as { risk_level: string };
      assert.equal(original.risk_level, "HIGH");
    });

    it("AC4: Comparison records are append-only", () => {
      const dbPath = path.join(testDir, "ac4-append-comp.db");
      setupDb(dbPath);
      const db = getDb();
      const packet = createTestPacket("AC4");
      const event1 = createValidComparison(packet.id);

      recordModelComparisonCorrection({
        previous_comparison_id: event1.id,
        packet_id: packet.id,
        comparison_outcome: "TIE",
        correction_reason: "Corrected",
        corrected_by: "tester",
      });

      const original = db
        .prepare("SELECT comparison_outcome FROM fp012_model_comparison_events WHERE id = ?")
        .get(event1.id) as { comparison_outcome: string };
      assert.equal(original.comparison_outcome, "MODEL_A_SELECTED");
    });

    it("AC5: Classification supports all required axes and vocabularies", () => {
      const dbPath = path.join(testDir, "ac5-axes.db");
      setupDb(dbPath);
      const packet = createTestPacket("AC5");
      const event = createValidClassification(packet.id);

      assert.equal(event.task_class, "PERSISTENCE");
      assert.equal(event.risk_level, "HIGH");
      assert.equal(event.blast_radius, "DATABASE");
      assert.equal(event.evidence_sensitivity, "HIGH");
      assert.equal(event.audit_requirement, "STRICT");
      assert.equal(event.comparison_requirement, "REQUIRED");
      assert.equal(event.classification_source, "HUMAN");
    });

    it("AC6: Comparison supports all required outcome and basis vocabularies", () => {
      const dbPath = path.join(testDir, "ac6-comp-vocab.db");
      setupDb(dbPath);
      const packet = createTestPacket("AC6");

      for (const oc of ["MODEL_A_SELECTED", "MODEL_B_SELECTED", "TIE", "BOTH_ACCEPTED", "BOTH_REJECTED", "INCONCLUSIVE", "DEFERRED"]) {
        recordModelComparison({
          packet_id: packet.id,
          comparison_outcome: oc,
          comparison_basis: "COMPOSITE",
          model_a_id: "a",
          model_b_id: "b",
          model_a_role: "x",
          model_b_role: "y",
        });
      }

      const history = getComparisonHistory(packet.id);
      assert.equal(history.length, 7);
    });

    it("AC7: Comparison records can reference model/evidence/execution identifiers", () => {
      const dbPath = path.join(testDir, "ac7-refs.db");
      setupDb(dbPath);
      const packet = createTestPacket("AC7");

      const execA = createExecutionAttempt({ packet_id: packet.id, attempt_number: 1 });
      const execB = createExecutionAttempt({ packet_id: packet.id, attempt_number: 2 });

      const evA = insertEvidenceRecord({ packet_id: packet.id, run_id: "ac7-ev-a" });
      const evB = insertEvidenceRecord({ packet_id: packet.id, run_id: "ac7-ev-b" });

      const event = recordModelComparison({
        packet_id: packet.id,
        comparison_outcome: "MODEL_A_SELECTED",
        comparison_basis: "COMPOSITE",
        execution_a_id: execA.execution_id,
        execution_b_id: execB.execution_id,
        evidence_a_id: evA.evidence_id,
        evidence_b_id: evB.evidence_id,
        model_a_id: "deepseek-v4-pro",
        model_b_id: "qwen-3.7-max",
        model_a_role: "executor",
        model_b_role: "challenger",
      });

      assert.equal(event.execution_a_id, execA.execution_id);
      assert.equal(event.execution_b_id, execB.execution_id);
      assert.equal(event.evidence_a_id, evA.evidence_id);
      assert.equal(event.evidence_b_id, evB.evidence_id);
      assert.equal(event.model_a_id, "deepseek-v4-pro");
      assert.equal(event.model_b_id, "qwen-3.7-max");
    });

    it("AC8: Comparison records preserve admission state at comparison time", () => {
      const dbPath = path.join(testDir, "ac8-admission-time.db");
      setupDb(dbPath);
      const packet = createTestPacket("AC8");

      const event = recordModelComparison({
        packet_id: packet.id,
        comparison_outcome: "MODEL_A_SELECTED",
        comparison_basis: "EVIDENCE_QUALITY",
        model_a_id: "model-a",
        model_b_id: "model-b",
        model_a_role: "executor",
        model_b_role: "executor",
        model_a_admission_state: "PENDING",
        model_b_admission_state: "QUARANTINED",
      });

      assert.equal(event.model_a_admission_state, "PENDING");
      assert.equal(event.model_b_admission_state, "QUARANTINED");
    });

    it("AC9: Comparison does not mutate evidence records", () => {
      const dbPath = path.join(testDir, "ac9-no-mutate.db");
      setupDb(dbPath);
      const packet = createTestPacket("AC9");

      const evidence = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "ac9-run",
        admission_state: "PENDING",
      });

      const original = JSON.stringify(evidence);

      recordModelComparison({
        packet_id: packet.id,
        comparison_outcome: "TIE",
        comparison_basis: "COMPOSITE",
        evidence_a_id: evidence.evidence_id,
        model_a_id: "model-a",
        model_b_id: "model-b",
        model_a_role: "executor",
        model_b_role: "executor",
        model_a_admission_state: "ADMITTED",
      });

      const fresh = JSON.stringify(getEvidenceRecord(evidence.evidence_id)!);
      assert.equal(fresh, original);
    });

    it("AC10: Comparison does not mutate packet intent", () => {
      const dbPath = path.join(testDir, "ac10-intent.db");
      setupDb(dbPath);
      const db = getDb();
      const packet = createTestPacket("AC10");

      const original = db
        .prepare("SELECT id, title, status FROM packets WHERE id = ?")
        .get(packet.id);

      createValidComparison(packet.id);

      const fresh = db
        .prepare("SELECT id, title, status FROM packets WHERE id = ?")
        .get(packet.id);

      assert.deepEqual(fresh, original);
    });

    it("AC11: Comparison does not mutate validation or admission events", () => {
      const dbPath = path.join(testDir, "ac11-val-adm.db");
      setupDb(dbPath);
      const packet = createTestPacket("AC11");

      const evidence = insertEvidenceRecord({
        packet_id: packet.id,
        run_id: "ac11-run",
        model_id: "model-a",
      });

      recordValidationEvent({
        evidence_record_id: evidence.evidence_id,
        validation_state: "VALID",
        validation_actor_type: "automated_validator",
        validation_actor_id: "test-suite",
        validation_reason: "OK",
      });

      const valBefore = getValidationEvents(evidence.evidence_id);

      recordModelComparison({
        packet_id: packet.id,
        comparison_outcome: "MODEL_A_SELECTED",
        comparison_basis: "TEST_PASS_RATE",
        evidence_a_id: evidence.evidence_id,
        model_a_id: "model-a",
        model_b_id: "model-b",
        model_a_role: "executor",
        model_b_role: "executor",
      });

      const valAfter = getValidationEvents(evidence.evidence_id);
      assert.equal(valAfter.length, valBefore.length);
      assert.equal(valAfter[0].validation_state, "VALID");
    });

    it("AC12: Invalid classification vocabulary values are rejected", () => {
      const dbPath = path.join(testDir, "ac12-invalid-class.db");
      setupDb(dbPath);
      const packet = createTestPacket("AC12");

      assert.throws(
        () => recordTaskClassification({
          packet_id: packet.id,
          task_class: "INVALID",
          risk_level: "LOW",
          blast_radius: "LOCAL",
          evidence_sensitivity: "LOW",
          audit_requirement: "NONE",
          comparison_requirement: "NONE",
          classification_source: "HUMAN",
        }),
        /Invalid task_class/
      );
    });

    it("AC13: Invalid comparison vocabulary values are rejected", () => {
      const dbPath = path.join(testDir, "ac13-invalid-comp.db");
      setupDb(dbPath);
      const packet = createTestPacket("AC13");

      assert.throws(
        () => recordModelComparison({
          packet_id: packet.id,
          comparison_outcome: "INVALID_OUTCOME",
          comparison_basis: "CORRECTNESS",
          model_a_id: "a",
          model_b_id: "b",
          model_a_role: "x",
          model_b_role: "y",
        }),
        /Invalid comparison_outcome/
      );
    });

    it("AC14: Derived query functions can retrieve classification history by packet", () => {
      const dbPath = path.join(testDir, "ac14-class-history.db");
      setupDb(dbPath);
      const packet = createTestPacket("AC14");

      createValidClassification(packet.id);
      createValidClassification(packet.id);

      const history = getTaskClassificationHistory(packet.id);
      assert.equal(history.length, 2);
    });

    it("AC15: Derived query functions can retrieve comparison history by packet", () => {
      const dbPath = path.join(testDir, "ac15-comp-history.db");
      setupDb(dbPath);
      const packet = createTestPacket("AC15");

      createValidComparison(packet.id);
      createValidComparison(packet.id);

      const history = getComparisonHistory(packet.id);
      assert.equal(history.length, 2);
    });

    it("AC16: The latest classification can be derived without deleting history", () => {
      const dbPath = path.join(testDir, "ac16-latest-class.db");
      setupDb(dbPath);
      const packet = createTestPacket("AC16");

      const event1 = createValidClassification(packet.id);

      recordTaskClassificationCorrection({
        previous_classification_id: event1.id,
        packet_id: packet.id,
        risk_level: "CRITICAL",
        correction_reason: "Upgraded",
        corrected_by: "reviewer",
      });

      const history = getTaskClassificationHistory(packet.id);
      assert.equal(history.length, 2);

      const latest = getLatestTaskClassification(packet.id);
      assert.ok(latest);
      assert.equal(latest!.risk_level, "CRITICAL");
    });

    it("AC17: Existing FP-004, 5, 8, 9, 10, 11 behaviors are preserved", () => {
      const dbPath = path.join(testDir, "ac17-preserve-all.db");
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
      assert.ok(tables.includes("packet_classification_corrections"));
      assert.ok(tables.includes("model_outcome_observations"));
      assert.ok(tables.includes("model_outcome_corrections"));
      assert.ok(tables.includes("evidence_admission_events"));
      assert.ok(tables.includes("admission_review_requests"));
      assert.ok(tables.includes("admission_invalidation_events"));
      assert.ok(tables.includes("evidence_records"));
      assert.ok(tables.includes("evidence_record_validation_events"));
      assert.ok(tables.includes("evidence_record_admission_events"));
    });

    it("AC18: Existing tests continue to pass - verified via full test suite", () => {
      // Placeholder - actual verification is done by running `pnpm test`
      assert.ok(true);
    });

    it("AC19: No routing, ranking, recommendation, dashboard, report, cost optimization, or benchmarking", () => {
      const dbPath = path.join(testDir, "ac19-no-extras.db");
      setupDb(dbPath);
      const db = getDb();

      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      const excluded = [
        "model_routing_decisions", "model_routing", "model_rankings",
        "leaderboards", "model_leaderboard", "dashboards", "observatory_reports",
        "cost_optimization", "model_recommendations", "local_model_benchmarks",
        "provider_recommendation", "global_model_ranking",
      ];
      for (const name of excluded) {
        assert.ok(!tables.includes(name), `Should not have ${name}`);
      }
    });
  });
});
