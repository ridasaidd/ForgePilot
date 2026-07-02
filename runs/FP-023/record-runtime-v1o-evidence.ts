import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetId = "FP-023";
const packetPath = "packets/FP-023.md";
const runId = "FP-023-RUNTIME-GATE-CONFIRMATION";
const artifacts = [
  "runs/FP-023/runtime-confirmation-result.json",
  "runs/FP-023/runtime-confirmation-summary.md",
  "runs/FP-023/current-runtime-db-evidence-check.json"
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
    model_role: "runtime_confirmation",
    branch: "feature/oauth-auth0",
    commit_sha: "3cd682c",
    executor_result: "FP_023_RUNTIME_GATE_CONFIRMED_LIVE_MCP_NO_SPAWN",
    verification_result: "LIVE_MCP_TOOL_BLOCKED_WITH_DISABLED_REASONS;NO_WORKER_ARTIFACTS_CREATED",
    audit_result: "NOT_APPLICABLE_RUNTIME_CONFIRMATION",
    comparison_result: "NOT_APPLICABLE_RUNTIME_CONFIRMATION",
    metrics_path: "runs/FP-023/runtime-confirmation-result.json",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED",
  });
}

const basis = "FP-023 admits live restarted MCP runtime confirmation that worker start blocks before spawning or creating worker artifacts";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({
    target_observation_type: "evidence_record",
    target_observation_id: evidence.evidence_id,
    admission_decision: "ADMITTED",
    admission_actor_type: "system",
    admission_actor_id: "FP-023-RUNTIME",
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
    ? "FP_023_RUNTIME_CONFIRMATION_RECORDED_THROUGH_V1O_PATH"
    : "FP_023_RUNTIME_V1O_RECORDING_NOT_PROVEN",
  sqlite_packet_id: packet.id,
  evidence_id: evidence.evidence_id,
  run_id: evidence.run_id,
  evidence_admission_state: evidence.admission_state,
  generic_admission_event_id: admission.id,
  generic_admission_decision: admission.admission_decision,
  canonical_status: canonical.status,
  canonical_surface: canonical.canonical_surface,
  canonical_state: canonical.canonical_state,
  admitted_claim: "FP_023_RUNTIME_GATE_CONFIRMED_LIVE_MCP_NO_SPAWN",
  artifact_paths: artifacts,
};

fs.writeFileSync("runs/FP-023/v1o-runtime-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
