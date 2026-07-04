import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetPath = "packets/FP-MCP-286.md";
const runId = "FP-MCP-286-SESSION-HANDOFF";
const admittedClaim = "FP-MCP-286 saves the current approval-validation state for continuation in a fresh ChatGPT session: approval evidence exists and is committed, the recorder fix and validator fix are committed in the MCP bridge, but the live validator still returned APPROVAL_TEXT_INVALID in this session, likely due to tool/runtime staleness.";
const artifacts = [
  "packets/FP-MCP-286.md",
  "runs/FP-MCP-286/session-handoff-record.json",
  "runs/FP-MCP-286/result-summary.md",
  "runs/FP-MCP-286/verification.txt"
];
function sha256File(filePath: string): string {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}
initDb("data/forgepilot.db");
const db = getDb();
let packet = db.prepare("SELECT * FROM packets WHERE packet_path = ? ORDER BY id ASC LIMIT 1").get(packetPath) as { id: number } | undefined;
if (!packet) {
  packet = recordPacketIntent({
    packet_type: "fp-mcp",
    title: "FP-MCP-286",
    packet_path: packetPath,
    packet_hash: sha256File(packetPath)
  });
}
let evidence = getEvidenceByRunId(runId)[0];
if (!evidence) {
  evidence = insertEvidenceRecord({
    packet_id: packet.id,
    run_id: runId,
    model_id: "none",
    model_role: "packet_checkpoint_recorder",
    branch: "main",
    commit_sha: "d233280",
    executor_result: admittedClaim,
    verification_result: "PACKET_CHECKPOINT_RECORDED;NON_EXECUTING_BOUNDARY_PRESERVED",
    audit_result: "NOT_APPLICABLE_PACKET_CHECKPOINT",
    comparison_result: "NOT_APPLICABLE_PACKET_CHECKPOINT",
    metrics_path: "runs/FP-MCP-286/session-handoff-record.json",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED"
  });
}
const basis = "FP-MCP-286 admits typed packet checkpoint claim";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({
    target_observation_type: "evidence_record",
    target_observation_id: evidence.evidence_id,
    admission_decision: "ADMITTED",
    admission_actor_type: "system",
    admission_actor_id: "FP-MCP-286",
    admission_trust_tier: "TIER_2",
    validation_state: "VALID",
    provenance_complete: true,
    admission_basis: basis
  });
}
const canonical = getCanonicalEvidenceRecordAdmission(evidence.evidence_id);
const output = {
  packet_id: "FP-MCP-286",
  result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED" ? "PACKET_CHECKPOINT_RECORDED_THROUGH_V1O_PATH" : "PACKET_CHECKPOINT_V1O_NOT_PROVEN",
  evidence_id: evidence.evidence_id,
  run_id: evidence.run_id,
  generic_admission_event_id: admission.id,
  canonical_status: canonical.status,
  canonical_surface: canonical.canonical_surface,
  canonical_state: canonical.canonical_state,
  admitted_claim: admittedClaim,
  artifact_paths: artifacts
};
fs.writeFileSync("runs/FP-MCP-286/v1o-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
