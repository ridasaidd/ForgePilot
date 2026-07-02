import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetPath = "packets/FP-MCP-164.md";
const runId = "FP-MCP-164-SCOPED-EXECUTION-ENABLEMENT-BOUNDARY-CONTRACT";
const artifacts = [
  "packets/FP-MCP-164.md",
  "runs/FP-MCP-164/result-summary.md",
  "runs/FP-MCP-164/boundary-contract.json"
];
function sha256File(path: string): string { return crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex"); }
initDb("data/forgepilot.db");
const db = getDb();
let packet = db.prepare("SELECT * FROM packets WHERE packet_path = ? ORDER BY id ASC LIMIT 1").get(packetPath) as { id: number } | undefined;
if (!packet) packet = recordPacketIntent({ packet_type: "fp-mcp", title: "FP-MCP-164", packet_path: packetPath, packet_hash: sha256File(packetPath) });
let evidence = getEvidenceByRunId(runId)[0];
if (!evidence) {
  evidence = insertEvidenceRecord({
    packet_id: packet.id,
    run_id: runId,
    model_id: "none",
    model_role: "boundary_contract_definition",
    branch: "main",
    commit_sha: "8643902",
    executor_result: "SCOPED_EXECUTION_ENABLEMENT_BOUNDARY_CONTRACT_DEFINED",
    verification_result: "CONTRACT_ARTIFACTS_PRESENT;BOUNDARY_JSON_VALID;NO_EXECUTION_ENABLED;NO_APPROVAL_CONSUMED;NO_RUNNER_START_CONTACT;NO_OPENCODE_START",
    audit_result: "NOT_APPLICABLE_BOUNDARY_CONTRACT",
    comparison_result: "NOT_APPLICABLE_BOUNDARY_CONTRACT",
    metrics_path: "runs/FP-MCP-164/boundary-contract.json",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED",
  });
}
const basis = "FP-MCP-164 admits scoped execution enablement boundary contract";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({ target_observation_type: "evidence_record", target_observation_id: evidence.evidence_id, admission_decision: "ADMITTED", admission_actor_type: "system", admission_actor_id: "FP-MCP-164", admission_trust_tier: "TIER_2", validation_state: "VALID", provenance_complete: true, admission_basis: basis });
}
const canonical = getCanonicalEvidenceRecordAdmission(evidence.evidence_id);
const totalEvidenceRecords = (db.prepare("SELECT count(*) AS count FROM evidence_records").get() as { count: number }).count;
const totalGenericAdmissionEvents = (db.prepare("SELECT count(*) AS count FROM evidence_admission_events WHERE target_observation_type = 'evidence_record'").get() as { count: number }).count;
const output = {
  packet_id: "FP-MCP-164",
  result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED" ? "FP_MCP_164_SCOPED_EXECUTION_ENABLEMENT_BOUNDARY_RECORDED_THROUGH_V1O_PATH" : "FP_MCP_164_V1O_NOT_PROVEN",
  evidence_id: evidence.evidence_id,
  run_id: evidence.run_id,
  generic_admission_event_id: admission.id,
  canonical_status: canonical.status,
  canonical_surface: canonical.canonical_surface,
  canonical_state: canonical.canonical_state,
  admitted_claim: "SCOPED_EXECUTION_ENABLEMENT_BOUNDARY_CONTRACT_DEFINED",
  total_evidence_records: totalEvidenceRecords,
  total_generic_evidence_record_admission_events: totalGenericAdmissionEvents,
  artifact_paths: artifacts
};
fs.writeFileSync("runs/FP-MCP-164/v1o-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
