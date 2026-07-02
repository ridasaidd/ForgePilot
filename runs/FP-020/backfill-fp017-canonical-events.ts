import fs from "node:fs";
import { initDb, closeDb } from "../../src/db/client.js";
import { getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const dbPath = "data/forgepilot.db";
const targets = [
  {
    run_id: "FP-017-POSITIVE-ADMITTED",
    expected_state: "ADMITTED",
    trust_tier: "TIER_2",
    validation_state: "VALID",
    basis: "FP-020 canonical backfill for FP-017 positive admitted evidence record",
  },
  {
    run_id: "FP-017-NEGATIVE-REJECTED",
    expected_state: "REJECTED",
    trust_tier: "TIER_0",
    validation_state: "INVALID",
    basis: "FP-020 canonical backfill for FP-017 rejected control evidence record",
  },
] as const;

initDb(dbPath);

const results = [];
for (const target of targets) {
  const records = getEvidenceByRunId(target.run_id);
  const record = records[0];
  if (!record) {
    throw new Error(`FP-017 evidence record not found for ${target.run_id}`);
  }
  if (record.admission_state !== target.expected_state) {
    throw new Error(
      `FP-017 evidence record ${target.run_id} has admission_state ${record.admission_state}, expected ${target.expected_state}`
    );
  }

  const existing = getAdmissionEvents("evidence_record", record.evidence_id).find(
    (event) => event.admission_decision === target.expected_state && event.admission_basis === target.basis
  );

  const event = existing ?? recordEvidenceAdmission({
    target_observation_type: "evidence_record",
    target_observation_id: record.evidence_id,
    admission_decision: target.expected_state,
    admission_actor_type: "system",
    admission_actor_id: "FP-020",
    admission_trust_tier: target.trust_tier,
    validation_state: target.validation_state,
    provenance_complete: true,
    admission_basis: target.basis,
  });

  const canonical = getCanonicalEvidenceRecordAdmission(record.evidence_id);
  results.push({
    run_id: target.run_id,
    evidence_id: record.evidence_id,
    field_admission_state: record.admission_state,
    generic_event_id: event.id,
    generic_event_decision: event.admission_decision,
    canonical_status: canonical.status,
    canonical_surface: canonical.canonical_surface,
    canonical_state: canonical.canonical_state,
  });
}

const output = {
  packet_id: "FP-020",
  result: results.every((r) => r.canonical_status === "GENERIC_EVENT_CANONICAL" && r.canonical_state === r.field_admission_state)
    ? "FP017_RECORDS_BACKFILLED_TO_CANONICAL_GENERIC_EVENTS"
    : "FP017_BACKFILL_NOT_PROVEN",
  results,
};

fs.writeFileSync("runs/FP-020/fp017-canonical-backfill-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
