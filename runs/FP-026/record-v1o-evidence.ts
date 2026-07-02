import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetId = "FP-026";
const packetPath = "packets/FP-026.md";
const runId = "FP-026-WORKER-ABORT-PRIMITIVE";
const artifacts = [
  "packets/FP-026.md",
  "runs/FP-026/result-summary.md",
  "runs/FP-026/source-evidence.md",
  "runs/FP-026/abort-regression.ts",
  "runs/FP-026/abort-regression-result.json",
  "runs/FP-026/bridge-build-output.txt",
  "runs/FP-026/bridge-test-output.txt",
  "runs/FP-026/expanded-tool-surface-after-abort.json",
  "runs/FP-026/expanded-tool-surface-after-abort.md",
  "runs/FP-026/tooling-anomaly.md",
  "runs/FP-026-ABORT-REGRESSION/opencode-workers/WORKER-COMPLETED/status.json",
  "runs/FP-026-ABORT-REGRESSION/opencode-workers/WORKER-COMPLETED/start-request.json",
  "runs/FP-026-ABORT-REGRESSION/opencode-workers/WORKER-MALFORMED/status.json",
  "runs/FP-026-ABORT-REGRESSION/opencode-workers/WORKER-MALFORMED/start-request.json",
  "runs/FP-026-ABORT-REGRESSION/opencode-workers/WORKER-SUCCESS/status.json",
  "runs/FP-026-ABORT-REGRESSION/opencode-workers/WORKER-SUCCESS/start-request.json"
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
    title: "FP-026 — OpenCode Worker Abort Primitive",
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
    model_role: "safety_primitive",
    branch: "feature/oauth-auth0",
    commit_sha: "8422542",
    executor_result: "OPENCODE_WORKER_ABORT_PRIMITIVE_IMPLEMENTED_SOURCE_VERIFIED_RUNTIME_PENDING",
    verification_result: "ABORT_REGRESSION_PASS;BRIDGE_BUILD_PASS;BRIDGE_TEST_PASS;TOOL_SURFACE_39;RUNTIME_CONFIRMATION_PENDING",
    audit_result: "NOT_APPLICABLE_SAFETY_PRIMITIVE",
    comparison_result: "NOT_APPLICABLE_SAFETY_PRIMITIVE",
    metrics_path: "runs/FP-026/abort-regression-result.json",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED",
  });
}

const basis = "FP-026 admits source-verified OpenCode worker abort primitive with runtime confirmation pending";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({
    target_observation_type: "evidence_record",
    target_observation_id: evidence.evidence_id,
    admission_decision: "ADMITTED",
    admission_actor_type: "system",
    admission_actor_id: "FP-026",
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
    ? "FP_026_ABORT_PRIMITIVE_RECORDED_THROUGH_V1O_PATH"
    : "FP_026_V1O_RECORDING_NOT_PROVEN",
  sqlite_packet_id: packet.id,
  evidence_id: evidence.evidence_id,
  run_id: evidence.run_id,
  evidence_admission_state: evidence.admission_state,
  generic_admission_event_id: admission.id,
  generic_admission_decision: admission.admission_decision,
  canonical_status: canonical.status,
  canonical_surface: canonical.canonical_surface,
  canonical_state: canonical.canonical_state,
  admitted_claim: "OPENCODE_WORKER_ABORT_PRIMITIVE_IMPLEMENTED_SOURCE_VERIFIED_RUNTIME_PENDING",
  artifact_paths: artifacts,
};

fs.writeFileSync("runs/FP-026/v1o-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
