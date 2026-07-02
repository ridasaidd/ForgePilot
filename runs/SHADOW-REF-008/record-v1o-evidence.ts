import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetId = "SHADOW-REF-008";
const packetPath = "packets/SHADOW-REF-008.md";
const runId = "SHADOW-REF-008-EXECUTOR-HANDOFF-BLOCKED";
const workerDir = "runs/FP-MCP-036/opencode-workers/WORKER-20260702T121741820Z-e60730d6";
const artifacts = [
  "packets/SHADOW-REF-008.md",
  "runs/SHADOW-REF-007/failure-disposition-rule.md",
  "runs/SHADOW-REF-008/result-summary.md",
  "runs/SHADOW-REF-008/opencode-preflight-blockers.json",
  "runs/SHADOW-REF-008/current-status.json",
  `${workerDir}/start-request.json`,
  `${workerDir}/status.json`,
  `${workerDir}/stdout.log`,
  `${workerDir}/stderr.log`,
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
    packet_type: "shadow-refactor",
    title: "SHADOW-REF-008 — First Executor-Driven Shadow Extraction Attempt",
    packet_path: packetPath,
    packet_hash: packetHash,
  });
}

let evidence = getEvidenceByRunId(runId)[0];
if (!evidence) {
  evidence = insertEvidenceRecord({
    packet_id: packet.id,
    run_id: runId,
    model_id: "deepseek-v4-pro-high",
    model_role: "executor_preflight",
    branch: "feature/oauth-auth0",
    commit_sha: "3a16d68",
    executor_result: "EXECUTOR_HANDOFF_BLOCKED_NO_EXTRACTION",
    verification_result: "BRIDGE_SOURCE_UNCHANGED;WORKER_FAILED_TERMINAL;SHADOW_REF_PACKET_VALIDATION_BLOCKED;DISABLE_GATE_INCONSISTENCY_OBSERVED",
    audit_result: "NOT_APPLICABLE_NO_EXTRACTION_IMPLEMENTED",
    comparison_result: "NOT_APPLICABLE_NO_EXTRACTION_IMPLEMENTED",
    metrics_path: "runs/SHADOW-REF-008/opencode-preflight-blockers.json",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED",
  });
}

const basis = "SHADOW-REF-008 admitted as valid evidence of blocked executor handoff, not as successful extraction evidence";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({
    target_observation_type: "evidence_record",
    target_observation_id: evidence.evidence_id,
    admission_decision: "ADMITTED",
    admission_actor_type: "system",
    admission_actor_id: "SHADOW-REF-008",
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
    ? "SHADOW_REF_008_BLOCKED_HANDOFF_RECORDED_THROUGH_V1O_PATH"
    : "SHADOW_REF_008_V1O_RECORDING_NOT_PROVEN",
  sqlite_packet_id: packet.id,
  evidence_id: evidence.evidence_id,
  run_id: evidence.run_id,
  evidence_admission_state: evidence.admission_state,
  generic_admission_event_id: admission.id,
  generic_admission_decision: admission.admission_decision,
  canonical_status: canonical.status,
  canonical_surface: canonical.canonical_surface,
  canonical_state: canonical.canonical_state,
  note: "Admitted claim is the blocked executor handoff observation, not successful extraction.",
  artifact_paths: artifacts,
};

fs.writeFileSync("runs/SHADOW-REF-008/v1o-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
