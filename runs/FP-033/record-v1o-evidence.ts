import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetPath = "packets/FP-033.md";
const runId = "FP-033-NAMESPACE-RECONCILIATION";
const artifacts = [
  "packets/FP-033.md",
  "packets/FP-MCP-159.md",
  "runs/FP-033/result-summary.md",
  "runs/FP-033/namespace-reconciliation-result.md",
  "runs/FP-033/namespace-reconciliation-result.json",
  "runs/FP-MCP-159/opencode-requests/REQ-20260702T143631238Z-4e3b750e.json",
  "runs/FP-MCP-159/request-status.md"
];
function sha256File(path: string): string { return crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex"); }
initDb("data/forgepilot.db");
const db = getDb();
let packet = db.prepare("SELECT * FROM packets WHERE packet_path = ? ORDER BY id ASC LIMIT 1").get(packetPath) as { id: number } | undefined;
if (!packet) packet = recordPacketIntent({ packet_type: "fp", title: "FP-033", packet_path: packetPath, packet_hash: sha256File(packetPath) });
let evidence = getEvidenceByRunId(runId)[0];
if (!evidence) {
  evidence = insertEvidenceRecord({
    packet_id: packet.id,
    run_id: runId,
    model_id: "none",
    model_role: "namespace_reconciliation",
    branch: "feature/oauth-auth0",
    commit_sha: "8422542",
    executor_result: "NAMESPACE_RECONCILIATION_CONFIRMED_FP_MCP_159_ACCEPTED",
    verification_result: "FPMCP159_REMOTE_ENDPOINT_ACCEPTED;PREFLIGHT_LIFECYCLE_PASSED;EXPECTED_SAFETY_GATES_BLOCK;NO_WORKER_STARTED",
    audit_result: "NOT_APPLICABLE_NAMESPACE_RECONCILIATION",
    comparison_result: "NOT_APPLICABLE_NAMESPACE_RECONCILIATION",
    metrics_path: "runs/FP-033/namespace-reconciliation-result.json",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED",
  });
}
const basis = "FP-033 admits namespace reconciliation and FP-MCP-159 request acceptance observation";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({ target_observation_type: "evidence_record", target_observation_id: evidence.evidence_id, admission_decision: "ADMITTED", admission_actor_type: "system", admission_actor_id: "FP-033", admission_trust_tier: "TIER_2", validation_state: "VALID", provenance_complete: true, admission_basis: basis });
}
const canonical = getCanonicalEvidenceRecordAdmission(evidence.evidence_id);
const output = { packet_id: "FP-033", result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED" ? "FP_033_NAMESPACE_RECONCILIATION_RECORDED_THROUGH_V1O_PATH" : "FP_033_NAMESPACE_RECONCILIATION_V1O_NOT_PROVEN", evidence_id: evidence.evidence_id, run_id: evidence.run_id, generic_admission_event_id: admission.id, canonical_status: canonical.status, canonical_surface: canonical.canonical_surface, canonical_state: canonical.canonical_state, admitted_claim: "NAMESPACE_RECONCILIATION_CONFIRMED_FP_MCP_159_ACCEPTED", artifact_paths: artifacts };
fs.writeFileSync("runs/FP-033/v1o-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
