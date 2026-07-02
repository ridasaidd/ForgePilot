import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetPath = "packets/FP-031.md";
const runId = "FP-031-BOOTSTRAP-REQUEST-REMOTE-RUNNER-BLOCKED";
const artifacts = [
  "runs/FP-031/opencode-requests/REQ-20260702T141753581Z-650bc292.json",
  "runs/FP-031/bootstrap-request-status.md",
  "runs/FP-031/bootstrap-request-status.json"
];
function sha256File(path: string): string { return crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex"); }
initDb("data/forgepilot.db");
const db = getDb();
let packet = db.prepare("SELECT * FROM packets WHERE packet_path = ? ORDER BY id ASC LIMIT 1").get(packetPath) as { id: number } | undefined;
if (!packet) packet = recordPacketIntent({ packet_type: "fp", title: "FP-031", packet_path: packetPath, packet_hash: sha256File(packetPath) });
let evidence = getEvidenceByRunId(runId)[0];
if (!evidence) {
  evidence = insertEvidenceRecord({
    packet_id: packet.id,
    run_id: runId,
    model_id: "none",
    model_role: "bootstrap_request_status",
    branch: "feature/oauth-auth0",
    commit_sha: "8422542",
    executor_result: "BOOTSTRAP_REQUEST_CREATED_REMOTE_RUNNER_NAMESPACE_BLOCKED",
    verification_result: "REQUEST_ARTIFACT_CREATED_AND_COMMITTED;LOCAL_VALIDATION_ELIGIBLE;REMOTE_RUNNER_ENDPOINT_REJECTED_INVALID_PACKET_ID;NO_EXECUTOR_STARTED",
    audit_result: "NOT_APPLICABLE_BLOCKER_OBSERVATION",
    comparison_result: "NOT_APPLICABLE_BLOCKER_OBSERVATION",
    metrics_path: "runs/FP-031/bootstrap-request-status.json",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED",
  });
}
const basis = "FP-031 admits bootstrap request artifact and remote runner namespace blocker observation";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({ target_observation_type: "evidence_record", target_observation_id: evidence.evidence_id, admission_decision: "ADMITTED", admission_actor_type: "system", admission_actor_id: "FP-031-BOOTSTRAP-BLOCKER", admission_trust_tier: "TIER_2", validation_state: "VALID", provenance_complete: true, admission_basis: basis });
}
const canonical = getCanonicalEvidenceRecordAdmission(evidence.evidence_id);
const output = { packet_id: "FP-031", result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED" ? "FP_031_BOOTSTRAP_BLOCKER_RECORDED_THROUGH_V1O_PATH" : "FP_031_BOOTSTRAP_BLOCKER_V1O_NOT_PROVEN", evidence_id: evidence.evidence_id, run_id: evidence.run_id, generic_admission_event_id: admission.id, canonical_status: canonical.status, canonical_surface: canonical.canonical_surface, canonical_state: canonical.canonical_state, admitted_claim: "BOOTSTRAP_REQUEST_CREATED_REMOTE_RUNNER_NAMESPACE_BLOCKED", artifact_paths: artifacts };
fs.writeFileSync("runs/FP-031/v1o-bootstrap-blocker-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
