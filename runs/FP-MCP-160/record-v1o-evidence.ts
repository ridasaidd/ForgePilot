import fs from "node:fs";
import crypto from "node:crypto";
import { initDb, getDb, closeDb } from "../../src/db/client.js";
import { recordPacketIntent } from "../../src/db/persistence.js";
import { insertEvidenceRecord, getEvidenceByRunId } from "../../src/db/evidence-records.js";
import { recordEvidenceAdmission, getAdmissionEvents } from "../../src/db/evidence.js";
import { getCanonicalEvidenceRecordAdmission } from "../../src/db/validation-admission.js";

const packetPath = "packets/FP-MCP-160.md";
const runId = "FP-MCP-160-STRUCTURED-APPROVAL-UX-DRY-RUN";
const artifacts = [
  "packets/FP-MCP-160.md",
  "runs/FP-MCP-160/result-summary.md",
  "runs/FP-MCP-160/approvals/APPROVAL-20260702T150302133Z-0011e6f4.json",
  "runs/FP-MCP-160/structured-approval-ux-test-result.md",
  "runs/FP-MCP-160/structured-approval-ux-test-result.json"
];
function sha256File(path: string): string { return crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex"); }
initDb("data/forgepilot.db");
const db = getDb();
let packet = db.prepare("SELECT * FROM packets WHERE packet_path = ? ORDER BY id ASC LIMIT 1").get(packetPath) as { id: number } | undefined;
if (!packet) packet = recordPacketIntent({ packet_type: "fp-mcp", title: "FP-MCP-160", packet_path: packetPath, packet_hash: sha256File(packetPath) });
let evidence = getEvidenceByRunId(runId)[0];
if (!evidence) {
  evidence = insertEvidenceRecord({
    packet_id: packet.id,
    run_id: runId,
    model_id: "none",
    model_role: "ux_dry_run_test",
    branch: "main",
    commit_sha: "f056877",
    executor_result: "STRUCTURED_APPROVAL_POPUP_PATTERN_SAFE_BUT_EXISTING_FIXTURE_NOT_MIGRATION_READY",
    verification_result: "DRY_RUN_FIXTURE_CREATED;NOT_USABLE_FOR_EXECUTION;SCOPE_HARDCODED_TO_FPMCP036;NO_EXECUTION_ENABLED",
    audit_result: "NOT_APPLICABLE_UX_DRY_RUN",
    comparison_result: "NOT_APPLICABLE_UX_DRY_RUN",
    metrics_path: "runs/FP-MCP-160/structured-approval-ux-test-result.json",
    artifact_paths: artifacts,
    trust_tier: "TIER_2_VERIFIED_ARTIFACT",
    validation_state: "VALID",
    admission_state: "ADMITTED",
  });
}
const basis = "FP-MCP-160 admits structured approval UX dry-run result and fixture limitation";
let admission = getAdmissionEvents("evidence_record", evidence.evidence_id).find((event) => event.admission_basis === basis);
if (!admission) {
  admission = recordEvidenceAdmission({ target_observation_type: "evidence_record", target_observation_id: evidence.evidence_id, admission_decision: "ADMITTED", admission_actor_type: "system", admission_actor_id: "FP-MCP-160", admission_trust_tier: "TIER_2", validation_state: "VALID", provenance_complete: true, admission_basis: basis });
}
const canonical = getCanonicalEvidenceRecordAdmission(evidence.evidence_id);
const output = { packet_id: "FP-MCP-160", result: canonical.status === "GENERIC_EVENT_CANONICAL" && canonical.canonical_state === "ADMITTED" ? "FP_MCP_160_STRUCTURED_APPROVAL_UX_TEST_RECORDED_THROUGH_V1O_PATH" : "FP_MCP_160_STRUCTURED_APPROVAL_UX_TEST_V1O_NOT_PROVEN", evidence_id: evidence.evidence_id, run_id: evidence.run_id, generic_admission_event_id: admission.id, canonical_status: canonical.status, canonical_surface: canonical.canonical_surface, canonical_state: canonical.canonical_state, admitted_claim: "STRUCTURED_APPROVAL_POPUP_PATTERN_SAFE_BUT_EXISTING_FIXTURE_NOT_MIGRATION_READY", artifact_paths: artifacts };
fs.writeFileSync("runs/FP-MCP-160/v1o-evidence-recording-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
closeDb();
