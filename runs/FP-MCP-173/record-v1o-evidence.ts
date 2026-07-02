import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";
const packetPath = "packets/FP-MCP-173.md";
const runId = "FP-MCP-173-OPENCODE-READINESS-BLOCKER-CLASSIFICATION";
const artifacts = [
  packetPath,
  "runs/FP-MCP-173/result-summary.md",
  "runs/FP-MCP-173/opencode-readiness-classification.json",
  "runs/FP-MCP-173/false-open-field-audit.md"
];
function sha256File(path: string): string { return crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex"); }
initDb("data/forgepilot.db");
const db = getDb();
let packet = db.prepare("SELECT * FROM packets WHERE packet_path = ? ORDER BY id ASC LIMIT 1").get(packetPath) as { id: number } | undefined;
if (!packet) packet = recordPacketIntent({ packet_type: "fp-mcp", title: "FP-MCP-173", packet_path: packetPath, packet_hash: sha256File(packetPath) });
let evidence = getEvidenceByRunId(runId)[0];
if (!evidence) evidence = insertEvidenceRecord({
  packet_id: packet.id,
  run_id: runId,
  model_id: "none",
  model_role: "readiness_blocker_classification",
  branch: "main",
  commit_sha: "cf964a1",
  executor_result: "OPENCODE_NOT_CONFIGURED_CLASSIFIED_AS_READINESS_LABEL_FALSE_NEGATIVE_NO_FALSE_OPEN_CONSUMER_FOUND",
  verification_result: "REMOTE_RUNNER_REACHABLE_TRUE;START_ENDPOINT_CALLABLE_GUARDED;OPENCODE_DISCOVERY_CONFIGURED_TRUE;LIVE_OPENCODE_CHECKED_FALSE;OPENCODE_EXECUTION_ENABLED_FALSE;FIELD_MISMATCH_CONFIRMED;NO_FALSE_OPEN_CONSUMER_FOUND;CANARY_NOT_RETRIED",
  audit_result: "NOT_APPLICABLE_CLASSIFICATION_PACKET",
  comparison_result: "NOT_APPLICABLE_CLASSIFICATION_PACKET",
  metrics_path: "runs/FP-MCP-173/opencode-readiness-classification.json",
  artifact_paths: artifacts,
  trust_tier: "TIER_2_VERIFIED_ARTIFACT",
  validation_state: "VALID",
  admission_state: "ADMITTED",
});
const basis = "FP-MCP-173 admits OpenCode readiness blocker classification";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) admission = recordEvidenceAdmission({
  target_observation_type: "evidence_record",
  target_observation_id: evidence.evidence_id,
  admission_decision: "ADMITTED",
  admission_actor_type: "system",
  admission_actor_id: "FP-MCP-173",
  admission_trust_tier: "TIER_2",
  validation_state: "VALID",
  provenance_complete: true,
  admission_basis: basis,
});
const canonical = getCanonicalEvidenceRecordAdmission(evidence.evidence_id);
const totalEvidenceRecords = (db.prepare("SELECT count(*) AS count FROM evidence_records").get() as { count: number }).count;
const totalGenericAdmissionEvents = (db.prepare("SELECT count(*) AS count FROM evidence_admission_events WHERE target_observation_type = 'evidence_record'").get() as { count: number }).count;
const output = {
  packet_id: "FP-MCP-173",
  result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED" ? "FP_MCP_173_OPENCODE_READINESS_CLASSIFICATION_RECORDED_THROUGH_V1O_PATH" : "FP_MCP_173_V1O_NOT_PROVEN",
  evidence_id: evidence.evidence_id,
  run_id: evidence.run_id,
  generic_admission_event_id: admission.id,
  canonical_status: canonical.status,
  canonical_surface: canonical.canonical_surface,
  canonical_state: canonical.canonical_state,
  admitted_claim: "OPENCODE_NOT_CONFIGURED_CLASSIFIED_AS_READINESS_LABEL_FALSE_NEGATIVE_NO_FALSE_OPEN_CONSUMER_FOUND",
  total_evidence_records: totalEvidenceRecords,
  total_generic_evidence_record_admission_events: totalGenericAdmissionEvents,
  artifact_paths: artifacts
};
fs.writeFileSync("runs/FP-MCP-173/v1o-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
