import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetPath = "packets/FP-MCP-191.md";
const runId = "FP-MCP-191-REQUEST-ARTIFACT-TOOL-CONTRACT-SAFETY-ALIGNED";
const admittedClaim = "FP_MCP_191_REQUEST_ARTIFACT_TOOL_CONTRACT_SAFETY_ALIGNED_SOURCE_VERIFIED_NO_LIVE_RETRY";
const artifacts = [
  packetPath,
  "runs/FP-MCP-191/bridge-change-summary.json",
  "runs/FP-MCP-191/result-summary.md",
  "runs/FP-MCP-191/verification.txt"
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
    title: "FP-MCP-191",
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
    model_role: "request_artifact_tool_contract_safety_alignment_source_verified",
    branch: "main",
    commit_sha: "3c3a313",
    executor_result: admittedClaim,
    verification_result: "BRIDGE_COMMIT_679EF93;PNPM_BUILD_PASS;LEGACY_TOOL_PRESERVED;NON_EXECUTING_ALIAS_ADDED;RECORD_NON_EXECUTING_REQUEST_ARTIFACT_LITERAL_ADDED;READONLY_HINT_REMAINS_FALSE;DESTRUCTIVE_HINT_FALSE;IDEMPOTENT_HINT_FALSE;OPENWORLD_HINT_FALSE;OUTPUT_BOUNDARY_FIELDS_ADDED;REQUEST_CREATION_NOT_RETRIED;ALIAS_NOT_LIVE_TESTED;MANUAL_REQUEST_ARTIFACT_FALSE;APPROVAL_CREATED_FALSE;APPROVAL_CONSUMED_FALSE;RUNNER_START_ENDPOINT_CONTACTED_FALSE;OPENCODE_STARTED_FALSE;FP027_CANARY_RUN_FALSE;FPMCP183_ENABLEMENT_REMAINS_UNGRANTED",
    audit_result: "NOT_APPLICABLE_SOURCE_BUILD_VERIFICATION",
    comparison_result: "NOT_APPLICABLE_SOURCE_BUILD_VERIFICATION",
    metrics_path: "runs/FP-MCP-191/bridge-change-summary.json",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED"
  });
}

const basis = "FP-MCP-191 admits request artifact tool contract safety alignment source/build verification";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({
    target_observation_type: "evidence_record",
    target_observation_id: evidence.evidence_id,
    admission_decision: "ADMITTED",
    admission_actor_type: "system",
    admission_actor_id: "FP-MCP-191",
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
  packet_id: "FP-MCP-191",
  result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED"
    ? "FP_MCP_191_CONTRACT_ALIGNMENT_RECORDED_THROUGH_V1O_PATH"
    : "FP_MCP_191_V1O_NOT_PROVEN",
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
fs.writeFileSync("runs/FP-MCP-191/v1o-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
