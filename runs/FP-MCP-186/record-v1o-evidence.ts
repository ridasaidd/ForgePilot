import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetPath = "packets/FP-MCP-186.md";
const runId = "FP-MCP-186-VALIDATE-PREFLIGHT-DISABLED-REASON-NORMALIZATION-LIVE-CONFIRMED";
const admittedClaim = "VALIDATE_EXECUTION_PREFLIGHT_DISABLED_REASON_NORMALIZATION_LIVE_CONFIRMED_NO_LEGACY_EXECUTION_DISABLED";
const artifacts = [
  packetPath,
  "runs/FP-MCP-186/expected-live-confirmation.json",
  "runs/FP-MCP-186/disable-switch-status.json",
  "runs/FP-MCP-186/live-preflight-observation.json",
  "runs/FP-MCP-186/result-summary.md",
  "runs/FP-MCP-186/verification.txt",
  "runs/FP-MCP-182/opencode-requests/REQ-20260702T210007524Z-4ba16774.json"
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
    title: "FP-MCP-186",
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
    model_role: "validate_execution_preflight_disabled_reason_normalization_post_refresh_live_confirmation",
    branch: "main",
    commit_sha: "784e274",
    executor_result: admittedClaim,
    verification_result: "REPOS_VERIFIED_CORE_784E274_BRIDGE_9E01C73;CANONICAL_LEDGER_PRECHECK_55_EVIDENCE_55_GENERIC_EVENTS;DIRECT_DISABLE_SWITCH_STATUS_PRECISE_REASONS_PRESENT_LEGACY_AGGREGATE_ABSENT;LIVE_VALIDATE_EXECUTION_PREFLIGHT_PRECISE_REASONS_PRESENT;LIVE_VALIDATE_EXECUTION_PREFLIGHT_LEGACY_EXECUTION_DISABLED_ABSENT;LIVE_CONFIRMATION_PROVEN_AFTER_SERVICE_REFRESH;EXECUTION_PERMITTED_FALSE;EXECUTION_STARTED_FALSE;START_ENDPOINT_CONTACTED_FALSE;OPENCODE_STARTED_FALSE;APPROVAL_CONSUMED_FALSE;FPMCP183_ENABLEMENT_NOT_AUTHORIZED;FRESH_TUPLE_NOT_CREATED;FP027_CANARY_NOT_RUN",
    audit_result: "NOT_APPLICABLE_POST_REFRESH_RUNTIME_CONFIRMATION",
    comparison_result: "NOT_APPLICABLE_POST_REFRESH_RUNTIME_CONFIRMATION",
    metrics_path: "runs/FP-MCP-186/live-preflight-observation.json",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED"
  });
}

const basis = "FP-MCP-186 admits validate_execution_preflight disabled-reason normalization post-refresh live confirmation";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({
    target_observation_type: "evidence_record",
    target_observation_id: evidence.evidence_id,
    admission_decision: "ADMITTED",
    admission_actor_type: "system",
    admission_actor_id: "FP-MCP-186",
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
  packet_id: "FP-MCP-186",
  result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED"
    ? "FP_MCP_186_POST_REFRESH_LIVE_CONFIRMATION_RECORDED_THROUGH_V1O_PATH"
    : "FP_MCP_186_V1O_NOT_PROVEN",
  evidence_id: evidence.evidence_id,
  run_id: evidence.run_id,
  generic_admission_event_id: admission.id,
  canonical_status: canonical.status,
  canonical_surface: canonical.canonical_surface,
  canonical_state: canonical.canonical_state,
  admitted_claim: admittedClaim,
  preceding_stale_runtime_evidence_id: 55,
  total_evidence_records: totalEvidenceRecords,
  total_generic_evidence_record_admission_events: totalGenericAdmissionEvents,
  artifact_paths: artifacts
};
fs.writeFileSync("runs/FP-MCP-186/v1o-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
