import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetPath = "packets/FP-026.md";
const runId = "FP-026-RUNTIME-CONFIRMATION-PLATFORM-BLOCKED";
const artifacts = [
  "runs/FP-026/runtime-confirmation-blocker.md",
  "runs/FP-026/tooling-block-pattern-note.md",
  "runs/FP-026/runtime-abort-fixture-before.json",
  "runs/FP-026/runtime-confirmation-platform-block-cleanup.json",
  "runs/FP-026/runtime-confirmation-platform-block-cleanup-direct.json",
  "runs/FP-026/runtime-confirmation-platform-block-cleanup-dynamic.json",
  "runs/FP-026-RUNTIME-ABORT-CONFIRM/opencode-workers/WORKER-RUNTIME-SYNTHETIC/status.json",
  "runs/FP-026-RUNTIME-ABORT-CONFIRM/opencode-workers/WORKER-RUNTIME-SYNTHETIC/start-request.json"
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
    model_role: "runtime_confirmation_attempt",
    branch: "feature/oauth-auth0",
    commit_sha: "8422542",
    executor_result: "FP_026_RUNTIME_CONFIRMATION_BLOCKED_BY_PLATFORM_TOOL_SAFETY",
    verification_result: "LIVE_ACTION_VISIBLE;LIVE_ACTION_CALL_BLOCKED_BEFORE_BRIDGE;SYNTHETIC_PROCESS_CLEANED_UP;RUNTIME_CONFIRMATION_NOT_PROVEN",
    audit_result: "NOT_APPLICABLE_RUNTIME_BLOCKER",
    comparison_result: "NOT_APPLICABLE_RUNTIME_BLOCKER",
    metrics_path: "runs/FP-026/runtime-confirmation-blocker.md",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED",
  });
}

const basis = "FP-026 admits runtime confirmation blocker observation: platform tool safety blocked live action before bridge invocation";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({
    target_observation_type: "evidence_record",
    target_observation_id: evidence.evidence_id,
    admission_decision: "ADMITTED",
    admission_actor_type: "system",
    admission_actor_id: "FP-026-RUNTIME-BLOCKER",
    admission_trust_tier: "TIER_2",
    validation_state: "VALID",
    provenance_complete: true,
    admission_basis: basis,
  });
}
const canonical = getCanonicalEvidenceRecordAdmission(evidence.evidence_id);
const output = {
  packet_id: "FP-026",
  result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED" ? "FP_026_RUNTIME_BLOCKER_RECORDED_THROUGH_V1O_PATH" : "FP_026_RUNTIME_BLOCKER_V1O_RECORDING_NOT_PROVEN",
  evidence_id: evidence.evidence_id,
  run_id: evidence.run_id,
  generic_admission_event_id: admission.id,
  canonical_status: canonical.status,
  canonical_surface: canonical.canonical_surface,
  canonical_state: canonical.canonical_state,
  admitted_claim: "FP_026_RUNTIME_CONFIRMATION_BLOCKED_BY_PLATFORM_TOOL_SAFETY",
  runtime_confirmation_status: "NOT_PROVEN",
  artifact_paths: artifacts
};
fs.writeFileSync("runs/FP-026/v1o-runtime-blocker-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
