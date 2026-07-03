import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetPath = "packets/FP-MCP-194.md";
const runId = "FP-MCP-194-ALIAS-EQUIVALENCE-SAFETY-BLOCK-RECONCILIATION";
const admittedClaim = "FP_MCP_194_ALIAS_EQUIVALENCE_RECONCILED_STANDING_RULE_RECORDED_SAFETY_TRIGGER_UNRESOLVED";
const artifacts = [
  packetPath,
  "docs/operations/platform-tool-block-pattern.md",
  "runs/FP-MCP-194/evidence-id-reconciliation.json",
  "runs/FP-MCP-194/alias-equivalence-analysis.json",
  "runs/FP-MCP-194/result-summary.md",
  "runs/FP-MCP-194/verification.txt"
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
    title: "FP-MCP-194",
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
    model_role: "alias_equivalence_safety_block_reconciliation",
    branch: "main",
    commit_sha: "1137fc7",
    executor_result: admittedClaim,
    verification_result: "EVIDENCE_IDS_59_63_RECONCILED;NARRATION_GAP_RECONCILED;ALIAS_PRESUMED_EQUIVALENT_REQUEST_CREATION_CAPABILITY;SAME_UNDERLYING_IMPLEMENTATION_PATH_TRUE;REQUEST_ARTIFACT_CAN_FEED_LATER_EXECUTION_TRUE;STRUCTURALLY_INCAPABLE_OF_FEEDING_EXECUTION_FALSE;FP_MCP_192_DOES_NOT_RESOLVE_FP_MCP_187;OPENAI_SAFETY_TRIGGER_UNRESOLVED;FP_MCP_193_DOWNSTREAM_GUIDANCE_NOT_SAFETY_RESOLUTION;STANDING_EQUIVALENT_CAPABILITY_RULE_RECORDED;REQUEST_ARTIFACT_CREATED_FALSE;ALIAS_LIVE_TESTED_FALSE;APPROVAL_CREATED_FALSE;APPROVAL_CONSUMED_FALSE;RUNNER_START_ENDPOINT_CONTACTED_FALSE;OPENCODE_STARTED_FALSE;FP027_CANARY_RUN_FALSE;FPMCP183_ENABLEMENT_REMAINS_UNGRANTED",
    audit_result: "NOT_APPLICABLE_GOVERNANCE_RECONCILIATION",
    comparison_result: "NOT_APPLICABLE_GOVERNANCE_RECONCILIATION",
    metrics_path: "runs/FP-MCP-194/alias-equivalence-analysis.json",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED"
  });
}

const basis = "FP-MCP-194 admits alias equivalence and safety-block reconciliation";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({
    target_observation_type: "evidence_record",
    target_observation_id: evidence.evidence_id,
    admission_decision: "ADMITTED",
    admission_actor_type: "system",
    admission_actor_id: "FP-MCP-194",
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
  packet_id: "FP-MCP-194",
  result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED"
    ? "FP_MCP_194_RECONCILIATION_RECORDED_THROUGH_V1O_PATH"
    : "FP_MCP_194_V1O_NOT_PROVEN",
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
fs.writeFileSync("runs/FP-MCP-194/v1o-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
