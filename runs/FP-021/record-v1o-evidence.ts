import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetId = "FP-021";
const packetPath = "packets/FP-021.md";
const runId = "FP-021-SAFETY-GATE-FAILURE";
const workerDir = "runs/FP-MCP-036/opencode-workers/WORKER-20260702T121741820Z-e60730d6";
const artifacts = [
  "packets/FP-021.md",
  "runs/FP-021/root-cause-report.md",
  "runs/FP-021/safety-disposition.md",
  "runs/FP-021/source-evidence.md",
  "runs/FP-021/result-summary.md",
  "runs/FP-021/current-status.json",
  "runs/SHADOW-REF-008/fp021-reclassification-note.md",
  `${workerDir}/start-request.json`,
  `${workerDir}/status.json`,
  `${workerDir}/telemetry.json`
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
    title: "FP-021 — Execution-Enablement Gate Failure",
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
    model_role: "safety_gate_investigation",
    branch: "feature/oauth-auth0",
    commit_sha: "3a16d68",
    executor_result: "SAFETY_GATE_FAILURE_CONFIRMED_BY_SOURCE_INSPECTION",
    verification_result: "WORKER_START_BYPASSED_DISABLED_STATE;ROOT_CAUSE_IDENTIFIED;BLAST_RADIUS_IDENTIFIED;REGRESSION_REQUIRED",
    audit_result: "NOT_APPLICABLE_INVESTIGATION_ONLY",
    comparison_result: "NOT_APPLICABLE_INVESTIGATION_ONLY",
    metrics_path: "runs/FP-021/root-cause-report.md",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED",
  });
}

const basis = "FP-021 admits safety-gate failure finding and blocks extraction until worker start gate is fixed and regression-tested";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({
    target_observation_type: "evidence_record",
    target_observation_id: evidence.evidence_id,
    admission_decision: "ADMITTED",
    admission_actor_type: "system",
    admission_actor_id: "FP-021",
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
    ? "FP_021_SAFETY_GATE_FAILURE_RECORDED_THROUGH_V1O_PATH"
    : "FP_021_V1O_RECORDING_NOT_PROVEN",
  sqlite_packet_id: packet.id,
  evidence_id: evidence.evidence_id,
  run_id: evidence.run_id,
  evidence_admission_state: evidence.admission_state,
  generic_admission_event_id: admission.id,
  generic_admission_decision: admission.admission_decision,
  canonical_status: canonical.status,
  canonical_surface: canonical.canonical_surface,
  canonical_state: canonical.canonical_state,
  admitted_claim: "SAFETY_GATE_FAILURE_CONFIRMED_BY_SOURCE_INSPECTION",
  artifact_paths: artifacts,
};

fs.writeFileSync("runs/FP-021/v1o-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
