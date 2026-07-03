import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetPath = "packets/FP-MCP-193.md";
const runId = "FP-MCP-193-SOURCE-BACKED-MCP-SERVER-DESIGN-GUIDANCE";
const admittedClaim = "FP_MCP_193_SOURCE_BACKED_MCP_SERVER_DESIGN_GUIDANCE_RECORDED";
const artifacts = [
  packetPath,
  "docs/operations/mcp-server-design-guidance.md",
  "runs/FP-MCP-193/source-review.json",
  "runs/FP-MCP-193/result-summary.md",
  "runs/FP-MCP-193/verification.txt"
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
    title: "FP-MCP-193",
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
    model_role: "source_backed_mcp_server_design_guidance",
    branch: "main",
    commit_sha: "53a5c40",
    executor_result: admittedClaim,
    verification_result: "OPENAI_APPS_SDK_REFERENCE_REVIEWED;OPENAI_SECURITY_PRIVACY_REVIEWED;OPENAI_MCP_CONNECTORS_GUIDE_REVIEWED;MCP_TOOLS_SPEC_REVIEWED;MCP_RESOURCES_SPEC_REVIEWED;MCP_PROMPTS_SPEC_REVIEWED;MCP_REFERENCE_SERVERS_REVIEWED;TERMINAL_SECONDARY_GUIDANCE_RECORDED;RESOURCES_FOR_READ_CONTEXT;PROMPTS_FOR_USER_WORKFLOWS;TOOLS_FOR_TYPED_OPERATIONS;TRUTHFUL_ANNOTATIONS_REQUIRED;SERVER_SIDE_AUTHORIZATION_REQUIRED;NO_EXECUTION_ENABLEMENT;FPMCP183_REQUEST_CREATED_FALSE;APPROVAL_CREATED_FALSE;APPROVAL_CONSUMED_FALSE;RUNNER_START_ENDPOINT_CONTACTED_FALSE;OPENCODE_STARTED_FALSE;FP027_CANARY_RUN_FALSE",
    audit_result: "NOT_APPLICABLE_SOURCE_BACKED_DESIGN_GUIDANCE",
    comparison_result: "NOT_APPLICABLE_SOURCE_BACKED_DESIGN_GUIDANCE",
    metrics_path: "runs/FP-MCP-193/source-review.json",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED"
  });
}

const basis = "FP-MCP-193 admits source-backed MCP server design guidance";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({
    target_observation_type: "evidence_record",
    target_observation_id: evidence.evidence_id,
    admission_decision: "ADMITTED",
    admission_actor_type: "system",
    admission_actor_id: "FP-MCP-193",
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
  packet_id: "FP-MCP-193",
  result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED"
    ? "FP_MCP_193_SOURCE_GUIDANCE_RECORDED_THROUGH_V1O_PATH"
    : "FP_MCP_193_V1O_NOT_PROVEN",
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
fs.writeFileSync("runs/FP-MCP-193/v1o-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
