import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";
const packetPath = "packets/FP-MCP-181.md";
const runId = "FP-MCP-181-FPMCP180-LIVE-CONFIRMATION-STALLED";
const artifacts = [
  packetPath,
  "runs/FP-MCP-181/expected-live-confirmation.json",
  "runs/FP-MCP-181/result-summary.md",
  "runs/FP-MCP-181/live-confirmation-blocked.json",
  "runs/FP-MCP-181/opencode-requests/REQ-20260702T203356480Z-5f5eefc8.json",
  "runs/FP-MCP-181/approvals/APPROVAL-20260702T203443589Z-1459f91e.json",
  "runs/FP-MCP-181/pre-start-evidence/REQ-20260702T203356480Z-5f5eefc8.json",
  "runs/FP-MCP-181/start-state-snapshots/REQ-20260702T203356480Z-5f5eefc8/ATTEMPT-20260702T203531148Z-1c5a8e71/pre-start-state.json",
  "runs/FP-MCP-181/start-state-snapshots/REQ-20260702T203356480Z-5f5eefc8/ATTEMPT-20260702T203531148Z-1c5a8e71/post-start-state.json"
];
function sha256File(path: string): string { return crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex"); }
initDb("data/forgepilot.db");
const db = getDb();
let packet = db.prepare("SELECT * FROM packets WHERE packet_path = ? ORDER BY id ASC LIMIT 1").get(packetPath) as { id: number } | undefined;
if (!packet) packet = recordPacketIntent({ packet_type: "fp-mcp", title: "FP-MCP-181", packet_path: packetPath, packet_hash: sha256File(packetPath) });
let evidence = getEvidenceByRunId(runId)[0];
if (!evidence) evidence = insertEvidenceRecord({
  packet_id: packet.id,
  run_id: runId,
  model_id: "none",
  model_role: "runtime_live_confirmation_halt",
  branch: "main",
  commit_sha: "877da5a",
  executor_result: "FP_MCP_180_LIVE_CONFIRMATION_NOT_PROVEN_RUNTIME_STILL_STALE_APPROVAL_PAYLOAD_BLOCKED",
  verification_result: "FRESH_TUPLE_CREATED;FRESH_APPROVAL_USABLE;PRESTART_VALID;STATE_SNAPSHOT_VALID;APPROVAL_BEARING_PREFLIGHT_BLOCKED_BY_PLATFORM;NO_APPROVAL_PREFLIGHT_REACHED_FORGEPILOT;NO_APPROVAL_PREFLIGHT_SHOWED_STALE_PREDICATE_UNEXPECTED_SUPPORTED_OPERATION_PRESENT;NEW_FPMCP180_FIELDS_ABSENT;LIVE_CONFIRMATION_NOT_PROVEN;START_TOOL_INVOKED_FALSE;RUNNER_CONTACT_FALSE;APPROVAL_CONSUMED_FALSE",
  audit_result: "NOT_APPLICABLE_RUNTIME_CONFIRMATION_HALT",
  comparison_result: "NOT_APPLICABLE_RUNTIME_CONFIRMATION_HALT",
  metrics_path: "runs/FP-MCP-181/live-confirmation-blocked.json",
  artifact_paths: artifacts,
  trust_tier: "TIER_2_VERIFIED_ARTIFACT",
  validation_state: "VALID",
  admission_state: "ADMITTED",
});
const basis = "FP-MCP-181 admits FP-MCP-180 live confirmation halted by stale runtime and platform block";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) admission = recordEvidenceAdmission({
  target_observation_type: "evidence_record",
  target_observation_id: evidence.evidence_id,
  admission_decision: "ADMITTED",
  admission_actor_type: "system",
  admission_actor_id: "FP-MCP-181",
  admission_trust_tier: "TIER_2",
  validation_state: "VALID",
  provenance_complete: true,
  admission_basis: basis,
});
const canonical = getCanonicalEvidenceRecordAdmission(evidence.evidence_id);
const totalEvidenceRecords = (db.prepare("SELECT count(*) AS count FROM evidence_records").get() as { count: number }).count;
const totalGenericAdmissionEvents = (db.prepare("SELECT count(*) AS count FROM evidence_admission_events WHERE target_observation_type = 'evidence_record'").get() as { count: number }).count;
const output = {
  packet_id: "FP-MCP-181",
  result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED" ? "FP_MCP_181_RUNTIME_STALE_HALT_RECORDED_THROUGH_V1O_PATH" : "FP_MCP_181_V1O_NOT_PROVEN",
  evidence_id: evidence.evidence_id,
  run_id: evidence.run_id,
  generic_admission_event_id: admission.id,
  canonical_status: canonical.status,
  canonical_surface: canonical.canonical_surface,
  canonical_state: canonical.canonical_state,
  admitted_claim: "FP_MCP_180_LIVE_CONFIRMATION_NOT_PROVEN_RUNTIME_STILL_STALE_APPROVAL_PAYLOAD_BLOCKED",
  total_evidence_records: totalEvidenceRecords,
  total_generic_evidence_record_admission_events: totalGenericAdmissionEvents,
  artifact_paths: artifacts
};
fs.writeFileSync("runs/FP-MCP-181/v1o-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
