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
  getCurrentPacketState,
  getPacketLifecycleEvents,
} from "../src/db/persistence.js";
import {
  ingestOpenCodeTelemetry,
  getExecutionTelemetry,
} from "../src/db/telemetry.js";
import {
  recordClassificationObservation,
  getClassificationObservations,
  getClassificationObservation,
} from "../src/db/classification.js";
import {
  recordOutcomeObservation,
  getOutcomeObservations,
  getOutcomeObservation,
} from "../src/db/outcome.js";
import {
  recordEvidenceAdmission,
  recordAdmissionReviewRequest,
  recordAdmissionInvalidation,
  deriveEvidenceEligibility,
  getAdmissionEvents,
  getAdmissionEvent,
  getReviewRequests,
  getInvalidationEvents,
} from "../src/db/evidence.js";

let testDir: string;

before(() => {
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), "forgepilot-fp009-"));
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

function createTestPacket(title: string = "FP-009 Test Packet") {
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
    rationale: "Test classification for FP-009",
  });
}

function createValidOutcome(packet_id: number) {
  return recordOutcomeObservation({
    packet_id,
    executor_model: "test-model",
    executor_provider: "test-provider",
    execution_result: "COMPLETED",
    verification_result: "PASSED",
    audit_result: "ACCEPTED",
  });
}

function createValidAdmission(obsType: string, obsId: number) {
  return recordEvidenceAdmission({
    target_observation_type: obsType,
    target_observation_id: obsId,
    admission_decision: "ADMITTED",
    admission_actor_type: "human_auditor",
    admission_actor_id: "auditor-1",
    admission_trust_tier: "TIER_2",
    validation_state: "VALID",
    provenance_complete: true,
    admission_basis: "Reviewed classification and determined it meets evidence standards",
  });
}

function createValidReviewRequest(admissionEventId: number) {
  return recordAdmissionReviewRequest({
    target_admission_event_id: admissionEventId,
    review_trigger_type: "MANUAL_AUDITOR_FLAG",
    requested_by_actor_type: "human_auditor",
    requested_by_actor_id: "auditor-2",
    review_reason: "Second auditor flagged this for review after discovering provenance gap",
    validation_state: "VALID",
    provenance_complete: true,
  });
}

function createValidInvalidation(admissionEventId: number, reviewRequestId: number, decision: string = "INVALIDATED") {
  return recordAdmissionInvalidation({
    target_admission_event_id: admissionEventId,
    review_request_id: reviewRequestId,
    invalidation_decision: decision,
    invalidated_by_actor_type: "human_auditor",
    invalidated_by_actor_id: "auditor-2",
    invalidation_reason: "Provenance gap confirmed; admission invalidated",
    validation_state: "VALID",
    provenance_complete: true,
  });
}

describe("FP-009: Evidence Admission Persistence", () => {
  describe("Migration", () => {
    it("should be idempotent (running migrate twice does not fail)", () => {
      const dbPath = path.join(testDir, "idempotent-fp009.db");
      closeDb();
      initDb(dbPath);
      migrate();
      migrate();

      const db = getDb();
      const rows = db
        .prepare("SELECT name FROM _migrations WHERE name = ?")
        .all("005_fp009_evidence_admission.sql") as { name: string }[];

      assert.equal(rows.length, 1, "Migration 005 should only be recorded once");
    });

    it("should create all required FP-009 tables", () => {
      const dbPath = path.join(testDir, "required-tables.db");
      setupDb(dbPath);
      const db = getDb();

      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      assert.ok(tables.includes("evidence_admission_events"), "evidence_admission_events should exist");
      assert.ok(tables.includes("admission_review_requests"), "admission_review_requests should exist");
      assert.ok(tables.includes("admission_invalidation_events"), "admission_invalidation_events should exist");
    });

    it("should create required columns in evidence_admission_events", () => {
      const dbPath = path.join(testDir, "admission-columns.db");
      setupDb(dbPath);
      const db = getDb();

      const columns = db
        .prepare("PRAGMA table_info(evidence_admission_events)")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      const required = [
        "id", "target_observation_type", "target_observation_id",
        "admission_decision", "admission_actor_type", "admission_actor_id",
        "admission_trust_tier", "validation_state", "provenance_complete",
        "admission_basis", "created_at",
      ];
      for (const col of required) {
        assert.ok(columns.includes(col), `evidence_admission_events.${col} should exist`);
      }
    });

    it("should create required columns in admission_review_requests", () => {
      const dbPath = path.join(testDir, "review-columns.db");
      setupDb(dbPath);
      const db = getDb();

      const columns = db
        .prepare("PRAGMA table_info(admission_review_requests)")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      const required = [
        "id", "target_admission_event_id", "review_trigger_type",
        "requested_by_actor_type", "requested_by_actor_id",
        "review_reason", "validation_state", "provenance_complete",
        "created_at",
      ];
      for (const col of required) {
        assert.ok(columns.includes(col), `admission_review_requests.${col} should exist`);
      }
    });

    it("should create required columns in admission_invalidation_events", () => {
      const dbPath = path.join(testDir, "invalidation-columns.db");
      setupDb(dbPath);
      const db = getDb();

      const columns = db
        .prepare("PRAGMA table_info(admission_invalidation_events)")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      const required = [
        "id", "target_admission_event_id", "review_request_id",
        "invalidation_decision", "invalidated_by_actor_type", "invalidated_by_actor_id",
        "invalidation_reason", "validation_state", "provenance_complete",
        "created_at",
      ];
      for (const col of required) {
        assert.ok(columns.includes(col), `admission_invalidation_events.${col} should exist`);
      }
    });
  });

  describe("Evidence admission events (test 1)", () => {
    it("should persist an evidence admission event for a classification observation", () => {
      const dbPath = path.join(testDir, "admission-persist-classification.db");
      setupDb(dbPath);

      const packet = createTestPacket("Admission Classification");
      const classification = createValidClassification(packet.id);

      const admission = recordEvidenceAdmission({
        target_observation_type: "classification_observation",
        target_observation_id: classification.classification_id,
        admission_decision: "ADMITTED",
        admission_actor_type: "human_auditor",
        admission_actor_id: "auditor-1",
        admission_trust_tier: "TIER_2",
        validation_state: "VALID",
        provenance_complete: true,
        admission_basis: "Reviewed and determined evidence-worthy",
      });

      assert.ok(admission.id > 0);
      assert.equal(admission.target_observation_type, "classification_observation");
      assert.equal(admission.target_observation_id, classification.classification_id);
      assert.equal(admission.admission_decision, "ADMITTED");
      assert.equal(admission.admission_actor_type, "human_auditor");
      assert.equal(admission.admission_actor_id, "auditor-1");
      assert.equal(admission.admission_trust_tier, "TIER_2");
      assert.equal(admission.validation_state, "VALID");
      assert.equal(admission.provenance_complete, 1);
      assert.equal(admission.admission_basis, "Reviewed and determined evidence-worthy");
      assert.ok(admission.created_at);
    });

    it("should persist an evidence admission event for an outcome observation", () => {
      const dbPath = path.join(testDir, "admission-persist-outcome.db");
      setupDb(dbPath);

      const packet = createTestPacket("Admission Outcome");
      const outcome = createValidOutcome(packet.id);

      const admission = recordEvidenceAdmission({
        target_observation_type: "outcome_observation",
        target_observation_id: outcome.outcome_id,
        admission_decision: "ADMITTED",
        admission_actor_type: "automated_validator",
        admission_actor_id: "validator-1",
        admission_trust_tier: "TIER_1",
        validation_state: "VALID",
        provenance_complete: true,
        admission_basis: "Telemetry artifacts verified",
      });

      assert.ok(admission.id > 0);
      assert.equal(admission.target_observation_type, "outcome_observation");
      assert.equal(admission.target_observation_id, outcome.outcome_id);
      assert.equal(admission.admission_decision, "ADMITTED");
      assert.equal(admission.admission_actor_type, "automated_validator");
    });

    it("should preserve admission trust tier, validation state, provenance completeness, and actor info", () => {
      const dbPath = path.join(testDir, "admission-preserve-metadata.db");
      setupDb(dbPath);

      const packet = createTestPacket("Admission Metadata");
      const classification = createValidClassification(packet.id);

      const admission = recordEvidenceAdmission({
        target_observation_type: "classification_observation",
        target_observation_id: classification.classification_id,
        admission_decision: "REJECTED",
        admission_actor_type: "model_reviewer",
        admission_actor_id: "model-gpt-5",
        admission_trust_tier: "TIER_1",
        validation_state: "INCOMPLETE",
        provenance_complete: false,
        admission_basis: "Missing secondary task classification evidence",
      });

      assert.equal(admission.admission_decision, "REJECTED");
      assert.equal(admission.admission_actor_type, "model_reviewer");
      assert.equal(admission.admission_actor_id, "model-gpt-5");
      assert.equal(admission.admission_trust_tier, "TIER_1");
      assert.equal(admission.validation_state, "INCOMPLETE");
      assert.equal(admission.provenance_complete, 0);
    });

    it("should reject invalid admission_decision values", () => {
      const dbPath = path.join(testDir, "admission-invalid-decision.db");
      setupDb(dbPath);

      const packet = createTestPacket("Invalid Decision");
      const classification = createValidClassification(packet.id);

      assert.throws(
        () => {
          recordEvidenceAdmission({
            target_observation_type: "classification_observation",
            target_observation_id: classification.classification_id,
            admission_decision: "CONDITIONAL",
            admission_actor_type: "human_auditor",
          });
        },
        /Invalid admission_decision/
      );
    });

    it("should reject invalid target_observation_type values", () => {
      const dbPath = path.join(testDir, "admission-invalid-type.db");
      setupDb(dbPath);

      assert.throws(
        () => {
          recordEvidenceAdmission({
            target_observation_type: "bad_type",
            target_observation_id: 1,
            admission_decision: "ADMITTED",
            admission_actor_type: "system",
          });
        },
        /Invalid target_observation_type/
      );
    });

    it("should reject admission targeting a non-existent observation", () => {
      const dbPath = path.join(testDir, "admission-non-existent.db");
      setupDb(dbPath);

      assert.throws(
        () => {
          recordEvidenceAdmission({
            target_observation_type: "classification_observation",
            target_observation_id: 9999,
            admission_decision: "ADMITTED",
            admission_actor_type: "human_auditor",
          });
        },
        /not found/
      );
    });
  });

  describe("Admission review requests (test 2)", () => {
    it("should persist an admission review request", () => {
      const dbPath = path.join(testDir, "review-request-persist.db");
      setupDb(dbPath);

      const packet = createTestPacket("Review Request Test");
      const classification = createValidClassification(packet.id);
      const admission = createValidAdmission("classification_observation", classification.classification_id);

      const review = recordAdmissionReviewRequest({
        target_admission_event_id: admission.id,
        review_trigger_type: "MANUAL_AUDITOR_FLAG",
        requested_by_actor_type: "human_auditor",
        requested_by_actor_id: "auditor-2",
        review_reason: "Potential provenance gap found during second review",
        validation_state: "VALID",
        provenance_complete: true,
      });

      assert.ok(review.id > 0);
      assert.equal(review.target_admission_event_id, admission.id);
      assert.equal(review.review_trigger_type, "MANUAL_AUDITOR_FLAG");
      assert.equal(review.requested_by_actor_type, "human_auditor");
      assert.equal(review.requested_by_actor_id, "auditor-2");
      assert.equal(review.review_reason, "Potential provenance gap found during second review");
      assert.equal(review.validation_state, "VALID");
      assert.equal(review.provenance_complete, 1);
      assert.ok(review.created_at);
    });

    it("should reject review request referencing non-existent admission event", () => {
      const dbPath = path.join(testDir, "review-invalid-admission.db");
      setupDb(dbPath);

      assert.throws(
        () => {
          recordAdmissionReviewRequest({
            target_admission_event_id: 9999,
            review_trigger_type: "MANUAL_AUDITOR_FLAG",
            requested_by_actor_type: "human_auditor",
          });
        },
        /not found/
      );
    });

    it("should reject invalid review_trigger_type values", () => {
      const dbPath = path.join(testDir, "review-invalid-trigger.db");
      setupDb(dbPath);

      const packet = createTestPacket("Invalid Trigger");
      const classification = createValidClassification(packet.id);
      const admission = createValidAdmission("classification_observation", classification.classification_id);

      assert.throws(
        () => {
          recordAdmissionReviewRequest({
            target_admission_event_id: admission.id,
            review_trigger_type: "INVALID_TRIGGER",
            requested_by_actor_type: "human_auditor",
          });
        },
        /Invalid review_trigger_type/
      );
    });
  });

  describe("Admission invalidation events (test 3)", () => {
    it("should persist an admission invalidation event", () => {
      const dbPath = path.join(testDir, "invalidation-persist.db");
      setupDb(dbPath);

      const packet = createTestPacket("Invalidation Persist");
      const classification = createValidClassification(packet.id);
      const admission = createValidAdmission("classification_observation", classification.classification_id);
      const review = createValidReviewRequest(admission.id);

      const invalidation = recordAdmissionInvalidation({
        target_admission_event_id: admission.id,
        review_request_id: review.id,
        invalidation_decision: "INVALIDATED",
        invalidated_by_actor_type: "human_auditor",
        invalidated_by_actor_id: "auditor-2",
        invalidation_reason: "Provenance gap confirmed; admission cannot stand",
        validation_state: "VALID",
        provenance_complete: true,
      });

      assert.ok(invalidation.id > 0);
      assert.equal(invalidation.target_admission_event_id, admission.id);
      assert.equal(invalidation.review_request_id, review.id);
      assert.equal(invalidation.invalidation_decision, "INVALIDATED");
      assert.equal(invalidation.invalidated_by_actor_type, "human_auditor");
      assert.equal(invalidation.invalidated_by_actor_id, "auditor-2");
      assert.equal(invalidation.invalidation_reason, "Provenance gap confirmed; admission cannot stand");
      assert.equal(invalidation.validation_state, "VALID");
      assert.equal(invalidation.provenance_complete, 1);
      assert.ok(invalidation.created_at);
    });

    it("should reject invalid invalidation_decision values", () => {
      const dbPath = path.join(testDir, "invalidation-invalid-decision.db");
      setupDb(dbPath);

      const packet = createTestPacket("Invalid Invalidation Decision");
      const classification = createValidClassification(packet.id);
      const admission = createValidAdmission("classification_observation", classification.classification_id);
      const review = createValidReviewRequest(admission.id);

      assert.throws(
        () => {
          recordAdmissionInvalidation({
            target_admission_event_id: admission.id,
            review_request_id: review.id,
            invalidation_decision: "REVOKED",
            invalidated_by_actor_type: "human_auditor",
          });
        },
        /Invalid invalidation_decision/
      );
    });

    it("should preserve invalidation trust tier, validation state, provenance completeness, and actor info", () => {
      const dbPath = path.join(testDir, "invalidation-metadata.db");
      setupDb(dbPath);

      const packet = createTestPacket("Invalidation Metadata");
      const classification = createValidClassification(packet.id);
      const admission = createValidAdmission("classification_observation", classification.classification_id);
      const review = createValidReviewRequest(admission.id);

      const invalidation = recordAdmissionInvalidation({
        target_admission_event_id: admission.id,
        review_request_id: review.id,
        invalidation_decision: "QUARANTINED",
        invalidated_by_actor_type: "cross_model_consensus",
        invalidated_by_actor_id: "consensus-3",
        invalidation_reason: "Cross-model review found conflicting evidence",
        validation_state: "VALID",
        provenance_complete: true,
      });

      assert.equal(invalidation.invalidation_decision, "QUARANTINED");
      assert.equal(invalidation.invalidated_by_actor_type, "cross_model_consensus");
      assert.equal(invalidation.invalidated_by_actor_id, "consensus-3");
      assert.equal(invalidation.validation_state, "VALID");
      assert.equal(invalidation.provenance_complete, 1);
    });
  });

  describe("Invalidation requires review request (test 4)", () => {
    it("should reject invalidation without a valid review request reference", () => {
      const dbPath = path.join(testDir, "invalidation-no-review.db");
      setupDb(dbPath);

      const packet = createTestPacket("No Review Invalidation");
      const classification = createValidClassification(packet.id);
      const admission = createValidAdmission("classification_observation", classification.classification_id);

      assert.throws(
        () => {
          recordAdmissionInvalidation({
            target_admission_event_id: admission.id,
            review_request_id: 9999,
            invalidation_decision: "INVALIDATED",
            invalidated_by_actor_type: "human_auditor",
          });
        },
        /not found/
      );
    });

    it("should reject invalidation where review request references a different admission event", () => {
      const dbPath = path.join(testDir, "invalidation-mismatch-review.db");
      setupDb(dbPath);

      const packet = createTestPacket("Mismatch Review");
      const classification1 = createValidClassification(packet.id);
      const classification2 = recordClassificationObservation({
        packet_id: packet.id,
        task_class: "TESTING",
        risk_level: "LOW",
        constraint_strictness: "LOOSE",
        evidence_sensitivity: "NONE",
        expected_blast_radius: "SINGLE_FILE",
        primary_skill_required: "TEST_DESIGN",
        audit_requirement: "NONE",
        challenger_requirement: "NOT_REQUIRED",
        routing_eligibility: "NOT_ELIGIBLE",
        classification_source: "HUMAN",
      });

      const admission1 = createValidAdmission("classification_observation", classification1.classification_id);
      const admission2 = createValidAdmission("classification_observation", classification2.classification_id);

      const review = createValidReviewRequest(admission1.id);

      assert.throws(
        () => {
          recordAdmissionInvalidation({
            target_admission_event_id: admission2.id,
            review_request_id: review.id,
            invalidation_decision: "INVALIDATED",
            invalidated_by_actor_type: "human_auditor",
          });
        },
        /not \d+/
      );
    });
  });

  describe("Derived evidence eligibility (tests 5, 9, 10, 11, 12)", () => {
    it("should derive eligibility from a valid admission with no defeating invalidation (test 5, 9)", () => {
      const dbPath = path.join(testDir, "derive-eligible.db");
      setupDb(dbPath);

      const packet = createTestPacket("Derive Eligible");
      const classification = createValidClassification(packet.id);
      createValidAdmission("classification_observation", classification.classification_id);

      const eligibility = deriveEvidenceEligibility(
        "classification_observation",
        classification.classification_id
      );

      assert.equal(eligibility.eligible, true, "Observation should be eligible with a valid admission");
      assert.ok(eligibility.admission_event, "Should return the admission event");
      assert.equal(eligibility.admission_event!.admission_decision, "ADMITTED");
      assert.equal(eligibility.admission_event!.validation_state, "VALID");
      assert.equal(eligibility.admission_event!.provenance_complete, 1);
      assert.equal(eligibility.defeating_invalidation, null, "No defeating invalidation should exist");
    });

    it("should make observation ineligible when a valid invalidation defeats the admission (test 10)", () => {
      const dbPath = path.join(testDir, "derive-ineligible-invalidation.db");
      setupDb(dbPath);

      const packet = createTestPacket("Derive Ineligible");
      const classification = createValidClassification(packet.id);
      const admission = createValidAdmission("classification_observation", classification.classification_id);
      const review = createValidReviewRequest(admission.id);
      createValidInvalidation(admission.id, review.id, "INVALIDATED");

      const eligibility = deriveEvidenceEligibility(
        "classification_observation",
        classification.classification_id
      );

      assert.equal(eligibility.eligible, false, "Observation should be ineligible after valid invalidation");
      assert.ok(eligibility.admission_event, "Should return the admission event");
      assert.ok(eligibility.defeating_invalidation, "Should return the defeating invalidation");
      assert.equal(
        eligibility.defeating_invalidation!.invalidation_decision,
        "INVALIDATED"
      );
    });

    it("should make observation ineligible when QUARANTINED invalidation defeats admission", () => {
      const dbPath = path.join(testDir, "derive-ineligible-quarantined.db");
      setupDb(dbPath);

      const packet = createTestPacket("Derive Quarantined");
      const classification = createValidClassification(packet.id);
      const admission = createValidAdmission("classification_observation", classification.classification_id);
      const review = createValidReviewRequest(admission.id);
      createValidInvalidation(admission.id, review.id, "QUARANTINED");

      const eligibility = deriveEvidenceEligibility(
        "classification_observation",
        classification.classification_id
      );

      assert.equal(eligibility.eligible, false, "QUARANTINED should defeat admission");
    });

    it("should NOT make observation ineligible when NO_ACTION review outcome does not defeat admission (test 11)", () => {
      const dbPath = path.join(testDir, "derive-no-action.db");
      setupDb(dbPath);

      const packet = createTestPacket("No Action Review");
      const classification = createValidClassification(packet.id);
      const admission = createValidAdmission("classification_observation", classification.classification_id);
      const review = createValidReviewRequest(admission.id);
      recordAdmissionInvalidation({
        target_admission_event_id: admission.id,
        review_request_id: review.id,
        invalidation_decision: "NO_ACTION",
        invalidated_by_actor_type: "human_auditor",
        invalidated_by_actor_id: "auditor-2",
        invalidation_reason: "Review found no issues; admission stands",
        validation_state: "VALID",
        provenance_complete: true,
      });

      const eligibility = deriveEvidenceEligibility(
        "classification_observation",
        classification.classification_id
      );

      assert.equal(eligibility.eligible, true, "NO_ACTION should not defeat admission");
    });

    it("should NOT make observation ineligible when DEFERRED review outcome does not defeat admission", () => {
      const dbPath = path.join(testDir, "derive-deferred.db");
      setupDb(dbPath);

      const packet = createTestPacket("Deferred Review");
      const classification = createValidClassification(packet.id);
      const admission = createValidAdmission("classification_observation", classification.classification_id);
      const review = createValidReviewRequest(admission.id);
      recordAdmissionInvalidation({
        target_admission_event_id: admission.id,
        review_request_id: review.id,
        invalidation_decision: "DEFERRED",
        invalidated_by_actor_type: "human_auditor",
        invalidated_by_actor_id: "auditor-2",
        invalidation_reason: "More investigation needed",
        validation_state: "VALID",
        provenance_complete: true,
      });

      const eligibility = deriveEvidenceEligibility(
        "classification_observation",
        classification.classification_id
      );

      assert.equal(eligibility.eligible, true, "DEFERRED should not defeat admission");
    });

    it("should not grant eligibility for invalid admission events (test 12 - invalid validation_state)", () => {
      const dbPath = path.join(testDir, "derive-invalid-validation.db");
      setupDb(dbPath);

      const packet = createTestPacket("Invalid Validation Admission");
      const classification = createValidClassification(packet.id);
      recordEvidenceAdmission({
        target_observation_type: "classification_observation",
        target_observation_id: classification.classification_id,
        admission_decision: "ADMITTED",
        admission_actor_type: "human_auditor",
        validation_state: "INVALID",
        provenance_complete: true,
      });

      const eligibility = deriveEvidenceEligibility(
        "classification_observation",
        classification.classification_id
      );

      assert.equal(eligibility.eligible, false, "Invalid validation_state should not grant eligibility");
    });

    it("should not grant eligibility for provenance-incomplete admission events (test 12 - provenance)", () => {
      const dbPath = path.join(testDir, "derive-incomplete-provenance.db");
      setupDb(dbPath);

      const packet = createTestPacket("Incomplete Provenance");
      const classification = createValidClassification(packet.id);
      recordEvidenceAdmission({
        target_observation_type: "classification_observation",
        target_observation_id: classification.classification_id,
        admission_decision: "ADMITTED",
        admission_actor_type: "human_auditor",
        validation_state: "VALID",
        provenance_complete: false,
      });

      const eligibility = deriveEvidenceEligibility(
        "classification_observation",
        classification.classification_id
      );

      assert.equal(eligibility.eligible, false, "Incomplete provenance should not grant eligibility");
    });

    it("should not grant eligibility for REJECTED admission decisions", () => {
      const dbPath = path.join(testDir, "derive-rejected-admission.db");
      setupDb(dbPath);

      const packet = createTestPacket("Rejected Admission");
      const classification = createValidClassification(packet.id);
      recordEvidenceAdmission({
        target_observation_type: "classification_observation",
        target_observation_id: classification.classification_id,
        admission_decision: "REJECTED",
        admission_actor_type: "human_auditor",
        validation_state: "VALID",
        provenance_complete: true,
      });

      const eligibility = deriveEvidenceEligibility(
        "classification_observation",
        classification.classification_id
      );

      assert.equal(eligibility.eligible, false, "REJECTED admission should not grant eligibility");
    });

    it("should not grant eligibility for PENDING admission decisions", () => {
      const dbPath = path.join(testDir, "derive-pending-admission.db");
      setupDb(dbPath);

      const packet = createTestPacket("Pending Admission");
      const classification = createValidClassification(packet.id);
      recordEvidenceAdmission({
        target_observation_type: "classification_observation",
        target_observation_id: classification.classification_id,
        admission_decision: "PENDING",
        admission_actor_type: "human_auditor",
        validation_state: "VALID",
        provenance_complete: true,
      });

      const eligibility = deriveEvidenceEligibility(
        "classification_observation",
        classification.classification_id
      );

      assert.equal(eligibility.eligible, false, "PENDING admission should not grant eligibility");
    });

    it("should not be eligible for observations with no admission events", () => {
      const dbPath = path.join(testDir, "derive-no-admission.db");
      setupDb(dbPath);

      const packet = createTestPacket("No Admission");
      const classification = createValidClassification(packet.id);

      const eligibility = deriveEvidenceEligibility(
        "classification_observation",
        classification.classification_id
      );

      assert.equal(eligibility.eligible, false, "Observations without admission should not be eligible");
      assert.equal(eligibility.admission_event, null);
      assert.equal(eligibility.defeating_invalidation, null);
    });

    it("should derive eligibility for outcome observations", () => {
      const dbPath = path.join(testDir, "derive-outcome.db");
      setupDb(dbPath);

      const packet = createTestPacket("Outcome Derive");
      const outcome = createValidOutcome(packet.id);
      createValidAdmission("outcome_observation", outcome.outcome_id);

      const eligibility = deriveEvidenceEligibility(
        "outcome_observation",
        outcome.outcome_id
      );

      assert.equal(eligibility.eligible, true, "Outcome observation should be eligible with valid admission");
    });
  });

  describe("Observation immutability (tests 6, 7)", () => {
    it("should not mutate classification observation rows when admitted (test 6)", () => {
      const dbPath = path.join(testDir, "immutable-classification.db");
      setupDb(dbPath);

      const packet = createTestPacket("Immutable Classification");
      const classification = createValidClassification(packet.id);

      const original = getClassificationObservation(classification.classification_id);
      assert.ok(original);

      createValidAdmission("classification_observation", classification.classification_id);

      const after = getClassificationObservation(classification.classification_id);
      assert.ok(after);

      assert.equal(after!.classification_id, original!.classification_id);
      assert.equal(after!.task_class, original!.task_class);
      assert.equal(after!.risk_level, original!.risk_level);
      assert.equal(after!.admission_state, original!.admission_state, "admission_state must be unchanged");
      assert.equal(after!.trust_tier, original!.trust_tier, "trust_tier must be unchanged");
      assert.equal(after!.created_at, original!.created_at, "created_at must be unchanged");
    });

    it("should not mutate outcome observation rows when admitted (test 6)", () => {
      const dbPath = path.join(testDir, "immutable-outcome.db");
      setupDb(dbPath);

      const packet = createTestPacket("Immutable Outcome");
      const outcome = createValidOutcome(packet.id);

      const original = getOutcomeObservation(outcome.outcome_id);
      assert.ok(original);

      createValidAdmission("outcome_observation", outcome.outcome_id);

      const after = getOutcomeObservation(outcome.outcome_id);
      assert.ok(after);

      assert.equal(after!.outcome_id, original!.outcome_id);
      assert.equal(after!.audit_result, original!.audit_result);
      assert.equal(after!.admission_state, original!.admission_state, "admission_state must be unchanged");
      assert.equal(after!.trust_tier, original!.trust_tier, "trust_tier must be unchanged");
      assert.equal(after!.created_at, original!.created_at, "created_at must be unchanged");
    });

    it("should not mutate classification observation rows when admission is invalidated (test 7)", () => {
      const dbPath = path.join(testDir, "immutable-classification-invalidated.db");
      setupDb(dbPath);

      const packet = createTestPacket("Immutable After Invalidation");
      const classification = createValidClassification(packet.id);

      const original = getClassificationObservation(classification.classification_id);
      assert.ok(original);

      const admission = createValidAdmission("classification_observation", classification.classification_id);
      const review = createValidReviewRequest(admission.id);
      createValidInvalidation(admission.id, review.id, "INVALIDATED");

      const afterInvalidation = getClassificationObservation(classification.classification_id);
      assert.ok(afterInvalidation);

      assert.equal(afterInvalidation!.classification_id, original!.classification_id);
      assert.equal(afterInvalidation!.task_class, original!.task_class);
      assert.equal(afterInvalidation!.admission_state, original!.admission_state, "admission_state must be unchanged after invalidation");
      assert.equal(afterInvalidation!.created_at, original!.created_at, "created_at must be unchanged after invalidation");
    });

    it("should not mutate outcome observation rows when admission is invalidated (test 7)", () => {
      const dbPath = path.join(testDir, "immutable-outcome-invalidated.db");
      setupDb(dbPath);

      const packet = createTestPacket("Immutable Outcome Invalidated");
      const outcome = createValidOutcome(packet.id);

      const original = getOutcomeObservation(outcome.outcome_id);
      assert.ok(original);

      const admission = createValidAdmission("outcome_observation", outcome.outcome_id);
      const review = createValidReviewRequest(admission.id);
      createValidInvalidation(admission.id, review.id, "QUARANTINED");

      const after = getOutcomeObservation(outcome.outcome_id);
      assert.ok(after);

      assert.equal(after!.outcome_id, original!.outcome_id);
      assert.equal(after!.admission_state, original!.admission_state, "admission_state must be unchanged");
      assert.equal(after!.created_at, original!.created_at, "created_at must be unchanged");
    });
  });

  describe("No mutable evidence-state fields on observation tables (test 8)", () => {
    it("should not add is_evidence or evidence_status columns to packet_classification_observations", () => {
      const dbPath = path.join(testDir, "no-mutable-fields-classification.db");
      setupDb(dbPath);
      const db = getDb();

      const columns = db
        .prepare("PRAGMA table_info(packet_classification_observations)")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      assert.ok(!columns.includes("is_evidence"), "is_evidence must not exist on classification observations");
      assert.ok(!columns.includes("evidence_status"), "evidence_status must not exist on classification observations");
    });

    it("should not add is_evidence or evidence_status columns to model_outcome_observations", () => {
      const dbPath = path.join(testDir, "no-mutable-fields-outcome.db");
      setupDb(dbPath);
      const db = getDb();

      const columns = db
        .prepare("PRAGMA table_info(model_outcome_observations)")
        .all()
        .map((r: unknown) => (r as { name: string }).name);

      assert.ok(!columns.includes("is_evidence"), "is_evidence must not exist on outcome observations");
      assert.ok(!columns.includes("evidence_status"), "evidence_status must not exist on outcome observations");
    });
  });

  describe("FP-008 observation persistence preservation", () => {
    it("should still insert and retrieve classification observations after FP-009 migration", () => {
      const dbPath = path.join(testDir, "fp008-preserve-classification.db");
      setupDb(dbPath);

      const packet = createTestPacket("FP-008 Preserve Class");
      const obs = createValidClassification(packet.id);

      assert.ok(obs.classification_id > 0);

      const retrieved = getClassificationObservations(packet.id);
      assert.equal(retrieved.length, 1);
      assert.equal(retrieved[0].classification_id, obs.classification_id);
    });

    it("should still insert and retrieve outcome observations after FP-009 migration", () => {
      const dbPath = path.join(testDir, "fp008-preserve-outcome.db");
      setupDb(dbPath);

      const packet = createTestPacket("FP-008 Preserve Outcome");
      const obs = createValidOutcome(packet.id);

      assert.ok(obs.outcome_id > 0);

      const retrieved = getOutcomeObservations(packet.id);
      assert.equal(retrieved.length, 1);
      assert.equal(retrieved[0].outcome_id, obs.outcome_id);
    });

    it("should still default observations to PENDING admission_state", () => {
      const dbPath = path.join(testDir, "fp008-preserve-pending.db");
      setupDb(dbPath);

      const packet = createTestPacket("FP-008 Pending");
      const classification = createValidClassification(packet.id);
      const outcome = createValidOutcome(packet.id);

      assert.equal(classification.admission_state, "PENDING");
      assert.equal(outcome.admission_state, "PENDING");
    });
  });

  describe("FP-004 persistence behavior preservation", () => {
    it("should still record packet intent after FP-009 migration", () => {
      const dbPath = path.join(testDir, "fp004-preserve-intent.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-004 Compat FP-009",
        packet_path: "packets/FP-004-TEST.md",
        packet_hash: "hash-fp004-fp009",
      });

      assert.ok(packet.id > 0);
      assert.equal(packet.title, "FP-004 Compat FP-009");
    });

    it("should still append lifecycle events after FP-009 migration", () => {
      const dbPath = path.join(testDir, "fp004-preserve-lifecycle.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-004 Lifecycle FP-009",
        packet_path: "packets/FP-004-TEST.md",
        packet_hash: "hash-fp004-lc-fp009",
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

    it("should still derive current packet state after FP-009 migration", () => {
      const dbPath = path.join(testDir, "fp004-preserve-state.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-004 State FP-009",
        packet_path: "packets/FP-004-TEST.md",
        packet_hash: "hash-fp004-state-fp009",
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

  describe("FP-005 telemetry preservation", () => {
    it("should still ingest telemetry after FP-009 migration", () => {
      const dbPath = path.join(testDir, "fp005-preserve-ingest.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-005 FP-009 Compat",
        packet_path: "packets/FP-005-TEST.md",
        packet_hash: "hash-fp005-fp009",
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
      assert.equal(result.telemetry!.source, "OPENCODE_TELEMETRY");
    });

    it("should still retrieve telemetry by execution_id after FP-009 migration", () => {
      const dbPath = path.join(testDir, "fp005-preserve-retrieve.db");
      setupDb(dbPath);

      const packet = recordPacketIntent({
        title: "FP-005 Retrieve FP-009",
        packet_path: "packets/FP-005-TEST.md",
        packet_hash: "hash-fp005-retrieve-fp009",
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

  describe("Admission event query functions", () => {
    it("should retrieve admission events by observation type and id", () => {
      const dbPath = path.join(testDir, "query-admission-events.db");
      setupDb(dbPath);

      const packet = createTestPacket("Query Admission");
      const classification = createValidClassification(packet.id);
      createValidAdmission("classification_observation", classification.classification_id);

      const events = getAdmissionEvents("classification_observation", classification.classification_id);
      assert.equal(events.length, 1);
      assert.equal(events[0].target_observation_id, classification.classification_id);
    });

    it("should retrieve admission event by id", () => {
      const dbPath = path.join(testDir, "query-admission-by-id.db");
      setupDb(dbPath);

      const packet = createTestPacket("Query By Id");
      const classification = createValidClassification(packet.id);
      const admission = createValidAdmission("classification_observation", classification.classification_id);

      const retrieved = getAdmissionEvent(admission.id);
      assert.ok(retrieved);
      assert.equal(retrieved!.id, admission.id);
    });

    it("should retrieve review requests by admission event id", () => {
      const dbPath = path.join(testDir, "query-review-requests.db");
      setupDb(dbPath);

      const packet = createTestPacket("Query Reviews");
      const classification = createValidClassification(packet.id);
      const admission = createValidAdmission("classification_observation", classification.classification_id);
      createValidReviewRequest(admission.id);

      const reviews = getReviewRequests(admission.id);
      assert.equal(reviews.length, 1);
      assert.equal(reviews[0].target_admission_event_id, admission.id);
    });

    it("should retrieve invalidation events by admission event id", () => {
      const dbPath = path.join(testDir, "query-invalidations.db");
      setupDb(dbPath);

      const packet = createTestPacket("Query Invalidations");
      const classification = createValidClassification(packet.id);
      const admission = createValidAdmission("classification_observation", classification.classification_id);
      const review = createValidReviewRequest(admission.id);
      createValidInvalidation(admission.id, review.id, "INVALIDATED");

      const invalidations = getInvalidationEvents(admission.id);
      assert.equal(invalidations.length, 1);
      assert.equal(invalidations[0].target_admission_event_id, admission.id);
    });
  });

  describe("Append-only behavior", () => {
    it("should preserve admission events (no mutation of existing records)", () => {
      const dbPath = path.join(testDir, "append-only-admission.db");
      setupDb(dbPath);
      const db = getDb();

      const packet = createTestPacket("Append Admission");
      const classification = createValidClassification(packet.id);
      const admission = createValidAdmission("classification_observation", classification.classification_id);

      const admissionCount = db
        .prepare("SELECT COUNT(*) as cnt FROM evidence_admission_events WHERE id = ?")
        .get(admission.id) as { cnt: number };
      assert.equal(admissionCount.cnt, 1, "Admission event should still exist");

      const original = db
        .prepare("SELECT admission_decision FROM evidence_admission_events WHERE id = ?")
        .get(admission.id) as { admission_decision: string };
      assert.equal(original.admission_decision, "ADMITTED", "Admission decision should be unchanged");
    });

    it("should preserve review requests (no mutation of existing records)", () => {
      const dbPath = path.join(testDir, "append-only-review.db");
      setupDb(dbPath);
      const db = getDb();

      const packet = createTestPacket("Append Review");
      const classification = createValidClassification(packet.id);
      const admission = createValidAdmission("classification_observation", classification.classification_id);
      const review = createValidReviewRequest(admission.id);

      const reviewCount = db
        .prepare("SELECT COUNT(*) as cnt FROM admission_review_requests WHERE id = ?")
        .get(review.id) as { cnt: number };
      assert.equal(reviewCount.cnt, 1, "Review request should still exist");
    });

    it("should preserve invalidation events (no mutation of existing records)", () => {
      const dbPath = path.join(testDir, "append-only-invalidation.db");
      setupDb(dbPath);
      const db = getDb();

      const packet = createTestPacket("Append Invalidation");
      const classification = createValidClassification(packet.id);
      const admission = createValidAdmission("classification_observation", classification.classification_id);
      const review = createValidReviewRequest(admission.id);
      const invalidation = createValidInvalidation(admission.id, review.id, "INVALIDATED");

      const invalidationCount = db
        .prepare("SELECT COUNT(*) as cnt FROM admission_invalidation_events WHERE id = ?")
        .get(invalidation.id) as { cnt: number };
      assert.equal(invalidationCount.cnt, 1, "Invalidation event should still exist");
    });
  });
});
