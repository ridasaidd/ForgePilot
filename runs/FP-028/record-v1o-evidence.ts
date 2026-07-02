import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetPath = "packets/FP-028.md";
const runId = "FP-028-BOUNDARY-FLAG-SOURCE-INSPECTION";
const artifacts = [
  "packets/FP-028.md",
  "runs/FP-028/source-inspection-report.md",
  "runs/FP-028/live-status-after-fp027.json",
  "runs/FP-028/result-summary.md"
];
function sha256File(path: string): string { return crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex"); }
initDb("data/forgepilot.db");
const db = getDb();
let packet = db.prepare("SELECT * FROM packets WHERE packet_path = ? ORDER BY id ASC LIMIT 1").get(packetPath) as { id: number } | undefined;
if (!packet) packet = recordPacketIntent({ packet_type: "fp", title: "FP-028 — Execution Enablement Boundary Flag Source Inspection", packet_path: packetPath, packet_hash: sha256File(packetPath) });
let evidence = getEvidenceByRunId(runId)[0];
if (!evidence) {
  evidence = insertEvidenceRecord({
    packet_id: packet.id,
    run_id: runId,
    model_id: "none",
    model_role: "source_inspection",
    branch: "feature/oauth-auth0",
    commit_sha: "8422542",
    executor_result: "ENABLEMENT_BOUNDARY_FLAGS_SOURCE_INSPECTED",
    verification_result: "SOURCE_INSPECTION_COMPLETE;SURFACE_MISMATCHES_FOUND;NO_CODE_CHANGED;NO_EXECUTION_ENABLED",
    audit_result: "NOT_APPLICABLE_SOURCE_INSPECTION",
    comparison_result: "NOT_APPLICABLE_SOURCE_INSPECTION",
    metrics_path: "runs/FP-028/live-status-after-fp027.json",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED",
  });
}
const basis = "FP-028 admits source inspection of execution enablement boundary flags and cross-surface mismatch findings";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({ target_observation_type: "evidence_record", target_observation_id: evidence.evidence_id, admission_decision: "ADMITTED", admission_actor_type: "system", admission_actor_id: "FP-028", admission_trust_tier: "TIER_2", validation_state: "VALID", provenance_complete: true, admission_basis: basis });
}
const canonical = getCanonicalEvidenceRecordAdmission(evidence.evidence_id);
const output = { packet_id: "FP-028", result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED" ? "FP_028_BOUNDARY_FLAG_INSPECTION_RECORDED_THROUGH_V1O_PATH" : "FP_028_BOUNDARY_FLAG_INSPECTION_V1O_NOT_PROVEN", evidence_id: evidence.evidence_id, run_id: evidence.run_id, generic_admission_event_id: admission.id, canonical_status: canonical.status, canonical_surface: canonical.canonical_surface, canonical_state: canonical.canonical_state, admitted_claim: "ENABLEMENT_BOUNDARY_FLAGS_SOURCE_INSPECTED", artifact_paths: artifacts };
fs.writeFileSync("runs/FP-028/v1o-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
