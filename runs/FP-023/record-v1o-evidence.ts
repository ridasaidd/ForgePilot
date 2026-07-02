import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetId = "FP-023";
const packetPath = "packets/FP-023.md";
const runId = "FP-023-WORKER-START-GATE-FIX";
const artifacts = [
  "packets/FP-023.md",
  "runs/FP-023/result-summary.md",
  "runs/FP-023/source-evidence.md",
  "runs/FP-023/regression-no-spawn.ts",
  "runs/FP-023/regression-no-spawn-result.json",
  "runs/FP-023/bridge-build-output.txt",
  "runs/FP-023/bridge-test-output.txt"
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
    title: "FP-023 — OpenCode Worker Start Safety Gate Fix",
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
    model_role: "safety_hotfix",
    branch: "feature/oauth-auth0",
    commit_sha: "3cd682c",
    executor_result: "OPENCODE_WORKER_START_DISABLED_GATE_FIXED_IN_BRIDGE_SOURCE",
    verification_result: "NO_SPAWN_REGRESSION_PASS;BRIDGE_BUILD_PASS;BRIDGE_TEST_PASS;RUNTIME_CONFIRMATION_PENDING",
    audit_result: "NOT_APPLICABLE_SAFETY_HOTFIX",
    comparison_result: "NOT_APPLICABLE_SAFETY_HOTFIX",
    metrics_path: "runs/FP-023/regression-no-spawn-result.json",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED",
  });
}

const basis = "FP-023 admits committed bridge-source safety fix and no-spawn regression, with runtime confirmation still pending";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({
    target_observation_type: "evidence_record",
    target_observation_id: evidence.evidence_id,
    admission_decision: "ADMITTED",
    admission_actor_type: "system",
    admission_actor_id: "FP-023",
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
    ? "FP_023_WORKER_GATE_FIX_RECORDED_THROUGH_V1O_PATH"
    : "FP_023_V1O_RECORDING_NOT_PROVEN",
  sqlite_packet_id: packet.id,
  evidence_id: evidence.evidence_id,
  run_id: evidence.run_id,
  evidence_admission_state: evidence.admission_state,
  generic_admission_event_id: admission.id,
  generic_admission_decision: admission.admission_decision,
  canonical_status: canonical.status,
  canonical_surface: canonical.canonical_surface,
  canonical_state: canonical.canonical_state,
  admitted_claim: "OPENCODE_WORKER_START_DISABLED_GATE_FIXED_IN_BRIDGE_SOURCE",
  runtime_status: "RUNTIME_CONFIRMATION_PENDING",
  artifact_paths: artifacts,
};

fs.writeFileSync("runs/FP-023/v1o-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
