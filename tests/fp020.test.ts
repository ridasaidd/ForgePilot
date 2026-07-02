import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { initDb, getDb, closeDb } from "../src/db/client.js";
import { migrate } from "../src/db/migrate.js";
import { recordPacketIntent } from "../src/db/persistence.js";
import { insertEvidenceRecord } from "../src/db/evidence-records.js";
import { recordEvidenceAdmission } from "../src/db/evidence.js";
import {
  recordEvidenceRecordAdmission,
  getCanonicalEvidenceRecordAdmission,
} from "../src/db/validation-admission.js";

let testDir: string;

before(() => {
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), "forgepilot-fp020-"));
});

after(() => {
  closeDb();
  fs.rmSync(testDir, { recursive: true, force: true });
});

function ensurePrerequisiteData() {
  const db = getDb();
  db.exec("INSERT OR IGNORE INTO phases (id, name, status) VALUES (1, 'default-phase', 'pending')");
  db.exec("INSERT OR IGNORE INTO steps (id, phase_id, name, status) VALUES (1, 1, 'default-step', 'pending')");
  db.exec("INSERT OR IGNORE INTO tasks (id, step_id, name, status) VALUES (1, 1, 'default-task', 'pending')");
}

function setupDb(dbPath: string) {
  closeDb();
  initDb(dbPath);
  migrate();
  ensurePrerequisiteData();
  const packet = recordPacketIntent({
    title: "FP-020 Canonical Surface Test",
    packet_path: "packets/FP-020.md",
    packet_hash: `hash-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  });
  return packet.id;
}

function createEvidenceRecord(packetId: number, runId: string) {
  return insertEvidenceRecord({
    packet_id: packetId,
    run_id: runId,
    model_id: "none",
    model_role: "test_fixture",
    branch: "main",
    commit_sha: "fp020-test",
    executor_result: "NOT_APPLICABLE_TEST_FIXTURE",
    verification_result: "PASSED",
    audit_result: "NOT_APPLICABLE_TEST_FIXTURE",
    comparison_result: "NOT_APPLICABLE_TEST_FIXTURE",
    metrics_path: "runs/FP-020/test-fixture.json",
    artifact_paths: ["runs/FP-020/test-fixture.json"],
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "NOT_EVALUATED",
  });
}

function createGenericAdmission(evidenceId: number, decision: "ADMITTED" | "REJECTED" | "PENDING") {
  return recordEvidenceAdmission({
    target_observation_type: "evidence_record",
    target_observation_id: evidenceId,
    admission_decision: decision,
    admission_actor_type: "human_auditor",
    admission_actor_id: "fp020-auditor",
    admission_trust_tier: "TIER_2",
    validation_state: "VALID",
    provenance_complete: true,
    admission_basis: "FP-020 canonical surface test",
  });
}

describe("FP-020: Canonical evidence record admission surface", () => {
  it("returns GENERIC_EVENT_CANONICAL for generic event only", () => {
    const packetId = setupDb(path.join(testDir, "generic-only.db"));
    const record = createEvidenceRecord(packetId, "fp020-generic-only");
    createGenericAdmission(record.evidence_id, "ADMITTED");

    const result = getCanonicalEvidenceRecordAdmission(record.evidence_id);

    assert.equal(result.status, "GENERIC_EVENT_CANONICAL");
    assert.equal(result.canonical_surface, "evidence_admission_events");
    assert.equal(result.canonical_state, "ADMITTED");
    assert.equal(result.legacy_event, null);
  });

  it("returns LEGACY_EVENT_ONLY_NOT_CANONICAL for legacy event only", () => {
    const packetId = setupDb(path.join(testDir, "legacy-only.db"));
    const record = createEvidenceRecord(packetId, "fp020-legacy-only");
    recordEvidenceRecordAdmission({
      evidence_record_id: record.evidence_id,
      admission_state: "ADMITTED",
      admission_actor_type: "human_auditor",
      admission_reason: "Legacy-only event",
      trust_tier_at_admission: "TIER_2_VERIFIED_ARTIFACT",
    });

    const result = getCanonicalEvidenceRecordAdmission(record.evidence_id);

    assert.equal(result.status, "LEGACY_EVENT_ONLY_NOT_CANONICAL");
    assert.equal(result.canonical_surface, null);
    assert.equal(result.canonical_state, null);
    assert.equal(result.generic_event, null);
    assert.equal(result.legacy_event?.admission_state, "ADMITTED");
  });

  it("returns DUAL_TABLE_CONFLICT for conflicting generic and legacy events", () => {
    const packetId = setupDb(path.join(testDir, "dual-conflict.db"));
    const record = createEvidenceRecord(packetId, "fp020-conflict");
    createGenericAdmission(record.evidence_id, "ADMITTED");
    recordEvidenceRecordAdmission({
      evidence_record_id: record.evidence_id,
      admission_state: "REJECTED",
      admission_actor_type: "human_auditor",
      admission_reason: "Conflicting legacy event",
      trust_tier_at_admission: "TIER_2_VERIFIED_ARTIFACT",
    });

    const result = getCanonicalEvidenceRecordAdmission(record.evidence_id);

    assert.equal(result.status, "DUAL_TABLE_CONFLICT");
    assert.equal(result.canonical_surface, null);
    assert.equal(result.canonical_state, null);
    assert.equal(result.generic_event?.admission_decision, "ADMITTED");
    assert.equal(result.legacy_event?.admission_state, "REJECTED");
  });

  it("returns GENERIC_EVENT_CANONICAL when generic and legacy agree", () => {
    const packetId = setupDb(path.join(testDir, "dual-agree.db"));
    const record = createEvidenceRecord(packetId, "fp020-agree");
    createGenericAdmission(record.evidence_id, "REJECTED");
    recordEvidenceRecordAdmission({
      evidence_record_id: record.evidence_id,
      admission_state: "REJECTED",
      admission_actor_type: "human_auditor",
      admission_reason: "Agreeing legacy event",
      trust_tier_at_admission: "TIER_2_VERIFIED_ARTIFACT",
    });

    const result = getCanonicalEvidenceRecordAdmission(record.evidence_id);

    assert.equal(result.status, "GENERIC_EVENT_CANONICAL");
    assert.equal(result.canonical_surface, "evidence_admission_events");
    assert.equal(result.canonical_state, "REJECTED");
    assert.equal(result.legacy_event?.admission_state, "REJECTED");
  });

  it("returns NO_EVENT when neither table has an event", () => {
    const packetId = setupDb(path.join(testDir, "no-event.db"));
    const record = createEvidenceRecord(packetId, "fp020-no-event");

    const result = getCanonicalEvidenceRecordAdmission(record.evidence_id);

    assert.equal(result.status, "NO_EVENT");
    assert.equal(result.canonical_surface, null);
    assert.equal(result.canonical_state, null);
    assert.equal(result.generic_event, null);
    assert.equal(result.legacy_event, null);
  });
});
