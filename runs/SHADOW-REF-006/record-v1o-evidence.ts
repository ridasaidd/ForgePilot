import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetId = "SHADOW-REF-006";
const packetPath = "packets/SHADOW-REF-006.md";
const runId = "SHADOW-REF-006-BASELINE-CAPTURE";
const artifacts = [
  "runs/SHADOW-REF-006/bridge-baseline-summary.json",
  "runs/SHADOW-REF-006/bridge-source-hashes.tsv",
  "runs/SHADOW-REF-006/bridge-tool-contract-snapshot.json",
  "runs/SHADOW-REF-006/bridge-registered-tools.json",
  "runs/SHADOW-REF-006/bridge-build-output.log",
  "runs/SHADOW-REF-006/bridge-test-output.log",
  "runs/SHADOW-REF-006/current-bridge-status-after-verification.json"
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
    packet_type: "shadow-refactor",
    title: "SHADOW-REF-006 — Capture Baseline Bridge Verification",
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
    model_role: "baseline_capture",
    branch: "feature/oauth-auth0",
    commit_sha: "3a16d68",
    executor_result: "BRIDGE_BASELINE_CAPTURED",
    verification_result: "BRIDGE_BUILD_PASS;BRIDGE_TEST_PASS;BRIDGE_STATUS_CLEAN",
    audit_result: "NOT_APPLICABLE_BASELINE_CAPTURE",
    comparison_result: "NOT_APPLICABLE_BASELINE_CAPTURE",
    metrics_path: "runs/SHADOW-REF-006/bridge-baseline-summary.json",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED",
  });
}

const basis = "SHADOW-REF-006 baseline bridge verification admitted through canonical evidence_record path";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({
    target_observation_type: "evidence_record",
    target_observation_id: evidence.evidence_id,
    admission_decision: "ADMITTED",
    admission_actor_type: "system",
    admission_actor_id: "SHADOW-REF-006",
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
    ? "SHADOW_REF_006_BASELINE_RECORDED_THROUGH_V1O_PATH"
    : "SHADOW_REF_006_V1O_RECORDING_NOT_PROVEN",
  sqlite_packet_id: packet.id,
  evidence_id: evidence.evidence_id,
  run_id: evidence.run_id,
  evidence_admission_state: evidence.admission_state,
  generic_admission_event_id: admission.id,
  generic_admission_decision: admission.admission_decision,
  canonical_status: canonical.status,
  canonical_surface: canonical.canonical_surface,
  canonical_state: canonical.canonical_state,
  artifact_paths: artifacts,
};

fs.writeFileSync("runs/SHADOW-REF-006/v1o-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
