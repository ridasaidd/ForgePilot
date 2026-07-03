import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const runId = "FP-MCP-192-NON-EXECUTING-REQUEST-ARTIFACT-TOOL-LIVE-CONFIRMED";
const admittedClaim = "FP_MCP_192_NON_EXECUTING_REQUEST_ARTIFACT_TOOL_SURFACE_LIVE_CONFIRMED_NO_EXECUTION";
const requestArtifactPath = "runs/FP-MCP-192/opencode-requests/REQ-20260703T080123132Z-67da4239.json";
const artifacts = [
  "packets/FP-MCP-192.md",
  "runs/FP-MCP-192/expected-live-confirmation.json",
  "runs/FP-MCP-192/attempt-1-dirty-tree.json",
  "runs/FP-MCP-192/attempt-2-live-confirmed.json",
  "runs/FP-MCP-192/readback-request-artifact-summary.json",
  "runs/FP-MCP-192/verification.txt",
  requestArtifactPath
];

initDb("data/forgepilot.db");
const db = getDb();
let packet = db.prepare("SELECT * FROM packets WHERE packet_path = ? ORDER BY id ASC LIMIT 1").get("packets/FP-MCP-192.md") as { id: number } | undefined;
if (!packet) {
  const packetPath = "packets/FP-MCP-192.md";
  const packetHash = crypto.createHash("sha256").update(fs.readFileSync(packetPath)).digest("hex");
  packet = recordPacketIntent({
    packet_type: "fp-mcp",
    title: "FP-MCP-192",
    packet_path: packetPath,
    packet_hash: packetHash
  });
}

let evidence = getEvidenceByRunId(runId)[0];
if (!evidence) {
  evidence = insertEvidenceRecord({
    packet_id: packet.id,
    run_id: runId,
    model_id: "none",
    model_role: "non_executing_request_artifact_tool_surface_live_confirmation",
    branch: "main",
    commit_sha: "a802fda",
    executor_result: admittedClaim,
    verification_result: "NEW_ALIAS_EXPOSED;ATTEMPT1_DIRTY_TREE_FAILED_CLOSED;ATTEMPT2_CREATED_TRUE_VALID_TRUE;REQUEST_ID_REQ_20260703T080123132Z_67DA4239;CREATED_BY_TOOL_FORGEPILOT_RECORD_NON_EXECUTING_RUN_REQUEST_ARTIFACT;ARTIFACT_RECORDING_CONFIRMATION_RECORDED;EXECUTION_ENABLED_FALSE;EXECUTION_STARTED_FALSE;EXECUTION_AUTHORIZED_FALSE;RUNNER_START_ENDPOINT_CONTACTED_FALSE;OPENCODE_STARTED_FALSE;APPROVAL_CONSUMED_FALSE;ARTIFACT_ONLY_TRUE;REQUEST_ARTIFACT_ONLY_TRUE;REQUEST_STATE_CREATED_NOT_STARTED;FPMCP183_USED_FALSE;APPROVAL_CREATED_FALSE;FP027_CANARY_RUN_FALSE",
    audit_result: "NOT_APPLICABLE_LIVE_TOOL_SURFACE_CONFIRMATION",
    comparison_result: "NOT_APPLICABLE_LIVE_TOOL_SURFACE_CONFIRMATION",
    metrics_path: "runs/FP-MCP-192/attempt-2-live-confirmed.json",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED"
  });
}

const basis = "FP-MCP-192 admits non-executing request artifact tool surface live confirmation";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({
    target_observation_type: "evidence_record",
    target_observation_id: evidence.evidence_id,
    admission_decision: "ADMITTED",
    admission_actor_type: "system",
    admission_actor_id: "FP-MCP-192",
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
  packet_id: "FP-MCP-192",
  result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED"
    ? "FP_MCP_192_LIVE_CONFIRMATION_RECORDED_THROUGH_V1O_PATH"
    : "FP_MCP_192_V1O_NOT_PROVEN",
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
fs.writeFileSync("runs/FP-MCP-192/v1o-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
