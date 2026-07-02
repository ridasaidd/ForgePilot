import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";
const packetPath = "packets/FP-MCP-180.md";
const runId = "FP-MCP-180-RUNNER-CAPABILITY-PREDICATE-IMPLEMENTATION";
const artifacts = [
  packetPath,
  "runs/FP-MCP-180/result-summary.md",
  "runs/FP-MCP-180/predicate-normalization-decision.json",
  "runs/FP-MCP-180/implementation-result.json",
  "runs/FP-MCP-180/false-open-audit.md"
];
function sha256File(path: string): string { return crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex"); }
initDb("data/forgepilot.db");
const db = getDb();
let packet = db.prepare("SELECT * FROM packets WHERE packet_path = ? ORDER BY id ASC LIMIT 1").get(packetPath) as { id: number } | undefined;
if (!packet) packet = recordPacketIntent({ packet_type: "fp-mcp", title: "FP-MCP-180", packet_path: packetPath, packet_hash: sha256File(packetPath) });
let evidence = getEvidenceByRunId(runId)[0];
if (!evidence) evidence = insertEvidenceRecord({
  packet_id: packet.id,
  run_id: runId,
  model_id: "none",
  model_role: "runner_capability_predicate_source_implementation",
  branch: "feature/oauth-auth0",
  commit_sha: "d3471d4",
  executor_result: "RUNNER_CAPABILITY_PREDICATE_NORMALIZED_SOURCE_VERIFIED_FAIL_CLOSED_BOUNDARY_PRESERVED",
  verification_result: "BRIDGE_PNPM_TEST_PASS;BRIDGE_PNPM_BUILD_PASS;TSC_PASS;CALLABLE_GUARDED_ACCEPTED;START_RUN_ACCEPTED_AS_GUARDED_OPERATION;EXECUTE_AND_EXECUTION_REMAIN_UNEXPECTED;EXECUTION_ENABLED_FALSE_REQUIRED;FALSE_OPEN_AUDIT_PASSED;HARD_FALSE_OUTPUTS_PRESERVED;ACTION_REFRESH_PENDING",
  audit_result: "NOT_APPLICABLE_SOURCE_IMPLEMENTATION",
  comparison_result: "NOT_APPLICABLE_SOURCE_IMPLEMENTATION",
  metrics_path: "runs/FP-MCP-180/implementation-result.json",
  artifact_paths: artifacts,
  trust_tier: "TIER_2_VERIFIED_ARTIFACT",
  validation_state: "VALID",
  admission_state: "ADMITTED",
});
const basis = "FP-MCP-180 admits guarded runner capability predicate source implementation";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) admission = recordEvidenceAdmission({
  target_observation_type: "evidence_record",
  target_observation_id: evidence.evidence_id,
  admission_decision: "ADMITTED",
  admission_actor_type: "system",
  admission_actor_id: "FP-MCP-180",
  admission_trust_tier: "TIER_2",
  validation_state: "VALID",
  provenance_complete: true,
  admission_basis: basis,
});
const canonical = getCanonicalEvidenceRecordAdmission(evidence.evidence_id);
const totalEvidenceRecords = (db.prepare("SELECT count(*) AS count FROM evidence_records").get() as { count: number }).count;
const totalGenericAdmissionEvents = (db.prepare("SELECT count(*) AS count FROM evidence_admission_events WHERE target_observation_type = 'evidence_record'").get() as { count: number }).count;
const output = {
  packet_id: "FP-MCP-180",
  result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED" ? "FP_MCP_180_RUNNER_CAPABILITY_IMPLEMENTATION_RECORDED_THROUGH_V1O_PATH" : "FP_MCP_180_V1O_NOT_PROVEN",
  evidence_id: evidence.evidence_id,
  run_id: evidence.run_id,
  generic_admission_event_id: admission.id,
  canonical_status: canonical.status,
  canonical_surface: canonical.canonical_surface,
  canonical_state: canonical.canonical_state,
  admitted_claim: "RUNNER_CAPABILITY_PREDICATE_NORMALIZED_SOURCE_VERIFIED_FAIL_CLOSED_BOUNDARY_PRESERVED",
  bridge_commit: "d3471d4",
  total_evidence_records: totalEvidenceRecords,
  total_generic_evidence_record_admission_events: totalGenericAdmissionEvents,
  artifact_paths: artifacts
};
fs.writeFileSync("runs/FP-MCP-180/v1o-implementation-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
