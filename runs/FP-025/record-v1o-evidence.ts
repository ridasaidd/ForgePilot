import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetId = "FP-025";
const packetPath = "packets/FP-025.md";
const runId = "FP-025-SCOPED-ENABLEMENT-POLICY";
const artifacts = [
  "packets/FP-025.md",
  "runs/FP-025/result-summary.md",
  "runs/FP-025/abort-path-inspection.md",
  "runs/FP-025/enablement-policy.json"
];

function sha256File(path: string): string {
  return crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex");
}

initDb("data/forgepilot.db");
const db = getDb();

let packet = db.prepare("SELECT * FROM packets WHERE packet_path = ? ORDER BY id ASC LIMIT 1").get(packetPath) as { id: number } | undefined;
if (!packet) {
  const packetHash = sha256File(packetPath);
  packet = recordPacketIntent({
    packet_type: "fp",
    title: "FP-025 — Scoped Executor Enablement Policy",
    packet_path: packetPath,
    packet_hash: packetHash,
  });
}

let evidence = getEvidenceByRunId(runId)[0];
if (!evidence) {
  evidence = insertEvidenceRecord({
    packet_id: packet.id,
    run_id: runId,
    model_id: "none",
    model_role: "enablement_policy",
    branch: "feature/oauth-auth0",
    commit_sha: "3cd682c",
    executor_result: "SCOPED_EXECUTOR_ENABLEMENT_POLICY_DEFINED_EXECUTION_STILL_DISABLED",
    verification_result: "NO_REGISTERED_WORKER_ABORT_TOOL_FOUND;EXECUTION_NOT_AUTHORIZED;GLOBAL_ENABLEMENT_FORBIDDEN",
    audit_result: "NOT_APPLICABLE_POLICY_PACKET",
    comparison_result: "NOT_APPLICABLE_POLICY_PACKET",
    metrics_path: "runs/FP-025/enablement-policy.json",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED",
  });
}

const basis = "FP-025 admits scoped enablement policy and abort-path blocker while keeping execution disabled";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({
    target_observation_type: "evidence_record",
    target_observation_id: evidence.evidence_id,
    admission_decision: "ADMITTED",
    admission_actor_type: "system",
    admission_actor_id: "FP-025",
    admission_trust_tier: "TIER_2",
    validation_state: "VALID",
    provenance_complete: true,
    admission_basis: basis,
  });
}

const canonical = getCanonicalEvidenceRecordAdmission(evidence.evidence_id);
const output = {
  packet_id: packetId,
  result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED"
    ? "FP_025_ENABLEMENT_POLICY_RECORDED_THROUGH_V1O_PATH"
    : "FP_025_V1O_RECORDING_NOT_PROVEN",
  sqlite_packet_id: packet.id,
  evidence_id: evidence.evidence_id,
  run_id: evidence.run_id,
  evidence_admission_state: evidence.admission_state,
  generic_admission_event_id: admission.id,
  generic_admission_decision: admission.admission_decision,
  canonical_status: canonical.status,
  canonical_surface: canonical.canonical_surface,
  canonical_state: canonical.canonical_state,
  admitted_claim: "SCOPED_EXECUTOR_ENABLEMENT_POLICY_DEFINED_EXECUTION_STILL_DISABLED",
  artifact_paths: artifacts,
};

fs.writeFileSync("runs/FP-025/v1o-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
