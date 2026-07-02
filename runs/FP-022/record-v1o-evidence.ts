import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetId = "FP-022";
const packetPath = "packets/FP-022.md";
const runId = "FP-022-EXECUTION-TOOL-GATE-AUDIT";
const artifacts = [
  "packets/FP-022.md",
  "runs/FP-022/registered-tool-surface-expanded.json",
  "runs/FP-022/registered-tool-surface-expanded.md",
  "runs/FP-022/result-summary.md",
  "runs/FP-022/tool-gate-audit.json",
  "runs/SHADOW-REF-006/fp022-tool-surface-correction-note.md",
  "runs/SHADOW-REF-007/fp022-template-correction-note.md"
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
    title: "FP-022 — Execution-Capable Tool Gate Audit",
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
    model_role: "execution_gate_audit",
    branch: "feature/oauth-auth0",
    commit_sha: "3a16d68",
    executor_result: "EXECUTION_CAPABLE_TOOL_GATE_AUDIT_COMPLETE",
    verification_result: "EXPANDED_TOOL_SURFACE_38;ONLY_START_OPENCODE_WORKER_MATCHES_FP021_PATTERN;EXTRACTION_REMAINS_BLOCKED",
    audit_result: "NOT_APPLICABLE_AUDIT_ONLY",
    comparison_result: "NOT_APPLICABLE_AUDIT_ONLY",
    metrics_path: "runs/FP-022/tool-gate-audit.json",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED",
  });
}

const basis = "FP-022 admits execution-capable tool gate audit and expanded tool-surface correction";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({
    target_observation_type: "evidence_record",
    target_observation_id: evidence.evidence_id,
    admission_decision: "ADMITTED",
    admission_actor_type: "system",
    admission_actor_id: "FP-022",
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
    ? "FP_022_TOOL_GATE_AUDIT_RECORDED_THROUGH_V1O_PATH"
    : "FP_022_V1O_RECORDING_NOT_PROVEN",
  sqlite_packet_id: packet.id,
  evidence_id: evidence.evidence_id,
  run_id: evidence.run_id,
  evidence_admission_state: evidence.admission_state,
  generic_admission_event_id: admission.id,
  generic_admission_decision: admission.admission_decision,
  canonical_status: canonical.status,
  canonical_surface: canonical.canonical_surface,
  canonical_state: canonical.canonical_state,
  admitted_claim: "EXECUTION_CAPABLE_TOOL_GATE_AUDIT_COMPLETE",
  artifact_paths: artifacts,
};

fs.writeFileSync("runs/FP-022/v1o-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
