import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetPath = "packets/FP-MCP-163.md";
const runId = "FP-MCP-163-APPROVAL-ID-PROPAGATION-FIX-LIVE-CONFIRMED";
const artifacts = [
  "packets/FP-MCP-163.md",
  "runs/FP-MCP-163/follow-up-verification.md",
  "runs/FP-MCP-163/source-follow-up-result.json",
  "runs/FP-MCP-163/post-refresh-approval-propagation-check.md",
  "runs/FP-MCP-163/post-refresh-approval-propagation-check.json",
  "runs/FP-MCP-163/hash-sanity-check.json"
];
function sha256File(path: string): string { return crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex"); }
initDb("data/forgepilot.db");
const db = getDb();
let packet = db.prepare("SELECT * FROM packets WHERE packet_path = ? ORDER BY id ASC LIMIT 1").get(packetPath) as { id: number } | undefined;
if (!packet) packet = recordPacketIntent({ packet_type: "fp-mcp", title: "FP-MCP-163", packet_path: packetPath, packet_hash: sha256File(packetPath) });
let evidence = getEvidenceByRunId(runId)[0];
if (!evidence) {
  evidence = insertEvidenceRecord({
    packet_id: packet.id,
    run_id: runId,
    model_id: "none",
    model_role: "post_refresh_runtime_confirmation",
    branch: "feature/oauth-auth0",
    commit_sha: "1c42e6c",
    executor_result: "APPROVAL_ID_PROPAGATION_FIX_LIVE_RUNTIME_CONFIRMED",
    verification_result: "POST_REFRESH_GUARDED_PREFLIGHT_CONFIRMED;LEGACY_HUMAN_APPROVAL_BLOCKER_STRINGS_ABSENT;EIGHT_GATES_PASSED;EXECUTION_STILL_BLOCKED;NO_RUNNER_START_CONTACT;NO_OPENCODE_START;NO_APPROVAL_CONSUMPTION",
    audit_result: "NOT_APPLICABLE_RUNTIME_CONFIRMATION",
    comparison_result: "NOT_APPLICABLE_RUNTIME_CONFIRMATION",
    metrics_path: "runs/FP-MCP-163/post-refresh-approval-propagation-check.json",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED",
  });
}
const basis = "FP-MCP-163 admits post-refresh live confirmation of approval-id propagation fix";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({ target_observation_type: "evidence_record", target_observation_id: evidence.evidence_id, admission_decision: "ADMITTED", admission_actor_type: "system", admission_actor_id: "FP-MCP-163", admission_trust_tier: "TIER_2", validation_state: "VALID", provenance_complete: true, admission_basis: basis });
}
const canonical = getCanonicalEvidenceRecordAdmission(evidence.evidence_id);
const totalEvidenceRecords = (db.prepare("SELECT count(*) AS count FROM evidence_records").get() as { count: number }).count;
const totalGenericAdmissionEvents = (db.prepare("SELECT count(*) AS count FROM evidence_admission_events WHERE target_observation_type = 'evidence_record'").get() as { count: number }).count;
const output = {
  packet_id: "FP-MCP-163",
  result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED" ? "FP_MCP_163_APPROVAL_ID_PROPAGATION_FIX_LIVE_CONFIRMED_RECORDED_THROUGH_V1O_PATH" : "FP_MCP_163_APPROVAL_ID_PROPAGATION_FIX_LIVE_CONFIRMATION_V1O_NOT_PROVEN",
  evidence_id: evidence.evidence_id,
  run_id: evidence.run_id,
  generic_admission_event_id: admission.id,
  canonical_status: canonical.status,
  canonical_surface: canonical.canonical_surface,
  canonical_state: canonical.canonical_state,
  admitted_claim: "APPROVAL_ID_PROPAGATION_FIX_LIVE_RUNTIME_CONFIRMED",
  bridge_commit: "1c42e6c",
  total_evidence_records: totalEvidenceRecords,
  total_generic_evidence_record_admission_events: totalGenericAdmissionEvents,
  artifact_paths: artifacts
};
fs.writeFileSync("runs/FP-MCP-163/v1o-refresh-confirmation-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
