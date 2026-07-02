import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";
const packetPath = "packets/FP-MCP-178.md";
const runId = "FP-MCP-178-FP027-CANARY-PREFLIGHT-HALT";
const artifacts = [
  packetPath,
  "runs/FP-MCP-178/contact-confirmation.json",
  "runs/FP-MCP-178/result-summary.md",
  "runs/FP-MCP-178/preflight-halt.json",
  "runs/FP-MCP-178/opencode-requests/REQ-20260702T200335727Z-c3299ea6.json",
  "runs/FP-MCP-178/approvals/APPROVAL-20260702T200411965Z-66483727.json",
  "runs/FP-MCP-178/pre-start-evidence/REQ-20260702T200335727Z-c3299ea6.json",
  "runs/FP-MCP-178/start-state-snapshots/REQ-20260702T200335727Z-c3299ea6/ATTEMPT-20260702T200459184Z-de779d51/pre-start-state.json",
  "runs/FP-MCP-178/start-state-snapshots/REQ-20260702T200335727Z-c3299ea6/ATTEMPT-20260702T200459184Z-de779d51/post-start-state.json"
];
function sha256File(path: string): string { return crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex"); }
initDb("data/forgepilot.db");
const db = getDb();
let packet = db.prepare("SELECT * FROM packets WHERE packet_path = ? ORDER BY id ASC LIMIT 1").get(packetPath) as { id: number } | undefined;
if (!packet) packet = recordPacketIntent({ packet_type: "fp-mcp", title: "FP-MCP-178", packet_path: packetPath, packet_hash: sha256File(packetPath) });
let evidence = getEvidenceByRunId(runId)[0];
if (!evidence) evidence = insertEvidenceRecord({
  packet_id: packet.id,
  run_id: runId,
  model_id: "none",
  model_role: "fp027_canary_preflight_halt",
  branch: "main",
  commit_sha: "d57ff54",
  executor_result: "FP_027_CANARY_BLOCKED_BEFORE_RUNNER_CONTACT",
  verification_result: "FRESH_PACKET_REQUEST_APPROVAL_CREATED;CONTACT_CONFIRMATION_RECORDED;PRE_START_EVIDENCE_PASSED;CANONICAL_STATE_SNAPSHOT_SUCCEEDED;ALL_EVIDENCE_GATES_PASSED;GUARDED_PREFLIGHT_FAILED_ON_DISABLE_SWITCH_RUNNER_CAPABILITY_AND_OPENCODE_EXECUTION_DISABLED;START_TOOL_INVOKED_FALSE;RUNNER_CONTACT_FALSE;OPENCODE_STARTED_FALSE;APPROVAL_CONSUMED_FALSE;RETRY_FALSE",
  audit_result: "NOT_APPLICABLE_PREFLIGHT_HALT",
  comparison_result: "NOT_APPLICABLE_PREFLIGHT_HALT",
  metrics_path: "runs/FP-MCP-178/preflight-halt.json",
  artifact_paths: artifacts,
  trust_tier: "TIER_2_VERIFIED_ARTIFACT",
  validation_state: "VALID",
  admission_state: "ADMITTED",
});
const basis = "FP-MCP-178 admits FP-027 canary preflight halt";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) admission = recordEvidenceAdmission({
  target_observation_type: "evidence_record",
  target_observation_id: evidence.evidence_id,
  admission_decision: "ADMITTED",
  admission_actor_type: "system",
  admission_actor_id: "FP-MCP-178",
  admission_trust_tier: "TIER_2",
  validation_state: "VALID",
  provenance_complete: true,
  admission_basis: basis,
});
const canonical = getCanonicalEvidenceRecordAdmission(evidence.evidence_id);
const totalEvidenceRecords = (db.prepare("SELECT count(*) AS count FROM evidence_records").get() as { count: number }).count;
const totalGenericAdmissionEvents = (db.prepare("SELECT count(*) AS count FROM evidence_admission_events WHERE target_observation_type = 'evidence_record'").get() as { count: number }).count;
const output = {
  packet_id: "FP-MCP-178",
  result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED" ? "FP_MCP_178_CANARY_PREFLIGHT_HALT_RECORDED_THROUGH_V1O_PATH" : "FP_MCP_178_V1O_NOT_PROVEN",
  evidence_id: evidence.evidence_id,
  run_id: evidence.run_id,
  generic_admission_event_id: admission.id,
  canonical_status: canonical.status,
  canonical_surface: canonical.canonical_surface,
  canonical_state: canonical.canonical_state,
  admitted_claim: "FP_027_CANARY_BLOCKED_BEFORE_RUNNER_CONTACT",
  total_evidence_records: totalEvidenceRecords,
  total_generic_evidence_record_admission_events: totalGenericAdmissionEvents,
  artifact_paths: artifacts
};
fs.writeFileSync("runs/FP-MCP-178/v1o-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
