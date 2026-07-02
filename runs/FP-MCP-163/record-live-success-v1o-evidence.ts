import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetPath = "packets/FP-MCP-163.md";
const runId = "FP-MCP-163-LIVE-PRE-EXECUTION-EVIDENCE-SUCCESS";
const artifacts = [
  "packets/FP-MCP-163.md",
  "runs/FP-MCP-163/evidence-review-report.md",
  "runs/FP-MCP-163/live-pre-execution-success.md",
  "runs/FP-MCP-163/live-pre-execution-success.json",
  "runs/FP-MCP-163/approvals/APPROVAL-20260702T165836932Z-e4191e1a.json",
  "runs/FP-MCP-159/pre-start-evidence/REQ-20260702T143631238Z-4e3b750e.json",
  "runs/FP-MCP-159/start-state-snapshots/REQ-20260702T143631238Z-4e3b750e/ATTEMPT-20260702T165943947Z-5af33331/pre-start-state.json",
  "runs/FP-MCP-159/start-state-snapshots/REQ-20260702T143631238Z-4e3b750e/ATTEMPT-20260702T165943947Z-5af33331/post-start-state.json"
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
    model_role: "live_pre_execution_evidence_verification",
    branch: "main",
    commit_sha: "c41e0a1",
    executor_result: "STRUCTURED_APPROVAL_PRE_EXECUTION_EVIDENCE_ACCEPTED_EXECUTION_STILL_BLOCKED",
    verification_result: "LIVE_GUARDED_PREFLIGHT_CONFIRMED;EIGHT_GATES_PASSED;EXECUTION_BLOCKED;NO_RUNNER_START_CONTACT;NO_OPENCODE_START;NO_APPROVAL_CONSUMPTION",
    audit_result: "NOT_APPLICABLE_LIVE_EVIDENCE_VERIFICATION",
    comparison_result: "NOT_APPLICABLE_LIVE_EVIDENCE_VERIFICATION",
    metrics_path: "runs/FP-MCP-163/live-pre-execution-success.json",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED",
  });
}
const basis = "FP-MCP-163 admits live structured approval pre-execution evidence success";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({ target_observation_type: "evidence_record", target_observation_id: evidence.evidence_id, admission_decision: "ADMITTED", admission_actor_type: "system", admission_actor_id: "FP-MCP-163", admission_trust_tier: "TIER_2", validation_state: "VALID", provenance_complete: true, admission_basis: basis });
}
const canonical = getCanonicalEvidenceRecordAdmission(evidence.evidence_id);
const counts = {
  total_evidence_records: db.prepare("SELECT count(*) AS count FROM evidence_records").get() as { count: number },
  total_generic_evidence_record_admission_events: db.prepare("SELECT count(*) AS count FROM evidence_admission_events WHERE target_observation_type = 'evidence_record'").get() as { count: number }
};
const output = {
  packet_id: "FP-MCP-163",
  result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED" ? "FP_MCP_163_LIVE_PRE_EXECUTION_SUCCESS_RECORDED_THROUGH_V1O_PATH" : "FP_MCP_163_LIVE_PRE_EXECUTION_SUCCESS_V1O_NOT_PROVEN",
  evidence_id: evidence.evidence_id,
  run_id: evidence.run_id,
  generic_admission_event_id: admission.id,
  canonical_status: canonical.status,
  canonical_surface: canonical.canonical_surface,
  canonical_state: canonical.canonical_state,
  admitted_claim: "STRUCTURED_APPROVAL_PRE_EXECUTION_EVIDENCE_ACCEPTED_EXECUTION_STILL_BLOCKED",
  total_evidence_records: counts.total_evidence_records.count,
  total_generic_evidence_record_admission_events: counts.total_generic_evidence_record_admission_events.count,
  artifact_paths: artifacts
};
fs.writeFileSync("runs/FP-MCP-163/v1o-live-success-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
