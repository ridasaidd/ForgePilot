import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetPath = "packets/FP-MCP-196.md";
const runId = "FP-MCP-196-OPENAI-PLATFORM-BLOCK-FEEDBACK-REPORT-PACKAGE";
const admittedClaim = "FP_MCP_196_OPENAI_PLATFORM_BLOCK_FEEDBACK_REPORT_PACKAGE_ASSEMBLED_NOT_SUBMITTED";
const artifacts = [
  packetPath,
  "runs/FP-MCP-196/openai-feedback-report.md",
  "runs/FP-MCP-196/report-package.json",
  "runs/FP-MCP-196/result-summary.md",
  "runs/FP-MCP-196/verification.txt"
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
    title: "FP-MCP-196",
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
    model_role: "openai_platform_block_feedback_report_package",
    branch: "main",
    commit_sha: "5e57770",
    executor_result: admittedClaim,
    verification_result: "REPORT_PACKAGE_ASSEMBLED;SUBMISSION_STATUS_NOT_SUBMITTED;EXACT_BLOCK_TEXT_INCLUDED;FPMCP187_INCLUDED;FPMCP195_INCLUDED;REDACTED_TASK_DESCRIPTIONS_INCLUDED;MISSING_OPENAI_REQUEST_IDS_MARKED_UNAVAILABLE;MISSING_MCP_REQUEST_EVIDENCE_EXPLAINED_BLOCKED_BEFORE_BRIDGE;ACCOUNT_WORKSPACE_ENVIRONMENT_PLACEHOLDERS_INCLUDED;ROOT_CAUSE_UNRESOLVED;CADENCE_NOT_CONFIRMED;CONTENT_SCHEMA_NOT_CONFIRMED;REPORT_SUBMITTED_FALSE;BLOCKED_CALLS_RETRIED_FALSE;REQUEST_ARTIFACT_CREATED_FALSE;APPROVAL_CREATED_FALSE;APPROVAL_CONSUMED_FALSE;RUNNER_START_ENDPOINT_CONTACTED_FALSE;OPENCODE_STARTED_FALSE;FP027_CANARY_RUN_FALSE;FPMCP183_ENABLEMENT_REMAINS_UNGRANTED",
    audit_result: "NOT_APPLICABLE_REPORT_PACKAGE_ASSEMBLY",
    comparison_result: "NOT_APPLICABLE_REPORT_PACKAGE_ASSEMBLY",
    metrics_path: "runs/FP-MCP-196/report-package.json",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED"
  });
}

const basis = "FP-MCP-196 admits OpenAI platform block feedback report package assembled not submitted";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({
    target_observation_type: "evidence_record",
    target_observation_id: evidence.evidence_id,
    admission_decision: "ADMITTED",
    admission_actor_type: "system",
    admission_actor_id: "FP-MCP-196",
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
  packet_id: "FP-MCP-196",
  result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED"
    ? "FP_MCP_196_REPORT_PACKAGE_RECORDED_THROUGH_V1O_PATH"
    : "FP_MCP_196_V1O_NOT_PROVEN",
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
fs.writeFileSync("runs/FP-MCP-196/v1o-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
