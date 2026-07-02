import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";
const packetPath = "packets/FP-MCP-182.md";
const runId = "FP-MCP-182-FPMCP180-COMPOSITE-LIVE-CONFIRMATION";
const artifacts = [
  packetPath,
  "runs/FP-MCP-182/expected-live-confirmation.json",
  "runs/FP-MCP-182/result-summary.md",
  "runs/FP-MCP-182/live-confirmation.json",
  "runs/FP-MCP-182/opencode-requests/REQ-20260702T210007524Z-4ba16774.json",
  "runs/FP-MCP-182/approvals/APPROVAL-20260702T210036474Z-fd2a5a94.json",
  "runs/FP-MCP-182/pre-start-evidence/REQ-20260702T210007524Z-4ba16774.json",
  "runs/FP-MCP-182/start-state-snapshots/REQ-20260702T210007524Z-4ba16774/ATTEMPT-20260702T210139568Z-66463fc4/pre-start-state.json",
  "runs/FP-MCP-182/start-state-snapshots/REQ-20260702T210007524Z-4ba16774/ATTEMPT-20260702T210139568Z-66463fc4/post-start-state.json"
];
function sha256File(path: string): string { return crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex"); }
initDb("data/forgepilot.db");
const db = getDb();
let packet = db.prepare("SELECT * FROM packets WHERE packet_path = ? ORDER BY id ASC LIMIT 1").get(packetPath) as { id: number } | undefined;
if (!packet) packet = recordPacketIntent({ packet_type: "fp-mcp", title: "FP-MCP-182", packet_path: packetPath, packet_hash: sha256File(packetPath) });
let evidence = getEvidenceByRunId(runId)[0];
if (!evidence) evidence = insertEvidenceRecord({
  packet_id: packet.id,
  run_id: runId,
  model_id: "none",
  model_role: "composite_live_runtime_confirmation",
  branch: "main",
  commit_sha: "6a4e824",
  executor_result: "RUNNER_CAPABILITY_PREDICATE_LIVE_CONFIRMED_COMPOSITE_ONLY_DISABLE_BLOCKERS_REMAIN",
  verification_result: "FRESH_TUPLE_CREATED;FRESH_APPROVAL_USABLE;PRESTART_VALID;STATE_SNAPSHOT_VALID;APPROVAL_AWARE_VALIDATE_EXECUTION_PREFLIGHT_REACHED_FORGEPILOT;RUNNER_CAPABILITY_PASSED;HUMAN_APPROVAL_EVIDENCE_PASSED;GUARDED_REPORT_WITHOUT_APPROVAL_CONFIRMED_START_RUN_ADVERTISED_TRUE_DIRECT_EXECUTION_FALSE_UNEXPECTED_SUPPORTED_OPERATION_FALSE;APPROVAL_BEARING_GUARDED_REPORT_BLOCKED_BY_PLATFORM;START_TOOL_INVOKED_FALSE;RUNNER_CONTACT_FALSE;APPROVAL_CONSUMED_FALSE",
  audit_result: "NOT_APPLICABLE_COMPOSITE_LIVE_CONFIRMATION",
  comparison_result: "NOT_APPLICABLE_COMPOSITE_LIVE_CONFIRMATION",
  metrics_path: "runs/FP-MCP-182/live-confirmation.json",
  artifact_paths: artifacts,
  trust_tier: "TIER_2_VERIFIED_ARTIFACT",
  validation_state: "VALID",
  admission_state: "ADMITTED",
});
const basis = "FP-MCP-182 admits FP-MCP-180 composite live confirmation";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) admission = recordEvidenceAdmission({
  target_observation_type: "evidence_record",
  target_observation_id: evidence.evidence_id,
  admission_decision: "ADMITTED",
  admission_actor_type: "system",
  admission_actor_id: "FP-MCP-182",
  admission_trust_tier: "TIER_2",
  validation_state: "VALID",
  provenance_complete: true,
  admission_basis: basis,
});
const canonical = getCanonicalEvidenceRecordAdmission(evidence.evidence_id);
const totalEvidenceRecords = (db.prepare("SELECT count(*) AS count FROM evidence_records").get() as { count: number }).count;
const totalGenericAdmissionEvents = (db.prepare("SELECT count(*) AS count FROM evidence_admission_events WHERE target_observation_type = 'evidence_record'").get() as { count: number }).count;
const output = {
  packet_id: "FP-MCP-182",
  result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED" ? "FP_MCP_182_COMPOSITE_LIVE_CONFIRMATION_RECORDED_THROUGH_V1O_PATH" : "FP_MCP_182_V1O_NOT_PROVEN",
  evidence_id: evidence.evidence_id,
  run_id: evidence.run_id,
  generic_admission_event_id: admission.id,
  canonical_status: canonical.status,
  canonical_surface: canonical.canonical_surface,
  canonical_state: canonical.canonical_state,
  admitted_claim: "RUNNER_CAPABILITY_PREDICATE_LIVE_CONFIRMED_COMPOSITE_ONLY_DISABLE_BLOCKERS_REMAIN",
  total_evidence_records: totalEvidenceRecords,
  total_generic_evidence_record_admission_events: totalGenericAdmissionEvents,
  artifact_paths: artifacts
};
fs.writeFileSync("runs/FP-MCP-182/v1o-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
