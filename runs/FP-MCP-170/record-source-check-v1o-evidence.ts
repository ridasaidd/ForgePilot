import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";
const packetPath = "packets/FP-MCP-170.md";
const runId = "FP-MCP-170-NO-CONTACT-SOURCE-REACHABILITY-CHECK";
const artifacts = [packetPath, "runs/FP-MCP-170/no-contact-source-reachability-check.md", "runs/FP-MCP-170/no-contact-source-reachability-check.json"];
function sha256File(path: string): string { return crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex"); }
initDb("data/forgepilot.db");
const db = getDb();
let packet = db.prepare("SELECT * FROM packets WHERE packet_path = ? ORDER BY id ASC LIMIT 1").get(packetPath) as { id: number } | undefined;
if (!packet) packet = recordPacketIntent({ packet_type: "fp-mcp", title: "FP-MCP-170", packet_path: packetPath, packet_hash: sha256File(packetPath) });
let evidence = getEvidenceByRunId(runId)[0];
if (!evidence) evidence = insertEvidenceRecord({
  packet_id: packet.id,
  run_id: runId,
  model_id: "none",
  model_role: "source_reachability_check",
  branch: "feature/oauth-auth0",
  commit_sha: "2273e73",
  executor_result: "NO_CONTACT_EVALUATOR_RUNNER_CONTACT_UNREACHABLE_BY_CONSTRUCTION_SOURCE_CONFIRMED",
  verification_result: "DIRECT_FUNCTION_HAS_NO_RUNNER_START_CALL;HELPER_CHAIN_HAS_NO_RUNNER_START_CALL;NO_FETCH_OR_HTTP_CALL_IN_PATH;ONLY_START_RUN_HIT_IS_CAPABILITY_STRING_CHECK;NOT_MERELY_GATED",
  audit_result: "NOT_APPLICABLE_SOURCE_REACHABILITY_CHECK",
  comparison_result: "NOT_APPLICABLE_SOURCE_REACHABILITY_CHECK",
  metrics_path: "runs/FP-MCP-170/no-contact-source-reachability-check.json",
  artifact_paths: artifacts,
  trust_tier: "TIER_2_VERIFIED_ARTIFACT",
  validation_state: "VALID",
  admission_state: "ADMITTED",
});
const basis = "FP-MCP-170 admits no-contact source reachability check";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) admission = recordEvidenceAdmission({
  target_observation_type: "evidence_record",
  target_observation_id: evidence.evidence_id,
  admission_decision: "ADMITTED",
  admission_actor_type: "system",
  admission_actor_id: "FP-MCP-170",
  admission_trust_tier: "TIER_2",
  validation_state: "VALID",
  provenance_complete: true,
  admission_basis: basis,
});
const canonical = getCanonicalEvidenceRecordAdmission(evidence.evidence_id);
const totalEvidenceRecords = (db.prepare("SELECT count(*) AS count FROM evidence_records").get() as { count: number }).count;
const totalGenericAdmissionEvents = (db.prepare("SELECT count(*) AS count FROM evidence_admission_events WHERE target_observation_type = 'evidence_record'").get() as { count: number }).count;
const output = {
  packet_id: "FP-MCP-170",
  result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED" ? "FP_MCP_170_SOURCE_REACHABILITY_CHECK_RECORDED_THROUGH_V1O_PATH" : "FP_MCP_170_SOURCE_REACHABILITY_V1O_NOT_PROVEN",
  evidence_id: evidence.evidence_id,
  run_id: evidence.run_id,
  generic_admission_event_id: admission.id,
  canonical_status: canonical.status,
  canonical_surface: canonical.canonical_surface,
  canonical_state: canonical.canonical_state,
  admitted_claim: "NO_CONTACT_EVALUATOR_RUNNER_CONTACT_UNREACHABLE_BY_CONSTRUCTION_SOURCE_CONFIRMED",
  bridge_commit: "2273e73",
  total_evidence_records: totalEvidenceRecords,
  total_generic_evidence_record_admission_events: totalGenericAdmissionEvents,
  artifact_paths: artifacts
};
fs.writeFileSync("runs/FP-MCP-170/v1o-source-check-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
