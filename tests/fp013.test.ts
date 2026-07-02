import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  buildPacketReport,
  formatPacketReportText,
  REPORT_OBSERVATION_BOUNDARY,
} from "../src/reporting/packet-report.js";

let testDir: string;

before(() => {
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), "forgepilot-fp013-"));
});

after(() => {
  fs.rmSync(testDir, { recursive: true, force: true });
});

function writeFile(rel: string, content: string) {
  const full = path.join(testDir, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf-8");
}

describe("FP-013: Packet report summary view", () => {
  it("builds a report from packet and run artifacts", () => {
    writeFile("packets/FP-TEST.md", "# FP-TEST — Example Packet\n\nTask body.\n");
    writeFile("runs/FP-TEST/verification.txt", "PASS\n");
    writeFile("runs/FP-TEST/direct-mcp-query-result.md", "PASS\n");
    writeFile("runs/FP-TEST/metrics.json", "{}\n");
    writeFile("runs/FP-TEST/terminal-commands/ignored-result.json", "{}\n");

    const report = buildPacketReport({ rootDir: testDir, packetId: "FP-TEST" });

    assert.equal(report.packet_id, "FP-TEST");
    assert.equal(report.packet_path, "packets/FP-TEST.md");
    assert.equal(report.packet_exists, true);
    assert.equal(report.packet_title, "FP-TEST — Example Packet");
    assert.ok(report.labels.includes("INTENT_RECORDED"));
    assert.ok(report.labels.includes("RUN_ARTIFACTS_PRESENT"));
    assert.ok(report.labels.includes("VERIFICATION_ARTIFACT_PRESENT"));
    assert.ok(report.labels.includes("OPERATIONAL_PROOF_ARTIFACT_PRESENT"));
    assert.equal(report.artifact_counts.total, 3);
    assert.equal(report.artifact_counts.verification, 1);
    assert.equal(report.artifact_counts.operational_proof, 1);
    assert.equal(report.artifact_counts.telemetry_or_metrics, 1);
    assert.equal(report.evidence_boundary, REPORT_OBSERVATION_BOUNDARY);
    assert.ok(report.artifacts.every((a) => !a.path.includes("terminal-commands")));
  });

  it("includes worker telemetry only as non-admitted observations", () => {
    writeFile("packets/FP-WORKER.md", "# FP-WORKER\n");

    const report = buildPacketReport({
      rootDir: testDir,
      packetId: "FP-WORKER",
      workerTelemetryQuery: () => ({
        rows: [
          {
            worker_status: "SUCCEEDED",
            terminal_state: "TERMINAL_SUCCEEDED",
            validation_state: "VALID",
            admission_state: "NOT_EVALUATED",
          },
        ],
      }),
    });

    assert.equal(report.worker_telemetry.available, true);
    assert.equal(report.worker_telemetry.count, 1);
    assert.deepEqual(report.worker_telemetry.admission_states, ["NOT_EVALUATED"]);
    assert.ok(report.labels.includes("OBSERVED_NOT_ADMITTED"));
    assert.equal(report.worker_telemetry.observation_boundary, REPORT_OBSERVATION_BOUNDARY);
    assert.ok(report.caveats.includes(REPORT_OBSERVATION_BOUNDARY));
  });

  it("throws clearly for a missing packet", () => {
    assert.throws(
      () => buildPacketReport({ rootDir: testDir, packetId: "FP-MISSING" }),
      /packet not found: packets\/FP-MISSING.md/
    );
  });

  it("rejects unsafe packet ids", () => {
    assert.throws(
      () => buildPacketReport({ rootDir: testDir, packetId: "../FP-TEST" }),
      /invalid packetId/
    );
  });

  it("formats text output with caveats and artifact paths", () => {
    writeFile("packets/FP-TEXT.md", "# FP-TEXT — Text Report\n");
    writeFile("runs/FP-TEXT/verification.txt", "PASS\n");

    const report = buildPacketReport({ rootDir: testDir, packetId: "FP-TEXT" });
    const text = formatPacketReportText(report);

    assert.match(text, /Packet Report: FP-TEXT/);
    assert.match(text, /Evidence Boundary: Observation only/);
    assert.match(text, /runs\/FP-TEXT\/verification.txt \[verification\]/);
  });
});
