import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetPath = "packets/FP-026.md";
const runId = "FP-026-LIVE-CONFIRMATION-2";
const artifacts = [
  "runs/FP-026/live-confirmation-2-summary.md",
  "runs/FP-026/runtime-confirmation-fixture-2-before.json",
  "runs/FP-026/runtime-confirmation-2-result.json",
  "runs/FP-026-RUNTIME-CONFIRM-2/opencode-workers/WORKER-RUNTIME-SYNTHETIC-2/status.json",
  "runs/FP-026-RUNTIME-CONFIRM-2/opencode-workers/WORKER-RUNTIME-SYNTHETIC-2/start-request.json"
];

function sha256File(path: string): string {
  return crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex");
}

initDb("data/forgepilot.db");
const db = getDb();
let packet = db.prepare("SELECT * FROM packets WHERE packet_path = ? ORDER BY id ASC LIMIT 1").get(packetPath) as { id: number } | undefined;
if (!packet) {
  packet = recordPacketIntent({ packet_type: "fp", title: "FP-026", packet_path: packetPath, packet_hash: sha256File(packetPath) });
}
let evidence = getEvidenceByRunId(runId)[0];
if (!evidence) {
  evidence = insertEvidenceRecord({
    packet_id: packet.id,
    run_id: runId,
    model_id: "none",
    model_role: "live_runtime_confirmation",
    branch: "feature/oauth-auth0",
    commit_sha: "8422542",
    executor_result: "FP_026_LIVE_CONFIRMATION_2_PASSED_SYNTHETIC_RECORDED_WORKER",
    verification_result: "LIVE_MCP_ACTION_REACHED_BRIDGE;RECORDED_WORKER_STATUS_UPDATED;PROCESS_INACTIVE_AFTER_CALL;ARTIFACTS_PRESERVED;REAL_OPENCODE_TREE_NOT_TESTED",
    audit_result: "NOT_APPLICABLE_LIVE_CONFIRMATION",
    comparison_result: "NOT_APPLICABLE_LIVE_CONFIRMATION",
    metrics_path: "runs/FP-026/runtime-confirmation-2-result.json",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED",
  });
}
const basis = "FP-026 live runtime confirmation against synthetic recorded worker; real OpenCode process tree remains untested";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({ target_observation_type: "evidence_record", target_observation_id: evidence.evidence_id, admission_decision: "ADMITTED", admission_actor_type: "system", admission_actor_id: "FP-026-LIVE-2", admission_trust_tier: "TIER_2", validation_state: "VALID", provenance_complete: true, admission_basis: basis });
}
const canonical = getCanonicalEvidenceRecordAdmission(evidence.evidence_id);
const output = { packet_id: "FP-026", result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED" ? "FP_026_LIVE_CONFIRMATION_2_RECORDED_THROUGH_V1O_PATH" : "FP_026_LIVE_CONFIRMATION_2_V1O_NOT_PROVEN", evidence_id: evidence.evidence_id, run_id: evidence.run_id, generic_admission_event_id: admission.id, canonical_status: canonical.status, canonical_surface: canonical.canonical_surface, canonical_state: canonical.canonical_state, admitted_claim: "FP_026_LIVE_CONFIRMATION_2_PASSED_SYNTHETIC_RECORDED_WORKER", artifact_paths: artifacts };
fs.writeFileSync("runs/FP-026/v1o-live-confirmation-2-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
