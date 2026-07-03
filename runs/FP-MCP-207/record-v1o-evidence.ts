import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetPath = "packets/FP-MCP-207.md";
const runId = "FP-MCP-207-RUNTIME-DIAGNOSTICS-GATE-ORIENTATION-TOOLS";
const admittedClaim = "FP_MCP_207_RUNTIME_DIAGNOSTICS_AND_GATE_ORIENTATION_TOOLS_IMPLEMENTED";
const artifacts = [
  packetPath,
  "runs/FP-MCP-207/implementation-result.json",
  "runs/FP-MCP-207/result-summary.md",
  "runs/FP-MCP-207/verification.txt"
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
    title: "FP-MCP-207",
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
    model_role: "platform_trigger_wait_or_proceed_decision",
    branch: "main",
    commit_sha: "efe3d0b",
    executor_result: admittedClaim,
    verification_result: "PROCEED_DECISION_RECORDED;OPENAI_SUPPORT_TICKET_REQUIRED_FALSE;WAIT_FOR_OPENAI_RESPONSE_FALSE;OPERATOR_OBSERVATION_ACCEPTED_AS_LOCAL_GUIDANCE_TRUE;EXTERNAL_AI_SEARCH_RESPONSE_CORROBORATION_TRUE;EXTERNAL_AI_SEARCH_RESPONSE_AUTHORITATIVE_FALSE;OPENAI_INTERNAL_CLASSIFIER_CAUSE_CONFIRMED_FALSE;RESIDUAL_RISK_ACKNOWLEDGED;FPMCP183_MAY_BE_CONSIDERED_NEXT_ONLY_AS_FRESH_EXPLICIT_ENABLEMENT_DECISION;REPORT_SUBMITTED_FALSE;BLOCKED_CALL_RETRIED_FALSE;REQUEST_ARTIFACT_CREATED_FALSE;APPROVAL_CREATED_FALSE;APPROVAL_CONSUMED_FALSE;RUNNER_START_ENDPOINT_CONTACTED_FALSE;OPENCODE_STARTED_FALSE;FP027_CANARY_RUN_FALSE;FPMCP183_AUTHORIZED_FALSE",
    audit_result: "NOT_APPLICABLE_DECISION_RECORD",
    comparison_result: "NOT_APPLICABLE_DECISION_RECORD",
    metrics_path: "runs/FP-MCP-207/implementation-result.json",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED"
  });
}

const basis = "FP-MCP-207 admits runtime diagnostics and gate orientation tools implementation";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({
    target_observation_type: "evidence_record",
    target_observation_id: evidence.evidence_id,
    admission_decision: "ADMITTED",
    admission_actor_type: "system",
    admission_actor_id: "FP-MCP-197",
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
  packet_id: "FP-MCP-207",
  result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED"
    ? "FP_MCP_207_IMPLEMENTATION_RECORDED_THROUGH_V1O_PATH"
    : "FP_MCP_207_V1O_NOT_PROVEN",
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
fs.writeFileSync("runs/FP-MCP-207/v1o-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
