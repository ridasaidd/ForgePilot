import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetPath = "packets/FP-MCP-195.md";
const runId = "FP-MCP-195-CONSERVATIVE-MCP-INVOCATION-CADENCE-POLICY";
const admittedClaim = "FP_MCP_195_CONSERVATIVE_MCP_INVOCATION_CADENCE_POLICY_RECORDED";
const artifacts = [
  packetPath,
  "docs/operations/platform-tool-block-pattern.md",
  "runs/FP-MCP-195/cadence-policy.json",
  "runs/FP-MCP-195/result-summary.md",
  "runs/FP-MCP-195/verification.txt"
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
    title: "FP-MCP-195",
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
    model_role: "conservative_mcp_invocation_cadence_policy",
    branch: "main",
    commit_sha: "325c062",
    executor_result: admittedClaim,
    verification_result: "CADENCE_FALSE_POSITIVE_RISK_HYPOTHESIS_RECORDED;ONE_TOOL_CALL_AT_A_TIME;ONE_LOGICAL_OPERATION_PER_TERMINAL_INVOCATION;AVOID_COMMAND_CHAINING_WHEN_SINGLE_PURPOSE_SUFFICIENT;AVOID_RAPID_BACK_TO_BACK_ENABLEMENT_ADJACENT_CALLS;INSERT_OPERATOR_VISIBLE_PAUSE_WHEN_PRACTICAL;PLATFORM_BLOCKS_REMAIN_OBSERVATIONS;DO_NOT_REPHRASE_TO_GET_PAST_PLATFORM_BLOCKS;OPENAI_TRIGGER_UNRESOLVED;FPMCP187_NOT_DOWNGRADED;FPMCP194_EQUIVALENCE_RULE_NOT_RELAXED;REQUEST_ARTIFACT_CREATED_FALSE;APPROVAL_CREATED_FALSE;APPROVAL_CONSUMED_FALSE;RUNNER_START_ENDPOINT_CONTACTED_FALSE;OPENCODE_STARTED_FALSE;FP027_CANARY_RUN_FALSE;FPMCP183_ENABLEMENT_REMAINS_UNGRANTED",
    audit_result: "NOT_APPLICABLE_OPERATIONAL_POLICY",
    comparison_result: "NOT_APPLICABLE_OPERATIONAL_POLICY",
    metrics_path: "runs/FP-MCP-195/cadence-policy.json",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED"
  });
}

const basis = "FP-MCP-195 admits conservative MCP invocation cadence policy";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({
    target_observation_type: "evidence_record",
    target_observation_id: evidence.evidence_id,
    admission_decision: "ADMITTED",
    admission_actor_type: "system",
    admission_actor_id: "FP-MCP-195",
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
  packet_id: "FP-MCP-195",
  result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED"
    ? "FP_MCP_195_CADENCE_POLICY_RECORDED_THROUGH_V1O_PATH"
    : "FP_MCP_195_V1O_NOT_PROVEN",
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
fs.writeFileSync("runs/FP-MCP-195/v1o-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
