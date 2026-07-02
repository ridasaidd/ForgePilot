import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";
const packetPath = "packets/FP-MCP-170.md";
const runId = "FP-MCP-170-NO-CONTACT-CONSUMING-ACTION-LIVE-CONFIRMATION";
const artifacts = [
  packetPath,
  "runs/FP-MCP-170/live-no-contact-confirmation.md",
  "runs/FP-MCP-170/live-no-contact-confirmation.json",
  "runs/FP-MCP-170/approvals/APPROVAL-20260702T183454722Z-d5c6f5f2.json",
  "runs/FP-MCP-159/consuming-action-no-contact/NOCONTACT-20260702T183532521Z-3f1fb760/readiness.json"
];
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
  model_role: "live_runtime_confirmation",
  branch: "feature/oauth-auth0",
  commit_sha: "2273e73",
  executor_result: "REAL_CONSUMING_ACTION_NO_CONTACT_LIVE_CONFIRMED_RUNNER_UNREACHABLE",
  verification_result: "LIVE_TOOL_CALL_CONFIRMED;CONTACT_CONFIRMATION_ACCEPTED_TRUE;SCOPED_CLEARANCE_ELIGIBLE_TRUE;CONSUMPTION_WOULD_BE_ALLOWED_TRUE;READINESS_ARTIFACT_RECORDED;REAL_CONSUMPTION_FALSE;RUNNER_CONTACT_REACHABLE_FALSE;RUNNER_START_ENDPOINT_CONTACTED_FALSE;OPENCODE_STARTED_FALSE;EXECUTION_PERMITTED_FALSE",
  audit_result: "NOT_APPLICABLE_LIVE_RUNTIME_CONFIRMATION",
  comparison_result: "NOT_APPLICABLE_LIVE_RUNTIME_CONFIRMATION",
  metrics_path: "runs/FP-MCP-170/live-no-contact-confirmation.json",
  artifact_paths: artifacts,
  trust_tier: "TIER_2_VERIFIED_ARTIFACT",
  validation_state: "VALID",
  admission_state: "ADMITTED",
});
const basis = "FP-MCP-170 admits live no-contact consuming action confirmation";
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
  result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED" ? "FP_MCP_170_NO_CONTACT_LIVE_CONFIRMATION_RECORDED_THROUGH_V1O_PATH" : "FP_MCP_170_LIVE_V1O_NOT_PROVEN",
  evidence_id: evidence.evidence_id,
  run_id: evidence.run_id,
  generic_admission_event_id: admission.id,
  canonical_status: canonical.status,
  canonical_surface: canonical.canonical_surface,
  canonical_state: canonical.canonical_state,
  admitted_claim: "REAL_CONSUMING_ACTION_NO_CONTACT_LIVE_CONFIRMED_RUNNER_UNREACHABLE",
  bridge_commit: "2273e73",
  total_evidence_records: totalEvidenceRecords,
  total_generic_evidence_record_admission_events: totalGenericAdmissionEvents,
  artifact_paths: artifacts
};
fs.writeFileSync("runs/FP-MCP-170/v1o-live-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
