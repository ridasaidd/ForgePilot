import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetPath = "packets/FP-MCP-184.md";
const runId = "FP-MCP-184-VALIDATE-PREFLIGHT-DISABLED-REASON-PROVENANCE";
const artifacts = [
  packetPath,
  "runs/FP-MCP-184/result-summary.md",
  "runs/FP-MCP-184/source-provenance.json",
  "runs/FP-MCP-184/verification.txt"
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
    title: "FP-MCP-184",
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
    model_role: "validate_execution_preflight_reason_provenance_source_normalization",
    branch: "feature/oauth-auth0",
    commit_sha: "9e01c73",
    executor_result: "VALIDATE_EXECUTION_PREFLIGHT_DISABLED_REASON_PROVENANCE_NORMALIZED_SOURCE_VERIFIED_ENABLEMENT_STILL_NOT_AUTHORIZED",
    verification_result: "SOURCE_INSPECTION_CONFIRMED_VALIDATE_PREFLIGHT_CALLS_DISABLE_SWITCH_STATUS;SOURCE_INSPECTION_CONFIRMED_LEGACY_EXECUTION_DISABLED_WAS_SEPARATELY_SYNTHESIZED_FROM_RUNNER_OR_OPENCODE_DISABLED;SOURCE_NORMALIZED_TO_RUNNER_EXECUTION_DISABLED_AND_OPENCODE_EXECUTION_DISABLED;BRIDGE_PNPM_BUILD_PASS;RUNNER_CONTACT_FALSE;OPENCODE_STARTED_FALSE;APPROVAL_CONSUMED_FALSE;ENABLEMENT_AUTHORIZED_FALSE;LIVE_RUNTIME_CONFIRMATION_PENDING_SERVICE_REFRESH",
    audit_result: "NOT_APPLICABLE_SOURCE_PROVENANCE_NORMALIZATION",
    comparison_result: "NOT_APPLICABLE_SOURCE_PROVENANCE_NORMALIZATION",
    metrics_path: "runs/FP-MCP-184/source-provenance.json",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED"
  });
}

const basis = "FP-MCP-184 admits validate_execution_preflight disabled-reason provenance source normalization";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({
    target_observation_type: "evidence_record",
    target_observation_id: evidence.evidence_id,
    admission_decision: "ADMITTED",
    admission_actor_type: "system",
    admission_actor_id: "FP-MCP-184",
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
  packet_id: "FP-MCP-184",
  result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED"
    ? "FP_MCP_184_DISABLED_REASON_PROVENANCE_RECORDED_THROUGH_V1O_PATH"
    : "FP_MCP_184_V1O_NOT_PROVEN",
  evidence_id: evidence.evidence_id,
  run_id: evidence.run_id,
  generic_admission_event_id: admission.id,
  canonical_status: canonical.status,
  canonical_surface: canonical.canonical_surface,
  canonical_state: canonical.canonical_state,
  admitted_claim: "VALIDATE_EXECUTION_PREFLIGHT_DISABLED_REASON_PROVENANCE_NORMALIZED_SOURCE_VERIFIED_ENABLEMENT_STILL_NOT_AUTHORIZED",
  bridge_commit: "9e01c73",
  total_evidence_records: totalEvidenceRecords,
  total_generic_evidence_record_admission_events: totalGenericAdmissionEvents,
  artifact_paths: artifacts
};
fs.writeFileSync("runs/FP-MCP-184/v1o-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
