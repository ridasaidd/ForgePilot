import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetPath = "packets/FP-MCP-188.md";
const runId = "FP-MCP-188-ENABLEMENT-ADJACENT-PLATFORM-BLOCK-CATEGORY-DOCUMENTED";
const admittedClaim = "FP_MCP_188_ENABLEMENT_ADJACENT_PLATFORM_BLOCK_CATEGORY_DOCUMENTED_NO_RETRY_NO_BYPASS";
const artifacts = [
  packetPath,
  "docs/operations/platform-tool-block-pattern.md",
  "docs/forgepilot-progress-checklist.md",
  "runs/FP-MCP-188/result-summary.md",
  "runs/FP-MCP-188/verification.txt"
];

function sha256File(path: string): string {
  return crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex");
}

initDb("data/forgepilot.db");
const db = getDb();
let packet = db.prepare("SELECT * FROM packets WHERE packet_path = ? ORDER BY id ASC LIMIT 1").get(packetPath) as { id: number } | undefined;
if (!packet) {
  packet = recordPacketIntent({
    packet_type: "fp-mcp",
    title: "FP-MCP-188",
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
    model_role: "enablement_adjacent_platform_block_classification_documentation",
    branch: "main",
    commit_sha: "83f997a",
    executor_result: admittedClaim,
    verification_result: "STANDING_PATTERN_DOC_UPDATED;PROGRESS_CHECKLIST_UPDATED;FPMCP187_CLASSIFIED_AS_ENABLEMENT_ADJACENT_REQUEST_CREATION_PLATFORM_BLOCK;GENERIC_EVIDENCE_RECORDING_TOOL_FLakiness_NOT_CONFLATED;NO_RETRY_OF_BLOCKED_REQUEST_CREATION_CALL;NO_REPHRASE_TO_AVOID_TRIGGER;NO_MANUAL_REQUEST_ARTIFACT_BYPASS;APPROVAL_CREATED_FALSE;APPROVAL_CONSUMED_FALSE;RUNNER_START_ENDPOINT_CONTACTED_FALSE;OPENCODE_STARTED_FALSE;FP027_CANARY_RUN_FALSE;FPMCP183_ENABLEMENT_REMAINS_UNGRANTED",
    audit_result: "NOT_APPLICABLE_DOCUMENTATION_CLASSIFICATION",
    comparison_result: "NOT_APPLICABLE_DOCUMENTATION_CLASSIFICATION",
    metrics_path: "runs/FP-MCP-188/result-summary.md",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED"
  });
}

const basis = "FP-MCP-188 admits enablement-adjacent platform block category documentation";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({
    target_observation_type: "evidence_record",
    target_observation_id: evidence.evidence_id,
    admission_decision: "ADMITTED",
    admission_actor_type: "system",
    admission_actor_id: "FP-MCP-188",
    admission_trust_tier: "TIER_2",
    validation_state: "VALID",
    provenance_complete: true,
    admission_basis: basis
  });
}

const canonical = getCanonicalEvidenceRecordAdmission(evidence.evidence_id);
const totalEvidenceRecords = (db.prepare("SELECT count(*) AS count FROM evidence_records").get() as { count: number }).count;
const totalGenericAdmissionEvents = (db.prepare("SELECT count(*) AS count FROM evidence_admission_events WHERE target_observation_type = 'evidence_record'").get() as { count: number }).count;
const output = {
  packet_id: "FP-MCP-188",
  result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED"
    ? "FP_MCP_188_CATEGORY_DOCUMENTATION_RECORDED_THROUGH_V1O_PATH"
    : "FP_MCP_188_V1O_NOT_PROVEN",
  evidence_id: evidence.evidence_id,
  run_id: evidence.run_id,
  generic_admission_event_id: admission.id,
  canonical_status: canonical.status,
  canonical_surface: canonical.canonical_surface,
  canonical_state: canonical.canonical_state,
  admitted_claim: admittedClaim,
  total_evidence_records: totalEvidenceRecords,
  total_generic_evidence_record_admission_events: totalGenericAdmissionEvents,
  artifact_paths: artifacts
};
fs.writeFileSync("runs/FP-MCP-188/v1o-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
