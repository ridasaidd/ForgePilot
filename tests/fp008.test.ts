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
  getClassificationObservation,
  getClassificationCorrections,
} from "../src/db/classification.js";
import {
  recordOutcomeObservation,
  recordOutcomeCorrection,
  getOutcomeObservations,
  getOutcomeObservation,
  getOutcomeCorrections,
} from "../src/db/outcome.js";

let testDir: string;

before(() => {
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), "forgepilot-fp008-"));
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

function createTestPacket(title: string = "FP-008 Test Packet") {
  return recordPacketIntent({
    title,
    packet_path: `packets/${title.replace(/\s+/g, "-")}.md`,
    packet_hash: `hash-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  });
}

function createValidClassification(packet_id: number) {
  return recordClassificationObservation({
    packet_id,
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
    classified_by: "test-operator",
    rationale: "Test classification for FP-008",
  });
}

function createValidOutcome(packet_id: number, execution_id?: number, classification_id?: number) {
  return recordOutcomeObservation({
    packet_id,
    execution_id: execution_id ?? null,
    packet_classification_id: classification_id ?? null,
    executor_model: "test-model",
    executor_provider: "test-provider",
    execution_result: "COMPLETED",
    verification_result: "PASSED",
    audit_result: "NOT_AUDITED",
  });
}

describe("FP-008: Classification and Outcome Persistence", () => {
  describe("Migration", () => {
    it("should be idempotent (running migrate twice does not fail)", () => {
      const dbPath = path.join(testDir, "idempotent-fp008.db");
      closeDb();
      initDb(dbPath);
      migrate();
      migrate();

      const db = getDb();
      const rows = db
        .prepare("SELECT name FROM _migrations WHERE name = ?")
        .all("004_fp008_classification_outcome.sql") as { name: string }[];

      assert.equal(rows.length, 1, "Migration 004 should only be recorded once");
    });

    it("should create all required FP-008 tables", () => {
      const dbPath = path.join(testDir, "required-tables.db");
      setupDb(dbPath);
      const db = getDb();

      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      assert.ok(tables.includes("packet_classification_observations"), "packet_classification_observations should exist");
      assert.ok(tables.includes("packet_classification_corrections"), "packet_classification_corrections should exist");
      assert.ok(tables.includes("model_outcome_observations"), "model_outcome_observations should exist");
      assert.ok(tables.includes("model_outcome_corrections"), "model_outcome_corrections should exist");
    });

    it("should create required columns in packet_classification_observations", () => {
      const dbPath = path.join(testDir, "classification-columns.db");
      setupDb(dbPath);
      const db = getDb();

      const columns = db
        .prepare("PRAGMA table_info(packet_classification_observations)")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      const required = [
        "classification_id", "packet_id", "task_class", "secondary_task_classes",
        "risk_level", "constraint_strictness", "evidence_sensitivity",
        "expected_blast_radius", "primary_skill_required", "audit_requirement",
        "challenger_requirement", "routing_eligibility", "classified_by",
        "classification_source", "rationale", "trust_tier", "validation_state",
        "admission_state", "created_at",
      ];
      for (const col of required) {
        assert.ok(columns.includes(col), `packet_classification_observations.${col} should exist`);
      }
    });

    it("should create required columns in packet_classification_corrections", () => {
      const dbPath = path.join(testDir, "classification-corr-columns.db");
      setupDb(dbPath);
      const db = getDb();

      const columns = db
        .prepare("PRAGMA table_info(packet_classification_corrections)")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      const required = [
        "correction_id", "previous_classification_id", "packet_id",
        "corrected_fields", "new_values", "reason", "actor", "created_at",
      ];
      for (const col of required) {
        assert.ok(columns.includes(col), `packet_classification_corrections.${col} should exist`);
      }
    });

    it("should create required columns in model_outcome_observations", () => {
      const dbPath = path.join(testDir, "outcome-columns.db");
      setupDb(dbPath);
      const db = getDb();

      const columns = db
        .prepare("PRAGMA table_info(model_outcome_observations)")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      const required = [
        "outcome_id", "packet_id", "packet_classification_id", "execution_id",
        "executor_model", "executor_provider", "execution_result", "verification_result",
        "audit_result", "first_pass_success", "correction_count", "correction_types",
        "scope_discipline", "semantic_correctness", "invariant_compliance",
        "human_intervention", "comparison_outcome", "compared_execution_references",
        "non_blocking_ambiguity", "root_cause_level", "routing_signal_eligibility",
        "telemetry_id", "audit_reference", "trust_tier", "validation_state",
        "admission_state", "created_at",
      ];
      for (const col of required) {
        assert.ok(columns.includes(col), `model_outcome_observations.${col} should exist`);
      }
    });

    it("should create required columns in model_outcome_corrections", () => {
      const dbPath = path.join(testDir, "outcome-corr-columns.db");
      setupDb(dbPath);
      const db = getDb();

      const columns = db
        .prepare("PRAGMA table_info(model_outcome_corrections)")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      const required = [
        "correction_id", "previous_outcome_id", "packet_id", "execution_id",
        "corrected_fields", "new_values", "reason", "actor", "created_at",
      ];
      for (const col of required) {
        assert.ok(columns.includes(col), `model_outcome_corrections.${col} should exist`);
      }
    });
  });

  describe("Classification observations", () => {
    it("should insert a classification observation with all required fields", () => {
      const dbPath = path.join(testDir, "classification-insert.db");
      setupDb(dbPath);

      const packet = createTestPacket("Classification Insert Test");
      const obs = createValidClassification(packet.id);

      assert.ok(obs.classification_id > 0);
      assert.equal(obs.packet_id, packet.id);
      assert.equal(obs.task_class, "PERSISTENCE");
      assert.equal(obs.risk_level, "HIGH");
      assert.equal(obs.constraint_strictness, "STRICT");
      assert.equal(obs.evidence_sensitivity, "HIGH");
      assert.equal(obs.expected_blast_radius, "DATABASE");
      assert.equal(obs.primary_skill_required, "DATABASE_DESIGN");
      assert.equal(obs.audit_requirement, "STRICT");
      assert.equal(obs.challenger_requirement, "REQUIRED");
      assert.equal(obs.routing_eligibility, "NOT_ELIGIBLE");
      assert.equal(obs.classified_by, "test-operator");
      assert.equal(obs.classification_source, "HUMAN");
      assert.equal(obs.rationale, "Test classification for FP-008");
      assert.ok(obs.created_at);
    });

    it("should support secondary_task_classes as JSON array", () => {
      const dbPath = path.join(testDir, "classification-secondary.db");
      setupDb(dbPath);

      const packet = createTestPacket("Secondary Classes Test");
      const obs = recordClassificationObservation({
        packet_id: packet.id,
        task_class: "PERSISTENCE",
        secondary_task_classes: ["VALIDATION", "SCHEMA"],
        risk_level: "MEDIUM",
        constraint_strictness: "NORMAL",
        evidence_sensitivity: "LOW",
        expected_blast_radius: "MULTI_FILE_LOCAL",
        primary_skill_required: "DATABASE_DESIGN",
        audit_requirement: "STANDARD",
        challenger_requirement: "OPTIONAL",
        routing_eligibility: "NOT_ELIGIBLE",
        classification_source: "MODEL_ASSISTED",
      });

      const parsed = JSON.parse(obs.secondary_task_classes);
      assert.deepEqual(parsed, ["VALIDATION", "SCHEMA"]);
    });

    it("should default classification observations to non-admitted state (PENDING)", () => {
      const dbPath = path.join(testDir, "classification-default-admission.db");
      setupDb(dbPath);

      const packet = createTestPacket("Default Admission Test");
      const obs = createValidClassification(packet.id);

      assert.equal(obs.admission_state, "PENDING", "Classification must default to PENDING");
      assert.notEqual(obs.admission_state, "ADMITTED", "Classification must not be ADMITTED by default");
    });

    it("should reject explicit ADMITTED for classification observations", () => {
      const dbPath = path.join(testDir, "classification-reject-admitted.db");
      setupDb(dbPath);

      const packet = createTestPacket("Reject Admitted Classification");

      assert.throws(
        () => {
          recordClassificationObservation({
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
            admission_state: "ADMITTED",
          });
        },
        /ADMITTED is not allowed/,
        "API should reject explicit ADMITTED for classification observations"
      );
    });
  });

  describe("Classification corrections", () => {
    it("should insert a classification correction referencing previous observation", () => {
      const dbPath = path.join(testDir, "classification-correction.db");
      setupDb(dbPath);

      const packet = createTestPacket("Correction Test");
      const obs = createValidClassification(packet.id);

      const correction = recordClassificationCorrection({
        previous_classification_id: obs.classification_id,
        packet_id: packet.id,
        corrected_fields: ["risk_level"],
        new_values: { risk_level: "CRITICAL" },
        reason: "Discovered higher impact than initially assessed",
        actor: "test-auditor",
      });

      assert.ok(correction.correction_id > 0);
      assert.equal(correction.previous_classification_id, obs.classification_id);
      assert.equal(correction.packet_id, packet.id);
      assert.equal(JSON.parse(correction.corrected_fields)[0], "risk_level");
      assert.equal(JSON.parse(correction.new_values).risk_level, "CRITICAL");
      assert.equal(correction.reason, "Discovered higher impact than initially assessed");
      assert.equal(correction.actor, "test-auditor");
    });

    it("should not overwrite previous classification observations", () => {
      const dbPath = path.join(testDir, "classification-no-overwrite.db");
      setupDb(dbPath);

      const packet = createTestPacket("No Overwrite Test");
      const obs = createValidClassification(packet.id);

      recordClassificationCorrection({
        previous_classification_id: obs.classification_id,
        packet_id: packet.id,
        corrected_fields: ["risk_level"],
        new_values: { risk_level: "CRITICAL" },
        reason: "Correction reason",
        actor: "auditor",
      });

      const originalObs = getClassificationObservation(obs.classification_id);
      assert.ok(originalObs, "Original observation should still exist");
      assert.equal(originalObs!.risk_level, "HIGH", "Original risk_level should be unchanged");

      const allObs = getClassificationObservations(packet.id);
      assert.equal(allObs.length, 1, "Should still have only 1 classification observation");

      const corrections = getClassificationCorrections(obs.classification_id);
      assert.equal(corrections.length, 1, "Should have 1 correction");
    });
  });

  describe("Model outcome observations", () => {
    it("should insert a model outcome observation with required fields", () => {
      const dbPath = path.join(testDir, "outcome-insert.db");
      setupDb(dbPath);

      const packet = createTestPacket("Outcome Insert Test");
      const execution = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
      });

      const obs = recordOutcomeObservation({
        packet_id: packet.id,
        execution_id: execution.execution_id,
        executor_model: "qwen-3.7-max",
        executor_provider: "opencode",
        execution_result: "COMPLETED",
        verification_result: "PASSED",
        audit_result: "NOT_AUDITED",
        first_pass_success: "UNKNOWN",
        scope_discipline: "WITHIN_SCOPE",
        semantic_correctness: "NOT_EVALUATED",
        invariant_compliance: "NOT_CHECKED",
        human_intervention: "NONE",
        comparison_outcome: "NOT_COMPARED",
        non_blocking_ambiguity: "NONE",
        root_cause_level: ["NONE"],
        routing_signal_eligibility: "NOT_ELIGIBLE",
      });

      assert.ok(obs.outcome_id > 0);
      assert.equal(obs.packet_id, packet.id);
      assert.equal(obs.execution_id, execution.execution_id);
      assert.equal(obs.executor_model, "qwen-3.7-max");
      assert.equal(obs.executor_provider, "opencode");
      assert.equal(obs.execution_result, "COMPLETED");
      assert.equal(obs.verification_result, "PASSED");
      assert.equal(obs.audit_result, "NOT_AUDITED");
      assert.equal(obs.first_pass_success, "UNKNOWN");
      assert.equal(obs.scope_discipline, "WITHIN_SCOPE");
      assert.equal(obs.semantic_correctness, "NOT_EVALUATED");
      assert.equal(obs.invariant_compliance, "NOT_CHECKED");
      assert.equal(obs.human_intervention, "NONE");
      assert.equal(obs.comparison_outcome, "NOT_COMPARED");
      assert.equal(obs.non_blocking_ambiguity, "NONE");
      assert.deepEqual(JSON.parse(obs.root_cause_level), ["NONE"]);
      assert.equal(obs.routing_signal_eligibility, "NOT_ELIGIBLE");
    });

    it("should default model outcome observations to non-admitted state (PENDING)", () => {
      const dbPath = path.join(testDir, "outcome-default-admission.db");
      setupDb(dbPath);

      const packet = createTestPacket("Default Outcome Admission");
      const obs = createValidOutcome(packet.id);

      assert.equal(obs.admission_state, "PENDING", "Outcome must default to PENDING");
      assert.notEqual(obs.admission_state, "ADMITTED", "Outcome must not be ADMITTED by default");
    });

    it("should reject explicit ADMITTED for outcome observations", () => {
      const dbPath = path.join(testDir, "outcome-reject-admitted.db");
      setupDb(dbPath);

      const packet = createTestPacket("Reject Admitted Outcome");

      assert.throws(
        () => {
          recordOutcomeObservation({
            packet_id: packet.id,
            executor_model: "test",
            executor_provider: "test",
            execution_result: "COMPLETED",
            admission_state: "ADMITTED",
          });
        },
        /ADMITTED is not allowed/,
        "API should reject explicit ADMITTED for outcome observations"
      );
    });
  });

  describe("Model outcome corrections", () => {
    it("should insert a model outcome correction referencing previous observation", () => {
      const dbPath = path.join(testDir, "outcome-correction.db");
      setupDb(dbPath);

      const packet = createTestPacket("Outcome Correction Test");
      const obs = createValidOutcome(packet.id);

      const correction = recordOutcomeCorrection({
        previous_outcome_id: obs.outcome_id,
        packet_id: packet.id,
        corrected_fields: ["audit_result"],
        new_values: { audit_result: "ACCEPTED" },
        reason: "Audit completed after initial recording",
        actor: "test-auditor",
      });

      assert.ok(correction.correction_id > 0);
      assert.equal(correction.previous_outcome_id, obs.outcome_id);
      assert.equal(correction.packet_id, packet.id);
      assert.equal(JSON.parse(correction.corrected_fields)[0], "audit_result");
      assert.equal(JSON.parse(correction.new_values).audit_result, "ACCEPTED");
      assert.equal(correction.reason, "Audit completed after initial recording");
      assert.equal(correction.actor, "test-auditor");
    });

    it("should not overwrite previous outcome observations", () => {
      const dbPath = path.join(testDir, "outcome-no-overwrite.db");
      setupDb(dbPath);

      const packet = createTestPacket("Outcome No Overwrite");
      const obs = createValidOutcome(packet.id);

      recordOutcomeCorrection({
        previous_outcome_id: obs.outcome_id,
        packet_id: packet.id,
        corrected_fields: ["audit_result"],
        new_values: { audit_result: "REJECTED" },
        reason: "Audit found issues",
        actor: "auditor",
      });

      const originalObs = getOutcomeObservation(obs.outcome_id);
      assert.ok(originalObs, "Original outcome should still exist");
      assert.equal(originalObs!.audit_result, "NOT_AUDITED", "Original audit_result should be unchanged");

      const allObs = getOutcomeObservations(packet.id);
      assert.equal(allObs.length, 1, "Should still have only 1 outcome observation");

      const corrections = getOutcomeCorrections(obs.outcome_id);
      assert.equal(corrections.length, 1, "Should have 1 correction");
    });
  });

  describe("Controlled vocabulary enforcement", () => {
    it("should reject invalid task_class for classification observations", () => {
      const dbPath = path.join(testDir, "invalid-task-class.db");
      setupDb(dbPath);

      const packet = createTestPacket("Invalid Task Class");

      assert.throws(
        () => {
          recordClassificationObservation({
            packet_id: packet.id,
            task_class: "INVALID_CLASS",
            risk_level: "LOW",
            constraint_strictness: "NORMAL",
            evidence_sensitivity: "NONE",
            expected_blast_radius: "SINGLE_FILE",
            primary_skill_required: "UNKNOWN",
            audit_requirement: "NONE",
            challenger_requirement: "NOT_REQUIRED",
            routing_eligibility: "NOT_ELIGIBLE",
            classification_source: "HUMAN",
          });
        },
        /Invalid task_class/
      );
    });

    it("should reject invalid risk_level for classification observations", () => {
      const dbPath = path.join(testDir, "invalid-risk-level.db");
      setupDb(dbPath);

      const packet = createTestPacket("Invalid Risk Level");

      assert.throws(
        () => {
          recordClassificationObservation({
            packet_id: packet.id,
            task_class: "PERSISTENCE",
            risk_level: "EXTREME",
            constraint_strictness: "NORMAL",
            evidence_sensitivity: "NONE",
            expected_blast_radius: "SINGLE_FILE",
            primary_skill_required: "UNKNOWN",
            audit_requirement: "NONE",
            challenger_requirement: "NOT_REQUIRED",
            routing_eligibility: "NOT_ELIGIBLE",
            classification_source: "HUMAN",
          });
        },
        /Invalid risk_level/
      );
    });

    it("should reject invalid execution_result for outcome observations", () => {
      const dbPath = path.join(testDir, "invalid-execution-result.db");
      setupDb(dbPath);

      const packet = createTestPacket("Invalid Execution Result");

      assert.throws(
        () => {
          recordOutcomeObservation({
            packet_id: packet.id,
            execution_result: "SUCCEEDED",
          });
        },
        /Invalid execution_result/
      );
    });

    it("should reject invalid verification_result for outcome observations", () => {
      const dbPath = path.join(testDir, "invalid-verification-result.db");
      setupDb(dbPath);

      const packet = createTestPacket("Invalid Verification Result");

      assert.throws(
        () => {
          recordOutcomeObservation({
            packet_id: packet.id,
            verification_result: "SUCCESS",
          });
        },
        /Invalid verification_result/
      );
    });

    it("should reject invalid audit_result for outcome observations", () => {
      const dbPath = path.join(testDir, "invalid-audit-result.db");
      setupDb(dbPath);

      const packet = createTestPacket("Invalid Audit Result");

      assert.throws(
        () => {
          recordOutcomeObservation({
            packet_id: packet.id,
            audit_result: "APPROVED",
          });
        },
        /Invalid audit_result/
      );
    });

    it("should reject invalid correction_type for outcome observations", () => {
      const dbPath = path.join(testDir, "invalid-correction-type.db");
      setupDb(dbPath);

      const packet = createTestPacket("Invalid Correction Type");

      assert.throws(
        () => {
          recordOutcomeObservation({
            packet_id: packet.id,
            correction_types: ["INVALID_TYPE"],
          });
        },
        /Invalid correction_type/
      );
    });

    it("should reject invalid scope_discipline for outcome observations", () => {
      const dbPath = path.join(testDir, "invalid-scope-discipline.db");
      setupDb(dbPath);

      const packet = createTestPacket("Invalid Scope Discipline");

      assert.throws(
        () => {
          recordOutcomeObservation({
            packet_id: packet.id,
            scope_discipline: "PERFECT",
          });
        },
        /Invalid scope_discipline/
      );
    });

    it("should reject invalid comparison_outcome for outcome observations", () => {
      const dbPath = path.join(testDir, "invalid-comparison-outcome.db");
      setupDb(dbPath);

      const packet = createTestPacket("Invalid Comparison Outcome");

      assert.throws(
        () => {
          recordOutcomeObservation({
            packet_id: packet.id,
            comparison_outcome: "WINNER",
          });
        },
        /Invalid comparison_outcome/
      );
    });
  });

  describe("Cross-packet reference rejection", () => {
    it("should reject classification correction where previous_classification_id belongs to another packet", () => {
      const dbPath = path.join(testDir, "cross-packet-classification-correction.db");
      setupDb(dbPath);

      const packetA = createTestPacket("Cross Packet A");
      const packetB = createTestPacket("Cross Packet B");

      const obsA = createValidClassification(packetA.id);

      assert.throws(
        () => {
          recordClassificationCorrection({
            previous_classification_id: obsA.classification_id,
            packet_id: packetB.id,
            corrected_fields: ["risk_level"],
            new_values: { risk_level: "LOW" },
            reason: "Cross-packet correction attempt",
            actor: "bad-actor",
          });
        },
        /Cross-packet reference rejected/
      );
    });

    it("should reject outcome observation where packet_classification_id belongs to another packet", () => {
      const dbPath = path.join(testDir, "cross-packet-outcome-classification.db");
      setupDb(dbPath);

      const packetA = createTestPacket("Cross Outcome A");
      const packetB = createTestPacket("Cross Outcome B");

      const classA = createValidClassification(packetA.id);

      assert.throws(
        () => {
          recordOutcomeObservation({
            packet_id: packetB.id,
            packet_classification_id: classA.classification_id,
          });
        },
        /Cross-packet reference rejected.*packet_classification_id/
      );
    });

    it("should reject outcome observation where execution_id belongs to another packet", () => {
      const dbPath = path.join(testDir, "cross-packet-outcome-execution.db");
      setupDb(dbPath);

      const packetA = createTestPacket("Cross Exec A");
      const packetB = createTestPacket("Cross Exec B");

      const execA = createExecutionAttempt({
        packet_id: packetA.id,
        attempt_number: 1,
      });

      assert.throws(
        () => {
          recordOutcomeObservation({
            packet_id: packetB.id,
            execution_id: execA.execution_id,
          });
        },
        /Cross-packet reference rejected.*execution_id/
      );
    });

    it("should reject outcome observation where telemetry_id belongs to another packet", () => {
      const dbPath = path.join(testDir, "cross-packet-outcome-telemetry.db");
      setupDb(dbPath);

      const packetA = createTestPacket("Cross Telemetry A");
      const packetB = createTestPacket("Cross Telemetry B");

      const execA = createExecutionAttempt({
        packet_id: packetA.id,
        attempt_number: 1,
      });

      const fixturePath = path.resolve("tests/fixtures/opencode-telemetry-complete.json");
      const telemetryResult = ingestOpenCodeTelemetry({
        packet_id: packetA.id,
        execution_id: execA.execution_id,
        telemetry_artifact_path: fixturePath,
        ingestion_mode: "DIRECT_ARTIFACT",
      });

      assert.ok(telemetryResult.ingested);
      assert.ok(telemetryResult.telemetry);

      assert.throws(
        () => {
          recordOutcomeObservation({
            packet_id: packetB.id,
            telemetry_id: telemetryResult.telemetry!.telemetry_id,
          });
        },
        /Cross-packet reference rejected.*telemetry_id/
      );
    });

    it("should reject outcome correction where previous_outcome_id belongs to another packet", () => {
      const dbPath = path.join(testDir, "cross-packet-outcome-correction.db");
      setupDb(dbPath);

      const packetA = createTestPacket("Cross Correction A");
      const packetB = createTestPacket("Cross Correction B");

      const obsA = createValidOutcome(packetA.id);

      assert.throws(
        () => {
          recordOutcomeCorrection({
            previous_outcome_id: obsA.outcome_id,
            packet_id: packetB.id,
            corrected_fields: ["audit_result"],
            new_values: { audit_result: "ACCEPTED" },
            reason: "Cross-packet correction attempt",
            actor: "bad-actor",
          });
        },
        /Cross-packet reference rejected/
      );
    });
  });

  describe("Outcome references to classification, execution, and telemetry", () => {
    it("should allow outcome observations to reference packet classification observations", () => {
      const dbPath = path.join(testDir, "outcome-ref-classification.db");
      setupDb(dbPath);

      const packet = createTestPacket("Outcome Ref Classification");
      const classification = createValidClassification(packet.id);

      const obs = recordOutcomeObservation({
        packet_id: packet.id,
        packet_classification_id: classification.classification_id,
      });

      assert.equal(obs.packet_classification_id, classification.classification_id);
    });

    it("should allow outcome observations to reference packet executions", () => {
      const dbPath = path.join(testDir, "outcome-ref-execution.db");
      setupDb(dbPath);

      const packet = createTestPacket("Outcome Ref Execution");
      const execution = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
      });

      const obs = recordOutcomeObservation({
        packet_id: packet.id,
        execution_id: execution.execution_id,
      });

      assert.equal(obs.execution_id, execution.execution_id);
    });

    it("should allow outcome observations to reference telemetry records when available", () => {
      const dbPath = path.join(testDir, "outcome-ref-telemetry.db");
      setupDb(dbPath);

      const packet = createTestPacket("Outcome Ref Telemetry");
      const execution = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
      });

      const fixturePath = path.resolve("tests/fixtures/opencode-telemetry-complete.json");
      const telemetryResult = ingestOpenCodeTelemetry({
        packet_id: packet.id,
        execution_id: execution.execution_id,
        telemetry_artifact_path: fixturePath,
        ingestion_mode: "DIRECT_ARTIFACT",
      });

      assert.ok(telemetryResult.ingested);

      const obs = recordOutcomeObservation({
        packet_id: packet.id,
        execution_id: execution.execution_id,
        telemetry_id: telemetryResult.telemetry!.telemetry_id,
      });

      assert.equal(obs.telemetry_id, telemetryResult.telemetry!.telemetry_id);
    });
  });

  describe("FP-004 persistence behavior preservation", () => {
    it("should still record packet intent after FP-008 migration", () => {
      const dbPath = path.join(testDir, "fp004-preserve-intent.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-004 Compat Test",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash-fp004-compat",
      });

      assert.ok(packet.id > 0);
      assert.equal(packet.title, "FP-004 Compat Test");
    });

    it("should still append lifecycle events after FP-008 migration", () => {
      const dbPath = path.join(testDir, "fp004-preserve-lifecycle.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-004 Lifecycle Compat",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash-fp004-lc",
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

    it("should still create and manage execution attempts after FP-008 migration", () => {
      const dbPath = path.join(testDir, "fp004-preserve-exec.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-004 Exec Compat",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash-fp004-exec",
      });

      const execution = createExecutionAttempt({
        packet_id: packet.id,
        attempt_number: 1,
        trace_id: "trace-fp004",
      });

      assert.equal(execution.execution_state, "RUNNING");

      const succeeded = markExecutionSucceeded(execution.execution_id);
      assert.equal(succeeded.execution_state, "SUCCEEDED");

      const executions = getPacketExecutions(packet.id);
      assert.equal(executions.length, 1);
    });

    it("should still derive current packet state from lifecycle events after FP-008 migration", () => {
      const dbPath = path.join(testDir, "fp004-preserve-state.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-004 State Compat",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash-fp004-state",
      });

      appendLifecycleEvent({
        packet_id: packet.id,
        event_type: "PACKET_CREATED",
        lifecycle_state: "CREATED",
      });

      appendLifecycleEvent({
        packet_id: packet.id,
        event_type: "PACKET_ADMITTED",
        lifecycle_state: "ADMITTED",
      });

      const state = getCurrentPacketState(packet.id);
      assert.equal(state!.current_state, "ADMITTED");
    });
  });

  describe("FP-005 telemetry ingestion preservation", () => {
    it("should still ingest telemetry after FP-008 migration", () => {
      const dbPath = path.join(testDir, "fp005-preserve-ingest.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-005 Compat Test",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash-fp005-compat",
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

      assert.ok(result.ingested, "Telemetry ingestion should still work");
      assert.ok(result.telemetry, "Telemetry record should be returned");
      assert.equal(result.telemetry!.source, "OPENCODE_TELEMETRY");
      assert.equal(result.telemetry!.admission_state, "PENDING");
    });

    it("should still retrieve telemetry by execution_id after FP-008 migration", () => {
      const dbPath = path.join(testDir, "fp005-preserve-retrieve.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-005 Retrieve Compat",
        packet_path: "packets/FP-TEST.md",
        packet_hash: "hash-fp005-retrieve",
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
  });

  describe("Append-only behavior", () => {
    it("should preserve classification observations when corrections are added", () => {
      const dbPath = path.join(testDir, "append-only-classification.db");
      setupDb(dbPath);
      const db = getDb();

      const packet = createTestPacket("Append Only Classification");
      const obs1 = createValidClassification(packet.id);

      recordClassificationCorrection({
        previous_classification_id: obs1.classification_id,
        packet_id: packet.id,
        corrected_fields: ["risk_level"],
        new_values: { risk_level: "CRITICAL" },
        reason: "Reassessment",
        actor: "auditor",
      });

      const originalCount = db
        .prepare("SELECT COUNT(*) as cnt FROM packet_classification_observations WHERE classification_id = ?")
        .get(obs1.classification_id) as { cnt: number };
      assert.equal(originalCount.cnt, 1, "Original classification should still exist");

      const original = db
        .prepare("SELECT risk_level FROM packet_classification_observations WHERE classification_id = ?")
        .get(obs1.classification_id) as { risk_level: string };
      assert.equal(original.risk_level, "HIGH", "Original risk_level should be unchanged");
    });

    it("should preserve outcome observations when corrections are added", () => {
      const dbPath = path.join(testDir, "append-only-outcome.db");
      setupDb(dbPath);
      const db = getDb();

      const packet = createTestPacket("Append Only Outcome");
      const obs1 = createValidOutcome(packet.id);

      recordOutcomeCorrection({
        previous_outcome_id: obs1.outcome_id,
        packet_id: packet.id,
        corrected_fields: ["audit_result"],
        new_values: { audit_result: "REJECTED" },
        reason: "Audit completed",
        actor: "auditor",
      });

      const originalCount = db
        .prepare("SELECT COUNT(*) as cnt FROM model_outcome_observations WHERE outcome_id = ?")
        .get(obs1.outcome_id) as { cnt: number };
      assert.equal(originalCount.cnt, 1, "Original outcome should still exist");

      const original = db
        .prepare("SELECT audit_result FROM model_outcome_observations WHERE outcome_id = ?")
        .get(obs1.outcome_id) as { audit_result: string };
      assert.equal(original.audit_result, "NOT_AUDITED", "Original audit_result should be unchanged");
    });
  });
});
